// Procedural light-frame (wood) house: every stud, plate, header, joist, rafter, truss and connector
// is generated from real lumber dimensions, then assembled piece by piece with an optional exploded view.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MEMBERS, type MemberId } from '../data/woodFrame';

type Shape = 'box' | 'cyl';
// k groups the plates of one physical connector (an H2.5A is three plates) so counts are per connector.
export type Piece = { c: MemberId; lvl: number; shape: Shape; pos: THREE.Vector3; size: THREE.Vector3; quat: THREE.Quaternion; t: number; k?: string };
type Opening = { at: number; w: number; type: 'door' | 'window' | 'garage' };
type WallOpts = {
  x0: number;
  z0: number;
  dir: 'x' | 'z';
  len: number;
  inward: 1 | -1;
  depth: number;
  y0: number;
  lvl: number;
  plate: MemberId;
  openings?: Opening[];
  sheath?: [number, number][];
  anchors?: boolean;
};

const V3 = THREE.Vector3;

// ----- lumber & layout (feet) -----
const T = 1.5 / 12;
const D4 = 3.5 / 12;
const D6 = 5.5 / 12;
const D8 = 7.25 / 12;
const D10 = 9.25 / 12;
const D12 = 11.25 / 12;
const PL = T;
const STUD = 104.625 / 12; // 9'-1 1/8" plate height
const WALL_H = PL + STUD + 2 * PL;
const SUB = 0.75 / 12;
const F2 = WALL_H + D10 + SUB;
const RB = F2 + WALL_H;
const OC = 16 / 12;
const HEAD = PL + 82.5 / 12;
const W = 32;
const DP = 24;
const PITCH = 0.5;
const PLUMB = D10 * Math.sqrt(1 + PITCH * PITCH);

