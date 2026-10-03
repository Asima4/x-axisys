// Shared definition of the sample building.
// Both the 3D model (Three.js) and every 2D drawing sheet are generated from this data,
// so plans, elevations, structure and MEP always stay coordinated.
//
// Units: metres. Plan origin = grid A/1 (back-left corner).
// x runs left → right along the building; z runs back → front (front facade at z = depth).
// y is height; y = 0 is ground floor finished level.

export type V2 = [number, number];
export type V3 = [number, number, number];

export type Opening = { from: number; to: number; sill: number; head: number; kind: 'window' | 'door' | 'slider' };
export type Facade = 'front' | 'back' | 'left' | 'right';

export type Room = { name: string; x0: number; z0: number; x1: number; z1: number; label?: V2 };
export type Partition = { a: V2; b: V2; doors?: { at: number; width: number; swing?: 1 | -1; side?: 1 | -1 }[] };

export type Level = {
  name: string;
  code: string;
  y: number; // finished floor level
  rooms: Room[];
  partitions: Partition[];
  openings: Record<Facade, Opening[]>;
};

export type Duct = { level: number; kind: 'supply' | 'return'; path: V2[]; w: number; h: number; size: string };
export type Pipe = { kind: 'cold' | 'hot' | 'waste' | 'refrigerant'; pts: V3[]; d: number };
export type Fixture = { level: number; type: 'wc' | 'basin' | 'shower' | 'sink' | 'washer' | 'heater'; x: number; z: number; rot?: number };

const X = [0, 4.2, 8.4, 12.6, 16.8]; // grids A–E
const Z = [0, 4.4, 8.8]; // grids 1–3
const PORCH_Z = 10.6; // grid 4 (porch / balcony edge)
const STOREY = 3.4;
const SLAB = 0.25;

const bayGlazing = (sill: number, head: number, kind: Opening['kind']): Opening[] =>
  X.slice(0, -1).map((x, i) => ({ from: x + 0.35, to: X[i + 1] - 0.35, sill, head, kind }));

