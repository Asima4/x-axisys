// Interactive 3D building viewer.
// Builds the sample building procedurally from src/lib/building.ts with separate
// Architecture / Structure / MEP layers, or loads an uploaded .glb model.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { building as B, type Facade, type V3 } from '../lib/building';

export type Mode = 'arch' | 'str' | 'mep' | 'all';
type Disc = 'arch' | 'str' | 'mep' | 'site';
const DISCS: Disc[] = ['arch', 'str', 'mep', 'site'];

// Opacity factor of each discipline per view mode.
const OPACITY: Record<Mode, Record<Disc, number>> = {
  arch: { arch: 1, str: 0, mep: 0, site: 1 },
  str: { arch: 0.06, str: 1, mep: 0, site: 0.35 },
  mep: { arch: 0.05, str: 0.1, mep: 1, site: 0.3 },
  all: { arch: 0.12, str: 1, mep: 1, site: 0.45 },
};
const EDGE_OPACITY: Record<Mode, number> = { arch: 0.55, str: 0.2, mep: 0.14, all: 0.2 };

const LEVELS = 4; // 0 foundations · 1 ground storey · 2 first storey · 3 roof
const EXPLODE = [-1.3, 0, 1.9, 3.8];

const W = B.width;
const D = B.depth;
const PZ = B.depth + B.porchDepth;
const CX = W / 2;
const CZ = PZ / 2;
const T = B.wall;
const SLAB_BOTTOM_1 = B.storey - B.slab; // underside of first-floor slab
const roofTop = (z: number) => B.roof.back + ((B.roof.front - B.roof.back) * z) / D;
const roofUnder = (z: number) => roofTop(z) - B.roof.thickness;

const levelOfY = (y: number) => (y < -0.05 ? 0 : y < SLAB_BOTTOM_1 - 0.01 ? 1 : y < roofUnder(0) - 0.35 ? 2 : 3);

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

type MatDef = { color: string; rough?: number; metal?: number; opacity?: number; emissive?: string; side?: THREE.Side };

function makeMaterials() {
  const make = (d: MatDef) => {
    const m = new THREE.MeshStandardMaterial({
      color: d.color,
      roughness: d.rough ?? 0.85,
      metalness: d.metal ?? 0,
      transparent: (d.opacity ?? 1) < 1,
      opacity: d.opacity ?? 1,
      side: d.side ?? THREE.FrontSide,
    });
    if (d.emissive) {
      m.emissive = new THREE.Color(d.emissive);
      m.emissiveIntensity = 1.4;
    }
    m.userData.baseOpacity = d.opacity ?? 1;
    return m;
  };
  return {
    arch: {
      wall: make({ color: '#f2f0eb' }),
      partition: make({ color: '#e7e3db' }),
      slab: make({ color: '#e9e6df' }),
      roof: make({ color: '#d6d3cb', rough: 0.95 }),
      fascia: make({ color: '#2a2f38', rough: 0.6 }),
      frame: make({ color: '#23272e', rough: 0.5, metal: 0.3 }),
      glass: make({ color: '#9cc3dc', rough: 0.05, metal: 0.2, opacity: 0.32, side: THREE.DoubleSide }),
      rail: make({ color: '#2a2f38', rough: 0.5, metal: 0.4 }),
      stair: make({ color: '#d9d0c1' }),
      furniture: make({ color: '#cbc3b5' }),
      dark: make({ color: '#3a3d44', rough: 0.6 }),
      post: make({ color: '#f2f0eb', rough: 0.6 }),
    },
    str: {
      steel: make({ color: '#3b6fd6', rough: 0.45, metal: 0.45 }),
      joist: make({ color: '#e8913a', rough: 0.55, metal: 0.3 }),
      concrete: make({ color: '#9ca2a9', rough: 0.95 }),
      brace: make({ color: '#e8383a', rough: 0.45, metal: 0.4 }),
      plate: make({ color: '#4a4f58', rough: 0.5, metal: 0.5 }),
    },
    mep: {
      supply: make({ color: '#4fc3f7', rough: 0.4, metal: 0.5 }),
      return: make({ color: '#9b7fe0', rough: 0.4, metal: 0.5 }),
      diffuser: make({ color: '#eef0f3', rough: 0.5 }),
      cold: make({ color: '#2f7cf6', rough: 0.35, metal: 0.3 }),
      hot: make({ color: '#e53935', rough: 0.35, metal: 0.3 }),
      waste: make({ color: '#7d8591', rough: 0.6 }),
      refrigerant: make({ color: '#d4a054', rough: 0.3, metal: 0.8 }),
      fixture: make({ color: '#f4f4f1', rough: 0.3 }),
      equipment: make({ color: '#bfc5ce', rough: 0.5, metal: 0.4 }),
      tray: make({ color: '#f5b700', rough: 0.5, metal: 0.3 }),
      light: make({ color: '#fff6d6', emissive: '#ffe9a8' }),
      panel: make({ color: '#8c929c', rough: 0.5, metal: 0.3 }),
    },
    site: {
      slab: make({ color: '#bdb8ad', rough: 0.95 }),
      deck: make({ color: '#b08a5a', rough: 0.8 }),
    },
  };
}

// ---------------------------------------------------------------------------
// Model builder
// ---------------------------------------------------------------------------

type Part = { mesh: THREE.Mesh; level: number; disc: Disc; edges: boolean };

class ModelBuilder {
  parts: Part[] = [];
  instanced: { mesh: THREE.InstancedMesh; level: number; disc: Disc }[] = [];
  M = makeMaterials();

  /** World position from plan coordinates. */
  w(x: number, y: number, z: number) {
    return new THREE.Vector3(x - CX, y, z - CZ);
  }

