// Structural steel section details for the steel frame explorer (sheet S-502).
// Same drawing conventions as frameDetails.ts: inches, y up, elements tagged with the member ids they show.
import { Sheet, wrap, type Detail } from './frameDetails';

type P = [number, number];
type W = { d: number; bf: number; tf: number; tw: number };
const W12: W = { d: 12.06, bf: 9.995, tf: 0.575, tw: 0.345 };
const W21: W = { d: 20.66, bf: 6.5, tf: 0.45, tw: 0.35 };
const W18: W = { d: 17.7, bf: 6.0, tf: 0.425, tw: 0.3 };
const W16: W = { d: 15.69, bf: 5.5, tf: 0.345, tw: 0.25 };
const SHEET = 'S-502';

/** W-shape cut in section (filled), centred on x with its top at y. */
const ishape = (d: Sheet, x: number, top: number, s: W, m: string) => {
  const { d: h, bf, tf, tw } = s;
  const b = top - h;
  d.poly(
    [
      [x - bf / 2, top], [x + bf / 2, top], [x + bf / 2, top - tf], [x + tw / 2, top - tf], [x + tw / 2, b + tf], [x + bf / 2, b + tf],
      [x + bf / 2, b], [x - bf / 2, b], [x - bf / 2, b + tf], [x - tw / 2, b + tf], [x - tw / 2, top - tf], [x - bf / 2, top - tf],
    ],
    'stc',
    m,
  );
};
/** W-shape in side elevation, horizontal, from x0 to x1 with top at y. */
const ielev = (d: Sheet, x0: number, x1: number, top: number, s: W, m: string) => {
  d.rect(x0, top - s.d, x1 - x0, s.d, 'o', m);
  d.line(x0, top - s.tf, x1, top - s.tf, 'thin', m);
  d.line(x0, top - s.d + s.tf, x1, top - s.d + s.tf, 'thin', m);
};
/** W-shape column in side elevation (depth view), vertical. */
const celev = (d: Sheet, x: number, y0: number, y1: number, s: W, m: string) => {
  d.rect(x - s.d / 2, y0, s.d, y1 - y0, 'o', m);
  d.line(x - s.d / 2 + s.tf, y0, x - s.d / 2 + s.tf, y1, 'thin', m);
  d.line(x + s.d / 2 - s.tf, y0, x + s.d / 2 - s.tf, y1, 'thin', m);
};
const bolt = (d: Sheet, x: number, y: number, r = 0.55) => {
  const pts: P[] = [];
  for (let i = 0; i < 8; i++) pts.push([x + r * Math.cos((i * Math.PI) / 4 + Math.PI / 8), y + r * Math.sin((i * Math.PI) / 4 + Math.PI / 8)]);
  d.poly(pts, 'stb', 'bolt');
};

// ---------- 1 · column base plate ----------
function s1() {
  const d = new Sheet([-54, 54], [-50, 32]);
  d.rect(-54, -50, 108, 45, 'earth');
  d.rect(-36, -42, 72, 18, 'conc', 'footing');
  d.rect(-12, -24, 24, 18, 'conc', 'footing');
  d.rect(-54, -5, 41.5, 5, 'conc', 'slabOnGrade');
  d.rect(12.5, -5, 41.5, 5, 'conc', 'slabOnGrade');
  d.rect(-12.5, -5, 0.5, 5, 'ply', 'slabOnGrade');
  d.rect(12, -5, 0.5, 5, 'ply', 'slabOnGrade');
  d.rect(-12, -3.5, 7, 3.5, 'conc', 'slabOnGrade');
  d.rect(5, -3.5, 7, 3.5, 'conc', 'slabOnGrade');
  d.rect(-9, -6, 18, 1.25, 'grout', 'basePlate');
  d.rect(-9, -4.75, 18, 1.25, 'stc', 'basePlate');
  celev(d, 0, -3.5, 32, W12, 'column');
  for (const x of [-6.5, 6.5]) {
    d.rect(x - 0.375, -36, 0.75, 34.2, 'st', 'anchorRod');
    d.rect(x - 1.5, -3.5, 3, 0.25, 'st', 'anchorRod');
    d.rect(x - 0.75, -3.25, 1.5, 1, 'st', 'anchorRod');
    d.rect(x - 1.5, -36.5, 3, 0.5, 'st', 'anchorRod');
    d.rect(x - 0.75, -36, 1.5, 1, 'st', 'anchorRod');
  }
  d.brk([-4, 32], [10, 32]);
  d.note([0, 18], 'W12x53 COLUMN', 'column');
  d.note([4.6, -0.6], '1/4" FILLET WELD ALL AROUND', 'column');
  d.note([3, -4.1], '1-1/4" BASE PLATE, ASTM A36', 'basePlate');
  d.note([-3, -5.4], '1-1/2" NON-SHRINK GROUT', 'basePlate');
  d.note([6.5, -2.8], '(4) 3/4"Ø F1554 GR. 36 ANCHOR RODS, HEAVY HEX NUT & PLATE WASHER', 'anchorRod');
  d.note([-30, -2.5], '5" SLAB ON GRADE', 'slabOnGrade');
  d.note([-12.25, -4], 'ISOLATION JOINT AROUND COLUMN', 'slabOnGrade');
  d.note([-6, -15], '24" SQ. CONCRETE PIER', 'footing');
  d.note([-26, -33], '6\'-0" SQ. x 18" SPREAD FOOTING', 'footing');
  return wrap(1, 'Column base plate', d, ['column', 'basePlate', 'anchorRod', 'slabOnGrade', 'footing'], SHEET);
}

