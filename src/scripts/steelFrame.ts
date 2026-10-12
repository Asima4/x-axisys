// Procedural two-storey structural steel building for the frame explorer: footings, base plates, W-shape
// columns/girders/beams as real I-sections, chevron braces, composite deck with shear studs, open-web roof joists
// and the shear-tab connections — built at true section sizes (feet).

import * as THREE from 'three';
import { STEEL_MEMBERS } from '../data/steelFrame';
import { mountFrame, type FrameModel, type FrameUi, type Piece } from './woodFrame';

const V3 = THREE.Vector3;
const IN = 1 / 12;
const XS = [0, 30, 60, 90];
const ZS = [0, 25, 50];
const L2 = 14;
const RF = 28;
type W = { d: number; bf: number; tf: number; tw: number };
const COL: W = { d: 12.06 * IN, bf: 9.995 * IN, tf: 0.575 * IN, tw: 0.345 * IN };
const GIR: W = { d: 20.66 * IN, bf: 6.5 * IN, tf: 0.45 * IN, tw: 0.35 * IN };
const RGIR: W = { d: 17.7 * IN, bf: 6.0 * IN, tf: 0.425 * IN, tw: 0.3 * IN };
const BM: W = { d: 15.69 * IN, bf: 5.5 * IN, tf: 0.345 * IN, tw: 0.25 * IN };
const BP = 0.104;

