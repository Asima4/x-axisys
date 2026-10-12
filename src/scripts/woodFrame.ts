// Procedural light-frame (wood) house: every stud, plate, header, joist, rafter, truss and connector
// is generated from real lumber dimensions, then assembled piece by piece with an optional exploded view.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MEMBERS, type MemberId } from '../data/woodFrame';

type Shape = 'box' | 'cyl';
type Piece = { c: MemberId; lvl: number; shape: Shape; pos: THREE.Vector3; size: THREE.Vector3; quat: THREE.Quaternion; t: number };
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

function buildPieces(): Piece[] {
  const pieces: Piece[] = [];
  const box = (c: MemberId, lvl: number, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    pieces.push({
      c,
      lvl,
      shape: 'box',
      pos: new V3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
      size: new V3(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)),
      quat: new THREE.Quaternion(),
      t: 0,
    });
  };
  const cyl = (c: MemberId, lvl: number, x: number, z: number, y0: number, y1: number, r: number) => {
    pieces.push({ c, lvl, shape: 'cyl', pos: new V3(x, (y0 + y1) / 2, z), size: new V3(r * 2, y1 - y0, r * 2), quat: new THREE.Quaternion(), t: 0 });
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
    pieces.push({ c, lvl, shape: 'box', pos: center, size: new V3(len, depth, thick), quat, t: 0 });
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
        if (o.lvl === 1) {
          map('holdown', face, face + side * 0.03, PL, PL + 1.15, o.depth * 0.22, o.depth * 0.78);
          map('holdown', face, face + side * 0.3, PL, PL + 0.05, o.depth * 0.22, o.depth * 0.78);
          const p = world(face + side * 0.17, o.depth / 2);
          cyl('holdown', 1, p.x, p.z, o.y0 - 0.45, o.y0 + PL + 0.3, 0.032);
        } else {
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
        cyl('anchor', 0, p.x, p.z, o.y0 - 0.45, o.y0 + PL + 0.16, 0.026);
        map('anchor', a - 0.1, a + 0.1, PL, PL + 0.025, o.depth / 2 - 0.1, o.depth / 2 + 0.1, 0);
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
  wall({ ...g, x0: 0, z0: D6, dir: 'z', len: DP - 2 * D6, inward: 1, depth: D6, anchors: true, openings: [{ at: 1.6, w: 2.2, type: 'window' }, { at: 14, w: 3.17, type: 'door' }] });
  wall({ ...g, x0: W, z0: D6, dir: 'z', len: DP - 2 * D6, inward: -1, depth: D6, anchors: true, openings: [{ at: 6, w: 3, type: 'window' }, { at: 16, w: 4, type: 'window' }] });
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
  const joistX: number[] = [];
  for (let k = 1; k * OC < W - 0.3; k++) {
    const x = k * OC;
    joistX.push(x);
    box('joist', 2, x - T, yb, T, x, yt, 12 + 0.6);
    box('joist', 2, x, yb, 12 - 0.6, x + T, yt, DP - T);
  }
  for (const [zr, front] of [[6, true], [18, false]] as const) {
    const edges: [number, number][] = [[0, T], ...joistX.map((x) => (front ? [x - T, x] : [x, x + T]) as [number, number]), [W - T, W]];
    for (let i = 0; i < edges.length - 1; i++) {
      const z0 = zr + (i % 2 ? 0 : -T);
      box('joistBlock', 2, edges[i][1], yb, z0, edges[i + 1][0], yt, z0 + T);
    }
  }
  for (let j = 0; j < 6; j++) {
    for (let x = j % 2 ? -4 : 0; x < W; x += 8) {
      const x0 = Math.max(0, x) + 0.005;
      const x1 = Math.min(W, x + 8) - 0.005;
      box('subfloor', 2, x0, yt, j * 4 + 0.005, x1, yt + SUB, j * 4 + 4 - 0.005);
    }
  }

  const u = { y0: F2, lvl: 3, plate: 'bottomPlate' as MemberId };
  wall({ ...u, x0: 0, z0: 0, dir: 'x', len: W, inward: 1, depth: D6, openings: [{ at: 6, w: 3, type: 'window' }, { at: 16, w: 4, type: 'window' }, { at: 26, w: 3, type: 'window' }] });
  wall({ ...u, x0: 0, z0: DP, dir: 'x', len: W, inward: -1, depth: D6, openings: [{ at: 9, w: 3, type: 'window' }, { at: 23, w: 3, type: 'window' }], sheath: [[0, 4], [W - 4, W]] });
  wall({ ...u, x0: 0, z0: D6, dir: 'z', len: DP - 2 * D6, inward: 1, depth: D6, openings: [{ at: 6, w: 3, type: 'window' }, { at: 17, w: 3, type: 'window' }] });
  wall({ ...u, x0: W, z0: D6, dir: 'z', len: DP - 2 * D6, inward: -1, depth: D6, openings: [{ at: 6, w: 3, type: 'window' }, { at: 16, w: 3, type: 'window' }] });
  wall({ ...u, x0: D6, z0: 12 - D4 / 2, dir: 'x', len: W - 2 * D6, inward: 1, depth: D4, openings: [{ at: 8, w: 2.67, type: 'door' }, { at: 24, w: 2.67, type: 'door' }] });
  wall({ ...u, x0: 16, z0: 12 + D4 / 2, dir: 'z', len: DP - D6 - (12 + D4 / 2), inward: 1, depth: D4, openings: [{ at: 4, w: 2.67, type: 'door' }] });

  // ===== main roof: rafters, ridge, ceiling joists, collar ties, gable studs, sub-fascia, hurricane ties =====
  const under = (z: number) => RB + ((z <= 12 ? z : DP - z) - D6) * PITCH; // rafter bottom line
  const zTail = -1.5;
  const zRidge = 12 - T / 2;
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
    if (i > 0 && i < 16) {
      box('hurricane', 4, xc - T / 2 - 0.014, RB - 0.32, D6 * 0.2, xc - T / 2, RB + 0.36, D6 * 0.85);
      box('hurricane', 4, xc - T / 2 - 0.014, RB - 0.32, DP - D6 * 0.85, xc - T / 2, RB + 0.36, DP - D6 * 0.2);
    }
  }
  const yR = under(zRidge);
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
  const xL = -16;
  const xR = -T;
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
    box('hurricane', 4, xL + 0.1, B - 0.3, zc + T / 2, xL + D6 - 0.1, B + 0.36, zc + T / 2 + 0.014);
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

export type FrameApi = {
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
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = 28;
  controls.maxDistance = 140;
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
    if (kind !== 'steel' && kind !== 'concrete') edgeShade(mat, kind === 'osb' ? 0.3 : 0.4);
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
    counts[id] = all.length;
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

  // ----- selection / ghosting -----
  let selected: MemberId | null = null;
  const applySelection = () => {
    for (const [id, mat] of mats) {
      const ghost = selected !== null && id !== selected;
      mat.transparent = ghost;
      mat.opacity = ghost ? 0.07 : 1;
      mat.depthWrite = !ghost;
      mat.emissive.set(id === selected ? MEMBERS[id].color : '#000000');
      mat.emissiveIntensity = id === selected ? 0.45 : 0;
      mat.needsUpdate = true;
    }
    for (const mesh of meshes) mesh.castShadow = selected === null ? mesh.userData.c !== 'slab' : mesh.userData.c === selected;
    if (ui.pin) ui.pin.hidden = selected === null;
    if (ui.pin && selected) ui.pin.querySelector('span')!.textContent = MEMBERS[selected].name;
  };
  const select = (c: MemberId | null) => {
    selected = c;
    applySelection();
    ui.onSelect?.(c);
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

  let idleTimer = 0;
  controls.addEventListener('start', () => {
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
    controls.maxDistance = homeDist * 1.8;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ----- loop (only while on screen) -----
  let visible = false;
  let raf = 0;
  let last = performance.now();
  let intro = reduced ? 1 : 0;
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
    if (dirty) {
      updateMatrices();
      dirty = false;
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
    setExplode(on) {
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
    total: pieces.length,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
    },
  };
}
