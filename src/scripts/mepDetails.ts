// MEP / BIM section details for the services explorer (sheet M-501).
// Same conventions as frameDetails.ts: inches, y up, elements tagged with the member ids they show.
import { Sheet, wrap, type Detail } from './frameDetails';

type P = [number, number];
const SHEET = 'M-501';

const circ = (d: Sheet, x: number, y: number, r: number, cls: string, m?: string) => {
  const pts: P[] = [];
  for (let i = 0; i < 28; i++) pts.push([x + r * Math.cos((i / 28) * Math.PI * 2), y + r * Math.sin((i / 28) * Math.PI * 2)]);
  d.poly(pts, cls, m);
};
/** Duct in section: outline with an X (supply) or a single diagonal (return). */
const ductCut = (d: Sheet, x: number, y: number, w: number, h: number, m: string, supply = true) => {
  d.rect(x, y, w, h, 'duct', m);
  d.line(x, y, x + w, y + h, 'thin', m);
  if (supply) d.line(x, y + h, x + w, y, 'thin', m);
};
const insulatedPipe = (d: Sheet, x: number, y: number, r: number, ins: number, m: string) => {
  circ(d, x, y, r + ins, 'ins', m);
  circ(d, x, y, r, 'pipe', m);
};

// ---------- 1 · coordination section through the ceiling plenum ----------
function m1() {
  const d = new Sheet([-12, 230], [100, 176], 470);
  d.rect(-12, 168, 242, 5, 'conc', 'slab');
  // W18 beam cut on grid line
  d.poly([[90, 168], [102, 168], [102, 167.4], [96.2, 167.4], [96.2, 150.9], [102, 150.9], [102, 150.3], [90, 150.3], [90, 150.9], [95.8, 150.9], [95.8, 167.4], [90, 167.4]], 'stc', 'beam');
  d.line(-12, 114, 230, 114, 'ceil', 'ceiling');
  d.rect(48, 114, 24, 4, 'o', 'light');
  // supply trunk (cut), branch duct with VAV in elevation, flex & diffuser
  ductCut(d, 12, 124.4, 24, 12, 'supplyDuct');
  d.rect(36, 126.5, 84, 9.9, 'duct', 'supplyDuct');
  d.rect(45, 123.6, 30, 12.8, 'o', 'vav');
  d.rect(109, 117, 10, 9.5, 'flexd', 'flex');
  d.rect(102, 114, 24, 3, 'o', 'diffuser');
  // hydronic piping
  insulatedPipe(d, 120, 141, 3.3, 1.5, 'chw');
  insulatedPipe(d, 129.6, 141, 3.3, 1.5, 'chw');
  insulatedPipe(d, 139.2, 140.6, 1.75, 1.0, 'hw');
  insulatedPipe(d, 146.4, 140.6, 1.75, 1.0, 'hw');
  // return main (cut) and domestic water
  ductCut(d, 157, 124.4, 22, 12, 'returnDuct', false);
  insulatedPipe(d, 214, 139.2, 1.2, 0.5, 'dcw');
  insulatedPipe(d, 221, 139.2, 0.9, 0.5, 'dhw');
  // sprinkler branch line beyond
  d.line(-12, 145.8, 230, 145.8, 'hid', 'sprinklerBranch');
  // hangers
  for (const x of [9, 39]) d.line(x, 124.4, x, 168, 'rod', 'support');
  d.rect(7, 122.8, 34, 1.6, 'st', 'support');
  for (const x of [154, 182]) d.line(x, 124.4, x, 168, 'rod', 'support');
  d.rect(152, 122.8, 32, 1.6, 'st', 'support');
  d.line(120, 145.8, 120, 168, 'rod', 'support');
  // clearance check point
  circ(d, 120, 137, 5.2, 'clash', 'clash');
  d.dim([200, 114], [200, 150.3], 18, '3\'-0" PLENUM');
  d.note([0, 170.5], 'FLOOR / ROOF DECK ABOVE', 'slab');
  d.note([96, 158], 'W18 BEAM, BOTTOM OF STEEL @ 12\'-6"', 'beam');
  d.note([30, 114], 'SUSPENDED CEILING @ 9\'-6" A.F.F.', 'ceiling');
  d.note([60, 116], '2x4 LED TROFFER', 'light');
  d.note([24, 130], '30x14 SUPPLY TRUNK', 'supplyDuct');
  d.note([60, 130], 'VAV BOX', 'vav');
  d.note([114, 115.5], '24x24 DIFFUSER W/ FLEX', 'diffuser flex');
  d.note([124.8, 145.8], '6" CHWS/CHWR, INSULATED', 'chw');
  d.note([142.8, 143], '3" HWS/HWR, INSULATED', 'hw');
  d.note([168, 130], '22x12 RETURN MAIN', 'returnDuct');
  d.note([217.5, 141.5], 'DOMESTIC CW / HW', 'dcw dhw');
  d.note([180, 145.8], 'SPRINKLER BRANCH LINE BEYOND', 'sprinklerBranch');
  d.note([39, 150], 'TRAPEZE HANGERS & RODS', 'support');
  d.note([124, 132], 'CROSSING CHECKED IN CLASH TEST — 1" MIN. CLEARANCE', 'clash');
  return wrap(1, 'Ceiling plenum coordination section', d, ['slab', 'column', 'beam', 'ceiling', 'light', 'supplyDuct', 'vav', 'diffuser', 'flex', 'chw', 'hw', 'returnDuct', 'dcw', 'dhw', 'sprinklerBranch', 'support', 'clash'], SHEET);
}

