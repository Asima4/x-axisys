// Generates the sample drawing set (SVG) from the shared building data.
// Every sheet uses the same plan origin and scale, so the architectural, structural
// and MEP drawings overlay exactly — just like a coordinated BIM drawing set.

import { building as B, roomArea, type Facade, type Level, type V2 } from './building';

export type Discipline = 'arch' | 'str' | 'mep';

export type SheetData = {
  id: string;
  number: string;
  title: string;
  discipline: Discipline;
  disciplineName: string;
  scale: string;
  description: string;
  body: string; // inner SVG (layer groups)
};

const W = B.width;
const D = B.depth;
const PZ = B.depth + B.porchDepth;
const T = B.wall;
const SLAB_BOTTOM = B.storey - B.slab;
const roofTop = (z: number) => B.roof.back + ((B.roof.front - B.roof.back) * z) / D;
const roofUnder = (z: number) => roofTop(z) - B.roof.thickness;

const n = (v: number) => Math.round(v * 10) / 10;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mm = (m: number) => String(Math.round(m * 1000));

type LayerName = 'grid' | 'under' | 'walls' | 'open' | 'detail' | 'systems' | 'dims' | 'text';

/** Accumulates SVG markup into animation layers. */
class Canvas {
  L: Record<LayerName, string[]> = { grid: [], under: [], walls: [], open: [], detail: [], systems: [], dims: [], text: [] };
  constructor(
    public id: string,
    public s = 50,
    public ox = 0,
    public oy = 0,
  ) {}

  X = (x: number) => n(this.ox + x * this.s);
  Y = (z: number) => n(this.oy + z * this.s);

  raw(l: LayerName, svg: string) {
    this.L[l].push(svg);
  }
  line(l: LayerName, x1: number, y1: number, x2: number, y2: number, cls: string) {
    this.L[l].push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" class="${cls}"/>`);
  }
  rect(l: LayerName, x: number, y: number, w: number, h: number, cls: string, extra = '') {
    const x0 = Math.min(x, x + w);
    const y0 = Math.min(y, y + h);
    this.L[l].push(`<rect x="${n(x0)}" y="${n(y0)}" width="${n(Math.abs(w))}" height="${n(Math.abs(h))}" class="${cls}"${extra}/>`);
  }
  circle(l: LayerName, cx: number, cy: number, r: number, cls: string) {
    this.L[l].push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" class="${cls}"/>`);
  }
  path(l: LayerName, d: string, cls: string) {
    this.L[l].push(`<path d="${d}" class="${cls}"/>`);
  }
  poly(l: LayerName, pts: V2[], cls: string, closed = true) {
    const p = pts.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');
    this.L[l].push(closed ? `<polygon points="${p}" class="${cls}"/>` : `<polyline points="${p}" class="${cls}"/>`);
  }
  text(l: LayerName, x: number, y: number, str: string, cls = 't', opts: { anchor?: 'start' | 'middle' | 'end'; rotate?: number } = {}) {
    const a = opts.anchor ?? 'middle';
    const r = opts.rotate ? ` transform="rotate(${opts.rotate} ${n(x)} ${n(y)})"` : '';
    this.L[l].push(`<text x="${n(x)}" y="${n(y)}" text-anchor="${a}" class="${cls}"${r}>${esc(str)}</text>`);
  }
  /** Label with a white knock-out background so it stays legible over linework. */
  tag(l: LayerName, x: number, y: number, str: string, cls = 't-sm', width?: number) {
    const w = width ?? str.length * 6.4 + 10;
    this.rect(l, x - w / 2, y - 10, w, 14, 'k-knock');
    this.text(l, x, y + 1, str, cls);
  }

  // ----- Plan helpers (plan metres → page) -----

  gridBubbles(opts: { top?: boolean; left?: boolean; z?: number[]; extend?: number } = {}) {
    const ext = opts.extend ?? 1.0;
    const r = 13;
    for (const g of B.grids.x) {
      this.line('grid', this.X(g.v), this.Y(-1.55), this.X(g.v), this.Y(PZ + ext), 'k-grid');
      this.circle('grid', this.X(g.v), this.Y(-1.55) - r, r, 'k-bubble');
      this.text('grid', this.X(g.v), this.Y(-1.55) - r + 5, g.id, 't-bubble');
    }
    for (const g of B.grids.z) {
      this.line('grid', this.X(-1.55), this.Y(g.v), this.X(W + ext), this.Y(g.v), 'k-grid');
      this.circle('grid', this.X(-1.55) - r, this.Y(g.v), r, 'k-bubble');
      this.text('grid', this.X(-1.55) - r, this.Y(g.v) + 5, g.id, 't-bubble');
    }
  }

  dimH(x1: number, x2: number, y: number, label: string, ext = 10) {
    this.line('dims', x1, y, x2, y, 'k-dim');
    for (const x of [x1, x2]) {
      this.line('dims', x, y - ext, x, y + 4, 'k-dim');
      this.line('dims', x - 4, y + 4, x + 4, y - 4, 'k-tick');
    }
    this.text('dims', (x1 + x2) / 2, y - 5, label, 't-dim');
  }

  dimV(x: number, y1: number, y2: number, label: string, ext = 10) {
    this.line('dims', x, y1, x, y2, 'k-dim');
    for (const y of [y1, y2]) {
      this.line('dims', x - 4, y, x + ext, y, 'k-dim');
      this.line('dims', x - 4, y + 4, x + 4, y - 4, 'k-tick');
    }
    this.text('dims', x - 6, (y1 + y2) / 2, label, 't-dim', { rotate: -90 });
  }

  northArrow(x: number, y: number) {
    this.circle('text', x, y, 20, 'k-thin');
    this.poly('text', [[x, y - 20], [x + 8, y + 10], [x, y + 4], [x - 8, y + 10]], 'k-solid');
    this.text('text', x, y - 26, 'N', 't-bold');
  }

  title(x: number, y: number, num: string, title: string, scale: string, width = 420) {
    this.circle('text', x + 16, y, 16, 'k-title-circle');
    this.text('text', x + 16, y + 6, num, 't-title-num');
    this.text('text', x + 44, y + 2, title, 't-title', { anchor: 'start' });
    this.line('text', x + 44, y + 10, x + 44 + width, y + 10, 'k-title-line');
    this.text('text', x + 44, y + 28, scale, 't-sm', { anchor: 'start' });
  }

  schedule(x: number, y: number, title: string, cols: { h: string; w: number }[], rows: string[][]) {
    const rh = 22;
    const total = cols.reduce((a, c) => a + c.w, 0);
    this.text('text', x, y - 8, title, 't-bold', { anchor: 'start' });
    this.rect('text', x, y, total, rh * (rows.length + 1), 'k-table');
    this.rect('text', x, y, total, rh, 'k-table-head');
    let cx = x;
    cols.forEach((c, i) => {
      if (i > 0) this.line('text', cx, y, cx, y + rh * (rows.length + 1), 'k-thin');
      this.text('text', cx + 8, y + 15, c.h, 't-head', { anchor: 'start' });
      rows.forEach((r, ri) => this.text('text', cx + 8, y + rh * (ri + 1) + 15, r[i], 't-sm', { anchor: 'start' }));
      cx += c.w;
    });
    rows.forEach((_, ri) => this.line('text', x, y + rh * (ri + 1), x + total, y + rh * (ri + 1), 'k-thin'));
  }

  legend(x: number, y: number, items: { sw: string; label: string }[], title = 'LEGEND') {
    this.text('text', x, y - 8, title, 't-bold', { anchor: 'start' });
    items.forEach((it, i) => {
      const yy = y + 12 + i * 22;
      this.raw('text', `<g transform="translate(${n(x)} ${n(yy)})">${it.sw}</g>`);
      this.text('text', x + 50, yy + 4, it.label, 't-sm', { anchor: 'start' });
    });
  }

  toString() {
    const g = (name: LayerName, attrs = '') => (this.L[name].length ? `<g class="l l-${name}"${attrs}>${this.L[name].join('')}</g>` : '');
    return [
      g('grid'),
      g('under', ` mask="url(#wipe1-${this.id})"`),
      g('walls', ` mask="url(#wipe1-${this.id})"`),
      g('open', ` mask="url(#wipe2-${this.id})"`),
      g('detail', ` mask="url(#wipe2-${this.id})"`),
      g('systems', ` mask="url(#wipe3-${this.id})"`),
      g('dims'),
      g('text'),
    ].join('');
  }
}

// ---------------------------------------------------------------------------
// Shared plan geometry
// ---------------------------------------------------------------------------

const PLAN_S = 50;
const PLAN_OX = 200;
const PLAN_OY = 158;

type PlanStyle = 'arch' | 'under';