  add(geo: THREE.BufferGeometry, mat: THREE.Material, pos: THREE.Vector3, disc: Disc, level: number, edges = false, quat?: THREE.Quaternion) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    if (quat) mesh.quaternion.copy(quat);
    mesh.updateMatrix();
    this.parts.push({ mesh, level, disc, edges });
    return mesh;
  }

  /** Axis-aligned box from min/max plan coordinates. */
  box(disc: Disc, mat: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, edges = false, level?: number) {
    const sx = Math.max(Math.abs(x1 - x0), 0.001);
    const sy = Math.max(Math.abs(y1 - y0), 0.001);
    const sz = Math.max(Math.abs(z1 - z0), 0.001);
    return this.add(
      new THREE.BoxGeometry(sx, sy, sz),
      mat,
      this.w((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
      disc,
      level ?? levelOfY((y0 + y1) / 2),
      edges,
    );
  }

  /** Cylinder (pipe / round member) between two plan-space points. */
  rod(disc: Disc, mat: THREE.Material, a: V3, b: V3, radius: number, level?: number, radial = 10) {
    const va = this.w(...a);
    const vb = this.w(...b);
    const len = va.distanceTo(vb);
    if (len < 0.001) return;
    const geo = new THREE.CylinderGeometry(radius, radius, len, radial, 1, false);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    this.add(geo, mat, va.clone().add(vb).multiplyScalar(0.5), disc, level ?? levelOfY((a[1] + b[1]) / 2), false, quat);
  }

  /** Square hollow / solid member between two points. */
  bar(disc: Disc, mat: THREE.Material, a: V3, b: V3, size: number, level?: number) {
    const va = this.w(...a);
    const vb = this.w(...b);
    const len = va.distanceTo(vb);
    const geo = new THREE.BoxGeometry(size, len, size);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    this.add(geo, mat, va.clone().add(vb).multiplyScalar(0.5), disc, level ?? levelOfY((a[1] + b[1]) / 2), false, quat);
  }

  /** Wide-flange I-section between two points. */
  ibeam(mat: THREE.Material, a: V3, b: V3, depth: number, flange: number, level: number, webAxis: 'y' | 'x' = 'y') {
    const va = this.w(...a);
    const vb = this.w(...b);
    const len = va.distanceTo(vb);
    const tf = Math.max(depth * 0.07, 0.014);
    const tw = Math.max(depth * 0.045, 0.01);
    // Build along +X, depth along Y, flange along Z; then orient.
    const parts = [
      new THREE.BoxGeometry(len, tf, flange).translate(0, depth / 2 - tf / 2, 0),
      new THREE.BoxGeometry(len, tf, flange).translate(0, -depth / 2 + tf / 2, 0),
      new THREE.BoxGeometry(len, depth - tf * 2, tw),
    ];
    const geo = mergeGeometries(parts.map((p) => p.toNonIndexed()))!;
    const dir = vb.clone().sub(va).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    if (webAxis === 'x') {
      // Columns: rotate section so the web lies along plan X.
      const twist = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      quat.multiply(twist);
    }
    this.add(geo, mat, va.clone().add(vb).multiplyScalar(0.5), 'str', level, false, quat);
  }

  // ----- Architecture -----

  wall(facade: Facade, levelIndex: number) {
    const L = B.levels[levelIndex];
    const y0 = L.y;
    const along = facade === 'front' || facade === 'back' ? W : D;
    const topAt = (u: number): number => {
      if (levelIndex === 0) return SLAB_BOTTOM_1 - y0;
      if (facade === 'front') return roofUnder(D) - y0;
      if (facade === 'back') return roofUnder(0) - y0;
      return roofUnder(u) - y0; // side walls follow the roof slope (u = z)
    };

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(along, 0);
    shape.lineTo(along, topAt(along));
    shape.lineTo(0, topAt(0));
    shape.lineTo(0, 0);
    for (const o of L.openings[facade]) {
      // Holes must not touch the outline, so floor-level openings keep a 2 cm threshold (hidden by the frame).
      const sill = Math.max(o.sill, 0.02);
      const hole = new THREE.Path();
      hole.moveTo(o.from, sill);
      hole.lineTo(o.to, sill);
      hole.lineTo(o.to, o.head);
      hole.lineTo(o.from, o.head);
      hole.lineTo(o.from, sill);
      shape.holes.push(hole);
    }

    const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    geo.translate(0, 0, -T / 2);
    let pos: THREE.Vector3;
    let quat: THREE.Quaternion | undefined;
    if (facade === 'front' || facade === 'back') {
      pos = this.w(0, y0, facade === 'front' ? D : 0);
    } else {
      quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
      pos = this.w(facade === 'left' ? 0 : W, y0, 0);
    }
    this.add(geo, this.M.arch.wall, pos, 'arch', levelIndex + 1, true, quat);

    for (const o of L.openings[facade]) this.glazing(facade, y0, o.from, o.to, o.sill, o.head, o.kind, levelIndex + 1);
  }

  glazing(facade: Facade, y0: number, from: number, to: number, sill: number, head: number, kind: string, level: number) {
    const f = 0.05; // frame section
    const toPlan = (u: number): [number, number] =>
      facade === 'front' ? [u, D] : facade === 'back' ? [u, 0] : facade === 'left' ? [0, u] : [W, u];
    const alongX = facade === 'front' || facade === 'back';
    const seg = (u0: number, u1: number, ya: number, yb: number, thick: number, mat: THREE.Material) => {
      const [ax, az] = toPlan(u0);
      const [bx, bz] = toPlan(u1);
      if (alongX) this.box('arch', mat, ax, y0 + ya, az - thick / 2, bx, y0 + yb, bz + thick / 2, false, level);
      else this.box('arch', mat, ax - thick / 2, y0 + ya, az, bx + thick / 2, y0 + yb, bz, false, level);
    };
    const s = Math.max(sill, 0);
    // Glass
    seg(from, to, s, head, 0.02, this.M.arch.glass);
    // Frame
    seg(from, to, head - f, head, 0.1, this.M.arch.frame);
    seg(from, to, s, s + f, 0.1, this.M.arch.frame);
    seg(from, from + f, s, head, 0.1, this.M.arch.frame);
    seg(to - f, to, s, head, 0.1, this.M.arch.frame);
    // Mullions
    const panes = kind === 'slider' ? Math.max(2, Math.round((to - from) / 1.1)) : Math.max(1, Math.round((to - from) / 1.3));
    for (let i = 1; i < panes; i++) {
      const u = from + ((to - from) * i) / panes;
      seg(u - f / 2, u + f / 2, s, head, 0.09, this.M.arch.frame);
    }
    if (kind === 'window' && head - s > 1.2) seg(from, to, s + (head - s) * 0.72, s + (head - s) * 0.72 + f * 0.8, 0.09, this.M.arch.frame);
  }

  partitions() {
    const t = 0.1;
    B.levels.forEach((L, li) => {
      const top = li === 0 ? SLAB_BOTTOM_1 : Math.min(roofUnder(0), roofUnder(D)) ;
      for (const p of L.partitions) {
        const horizontal = p.a[1] === p.b[1];
        const start = horizontal ? Math.min(p.a[0], p.b[0]) : Math.min(p.a[1], p.b[1]);
        const end = horizontal ? Math.max(p.a[0], p.b[0]) : Math.max(p.a[1], p.b[1]);
        const gaps = (p.doors ?? []).map((d) => [d.at - d.width / 2, d.at + d.width / 2]).sort((a, b) => a[0] - b[0]);
        let cur = start;
        const segs: [number, number][] = [];
        for (const [g0, g1] of gaps) {
          if (g0 > cur) segs.push([cur, g0]);
          cur = g1;
        }
        if (cur < end) segs.push([cur, end]);
        for (const [s0, s1] of segs) {
          if (horizontal) this.box('arch', this.M.arch.partition, s0, L.y, p.a[1] - t / 2, s1, top, p.a[1] + t / 2, true, li + 1);
          else this.box('arch', this.M.arch.partition, p.a[0] - t / 2, L.y, s0, p.a[0] + t / 2, top, s1, true, li + 1);
        }
        // Lintels over doors
        for (const [g0, g1] of gaps) {
          if (horizontal) this.box('arch', this.M.arch.partition, g0, L.y + 2.1, p.a[1] - t / 2, g1, top, p.a[1] + t / 2, true, li + 1);
          else this.box('arch', this.M.arch.partition, p.a[0] - t / 2, L.y + 2.1, g0, p.a[0] + t / 2, top, g1, true, li + 1);
        }
      }
    });
  }

  architecture() {
    const M = this.M.arch;
    // Ground slab & porch deck (site)
    this.box('site', this.M.site.slab, -0.15, -0.3, -0.15, W + 0.15, 0, D + 0.15, true, 1);
    this.box('site', this.M.site.deck, -0.4, -0.12, D + 0.15, W + 0.4, -0.02, PZ + 0.5, true, 1);

    for (const f of ['front', 'back', 'left', 'right'] as Facade[]) {
      this.wall(f, 0);
      this.wall(f, 1);
    }
    this.partitions();

    // First-floor slab + balcony (leaves the stair void open)
    this.box('arch', M.slab, -0.12, SLAB_BOTTOM_1, 1.5, W + 0.12, B.storey, PZ + 0.1, true, 2);
    this.box('arch', M.slab, -0.12, SLAB_BOTTOM_1, -0.12, 12.6, B.storey, 1.5, true, 2);

    // Roof (sloped slab covering house + balcony) and fascia
    const o = B.roof.overhang;
    const z0 = -o;
    const z1 = PZ + 0.35;
    const len = Math.hypot(z1 - z0, roofTop(z1) - roofTop(z0));
    const angle = Math.atan2(roofTop(z1) - roofTop(z0), z1 - z0);
    const roofGeo = new THREE.BoxGeometry(W + o * 2, B.roof.thickness, len);
    const roofQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -angle);
    const zm = (z0 + z1) / 2;
    this.add(roofGeo, M.roof, this.w(W / 2, roofTop(zm) - B.roof.thickness / 2, zm), 'arch', 3, true, roofQuat);
    const fasciaGeo = new THREE.BoxGeometry(W + o * 2 + 0.06, B.roof.thickness + 0.08, 0.06);
    this.add(fasciaGeo, M.fascia, this.w(W / 2, roofTop(z1) - B.roof.thickness / 2, z1 + 0.03), 'arch', 3, true);
    this.add(fasciaGeo.clone(), M.fascia, this.w(W / 2, roofTop(z0) - B.roof.thickness / 2, z0 - 0.03), 'arch', 3, true);
    for (const x of [-o - 0.03, W + o + 0.03]) {
      const g = new THREE.BoxGeometry(0.06, B.roof.thickness + 0.08, len + 0.06);
      this.add(g, M.fascia, this.w(x, roofTop(zm) - B.roof.thickness / 2, zm), 'arch', 3, true, roofQuat);
    }

    // Porch / balcony posts (architectural casing)
    for (const g of B.grids.x) {
      this.box('arch', M.post, g.v - 0.08, 0, PZ - 0.08, g.v + 0.08, SLAB_BOTTOM_1, PZ + 0.08, true, 1);
      this.box('arch', M.post, g.v - 0.07, B.storey, PZ - 0.07, g.v + 0.07, roofUnder(PZ), PZ + 0.07, true, 2);
    }

    // Balcony balustrade
    const railY = B.storey + 1.05;
    const zr = PZ - 0.04;
    this.box('arch', M.rail, 0, railY, zr - 0.03, W, railY + 0.05, zr + 0.03, false, 2);
    this.box('arch', M.rail, 0, B.storey + 0.1, zr - 0.02, W, B.storey + 0.14, zr + 0.02, false, 2);
    for (const x of [0.04, W - 0.04]) {
      this.box('arch', M.rail, x - 0.03, railY, D, x + 0.03, railY + 0.05, PZ, false, 2);
    }
    const balusters: THREE.Matrix4[] = [];
    for (let x = 0.1; x < W; x += 0.13) balusters.push(new THREE.Matrix4().makeTranslation(x - CX, B.storey + 0.6, zr - CZ));
    for (const x of [0.04, W - 0.04]) for (let z = D + 0.12; z < PZ; z += 0.13) balusters.push(new THREE.Matrix4().makeTranslation(x - CX, B.storey + 0.6, z - CZ));
    const bal = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.95, 0.018), M.rail, balusters.length);
    balusters.forEach((m, i) => bal.setMatrixAt(i, m));
    this.instanced.push({ mesh: bal, level: 2, disc: 'arch' });

    // Stair (rises from x1 towards x0)
    const s = B.stair;
    const going = (s.x1 - s.x0) / s.risers;
    const riser = B.storey / s.risers;
    for (let i = 0; i < s.risers; i++) {
      const xa = s.x1 - (i + 1) * going;
      const xb = s.x1 - i * going;
      this.box('arch', M.stair, xa, (i + 1) * riser - 0.05, s.z0, xb, (i + 1) * riser, s.z1, true, 1);
    }
    this.bar('arch', M.dark, [s.x1, 0.2, s.z1 + 0.02], [s.x0, B.storey + 0.2, s.z1 + 0.02], 0.05, 1);
    this.box('arch', M.rail, 12.6, B.storey + 1.0, 1.48, W, B.storey + 1.04, 1.52, false, 2);

    // Furniture
    const furn = (items: (typeof B.furniture)['L0'], y: number, level: number) => {
      for (const f of items) {
        const x0 = f.x - f.w / 2;
        const x1 = f.x + f.w / 2;
        const zz0 = f.z - f.d / 2;
        const zz1 = f.z + f.d / 2;
        if (f.type === 'bed') {
          this.box('arch', M.furniture, x0, y, zz0, x1, y + 0.45, zz1, true, level);
          this.box('arch', M.dark, x0, y, zz0 - 0.08, x1, y + 0.95, zz0, false, level);
        } else if (f.type === 'island' || f.type === 'counter') {
          this.box('arch', M.dark, x0, y, zz0, x1, y + 0.86, zz1, true, level);
          this.box('arch', M.slab, x0 - 0.02, y + 0.86, zz0 - 0.02, x1 + 0.02, y + 0.9, zz1 + 0.02, false, level);
        } else if (f.type === 'sofa') {
          this.box('arch', M.furniture, x0, y, zz0, x1, y + 0.42, zz1, true, level);
          this.box('arch', M.furniture, x0, y, zz0, x1, y + 0.8, zz0 + 0.22, true, level);
        } else {
          this.box('arch', M.dark, x0, y + 0.72, zz0, x1, y + 0.76, zz1, false, level);
          this.box('arch', M.dark, f.x - 0.06, y, f.z - 0.06, f.x + 0.06, y + 0.72, f.z + 0.06, false, level);
        }
      }
    };
    furn(B.furniture.L0, 0, 1);
    furn(B.furniture.L1, B.storey, 2);
  }

  // ----- Structure -----

  structure() {
    const M = this.M.str;
    const S = B.structure;

    // Footings, pedestals, base plates
    for (const f of S.footings) {
      const h = f.size / 2;
      this.box('str', M.concrete, f.x - h, -1.35, f.z - h, f.x + h, -0.9, f.z + h, false, 0);
      this.box('str', M.concrete, f.x - 0.25, -0.9, f.z - 0.25, f.x + 0.25, -0.32, f.z + 0.25, false, 0);
      this.box('str', M.plate, f.x - 0.2, -0.32, f.z - 0.2, f.x + 0.2, -0.29, f.z + 0.2, false, 0);
    }
    // Strip footings under perimeter walls
    const sw = S.strip.width / 2;
    this.box('str', M.concrete, 0, -0.95, -sw, W, -0.55, sw, false, 0);
    this.box('str', M.concrete, 0, -0.95, D - sw, W, -0.55, D + sw, false, 0);
    this.box('str', M.concrete, -sw, -0.95, 0, sw, -0.55, D, false, 0);
    this.box('str', M.concrete, W - sw, -0.95, 0, W + sw, -0.55, D, false, 0);

    // Columns
    for (const c of S.columns) {
      if (c.z === PZ) {
        this.bar('str', M.steel, [c.x, -0.29, c.z], [c.x, SLAB_BOTTOM_1, c.z], 0.1, 1);
        this.bar('str', M.steel, [c.x, B.storey, c.z], [c.x, roofUnder(c.z), c.z], 0.1, 2);
      } else {
        this.ibeam(M.steel, [c.x, -0.29, c.z], [c.x, SLAB_BOTTOM_1, c.z], 0.21, 0.2, 1, 'x');
        this.ibeam(M.steel, [c.x, B.storey, c.z], [c.x, roofUnder(c.z) - 0.02, c.z], 0.21, 0.2, 2, 'x');
      }
    }

    const depthOf = (size: string) => Number(size.match(/W(\d+)/)?.[1] ?? 8) * 0.0254;

    // First-floor framing (level 2 = moves with the first floor when exploded)
    for (const bx of S.beamsX) {
      const d = depthOf(bx.size);
      this.ibeam(M.steel, [0, SLAB_BOTTOM_1 - d / 2, bx.z], [W, SLAB_BOTTOM_1 - d / 2, bx.z], d, 0.17, 2);
      const dr = Math.min(d, 0.3);
      this.ibeam(M.steel, [0, roofUnder(bx.z) - dr / 2, bx.z], [W, roofUnder(bx.z) - dr / 2, bx.z], dr, 0.15, 3);
    }
    for (const bz of S.beamsZ) {
      const d = depthOf(bz.size);
      this.ibeam(M.steel, [bz.x, SLAB_BOTTOM_1 - d / 2, 0], [bz.x, SLAB_BOTTOM_1 - d / 2, PZ], d, 0.15, 2);
      this.ibeam(M.steel, [bz.x, roofUnder(0) - d / 2, 0], [bz.x, roofUnder(PZ) - d / 2, PZ], d, 0.15, 3);
    }

    // Joists (instanced): span along z between primary beams, skip stair void
    const joistGeo = new THREE.BoxGeometry(0.045, 0.2, 1);
    const floorJ: THREE.Matrix4[] = [];
    const roofJ: THREE.Matrix4[] = [];
    const spans: [number, number][] = [
      [0, 4.4],
      [4.4, 8.8],
      [8.8, PZ],
    ];
    const roofAngle = Math.atan2(B.roof.front - B.roof.back, D);
    for (let x = S.joist.spacing; x < W - 0.05; x += S.joist.spacing) {
      if (B.grids.x.some((g) => Math.abs(g.v - x) < 0.15)) continue;
      for (const [za, zb] of spans) {
        const len = zb - za - 0.1;
        const zc = (za + zb) / 2;
        if (!(x > 12.6 && za === 0)) {
          floorJ.push(
            new THREE.Matrix4().compose(new THREE.Vector3(x - CX, SLAB_BOTTOM_1 - 0.1, zc - CZ), new THREE.Quaternion(), new THREE.Vector3(1, 1, len)),
          );
        }
        roofJ.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(x - CX, roofUnder(zc) - 0.1, zc - CZ),
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -roofAngle),
            new THREE.Vector3(1, 1, len),
          ),
        );
      }
    }
    for (const [list, level] of [
      [floorJ, 2],
      [roofJ, 3],
    ] as const) {
      const inst = new THREE.InstancedMesh(joistGeo, M.joist, list.length);
      list.forEach((m, i) => inst.setMatrixAt(i, m));
      this.instanced.push({ mesh: inst, level, disc: 'str' });
    }

    // X-bracing on grid A
    const br = S.bracing;
    for (const [ya, yb, level] of [
      [0, SLAB_BOTTOM_1 - 0.3, 1],
      [B.storey, roofUnder(0) - 0.3, 2],
    ] as const) {
      this.bar('str', M.brace, [br.x, ya + 0.1, br.z0 + 0.15], [br.x, yb, br.z1 - 0.15], 0.07, level);
      this.bar('str', M.brace, [br.x, ya + 0.1, br.z1 - 0.15], [br.x, yb, br.z0 + 0.15], 0.07, level);
    }
  }

  // ----- MEP -----

  mep() {
    const M = this.M.mep;
    const E = B.mep;

    // Ductwork
    const ductCentre = (level: number, h: number) => (level === 0 ? SLAB_BOTTOM_1 - 0.42 - h / 2 : roofUnder(0) - 0.42 - h / 2);
    for (const d of E.ducts) {
      const y = ductCentre(d.level, d.h) + (d.kind === 'return' ? -0.05 : 0);
      const mat = d.kind === 'supply' ? M.supply : M.return;
      for (let i = 0; i < d.path.length - 1; i++) {
        const [ax, az] = d.path[i];
        const [bx, bz] = d.path[i + 1];
        const hw = d.w / 2;
        if (az === bz) this.box('mep', mat, Math.min(ax, bx) - hw, y - d.h / 2, az - hw, Math.max(ax, bx) + hw, y + d.h / 2, az + hw, false, d.level + 1);
        else this.box('mep', mat, ax - hw, y - d.h / 2, Math.min(az, bz) - hw, ax + hw, y + d.h / 2, Math.max(az, bz) + hw, false, d.level + 1);
      }
    }
    for (const g of E.diffusers) {
      const y = ductCentre(g.level, 0.25);
      this.box('mep', M.supply, g.x - 0.12, y - 0.32, g.z - 0.12, g.x + 0.12, y - 0.1, g.z + 0.12, false, g.level + 1);
      this.box('mep', M.diffuser, g.x - 0.28, y - 0.38, g.z - 0.28, g.x + 0.28, y - 0.32, g.z + 0.28, false, g.level + 1);
    }
    for (const g of E.returnGrilles) {
      const y = ductCentre(g.level, 0.25) - 0.05;
      this.box('mep', M.return, g.x - 0.35, y - 0.4, g.z - 0.25, g.x + 0.35, y - 0.32, g.z + 0.25, false, g.level + 1);
    }

    // Equipment
    const a = E.ahu;
    this.box('mep', M.equipment, a.x - a.w / 2, a.y, a.z - a.d / 2, a.x + a.w / 2, a.y + a.h, a.z + a.d / 2, false, 1);
    const c = E.condenser;
    const cy = roofTop(c.z);
    this.box('mep', M.equipment, c.x - c.w / 2, cy, c.z - c.d / 2, c.x + c.w / 2, cy + c.h, c.z + c.d / 2, false, 3);
    this.add(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 24), M.panel, this.w(c.x, cy + c.h + 0.02, c.z), 'mep', 3);
    this.box('mep', M.panel, E.panel.x - 0.05, E.panel.y, E.panel.z - 0.3, E.panel.x + 0.05, E.panel.y + 0.8, E.panel.z + 0.3, false, 1);

    // Pipework (split at storey boundaries so exploded views stay tidy)
    const pipeMat = { cold: M.cold, hot: M.hot, waste: M.waste, refrigerant: M.refrigerant };
    const bounds = [-0.05, SLAB_BOTTOM_1 - 0.01, roofUnder(0) - 0.35];
    for (const p of E.pipes) {
      for (let i = 0; i < p.pts.length - 1; i++) {
        const A = p.pts[i];
        const Bp = p.pts[i + 1];
        const cuts = [A[1], ...bounds.filter((b) => (b - A[1]) * (b - Bp[1]) < 0), Bp[1]].sort((m, n) => (A[1] < Bp[1] ? m - n : n - m));
        for (let k = 0; k < cuts.length - 1; k++) {
          const t0 = A[1] === Bp[1] ? 0 : (cuts[k] - A[1]) / (Bp[1] - A[1]);
          const t1 = A[1] === Bp[1] ? 1 : (cuts[k + 1] - A[1]) / (Bp[1] - A[1]);
          const lerp = (t: number): V3 => [A[0] + (Bp[0] - A[0]) * t, A[1] + (Bp[1] - A[1]) * t, A[2] + (Bp[2] - A[2]) * t];
          const pa = lerp(t0);
          const pb = lerp(t1);
          this.rod('mep', pipeMat[p.kind], pa, pb, p.d / 2, levelOfY((pa[1] + pb[1]) / 2), 8);
        }
        if (i > 0) this.add(new THREE.SphereGeometry(p.d * 0.62, 10, 8), pipeMat[p.kind], this.w(...A), 'mep', levelOfY(A[1]));
      }
    }

    // Fixtures
    for (const f of E.fixtures) {
      const y = f.level === 0 ? 0 : B.storey;
      const L = f.level + 1;
      switch (f.type) {
        case 'wc':
          this.box('mep', M.fixture, f.x - 0.2, y, f.z - 0.28, f.x + 0.2, y + 0.42, f.z + 0.28, false, L);
          this.box('mep', M.fixture, f.x - 0.22, y + 0.42, f.z - 0.3, f.x + 0.22, y + 0.85, f.z - 0.12, false, L);
          break;
        case 'basin':
          this.box('mep', M.fixture, f.x - 0.25, y + 0.78, f.z - 0.3, f.x + 0.25, y + 0.9, f.z + 0.3, false, L);
          break;
        case 'shower':
          this.box('mep', M.fixture, f.x - 0.45, y, f.z - 0.45, f.x + 0.45, y + 0.06, f.z + 0.45, false, L);
          this.rod('mep', M.cold, [f.x - 0.4, y + 0.06, f.z - 0.4], [f.x - 0.4, y + 2.0, f.z - 0.4], 0.015, L);
          break;
        case 'washer':
          this.box('mep', M.equipment, f.x - 0.3, y, f.z - 0.3, f.x + 0.3, y + 0.85, f.z + 0.3, false, L);
          break;
        case 'heater':
          this.add(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 20), M.equipment, this.w(f.x, y + 0.2 + 0.75, f.z), 'mep', L);
          break;
        case 'sink':
          break;
      }
    }

    // Electrical: cable trays, lights, panel feed
    const trayY = [SLAB_BOTTOM_1 - 0.3, roofUnder(0) - 0.3];
    [0, 1].forEach((li) => {
      this.box('mep', M.tray, 0.4, trayY[li] - 0.03, 4.15, W - 0.2, trayY[li] + 0.03, 4.35, false, li + 1);
    });
    this.box('mep', M.tray, E.panel.x - 0.12, E.panel.y + 0.8, 4.15 - 1.5, E.panel.x - 0.02, trayY[0], 4.35 - 1.5, false, 1);
    this.box('mep', M.tray, E.panel.x - 0.12, trayY[0] - 0.03, 2.65, E.panel.x - 0.02, trayY[0] + 0.03, 4.35, false, 1);
    const lightGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 14);
    E.lights.L0.forEach(([x, z]) => this.add(lightGeo.clone(), M.light, this.w(x, SLAB_BOTTOM_1 - 0.02, z), 'mep', 1));
    E.lights.L1.forEach(([x, z]) => this.add(lightGeo.clone(), M.light, this.w(x, roofUnder(z) - 0.02, z), 'mep', 2));
  }

  /** Merge parts into a few draw calls per level/discipline/material, with merged edge lines. */
  assemble(): { root: THREE.Group; levels: THREE.Group[]; discGroups: Record<Disc, THREE.Group[]>; edgeMats: THREE.LineBasicMaterial[] } {
    const root = new THREE.Group();
    const levels = Array.from({ length: LEVELS }, () => new THREE.Group());
    levels.forEach((g) => root.add(g));
    const discGroups = Object.fromEntries(DISCS.map((d) => [d, levels.map((lg) => {
      const g = new THREE.Group();
      g.name = d;
      lg.add(g);
      return g;
    })])) as Record<Disc, THREE.Group[]>;

    const edgeMat = new THREE.LineBasicMaterial({ color: '#1a1d23', transparent: true, opacity: 0.55 });
    const siteEdgeMat = new THREE.LineBasicMaterial({ color: '#1a1d23', transparent: true, opacity: 0.35 });

    for (let level = 0; level < LEVELS; level++) {
      for (const disc of DISCS) {
        const here = this.parts.filter((p) => p.level === level && p.disc === disc);
        if (!here.length) continue;
        const byMat = new Map<THREE.Material, THREE.BufferGeometry[]>();
        const edgeGeos: THREE.BufferGeometry[] = [];
        for (const p of here) {
          const g = p.mesh.geometry.index ? p.mesh.geometry.toNonIndexed() : p.mesh.geometry.clone();
          g.clearGroups();
          g.applyMatrix4(p.mesh.matrix);
          for (const key of Object.keys(g.attributes)) if (!['position', 'normal'].includes(key)) g.deleteAttribute(key);
          const mat = p.mesh.material as THREE.Material;
          if (!byMat.has(mat)) byMat.set(mat, []);
          byMat.get(mat)!.push(g);
          if (p.edges) edgeGeos.push(new THREE.EdgesGeometry(p.mesh.geometry, 25).applyMatrix4(p.mesh.matrix));
        }
        for (const [mat, geos] of byMat) {
          const merged = mergeGeometries(geos)!;
          const mesh = new THREE.Mesh(merged, mat);
          const isGlass = (mat as THREE.MeshStandardMaterial).userData.baseOpacity < 1;
          mesh.castShadow = !isGlass && disc !== 'site';
          mesh.userData.canCast = mesh.castShadow;
          mesh.receiveShadow = true;
          discGroups[disc][level].add(mesh);
        }
        if (edgeGeos.length) {
          const lines = new THREE.LineSegments(mergeGeometries(edgeGeos)!, disc === 'site' ? siteEdgeMat : edgeMat);
          lines.userData.isEdge = true;
          discGroups[disc][level].add(lines);
        }
      }
    }
    for (const inst of this.instanced) {
      inst.mesh.castShadow = true;
      inst.mesh.userData.canCast = true;
      inst.mesh.instanceMatrix.needsUpdate = true;
      discGroups[inst.disc][inst.level].add(inst.mesh);
    }
    return { root, levels, discGroups, edgeMats: [edgeMat, siteEdgeMat] };
  }
}