// ---------- 2 · beam to girder shear tab ----------
function s2() {
  const d = new Sheet([-30, 48], [-24, 9]);
  ishape(d, 0, 0, W21, 'girder');
  d.poly([[0.68, -1.25], [3.75, -1.25], [3.75, 0], [48, 0], [48, -W16.d], [0.68, -W16.d]], 'o', 'beam');
  d.line(3.75, -W16.tf, 48, -W16.tf, 'thin', 'beam');
  d.line(0.68, -W16.d + W16.tf, 48, -W16.d + W16.tf, 'thin', 'beam');
  d.rect(0.175, -13, 4.5, 10.5, 'st', 'shearTab');
  for (const y of [-4.5, -7.5, -10.5]) bolt(d, 3, y);
  // deck profile (ribs run across the beam), concrete, studs
  const prof: P[] = [];
  for (let x0 = -30; x0 < 48; x0 += 12) prof.push([x0, 3], [x0 + 3, 3], [x0 + 4.5, 0], [x0 + 9, 0], [x0 + 10.5, 3]);
  prof.push([48, 3]);
  d.poly([[-30, 6.25], [48, 6.25], ...prof.slice().reverse()], 'conc', 'slab');
  d.pl(prof, 'deckl', 'deck');
  for (let x0 = -30; x0 < 48; x0 += 12) {
    const c = x0 + 6.75;
    if (c < 4.5 && c > -3) continue;
    if (c > 4.5 || Math.abs(c) < 3) {
      d.rect(c - 0.375, 0, 0.75, 4.5, 'st', 'studs');
      d.rect(c - 0.625, 4.5, 1.25, 0.375, 'st', 'studs');
    }
  }
  d.brk([-30, -2], [-30, 7]);
  d.brk([48, -17], [48, 7]);
  d.note([-2.5, -10], 'W21x44 GIRDER', 'girder');
  d.note([30, -8], 'W16x26 BEAM', 'beam');
  d.note([2.2, -1.25], 'COPE TOP FLANGE AS REQ\'D', 'beam');
  d.note([1.2, -12], '3/8" SHEAR TAB, SHOP WELD TO GIRDER WEB, 1/4" FILLET BOTH SIDES', 'shearTab');
  d.note([3, -7.5], '(3) 3/4"Ø A325-N BOLTS', 'bolt');
  d.note([18.75, 2.2], '3/4"Ø x 4-1/2" HEADED STUDS', 'studs');
  d.note([-12, 1.5], '3" 20 GA. COMPOSITE DECK', 'deck');
  d.note([-20, 5], '3-1/4" LW CONC. W/ WWF', 'slab');
  return wrap(2, 'Beam to girder shear tab', d, ['girder', 'beam', 'shearTab', 'bolt', 'studs', 'deck', 'slab'], SHEET);
}