// ---------- 2 · duct trapeze hanger with seismic brace ----------
function m2() {
  const d = new Sheet([-30, 52], [-8, 44]);
  d.rect(-30, 36, 82, 6, 'conc', 'slab');
  d.rect(-15, 0, 30, 14, 'duct', 'supplyDuct');
  d.rect(-14, 1, 28, 12, 'liner', 'supplyDuct');
  d.rect(-21, -1.625, 42, 1.625, 'st', 'support');
  for (const x of [-19, 19]) {
    d.line(x, -2.6, x, 36, 'rod', 'support');
    d.rect(x - 0.9, -2.6, 1.8, 1, 'st', 'support');
  }
  d.bar([21, -0.8], [45, 35], 1.625, 'st', 'support');
  d.rect(42, 35, 6, 1, 'st', 'support');
  d.rect(17, -2.4, 6, 1.6, 'st', 'support');
  d.label(0, 6.2, 'SUPPLY AIR');
  d.note([0, 13.5], '30x14 SUPPLY DUCT, G90 GALVANIZED, SMACNA CONSTRUCTION', 'supplyDuct returnDuct');
  d.note([-12, 7], '1" ACOUSTIC DUCT LINER', 'supplyDuct');
  d.note([-19, 22], '3/8"Ø THREADED ROD HANGER', 'support');
  d.note([-10, -0.8], '1-5/8" STRUT TRAPEZE', 'support');
  d.note([33, 17], 'SEISMIC SWAY BRACE PER ASCE 7 CH. 13', 'support');
  d.note([45, 38], 'POST-INSTALLED ANCHOR TO STRUCTURE ABOVE', 'support slab');
  return wrap(2, 'Duct trapeze hanger & seismic brace', d, ['supplyDuct', 'returnDuct', 'support', 'slab'], SHEET);
}

