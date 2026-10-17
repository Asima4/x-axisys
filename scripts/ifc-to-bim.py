"""
Convert a Revit MEP IFC into the website's live BIM viewer format.

    python scripts/ifc-to-bim.py "<model.ifc>" public/models/bim/<id>

Writes:
  geo.bin.gz – gzipped per-layer geometry: quantized positions (uint16), octahedral normals (int8),
              element index per vertex (uint16), triangle indices (uint32)
  meta.json – layers, element table (family, type, system, level, size, length), schedules

Identifying project metadata (project/client names, addresses, authors) is not copied.
"""
import sys, re, json, math, struct, pathlib, collections, multiprocessing
import numpy as np
import ifcopenshell, ifcopenshell.geom, ifcopenshell.util.element as U
import fast_simplification as fs

src, out = sys.argv[1], pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
f = ifcopenshell.open(src)

# ---------- classification ----------
LAYERS = [
    # id, label, colour
    ('equipment', 'Plant equipment', '#9aa6b2'),
    ('chw', 'Chilled water', '#2f8fe0'),
    ('cw', 'Condenser water', '#2fb47a'),
    ('hw', 'Hot water', '#e0503f'),
    ('dom', 'Domestic, soft & make-up water', '#56c6e8'),
    ('drain', 'Drainage & rain water', '#9a7350'),
    ('air', 'Ductwork & air terminals', '#c46ad6'),
    ('valves', 'Valves & controls', '#f0a03a'),
    ('elec', 'Cable tray & conduit', '#e8c547'),
    ('power', 'Panels & power', '#7c8794'),
    ('light', 'Lighting', '#fff2b8'),
    ('lps', 'Lightning protection & earthing', '#c8834a'),
    ('safety', 'Fire safety', '#e23d3d'),
]
LAYER_IDX = {l[0]: i for i, l in enumerate(LAYERS)}


def system_layer(name: str):
    n = name.lower()
    if 'chilled' in n or 'equaliz' in n:
        return 'chw'
    if 'condenser' in n:
        return 'cw'
    if 'dom' in n or 'soft' in n or 'makeup' in n or 'make up' in n or 'dws' in n or 'cold water' in n:
        return 'dom'
    if 'hot water' in n or 'hws' in n or 'hwr' in n:
        return 'hw'
    if 'rain' in n or 'drain' in n or 'over flow' in n or 'overflow' in n or 'sanitary' in n or 'waste' in n:
        return 'drain'
    if 'air' in n or 'exhaust' in n or 'supply air' in n:
        return 'air'
    return None


def equip_kind(fam: str):
    f_ = fam.lower()
    for k, v in [('chiller', 'Chiller'), ('cooling tower', 'Cooling tower'), ('heat pump', 'Heat pump'), ('pump', 'Pump'),
                 ('expansion tank', 'Expansion tank'), ('mixing tank', 'Mixing tank'), ('solar', 'Solar water heater'),
                 ('axial fan', 'Axial fan'), ('exhaust plenum', 'Exhaust plenum'), ('separator', 'Air & dirt separator')]:
        if k in f_:
            return v
    return None


def classify(e, fam, systems):
    cls = e.is_a()
    f_ = fam.lower()
    if equip_kind(fam):
        return 'equipment'
    if 'lightning' in f_ or 'earthing' in f_:
        return 'lps'
    if 'extinguisher' in f_ or 'catch basin' in f_:
        return 'safety' if 'extinguisher' in f_ else 'drain'
    if cls == 'IfcFlowController':
        return 'valves' if ('valve' in f_) else 'power'
    if 'conduit' in f_ or 'cable tray' in f_ or 'ladder' in f_:
        return 'elec'
    if any(k in f_ for k in ['led', 'light', 'downlight', 'batten']):
        return 'light'
    if any(k in f_ for k in ['distribution board', 'panel', 'socket', 'switch']):
        return 'power'
    if 'grill' in f_ or 'screen' in f_ or 'duct' in f_ or 'rectangular' in f_ or 'wye' in f_:
        return 'air'
    for s in systems:
        l = system_layer(s)
        if l:
            return l
    if 'pvc' in f_ or 'dwv' in f_ or 'sanitary' in f_:
        return 'drain'
    return 'dom'


# ---------- element table ----------
storey_of = {}
for rel in f.by_type('IfcRelContainedInSpatialStructure'):
    for el in rel.RelatedElements:
        storey_of[el.id()] = rel.RelatingStructure.Name
skip = {'IfcDistributionPort', 'IfcOpeningElement', 'IfcSpace', 'IfcGrid', 'IfcAnnotation'}
elems = [e for e in f.by_type('IfcProduct') if e.is_a() not in skip and e.Representation]