// ---------------------------------------------------------------------------
// Annotation labels (HTML overlay)
// ---------------------------------------------------------------------------

const LABELS: Record<Mode, { p: V3; t: string }[]> = {
  arch: [
    { p: [W * 0.55, roofTop(PZ * 0.5) + 0.2, PZ * 0.45], t: 'Mono-pitch roof' },
    { p: [2.1, 1.4, D], t: 'Full-height sliding glazing' },
    { p: [W - 2, B.storey + 1.1, PZ], t: '1.8 m balcony' },
  ],
  str: [
    { p: [6.3, SLAB_BOTTOM_1 - 0.2, 4.4], t: 'W14×34 primary beam' },
    { p: [0, 1.6, 2.2], t: 'X-bracing · grid A' },
    { p: [8.4, -1.1, 4.4], t: 'Pad footing F1' },
    { p: [10.5, SLAB_BOTTOM_1 - 0.1, 6.6], t: 'Joists @ 600 c/c' },
  ],
  mep: [
    { p: [5.5, SLAB_BOTTOM_1 - 0.55, 3.0], t: 'Supply duct 500×300' },
    { p: [14.6, roofTop(1.6) + 1.1, 1.6], t: 'Rooftop condenser' },
    { p: [14.55, 5.0, 1.7], t: 'Soil & vent stack' },
    { p: [8.2, 2.55, 0.85], t: 'Hot water main' },
  ],
  all: [
    { p: [8.4, SLAB_BOTTOM_1 - 0.45, 3.0], t: 'Coordinated ceiling zone' },
    { p: [14.55, 2.0, 1.7], t: 'Services clear of steel' },
  ],
};