const FRAMING = new Set<MemberId>(['stud', 'king', 'trimmer', 'header', 'cripple', 'roughSill']);
const EXPLODE_Y = [0, 2.4, 5.6, 8.6, 13];
const DUR = 0.035;
const BUILD_SECONDS = 15;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function buildPieces(): Piece[] {
  const pieces: Piece[] = [];
  let K: string | undefined;
  let nextUnit = 0;
  const unit = (fn: () => void) => unitK(`u${nextUnit++}`, fn);
  function unitK(key: string, fn: () => void) {
    const prev = K;
    K = key;
    fn();
    K = prev;
  }
  const box = (c: MemberId, lvl: number, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    pieces.push({
      c,
      lvl,
      shape: 'box',
      pos: new V3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
      size: new V3(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)),
      quat: new THREE.Quaternion(),
      t: 0,
      k: K,
    });
  };
  const cyl = (c: MemberId, lvl: number, x: number, z: number, y0: number, y1: number, r: number) => {
    pieces.push({ c, lvl, shape: 'cyl', pos: new V3(x, (y0 + y1) / 2, z), size: new V3(r * 2, y1 - y0, r * 2), quat: new THREE.Quaternion(), t: 0, k: K });
  };
  const ALONG_X = new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), Math.PI / 2);
  const screwX = (c: MemberId, lvl: number, x0: number, x1: number, y: number, z: number, r: number) => {
    pieces.push({ c, lvl, shape: 'cyl', pos: new V3((x0 + x1) / 2, y, z), size: new V3(r * 2, Math.abs(x1 - x0), r * 2), quat: ALONG_X.clone(), t: 0, k: K });
  };
  // A member along a line in a vertical plane. `edge` = the line is the member's bottom edge, else its centreline.
  const beam = (c: MemberId, lvl: number, a: THREE.Vector3, b: THREE.Vector3, depth: number, thick: number, plane: 'xy' | 'zy', edge = true) => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    dir.normalize();
    const across = plane === 'xy' ? new V3(0, 0, 1) : new V3(1, 0, 0);
    const n = new V3().crossVectors(across, dir);
    if (n.y < 0) n.negate();
    const z = new V3().crossVectors(dir, n);
    const center = a.clone().add(b).multiplyScalar(0.5);
    if (edge) center.addScaledVector(n, depth / 2);
    const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, n, z));
    pieces.push({ c, lvl, shape: 'box', pos: center, size: new V3(len, depth, thick), quat, t: 0, k: K });
  };

  // ----- framed wall -----
  const wall = (o: WallOpts) => {
    const map = (c: MemberId, u0: number, u1: number, v0: number, v1: number, w0: number, w1: number, lvl = o.lvl) => {
      const ya = o.y0 + v0;
      const yb = o.y0 + v1;
      const wa = o.inward * w0;
      const wb = o.inward * w1;
      if (o.dir === 'x') box(c, lvl, o.x0 + u0, ya, o.z0 + wa, o.x0 + u1, yb, o.z0 + wb);
      else box(c, lvl, o.x0 + wa, ya, o.z0 + u0, o.x0 + wb, yb, o.z0 + u1);
    };
    const world = (u: number, w: number) => (o.dir === 'x' ? { x: o.x0 + u, z: o.z0 + o.inward * w } : { x: o.x0 + o.inward * w, z: o.z0 + u });
    const top = PL + STUD;
    const ops = (o.openings ?? []).map((op) => {
      const r0 = op.at - op.w / 2;
      const r1 = op.at + op.w / 2;
      return {
        ...op,
        r0,
        r1,
        hd: op.w > 7 ? D12 : op.w > 4.5 ? D10 : D8,
        head: op.type === 'garage' ? PL + 7 : HEAD,
        sill: op.type === 'window' ? PL + 3.1 : 0,
      };
    });
    const inOpening = (u0: number, u1: number) => ops.some((p) => u1 > p.r0 - 2 * T + 1e-3 && u0 < p.r1 + 2 * T - 1e-3);

    // plates
    const cuts = ops.filter((p) => p.type !== 'window').map((p) => [p.r0, p.r1] as const).sort((a, b) => a[0] - b[0]);
    let u = 0;
    for (const [a, b] of cuts) {
      if (a > u) map(o.plate, u, a, 0, PL, 0, o.depth);
      u = b;
    }
    if (u < o.len) map(o.plate, u, o.len, 0, PL, 0, o.depth);
    map('topPlate', 0, o.len, top, top + PL, 0, o.depth);
    map('topPlate', 0, o.len, top + PL, top + 2 * PL, 0, o.depth);

    // studs on the 16" layout, end and corner studs
    const verts: [number, number][] = [];
    const cands: [number, number][] = [[0, T], [T, 2 * T], [o.len - 2 * T, o.len - T], [o.len - T, o.len]];
    for (let k = 1; k * OC < o.len - 2 * T; k++) cands.push([k * OC - T / 2, k * OC + T / 2]);
    for (const [a, b] of cands) {
      if (inOpening(a, b) || verts.some(([c, d]) => b > c + 1e-3 && a < d - 1e-3)) continue;
      verts.push([a, b]);
      map('stud', a, b, PL, top, 0, o.depth);
    }

    // openings: kings, trimmers, header, cripples, rough sill
    for (const p of ops) {
      for (const [a, b] of [[p.r0 - 2 * T, p.r0 - T], [p.r1 + T, p.r1 + 2 * T]] as const) {
        verts.push([a, b]);
        map('king', a, b, PL, top, 0, o.depth);
      }
      map('trimmer', p.r0 - T, p.r0, PL, p.head, 0, o.depth);
      map('trimmer', p.r1, p.r1 + T, PL, p.head, 0, o.depth);
      map('header', p.r0 - T, p.r1 + T, p.head, p.head + p.hd, 0, o.depth);
      const layout: number[] = [];
      for (let k = Math.ceil(p.r0 / OC); k * OC < p.r1; k++) if (k * OC - T / 2 > p.r0 + 0.05 && k * OC + T / 2 < p.r1 - 0.05) layout.push(k * OC);
      if (top - (p.head + p.hd) > 0.1) for (const c of layout) map('cripple', c - T / 2, c + T / 2, p.head + p.hd, top, 0, o.depth);
      if (p.type === 'window') {
        map('roughSill', p.r0, p.r1, p.sill - T, p.sill, 0, o.depth);
        const below = [p.r0 + T / 2, ...layout.filter((c) => c > p.r0 + 1.5 * T && c < p.r1 - 1.5 * T), p.r1 - T / 2];
        for (const c of below) map('cripple', c - T / 2, c + T / 2, PL, p.sill - T, 0, o.depth);
      }
    }

    // mid-height blocking between full-height members
    verts.sort((a, b) => a[0] - b[0]);
    const mid = PL + STUD / 2;
    for (let i = 0; i < verts.length - 1; i++) {
      const a = verts[i][1];
      const b = verts[i + 1][0];
      if (b - a < 0.08 || ops.some((p) => (a + b) / 2 > p.r0 - T && (a + b) / 2 < p.r1 + T)) continue;
      const v = mid + (i % 2 ? T / 2 : -T / 2);
      map('blocking', a, b, v, v + T, 0, o.depth);
    }

    // shear-wall sheathing + hold-downs (ground floor) or floor-to-floor straps (upper floor)
    const ow = 7 / 16 / 12;
    for (const [s0, s1] of o.sheath ?? []) {
      for (let a = s0; a < s1 - 0.01; a += 4) {
        const b = Math.min(s1, a + 4);
        map('sheathing', a + 0.005, b - 0.005, 0.005, 8, -ow - 0.002, -0.002);
        map('sheathing', a + 0.005, b - 0.005, 8.01, WALL_H, -ow - 0.002, -0.002);
      }
      for (const [e, side] of [[s0, 1], [s1, -1]] as const) {
        const face = side > 0 ? (e <= 0 ? 2 * T : e + T / 2) : e >= o.len ? o.len - 2 * T : e - T / 2;
        if (o.lvl === 1) unit(() => {
          map('holdown', face, face + side * 0.03, PL, PL + 0.72, o.depth * 0.24, o.depth * 0.76);
          map('holdown', face, face + side * 0.3, PL + 0.1, PL + 0.14, o.depth * 0.24, o.depth * 0.76);
          map('holdown', face + side * 0.03, face + side * 0.3, PL + 0.14, PL + 0.62, o.depth * 0.24, o.depth * 0.26);
          map('holdown', face + side * 0.03, face + side * 0.3, PL + 0.14, PL + 0.62, o.depth * 0.74, o.depth * 0.76);
          const p = world(face + side * 0.17, o.depth / 2);
          cyl('holdown', 1, p.x, p.z, o.y0 - 0.45, o.y0 + PL + 0.3, 0.032);
        });
        else {
          const c = face + side * 0.25;
          map('strap', c - 0.1, c + 0.1, -(D10 + SUB) - 2.2, 2.2, -ow - 0.03, -ow - 0.012, 2);
        }
      }
    }

    // anchor bolts through the sill plate
    if (o.anchors) {
      const at: number[] = [1];
      for (let a = 5; a < o.len - 1.5; a += 4) at.push(a);
      at.push(o.len - 1);
      for (const a of at) {
        if (cuts.some(([c0, c1]) => a > c0 - 0.3 && a < c1 + 0.3)) continue;
        const p = world(a, o.depth / 2);
        unit(() => {
        cyl('anchor', 0, p.x, p.z, o.y0 - 0.45, o.y0 + PL + 0.16, 0.026);
        map('anchor', a - 0.125, a + 0.125, PL, PL + 0.021, o.depth / 2 - 0.125, o.depth / 2 + 0.125, 0);
        map('anchor', a - 0.045, a + 0.045, PL + 0.021, PL + 0.07, o.depth / 2 - 0.045, o.depth / 2 + 0.045, 0);
        });
      }
    }
  };

  // ===== foundation =====
  box('slab', 0, 0, -0.5, 0, W, 0, DP);
  box('slab', 0, -16, -0.5, 4, 0, 0, DP);

  // ===== ground floor walls =====
  const g = { y0: 0, lvl: 1, plate: 'sill' as MemberId };
  wall({ ...g, x0: 0, z0: 0, dir: 'x', len: W, inward: 1, depth: D6, anchors: true, openings: [{ at: 6, w: 4, type: 'window' }, { at: 16, w: 3.17, type: 'door' }, { at: 26, w: 4, type: 'window' }] });
  wall({ ...g, x0: 0, z0: DP, dir: 'x', len: W, inward: -1, depth: D6, anchors: true, openings: [{ at: 9, w: 6, type: 'door' }, { at: 23, w: 3, type: 'window' }], sheath: [[0, 4], [W - 4, W]] });
  wall({ ...g, x0: 0, z0: D6, dir: 'z', len: DP - 2 * D6, inward: 1, depth: D6, anchors: true, openings: [{ at: 1.6, w: 2.2, type: 'window' }, { at: 14, w: 3.17, type: 'door' }], sheath: [[DP - 2 * D6 - 4, DP - 2 * D6]] });
  wall({ ...g, x0: W, z0: D6, dir: 'z', len: DP - 2 * D6, inward: -1, depth: D6, anchors: true, openings: [{ at: 6, w: 3, type: 'window' }, { at: 16, w: 4, type: 'window' }], sheath: [[0, 4], [DP - 2 * D6 - 4, DP - 2 * D6]] });
  wall({ ...g, x0: D6, z0: 12 - D4 / 2, dir: 'x', len: W - 2 * D6, inward: 1, depth: D4, openings: [{ at: 9.5, w: 3.17, type: 'door' }, { at: 21, w: 6, type: 'door' }] });
  wall({ ...g, x0: 12, z0: D6, dir: 'z', len: 12 - D4 / 2 - D6, inward: 1, depth: D4, openings: [{ at: 6, w: 2.67, type: 'door' }] });
  // garage wing
  wall({ ...g, x0: -16, z0: 4, dir: 'x', len: 16, inward: 1, depth: D6, anchors: true, openings: [{ at: 8, w: 9, type: 'garage' }] });
  wall({ ...g, x0: -16, z0: 4 + D6, dir: 'z', len: 20 - 2 * D6, inward: 1, depth: D6, anchors: true, openings: [{ at: 9.5, w: 3, type: 'window' }] });
  wall({ ...g, x0: -16, z0: DP, dir: 'x', len: 16, inward: -1, depth: D6, anchors: true, openings: [{ at: 5, w: 3.17, type: 'door' }] });

  // ===== second-floor framing =====
  const yb = WALL_H;
  const yt = WALL_H + D10;
  box('rim', 2, 0, yb, 0, W, yt, T);
  box('rim', 2, 0, yb, DP - T, W, yt, DP);
  box('rim', 2, 0, yb, T, T, yt, DP - T);
  box('rim', 2, W - T, yb, T, W, yt, DP - T);
  // stair opening between the doubled joists at x = 20' and 24', from z = 2' to 10.5'
  const SO = { x0: 20 + T, x1: 24 - 2 * T, z0: 2, z1: 10.5 };
  const inSO = (x: number) => x > SO.x0 - 0.01 && x < SO.x1 + 0.01;
  // face-mount U hanger for a member ending against a face at z = zf (member runs towards dirZ)
  const hangerOnZFace = (xa: number, xb: number, zf: number, dirZ: 1 | -1) => unit(() => {
    const L = 0.16;
    box('hanger', 2, xa - 0.012, yb + 0.05, zf, xa, yb + 0.68, zf + dirZ * L);
    box('hanger', 2, xb, yb + 0.05, zf, xb + 0.012, yb + 0.68, zf + dirZ * L);
    box('hanger', 2, xa - 0.012, yb + 0.03, zf, xb + 0.012, yb + 0.05, zf + dirZ * L);
    box('hanger', 2, xa - 0.12, yb + 0.05, zf, xa - 0.012, yb + 0.68, zf + dirZ * 0.012);
    box('hanger', 2, xb + 0.012, yb + 0.05, zf, xb + 0.12, yb + 0.68, zf + dirZ * 0.012);
  });
  // same, for a member ending against a face at x = xf (double header into trimmer)
  const hangerOnXFace = (za: number, zb: number, xf: number, dirX: 1 | -1) => unit(() => {
    const L = 0.16;
    box('hanger', 2, xf, yb + 0.05, za - 0.012, xf + dirX * L, yb + 0.68, za);
    box('hanger', 2, xf, yb + 0.05, zb, xf + dirX * L, yb + 0.68, zb + 0.012);
    box('hanger', 2, xf, yb + 0.03, za - 0.012, xf + dirX * L, yb + 0.05, zb + 0.012);
    box('hanger', 2, xf, yb + 0.05, za - 0.12, xf + dirX * 0.012, yb + 0.68, za - 0.012);
    box('hanger', 2, xf, yb + 0.05, zb + 0.012, xf + dirX * 0.012, yb + 0.68, zb + 0.12);
  });
  const joistX: number[] = [];
  for (let k = 1; k * OC < W - 0.3; k++) {
    const x = k * OC;
    joistX.push(x);
    if (inSO(x - T / 2)) {
      // tail joists hung from the stair headers
      box('joist', 2, x - T, yb, T, x, yt, SO.z0 - 2 * T);
      box('joist', 2, x - T, yb, SO.z1 + 2 * T, x, yt, 12 + 0.6);
      hangerOnZFace(x - T, x, SO.z0 - 2 * T, -1);
      hangerOnZFace(x - T, x, SO.z1 + 2 * T, 1);
    } else box('joist', 2, x - T, yb, T, x, yt, 12 + 0.6);
    box('joist', 2, x, yb, 12 - 0.6, x + T, yt, DP - T);
  }
  // doubled trimmer joists and doubled headers
  box('joist', 2, 20, yb, T, 20 + T, yt, 12 + 0.6);
  box('joist', 2, 24 - 2 * T, yb, T, 24 - T, yt, 12 + 0.6);
  for (const [z0, z1] of [[SO.z0 - 2 * T, SO.z0], [SO.z1, SO.z1 + 2 * T]] as const) {
    box('joist', 2, SO.x0, yb, z0, SO.x1, yt, z0 + T);
    box('joist', 2, SO.x0, yb, z0 + T, SO.x1, yt, z1);
    hangerOnXFace(z0, z1, SO.x0, 1);
    hangerOnXFace(z0, z1, SO.x1, -1);
  }
  // mid-span blocking rows
  for (const [zr, front] of [[6, true], [18, false]] as const) {
    const edges: [number, number][] = [[0, T], ...joistX.map((x) => (front ? [x - T, x] : [x, x + T]) as [number, number]), [W - T, W]];
    for (let i = 0; i < edges.length - 1; i++) {
      if (front && edges[i][1] > SO.x0 - 0.5 && edges[i + 1][0] < SO.x1 + 0.5) continue;
      const z0 = zr + (i % 2 ? 0 : -T);
      box('joistBlock', 2, edges[i][1], yb, z0, edges[i + 1][0], yt, z0 + T);
    }
  }
  // solid blocking over the centre bearing wall, clipped to its top plate with A35 angles
  for (let i = 0; i < joistX.length - 1; i++) {
    const a = joistX[i] + T;
    const b2 = joistX[i + 1] - T;
    if (b2 - a < 0.1) continue;
    box('joistBlock', 2, a, yb, 12 - T / 2, b2, yt, 12 + T / 2);
    const m = (a + b2) / 2;
    unit(() => {
      box('a35', 2, m - 0.1, yb, 12 + T / 2, m + 0.1, yb + 0.375, 12 + T / 2 + 0.01);
      box('a35', 2, m - 0.1, yb - 0.01, 12 + T / 2, m + 0.1, yb, 12 + T / 2 + 0.12);
    });
  }
  // LTP4 lateral ties, rim board to top plate, on the outside face
  for (let x = 2; x < W - 1; x += 4) {
    box('ltp4', 2, x - 0.125, yb - 0.3, -0.012, x + 0.125, yb + 0.3, 0);
    box('ltp4', 2, x - 0.125, yb - 0.3, DP, x + 0.125, yb + 0.3, DP + 0.012);
  }
  for (let z = 2; z < DP - 1; z += 4) {
    box('ltp4', 2, W, yb - 0.3, z - 0.125, W + 0.012, yb + 0.3, z + 0.125);
    if (z < 4) box('ltp4', 2, -0.012, yb - 0.3, z - 0.125, 0, yb + 0.3, z + 0.125);
  }
  // subfloor sheets, cut around the stair opening
  const holeMinus = (x0: number, z0: number, x1: number, z1: number): [number, number, number, number][] => {
    if (x1 <= SO.x0 || x0 >= SO.x1 || z1 <= SO.z0 || z0 >= SO.z1) return [[x0, z0, x1, z1]];
    const out: [number, number, number, number][] = [];
    if (z0 < SO.z0) out.push([x0, z0, x1, SO.z0]);
    if (z1 > SO.z1) out.push([x0, SO.z1, x1, z1]);
    const za = Math.max(z0, SO.z0);
    const zb = Math.min(z1, SO.z1);
    if (x0 < SO.x0) out.push([x0, za, SO.x0, zb]);
    if (x1 > SO.x1) out.push([SO.x1, za, x1, zb]);
    return out;
  };
  for (let j = 0; j < 6; j++) {
    for (let x = j % 2 ? -4 : 0; x < W; x += 8) {
      for (const [x0, z0, x1, z1] of holeMinus(Math.max(0, x), j * 4, Math.min(W, x + 8), j * 4 + 4))
        box('subfloor', 2, x0 + 0.005, yt, z0 + 0.005, x1 - 0.005, yt + SUB, z1 - 0.005);
    }
  }

  const u = { y0: F2, lvl: 3, plate: 'bottomPlate' as MemberId };
  wall({ ...u, x0: 0, z0: 0, dir: 'x', len: W, inward: 1, depth: D6, openings: [{ at: 6, w: 3, type: 'window' }, { at: 16, w: 4, type: 'window' }, { at: 26, w: 3, type: 'window' }] });
  wall({ ...u, x0: 0, z0: DP, dir: 'x', len: W, inward: -1, depth: D6, openings: [{ at: 9, w: 3, type: 'window' }, { at: 23, w: 3, type: 'window' }], sheath: [[0, 4], [W - 4, W]] });
  wall({ ...u, x0: 0, z0: D6, dir: 'z', len: DP - 2 * D6, inward: 1, depth: D6, openings: [{ at: 6, w: 3, type: 'window' }, { at: 17, w: 3, type: 'window' }], sheath: [[DP - 2 * D6 - 4, DP - 2 * D6]] });
  wall({ ...u, x0: W, z0: D6, dir: 'z', len: DP - 2 * D6, inward: -1, depth: D6, openings: [{ at: 6, w: 3, type: 'window' }, { at: 16, w: 3, type: 'window' }], sheath: [[0, 4], [DP - 2 * D6 - 4, DP - 2 * D6]] });
  wall({ ...u, x0: D6, z0: 12 - D4 / 2, dir: 'x', len: W - 2 * D6, inward: 1, depth: D4, openings: [{ at: 8, w: 2.67, type: 'door' }, { at: 24, w: 2.67, type: 'door' }] });
  wall({ ...u, x0: 16, z0: 12 + D4 / 2, dir: 'z', len: DP - D6 - (12 + D4 / 2), inward: 1, depth: D4, openings: [{ at: 4, w: 2.67, type: 'door' }] });

  // ===== main roof: rafters, ridge, ceiling joists, collar ties, gable studs, sub-fascia, hurricane ties =====
  const under = (z: number) => RB + ((z <= 12 ? z : DP - z) - D6) * PITCH; // rafter bottom line
  const zTail = -1.5;
  const zRidge = 12 - T / 2;
  const yR = under(zRidge);
  for (let i = 0; i <= 16; i++) {
    const xc = Math.min(W - T / 2, Math.max(T / 2, i * 2));
    beam('rafter', 4, new V3(xc, under(zTail), zTail), new V3(xc, under(zRidge), zRidge), D10, T, 'zy');
    beam('rafter', 4, new V3(xc, under(zTail), DP - zTail), new V3(xc, under(zRidge), DP - zRidge), D10, T, 'zy');
    const s = i === 16 ? -1 : 1;
    const cx0 = xc + s * (T / 2);
    box('ceilingJoist', 4, cx0, RB, 0.05, cx0 + s * T, RB + D8, 12.6);
    box('ceilingJoist', 4, cx0 + s * T, RB, 11.4, cx0 + s * 2 * T, RB + D8, DP - 0.05);
    if (i % 2 === 0 && i > 0 && i < 16) {
      const yc = RB + 4;
      box('collar', 4, xc - 1.5 * T, yc, 7.7, xc - T / 2, yc + D6, DP - 7.7);
    }
    for (const zf of [1, -1] as const) {
      const zz = (z: number) => (zf > 0 ? z : DP - z);
      const hx = i === 0 ? xc + T / 2 : xc - T / 2;
      const hs = i === 0 ? 1 : -1;
      // H2.5A: upper leg on the rafter, twist, lower leg on the inside face of the top plate
      unit(() => {
        box('hurricane', 4, hx, RB + 0.04, zz(0.16), hx + hs * 0.012, RB + 0.42, zz(0.3));
        box('hurricane', 4, hx, RB - 0.02, zz(0.16), hx + hs * 0.012, RB + 0.04, zz(D6));
        box('hurricane', 4, hx, RB - 0.3, zz(D6), hx + hs * 0.13, RB - 0.02, zz(D6) + zf * 0.012);
      });
      // LSSU210 rafter hanger against the ridge board
      const zr = zz(zRidge);
      const zo = zz(zRidge - 0.17);
      unit(() => {
        box('lssu', 4, xc - T / 2 - 0.012, yR + 0.04, zr, xc - T / 2, yR + 0.7, zo);
        box('lssu', 4, xc + T / 2, yR + 0.04, zr, xc + T / 2 + 0.012, yR + 0.7, zo);
        box('lssu', 4, xc - T / 2 - 0.012, yR - 0.06, zr, xc + T / 2 + 0.012, yR - 0.03, zo);
        if (i > 0) box('lssu', 4, xc - T / 2 - 0.13, yR + 0.04, zr, xc - T / 2 - 0.012, yR + 0.7, zz(zRidge - 0.012));
        if (i < 16) box('lssu', 4, xc + T / 2 + 0.012, yR + 0.04, zr, xc + T / 2 + 0.13, yR + 0.7, zz(zRidge - 0.012));
      });
      // LSTA21 strap on the rafter top edges, every other rafter pair
      if (i % 2 === 1) unitK(`lsta${i}`, () => beam('lsta', 4, new V3(xc, under(zz(10.9)) + PLUMB, zz(10.9)), new V3(xc, under(zr) + PLUMB, zr), 0.012, 0.104, 'zy'));
    }
    if (i % 2 === 1) unitK(`lsta${i}`, () => box('lsta', 4, xc - 0.052, yR + PLUMB, 12 - T / 2, xc + 0.052, yR + PLUMB + 0.012, 12 + T / 2));
    // A35 clipping the lapped ceiling joists to the centre bearing wall
    unit(() => {
      box('a35', 4, cx0 - s * 0.01, RB, 11.85, cx0, RB + 0.375, 12.15);
      box('a35', 4, cx0 - s * 0.12, RB - 0.01, 11.85, cx0, RB, 12.15);
    });
  }
  box('ridge', 4, 0, yR - 0.04, 12 - T / 2, W, yR - 0.04 + D12, 12 + T / 2);
  const yTail = under(zTail);
  box('fascia', 4, 0, yTail - 0.12, zTail - T, W, yTail - 0.12 + D10, zTail);
  box('fascia', 4, 0, yTail - 0.12, DP - zTail, W, yTail - 0.12 + D10, DP - zTail + T);
  for (const [x0, x1] of [[0, D4], [W - D4, W]] as const) {
    for (let k = 1; k * OC < DP - D6; k++) {
      const z = k * OC;
      if (Math.abs(z - 12) < 0.25 || z < D6) continue;
      const ytop = under(z) - 0.03;
      if (ytop - RB > 0.3) box('gableStud', 4, x0, RB, z - T / 2, x1, ytop, z + T / 2);
    }
  }

  // ===== garage roof: ledger, trusses (chords, webs, plates), gable trusses =====
  box('ledger', 4, -T, WALL_H - D10, 4 + D6, 0, WALL_H, DP - D6);
  for (let z = 5, n = 0; z < DP - D6 - 0.3; z += OC, n++) {
    const y = WALL_H - D10 + (n % 2 ? 0.22 : 0.55);
    unit(() => {
      screwX('sdws', 4, -T - 0.02, 0.3, y, z, 0.012);
      box('sdws', 4, -T - 0.03, y - 0.03, z - 0.03, -T, y + 0.03, z + 0.03);
    });
  }
  const xL = -16;
  const xR = -0.01;
  const xm = (xL + xR) / 2;
  const B = WALL_H;
  const topLine = (x: number) => B + 0.45 + (x <= xm ? x - xL : xR - x) * PITCH;
  const plate = (x: number, y: number, zc: number) => {
    for (const s of [-1, 1]) box('trussPlate', 4, x - 0.22, y - 0.17, zc + s * (T / 2 + 0.002), x + 0.22, y + 0.17, zc + s * (T / 2 + 0.012));
  };
  for (let k = 0; k <= 10; k++) {
    const zc = Math.min(DP - T / 2, Math.max(4 + T / 2, 4 + 2 * k));
    const gable = k === 0 || k === 10;
    box('truss', 4, xL, B, zc - T / 2, xR, B + D4, zc + T / 2);
    beam('truss', 4, new V3(xL - 1, topLine(xL) - PITCH, zc), new V3(xm, topLine(xm), zc), D4, T, 'xy');
    beam('truss', 4, new V3(xm, topLine(xm), zc), new V3(xR, topLine(xR), zc), D4, T, 'xy');
    plate(xL + 0.35, B + 0.3, zc);
    plate(xR - 0.35, B + 0.3, zc);
    plate(xm, topLine(xm) + 0.15, zc);
    unit(() => {
      box('hurricane', 4, xL + 0.16, B + 0.04, zc + T / 2, xL + 0.3, B + 0.42, zc + T / 2 + 0.012);
      box('hurricane', 4, xL + 0.16, B - 0.02, zc + T / 2, xL + D6, B + 0.04, zc + T / 2 + 0.012);
      box('hurricane', 4, xL + D6, B - 0.3, zc + T / 2, xL + D6 + 0.012, B - 0.02, zc + T / 2 + 0.13);
    });
    unit(() => {
      box('hurricane', 4, -T - 0.012, B - 0.3, zc + T / 2, -T, B - 0.02, zc + T / 2 + 0.13);
      box('hurricane', 4, -T - 0.012, B - 0.02, zc + T / 2, -T + 0.12, B + 0.4, zc + T / 2 + 0.012);
    });
    if (gable) {
      for (let j = 1; xL + j * OC < xR - 0.2; j++) {
        const x = xL + j * OC;
        if (Math.abs(x - xm) < 0.2) continue;
        box('gableStud', 4, x - T / 2, B + D4, zc - T / 2, x + T / 2, topLine(x) - 0.03, zc + T / 2);
      }
    } else {
      const span = xR - xL;
      const p1 = new V3(xL + span / 3, B + D4 / 2, zc);
      const p2 = new V3(xL + (2 * span) / 3, B + D4 / 2, zc);
      const q1 = new V3(xL + span / 4, topLine(xL + span / 4) + D4 / 2, zc);
      const q2 = new V3(xL + (3 * span) / 4, topLine(xL + (3 * span) / 4) + D4 / 2, zc);
      const qa = new V3(xm, topLine(xm) + D4 / 2 - 0.12, zc);
      for (const [a, b] of [[p1, q1], [p1, qa], [p2, qa], [p2, q2]]) beam('truss', 4, a, b, D4, T, 'xy', false);
      for (const p of [p1, p2, q1, q2]) plate(p.x, p.y, zc);
    }
  }

  // ----- assembly timing: stage per level/member, then a sweep across the plan inside each stage -----
  const stageOf = (c: MemberId, lvl: number): [number, number] => {
    if (lvl === 0) return c === 'slab' ? [0, 0.05] : [0.05, 0.09];
    if (lvl === 1) {
      if (c === 'sill') return [0.08, 0.12];
      if (FRAMING.has(c)) return [0.11, 0.27];
      if (c === 'blocking') return [0.26, 0.3];
      if (c === 'topPlate') return [0.29, 0.33];
      return [0.32, 0.36];
    }
    if (lvl === 2) {
      if (c === 'rim') return [0.35, 0.38];
      if (c === 'joist') return [0.37, 0.44];
      if (c === 'joistBlock') return [0.43, 0.46];
      if (c === 'subfloor') return [0.45, 0.52];
      if (c === 'hanger' || c === 'a35') return [0.44, 0.47];
      if (c === 'ltp4') return [0.46, 0.49];
      return [0.71, 0.74];
    }
    if (lvl === 3) {
      if (c === 'bottomPlate') return [0.51, 0.54];
      if (FRAMING.has(c)) return [0.53, 0.66];
      if (c === 'blocking') return [0.65, 0.68];
      if (c === 'topPlate') return [0.67, 0.7];
      return [0.69, 0.73];
    }
    const roof: Partial<Record<MemberId, [number, number]>> = {
      ledger: [0.73, 0.75],
      ceilingJoist: [0.74, 0.78],
      ridge: [0.77, 0.79],
      rafter: [0.78, 0.86],
      truss: [0.79, 0.9],
      gableStud: [0.85, 0.89],
      collar: [0.87, 0.9],
      fascia: [0.88, 0.91],
      trussPlate: [0.9, 0.94],
      hurricane: [0.92, 0.965],
      lssu: [0.83, 0.87],
      lsta: [0.93, 0.965],
      a35: [0.76, 0.79],
      sdws: [0.745, 0.77],
    };
    return roof[c] ?? [0.9, 0.95];
  };
  const stages = new Map<string, Piece[]>();
  for (const p of pieces) {
    const key = `${p.lvl}:${stageOf(p.c, p.lvl).join()}`;
    if (!stages.has(key)) stages.set(key, []);
    stages.get(key)!.push(p);
  }
  for (const list of stages.values()) {
    const [t0, t1] = stageOf(list[0].c, list[0].lvl);
    const key = (p: Piece) => p.pos.x + p.pos.z * 0.55;
    const ks = list.map(key);
    const lo = Math.min(...ks);
    const hi = Math.max(...ks);
    list.forEach((p, i) => (p.t = t0 + (t1 - t0) * 0.88 * (hi > lo ? (ks[i] - lo) / (hi - lo) : 0)));
  }
  return pieces;
}