DN_STEEL = [(15, 21.3), (20, 26.9), (25, 33.7), (32, 42.4), (40, 48.3), (50, 60.3), (65, 76.1), (80, 88.9), (100, 114.3), (125, 139.7),
            (150, 168.3), (200, 219.1), (250, 273.0), (300, 323.9), (350, 355.6), (400, 406.4), (450, 457.0), (500, 508.0)]


def nominal(od_mm):
    dn, od = min(DN_STEEL, key=lambda t: abs(t[1] - od_mm))
    return dn if abs(od - od_mm) / od < 0.12 else None


info = {}
for e in elems:
    n = e.Name or e.is_a()
    parts = n.split(':')
    fam = parts[0].strip()
    typ = parts[1].strip() if len(parts) > 2 else ''
    systems = sorted({r.RelatingGroup.Name for r in e.HasAssignments if r.is_a('IfcRelAssignsToGroup') and r.RelatingGroup.Name})
    ps = U.get_psets(e)
    length = ps.get('Pset_FlowSegmentPipeSegment', {}).get('Length') or ps.get('Pset_FlowSegmentDuctSegment', {}).get('Length')
    inv = ps.get('Pset_FlowSegmentPipeSegment', {}).get('InvertElevation')
    info[e.id()] = dict(cls=e.is_a(), fam=fam, typ=typ, sys=systems, lvl=storey_of.get(e.id(), ''), len=length, inv=inv,
                        tag=getattr(e, 'Tag', None), layer=classify(e, fam, systems))

# ---------- geometry ----------
s = ifcopenshell.geom.settings()
s.set('use-world-coords', True)
s.set('weld-vertices', True)
it = ifcopenshell.geom.iterator(s, f, multiprocessing.cpu_count(), include=elems)
geo = {}  # eid -> (verts, faces, normals)
if it.initialize():
    while True:
        sh = it.get()
        g = sh.geometry
        v = np.array(g.verts, dtype=np.float64).reshape(-1, 3)
        fa = np.array(g.faces, dtype=np.int64).reshape(-1, 3)
        nm = np.array(g.normals, dtype=np.float64).reshape(-1, 3) if len(g.normals) else None
        if len(fa) > 240:
            # simplify heavy elements (fittings, holders, equipment detail) while keeping their silhouette
            keep = 240 + (len(fa) - 240) * 0.3
            vs, fs_ = fs.simplify(v.astype(np.float32), fa.astype(np.int32), target_reduction=1 - keep / len(fa), agg=4)
            if len(fs_) > 12:
                v, fa, nm = vs.astype(np.float64), fs_.astype(np.int64), None
        if len(fa):
            geo[sh.id] = (v, fa, nm)
        if not it.next():
            break
print('geometry for', len(geo), 'of', len(elems), 'elements')

# IFC is Z-up; viewer is Y-up
allv = np.vstack([g[0] for g in geo.values()])
lo, hi = allv.min(0), allv.max(0)
ctr = (lo + hi) / 2
print('extent (m):', np.round(hi - lo, 2))


def to_view(v):
    w = v - [ctr[0], ctr[1], lo[2]]
    return np.stack([w[:, 0], w[:, 2], -w[:, 1]], axis=1)


# ---------- per-element measurements ----------
def principal_size(v):
    c = v.mean(0)
    u, sv, vt = np.linalg.svd(v - c, full_matrices=False)
    axis = vt[0]
    proj = (v - c) @ axis
    length = proj.max() - proj.min()
    perp = (v - c) - np.outer(proj, axis)
    return axis, length, perp