// ---------------------------------------------------------------------------
// Viewer
// ---------------------------------------------------------------------------

export type ViewerOptions = {
  mode?: Mode;
  autoRotate?: boolean;
  autoCycle?: boolean;
  zoom?: boolean;
  labels?: boolean;
  modelUrl?: string;
  onModeChange?: (mode: Mode) => void;
  onReady?: () => void;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export function mountViewer(container: HTMLElement, opts: ViewerOptions = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'viewer3d__canvas';
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400);
  const home = new THREE.Vector3(20, 12.5, 23);
  camera.position.set(home.x * 1.55, home.y * 1.5, home.z * 1.55);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2.4, 0.4);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = !!opts.zoom;
  controls.minDistance = 12;
  controls.maxDistance = 70;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = !reduced && opts.autoRotate !== false;
  controls.autoRotateSpeed = 0.55;
  // Let vertical swipes scroll the page on touch devices; horizontal drags rotate.
  renderer.domElement.style.touchAction = opts.zoom ? 'none' : 'pan-y';

  // Lighting
  scene.add(new THREE.HemisphereLight('#e6eeff', '#23262d', 1.35));
  const sun = new THREE.DirectionalLight('#ffffff', 2.6);
  sun.position.set(16, 28, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#9ec2ff', 0.6);
  fill.position.set(-20, 10, -14);
  scene.add(fill);

  scene.fog = new THREE.Fog('#0d0f13', 34, 70);

  // Ground: shadow catcher + drawing grid
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.3;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(80, 80, '#3a414d', '#252a33');
  grid.position.y = -0.31;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.55;
  scene.add(grid);

  // Model
  let levels: THREE.Group[] = [];
  let discGroups: Record<Disc, THREE.Group[]> | null = null;
  let edgeMats: THREE.LineBasicMaterial[] = [];
  const materials: Record<Disc, THREE.MeshStandardMaterial[]> = { arch: [], str: [], mep: [], site: [] };

  if (opts.modelUrl) {
    import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      new GLTFLoader().load(opts.modelUrl!, (gltf) => {
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const scale = 18 / Math.max(size.x, size.z);
        obj.scale.setScalar(scale);
        const b2 = new THREE.Box3().setFromObject(obj);
        obj.position.sub(new THREE.Vector3((b2.min.x + b2.max.x) / 2, b2.min.y + 0.3, (b2.min.z + b2.max.z) / 2));
        obj.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
        });
        scene.add(obj);
        opts.onReady?.();
      });
    });
  } else {
    const builder = new ModelBuilder();
    builder.architecture();
    builder.structure();
    builder.mep();
    const assembled = builder.assemble();
    scene.add(assembled.root);
    levels = assembled.levels;
    discGroups = assembled.discGroups;
    edgeMats = assembled.edgeMats;
    for (const disc of DISCS) materials[disc] = Object.values(builder.M[disc]);
  }

  // Labels
  const labelLayer = document.createElement('div');
  labelLayer.className = 'viewer3d__labels';
  container.append(labelLayer);
  const labelEls = new Map<Mode, { el: HTMLElement; p: V3 }[]>();
  if (opts.labels !== false && !opts.modelUrl) {
    (Object.keys(LABELS) as Mode[]).forEach((m) => {
      labelEls.set(
        m,
        LABELS[m].map((l) => {
          const el = document.createElement('span');
          el.className = 'viewer3d__label';
          el.textContent = l.t;
          labelLayer.append(el);
          return { el, p: l.p };
        }),
      );
    });
  }

  // State & animation
  let mode: Mode = opts.mode ?? 'arch';
  const factor: Record<Disc, number> = { ...OPACITY[mode] };
  let fromFactor = { ...factor };
  let edgeFactor = EDGE_OPACITY[mode];
  let fromEdge = edgeFactor;
  let modeT = 1;
  let explode = 0;
  let explodeFrom = 0;
  let explodeTo = 0;
  let explodeT = 1;
  let introT = reduced ? 1 : 0;
  let timeScale = 1; // capture mode makes transitions instant
  const introFrom = camera.position.clone();

  const applyFactors = () => {
    if (!discGroups) return;
    for (const disc of DISCS) {
      const f = factor[disc];
      for (const m of materials[disc]) {
        const base = m.userData.baseOpacity ?? 1;
        const transparent = base * f < 0.999;
        if (m.transparent !== transparent) {
          m.transparent = transparent;
          m.needsUpdate = true; // switching blending requires a shader refresh
        }
        m.opacity = base * f;
        m.depthWrite = f > 0.6 && base >= 1;
      }
      discGroups[disc].forEach((g) => {
        g.visible = f > 0.01;
        // Ghosted layers should not darken the scene with full shadows.
        g.children.forEach((o) => (o.castShadow = !!o.userData.canCast && f > 0.5));
      });
    }
    edgeMats[0].opacity = edgeFactor;
    edgeMats[1].opacity = edgeFactor * 0.6;
  };
  applyFactors();

  const setMode = (next: Mode, fromUser = false) => {
    if (fromUser) stopCycle();
    if (next === mode) return;
    mode = next;
    fromFactor = { ...factor };
    fromEdge = edgeFactor;
    modeT = 0;
    opts.onModeChange?.(mode);
  };

  const setExploded = (on: boolean) => {
    explodeFrom = explode;
    explodeTo = on ? 1 : 0;
    explodeT = 0;
  };

  let cycleTimer: number | undefined;
  const order: Mode[] = ['arch', 'str', 'mep', 'all'];
  const stopCycle = () => {
    if (cycleTimer) window.clearInterval(cycleTimer);
    cycleTimer = undefined;
  };
  if (opts.autoCycle && !reduced && !opts.modelUrl) {
    cycleTimer = window.setInterval(() => setMode(order[(order.indexOf(mode) + 1) % order.length]), 4200);
  }
  controls.addEventListener('start', () => {
    stopCycle();
    controls.autoRotate = false;
  });

  // Resize
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Pull the camera back on narrow/tall viewports so the whole building fits.
    camera.fov = camera.aspect < 1 ? 46 : camera.aspect < 1.3 ? 38 : 32;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Visibility-aware render loop
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
  io.observe(container);

  let activeCam: THREE.Camera = camera;
  const tmp = new THREE.Vector3();
  let last = performance.now();
  let raf = 0;
  let readyFired = false;

  const updateLabels = () => {
    if (!labelEls.size) return;
    const { width, height } = renderer.domElement.getBoundingClientRect();
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    for (const [m, list] of labelEls) {
      const show = m === mode && modeT >= 1 && explode < 0.01;
      const items = list
        .map((item) => {
          tmp.set(item.p[0] - CX, item.p[1], item.p[2] - CZ).project(camera);
          return { ...item, sx: ((tmp.x + 1) / 2) * width, sy: ((1 - tmp.y) / 2) * height, front: tmp.z < 1 };
        })
        .sort((a, b) => a.sy - b.sy);
      for (const it of items) {
        if (!show || !it.front) {
          it.el.classList.remove('is-on');
          continue;
        }
        const w = it.el.offsetWidth;
        const h = it.el.offsetHeight + 6;
        let x = Math.min(Math.max(it.sx, 8), width - w - 8);
        let y = Math.min(Math.max(it.sy, h), height - h);
        for (const p of placed) {
          if (x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y) y = p.y + p.h;
        }
        placed.push({ x, y, w, h });
        it.el.classList.add('is-on');
        it.el.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!visible || document.hidden) return;

    if (introT < 1) {
      introT = Math.min(1, introT + (dt * timeScale) / 1.8);
      camera.position.lerpVectors(introFrom, home, ease(introT));
    }
    if (modeT < 1) {
      modeT = Math.min(1, modeT + (dt * timeScale) / 0.75);
      const k = ease(modeT);
      for (const d of DISCS) factor[d] = fromFactor[d] + (OPACITY[mode][d] - fromFactor[d]) * k;
      edgeFactor = fromEdge + (EDGE_OPACITY[mode] - fromEdge) * k;
      applyFactors();
    }
    if (explodeT < 1) {
      explodeT = Math.min(1, explodeT + (dt * timeScale) / 0.9);
      const prev = explode;
      explode = explodeFrom + (explodeTo - explodeFrom) * ease(explodeT);
      levels.forEach((g, i) => (g.position.y = EXPLODE[i] * explode));
      // Keep the separated floors centred and in frame.
      const delta = explode - prev;
      controls.target.y += delta * 1.25;
      camera.position.sub(controls.target).multiplyScalar(1 + delta * 0.28).add(controls.target);
    }

    controls.update(dt);
    renderer.render(scene, activeCam);
    updateLabels();
    if (!readyFired) {
      readyFired = true;
      container.classList.add('is-ready');
      if (!opts.modelUrl) opts.onReady?.();
    }
  };
  raf = requestAnimationFrame(loop);

  const api = {
    setMode,
    setExploded,
    /** Capture helper: orthographic front elevation over a world rect (plan metres, y = height). */
    frontOrtho(x0: number, x1: number, y0: number, y1: number, background?: string) {
      const cam = new THREE.OrthographicCamera(-(x1 - x0) / 2, (x1 - x0) / 2, (y1 - y0) / 2, -(y1 - y0) / 2, 0.1, 200);
      cam.position.set((x0 + x1) / 2 - CX, (y0 + y1) / 2, 80);
      cam.lookAt((x0 + x1) / 2 - CX, (y0 + y1) / 2, 0);
      scene.fog = null;
      grid.visible = false;
      if (background) scene.background = new THREE.Color(background);
      renderer.toneMappingExposure = 1.4;
      activeCam = cam;
    },
    get mode() {
      return mode;
    },
    resetView() {
      introFrom.copy(camera.position);
      introT = 0;
      controls.target.set(0, 2.4, 0.4);
    },
    setAutoRotate(on: boolean) {
      controls.autoRotate = on && !reduced;
    },
    dispose() {
      cancelAnimationFrame(raf);
      stopCycle();
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      renderer.dispose();
    },
  };

  // Used by the render-capture script (?capture): fixed camera, no auto-rotation.
  if (new URLSearchParams(location.search).has('capture')) {
    controls.autoRotate = false;
    stopCycle();
    introT = 1;
    timeScale = 50;
    camera.position.copy(home);
    (window as unknown as { __viewer: typeof api }).__viewer = api;
  }
  return api;
}