function facadeSegments(level: Level, facade: Facade) {
  const along = facade === 'front' || facade === 'back' ? W : D;
  const ops = [...level.openings[facade]].sort((a, b) => a.from - b.from);
  const solid: [number, number][] = [];
  let cur = 0;
  for (const o of ops) {
    if (o.from > cur) solid.push([cur, o.from]);
    cur = o.to;
  }
  if (cur < along) solid.push([cur, along]);
  return { solid, ops };
}

function drawPlan(c: Canvas, levelIndex: number, style: PlanStyle) {
  const L = B.levels[levelIndex];
  const wallCls = style === 'arch' ? 'k-wall' : 'k-under-wall';
  const lineCls = style === 'arch' ? 'k-thin' : 'k-under-line';
  const layer: LayerName = style === 'arch' ? 'walls' : 'under';
  const openLayer: LayerName = style === 'arch' ? 'open' : 'under';
  const t = T * c.s;

  // Exterior walls with openings
  for (const f of ['front', 'back', 'left', 'right'] as Facade[]) {
    const { solid, ops } = facadeSegments(L, f);
    const horizontal = f === 'front' || f === 'back';
    const line = f === 'front' ? D : f === 'back' ? 0 : f === 'left' ? 0 : W;
    for (const [u0, u1] of solid) {
      if (horizontal) {
        const a = u0 === 0 ? -T / 2 : u0;
        const b = u1 === W ? W + T / 2 : u1;
        c.rect(layer, c.X(a), c.Y(line) - t / 2, (b - a) * c.s, t, wallCls);
      } else {
        c.rect(layer, c.X(line) - t / 2, c.Y(u0), t, (u1 - u0) * c.s, wallCls);
      }
    }
    for (const o of ops) {
      const inward = f === 'front' || f === 'right' ? -1 : 1;
      if (horizontal) {
        const x0 = c.X(o.from);
        const x1 = c.X(o.to);
        const y = c.Y(line);
        c.line(openLayer, x0, y - t / 2, x0, y + t / 2, lineCls);
        c.line(openLayer, x1, y - t / 2, x1, y + t / 2, lineCls);
        if (o.kind === 'slider') {
          const mid = (x0 + x1) / 2;
          c.line(openLayer, x0, y - 2.5, mid + 6, y - 2.5, lineCls);
          c.line(openLayer, mid - 6, y + 2.5, x1, y + 2.5, lineCls);
        } else if (o.kind === 'door') {
          const w = x1 - x0;
          c.line(openLayer, x0, y, x0, y + inward * w, lineCls);
          c.path(openLayer, `M${n(x0)} ${n(y + inward * w)} A${n(w)} ${n(w)} 0 0 ${inward > 0 ? 0 : 1} ${n(x1)} ${n(y)}`, 'k-arc');
        } else {
          c.line(openLayer, x0, y - 2, x1, y - 2, lineCls);
          c.line(openLayer, x0, y + 2, x1, y + 2, lineCls);
        }
      } else {
        const y0 = c.Y(o.from);
        const y1 = c.Y(o.to);
        const x = c.X(line);
        c.line(openLayer, x - t / 2, y0, x + t / 2, y0, lineCls);
        c.line(openLayer, x - t / 2, y1, x + t / 2, y1, lineCls);
        if (o.kind === 'door') {
          const w = y1 - y0;
          c.line(openLayer, x, y0, x + inward * w, y0, lineCls);
          c.path(openLayer, `M${n(x + inward * w)} ${n(y0)} A${n(w)} ${n(w)} 0 0 ${inward > 0 ? 1 : 0} ${n(x)} ${n(y1)}`, 'k-arc');
        } else {
          c.line(openLayer, x - 2, y0, x - 2, y1, lineCls);
          c.line(openLayer, x + 2, y0, x + 2, y1, lineCls);
        }
      }
    }
  }

  // Partitions with door leaves and swings
  const pt = 0.1 * c.s;
  for (const p of L.partitions) {
    const horizontal = p.a[1] === p.b[1];
    const start = horizontal ? Math.min(p.a[0], p.b[0]) : Math.min(p.a[1], p.b[1]);
    const end = horizontal ? Math.max(p.a[0], p.b[0]) : Math.max(p.a[1], p.b[1]);
    const doors = [...(p.doors ?? [])].sort((a, b) => a.at - b.at);
    let cur = start;
    const segs: [number, number][] = [];
    for (const d of doors) {
      if (d.at - d.width / 2 > cur) segs.push([cur, d.at - d.width / 2]);
      cur = d.at + d.width / 2;
    }
    if (cur < end) segs.push([cur, end]);
    const partCls = style === 'arch' ? 'k-part' : 'k-under-part';
    for (const [s0, s1] of segs) {
      if (horizontal) c.rect(layer, c.X(s0), c.Y(p.a[1]) - pt / 2, (s1 - s0) * c.s, pt, partCls);
      else c.rect(layer, c.X(p.a[0]) - pt / 2, c.Y(s0), pt, (s1 - s0) * c.s, partCls);
    }
    for (const d of doors) {
      const side = d.side ?? 1;
      const w = d.width * c.s;
      const hingeAtStart = (d.swing ?? 1) > 0;
      if (horizontal) {
        const y = c.Y(p.a[1]);
        const hx = c.X(hingeAtStart ? d.at - d.width / 2 : d.at + d.width / 2);
        const ox = c.X(hingeAtStart ? d.at + d.width / 2 : d.at - d.width / 2);
        c.line(openLayer, hx, y, hx, y + side * w, style === 'arch' ? 'k-leaf' : 'k-under-line');
        const sweep = (side > 0) === hingeAtStart ? 0 : 1;
        c.path(openLayer, `M${n(hx)} ${n(y + side * w)} A${n(w)} ${n(w)} 0 0 ${sweep} ${n(ox)} ${n(y)}`, 'k-arc');
      } else {
        const x = c.X(p.a[0]);
        const hy = c.Y(hingeAtStart ? d.at - d.width / 2 : d.at + d.width / 2);
        const oy = c.Y(hingeAtStart ? d.at + d.width / 2 : d.at - d.width / 2);
        c.line(openLayer, x, hy, x + side * w, hy, style === 'arch' ? 'k-leaf' : 'k-under-line');
        const sweep = (side > 0) === hingeAtStart ? 1 : 0;
        c.path(openLayer, `M${n(x + side * w)} ${n(hy)} A${n(w)} ${n(w)} 0 0 ${sweep} ${n(x)} ${n(oy)}`, 'k-arc');
      }
    }
  }

  // Stair
  const st = B.stair;
  const going = (st.x1 - st.x0) / st.risers;
  const stairLayer: LayerName = style === 'arch' ? 'detail' : 'under';
  const stairCls = style === 'arch' ? 'k-thin' : 'k-under-line';
  c.rect(stairLayer, c.X(st.x0), c.Y(st.z0), (st.x1 - st.x0) * c.s, (st.z1 - st.z0) * c.s, 'k-outline-' + (style === 'arch' ? 'arch' : 'under'));
  for (let i = 1; i < st.risers; i++) {
    const x = c.X(st.x0 + i * going);
    c.line(stairLayer, x, c.Y(st.z0), x, c.Y(st.z1), levelIndex === 1 ? 'k-hidden' : stairCls);
  }
  if (style === 'arch') {
    const zm = c.Y((st.z0 + st.z1) / 2);
    c.line('detail', c.X(st.x1 - 0.2), zm, c.X(st.x0 + 0.25), zm, 'k-thin');
    c.poly('detail', [[c.X(st.x0 + 0.25), zm], [c.X(st.x0 + 0.45), zm - 5], [c.X(st.x0 + 0.45), zm + 5]], 'k-solid');
    c.tag('text', c.X(st.x1 - 0.5), zm + 4, levelIndex === 0 ? 'UP' : 'DN', 't-sm', 24);
    if (levelIndex === 0) {
      // Break line where the plan cuts the flight
      const bx = c.X(st.x0 + (st.x1 - st.x0) * 0.35);
      c.path('detail', `M${bx - 12} ${c.Y(st.z1) + 4} L${bx - 2} ${zm + 6} L${bx + 2} ${zm - 6} L${bx + 12} ${c.Y(st.z0) - 4}`, 'k-thin');
    }
  }
}

function drawColumnsSimple(c: Canvas, layer: LayerName, cls = 'k-col') {
  for (const col of B.structure.columns) {
    const sz = col.z === PZ ? 0.16 : 0.22;
    c.rect(layer, c.X(col.x) - (sz * c.s) / 2, c.Y(col.z) - (sz * c.s) / 2, sz * c.s, sz * c.s, cls);
  }
}

