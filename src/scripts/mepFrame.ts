// Concept MEP / BIM coordination model: one office floor (60' x 40', 20' grid) with its ceiling plenum —
// supply & return ductwork, VAV boxes and diffusers, chilled / hot water, domestic water and sanitary,
// fire sprinklers, cable tray and lighting, hangers and seismic bracing — stacked at realistic elevations.
// Units: feet. Floor at y = 0, ceiling at 9'-6", bottom of beams at 12'-6".

import * as THREE from 'three';
import { MEP_MEMBERS } from '../data/mepModel';
import { mountFrame, type Arrow, type FrameModel, type FrameUi, type Piece } from './woodFrame';

const V3 = THREE.Vector3;
const CEIL = 9.5;
const BEAM_BOT = 12.5;
const TOS = 14;
const DUCT_TOP = 11.37;
const CHW_Y = 11.75;
const HW_Y = 11.72;
const DOM_Y = 11.6;
const SPR_MAIN_Y = 12.2;
const SPR_BR_Y = 12.15;
const TRAY_Y = 11.5;
const TRAY_END = 48;
const COND_Y = 12.35;
const COLS = [0, 20, 40, 60];
const ROWS = [0, 20, 40];
const BRANCH_X = [12, 30, 48];
const FIRE_X = [8, 17, 28, 37, 50];
const HEAD_Z = [8, 20, 32];
const GRILLE_X = [16, 34, 50];
const LIGHT_X = [5, 15, 25, 35, 45, 55];
const LIGHT_Z = [11, 17, 34];
const FIXTURES: [number, number, 'wc' | 'lav'][] = [
  [51, 38.6, 'wc'],
  [53.5, 38.6, 'wc'],
  [56, 38.6, 'wc'],
  [52, 32.7, 'lav'],
  [55, 32.7, 'lav'],
];