// Darkens box edges in the shader so every member reads as a separate piece of lumber.
function edgeShade(m: THREE.MeshStandardMaterial, strength = 0.38) {
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLoc;\nvarying vec3 vScl;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vLoc = position;
        #ifdef USE_INSTANCING
          vScl = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        #else
          vScl = vec3(1.0);
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLoc;\nvarying vec3 vScl;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec3 dd = (0.5 - abs(vLoc)) * vScl;
        float mn = min(dd.x, min(dd.y, dd.z));
        float mx = max(dd.x, max(dd.y, dd.z));
        float md = dd.x + dd.y + dd.z - mn - mx;
        diffuseColor.rgb *= 1.0 - (1.0 - smoothstep(0.004, 0.028, md)) * ${strength.toFixed(2)};`,
      );
  };
}

function osbTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#d8bb88';
  g.fillRect(0, 0, 256, 256);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const l = 52 + rnd() * 28;
    g.fillStyle = `hsl(${30 + rnd() * 12}, ${35 + rnd() * 25}%, ${l}%)`;
    g.save();
    g.translate(rnd() * 256, rnd() * 256);
    g.rotate(rnd() * Math.PI);
    g.fillRect(-9, -3, 8 + rnd() * 14, 3 + rnd() * 4);
    g.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export type LoadMode = 'gravity' | 'wind' | 'seismic';
type Arrow = { at: THREE.Vector3; dir: THREE.Vector3; len: number; kind: 'load' | 'reaction'; w?: number };
const LOAD_COLOR: Record<LoadMode, string> = { gravity: '#5b9be6', wind: '#35d0c0', seismic: '#ff6a45' };
const REACTION_COLOR = '#9be15d';

// Load paths drawn through the sample frame: each path is a polyline from where the load is applied
// down/through the members and connectors that carry it, ending in the foundation.
function loadData(mode: LoadMode) {
  const paths: THREE.Vector3[][] = [];
  const arrows: Arrow[] = [];
  const v = (x: number, y: number, z: number) => new V3(x, y, z);
  const rafterTop = (z: number) => RB + ((z <= 12 ? z : DP - z) - D6) * PITCH + PLUMB;
  const garTop = (x: number) => WALL_H + 0.45 + (x <= -8 ? x + 16 : -0.01 - x) * PITCH + D4;
  const zb = D6 / 2;
  const column = (x: number, z: number, fromY: number) => [v(x, fromY, z), v(x, F2, z), v(x, WALL_H, z), v(x, 0.1, z), v(x, -0.5, z)];
  const load = (tip: THREE.Vector3, dir: THREE.Vector3, len: number, w = 1) => arrows.push({ at: tip, dir, len, kind: 'load', w });
  const react = (tip: THREE.Vector3, dir: THREE.Vector3, len: number) => arrows.push({ at: tip, dir, len, kind: 'reaction' });
  const DOWN = v(0, -1, 0);
  const UP = v(0, 1, 0);

  if (mode === 'gravity') {
    for (let x = 2; x <= 30; x += 4)
      for (const back of [false, true]) {
        const zz = (z: number) => (back ? DP - z : z);
        paths.push([v(x, rafterTop(10.5), zz(10.5)), ...column(x, zz(zb), RB)]);
        for (const z of [3, 7, 10.5]) load(v(x, rafterTop(z) + 0.25, zz(z)), DOWN, 2.6);
      }
    for (const x of [4, 9.33, 14.67, 28]) {
      const top = WALL_H + D10;
      for (const [z0, z1] of [[6, zb], [6, 12], [18, 12], [18, DP - zb]]) paths.push([v(x, top, z0), v(x, WALL_H + D10 / 2, z1), v(x, WALL_H, z1), v(x, 0.1, z1), v(x, -0.5, z1)]);
      for (const z of [6, 18]) load(v(x, F2 + 0.1, z), DOWN, 1.8);
    }
    for (const z of [6, 10, 14, 18, 22]) {
      const apex = v(-8, garTop(-8), z);
      paths.push([apex, v(-16 + zb, WALL_H + 0.2, z), v(-16 + zb, 0.1, z), v(-16 + zb, -0.5, z)]);
      paths.push([apex, v(-0.07, WALL_H + 0.2, z), v(0.25, WALL_H - 0.4, z), v(0.25, 0.1, z), v(0.25, -0.5, z)]);
      for (const x of [-13, -8, -3]) load(v(x, garTop(x) + 0.25, z), DOWN, 2.4);
    }
    for (let x = 2; x <= 30; x += 7) for (const z of [zb, 12, DP - zb]) react(v(x, -0.55, z), UP, 2.2);
    for (const z of [7, 17]) react(v(-16 + zb, -0.55, z), UP, 2.2);
    return { paths, arrows, members: ['rafter', 'ridge', 'lssu', 'hurricane', 'topPlate', 'stud', 'king', 'trimmer', 'header', 'rim', 'joist', 'hanger', 'bottomPlate', 'sill', 'slab', 'truss', 'ledger'] as MemberId[] };
  }

  // lateral (wind / seismic) on the front face: floor & roof diaphragms span to the side-wall shear walls,
  // which carry the shear down through straps and hold-downs into the foundation
  const NORTH = v(0, 0, 1);
  const SOUTH = v(0, 0, -1);
  const shearDown = (x: number, z: number, yL: number) =>
    yL > F2 ? [v(x, F2 + 0.3, z), v(x, WALL_H, z), v(x, 0.15, z), v(x, -0.5, z)] : [v(x, 0.15, z), v(x, -0.5, z)];
  const xl = D6 / 2;
  const xr = W - D6 / 2;
  const zA = D6 + 2;
  const zB = DP - D6 - 2;
  for (const yL of [WALL_H + D10, RB])
    for (const x0 of [6, 16, 26]) {
      const start = v(x0, yL, 0.3);
      const mid = v(x0, yL, 12);
      if (x0 <= 16) paths.push([start, mid, v(xl, yL, zB), ...shearDown(xl, zB, yL)]);
      if (x0 >= 16) {
        paths.push([start, mid, v(xr, yL, zA), ...shearDown(xr, zA, yL)]);
        paths.push([start, mid, v(xr, yL, zB), ...shearDown(xr, zB, yL)]);
      }
    }
  react(v(W + 0.7, -0.25, D6 + 0.4), SOUTH, 3.2);
  react(v(W + 0.7, -0.25, zB - 1.6), SOUTH, 3.2);
  react(v(-0.7, -0.25, zB - 1.6), SOUTH, 3.2);

  if (mode === 'wind') {
    for (const x of [3, 8, 13, 18, 23, 28]) for (const y of [2.5, 6.5, 11.5, 15.5]) load(v(x, y, -0.3), NORTH, 2.6);
    for (const x of [4, 12, 20, 28])
      for (const back of [false, true]) {
        const z = back ? DP - 5 : 5;
        load(v(x, rafterTop(z) + 2.7, z), UP, 2.4);
        paths.push([v(x, rafterTop(z), z), ...column(x, back ? DP - zb : zb, RB)]);
      }
    return { paths, arrows, members: ['sheathing', 'subfloor', 'ltp4', 'holdown', 'strap', 'hurricane', 'lsta', 'lssu', 'rafter', 'truss', 'anchor', 'a35', 'sill', 'slab', 'rim', 'topPlate'] as MemberId[] };
  }

  for (const x of [6, 16, 26]) {
    load(v(x, RB + 0.4, -0.3), NORTH, 5.2, 2.4);
    load(v(x, WALL_H + D10 / 2, -0.3), NORTH, 3.2, 1.9);
  }
  load(v(-8, WALL_H + 1.2, 3.7), NORTH, 2, 1.5);
  return { paths, arrows, members: ['sheathing', 'subfloor', 'ltp4', 'holdown', 'strap', 'anchor', 'a35', 'sill', 'slab', 'rim', 'topPlate'] as MemberId[] };
}

export type FrameApi = {
  setLoad: (mode: LoadMode | null) => void;
  select: (c: MemberId | null) => void;
  setExplode: (on: boolean) => void;
  replay: () => void;
  zoom: (dir: 1 | -1) => void;
  counts: Record<string, number>;
  total: number;
  dispose: () => void;
};

export function mountWoodFrame(
  container: HTMLElement,
  ui: {
    onSelect?: (c: MemberId | null) => void;
    onProgress?: (p: number) => void;
    onLoad?: (mode: LoadMode | null) => void;
    tip?: HTMLElement;
    pin?: HTMLElement;
  } = {},
): FrameApi {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const pieces = buildPieces();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'wf__canvas';
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#0d0f13', 95, 190);
  const center = new V3(8, 9.5, 12);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);
  const homeDir = new V3(-0.62, 0.5, -0.6).normalize();
  let homeDist = 96;
  camera.position.copy(center).addScaledVector(homeDir, homeDist * 1.25);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(center);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.enableZoom = true;
  controls.zoomToCursor = true;
  controls.zoomSpeed = 1.1;
  controls.minDistance = 2.5;
  controls.maxDistance = 200;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.45;
  renderer.domElement.style.touchAction = 'pan-y';

  scene.add(new THREE.HemisphereLight('#eef3ff', '#2a2620', 1.15));
  const sun = new THREE.DirectionalLight('#fff3e2', 3.0);
  sun.position.set(-34, 60, -28);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 160 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.target.position.copy(center);
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#9ec2ff', 0.7);
  fill.position.set(40, 20, 40);
  scene.add(fill);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.34 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  (ground.material as THREE.Material).depthWrite = false;
  scene.add(ground);
  const grid = new THREE.GridHelper(120, 60, '#3a414d', '#22262e');
  grid.position.set(center.x, -0.51, center.z);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.5;
  scene.add(grid);

  // ----- instanced meshes, one per member type & shape -----
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  const osb = osbTexture();
  const mats = new Map<MemberId, THREE.MeshStandardMaterial>();
  const meshes: THREE.InstancedMesh[] = [];
  const slots: { mesh: THREE.InstancedMesh; i: number }[] = new Array(pieces.length);
  const counts: Record<string, number> = {};
  const byCat = new Map<MemberId, number[]>();
  let rng = 11;
  const rnd = () => ((rng = (rng * 16807) % 2147483647) / 2147483647);

  for (const id of Object.keys(MEMBERS) as MemberId[]) {
    const m = MEMBERS[id] as (typeof MEMBERS)[MemberId] & { kind?: string };
    const kind = m.kind ?? 'wood';
    const mat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: kind === 'steel' ? 0.38 : kind === 'concrete' ? 0.95 : 0.78,
      metalness: kind === 'steel' ? 0.75 : 0,
      map: kind === 'osb' ? osb : null,
    });
    if (kind !== 'concrete') edgeShade(mat, kind === 'osb' ? 0.3 : kind === 'steel' ? 0.3 : 0.4);
    mats.set(id, mat);
    for (const shape of ['box', 'cyl'] as Shape[]) {
      const idx = pieces.map((p, i) => (p.c === id && p.shape === shape ? i : -1)).filter((i) => i >= 0);
      if (!idx.length) continue;
      const mesh = new THREE.InstancedMesh(shape === 'box' ? boxGeo : cylGeo, mat, idx.length);
      mesh.userData.c = id;
      mesh.castShadow = id !== 'slab';
      mesh.receiveShadow = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const base = new THREE.Color(m.color);
      idx.forEach((pi, i) => {
        slots[pi] = { mesh, i };
        const v = kind === 'steel' || kind === 'concrete' ? 1 : 0.9 + rnd() * 0.16;
        mesh.setColorAt(i, base.clone().multiplyScalar(v));
      });
      meshes.push(mesh);
      scene.add(mesh);
    }
    const all = pieces.map((p, i) => (p.c === id ? i : -1)).filter((i) => i >= 0);
    byCat.set(id, all);
    counts[id] = new Set(all.map((i) => pieces[i].k ?? `p${i}`)).size;
  }

  // ----- animation state -----
  let T = reduced ? 1 + DUR : 0;
  let playing = false;
  let explode = 0;
  let explodeTarget = 0;
  let dirty = true;
  const m4 = new THREE.Matrix4();
  const pos = new V3();
  const scl = new V3();
  const ZERO = new V3(1e-4, 1e-4, 1e-4);

  let sway = 0;
  const swayAt = (y: number) => (sway * Math.max(0, y + 0.5)) / (RB + 7);
  const pieceWorld = (p: Piece, out: THREE.Vector3) => out.copy(p.pos).setY(p.pos.y + EXPLODE_Y[p.lvl] * ease(explode));
  const updateMatrices = () => {
    const ex = ease(explode);
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      const s = clamp01((T - p.t) / DUR);
      if (s <= 0) m4.compose(p.pos, p.quat, ZERO);
      else {
        const k = easeOut(s);
        pos.copy(p.pos);
        pos.y += EXPLODE_Y[p.lvl] * ex + (1 - k) * 2.6;
        if (sway) pos.z += swayAt(p.pos.y);
        scl.copy(p.size).multiplyScalar(0.82 + 0.18 * k);
        m4.compose(pos, p.quat, scl);
      }
      const { mesh, i: j } = slots[i];
      mesh.setMatrixAt(j, m4);
    }
    for (const mesh of meshes) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  };

  let idleTimer = 0;
  let intro = reduced ? 1 : 0;
  // ----- selection / ghosting -----
  let selected: MemberId | null = null;
  const applySelection = () => {
    for (const [id, mat] of mats) {
      const ghost = selected !== null && id !== selected;
      mat.transparent = ghost;
      mat.opacity = ghost ? 0.06 : 1;
      mat.color.set(ghost ? '#7b8592' : '#ffffff');
      mat.depthWrite = !ghost;
      mat.emissive.set(id === selected ? MEMBERS[id].color : '#000000');
      mat.emissiveIntensity = id === selected ? 0.45 : 0;
      mat.needsUpdate = true;
    }
    for (const mesh of meshes) mesh.castShadow = selected === null ? mesh.userData.c !== 'slab' : mesh.userData.c === selected;
    if (ui.pin) ui.pin.hidden = selected === null;
    if (ui.pin && selected) ui.pin.querySelector('span')!.textContent = MEMBERS[selected].name;
  };
  // camera flight: connectors are small, so fly in close to the nearest one; clearing flies back out
  let fly: { t: number; fromT: THREE.Vector3; toT: THREE.Vector3; fromP: THREE.Vector3; toP: THREE.Vector3 } | null = null;
  const flyTo = (target: THREE.Vector3, dist: number) => {
    const dir = camera.position.clone().sub(controls.target).normalize();
    fly = { t: 0, fromT: controls.target.clone(), toT: target.clone(), fromP: camera.position.clone(), toP: target.clone().addScaledVector(dir, dist) };
    intro = 1;
  };
  const select = (c: MemberId | null) => {
    if (c && loadMode) {
      clearLoad();
      loadMode = null;
      ui.onLoad?.(null);
    }
    const was = selected;
    selected = c;
    applySelection();
    if (c) {
      controls.autoRotate = false;
      window.clearTimeout(idleTimer);
      if (MEMBERS[c].group === 'Connectors') {
        let best = -1;
        let bestD = Infinity;
        const tmpV = new V3();
        for (const i of byCat.get(c)!) {
          const d = pieceWorld(pieces[i], tmpV).distanceToSquared(camera.position);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        if (best >= 0) flyTo(pieceWorld(pieces[best], new V3()), 7.5);
      }
    } else if (was && MEMBERS[was].group === 'Connectors') flyTo(center.clone().setY(center.y + 6.5 * ease(explode)), homeDist);
    ui.onSelect?.(c);
  };

  // ----- load paths: applied loads, pulses travelling through the members, reactions -----
  let loadMode: LoadMode | null = null;
  let loadT = 0;
  const loadGroup = new THREE.Group();
  scene.add(loadGroup);
  const pulseGeo = new THREE.SphereGeometry(0.17, 12, 8);
  const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 8);
  const headGeo = new THREE.ConeGeometry(0.21, 0.6, 14);
  const IDQ = new THREE.Quaternion();
  const pv = new V3();
  const ps = new V3();
  type PathRun = { pts: THREE.Vector3[]; cum: number[]; len: number; n: number };
  let pulseMesh: THREE.InstancedMesh | null = null;
  let runs: PathRun[] = [];
  let arrowObjs: { obj: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3; phase: number; kind: Arrow['kind'] }[] = [];
  const clearLoad = () => {
    loadGroup.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      m?.dispose();
      if (o instanceof THREE.LineSegments) o.geometry.dispose();
    });
    loadGroup.clear();
    pulseMesh = null;
    runs = [];
    arrowObjs = [];
    sway = 0;
    dirty = true;
  };
  const buildLoad = (mode: LoadMode) => {
    const { paths, arrows, members } = loadData(mode);
    const col = new THREE.Color(LOAD_COLOR[mode]);
    const segs: number[] = [];
    for (const p of paths) for (let i = 0; i < p.length - 1; i++) segs.push(p[i].x, p[i].y, p[i].z, p[i + 1].x, p[i + 1].y, p[i + 1].z);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    loadGroup.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.32, depthWrite: false })));
    runs = paths.map((pts) => {
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
      const len = cum[cum.length - 1];
      return { pts, cum, len, n: Math.max(1, Math.round(len / 7)) };
    });
    const count = runs.reduce((a, r) => a + r.n, 0) * 3;
    pulseMesh = new THREE.InstancedMesh(pulseGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), count);
    pulseMesh.frustumCulled = false;
    loadGroup.add(pulseMesh);
    for (const a of arrows) {
      const mat = new THREE.MeshBasicMaterial({ color: a.kind === 'load' ? col : REACTION_COLOR, transparent: true, opacity: 0.95, depthWrite: false });
      const g = new THREE.Group();
      const shaft = new THREE.Mesh(shaftGeo, mat);
      shaft.scale.y = a.len - 0.55;
      shaft.position.y = -(a.len - 0.55) / 2 - 0.55;
      const head = new THREE.Mesh(headGeo, mat);
      head.position.y = -0.3;
      g.add(shaft, head);
      g.quaternion.setFromUnitVectors(new V3(0, 1, 0), a.dir);
      g.scale.set(a.w ?? 1, 1, a.w ?? 1);
      g.position.copy(a.at);
      loadGroup.add(g);
      arrowObjs.push({ obj: g, base: a.at.clone(), dir: a.dir.clone(), phase: rnd() * 6.28, kind: a.kind });
    }
    // x-ray the frame: members on this load path stay visible, everything else nearly disappears
    const keep = new Set(members);
    for (const [id, mat] of mats) {
      const on = keep.has(id);
      mat.transparent = true;
      mat.opacity = on ? 0.5 : 0.13;
      mat.depthWrite = false;
      mat.color.set(on ? '#ffffff' : '#7b8592');
      mat.emissive.set('#000000');
      mat.emissiveIntensity = 0;
      mat.needsUpdate = true;
    }
    for (const mesh of meshes) mesh.castShadow = false;
  };
  const updateLoad = (dt: number) => {
    loadT += dt;
    if (loadMode === 'seismic') {
      sway = 0.6 * Math.sin(loadT * Math.PI * 1.7) * (0.75 + 0.25 * Math.sin(loadT * 0.9));
      dirty = true;
    }
    if (pulseMesh) {
      let k = 0;
      for (const r of runs) {
        for (let j = 0; j < r.n; j++)
          for (let t = 0; t < 3; t++) {
            const u = ((((loadT * 5.5 + (j * r.len) / r.n - t * 0.45) % r.len) + r.len) % r.len);
            let i = 1;
            while (i < r.cum.length - 1 && r.cum[i] < u) i++;
            const f = (u - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1] || 1);
            pv.lerpVectors(r.pts[i - 1], r.pts[i], f);
            pv.z += swayAt(pv.y);
            m4.compose(pv, IDQ, ps.setScalar(1 - t * 0.3));
            pulseMesh.setMatrixAt(k++, m4);
          }
      }
      pulseMesh.instanceMatrix.needsUpdate = true;
    }
    for (const a of arrowObjs) {
      const bob = a.kind === 'load' ? 0.35 * (0.5 + 0.5 * Math.sin(loadT * 4 + a.phase)) : 0;
      a.obj.position.copy(a.base).addScaledVector(a.dir, -bob);
      a.obj.position.z += swayAt(a.base.y);
    }
  };
  const setLoad = (mode: LoadMode | null) => {
    clearLoad();
    loadMode = mode;
    if (mode) {
      if (selected) {
        selected = null;
        ui.onSelect?.(null);
      }
      if (ui.pin) ui.pin.hidden = true;
      explodeTarget = 0;
      if (T < 1 + DUR) {
        T = 1 + DUR;
        playing = false;
        ui.onProgress?.(1);
      }
      buildLoad(mode);
    } else applySelection();
    ui.onLoad?.(mode);
  };

  // ----- pointer: hover tooltip + click to select -----
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downAt: { x: number; y: number } | null = null;
  const pick = (ev: PointerEvent): MemberId | null => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const targets = meshes.filter((m) => m.userData.c !== 'slab' && (selected === null || m.userData.c === selected));
    const hit = ray.intersectObjects(targets, false)[0];
    return hit ? (hit.object.userData.c as MemberId) : null;
  };
  let hoverRaf = 0;
  const onMove = (ev: PointerEvent) => {
    if (coarse || !ui.tip || downAt) return;
    cancelAnimationFrame(hoverRaf);
    hoverRaf = requestAnimationFrame(() => {
      const c = pick(ev);
      const tip = ui.tip!;
      tip.hidden = !c;
      renderer.domElement.style.cursor = c ? 'pointer' : 'grab';
      if (c) {
        const r = container.getBoundingClientRect();
        tip.textContent = MEMBERS[c].name;
        tip.style.transform = `translate(${ev.clientX - r.left + 14}px, ${ev.clientY - r.top + 14}px)`;
      }
    });
  };
  const onDown = (ev: PointerEvent) => (downAt = { x: ev.clientX, y: ev.clientY });
  const onUp = (ev: PointerEvent) => {
    if (downAt && Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y) < 6) {
      const c = pick(ev);
      select(c && c !== selected ? c : null);
    }
    downAt = null;
  };
  const onLeave = () => {
    if (ui.tip) ui.tip.hidden = true;
  };
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointerleave', onLeave);

  controls.addEventListener('start', () => {
    fly = null;
    controls.autoRotate = false;
    window.clearTimeout(idleTimer);
  });
  controls.addEventListener('end', () => {
    idleTimer = window.setTimeout(() => (controls.autoRotate = !reduced), 9000);
  });

  // ----- sizing -----
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    homeDist = 96 / Math.min(1, camera.aspect / 1.45) ** 0.6;
    controls.maxDistance = homeDist * 2;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ----- loop (only while on screen) -----
  let visible = false;
  let raf = 0;
  let last = performance.now();
  const introFrom = camera.position.clone();
  const tmp = new V3();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (playing) {
      T += dt / BUILD_SECONDS;
      if (T >= 1 + DUR) {
        T = 1 + DUR;
        playing = false;
      }
      ui.onProgress?.(Math.min(1, T));
      dirty = true;
    }
    if (Math.abs(explode - explodeTarget) > 1e-3) {
      const before = ease(explode);
      explode += Math.sign(explodeTarget - explode) * Math.min(Math.abs(explodeTarget - explode), dt / 0.9);
      const d = ease(explode) - before;
      // keep the opened-up model in frame: lift the orbit target and pull the camera back
      controls.target.y += d * 6.5;
      camera.position.y += d * 6.5;
      camera.position.sub(controls.target).multiplyScalar(1 + d * 0.22).add(controls.target);
      dirty = true;
    }
    if (loadMode) updateLoad(dt);
    if (dirty) {
      updateMatrices();
      dirty = false;
    }
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / 1.1);
      const k = ease(fly.t);
      controls.target.lerpVectors(fly.fromT, fly.toT, k);
      camera.position.lerpVectors(fly.fromP, fly.toP, k);
      if (fly.t >= 1) fly = null;
    }
    if (intro < 1) {
      intro = Math.min(1, intro + dt / 3.2);
      tmp.copy(center).addScaledVector(homeDir, homeDist);
      camera.position.lerpVectors(introFrom, tmp, ease(intro));
    }
    controls.update(dt);
    if (selected && ui.pin) {
      // pin the label to the member of the selected type nearest the camera
      let best = -1;
      let bestD = Infinity;
      for (const i of byCat.get(selected)!) {
        const d = pieceWorld(pieces[i], tmp).distanceToSquared(camera.position);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (best >= 0) {
        pieceWorld(pieces[best], tmp).project(camera);
        const r = container.getBoundingClientRect();
        ui.pin.style.transform = `translate(${((tmp.x + 1) / 2) * r.width}px, ${((1 - tmp.y) / 2) * r.height}px)`;
        ui.pin.style.opacity = tmp.z < 1 ? '1' : '0';
      }
    }
    renderer.render(scene, camera);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      if (T === 0) playing = true;
      raf = requestAnimationFrame(frame);
    } else if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(container);
  updateMatrices();

  return {
    select,
    setLoad,
    setExplode(on) {
      if (on && loadMode) setLoad(null);
      explodeTarget = on ? 1 : 0;
    },
    replay() {
      T = 0;
      playing = true;
      dirty = true;
    },
    zoom(dir) {
      const d = camera.position.distanceTo(controls.target);
      const nd = THREE.MathUtils.clamp(d * (dir > 0 ? 0.8 : 1.25), controls.minDistance, controls.maxDistance);
      camera.position.sub(controls.target).setLength(nd).add(controls.target);
      intro = 1;
    },
    counts,
    total: new Set(pieces.map((p, i) => p.k ?? `p${i}`)).size,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
    },
  };
}