export function buildSteelPieces(): Piece[] {
  const pieces: Piece[] = [];
  let K: string | undefined;
  let nu = 0;
  const unit = (fn: () => void) => {
    const prev = K;
    K = `s${nu++}`;
    fn();
    K = prev;
  };
  const box = (c: string, lvl: number, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) =>
    pieces.push({ c, lvl, shape: 'box', pos: new V3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), size: new V3(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), quat: new THREE.Quaternion(), t: 0, k: K });
  const cylY = (c: string, lvl: number, x: number, z: number, y0: number, y1: number, r: number) =>
    pieces.push({ c, lvl, shape: 'cyl', pos: new V3(x, (y0 + y1) / 2, z), size: new V3(r * 2, y1 - y0, r * 2), quat: new THREE.Quaternion(), t: 0, k: K });
  const ALONG_X = new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), Math.PI / 2);
  const ALONG_Z = new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), Math.PI / 2);
  const bolt = (lvl: number, x: number, y: number, z: number, axis: 'x' | 'z', len = 0.22) =>
    pieces.push({ c: 'bolt', lvl, shape: 'cyl', pos: new V3(x, y, z), size: new V3(0.0625, len, 0.0625), quat: (axis === 'x' ? ALONG_X : ALONG_Z).clone(), t: 0 });
  /** Straight member of square section w between two points (centreline). */
  const bar = (c: string, lvl: number, a: THREE.Vector3, b: THREE.Vector3, w: number, h = w) => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    dir.normalize();
    const up = Math.abs(dir.y) > 0.95 ? new V3(1, 0, 0) : new V3(0, 1, 0);
    const side = new V3().crossVectors(dir, up).normalize();
    const n = new V3().crossVectors(side, dir).normalize();
    const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, n, side));
    pieces.push({ c, lvl, shape: 'box', pos: a.clone().add(b).multiplyScalar(0.5), size: new V3(len, h, w), quat, t: 0, k: K });
  };
  // I-section along x or z with its top of steel at `top`
  const iBeam = (c: string, lvl: number, s: W, axis: 'x' | 'z', a: number, b: number, at: number, top: number) =>
    unit(() => {
      const yb = top - s.d;
      if (axis === 'x') {
        box(c, lvl, a, top - s.tf, at - s.bf / 2, b, top, at + s.bf / 2);
        box(c, lvl, a, yb, at - s.bf / 2, b, yb + s.tf, at + s.bf / 2);
        box(c, lvl, a, yb + s.tf, at - s.tw / 2, b, top - s.tf, at + s.tw / 2);
      } else {
        box(c, lvl, at - s.bf / 2, top - s.tf, a, at + s.bf / 2, top, b);
        box(c, lvl, at - s.bf / 2, yb, a, at + s.bf / 2, yb + s.tf, b);
        box(c, lvl, at - s.tw / 2, yb + s.tf, a, at + s.tw / 2, top - s.tf, b);
      }
    });

  // ----- foundations, anchor rods, base plates, columns -----
  box('slabOnGrade', 0, -1, -0.42, -1, 91, 0, 51);
  for (const x of XS)
    for (const z of ZS) {
      unit(() => {
        box('footing', 0, x - 3, -3.5, z - 3, x + 3, -2, z + 3);
        box('footing', 0, x - 1, -2, z - 1, x + 1, -0.43, z + 1);
      });
      for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]])
        unit(() => {
          cylY('anchorRod', 0, x + dx, z + dz, -1.6, BP + 0.2, 0.031);
          box('anchorRod', 0, x + dx - 0.11, BP, z + dz - 0.11, x + dx + 0.11, BP + 0.02, z + dz + 0.11);
          box('anchorRod', 0, x + dx - 0.055, BP + 0.02, z + dz - 0.055, x + dx + 0.055, BP + 0.09, z + dz + 0.055);
        });
      unit(() => {
        box('basePlate', 1, x - 0.75, -0.08, z - 0.75, x + 0.75, 0, z + 0.75);
        box('basePlate', 1, x - 0.75, 0, z - 0.75, x + 0.75, BP, z + 0.75);
      });
      // column: flanges face z, web along z
      unit(() => {
        box('column', 1, x - COL.bf / 2, BP, z - COL.d / 2, x + COL.bf / 2, RF - 0.05, z - COL.d / 2 + COL.tf);
        box('column', 1, x - COL.bf / 2, BP, z + COL.d / 2 - COL.tf, x + COL.bf / 2, RF - 0.05, z + COL.d / 2);
        box('column', 1, x - COL.tw / 2, BP, z - COL.d / 2 + COL.tf, x + COL.tw / 2, RF - 0.05, z + COL.d / 2 - COL.tf);
      });
    }

  // ----- floor and roof framing with shear tabs -----
  const tabX = (lvl: number, top: number, s: W, x: number, z0: number, dir: 1 | -1) =>
    // tab beside a girder web running along x, bolts along z
    unit(() => {
      const y0 = top - s.d + 0.3;
      const y1 = top - 0.3;
      box('shearTab', lvl, x - 0.19 * dir, y0, z0 + s.tw / 2, x - 0.19 * dir + 0.37 * dir, y1, z0 + s.tw / 2 + 0.031);
      for (let y = y0 + 0.2; y < y1 - 0.1; y += 0.25) bolt(lvl, x, y, z0, 'z');
    });
  const tabZ = (lvl: number, top: number, s: W, x0: number, z: number, dir: 1 | -1) =>
    unit(() => {
      const y0 = top - s.d + 0.25;
      const y1 = top - 0.25;
      box('shearTab', lvl, x0 + s.tw / 2, y0, z, x0 + s.tw / 2 + 0.031, y1, z + 0.37 * dir);
      for (let y = y0 + 0.17; y < y1 - 0.08; y += 0.25) bolt(lvl, x0, y, z + 0.19 * dir, 'x');
    });
  for (const [lvl, top, G] of [[2, L2, GIR], [4, RF, RGIR]] as const) {
    for (const z of ZS)
      for (let i = 0; i < XS.length - 1; i++) {
        const a = XS[i] + COL.bf / 2 + 0.04;
        const b = XS[i + 1] - COL.bf / 2 - 0.04;
        iBeam('girder', lvl, G, 'x', a, b, z, top);
        tabX(lvl, top, G, a + 0.1, z, 1);
        tabX(lvl, top, G, b - 0.1, z, -1);
      }
  }
  // floor beams at 10' o.c. spanning between girders (z), top flange flush with the girders
  for (let x = 0; x <= 90; x += 10)
    for (let j = 0; j < ZS.length - 1; j++) {
      const onCol = XS.includes(x);
      const a = ZS[j] + (onCol ? COL.d / 2 + 0.04 : GIR.tw / 2 + 0.04);
      const b = ZS[j + 1] - (onCol ? COL.d / 2 + 0.04 : GIR.tw / 2 + 0.04);
      iBeam('beam', 2, BM, 'z', a, b, x, L2);
      tabZ(2, L2, BM, x, a, 1);
      tabZ(2, L2, BM, x, b, -1);
    }

  // ----- composite deck, studs and slab (bay A-B left without concrete to show deck and studs) -----
  const deckTop = L2 + 0.25;
  for (let z = 0.5; z < 50; z += 1) box('deck', 3, -0.4, L2, z - 0.21, 90.4, deckTop - 0.01, z + 0.21);
  unit(() => box('deck', 3, -0.4, deckTop - 0.01, -0.4, 90.4, deckTop, 50.4));
  for (const x of [0, 10, 20, 30])
    for (let z = 1; z < 50; z += 1) {
      if (ZS.some((zc) => Math.abs(z - zc) < 0.6)) continue;
      unit(() => {
        cylY('studs', 3, x, z, L2, L2 + 0.375, 0.031);
        cylY('studs', 3, x, z, L2 + 0.375, L2 + 0.41, 0.055);
      });
    }
  unit(() => box('slab', 3, 30, deckTop, -0.4, 90.4, deckTop + 0.27, 50.4));

  // ----- roof: open-web joists @ 5' on the girders, roof deck over bay C-D -----
  for (let x = 5; x < 90; x += 5) {
    if (XS.includes(x)) continue;
    for (let j = 0; j < ZS.length - 1; j++) {
      const za = ZS[j] + 0.1;
      const zb = ZS[j + 1] - 0.1;
      unit(() => {
        const tc = RF + 0.21;
        const bc = tc - 1.5;
        box('joist', 4, x - 0.03, RF, za, x + 0.03, tc, za + 0.4);
        box('joist', 4, x - 0.03, RF, zb - 0.4, x + 0.03, tc, zb);
        box('joist', 4, x - 0.14, tc - 0.17, za, x + 0.14, tc, zb);
        box('joist', 4, x - 0.14, bc, za + 1.2, x + 0.14, bc + 0.17, zb - 1.2);
        const n = 10;
        for (let k = 0; k < n; k++) {
          const z0 = za + 0.4 + ((zb - za - 0.8) * k) / n;
          const z1 = za + 0.4 + ((zb - za - 0.8) * (k + 1)) / n;
          const up = k % 2 === 0;
          bar('joist', 4, new V3(x, up ? tc - 0.17 : bc + 0.17, z0), new V3(x, up ? bc + 0.17 : tc - 0.17, z1), 0.07);
        }
      });
    }
  }
  unit(() => box('roofDeck', 4, 60, RF + 0.21, -0.4, 90.4, RF + 0.24, 50.4));

  // ----- chevron braced frames, one bay on each side, both storeys -----
  const chevron = (a: THREE.Vector3, b: THREE.Vector3, lvlTop: number, storeyBase: number, girderD: number, axis: 'x' | 'z') => {
    const mid = a.clone().lerp(b, 0.5);
    const peak = mid.clone().setY(lvlTop - girderD - 0.9);
    for (const base of [a, b]) {
      const foot = base.clone().setY(storeyBase + 1.1);
      const inward = mid.clone().sub(base).setY(0).normalize();
      foot.addScaledVector(inward, 0.9);
      bar('brace', 1, foot, peak, 0.5);
      unit(() => {
        const g = foot.clone().addScaledVector(inward, -0.25);
        if (axis === 'x') box('gusset', 1, g.x - 0.9, storeyBase + 0.1, g.z - 0.03, g.x + 0.9, storeyBase + 1.9, g.z + 0.03);
        else box('gusset', 1, g.x - 0.03, storeyBase + 0.1, g.z - 0.9, g.x + 0.03, storeyBase + 1.9, g.z + 0.9);
      });
    }
    unit(() => {
      if (axis === 'x') box('gusset', 1, mid.x - 1.2, peak.y - 0.6, mid.z - 0.03, mid.x + 1.2, lvlTop - girderD, mid.z + 0.03);
      else box('gusset', 1, mid.x - 0.03, peak.y - 0.6, mid.z - 1.2, mid.x + 0.03, lvlTop - girderD, mid.z + 1.2);
    });
  };
  for (const [base, top, d] of [[BP, L2, GIR.d], [L2, RF, RGIR.d]] as const) {
    chevron(new V3(0, 0, 0), new V3(30, 0, 0), top, base, d, 'x');
    chevron(new V3(60, 0, 50), new V3(90, 0, 50), top, base, d, 'x');
    chevron(new V3(0, 0, 0), new V3(0, 0, 25), top, base, BM.d, 'z');
    chevron(new V3(90, 0, 25), new V3(90, 0, 50), top, base, BM.d, 'z');
  }

  // ----- assembly timing -----
  const stage: Record<string, [number, number]> = {
    footing: [0, 0.07],
    slabOnGrade: [0.06, 0.1],
    anchorRod: [0.09, 0.13],
    basePlate: [0.12, 0.16],
    column: [0.15, 0.27],
    girder: [0.27, 0.36],
    beam: [0.35, 0.45],
    shearTab: [0.3, 0.5],
    bolt: [0.4, 0.55],
    brace: [0.46, 0.56],
    gusset: [0.5, 0.58],
    deck: [0.56, 0.66],
    studs: [0.65, 0.7],
    slab: [0.69, 0.75],
    joist: [0.78, 0.9],
    roofDeck: [0.9, 0.97],
  };
  const roofTiming: Record<string, [number, number]> = { girder: [0.74, 0.8], shearTab: [0.76, 0.82], bolt: [0.78, 0.84] };
  const groups = new Map<string, Piece[]>();
  for (const p of pieces) {
    const key = `${p.lvl}:${p.c}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  for (const [key, list] of groups) {
    const [lvl, c] = key.split(':');
    const [t0, t1] = (lvl === '4' ? roofTiming[c] : undefined) ?? stage[c] ?? [0.9, 0.95];
    const ks = list.map((p) => p.pos.x + p.pos.z * 0.6 + p.pos.y * 0.4);
    const lo = Math.min(...ks);
    const hi = Math.max(...ks);
    list.forEach((p, i) => (p.t = t0 + (t1 - t0) * 0.88 * (hi > lo ? (ks[i] - lo) / (hi - lo) : 0)));
  }
  return pieces;
}

export const steelModel = (): FrameModel => ({
  pieces: buildSteelPieces(),
  members: STEEL_MEMBERS,
  explodeY: [0, 3, 8, 11.5, 17],
  center: new V3(45, 13, 25),
  dist: 178,
  size: 62,
});

export const mountSteelFrame = (container: HTMLElement, ui: FrameUi = {}) => mountFrame(container, ui, steelModel());