export function buildMepPieces(): Piece[] {
  const pieces: Piece[] = [];
  let K: string | undefined;
  let nu = 0;
  const unit = (fn: () => void) => {
    const prev = K;
    K = `m${nu++}`;
    fn();
    K = prev;
  };
  const box = (c: string, lvl: number, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) =>
    pieces.push({ c, lvl, shape: 'box', pos: new V3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), size: new V3(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), quat: new THREE.Quaternion(), t: 0, k: K });
  const Q = {
    x: new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), Math.PI / 2),
    y: new THREE.Quaternion(),
    z: new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), Math.PI / 2),
  };
  /** Pipe (cylinder) along an axis between a and b on that axis, centred at the other two coordinates. */
  const pipe = (c: string, lvl: number, axis: 'x' | 'y' | 'z', a: number, b: number, p: number, q: number, r: number) => {
    const mid = (a + b) / 2;
    const pos = axis === 'x' ? new V3(mid, p, q) : axis === 'y' ? new V3(p, mid, q) : new V3(p, q, mid);
    pieces.push({ c, lvl, shape: 'cyl', pos, size: new V3(r * 2, Math.abs(b - a), r * 2), quat: Q[axis].clone(), t: 0, k: K });
  };
  /** Sloped pipe between two points (used for sanitary and braces). */
  const run = (c: string, lvl: number, a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    const d = b.clone().sub(a);
    const quat = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.clone().normalize());
    pieces.push({ c, lvl, shape: 'cyl', pos: a.clone().add(b).multiplyScalar(0.5), size: new V3(r * 2, d.length(), r * 2), quat, t: 0, k: K });
  };
  const rod = (lvl: number, x: number, z: number, y0: number) => pipe('support', lvl, 'y', y0, TOS, x, z, 0.03);
  /** Trapeze hanger under a run along x (or z): two rods and a strut channel. */
  const trapeze = (lvl: number, along: 'x' | 'z', at: number, c0: number, c1: number, yb: number) =>
    unit(() => {
      if (along === 'x') {
        rod(lvl, at, c0 - 0.15, yb);
        rod(lvl, at, c1 + 0.15, yb);
        box('support', lvl, at - 0.07, yb - 0.14, c0 - 0.3, at + 0.07, yb, c1 + 0.3);
      } else {
        rod(lvl, c0 - 0.15, at, yb);
        rod(lvl, c1 + 0.15, at, yb);
        box('support', lvl, c0 - 0.3, yb - 0.14, at - 0.07, c1 + 0.3, yb, at + 0.07);
      }
    });
  const clevis = (lvl: number, along: 'x' | 'z', at: number, p: number, yc: number, r: number) =>
    unit(() => {
      const x = along === 'x' ? at : p;
      const z = along === 'x' ? p : at;
      rod(lvl, x, z, yc + r);
      box('support', lvl, x - (along === 'x' ? 0.05 : r + 0.04), yc - r - 0.05, z - (along === 'x' ? r + 0.04 : 0.05), x + (along === 'x' ? 0.05 : r + 0.04), yc - r, z + (along === 'x' ? r + 0.04 : 0.05));
    });
  const sway = (lvl: number, x: number, y: number, z: number, dir: 'x' | 'z') =>
    unit(() => run('support', lvl, new V3(x, y, z), new V3(x + (dir === 'x' ? TOS - y : 0), TOS, z + (dir === 'z' ? TOS - y : 0)), 0.035));

  // ===== building context =====
  box('slab', 0, -1, -0.5, -1, 61, 0, 41);
  for (const x of COLS) for (const z of ROWS) unit(() => box('column', 0, x - 0.75, 0, z - 0.75, x + 0.75, TOS, z + 0.75));
  const beam = (along: 'x' | 'z', at: number, a: number, b: number) =>
    unit(() => {
      if (along === 'x') {
        box('beam', 0, a, TOS - 0.06, at - 0.3, b, TOS, at + 0.3);
        box('beam', 0, a, BEAM_BOT, at - 0.3, b, BEAM_BOT + 0.06, at + 0.3);
        box('beam', 0, a, BEAM_BOT + 0.06, at - 0.03, b, TOS - 0.06, at + 0.03);
      } else {
        box('beam', 0, at - 0.3, TOS - 0.06, a, at + 0.3, TOS, b);
        box('beam', 0, at - 0.3, BEAM_BOT, a, at + 0.3, BEAM_BOT + 0.06, b);
        box('beam', 0, at - 0.03, BEAM_BOT + 0.06, a, at + 0.03, TOS - 0.06, b);
      }
    });
  for (const z of ROWS) for (let i = 0; i < COLS.length - 1; i++) beam('x', z, COLS[i] + 0.75, COLS[i + 1] - 0.75);
  for (const x of COLS) for (let i = 0; i < ROWS.length - 1; i++) beam('z', x, ROWS[i] + 0.75, ROWS[i + 1] - 0.75);
  // ceiling grid (open, so the plenum stays visible)
  for (let z = 0; z <= 40; z += 4) box('ceiling', 1, 0, CEIL, z - 0.04, 60, CEIL + 0.12, z + 0.04);
  for (let x = 0; x <= 60; x += 2) box('ceiling', 1, x - 0.03, CEIL, 0, x + 0.03, CEIL + 0.08, 40);

  // ===== HVAC =====
  unit(() => {
    box('ahu', 2, 1, 0, 30.5, 13, 0.5, 37.5);
    box('ahu', 2, 1.5, 0.5, 31, 12.5, 7, 37);
    box('ahu', 2, 6.5, 0.6, 30.9, 8.5, 6.8, 31);
  });
  // supply: riser, trunk A along z at x = 4, trunk B along x at z = 14 (reducing)
  unit(() => {
    box('supplyDuct', 2, 2.75, 7, 33.4, 5.25, DUCT_TOP, 34.6);
    box('supplyDuct', 2, 2.75, 10.2, 14, 5.25, DUCT_TOP, 34.6);
  });
  unit(() => {
    box('supplyDuct', 2, 2.75, 10.2, 12.75, 24, DUCT_TOP, 15.25);
    box('supplyDuct', 2, 24, 10.37, 13, 42, DUCT_TOP, 15);
    box('supplyDuct', 2, 42, 10.54, 13.25, 56, DUCT_TOP, 14.75);
  });
  const TRUNK_EDGE: Record<number, [number, number]> = { 12: [12.75, 15.25], 30: [13, 15], 48: [13.25, 14.75] };
  for (const x of BRANCH_X) {
    const [s0, n0] = TRUNK_EDGE[x];
    for (const [z0, z1, vz0, vz1] of [[n0, 22, n0 + 0.75, n0 + 3.25], [s0, 6, s0 - 3.25, s0 - 0.75]] as const) {
      unit(() => box('supplyDuct', 2, x - 0.67, 10.54, Math.min(z0, z1), x + 0.67, DUCT_TOP, Math.max(z0, z1)));
      unit(() => {
        box('vav', 2, x - 0.95, 10.3, vz0, x + 0.95, DUCT_TOP, vz1);
        pipe('vav', 2, 'x', x + 0.95, x + 1.3, 10.8, (vz0 + vz1) / 2, 0.08);
      });
      unit(() => pipe('flex', 2, 'y', CEIL + 0.25, 10.54, x, z1 + (z1 > z0 ? -0.5 : 0.5), 0.42));
      unit(() => box('diffuser', 2, x - 1, CEIL, z1 + (z1 > z0 ? -1.5 : -0.5), x + 1, CEIL + 0.25, z1 + (z1 > z0 ? 0.5 : 1.5)));
    }
    trapeze(2, 'x', x - 3, s0, n0, 10.2 + (x === 48 ? 0.34 : x === 30 ? 0.17 : 0));
  }
  for (const z of [18, 26]) trapeze(2, 'z', z, 2.75, 5.25, 10.2);
  for (const [x, a, b, yb] of [[8, 12.75, 15.25, 10.2], [20.5, 12.75, 15.25, 10.2], [36, 13, 15, 10.37], [52, 13.25, 14.75, 10.54]] as const) trapeze(2, 'x', x, a, b, yb);
  sway(2, 20.5, 10.1, 15.4, 'z');
  sway(2, 52, 10.44, 14.9, 'z');
  // return: riser, main along z at x = 10, main along x at z = 26, open boots to grilles
  unit(() => {
    box('returnDuct', 2, 9.08, 7, 33.5, 10.92, DUCT_TOP, 34.5);
    box('returnDuct', 2, 9.08, 10.37, 25.08, 10.92, DUCT_TOP, 34.5);
  });
  unit(() => box('returnDuct', 2, 10.92, 10.37, 25.08, 52, DUCT_TOP, 26.92));
  for (const x of GRILLE_X) {
    unit(() => box('returnDuct', 2, x - 0.75, CEIL + 0.25, 25.25, x + 0.75, 10.37, 26.75));
    unit(() => box('diffuser', 2, x - 1, CEIL, 25, x + 1, CEIL + 0.25, 27));
  }
  for (const x of [22, 44]) trapeze(2, 'x', x, 25.08, 26.92, 10.37);

  // ===== piping =====
  // chilled water (S/R) and heating hot water from risers at x = 58 to the AHU coil
  for (const [c, z, y, r] of [['chw', 22, CHW_Y, 0.25], ['chw', 22.8, CHW_Y, 0.25], ['hw', 23.6, HW_Y, 0.15], ['hw', 24.2, HW_Y, 0.15]] as const) {
    const xr = z < 23 ? 6 + (z - 22) : 8 + (z - 23.6);
    unit(() => {
      pipe(c, 3, 'y', 0, y, 58 + (z - 22) * 0.6, z, r);
      pipe(c, 3, 'x', xr, 58 + (z - 22) * 0.6, y, z, r);
      pipe(c, 3, 'z', z, 31.5, xr, y, r);
      pipe(c, 3, 'y', 5.5, y, xr, 31.5, r);
    });
  }
  for (const x of [14, 26, 36, 46, 54]) clevis(3, 'x', x, 22, CHW_Y, 0.25);
  sway(3, 33, CHW_Y - 0.3, 22.4, 'x');
  unit(() => {
    box('equipment', 3, 12.8, 0, 31.2, 14.2, 1.4, 32.4);
    pipe('equipment', 3, 'x', 14.2, 15, 0.7, 31.8, 0.3);
  });
  unit(() => {
    box('equipment', 3, 12.8, 0, 33, 14.2, 1.4, 34.2);
    pipe('equipment', 3, 'x', 14.2, 15, 0.7, 33.6, 0.3);
  });
  unit(() => pipe('equipment', 3, 'y', 0, 5.4, 13.5, 38.3, 1.0));
  // domestic cold & hot water to the restroom
  for (const [c, z, r] of [['dcw', 30, 0.1], ['dhw', 30.5, 0.08]] as const) {
    unit(() => {
      pipe(c, 3, 'y', 5.4, DOM_Y, 13.5 + (c === 'dhw' ? 0.4 : -0.4), z < 30.2 ? 37.3 : 37.6, r);
      pipe(c, 3, 'z', z, z < 30.2 ? 37.3 : 37.6, 13.5 + (c === 'dhw' ? 0.4 : -0.4), DOM_Y, r);
      pipe(c, 3, 'x', 13.1, 56.5, DOM_Y, z, r);
    });
    for (const [fx, fz, kind] of FIXTURES) {
      if (c === 'dhw' && kind === 'wc') continue;
      unit(() => {
        pipe(c, 3, 'z', z, fz + (kind === 'wc' ? 0.3 : -0.4), fx + (c === 'dhw' ? 0.3 : 0), DOM_Y, r);
        pipe(c, 3, 'y', kind === 'wc' ? 1.3 : 2.4, DOM_Y, fx + (c === 'dhw' ? 0.3 : 0), fz + (kind === 'wc' ? 0.3 : -0.4), r);
      });
    }
  }
  for (const x of [20, 32, 44]) clevis(3, 'x', x, 30.25, DOM_Y, 0.12);
  // fixtures and sanitary below the slab, vent stack through the plenum
  for (const [fx, fz, kind] of FIXTURES)
    unit(() => {
      if (kind === 'wc') {
        box('fixture', 3, fx - 0.6, 0, fz - 1.2, fx + 0.6, 1.3, fz + 0.3);
        box('fixture', 3, fx - 0.7, 1.3, fz - 0.1, fx + 0.7, 2.6, fz + 0.4);
      } else {
        box('fixture', 3, fx - 1.1, 2.6, fz - 0.7, fx + 1.1, 2.9, fz + 0.7);
      }
    });
  unit(() => {
    for (const [fx, fz] of FIXTURES) run('sanitary', 3, new V3(fx, 0, fz), new V3(fx, -1.3 - (57 - fx) * 0.02, 36), 0.19);
    run('sanitary', 3, new V3(57.5, -1.3, 36), new V3(38, -1.7, 36), 0.19);
    pipe('sanitary', 3, 'y', -1.3, TOS + 1, 57.5, 38.8, 0.14);
  });

  // ===== fire protection =====
  unit(() => {
    pipe('sprinklerMain', 4, 'y', 0, SPR_MAIN_Y, 1.5, 1.5, 0.2);
    pipe('sprinklerMain', 4, 'z', 1.5, 3, 1.5, SPR_MAIN_Y, 0.2);
    pipe('sprinklerMain', 4, 'x', 1.5, 58, SPR_MAIN_Y, 3, 0.2);
  });
  for (const x of [10, 22, 34, 46]) clevis(4, 'x', x, 3, SPR_MAIN_Y, 0.2);
  for (const x of FIRE_X) {
    unit(() => pipe('sprinklerBranch', 4, 'z', 3, 38, x, SPR_BR_Y, 0.07));
    for (const z of HEAD_Z) {
      unit(() => pipe('sprinklerBranch', 4, 'y', CEIL + 0.1, SPR_BR_Y, x, z, 0.045));
      unit(() => {
        pipe('sprinklerHead', 4, 'y', CEIL - 0.12, CEIL + 0.1, x, z, 0.06);
        pipe('sprinklerHead', 4, 'y', CEIL - 0.16, CEIL - 0.12, x, z, 0.16);
      });
    }
    for (const z of [12, 28]) clevis(4, 'z', z, x, SPR_BR_Y, 0.07);
  }

  // ===== electrical =====
  unit(() => {
    box('cableTray', 5, 14, TRAY_Y, 35.2, TRAY_END, TRAY_Y + 0.33, 35.28);
    box('cableTray', 5, 14, TRAY_Y, 36.72, TRAY_END, TRAY_Y + 0.33, 36.8);
    for (let x = 14.5; x < TRAY_END; x += 1) box('cableTray', 5, x - 0.04, TRAY_Y, 35.28, x + 0.04, TRAY_Y + 0.05, 36.72);
    box('cableTray', 5, 14, TRAY_Y + 0.05, 35.5, TRAY_END, TRAY_Y + 0.2, 36.5);
  });
  for (const x of [18, 26, 34, 42]) trapeze(5, 'x', x, 35.2, 36.8, TRAY_Y);
  sway(5, 30, TRAY_Y - 0.1, 35.1, 'x');
  for (const z of [35.2, 37.6])
    unit(() => {
      box('panel', 5, 58.7, 2.5, z, 59.2, 7, z + 1.6);
      box('panel', 5, 58.65, 2.6, z + 0.1, 58.7, 6.9, z + 1.5);
    });
  unit(() => {
    for (const z of [36, 38.4]) pipe('conduit', 5, 'y', 7, COND_Y, 58.95, z, 0.05);
    pipe('conduit', 5, 'z', 36, 38.4, 58.95, COND_Y, 0.05);
    pipe('conduit', 5, 'x', TRAY_END - 0.5, 58.95, COND_Y, 36, 0.05);
    pipe('conduit', 5, 'y', TRAY_Y + 0.33, COND_Y, TRAY_END - 0.5, 36, 0.05);
  });
  for (const x of [25, 45])
    unit(() => {
      pipe('conduit', 5, 'y', TRAY_Y + 0.33, COND_Y, x, 35.1, 0.04);
      pipe('conduit', 5, 'z', 11, 35.1, x, COND_Y, 0.04);
      for (const z of LIGHT_Z) pipe('conduit', 5, 'y', CEIL + 0.3, COND_Y, x, z, 0.035);
    });
  for (const x of LIGHT_X)
    for (const z of LIGHT_Z) {
      if (x < 14 && z > 28) continue;
      if (x > 48 && z > 30) continue;
      unit(() => box('light', 1, x - 2, CEIL - 0.02, z - 1, x + 2, CEIL + 0.3, z + 1));
    }

  // ===== coordination: clash points found in the federated model and resolved =====
  const diamond = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, Math.PI / 4));
  const clash = (x: number, y: number, z: number) => pieces.push({ c: 'clash', lvl: 2, shape: 'box', pos: new V3(x, y, z), size: new V3(0.7, 0.7, 0.7), quat: diamond.clone(), t: 0 });
  clash(12, 11.45, 22);
  clash(30, 11.45, 22);
  clash(48, 11.45, 22);
  clash(28, 12.05, 22.4);
  clash(37, 11.95, 36);
  clash(17, 12.05, 26);

  // ===== assembly timing =====
  const stage: Record<string, [number, number]> = {
    slab: [0, 0.05],
    column: [0.04, 0.1],
    beam: [0.09, 0.16],
    ahu: [0.15, 0.2],
    equipment: [0.17, 0.22],
    panel: [0.19, 0.23],
    supplyDuct: [0.24, 0.38],
    returnDuct: [0.34, 0.42],
    vav: [0.4, 0.45],
    flex: [0.44, 0.48],
    diffuser: [0.46, 0.5],
    chw: [0.5, 0.58],
    hw: [0.54, 0.6],
    dcw: [0.58, 0.64],
    dhw: [0.6, 0.65],
    sanitary: [0.62, 0.67],
    fixture: [0.64, 0.68],
    sprinklerMain: [0.67, 0.71],
    sprinklerBranch: [0.7, 0.78],
    sprinklerHead: [0.76, 0.8],
    cableTray: [0.79, 0.85],
    conduit: [0.84, 0.88],
    ceiling: [0.87, 0.93],
    light: [0.91, 0.95],
    clash: [0.95, 0.99],
  };
  const supportStage: Record<number, [number, number]> = { 2: [0.22, 0.26], 3: [0.48, 0.52], 4: [0.66, 0.69], 5: [0.77, 0.8] };
  const groups = new Map<string, Piece[]>();
  for (const p of pieces) {
    const key = p.c === 'support' ? `support:${p.lvl}` : p.c;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  for (const [key, list] of groups) {
    const [t0, t1] = key.startsWith('support:') ? supportStage[Number(key.split(':')[1])] : (stage[key] ?? [0.9, 0.95]);
    const ks = list.map((p) => p.pos.x + p.pos.z * 0.5);
    const lo = Math.min(...ks);
    const hi = Math.max(...ks);
    list.forEach((p, i) => (p.t = t0 + (t1 - t0) * 0.88 * (hi > lo ? (ks[i] - lo) / (hi - lo) : 0)));
  }
  return pieces;
}