// ---------- 3 · girder to column ----------
function s3() {
  const d = new Sheet([-14, 54], [-42, 22]);
  celev(d, 0, -42, 22, W12, 'column');
  ielev(d, 6.5, 54, 0, W21, 'girder');
  d.rect(6.03, -17.5, 4.5, 15, 'st', 'shearTab');
  for (const y of [-4.5, -7.5, -10.5, -13.5]) bolt(d, 8.5, y);
  d.line(6.03, 0.6, 54, 0.6, 'thin');
  d.line(6.03, 6.85, 54, 6.85, 'thin');
  d.brk([-9, 22], [9, 22]);
  d.brk([-9, -42], [9, -42]);
  d.brk([54, -22], [54, 2]);
  d.dim([6.03, -24], [6.5, -24], 0, '1/2" SETBACK');
  d.note([-3, 12], 'W12x53 COLUMN', 'column');
  d.note([32, -10], 'W21x44 GIRDER', 'girder');
  d.note([7.2, -16], '3/8" SHEAR TAB, SHOP WELD TO COLUMN FLANGE', 'shearTab');
  d.note([8.5, -10.5], '(4) 3/4"Ø A325-N BOLTS IN STD. HOLES', 'bolt');
  d.note([40, 3.7], 'SLAB & DECK ABOVE');
  return wrap(3, 'Girder to column connection', d, ['column', 'girder', 'shearTab', 'bolt'], SHEET);
}

// ---------- 4 · chevron brace at girder ----------
function s4() {
  const d = new Sheet([-62, 62], [-78, 4]);
  ielev(d, -62, 62, 0, W21, 'girder');
  for (const x of [-10, 10]) d.rect(x - 0.25, -W21.d + W21.tf, 0.5, W21.d - 2 * W21.tf, 'st', 'girder');
  d.poly([[-18, -W21.d], [18, -W21.d], [10, -40], [-10, -40]], 'st2', 'gusset');
  for (const s of [-1, 1]) {
    d.bar([s * 58, -76], [s * 8, -30], 6, 'o', 'brace');
    d.bar([s * 30, -51.5], [s * 8, -30], 0.6, 'thin', 'brace');
  }
  d.label(0, -26, 'W.P.');
  d.brk([-62, -24], [-62, 3]);
  d.brk([62, -24], [62, 3]);
  d.note([30, -10], 'W21x44 GIRDER', 'girder');
  d.note([10, -12], 'FULL-DEPTH WEB STIFFENERS EA. SIDE', 'girder');
  d.note([4, -30], '1/2" GUSSET PL, WELD TO BOTT. FLANGE', 'gusset');
  d.note([-36, -57], 'HSS6x6x3/8 BRACE, SLOTTED OVER GUSSET', 'brace');
  d.note([12, -36], '5/16" FILLET WELDS, 4 PLACES', 'brace');
  return wrap(4, 'Chevron brace at girder', d, ['girder', 'gusset', 'brace'], SHEET);
}

// ---------- 5 · brace at column base ----------
function s5() {
  const d = new Sheet([-16, 62], [-22, 52]);
  d.rect(-16, -22, 78, 17, 'earth');
  d.rect(-12, -22, 24, 22, 'conc', 'footing');
  d.rect(12, -5, 50, 5, 'conc', 'slabOnGrade');
  d.rect(-9, 0, 18, 1.25, 'stc', 'basePlate');
  celev(d, 0, 1.25, 52, W12, 'column');
  for (const x of [-6.5, 6.5]) d.line(x, -18, x, 2.5, 'hid', 'anchorRod');
  d.poly([[6, 1.25], [32, 1.25], [32, 4.5], [6, 30]], 'st2', 'gusset');
  d.bar([60, 48], [17, 11], 6, 'o', 'brace');
  d.brk([-8, 52], [8, 52]);
  d.brk([62, -5], [62, 1]);
  d.note([0, 40], 'W12x53 COLUMN', 'column');
  d.note([40, 30], 'HSS6x6x3/8 BRACE', 'brace');
  d.note([22, 6], '1/2" GUSSET PL, WELD TO BASE PL & COLUMN FLANGE', 'gusset');
  d.note([-4, 0.6], '1-1/4" BASE PLATE', 'basePlate');
  d.note([-6.5, -10], '(4) 3/4"Ø ANCHOR RODS', 'anchorRod');
  d.note([-4, -16], 'CONCRETE PIER & FOOTING', 'footing');
  return wrap(5, 'Brace at column base', d, ['column', 'brace', 'gusset', 'basePlate', 'anchorRod', 'footing', 'slabOnGrade'], SHEET);
}