function drawRoomLabels(c: Canvas, levelIndex: number, withArea: boolean, cls = 't-room', corner = false) {
  for (const r of B.levels[levelIndex].rooms) {
    if (r.name === 'Stair') continue;
    if (corner) {
      c.text('text', c.X(r.x0 + 0.22), c.Y(r.z0 + 0.42), r.name.toUpperCase(), `${cls} ${cls}--sm`, { anchor: 'start' });
      continue;
    }
    if (r.name === 'Open to below') {
      const [ox, oz] = r.label ?? [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
      c.tag('text', c.X(ox), c.Y(oz) + 4, 'OPEN TO BELOW', 't-room t-room--sm', 96);
      continue;
    }
    const [lx, lz] = r.label ?? [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
    const small = r.x1 - r.x0 < 2.5;
    c.text('text', c.X(lx), c.Y(lz) - (withArea ? 2 : -4), r.name.toUpperCase(), small ? `${cls} ${cls}--sm` : cls);
    const skipArea = r.name === 'Open to below' || r.name === 'Stair' || r.name === 'Kitchen';
    if (withArea && !skipArea) c.text('text', c.X(lx), c.Y(lz) + 13, `${roomArea(r).toFixed(1)} m²`, 't-area');
  }
}

function drawFurniture(c: Canvas, levelIndex: number) {
  const items = levelIndex === 0 ? B.furniture.L0 : B.furniture.L1;
  for (const f of items) {
    const x = c.X(f.x - f.w / 2);
    const y = c.Y(f.z - f.d / 2);
    const w = f.w * c.s;
    const h = f.d * c.s;
    if (f.type === 'bed') {
      c.rect('detail', x, y, w, h, 'k-furn');
      c.rect('detail', x + 6, y + 6, w / 2 - 9, h * 0.16, 'k-furn');
      c.rect('detail', x + w / 2 + 3, y + 6, w / 2 - 9, h * 0.16, 'k-furn');
      c.line('detail', x, y + h * 0.32, x + w, y + h * 0.32, 'k-furn');
    } else if (f.type === 'table') {
      c.rect('detail', x, y, w, h, 'k-furn');
      for (let i = 0; i < 3; i++) {
        const cx = x + (w * (i + 0.5)) / 3;
        c.circle('detail', cx, y - 9, 7, 'k-furn');
        c.circle('detail', cx, y + h + 9, 7, 'k-furn');
      }
    } else if (f.type === 'sofa') {
      c.rect('detail', x, y, w, h, 'k-furn');
      c.rect('detail', x, y, w, h * 0.3, 'k-furn');
      c.line('detail', x + w / 2, y + h * 0.3, x + w / 2, y + h, 'k-furn');
    } else {
      c.rect('detail', x, y, w, h, 'k-furn');
      if (f.type === 'island') c.rect('detail', c.X(f.x - 0.35) - 0, c.Y(f.z - 0.2), 0.7 * c.s, 0.4 * c.s, 'k-furn');
    }
  }
}

function drawFixtures(c: Canvas, levelIndex: number, layer: LayerName, cls = 'k-fixture') {
  for (const f of B.mep.fixtures.filter((q) => q.level === levelIndex)) {
    const x = c.X(f.x);
    const y = c.Y(f.z);
    switch (f.type) {
      case 'wc':
        c.rect(layer, x - 11, y - 14, 8, 28, cls);
        c.raw(layer, `<ellipse cx="${n(x + 7)}" cy="${n(y)}" rx="11" ry="9" class="${cls}"/>`);
        break;
      case 'basin':
        c.rect(layer, x - 12, y - 16, 22, 32, cls);
        c.raw(layer, `<ellipse cx="${n(x)}" cy="${n(y)}" rx="7" ry="10" class="${cls}"/>`);
        break;
      case 'shower':
        c.rect(layer, x - 22, y - 22, 44, 44, cls);
        c.line(layer, x - 22, y - 22, x + 22, y + 22, cls);
        c.line(layer, x + 22, y - 22, x - 22, y + 22, cls);
        break;
      case 'washer':
        c.rect(layer, x - 15, y - 15, 30, 30, cls);
        c.circle(layer, x, y, 9, cls);
        break;
      case 'heater':
        c.circle(layer, x, y, 14, cls);
        c.text(layer, x, y + 4, 'WH', 't-xs');
        break;
      case 'sink':
        c.rect(layer, x - 16, y - 9, 32, 18, cls);
        c.circle(layer, x, y, 3, cls);
        break;
    }
  }
}

function drawPorch(c: Canvas, levelIndex: number, style: PlanStyle) {
  const layer: LayerName = style === 'arch' ? 'detail' : 'under';
  if (levelIndex === 0) {
    c.rect(layer, c.X(-0.4), c.Y(D + T / 2), (W + 0.8) * c.s, (PZ + 0.5 - D - T / 2) * c.s, style === 'arch' ? 'k-deck' : 'k-under-line');
    if (style === 'arch') {
      for (let z = D + 0.45; z < PZ + 0.5; z += 0.3) c.line(layer, c.X(-0.4), c.Y(z), c.X(W + 0.4), c.Y(z), 'k-deck-line');
      c.line('detail', c.X(-0.6), c.Y(PZ + 0.35), c.X(W + 0.6), c.Y(PZ + 0.35), 'k-hidden');
      c.tag('text', c.X(W / 2), c.Y(PZ + 0.2), 'PORCH · TIMBER DECK', 't-sm', 150);
    }
  } else {
    c.rect(layer, c.X(-0.12), c.Y(D + T / 2), (W + 0.24) * c.s, (PZ + 0.1 - D - T / 2) * c.s, style === 'arch' ? 'k-balcony' : 'k-under-line');
    if (style === 'arch') {
      c.line(layer, c.X(0), c.Y(PZ - 0.05), c.X(W), c.Y(PZ - 0.05), 'k-rail');
      c.line(layer, c.X(0.05), c.Y(D + 0.1), c.X(0.05), c.Y(PZ - 0.05), 'k-rail');
      c.line(layer, c.X(W - 0.05), c.Y(D + 0.1), c.X(W - 0.05), c.Y(PZ - 0.05), 'k-rail');
      c.tag('text', c.X(W / 2), c.Y(D + 0.95), 'BALCONY', 't-room', 80);
      // Stair void guard
      c.line(layer, c.X(12.6), c.Y(1.5), c.X(W), c.Y(1.5), 'k-rail');
    }
  }
}

function planDims(c: Canvas) {
  const xs = B.grids.x.map((g) => g.v);
  const y1 = c.Y(PZ + 1.45);
  const y2 = c.Y(PZ + 2.05);
  xs.slice(0, -1).forEach((x, i) => c.dimH(c.X(x), c.X(xs[i + 1]), y1, mm(xs[i + 1] - x)));
  c.dimH(c.X(0), c.X(W), y2, mm(W));
  const zs = B.grids.z.map((g) => g.v);
  const x1 = c.X(-0.95);
  zs.slice(0, -1).forEach((z, i) => c.dimV(x1, c.Y(z), c.Y(zs[i + 1]), mm(zs[i + 1] - z)));
}

function planCanvas(id: string) {
  return new Canvas(id, PLAN_S, PLAN_OX, PLAN_OY);
}

// ---------------------------------------------------------------------------
// Architectural sheets
// ---------------------------------------------------------------------------

function archPlan(levelIndex: 0 | 1): SheetData {
  const id = levelIndex === 0 ? 'a101' : 'a102';
  const c = planCanvas(id);
  const L = B.levels[levelIndex];
  c.gridBubbles();
  drawPorch(c, levelIndex, 'arch');
  drawPlan(c, levelIndex, 'arch');
  drawColumnsSimple(c, 'walls');
  drawFurniture(c, levelIndex);
  drawFixtures(c, levelIndex, 'detail');
  drawRoomLabels(c, levelIndex, true);
  planDims(c);
  c.northArrow(c.X(W + 1.75), c.Y(-1.1));

  // Section / elevation markers
  const mark = (x: number, y: number, label: string, dir: 'up' | 'down' | 'left' | 'right') => {
    c.circle('text', x, y, 13, 'k-bubble');
    c.line('text', x - 13, y, x + 13, y, 'k-thin');
    c.text('text', x, y - 2, label, 't-xs');
    c.text('text', x, y + 10, 'A-201', 't-xxs');
    const tri: Record<string, V2[]> = {
      up: [[x - 8, y - 11], [x + 8, y - 11], [x, y - 22]],
      down: [[x - 8, y + 11], [x + 8, y + 11], [x, y + 22]],
      left: [[x - 11, y - 8], [x - 11, y + 8], [x - 22, y]],
      right: [[x + 11, y - 8], [x + 11, y + 8], [x + 22, y]],
    };
    c.poly('text', tri[dir], 'k-solid');
  };
  mark(c.X(W / 2), c.Y(PZ + 0.95), '1', 'up');
  mark(c.X(W + 0.95), c.Y(D / 2), '2', 'left');

  const gross = W * D;
  c.title(c.X(-1.9), c.Y(PZ + 3.05), '1', `${L.name.toUpperCase()} PLAN`, `SCALE 1:100 · GROSS INTERNAL AREA ${gross.toFixed(0)} m²`);
  return {
    id,
    number: levelIndex === 0 ? 'A-101' : 'A-102',
    title: `${L.name} Plan`,
    discipline: 'arch',
    disciplineName: 'Architectural',
    scale: '1:100',
    description: levelIndex === 0 ? 'Room layout, doors, glazing, stair and furniture for the ground floor.' : 'Bedrooms, family lounge, balcony and stair void on the first floor.',
    body: c.toString(),
  };
}

function archElevations(): SheetData {
  const c = new Canvas('a201', 40, 0, 0);
  const s = c.s;
  const hatch = `url(#hatch-a201)`;

  const levelMarker = (x: number, y: number, name: string, value: string) => {
    c.raw('text', `<path d="M${n(x)} ${n(y - 8)} A8 8 0 0 1 ${n(x + 8)} ${n(y)} L${n(x)} ${n(y)} Z" class="k-solid"/>`);
    c.raw('text', `<path d="M${n(x)} ${n(y + 8)} A8 8 0 0 1 ${n(x - 8)} ${n(y)} L${n(x)} ${n(y)} Z" class="k-solid"/>`);
    c.circle('text', x, y, 8, 'k-thin');
    c.text('text', x + 16, y - 3, name, 't-sm', { anchor: 'start' });
    c.text('text', x + 16, y + 11, value, 't-dim', { anchor: 'start' });
  };

  const glazing = (x0: number, x1: number, yb: number, yt: number, kind: string, reversed = false) => {
    // x0/x1 page coords, yb/yt page coords (yb > yt)
    const left = Math.min(x0, x1);
    const right = Math.max(x0, x1);
    c.rect('open', left, yt, right - left, yb - yt, 'k-glass');
    const panes = kind === 'slider' ? Math.max(2, Math.round((right - left) / s / 1.1)) : Math.max(1, Math.round((right - left) / s / 1.3));
    for (let i = 1; i < panes; i++) {
      const x = left + ((right - left) * i) / panes;
      c.line('open', x, yt, x, yb, 'k-mullion');
    }
    if (kind === 'window' && (yb - yt) / s > 1.2) c.line('open', left, yt + (yb - yt) * 0.28, right, yt + (yb - yt) * 0.28, 'k-mullion');
    // glass reflection strokes
    c.line('open', left + (right - left) * 0.18, yb - (yb - yt) * 0.35, left + (right - left) * 0.3, yb - (yb - yt) * 0.65, 'k-reflect');
    void reversed;
  };

  // ----- 1: Front elevation -----
  const fox = 190;
  const fgy = 392; // ground floor level (y=0) on page
  const FX = (x: number) => fox + x * s;
  const FY = (y: number) => fgy - y * s;

  // grid bubbles
  for (const g of B.grids.x) {
    c.line('grid', FX(g.v), FY(8.2), FX(g.v), FY(-0.3), 'k-grid');
    c.circle('grid', FX(g.v), FY(8.2) - 13, 13, 'k-bubble');
    c.text('grid', FX(g.v), FY(8.2) - 8, g.id, 't-bubble');
  }
  // ground
  c.rect('walls', FX(-1.4), FY(-0.3), (W + 2.8) * s, 0.45 * s, 'k-earth', ` fill="${hatch}"`);
  c.line('walls', FX(-1.4), FY(-0.3), FX(W + 1.4), FY(-0.3), 'k-ground');
  c.rect('walls', FX(-0.15), FY(0), (W + 0.3) * s, 0.3 * s, 'k-plinth');
  // walls
  c.rect('walls', FX(-T / 2), FY(SLAB_BOTTOM), (W + T) * s, SLAB_BOTTOM * s, 'k-elev-wall');
  c.rect('walls', FX(-0.12), FY(B.storey), (W + 0.24) * s, B.slab * s, 'k-slab-edge');
  c.rect('walls', FX(-T / 2), FY(roofUnder(D)), (W + T) * s, (roofUnder(D) - B.storey) * s, 'k-elev-wall');
  // openings
  B.levels.forEach((L) =>
    L.openings.front.forEach((o) => glazing(FX(o.from), FX(o.to), FY(L.y + Math.max(o.sill, 0)), FY(L.y + o.head), o.kind)),
  );
  // roof fascia (front edge, z = PZ + 0.35)
  const rt = roofTop(PZ + 0.35);
  c.rect('walls', FX(-0.63), FY(rt + 0.04), (W + 1.26) * s, (B.roof.thickness + 0.08) * s, 'k-fascia');
  // vent stacks above roof
  for (const x of [0.7, 14.55]) c.rect('detail', FX(x) - 3, FY(7.9), 6, (7.9 - rt) * s, 'k-elev-line');
  // posts
  for (const g of B.grids.x) {
    c.rect('detail', FX(g.v - 0.08), FY(SLAB_BOTTOM), 0.16 * s, SLAB_BOTTOM * s, 'k-post');
    c.rect('detail', FX(g.v - 0.07), FY(roofUnder(PZ)), 0.14 * s, (roofUnder(PZ) - B.storey) * s, 'k-post');
  }
  // balustrade
  c.rect('detail', FX(0), FY(B.storey + 1.1), W * s, 0.05 * s, 'k-rail-elev');
  c.rect('detail', FX(0), FY(B.storey + 0.18), W * s, 0.04 * s, 'k-rail-elev');
  for (let x = 0.1; x < W; x += 0.13) c.line('detail', FX(x), FY(B.storey + 0.18), FX(x), FY(B.storey + 1.05), 'k-baluster');
  // levels
  const levels = [
    { y: 0, name: 'GROUND FLOOR', v: '±0.000' },
    { y: B.storey, name: 'FIRST FLOOR', v: `+${B.storey.toFixed(3)}` },
    { y: B.roof.front, name: 'ROOF (HIGH)', v: `+${B.roof.front.toFixed(3)}` },
  ];
  for (const lv of levels) {
    c.line('dims', FX(-1.2), FY(lv.y), FX(W + 1.6), FY(lv.y), 'k-level');
    levelMarker(FX(W + 1.9), FY(lv.y), lv.name, lv.v);
  }
  c.dimV(FX(-1.0), FY(0), FY(B.storey), mm(B.storey));
  c.dimV(FX(-1.0), FY(B.storey), FY(B.roof.front), mm(B.roof.front - B.storey));
  c.title(FX(-1.2), FY(-0.3) + 46, '1', 'FRONT ELEVATION (SOUTH)', 'SCALE 1:100', 380);

  // ----- 2: Side elevation (viewed from +x; front/porch on the left) -----
  const sox = 150;
  const sgy = 846;
  const zMax = PZ + 0.6;
  const SX = (z: number) => sox + (zMax - z) * s;
  const SY = (y: number) => sgy - y * s;

  for (const g of B.grids.z) {
    c.line('grid', SX(g.v), SY(8.2), SX(g.v), SY(-0.3), 'k-grid');
    c.circle('grid', SX(g.v), SY(8.2) - 13, 13, 'k-bubble');
    c.text('grid', SX(g.v), SY(8.2) - 8, g.id, 't-bubble');
  }
  c.rect('walls', SX(zMax + 0.8), SY(-0.3), (zMax + 1.6) * s, 0.45 * s, 'k-earth', ` fill="${hatch}"`);
  c.line('walls', SX(zMax + 0.8), SY(-0.3), SX(-1.4), SY(-0.3), 'k-ground');
  c.rect('walls', SX(D + 0.15), SY(0), (D + 0.3) * s, 0.3 * s, 'k-plinth');
  c.poly(
    'walls',
    [
      [SX(0), SY(0)],
      [SX(D), SY(0)],
      [SX(D), SY(roofUnder(D))],
      [SX(0), SY(roofUnder(0))],
    ],
    'k-elev-wall',
  );
  // cladding joints
  for (let z = 1.2; z < D; z += 1.2) c.line('walls', SX(z), SY(0), SX(z), SY(roofUnder(z)), 'k-joint');
  c.rect('walls', SX(D + 0.1), SY(B.storey), (D + 0.1 + 0.02) * s, B.slab * s, 'k-slab-edge');
  B.levels.forEach((L) =>
    L.openings.right.forEach((o) => glazing(SX(o.to), SX(o.from), SY(L.y + Math.max(o.sill, 0)), SY(L.y + o.head), o.kind)),
  );
  // balcony slab edge, posts, side rail
  c.rect('detail', SX(PZ + 0.1), SY(B.storey), (PZ + 0.1 - D) * s, B.slab * s, 'k-slab-edge');
  c.rect('detail', SX(PZ + 0.08), SY(SLAB_BOTTOM), 0.16 * s, SLAB_BOTTOM * s, 'k-post');
  c.rect('detail', SX(PZ + 0.07), SY(roofUnder(PZ)), 0.14 * s, (roofUnder(PZ) - B.storey) * s, 'k-post');
  c.rect('detail', SX(PZ), SY(B.storey + 1.1), (PZ - D) * s, 0.05 * s, 'k-rail-elev');
  for (let z = D + 0.12; z < PZ; z += 0.13) c.line('detail', SX(z), SY(B.storey + 0.18), SX(z), SY(B.storey + 1.05), 'k-baluster');
  // roof slope
  const r0 = -B.roof.overhang;
  const r1 = PZ + 0.35;
  c.poly(
    'walls',
    [
      [SX(r0), SY(roofTop(r0))],
      [SX(r1), SY(roofTop(r1))],
      [SX(r1), SY(roofTop(r1) - B.roof.thickness)],
      [SX(r0), SY(roofTop(r0) - B.roof.thickness)],
    ],
    'k-roof-elev',
  );
  // condenser + vents
  const cu = B.mep.condenser;
  c.rect('detail', SX(cu.z + cu.d / 2), SY(roofTop(cu.z) + cu.h), cu.d * s, cu.h * s, 'k-equip-elev');
  c.line('detail', SX(cu.z + cu.d / 2) + 4, SY(roofTop(cu.z) + cu.h * 0.5), SX(cu.z - cu.d / 2) - 4, SY(roofTop(cu.z) + cu.h * 0.5), 'k-elev-line');
  for (const z of [0.35, 1.7]) c.rect('detail', SX(z) - 3, SY(7.9), 6, (7.9 - roofTop(z)) * s, 'k-elev-line');

  for (const lv of [
    { y: 0, name: 'GROUND FLOOR', v: '±0.000' },
    { y: B.storey, name: 'FIRST FLOOR', v: `+${B.storey.toFixed(3)}` },
    { y: B.roof.back, name: 'ROOF (LOW)', v: `+${B.roof.back.toFixed(3)}` },
  ]) {
    c.line('dims', SX(zMax + 0.6), SY(lv.y), SX(-1.2), SY(lv.y), 'k-level');
    levelMarker(SX(-1.5), SY(lv.y), lv.name, lv.v);
  }
  c.dimH(SX(PZ), SX(D), SY(-0.3) + 26, mm(PZ - D));
  c.dimH(SX(D), SX(0), SY(-0.3) + 26, mm(D));
  c.title(SX(zMax + 0.6), SY(-0.3) + 58, '2', 'SIDE ELEVATION (EAST)', 'SCALE 1:100', 340);

  // Material notes
  const notes = ['01  RENDERED MASONRY, WHITE', '02  ALUMINIUM SLIDING DOORS, DARK BRONZE', '03  POWDER-COATED STEEL BALUSTRADE', '04  TIMBER DECK ON STEEL SUB-FRAME'];
  c.text('text', 850, 660, 'MATERIALS', 't-bold', { anchor: 'start' });
  notes.forEach((t, i) => c.text('text', 850, 686 + i * 22, t, 't-sm', { anchor: 'start' }));

  return {
    id: 'a201',
    number: 'A-201',
    title: 'Elevations',
    discipline: 'arch',
    disciplineName: 'Architectural',
    scale: '1:100',
    description: 'Front and side elevations with levels, glazing, balcony and roof profile.',
    body: c.toString(),
  };
}

// ---------------------------------------------------------------------------
// Structural sheets
// ---------------------------------------------------------------------------

function strFoundation(): SheetData {
  const c = planCanvas('s101');
  const S = B.structure;
  c.gridBubbles();
  // Building outline underlay
  c.rect('under', c.X(-T / 2), c.Y(-T / 2), (W + T) * c.s, (D + T) * c.s, 'k-under-outline');
  // Strip footings (hidden)
  const sw = S.strip.width / 2;
  c.rect('walls', c.X(-sw), c.Y(-sw), (W + 2 * sw) * c.s, (D + 2 * sw) * c.s, 'k-footing-outline');
  c.rect('walls', c.X(sw), c.Y(sw), (W - 2 * sw) * c.s, (D - 2 * sw) * c.s, 'k-footing-outline');
  c.tag('text', c.X(6.3), c.Y(0) + 4, `${S.strip.mark} STRIP FOOTING`, 't-sm', 118);
  // Pads
  for (const f of S.footings) {
    const h = (f.size / 2) * c.s;
    c.rect('walls', c.X(f.x) - h, c.Y(f.z) - h, h * 2, h * 2, 'k-pad', ` fill="url(#hatch-s101)"`);
    c.rect('detail', c.X(f.x) - 12, c.Y(f.z) - 12, 24, 24, 'k-pedestal');
    c.text('text', c.X(f.x) + h + 4, c.Y(f.z) - h + 12, f.mark, 't-mark', { anchor: 'start' });
  }
  drawColumnsSimple(c, 'detail', 'k-col-steel');
  // Slab notes
  c.tag('text', c.X(6.3), c.Y(2.2), '125 THK SLAB ON GRADE', 't-room', 190);
  c.tag('text', c.X(6.3), c.Y(2.2) + 18, 'A252 MESH · 0.25 mm DPM · 150 FILL', 't-sm', 240);
  c.tag('text', c.X(10.5), c.Y(6.6), 'TOP OF SLAB ±0.000', 't-sm', 150);
  c.tag('text', c.X(W / 2), c.Y(PZ) + 36, 'F3 PADS FOR PORCH POSTS · DECK ON STEEL SUB-FRAME', 't-sm', 330);
  // Section callout
  const sx = c.X(8.4) + 95;
  const sy = c.Y(4.4) - 72;
  c.line('text', c.X(8.4) + 40, c.Y(4.4) - 40, sx - 12, sy + 9, 'k-thin');
  c.circle('text', sx, sy, 16, 'k-bubble');
  c.line('text', sx - 16, sy, sx + 16, sy, 'k-thin');
  c.text('text', sx, sy - 3, '2', 't-xs');
  c.text('text', sx, sy + 12, 'S-501', 't-xxs');
  c.northArrow(c.X(W + 1.75), c.Y(-1.1));

  c.schedule(
    745,
    c.Y(PZ) + 70,
    'FOOTING SCHEDULE',
    [
      { h: 'MARK', w: 60 },
      { h: 'SIZE (mm)', w: 150 },
      { h: 'REINFORCEMENT', w: 170 },
    ],
    [
      ['F1', '1600 × 1600 × 450', 'T16 @ 200 B.W.'],
      ['F2', '1300 × 1300 × 450', 'T16 @ 200 B.W.'],
      ['F3', '900 × 900 × 400', 'T12 @ 200 B.W.'],
      ['SF1', '600 W × 400 D', '3 – T12 T&B'],
    ],
  );
  c.title(c.X(-1.9), c.Y(PZ + 3.05), '1', 'FOUNDATION PLAN', 'SCALE 1:100 · CONCRETE C30/37 · COVER 50 mm', 380);
  return {
    id: 's101',
    number: 'S-101',
    title: 'Foundation Plan',
    discipline: 'str',
    disciplineName: 'Structural',
    scale: '1:100',
    description: 'Pad and strip footings, slab on grade and footing schedule.',
    body: c.toString(),
  };
}

function strFraming(): SheetData {
  const c = planCanvas('s201');
  const S = B.structure;
  c.gridBubbles();
  drawPlan(c, 1, 'under');
  // Joists
  const spans: [number, number][] = [
    [0, 4.4],
    [4.4, 8.8],
    [8.8, PZ],
  ];
  for (let x = S.joist.spacing; x < W - 0.05; x += S.joist.spacing) {
    if (B.grids.x.some((g) => Math.abs(g.v - x) < 0.15)) continue;
    for (const [za, zb] of spans) {
      if (x > 12.6 && za === 0 && x < W) {
        continue;
      }
      c.line('systems', c.X(x), c.Y(za + 0.12), c.X(x), c.Y(zb - 0.12), 'k-joist');
    }
  }
  // Stair void
  c.rect('systems', c.X(12.6), c.Y(0), 4.2 * c.s, 1.5 * c.s, 'k-void');
  c.line('systems', c.X(12.6), c.Y(0), c.X(W), c.Y(1.5), 'k-thin');
  c.line('systems', c.X(12.6), c.Y(1.5), c.X(W), c.Y(0), 'k-thin');
  c.tag('text', c.X(14.7), c.Y(0.75) + 4, 'STAIR VOID', 't-sm', 80);
  // Beams
  for (const b of S.beamsX) {
    c.line('walls', c.X(0), c.Y(b.z), c.X(W), c.Y(b.z), 'k-beam');
    c.tag('text', c.X(10.5), c.Y(b.z) - 8, b.size.replace('x', '×'), 't-beam', 64);
  }
  for (const b of S.beamsZ) {
    c.line('walls', c.X(b.x), c.Y(0), c.X(b.x), c.Y(PZ), 'k-beam');
    c.raw('text', `<g transform="translate(${c.X(b.x) - 9} ${c.Y(6.6)}) rotate(-90)"><rect x="-32" y="-10" width="64" height="14" class="k-knock"/><text x="0" y="1" text-anchor="middle" class="t-beam">${b.size.replace('x', '×')}</text></g>`);
  }
  // Columns: wide-flange symbol
  for (const col of S.columns) {
    const x = c.X(col.x);
    const y = c.Y(col.z);
    if (col.z === PZ) {
      c.rect('detail', x - 5, y - 5, 10, 10, 'k-col-hss');
    } else {
      c.rect('detail', x - 7, y - 6, 14, 2.5, 'k-col-steel');
      c.rect('detail', x - 7, y + 3.5, 14, 2.5, 'k-col-steel');
      c.rect('detail', x - 1, y - 6, 2, 12, 'k-col-steel');
    }
  }
  // Span / joist callouts
  const spanTag = (x: number, za: number, zb: number) => {
    const y0 = c.Y(za + 0.35);
    const y1 = c.Y(zb - 0.35);
    c.line('text', c.X(x), y0, c.X(x), y1, 'k-span');
    c.poly('text', [[c.X(x), y0], [c.X(x) - 5, y0 + 10], [c.X(x) + 5, y0 + 10]], 'k-solid');
    c.poly('text', [[c.X(x), y1], [c.X(x) - 5, y1 - 10], [c.X(x) + 5, y1 - 10]], 'k-solid');
    c.tag('text', c.X(x), (y0 + y1) / 2 + 4, `${S.joist.size} @ 600`, 't-sm', 132);
  };
  spanTag(2.1, 0, 4.4);
  spanTag(6.3, 4.4, 8.8);
  spanTag(10.5, 0, 4.4);
  spanTag(14.7, 4.4, 8.8);
  // Bracing marker on grid A
  const br = S.bracing;
  c.line('systems', c.X(br.x) - 6, c.Y(br.z0 + 0.2), c.X(br.x) - 6, c.Y(br.z1 - 0.2), 'k-brace');
  c.tag('text', c.X(-0.72), c.Y(2.2) + 4, 'VB-1', 't-brace', 42);
  // Balcony edge
  c.tag('text', c.X(W / 2), c.Y(PZ) + 30, 'BALCONY EDGE BEAM W8×18 · HSS4×4 POSTS BELOW', 't-sm', 310);
  c.northArrow(c.X(W + 1.75), c.Y(-1.1));

  c.schedule(
    745,
    c.Y(PZ) + 70,
    'STEEL MEMBER SCHEDULE · ASTM A992',
    [
      { h: 'MARK', w: 60 },
      { h: 'SECTION', w: 110 },
      { h: 'LOCATION', w: 210 },
    ],
    [
      ['B1', 'W14×34', 'GRID 2 PRIMARY BEAM'],
      ['B2', 'W12×26', 'GRIDS 1 & 3'],
      ['B3', 'W10×22', 'GRIDS A–E'],
      ['C1', 'W8×31', 'COLUMNS · GRIDS 1–3'],
    ],
  );
  c.title(c.X(-1.9), c.Y(PZ + 3.05), '1', 'FIRST FLOOR FRAMING PLAN', 'SCALE 1:100 · TOP OF STEEL +3.150', 400);
  return {
    id: 's201',
    number: 'S-201',
    title: 'First Floor Framing Plan',
    discipline: 'str',
    disciplineName: 'Structural',
    scale: '1:100',
    description: 'Steel beams, columns, cold-formed joists, bracing and member schedule.',
    body: c.toString(),
  };
}

function strDetails(): SheetData {
  const c = new Canvas('s501', 1, 0, 0);
  const leader = (x1: number, y1: number, x2: number, y2: number, label: string, anchor: 'start' | 'end' = 'start') => {
    c.circle('text', x1, y1, 2.5, 'k-solid');
    c.path('text', `M${x1} ${y1} L${x2} ${y2} L${x2 + (anchor === 'start' ? 16 : -16)} ${y2}`, 'k-leader');
    c.text('text', x2 + (anchor === 'start' ? 22 : -22), y2 + 4, label, 't-sm', { anchor });
  };

  // ----- Detail 1: beam–column shear connection (elevation) -----
  // Column (flanges at x 150–160 and 330–340), beam from x 352
  c.rect('walls', 150, 90, 190, 660, 'k-steel-web');
  c.rect('walls', 150, 90, 11, 660, 'k-steel-cut');
  c.rect('walls', 329, 90, 11, 660, 'k-steel-cut');
  c.path('walls', 'M140 90 L160 80 L180 95 L200 82 L220 96 L240 83 L260 95 L280 82 L300 96 L320 84 L350 92', 'k-break');
  c.path('walls', 'M140 750 L160 740 L180 755 L200 742 L220 756 L240 743 L260 755 L280 742 L300 756 L320 744 L350 752', 'k-break');
  // Web stiffeners at beam flange levels
  c.rect('detail', 161, 262, 168, 10, 'k-stiffener');
  c.rect('detail', 161, 572, 168, 10, 'k-stiffener');
  // Beam
  c.rect('walls', 352, 262, 250, 330, 'k-steel-web');
  c.rect('walls', 352, 262, 250, 12, 'k-steel-cut');
  c.rect('walls', 352, 580, 250, 12, 'k-steel-cut');
  c.path('walls', 'M602 250 L592 300 L612 360 L594 420 L612 480 L594 540 L608 604', 'k-break');
  // Shear plate + bolts
  c.rect('detail', 340, 315, 100, 225, 'k-plate', ` fill="url(#hatch2-s501)"`);
  for (const y of [360, 427, 494]) {
    c.circle('detail', 400, y, 11, 'k-bolt');
    c.line('detail', 392, y - 8, 408, y + 8, 'k-thin');
    c.line('detail', 408, y - 8, 392, y + 8, 'k-thin');
  }
  // Weld symbol
  c.poly('detail', [[340, 316], [352, 316], [340, 328]], 'k-solid');
  c.poly('detail', [[340, 538], [352, 538], [340, 526]], 'k-solid');
  // Dimensions
  c.dimV(470, 315, 360, '45');
  c.dimV(470, 360, 427, '67');
  c.dimV(470, 427, 494, '67');
  c.dimV(470, 494, 540, '45');
  c.dimH(340, 400, 610, '60');
  c.dimH(400, 440, 610, '40');
  c.dimH(340, 352, 650, '12');
  // Labels
  leader(245, 180, 380, 130, 'W8×31 COLUMN (C1)');
  leader(560, 268, 380, 205, 'W14×34 BEAM (B1)');
  leader(425, 525, 480, 690, '10 THK SHEAR PLATE');
  leader(400, 494, 480, 715, '3 – M20 GR 8.8 BOLTS');
  leader(346, 534, 480, 740, '6 FW BOTH SIDES');
  leader(245, 577, 100, 800, 'FULL-DEPTH WEB STIFFENERS 10 THK', 'start');
  c.title(70, 880, '1', 'BEAM TO COLUMN SHEAR CONNECTION', 'SCALE 1:5 · TYPICAL AT GRID 2', 470);

  // ----- Detail 2: column base plate & pad footing (section) -----
  const cx = 830;
  // footing, pedestal, slab and fill
  c.rect('walls', 670, 640, 320, 150, 'k-concrete', ` fill="url(#hatch-s501)"`);
  c.rect('walls', 780, 486, 100, 154, 'k-concrete', ` fill="url(#hatch-s501)"`);
  c.rect('walls', 670, 486, 110, 32, 'k-concrete', ` fill="url(#hatch-s501)"`);
  c.rect('walls', 880, 486, 110, 32, 'k-concrete', ` fill="url(#hatch-s501)"`);
  c.rect('walls', 670, 518, 110, 26, 'k-fill');
  c.rect('walls', 880, 518, 110, 26, 'k-fill');
  // grout + base plate
  c.rect('detail', 788, 474, 84, 12, 'k-grout');
  c.rect('detail', 772, 462, 116, 12, 'k-plate-solid');
  // column
  c.rect('detail', cx - 34, 150, 68, 312, 'k-steel-web');
  c.rect('detail', cx - 34, 150, 8, 312, 'k-steel-cut');
  c.rect('detail', cx + 26, 150, 8, 312, 'k-steel-cut');
  c.path('detail', `M${cx - 44} 150 L${cx - 20} 140 L${cx} 152 L${cx + 20} 140 L${cx + 44} 150`, 'k-break');
  // anchor bolts
  for (const x of [792, 868]) {
    c.line('detail', x, 450, x, 610, 'k-anchor');
    c.path('detail', `M${x} 610 L${x} 620 L${x + (x < cx ? -16 : 16)} 620`, 'k-anchor');
    c.rect('detail', x - 8, 452, 16, 10, 'k-solid');
  }
  // reinforcement
  c.line('detail', 685, 770, 975, 770, 'k-rebar');
  c.path('detail', 'M685 770 L685 740', 'k-rebar');
  c.path('detail', 'M975 770 L975 740', 'k-rebar');
  for (let x = 700; x <= 962; x += 29) c.circle('detail', x, 760, 4, 'k-solid');
  for (const y of [520, 560, 600]) c.rect('detail', 786, y, 88, 1, 'k-rebar');
  for (const x of [787, 873]) c.line('detail', x, 500, x, 750, 'k-rebar');
  // ground line
  c.line('walls', 670, 544, 780, 544, 'k-ground');
  c.line('walls', 880, 544, 990, 544, 'k-ground');
  // dims
  c.dimH(670, 990, 820, '1600');
  c.dimV(656, 640, 790, '450');
  c.dimH(780, 880, 690, '500');
  // labels
  leader(830, 250, 1005, 210, 'W8×31 COLUMN');
  leader(850, 468, 1005, 400, '25 THK BASE PLATE');
  leader(860, 480, 1005, 440, '30 GROUT');
  leader(868, 575, 1005, 480, '4 – M20 ANCHORS');
  leader(950, 500, 1005, 520, '125 SLAB');
  leader(880, 610, 1005, 560, 'PEDESTAL 500');
  leader(940, 700, 1005, 600, 'PAD FOOTING F1');
  leader(960, 770, 1005, 640, 'T16 @ 200 B.W.');
  c.title(680, 880, '2', 'COLUMN BASE PLATE DETAIL', 'SCALE 1:10 · SECTION THROUGH F1', 400);

  c.line('text', 640, 70, 640, 930, 'k-divider');

  return {
    id: 's501',
    number: 'S-501',
    title: 'Connection Details',
    discipline: 'str',
    disciplineName: 'Structural',
    scale: '1:5, 1:10',
    description: 'Typical steel shear connection and column base plate on pad footing.',
    body: c.toString(),
  };
}

// ---------------------------------------------------------------------------
// MEP sheets
// ---------------------------------------------------------------------------

function mepBase(id: string) {
  const c = planCanvas(id);
  c.gridBubbles();
  drawPorch(c, 0, 'under');
  drawPlan(c, 0, 'under');
  drawColumnsSimple(c, 'under', 'k-under-col');
  drawRoomLabels(c, 0, false, 't-room-light', true);
  c.northArrow(c.X(W + 1.75), c.Y(-1.1));
  return c;
}

const swatch = {
  box: (cls: string) => `<rect x="0" y="-6" width="36" height="12" class="${cls}"/>`,
  line: (cls: string) => `<line x1="0" y1="0" x2="36" y2="0" class="${cls}"/>`,
  sym: (svg: string) => svg,
};

function mepHvac(): SheetData {
  const c = mepBase('m101');
  const E = B.mep;
  for (const d of E.ducts.filter((q) => q.level === 0)) {
    const cls = d.kind === 'supply' ? 'k-duct-supply' : 'k-duct-return';
    for (let i = 0; i < d.path.length - 1; i++) {
      const [ax, az] = d.path[i];
      const [bx, bz] = d.path[i + 1];
      const hw = d.w / 2;
      if (az === bz) c.rect('systems', c.X(Math.min(ax, bx) - hw), c.Y(az - hw), (Math.abs(bx - ax) + d.w) * c.s, d.w * c.s, cls);
      else c.rect('systems', c.X(ax - hw), c.Y(Math.min(az, bz) - hw), d.w * c.s, (Math.abs(bz - az) + d.w) * c.s, cls);
      c.line('systems', c.X(ax), c.Y(az), c.X(bx), c.Y(bz), 'k-duct-cl');
    }
  }
  // Size tags + flow arrows
  c.tag('text', c.X(8.4), c.Y(3.0) - 18, 'SA 500×300', 't-duct', 80);
  c.tag('text', c.X(2.1) - 34, c.Y(6.0), '300×250', 't-duct', 60);
  c.tag('text', c.X(11.0), c.Y(5.8) + 22, 'RA 400×250', 't-duct-r', 82);
  for (const x of [13.0, 9.6, 5.2]) c.poly('systems', [[c.X(x), c.Y(3.0) - 5], [c.X(x), c.Y(3.0) + 5], [c.X(x) - 10, c.Y(3.0)]], 'k-flow');
  // Diffusers
  for (const g of E.diffusers.filter((q) => q.level === 0)) {
    const x = c.X(g.x);
    const y = c.Y(g.z);
    c.rect('systems', x - 14, y - 14, 28, 28, 'k-diffuser');
    c.line('systems', x - 14, y - 14, x + 14, y + 14, 'k-diffuser-x');
    c.line('systems', x + 14, y - 14, x - 14, y + 14, 'k-diffuser-x');
  }
  c.tag('text', c.X(6.3) + 70, c.Y(7.4) + 4, 'SD-1 · 120 L/s', 't-sm', 96);
  for (const g of E.returnGrilles) {
    c.rect('systems', c.X(g.x) - 18, c.Y(g.z) - 12, 36, 24, 'k-grille');
    for (let i = -12; i <= 12; i += 6) c.line('systems', c.X(g.x) + i - 6, c.Y(g.z) + 12, c.X(g.x) + i + 6, c.Y(g.z) - 12, 'k-grille-line');
  }
  // AHU
  const a = E.ahu;
  c.rect('systems', c.X(a.x - a.w / 2), c.Y(a.z - a.d / 2), a.w * c.s, a.d * c.s, 'k-ahu');
  c.tag('text', c.X(a.x), c.Y(a.z) + 4, 'AHU-1', 't-bold', 46);
  // Condenser (roof) & refrigerant
  const cu = E.condenser;
  c.rect('systems', c.X(cu.x - cu.w / 2), c.Y(cu.z - cu.d / 2), cu.w * c.s, cu.d * c.s, 'k-roof-equip');
  c.line('systems', c.X(cu.x), c.Y(cu.z - cu.d / 2), c.X(cu.x), c.Y(-0.45), 'k-thin');
  c.tag('text', c.X(cu.x), c.Y(-0.6), 'CU-1 ON ROOF ABOVE', 't-sm', 124);
  c.path('systems', `M${c.X(a.x)} ${c.Y(a.z + a.d / 2)} L${c.X(a.x)} ${c.Y(3.4)} L${c.X(16.45)} ${c.Y(3.4)}`, 'k-refrig');
  c.circle('systems', c.X(16.45), c.Y(3.4), 5, 'k-riser-refrig');

  c.legend(745, c.Y(PZ) + 80, [
    { sw: swatch.box('k-duct-supply'), label: 'SUPPLY AIR DUCT' },
    { sw: swatch.box('k-duct-return'), label: 'RETURN AIR DUCT' },
    { sw: `<rect x="8" y="-9" width="18" height="18" class="k-diffuser"/><path d="M8 -9 L26 9 M26 -9 L8 9" class="k-diffuser-x"/>`, label: 'SUPPLY DIFFUSER' },
    { sw: swatch.line('k-refrig'), label: 'REFRIGERANT PIPEWORK' },
  ]);
  c.schedule(1000 - 15, c.Y(PZ) + 80, 'EQUIPMENT', [{ h: 'TAG', w: 50 }, { h: 'DUTY', w: 110 }], [
    ['AHU-1', '0.95 m³/s'],
    ['CU-1', '14 kW COOL'],
  ]);
  c.title(c.X(-1.9), c.Y(PZ + 3.05), '1', 'GROUND FLOOR HVAC LAYOUT', 'SCALE 1:100 · DUCTS AT +2.550 U/S', 400);
  return {
    id: 'm101',
    number: 'M-101',
    title: 'HVAC Layout',
    discipline: 'mep',
    disciplineName: 'Mechanical',
    scale: '1:100',
    description: 'Supply and return ductwork, diffusers, air handling unit and condenser.',
    body: c.toString(),
  };
}

function mepPlumbing(): SheetData {
  const c = mepBase('p101');
  drawFixtures(c, 0, 'systems', 'k-fixture-mep');
  const clsOf = { cold: 'k-cold', hot: 'k-hot', waste: 'k-waste', refrigerant: 'k-refrig' } as const;
  const risers: { x: number; z: number; kind: keyof typeof clsOf }[] = [];
  for (const p of B.mep.pipes) {
    if (p.kind === 'refrigerant') continue;
    for (let i = 0; i < p.pts.length - 1; i++) {
      const [ax, ay, az] = p.pts[i];
      const [bx, by, bz] = p.pts[i + 1];
      const horizontal = ay === by;
      if (horizontal) {
        if (ay > 3.2) continue; // above ground floor
        const below = ay < 0;
        c.line('systems', c.X(ax), c.Y(az), c.X(bx), c.Y(bz), clsOf[p.kind] + (below && p.kind !== 'cold' ? ' k-below' : ''));
      } else if (Math.min(ay, by) < 3.2 && Math.max(ay, by) > 1.0) {
        risers.push({ x: ax, z: az, kind: p.kind });
      }
    }
  }
  const seen = new Set<string>();
  for (const r of risers) {
    const key = `${r.x},${r.z}`;
    if (seen.has(key)) continue;
    seen.add(key);
    c.circle('systems', c.X(r.x), c.Y(r.z), 6, `k-riser k-riser-${r.kind}`);
  }
  // Tags
  c.tag('text', c.X(0.7) + 44, c.Y(0.35) - 12, 'SVP-1 Ø100', 't-sm', 76);
  c.tag('text', c.X(14.55) - 20, c.Y(1.7) - 16, 'SVP-2 Ø100', 't-sm', 76);
  c.tag('text', c.X(1.25) + 46, c.Y(0.85) + 18, 'CWR/HWR-1', 't-sm', 76);
  c.tag('text', c.X(14.4) + 44, c.Y(3.95) + 20, 'WH-1 180 L', 't-sm', 76);
  c.tag('text', c.X(8.0) + 110, c.Y(-1.0), 'INCOMING WATER SERVICE Ø32', 't-sm', 170);
  c.tag('text', c.X(8.0) - 58, c.Y(2.5) + 22, 'KITCHEN SINK', 't-sm', 80);
  c.tag('text', c.X(10.5), c.Y(0.6) - 12, 'CW Ø25 BELOW SLAB', 't-cold', 118);
  c.tag('text', c.X(10.5), c.Y(0.85) + 20, 'HW Ø20 AT CEILING', 't-hot', 118);
  for (const x of [0.7, 7.75, 14.55]) {
    c.line('systems', c.X(x), c.Y(-0.2), c.X(x), c.Y(-1.5), 'k-waste k-below');
    c.poly('systems', [[c.X(x) - 5, c.Y(-1.4)], [c.X(x) + 5, c.Y(-1.4)], [c.X(x), c.Y(-1.62)]], 'k-solid');
  }
  c.tag('text', c.X(3.2), c.Y(-1.0), 'TO SEWER · FALL 1:40', 't-sm', 130);

  c.legend(745, c.Y(PZ) + 80, [
    { sw: swatch.line('k-cold'), label: 'COLD WATER' },
    { sw: swatch.line('k-hot'), label: 'HOT WATER' },
    { sw: swatch.line('k-waste k-below'), label: 'SOIL & WASTE (BELOW SLAB)' },
    { sw: `<circle cx="18" cy="0" r="6" class="k-riser k-riser-waste"/>`, label: 'RISER / STACK' },
  ]);
  c.title(c.X(-1.9), c.Y(PZ + 3.05), '1', 'GROUND FLOOR PLUMBING & DRAINAGE', 'SCALE 1:100', 460);
  return {
    id: 'p101',
    number: 'P-101',
    title: 'Plumbing & Drainage',
    discipline: 'mep',
    disciplineName: 'Plumbing',
    scale: '1:100',
    description: 'Cold and hot water distribution, soil stacks, below-slab drainage and fixtures.',
    body: c.toString(),
  };
}

function mepElectrical(): SheetData {
  const c = mepBase('e101');
  const E = B.mep;
  // Cable tray
  c.rect('systems', c.X(0.4), c.Y(4.15), (W - 0.6) * c.s, 0.2 * c.s, 'k-tray');
  c.tag('text', c.X(5.2), c.Y(4.25) - 12, 'CABLE TRAY 150 @ +2.850', 't-elec', 150);
  // Distribution board
  const p = E.panel;
  c.rect('systems', c.X(p.x) - 10, c.Y(p.z - 0.3), 12, 0.6 * c.s, 'k-db');
  c.tag('text', c.X(W + 0.75), c.Y(p.z) + 4, 'DB-1', 't-bold', 40);
  c.path('systems', `M${c.X(p.x) - 10} ${c.Y(p.z)} L${c.X(16.2)} ${c.Y(p.z)} L${c.X(16.2)} ${c.Y(4.15)}`, 'k-homerun');

  // Circuits: link lights within each room, and switch → nearest light
  const rooms = B.levels[0].rooms;
  const roomOf = ([x, z]: V2) => rooms.findIndex((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
  const arc = (a: V2, b: V2) => {
    const [x1, y1] = [c.X(a[0]), c.Y(a[1])];
    const [x2, y2] = [c.X(b[0]), c.Y(b[1])];
    const mx = (x1 + x2) / 2 + (y2 - y1) * 0.2;
    const my = (y1 + y2) / 2 - (x2 - x1) * 0.2;
    c.path('systems', `M${n(x1)} ${n(y1)} Q${n(mx)} ${n(my)} ${n(x2)} ${n(y2)}`, 'k-circuit');
  };
  const lights = E.lights.L0;
  const byRoom = new Map<number, V2[]>();
  lights.forEach((l) => {
    const r = roomOf(l);
    if (!byRoom.has(r)) byRoom.set(r, []);
    byRoom.get(r)!.push(l);
  });
  for (const list of byRoom.values()) for (let i = 0; i < list.length - 1; i++) arc(list[i], list[i + 1]);
  for (const s of E.switches) {
    let best = lights[0];
    let bd = Infinity;
    for (const l of lights) {
      const dd = Math.hypot(l[0] - s[0], l[1] - s[1]);
      if (dd < bd) {
        bd = dd;
        best = l;
      }
    }
    arc(s, best);
  }
  for (const [x, z] of lights) {
    c.circle('systems', c.X(x), c.Y(z), 8, 'k-light');
    c.line('systems', c.X(x) - 6, c.Y(z) - 6, c.X(x) + 6, c.Y(z) + 6, 'k-light-x');
    c.line('systems', c.X(x) + 6, c.Y(z) - 6, c.X(x) - 6, c.Y(z) + 6, 'k-light-x');
  }
  for (const [x, z] of E.switches) {
    c.circle('systems', c.X(x), c.Y(z), 4, 'k-solid');
    c.line('systems', c.X(x), c.Y(z), c.X(x) + 8, c.Y(z) - 8, 'k-thin');
  }
  for (const [x, z] of E.sockets) {
    c.path('systems', `M${n(c.X(x) - 7)} ${n(c.Y(z))} A7 7 0 0 1 ${n(c.X(x) + 7)} ${n(c.Y(z))} Z`, 'k-socket');
    c.line('systems', c.X(x) - 3, c.Y(z) - 7, c.X(x) - 3, c.Y(z) - 11, 'k-thin');
    c.line('systems', c.X(x) + 3, c.Y(z) - 7, c.X(x) + 3, c.Y(z) - 11, 'k-thin');
  }
  c.tag('text', c.X(8.4) + 58, c.Y(6.6) + 22, 'L1 · 8W LED DOWNLIGHT', 't-sm', 140);

  c.legend(745, c.Y(PZ) + 80, [
    { sw: `<circle cx="18" cy="0" r="8" class="k-light"/><path d="M12 -6 L24 6 M24 -6 L12 6" class="k-light-x"/>`, label: 'LED DOWNLIGHT' },
    { sw: `<path d="M11 0 A7 7 0 0 1 25 0 Z" class="k-socket"/>`, label: 'DOUBLE SOCKET OUTLET' },
    { sw: `<circle cx="14" cy="0" r="4" class="k-solid"/><path d="M14 0 L22 -8" class="k-thin"/>`, label: 'LIGHT SWITCH' },
    { sw: swatch.line('k-circuit'), label: 'LIGHTING CIRCUIT' },
    { sw: swatch.box('k-tray'), label: 'CABLE TRAY' },
  ]);
  c.title(c.X(-1.9), c.Y(PZ + 3.05), '1', 'GROUND FLOOR LIGHTING & POWER', 'SCALE 1:100', 420);
  return {
    id: 'e101',
    number: 'E-101',
    title: 'Lighting & Power',
    discipline: 'mep',
    disciplineName: 'Electrical',
    scale: '1:100',
    description: 'Lighting layout, switching, socket outlets, cable tray and distribution board.',
    body: c.toString(),
  };
}

// ---------------------------------------------------------------------------

let cache: SheetData[] | null = null;

export function getSheets(): SheetData[] {
  cache ??= [archPlan(0), archPlan(1), archElevations(), strFoundation(), strFraming(), strDetails(), mepHvac(), mepPlumbing(), mepElectrical()];
  return cache;
}

export const disciplineLabels: Record<Discipline, string> = {
  arch: 'Architecture',
  str: 'Structure',
  mep: 'MEP',
};