rows = []  # element table, in index order
order = sorted(geo.keys(), key=lambda k: (LAYER_IDX[info[k]['layer']], info[k]['fam']))
for idx, eid in enumerate(order):
    i = info[eid]
    v = geo[eid][0]
    vv = to_view(v)
    bb = np.round(np.concatenate([vv.min(0), vv.max(0)]), 3).tolist()
    size = ''
    if i['cls'] == 'IfcFlowSegment':
        axis, L, perp = principal_size(v)
        if 'Duct' in i['fam'] or 'Cable Tray' in i['fam']:
            # ducts and trays run along the model axes: the extent closest to the Revit length is the run,
            # the other two are the cross-section
            ext3 = np.ptp(v, axis=0) * 1000
            run = int(np.argmin(np.abs(ext3 - (i['len'] or ext3.max()))))
            cross = sorted((ext3[k] for k in range(3) if k != run), reverse=True)
            if 'Duct' in i['fam']:
                hz = [k for k in range(3) if k != run and k != 2]
                Wd = ext3[hz[0]] if hz else cross[0]
                Hd = ext3[2] if run != 2 else cross[1]
                size = f'{round(Wd / 50) * 50:.0f}x{round(Hd / 50) * 50:.0f}'
            else:
                size = f'{round(cross[0] / 50) * 50:.0f} wide'
        else:
            od = 2 * np.sqrt((perp ** 2).sum(1)).max() * 1000
            dn = nominal(od) if 'Pipe' in i['fam'] else None
            size = f'DN{dn}' if dn else f'Ø{od:.0f}'
        if not i['len']:
            i['len'] = L * 1000
    elif i['typ']:
        size = i['typ']
    rows.append(dict(
        i=idx, l=LAYER_IDX[i['layer']], c=i['cls'].replace('Ifc', ''), f=i['fam'], t=i['typ'], s=i['sys'], v=i['lvl'],
        z=size, n=round(i['len'] / 1000, 3) if i['len'] else None, iv=round(i['inv'] / 1000, 3) if i['inv'] else None,
        k=equip_kind(i['fam']), b=bb, id=str(i['tag']) if i['tag'] else None,
    ))

# ---------- binary per layer ----------
ext = hi - lo
view_lo = to_view(lo[None, :])[0]
vmin = np.array([-(ext[0]) / 2, 0.0, -(ext[1]) / 2]) - 0.01
vmax = np.array([ext[0] / 2, ext[2], ext[1] / 2]) + 0.01
scale = (vmax - vmin) / 65535


def oct_encode(n):
    n = n / (np.abs(n).sum(1, keepdims=True) + 1e-12)
    x, y, z = n[:, 0], n[:, 1], n[:, 2]
    neg = z < 0
    ox = np.where(neg, (1 - np.abs(y)) * np.sign(x + 1e-12), x)
    oy = np.where(neg, (1 - np.abs(x)) * np.sign(y + 1e-12), y)
    return np.clip(np.round(np.stack([ox, oy], 1) * 127), -127, 127).astype(np.int8)