// ---------- 6 · composite deck on beam ----------
function s6() {
  const d = new Sheet([-24, 24], [-17, 8]);
  ishape(d, 0, 0, W16, 'beam');
  d.rect(-24, 0, 48, 6.25, 'conc', 'slab');
  d.line(-24, 3, 24, 3, 'hid', 'deck');
  d.pl([[-24, 0.06], [24, 0.06]], 'deckl', 'deck');
  d.line(-24, 4.75, 24, 4.75, 'wwf', 'slab');
  d.rect(-0.375, 0, 0.75, 4.5, 'st', 'studs');
  d.rect(-0.625, 4.5, 1.25, 0.375, 'st', 'studs');
  d.brk([-24, -1], [-24, 7]);
  d.brk([24, -1], [24, 7]);
  d.dim([19, 0], [19, 6.25], 26, '6-1/4"');
  d.dim([13, 0], [13, 3], 18, '3"');
  d.note([-20, 5.4], '3-1/4" LW CONC. OVER DECK (6-1/4" TOTAL)', 'slab');
  d.note([-14, 4.75], '6x6-W2.9xW2.9 WWF', 'slab');
  d.note([-18, 0.06], '3" 20 GA. COMPOSITE DECK, PUDDLE WELD TO BEAM', 'deck');
  d.note([-12, 3], 'DECK RIB BEYOND', 'deck');
  d.note([0.4, 3.5], '3/4"Ø x 4-1/2" HEADED STUDS @ 12" O.C.', 'studs');
  d.note([0, -9], 'W16x26 COMPOSITE BEAM', 'beam');
  return wrap(6, 'Composite deck on beam', d, ['beam', 'slab', 'deck', 'studs'], SHEET);
}

// ---------- 7 · joist bearing at roof girder ----------
function s7() {
  const d = new Sheet([-30, 60], [-22, 7]);
  ishape(d, 0, 0, W18, 'girder');
  for (const s of [1, -1]) {
    d.rect(s > 0 ? 0.25 : -4, 0, 3.75, 2.5, 'st', 'joist');
    const end = s > 0 ? 60 : -30;
    d.rect(Math.min(0.25 * s, end), 0.5, Math.abs(end - 0.25 * s), 2, 'o', 'joist');
  }
  d.rect(12, -15.5, 48, 2, 'o', 'joist');
  d.rect(-30, -15.5, 18, 2, 'o', 'joist');
  const web: P[] = [[4, 1.5], [16, -14.5], [28, 1.5], [40, -14.5], [52, 1.5], [60, -6.5]];
  for (let i = 0; i < web.length - 1; i++) d.bar(web[i], web[i + 1], 0.875, 'o', 'joist');
  const wl: P[] = [[-4, 1.5], [-16, -14.5], [-28, 1.5], [-30, -1.2]];
  for (let i = 0; i < wl.length - 1; i++) d.bar(wl[i], wl[i + 1], 0.875, 'o', 'joist');
  const prof: P[] = [];
  for (let x0 = -30; x0 < 60; x0 += 6) prof.push([x0, 4], [x0 + 1.75, 4], [x0 + 2.5, 2.5], [x0 + 5.25, 2.5], [x0 + 6, 4]);
  d.pl(prof, 'deckl', 'roofDeck');
  d.brk([-30, -17], [-30, 5]);
  d.brk([60, -17], [60, 5]);
  d.note([-2.5, -9], 'W18x35 ROOF GIRDER', 'girder');
  d.note([2, 1.2], 'JOIST SEAT, 2-1/2" MIN. BEARING, (2) 1/8" x 1" FILLET WELDS', 'joist');
  d.note([34, -6.5], '18K5 OPEN-WEB STEEL JOIST @ 5\'-0" O.C.', 'joist');
  d.note([-20, 3.2], '1-1/2" 20 GA. TYPE B ROOF DECK, WELD TO JOISTS', 'roofDeck');
  d.note([45, -14.5], 'BOTTOM CHORD', 'joist');
  return wrap(7, 'Joist bearing at roof girder', d, ['girder', 'joist', 'roofDeck'], SHEET);
}

let cache: Detail[] | null = null;
export function getSteelDetails(): Detail[] {
  cache ??= [s1(), s2(), s3(), s4(), s5(), s6(), s7()];
  return cache;
}