export const building = {
  id: 'sample-residence',
  name: 'Two-Storey Residence',
  location: 'Sample project',
  grids: {
    x: X.map((v, i) => ({ id: 'ABCDE'[i], v })),
    z: [...Z, PORCH_Z].map((v, i) => ({ id: String(i + 1), v })),
  },
  width: X[X.length - 1],
  depth: Z[Z.length - 1],
  porchDepth: PORCH_Z - Z[Z.length - 1],
  storey: STOREY,
  slab: SLAB,
  wall: 0.22,
  roof: { front: 7.25, back: 6.85, overhang: 0.6, thickness: 0.3 },

  levels: [
    {
      name: 'Ground Floor',
      code: 'L0',
      y: 0,
      rooms: [
        { name: 'Owner’s Suite', x0: 0, z0: 4.4, x1: 4.2, z1: 8.8 },
        { name: 'Ensuite', x0: 0, z0: 0, x1: 2.1, z1: 4.4, label: [1.05, 3.55] },
        { name: 'Closet', x0: 2.1, z0: 0, x1: 4.2, z1: 4.4 },
        { name: 'Kitchen', x0: 4.2, z0: 0, x1: 12.6, z1: 4.4, label: [7.1, 1.1] },
        { name: 'Living', x0: 4.2, z0: 4.4, x1: 8.4, z1: 8.8, label: [6.3, 7.6] },
        { name: 'Dining', x0: 8.4, z0: 4.4, x1: 12.6, z1: 8.8, label: [10.9, 7.6] },
        { name: 'Stair', x0: 12.6, z0: 0, x1: 16.8, z1: 1.5, label: [14.0, 0.75] },
        { name: 'WC / Laundry', x0: 12.6, z0: 1.5, x1: 15.0, z1: 4.4, label: [13.9, 3.0] },
        { name: 'Hall', x0: 15.0, z0: 1.5, x1: 16.8, z1: 4.4 },
        { name: 'Entry', x0: 12.6, z0: 4.4, x1: 16.8, z1: 8.8 },
      ],
      partitions: [
        { a: [4.2, 0], b: [4.2, 8.8], doors: [{ at: 6.2, width: 0.9, swing: 1, side: -1 }] },
        { a: [0, 4.4], b: [4.2, 4.4], doors: [{ at: 3.2, width: 0.8, swing: -1, side: -1 }] },
        { a: [2.1, 0], b: [2.1, 4.4], doors: [{ at: 2.8, width: 0.8, swing: 1, side: -1 }] },
        { a: [12.6, 0], b: [12.6, 4.4] },
        { a: [12.6, 1.5], b: [15.0, 1.5] },
        { a: [15.0, 1.5], b: [15.0, 4.4], doors: [{ at: 3.0, width: 0.8, swing: 1, side: -1 }] },
        { a: [12.6, 4.4], b: [15.0, 4.4] },
      ],
      openings: {
        front: bayGlazing(0, 2.7, 'slider'),
        back: [
          { from: 0.5, to: 1.6, sill: 1.5, head: 2.2, kind: 'window' },
          { from: 5.4, to: 11.4, sill: 1.05, head: 2.2, kind: 'window' },
          { from: 15.0, to: 16.2, sill: 1.2, head: 2.2, kind: 'window' },
        ],
        left: [{ from: 5.4, to: 7.8, sill: 0.9, head: 2.4, kind: 'window' }],
        right: [
          { from: 5.9, to: 7.1, sill: 0, head: 2.4, kind: 'door' },
          { from: 2.3, to: 3.5, sill: 1.2, head: 2.2, kind: 'window' },
        ],
      },
    },
    {
      name: 'First Floor',
      code: 'L1',
      y: STOREY,
      rooms: [
        { name: 'Bedroom 2', x0: 0, z0: 4.4, x1: 4.2, z1: 8.8 },
        { name: 'Bath', x0: 0, z0: 0, x1: 2.1, z1: 4.4, label: [1.05, 3.55] },
        { name: 'Study', x0: 2.1, z0: 0, x1: 4.2, z1: 4.4 },
        { name: 'Family Lounge', x0: 4.2, z0: 0, x1: 12.6, z1: 8.8, label: [8.4, 5.0] },
        { name: 'Open to below', x0: 12.6, z0: 0, x1: 16.8, z1: 1.5, label: [15.2, 0.75] },
        { name: 'Hall', x0: 12.6, z0: 1.5, x1: 14.4, z1: 4.4, label: [13.5, 3.85] },
        { name: 'Bath', x0: 14.4, z0: 1.5, x1: 16.8, z1: 4.4, label: [15.7, 2.85] },
        { name: 'Bedroom 3', x0: 12.6, z0: 4.4, x1: 16.8, z1: 8.8 },
      ],
      partitions: [
        { a: [4.2, 0], b: [4.2, 8.8], doors: [{ at: 2.9, width: 0.9, swing: -1, side: -1 }, { at: 6.0, width: 0.9, swing: 1, side: -1 }] },
        { a: [0, 4.4], b: [4.2, 4.4], doors: [{ at: 1.05, width: 0.8, swing: 1, side: 1 }] },
        { a: [2.1, 0], b: [2.1, 4.4] },
        { a: [12.6, 1.5], b: [16.8, 1.5] },
        { a: [14.4, 1.5], b: [14.4, 4.4], doors: [{ at: 3.0, width: 0.8, swing: 1, side: 1 }] },
        { a: [12.6, 1.5], b: [12.6, 8.8], doors: [{ at: 2.9, width: 0.9, swing: 1, side: 1 }] },
        { a: [12.6, 4.4], b: [16.8, 4.4], doors: [{ at: 13.5, width: 0.9, swing: -1, side: 1 }] },
      ],
      openings: {
        front: bayGlazing(0, 2.6, 'slider'),
        back: [
          { from: 0.5, to: 1.6, sill: 1.5, head: 2.2, kind: 'window' },
          { from: 2.6, to: 3.8, sill: 0.9, head: 2.2, kind: 'window' },
          { from: 5.0, to: 7.6, sill: 0.9, head: 2.4, kind: 'window' },
          { from: 9.0, to: 11.6, sill: 0.9, head: 2.4, kind: 'window' },
        ],
        left: [{ from: 5.4, to: 7.8, sill: 0.9, head: 2.4, kind: 'window' }],
        right: [
          { from: 0.4, to: 1.2, sill: 0.9, head: 2.4, kind: 'window' },
          { from: 5.0, to: 6.2, sill: 0.9, head: 2.4, kind: 'window' },
          { from: 7.0, to: 8.2, sill: 0.9, head: 2.4, kind: 'window' },
        ],
      },
    },
  ] as Level[],

  // Straight flight: starts at the hall (right, x1) and rises towards x0, arriving in the first-floor lounge.
  stair: { x0: 12.75, x1: 16.65, z0: 0.15, z1: 1.35, risers: 15, up: 'x-' as const },

  furniture: {
    L0: [
      { type: 'bed', x: 2.1, z: 6.9, w: 1.8, d: 2.1, rot: 0 },
      { type: 'island', x: 8.4, z: 2.5, w: 3.2, d: 1.0 },
      { type: 'counter', x: 8.4, z: 0.33, w: 6.4, d: 0.6 },
      { type: 'sofa', x: 6.3, z: 6.6, w: 2.6, d: 0.95 },
      { type: 'table', x: 10.5, z: 6.4, w: 2.0, d: 1.0 },
    ],
    L1: [
      { type: 'bed', x: 2.1, z: 6.9, w: 1.6, d: 2.0, rot: 0 },
      { type: 'bed', x: 14.7, z: 6.9, w: 1.6, d: 2.0, rot: 0 },
      { type: 'sofa', x: 8.4, z: 3.2, w: 3.0, d: 0.95 },
      { type: 'desk', x: 3.15, z: 0.5, w: 1.4, d: 0.6 },
    ],
  },

  structure: {
    columns: [
      ...X.flatMap((x) => Z.map((z) => ({ x, z, size: 'W8x31' }))),
      ...X.map((x) => ({ x, z: PORCH_Z, size: 'HSS4x4' })),
    ],
    beamsX: [
      { z: 0, size: 'W12x26' },
      { z: 4.4, size: 'W14x34' },
      { z: 8.8, size: 'W12x26' },
      { z: PORCH_Z, size: 'W8x18' },
    ],
    beamsZ: X.map((x) => ({ x, size: 'W10x22' })),
    joist: { spacing: 0.6, size: '800S250-68' },
    // Vertical X-bracing on the left gable (grid A, bay 1–2), where there are no openings.
    bracing: { x: 0, z0: 0, z1: 4.4 },
    footings: [
      ...X.flatMap((x) => Z.map((z) => ({ x, z, mark: z === 4.4 ? 'F1' : 'F2', size: z === 4.4 ? 1.6 : 1.3 }))),
      ...X.map((x) => ({ x, z: PORCH_Z, mark: 'F3', size: 0.9 })),
    ],
    strip: { width: 0.6, mark: 'SF1' },
  },

  mep: {
    ahu: { x: 15.6, z: 3.0, y: 2.55, w: 1.2, d: 0.8, h: 0.55 },
    condenser: { x: 14.6, z: 1.6, w: 1.3, d: 0.9, h: 1.0 },
    panel: { x: 16.7, z: 2.6, y: 1.2 },
    ducts: [
      // Ground floor
      { level: 0, kind: 'supply', path: [[15.0, 3.0], [1.0, 3.0]], w: 0.5, h: 0.3, size: '500×300' },
      { level: 0, kind: 'supply', path: [[2.1, 3.0], [2.1, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
      { level: 0, kind: 'supply', path: [[6.3, 3.0], [6.3, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
      { level: 0, kind: 'supply', path: [[10.5, 3.0], [10.5, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
      { level: 0, kind: 'supply', path: [[14.7, 3.0], [14.7, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
      { level: 0, kind: 'return', path: [[15.6, 3.6], [15.6, 5.8], [8.4, 5.8]], w: 0.4, h: 0.25, size: '400×250' },
      // First floor
      { level: 1, kind: 'supply', path: [[15.0, 3.0], [1.0, 3.0]], w: 0.45, h: 0.28, size: '450×280' },
      { level: 1, kind: 'supply', path: [[2.1, 3.0], [2.1, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
      { level: 1, kind: 'supply', path: [[8.4, 3.0], [8.4, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
      { level: 1, kind: 'supply', path: [[14.7, 3.0], [14.7, 7.4]], w: 0.3, h: 0.25, size: '300×250' },
    ] as Duct[],
    diffusers: [
      ...[2.1, 6.3, 10.5, 14.7].flatMap((x) => [
        { level: 0, x, z: 7.4 },
        { level: 0, x, z: 5.4 },
      ]),
      { level: 0, x: 1.0, z: 3.0 },
      { level: 0, x: 8.4, z: 1.6 },
      ...[2.1, 8.4, 14.7].flatMap((x) => [
        { level: 1, x, z: 7.4 },
        { level: 1, x, z: 5.4 },
      ]),
    ],
    returnGrilles: [{ level: 0, x: 8.4, z: 5.8 }],
    pipes: [
      // Cold water: service below slab → kitchen, risers
      { kind: 'cold', d: 0.05, pts: [[8.0, -0.35, -1.5], [8.0, -0.35, 0.6], [1.0, -0.35, 0.6], [1.0, 6.1, 0.6]] },
      { kind: 'cold', d: 0.04, pts: [[8.0, -0.35, 0.6], [8.0, -0.35, 2.5], [8.0, 0.85, 2.5]] },
      { kind: 'cold', d: 0.05, pts: [[8.0, -0.35, 0.6], [14.75, -0.35, 0.6], [14.75, -0.35, 1.75], [14.75, 6.1, 1.75]] },
      { kind: 'cold', d: 0.04, pts: [[14.75, -0.35, 1.75], [14.75, -0.35, 3.95], [14.4, -0.35, 3.95], [14.4, 0.3, 3.95]] },
      // Hot water: from heater, run at ceiling level
      { kind: 'hot', d: 0.04, pts: [[14.4, 1.7, 3.95], [14.4, 2.6, 3.95], [14.4, 2.6, 0.85], [1.25, 2.6, 0.85], [1.25, 6.1, 0.85]] },
      { kind: 'hot', d: 0.035, pts: [[8.25, 2.6, 0.85], [8.25, 2.6, 2.5], [8.25, 0.85, 2.5]] },
      { kind: 'hot', d: 0.035, pts: [[14.4, 2.6, 1.9], [14.95, 2.6, 1.9], [14.95, 6.1, 1.9]] },
      // Soil, waste & vent stacks
      { kind: 'waste', d: 0.1, pts: [[0.7, 7.9, 0.35], [0.7, -0.7, 0.35], [0.7, -0.7, -1.8]] },
      { kind: 'waste', d: 0.1, pts: [[14.55, 7.9, 1.7], [14.55, -0.7, 1.7], [14.55, -0.7, -1.8]] },
      { kind: 'waste', d: 0.075, pts: [[7.75, 0.6, 2.5], [7.75, -0.6, 2.5], [7.75, -0.6, -1.8]] },
      // Refrigerant lines to rooftop condenser
      { kind: 'refrigerant', d: 0.03, pts: [[15.6, 2.8, 3.4], [16.45, 2.8, 3.4], [16.45, 7.3, 3.4], [16.45, 7.3, 1.6], [15.3, 7.3, 1.6]] },
    ] as Pipe[],
    fixtures: [
      { level: 0, type: 'wc', x: 0.45, z: 1.0 },
      { level: 0, type: 'basin', x: 0.35, z: 2.4 },
      { level: 0, type: 'shower', x: 1.35, z: 0.75 },
      { level: 0, type: 'sink', x: 8.0, z: 2.5 },
      { level: 0, type: 'wc', x: 13.05, z: 2.1 },
      { level: 0, type: 'basin', x: 12.95, z: 3.95 },
      { level: 0, type: 'washer', x: 14.1, z: 1.95 },
      { level: 0, type: 'heater', x: 14.4, z: 3.95 },
      { level: 1, type: 'wc', x: 0.45, z: 1.0 },
      { level: 1, type: 'basin', x: 0.35, z: 2.4 },
      { level: 1, type: 'shower', x: 1.35, z: 0.75 },
      { level: 1, type: 'wc', x: 15.2, z: 1.95 },
      { level: 1, type: 'basin', x: 16.5, z: 2.1 },
      { level: 1, type: 'shower', x: 16.0, z: 3.7 },
    ] as Fixture[],
    lights: {
      L0: [
        [1.05, 6.6], [3.15, 6.6], [1.05, 2.2], [3.15, 2.2], [6.3, 1.6], [10.5, 1.6], [6.3, 6.6], [10.5, 6.6], [8.4, 6.6], [13.8, 3.0], [15.9, 3.0], [13.8, 6.6], [15.6, 6.6], [14.7, 0.75],
      ] as V2[],
      L1: [
        [2.1, 6.6], [1.05, 2.2], [3.15, 2.2], [6.3, 2.2], [10.5, 2.2], [6.3, 6.6], [10.5, 6.6], [13.5, 3.0], [15.6, 3.0], [14.7, 6.6],
      ] as V2[],
    },
    sockets: [
      [0.12, 5.5], [4.08, 7.8], [4.4, 5.0], [6.0, 8.68], [9.6, 4.6], [12.48, 7.0], [5.2, 0.12], [11.0, 0.12], [8.4, 3.02], [16.68, 5.0], [13.9, 4.28],
    ] as V2[],
    switches: [
      [3.9, 4.55], [4.35, 5.6], [12.45, 5.7], [16.65, 7.3], [15.12, 2.4], [16.65, 4.0],
    ] as V2[],
  },
};

export type Building = typeof building;

/** Openings along a facade → start/end coordinates in plan. */
export function facadeLine(b: Building, facade: Facade): { a: V2; b: V2; length: number } {
  const W = b.width;
  const D = b.depth;
  switch (facade) {
    case 'front':
      return { a: [0, D], b: [W, D], length: W };
    case 'back':
      return { a: [0, 0], b: [W, 0], length: W };
    case 'left':
      return { a: [0, 0], b: [0, D], length: D };
    case 'right':
      return { a: [W, 0], b: [W, D], length: D };
  }
}

export const roomArea = (r: Room) => Math.abs((r.x1 - r.x0) * (r.z1 - r.z0));