// ---------- 3 · VAV terminal and diffuser ----------
function m3() {
  const d = new Sheet([-44, 100], [-36, 22]);
  d.line(-44, -30, 100, -30, 'ceil', 'ceiling');
  d.rect(-44, 0, 44, 10, 'duct', 'supplyDuct');
  d.rect(0, -2, 36, 14, 'o', 'vav');
  d.rect(4, 12, 10, 3, 'st', 'vav');
  d.rect(36, -1, 6, 12, 'o', 'vav');
  for (const x of [38, 40.5]) d.line(x, 11, x, 20, 'pipeh', 'hw');
  d.rect(42, 0, 46, 10, 'duct', 'supplyDuct');
  for (let y = -28; y < 0; y += 3) d.line(73, y, 83, y, 'thin', 'flex');
  d.rect(73, -28, 10, 28, 'flexd', 'flex');
  d.rect(66, -32, 24, 2, 'o', 'diffuser');
  for (const x of [70, 74, 78, 82, 86]) d.line(x, -32, x, -30, 'thin', 'diffuser');
  d.dim([-44, 0], [0, 0], 22, '3 DIA. MIN. STRAIGHT');
  d.note([-20, 5], 'SUPPLY BRANCH DUCT', 'supplyDuct');
  d.note([18, 4], 'VAV TERMINAL, PRESSURE INDEPENDENT', 'vav');
  d.note([9, 13.5], 'DDC CONTROLLER & ACTUATOR', 'vav');
  d.note([39, 4], 'HOT WATER REHEAT COIL', 'vav hw');
  d.note([40.5, 18], 'HWS / HWR TO COIL W/ CONTROL VALVE', 'hw');
  d.note([78, -14], 'INSULATED FLEX DUCT, 5\'-0" MAX.', 'flex');
  d.note([78, -31], '24x24 CEILING DIFFUSER', 'diffuser');
  d.note([60, -30], 'ACCESS TO VAV THROUGH CEILING', 'ceiling vav');
  return wrap(3, 'VAV terminal & diffuser connection', d, ['vav', 'diffuser', 'flex', 'supplyDuct', 'hw', 'ahu', 'ceiling'], SHEET);
}

// ---------- 4 · pipe hanger and insulation ----------
function m4() {
  const d = new Sheet([-22, 22], [-10, 38]);
  d.rect(-22, 30, 44, 6, 'conc', 'slab');
  d.line(0, 7.2, 0, 30, 'rod', 'support');
  d.rect(-1, 28.8, 2, 1.2, 'st', 'support');
  insulatedPipe(d, 0, 0, 3.31, 1.5, 'chw');
  const shield: P[] = [];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    shield.push([5.3 * Math.cos(a), 5.3 * Math.sin(a)]);
  }
  d.pl(shield, 'stl', 'support');
  d.pl([[-5.9, 0.5], [-5.9, -1], [-4.8, -4.5], [0, -6.6], [4.8, -4.5], [5.9, -1], [5.9, 0.5], [3, 6.6], [0, 7.2], [-3, 6.6], [-5.9, 0.5]], 'hanger', 'support');
  d.note([0, 0], '6" CHWS / CHWR STEEL PIPE', 'chw hw dcw dhw sanitary');
  d.note([-3.9, 2.6], '1-1/2" CLOSED-CELL INSULATION W/ VAPOR BARRIER', 'chw hw dcw dhw');
  d.note([3.6, -4], 'INSULATION PROTECTION SHIELD', 'support');
  d.note([5.9, -1], 'ADJUSTABLE CLEVIS HANGER', 'support');
  d.note([0, 18], '3/8"Ø THREADED ROD, SPACING PER MSS SP-58', 'support');
  d.note([-12, 33], 'STRUCTURE ABOVE', 'slab');
  return wrap(4, 'Typical pipe hanger & insulation', d, ['chw', 'hw', 'dcw', 'dhw', 'sanitary', 'equipment', 'fixture', 'support', 'slab'], SHEET);
}