blob = bytearray()
layers_meta = []
for li, (lid, label, col) in enumerate(LAYERS):
    members = [r for r in rows if r['l'] == li]
    if not members:
        continue
    P, N, E, I = [], [], [], []
    base = 0
    for r in members:
        v, fa, nm = geo[order[r['i']]]
        vv = to_view(v)
        if nm is None or len(nm) != len(v):
            nm = np.zeros_like(v)
            tri = v[fa]
            fn = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
            for k in range(3):
                np.add.at(nm, fa[:, k], fn)
        nv = to_view(nm + [ctr[0], ctr[1], lo[2]])  # rotate only
        P.append(vv)
        N.append(nv)
        E.append(np.full(len(vv), r['i'], np.uint16))
        I.append(fa + base)
        r['vr'] = [base, len(vv)]
        base += len(vv)
    P = np.vstack(P)
    q = np.clip(np.round((P - vmin) / scale), 0, 65535).astype(np.uint16)
    nn = oct_encode(np.vstack(N))
    e_ = np.concatenate(E)
    idx = np.vstack(I).astype(np.uint16 if len(q) < 65536 else np.uint32).ravel()
    entry = dict(id=lid, label=label, color=col, count=len(members), verts=int(len(q)), tris=int(len(idx) // 3), i32=bool(idx.dtype == np.uint32))
    for name, arr in [('pos', q), ('nrm', nn), ('elem', e_), ('idx', idx)]:
        while len(blob) % 4:
            blob.append(0)
        entry[name] = [len(blob), int(arr.size)]
        blob += arr.tobytes()
    layers_meta.append(entry)
    print(f'{lid:10s} elems {len(members):5d} verts {len(q):8d} tris {len(idx)//3:8d}')

import gzip
(out / 'geo.bin.gz').write_bytes(gzip.compress(bytes(blob), 9))
print('geo.bin', round(len(blob) / 1e6, 2), 'MB raw,', round((out / 'geo.bin.gz').stat().st_size / 1e6, 2), 'MB gzipped')

# ---------- schedules ----------
def group(rows_, key, extra=lambda g: {}):
    d = collections.OrderedDict()
    for r in rows_:
        d.setdefault(key(r), []).append(r)
    return [dict(key=list(k) if isinstance(k, tuple) else [k], ids=[r['i'] for r in g], count=len(g),
                 length=round(sum(r['n'] or 0 for r in g), 1), **extra(g)) for k, g in d.items()]


eq = [r for r in rows if r['k']]
pipes = [r for r in rows if r['c'] == 'FlowSegment' and 'Pipe' in r['f']]
ducts = [r for r in rows if r['c'] == 'FlowSegment' and ('Duct' in r['f'])]
trays = [r for r in rows if r['c'] == 'FlowSegment' and ('Cable Tray' in r['f'] or 'Conduit' in r['f'])]
valves = [r for r in rows if r['l'] == LAYER_IDX['valves'] or 'air & dirt' in r['f'].lower()]
fittings = [r for r in rows if r['c'] == 'FlowFitting']
elec = [r for r in rows if r['l'] in (LAYER_IDX['light'], LAYER_IDX['power'], LAYER_IDX['safety'])]


def sysname(r):
    return re.sub(r'\s*\d+$', '', (r['s'][0] if r['s'] else 'Unassigned')).rstrip('. ').title()


def dn_key(z):
    m = re.match(r'DN(\d+)', z or '')
    return int(m.group(1)) if m else 9999


schedules = [
    dict(id='equipment', title='Equipment schedule', cols=['Equipment', 'Family', 'Type / rating', 'Level', 'Qty'],
         rows=[dict(cells=[k[0], k[1], k[2], k[3]], **x) for x in group(sorted(eq, key=lambda r: (r['k'], r['t'])), lambda r: (r['k'], r['f'], r['t'], r['v']))
               for k in [x.pop('key')]]),
    dict(id='pipe', title='Pipe schedule', cols=['System', 'Size', 'Material', 'Segments', 'Length (m)'],
         rows=[dict(cells=[k[0], k[1], k[2]], **x) for x in group(sorted(pipes, key=lambda r: (sysname(r), dn_key(r['z']))), lambda r: (sysname(r), r['z'], r['t']))
               for k in [x.pop('key')]]),
    dict(id='duct', title='Duct schedule', cols=['System', 'Size (mm)', 'Type', 'Segments', 'Length (m)'],
         rows=[dict(cells=[k[0], k[1], k[2]], **x) for x in group(sorted(ducts, key=lambda r: sysname(r)), lambda r: (sysname(r), r['z'], r['t']))
               for k in [x.pop('key')]]),
    dict(id='valves', title='Valves & specialties', cols=['Item', 'Size / type', 'System', 'Qty'],
         rows=[dict(cells=[k[0], k[1], k[2]], **x) for x in group(sorted(valves, key=lambda r: r['f']), lambda r: (r['f'].replace('M_', ''), r['t'], sysname(r)))
               for k in [x.pop('key')]]),
    dict(id='fittings', title='Fittings', cols=['Fitting', 'Layer', 'Qty'],
         rows=[dict(cells=[k[0], LAYERS[k[1]][1]], **x) for x in group(sorted(fittings, key=lambda r: (r['l'], r['f'])), lambda r: (r['f'].replace('M_', ''), r['l']))
               for k in [x.pop('key')]]),
    dict(id='elec', title='Electrical & cable routes', cols=['Item', 'Size / type', 'Qty', 'Length (m)'],
         rows=[dict(cells=[k[0], k[1]], **x) for x in group(sorted(trays + elec, key=lambda r: (r['l'], r['f'])), lambda r: (r['f'].replace('M_', ''), r['z'] if r['c'] == 'FlowSegment' else r['t']))
               for k in [x.pop('key')]]),
]
for sch in schedules:
    for row in sch['rows']:
        row['length'] = row['length'] if row['length'] else None

levels = sorted({r['v'] for r in rows if r['v']})
storeys = [(s.Name, (s.Elevation or 0) / 1000) for s in f.by_type('IfcBuildingStorey')]
meta = dict(
    bounds=dict(min=vmin.round(4).tolist(), max=vmax.round(4).tolist(), scale=scale.tolist()),
    layers=layers_meta,
    levels=[dict(name=n, elev=round(e, 3)) for n, e in sorted(storeys, key=lambda t: t[1])],
    stats=dict(elements=len(rows), segments=sum(1 for r in rows if r['c'] == 'FlowSegment'), fittings=len(fittings),
               systems=len({s for r in rows for s in r['s']}), pipe_m=round(sum(r['n'] or 0 for r in pipes)), equipment=len(eq)),
    elements=[{k: v for k, v in r.items() if v not in (None, '', [])} for r in rows],
    schedules=schedules,
)
(out / 'meta.json').write_text(json.dumps(meta, separators=(',', ':')), encoding='utf8')
print('meta.json', round((out / 'meta.json').stat().st_size / 1e6, 2), 'MB', meta['stats'])