// ----- flows: air, water, fire and power traced through the systems -----
function mepFlows(mode: string) {
  const v = (x: number, y: number, z: number) => new V3(x, y, z);
  const paths: THREE.Vector3[][] = [];
  const arrows: Arrow[] = [];
  const DOWN = v(0, -1, 0);
  const UP = v(0, 1, 0);
  if (mode === 'air') {
    const dy = 10.8;
    for (const x of BRANCH_X)
      for (const [zEnd, sign] of [[21.5, 1], [6.5, -1]] as const) {
        paths.push([v(4, 7, 34), v(4, dy, 34), v(4, dy, 14), v(x, dy, 14), v(x, dy, zEnd), v(x, CEIL + 0.1, zEnd)]);
        arrows.push({ at: v(x, CEIL - 1.3, zEnd + sign * 0.2), dir: DOWN, len: 1.2, kind: 'load' });
      }
    for (const x of GRILLE_X) {
      paths.push([v(x, CEIL + 0.1, 26), v(x, dy, 26), v(10, dy, 26), v(10, dy, 34), v(10, 7, 34)]);
      arrows.push({ at: v(x, CEIL + 0.05, 26), dir: UP, len: 1.2, kind: 'reaction' });
    }
    return { paths, arrows, members: ['ahu', 'supplyDuct', 'returnDuct', 'vav', 'diffuser', 'flex'] };
  }
  if (mode === 'water') {
    paths.push([v(58, 0.2, 22), v(58, CHW_Y, 22), v(6, CHW_Y, 22), v(6, CHW_Y, 31.5), v(6, 5.5, 31.5)]);
    paths.push([v(6.8, 5.5, 31.5), v(6.8, CHW_Y, 31.5), v(6.8, CHW_Y, 22.8), v(58.5, CHW_Y, 22.8), v(58.5, 0.2, 22.8)]);
    paths.push([v(59, 0.2, 23.6), v(59, HW_Y, 23.6), v(8, HW_Y, 23.6), v(8, HW_Y, 31.5), v(8, 5.5, 31.5)]);
    for (const [fx, fz, kind] of FIXTURES) {
      paths.push([v(13.1, 5.4, 37.3), v(13.1, DOM_Y, 37.3), v(13.1, DOM_Y, 30), v(fx, DOM_Y, 30), v(fx, DOM_Y, fz + (kind === 'wc' ? 0.3 : -0.4)), v(fx, kind === 'wc' ? 1.3 : 2.4, fz + (kind === 'wc' ? 0.3 : -0.4))]);
      paths.push([v(fx, 0.3, fz), v(fx, -1.3 - (57 - fx) * 0.02, 36), v(38, -1.7, 36)]);
    }
    return { paths, arrows, members: ['chw', 'hw', 'dcw', 'dhw', 'sanitary', 'equipment', 'fixture', 'ahu'] };
  }
  if (mode === 'fire') {
    for (const x of FIRE_X)
      for (const z of HEAD_Z) {
        paths.push([v(1.5, 0.2, 1.5), v(1.5, SPR_MAIN_Y, 1.5), v(1.5, SPR_MAIN_Y, 3), v(x, SPR_MAIN_Y, 3), v(x, SPR_BR_Y, z), v(x, CEIL - 0.1, z)]);
        arrows.push({ at: v(x, CEIL - 1.4, z), dir: DOWN, len: 1.1, kind: 'load' });
      }
    return { paths, arrows, members: ['sprinklerMain', 'sprinklerBranch', 'sprinklerHead'] };
  }
  // power: panelboards -> conduit -> cable tray -> branch conduit -> lights
  for (const x of [25, 45])
    for (const z of LIGHT_Z) paths.push([v(58.95, 4, 36), v(58.95, COND_Y, 36), v(TRAY_END - 0.5, COND_Y, 36), v(TRAY_END - 0.5, TRAY_Y + 0.2, 36), v(x, TRAY_Y + 0.2, 36), v(x, COND_Y, 35.1), v(x, COND_Y, z), v(x, CEIL + 0.3, z)]);
  return { paths, arrows, members: ['cableTray', 'conduit', 'panel', 'light'] };
}

export const mepModel = (): FrameModel => ({
  pieces: buildMepPieces(),
  members: MEP_MEMBERS,
  explodeY: [0, 1.5, 4.5, 7.5, 10.5, 13.5],
  center: new V3(30, 6.5, 20),
  dist: 92,
  size: 42,
  load: mepFlows,
  loadColors: { air: '#4f9de0', water: '#2fb4a5', fire: '#e2483a', power: '#f2c14e' },
  flowSpeed: 7,
});

export const mountMepFrame = (container: HTMLElement, ui: FrameUi = {}) => mountFrame(container, ui, mepModel());