// ---------- 5 · sprinkler branch line and pendent head ----------
function m5() {
  const d = new Sheet([-40, 60], [-10, 40]);
  d.rect(-40, 34, 100, 5, 'conc', 'slab');
  d.line(-40, 0, 60, 0, 'ceil', 'ceiling');
  d.rect(-40, 28.2, 100, 1.66, 'pipeR', 'sprinklerBranch');
  d.rect(9.5, 6, 1.3, 22.2, 'pipeR', 'sprinklerBranch');
  d.rect(9.2, 4.5, 1.9, 1.5, 'st', 'sprinklerHead');
  d.rect(7.2, -0.4, 5.9, 0.8, 'st', 'sprinklerHead');
  d.poly([[8.4, -0.4], [11.9, -0.4], [12.8, -2.4], [7.5, -2.4]], 'st', 'sprinklerHead');
  d.line(6.5, -2.6, 13.8, -2.6, 'thick', 'sprinklerHead');
  d.line(-20, 29.9, -20, 34, 'rod', 'support');
  circ(d, -20, 29, 1.6, 'hangerC', 'support');
  d.note([-30, 29], '1-1/4" SCH. 10 BRANCH LINE', 'sprinklerBranch sprinklerMain');
  d.note([10.2, 16], '1" DROP NIPPLE', 'sprinklerBranch');
  d.note([10.2, -1.5], 'PENDENT SPRINKLER W/ RECESSED ESCUTCHEON', 'sprinklerHead');
  d.note([-20, 32], 'RING HANGER W/ 3/8"Ø ROD', 'support');
  d.note([40, 0], 'SUSPENDED CEILING', 'ceiling');
  d.note([40, 29], 'SPACING, COVERAGE & PIPE SIZES PER NFPA 13 HYDRAULIC CALCULATION', 'sprinklerMain sprinklerBranch');
  return wrap(5, 'Sprinkler branch line & pendent head', d, ['sprinklerMain', 'sprinklerBranch', 'sprinklerHead', 'support', 'ceiling', 'slab'], SHEET);
}

// ---------- 6 · cable tray trapeze and light fixture feed ----------
function m6() {
  const d = new Sheet([-30, 40], [-46, 34]);
  d.rect(-30, 28, 70, 5, 'conc', 'slab');
  d.rect(-12, 0, 0.6, 4, 'st', 'cableTray');
  d.rect(11.4, 0, 0.6, 4, 'st', 'cableTray');
  d.rect(-11.4, 0, 22.8, 0.5, 'st', 'cableTray');
  for (let i = 0; i < 9; i++) circ(d, -9.5 + i * 2.4, 1.6, 1.05, 'cable', 'cableTray');
  for (let i = 0; i < 7; i++) circ(d, -7.5 + i * 2.4, 3.4, 0.9, 'cable', 'cableTray');
  d.rect(-15, -1.625, 30, 1.625, 'st', 'support');
  for (const x of [-14, 14]) d.line(x, -1.625, x, 28, 'rod', 'support');
  d.line(26, -10, 26, 28, 'pipeh', 'conduit');
  d.pl([[26, -10], [26, -18], [18, -26], [12, -38]], 'whip', 'conduit');
  d.line(-30, -40, 40, -40, 'ceil', 'ceiling');
  d.rect(-12, -40, 26, 4, 'o', 'light');
  d.rect(10.5, -36, 3, 2, 'st', 'light');
  for (const x of [-10, 12]) d.line(x, -36, x - 4, 28, 'wire', 'light');
  d.note([0, 4], '18"x4" LADDER CABLE TRAY', 'cableTray');
  d.note([-6, 2.4], 'POWER & DATA CABLING, SEGREGATED', 'cableTray');
  d.note([0, -0.8], '1-5/8" STRUT TRAPEZE @ 8\'-0" O.C. MAX.', 'support');
  d.note([14, 14], '3/8"Ø THREADED ROD', 'support');
  d.note([26, -4], '3/4" EMT FROM PANELBOARD', 'conduit panel');
  d.note([20, -24], 'FLEXIBLE FIXTURE WHIP', 'conduit');
  d.note([0, -38], '2x4 LED TROFFER IN CEILING GRID', 'light');
  d.note([-12, 0], 'INDEPENDENT SUPPORT WIRES FOR FIXTURE', 'light');
  d.note([-11.7, 3], 'EQUIPMENT GROUNDING & BONDING PER NEC', 'cableTray');
  return wrap(6, 'Cable tray trapeze & lighting feed', d, ['cableTray', 'conduit', 'panel', 'light', 'support', 'ceiling', 'slab'], SHEET);
}

let cache: Detail[] | null = null;
export function getMepDetails(): Detail[] {
  cache ??= [m1(), m2(), m3(), m4(), m5(), m6()];
  return cache;
}
