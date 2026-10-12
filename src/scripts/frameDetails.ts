// Construction-document style section details for the wood-frame explorer (sheet S-501).
// Drawn in inches with a y-up origin per detail; every element is tagged with the member ids it shows
// (data-m) so the selected member can be highlighted in the drawing.

type P = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Note = { p: P; text: string; m?: string; side?: 'l' | 'r' };

class Sheet {
  o: string[] = [];
  notes: Note[] = [];
  ox: number;
  oy: number;
  s: number;
  /** Fit the drawing extents (inches) into the middle of the sheet, leaving note columns either side. */
  constructor(
    public xr: [number, number],
    public yr: [number, number],
    maxW = 430,
  ) {
    this.s = Math.min(maxW / (xr[1] - xr[0]), 420 / (yr[1] - yr[0]));
    this.ox = 450 - (this.s * (xr[0] + xr[1])) / 2;
    this.oy = 272 + (this.s * (yr[0] + yr[1])) / 2;
  }
  X(x: number) {
    return r1(this.ox + x * this.s);
  }
  Y(y: number) {
    return r1(this.oy - y * this.s);
  }
  private pts(p: P[]) {
    return p.map(([x, y]) => `${this.X(x)},${this.Y(y)}`).join(' ');
  }
  private m(m?: string) {
    return m ? ` data-m="${m}"` : '';
  }
  poly(p: P[], cls: string, m?: string) {
    this.o.push(`<polygon class="${cls}"${this.m(m)} points="${this.pts(p)}"/>`);
    return this;
  }
  pl(p: P[], cls: string, m?: string) {
    this.o.push(`<polyline class="${cls}"${this.m(m)} points="${this.pts(p)}"/>`);
    return this;
  }
  rect(x: number, y: number, w: number, h: number, cls: string, m?: string) {
    return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], cls, m);
  }
  /** Lumber cut in section: outline + X. */
  cut(x: number, y: number, w: number, h: number, m?: string) {
    const [a, b, c, d] = [this.X(x), this.Y(y), this.X(x + w), this.Y(y + h)];
    this.o.push(
      `<g${this.m(m)}><polygon class="o cut" points="${a},${b} ${c},${b} ${c},${d} ${a},${d}"/><path class="xh" d="M${a},${b}L${c},${d}M${a},${d}L${c},${b}"/></g>`,
    );
    return this;
  }
  line(x1: number, y1: number, x2: number, y2: number, cls: string, m?: string) {
    this.o.push(`<line class="${cls}"${this.m(m)} x1="${this.X(x1)}" y1="${this.Y(y1)}" x2="${this.X(x2)}" y2="${this.Y(y2)}"/>`);
    return this;
  }
  /** A straight member of width w centred on a→b. */
  bar(a: P, b: P, w: number, cls: string, m?: string) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy);
    const nx = (-dy / L) * (w / 2);
    const ny = (dx / L) * (w / 2);
    return this.poly([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], cls, m);
  }
  /** Break line between two points (inches). */
  brk(a: P, b: P) {
    const [x1, y1, x2, y2] = [this.X(a[0]), this.Y(a[1]), this.X(b[0]), this.Y(b[1])];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const L = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / L;
    const uy = (y2 - y1) / L;
    const k = 6;
    this.o.push(
      `<polyline class="brk" points="${r1(x1 - ux * 8)},${r1(y1 - uy * 8)} ${r1(mx - ux * k)},${r1(my - uy * k)} ${r1(mx - ux * 2 - uy * 8)},${r1(my - uy * 2 + ux * 8)} ${r1(mx + ux * 2 + uy * 8)},${r1(my + uy * 2 - ux * 8)} ${r1(mx + ux * k)},${r1(my + uy * k)} ${r1(x2 + ux * 8)},${r1(y2 + uy * 8)}"/>`,
    );
    return this;
  }
  /** Note with a leader to a member point (inches); placed later by layout(). */
  note(p: P, text: string, m?: string, side?: 'l' | 'r') {
    this.notes.push({ p, text, m, side });
    return this;
  }
  /** Place notes in a column either side of the drawing, each near its point, without overlaps. */
  layout() {
    const left = this.X(this.xr[0]) - 18;
    const right = this.X(this.xr[1]) + 18;
    const midX = (left + right) / 2;
    const room = { l: Math.min(30, Math.floor((left - 20) / 6.35)), r: Math.min(30, Math.floor((880 - right) / 6.35)) };
    const wrapText = (t: string, max: number) =>
      t.split('\n').flatMap((line) => {
        const out: string[] = [];
        let cur = '';
        for (const w of line.split(' ')) {
          if ((cur + ' ' + w).trim().length > max && cur) {
            out.push(cur);
            cur = w;
          } else cur = (cur + ' ' + w).trim();
        }
        return [...out, cur];
      });
    const placed = this.notes.map((n) => {
      const px = this.X(n.p[0]);
      const py = this.Y(n.p[1]);
      const side = n.side ?? (px < midX && left > 190 ? 'l' : 'r');
      return { ...n, px, py, side, lines: wrapText(n.text.replace(/\n/g, ' '), room[side]), ty: 0 };
    });
    for (const side of ['l', 'r'] as const) {
      const col = placed.filter((n) => n.side === side).sort((a, b) => a.py - b.py);
      let y = 40;
      for (const n of col) {
        n.ty = Math.max(n.py + 4, y);
        y = n.ty + n.lines.length * 12.5 + 12;
      }
      const over = y - 12 - 505;
      if (over > 0) {
        // push the column up, keeping the order and spacing
        let lim = 505;
        for (let i = col.length - 1; i >= 0; i--) {
          const h = (col[i].lines.length - 1) * 12.5;
          col[i].ty = Math.min(col[i].ty, lim - h);
          lim = col[i].ty - 24;
        }
      }
    }
    for (const n of placed) {
      const tx = n.side === 'l' ? left : right;
      const ex = n.side === 'l' ? tx + 5 : tx - 5;
      const knee = n.side === 'l' ? tx + 16 : tx - 16;
      const ly = n.ty - 3.5;
      this.o.push(
        `<g class="note"${n.m ? ` data-m="${n.m}"` : ''}><circle class="dot" cx="${n.px}" cy="${n.py}" r="2.2"/><polyline class="ld" points="${n.px},${n.py} ${knee},${r1(ly)} ${ex},${r1(ly)}"/><text class="tx" x="${tx}" y="${r1(n.ty)}" text-anchor="${n.side === 'l' ? 'end' : 'start'}">${n.lines
          .map((l, i) => `<tspan x="${tx}" dy="${i ? 12.5 : 0}">${esc(l)}</tspan>`)
          .join('')}</text></g>`,
      );
    }
  }
  /** Dimension between a and b (inches), offset in px; horizontal if a.y == b.y. */
  dim(a: P, b: P, off: number, text: string) {
    const h = Math.abs(a[1] - b[1]) < 1e-6;
    const [x1, y1, x2, y2] = [this.X(a[0]), this.Y(a[1]), this.X(b[0]), this.Y(b[1])];
    if (h) {
      const y = y1 + off;
      this.o.push(
        `<g class="dim"><line x1="${x1}" y1="${y1 + Math.sign(off) * 3}" x2="${x1}" y2="${y + Math.sign(off) * 4}"/><line x1="${x2}" y1="${y2 + Math.sign(off) * 3}" x2="${x2}" y2="${y + Math.sign(off) * 4}"/><line x1="${x1 - 5}" y1="${y}" x2="${x2 + 5}" y2="${y}"/><line class="tk" x1="${x1 - 3.5}" y1="${y + 3.5}" x2="${x1 + 3.5}" y2="${y - 3.5}"/><line class="tk" x1="${x2 - 3.5}" y1="${y + 3.5}" x2="${x2 + 3.5}" y2="${y - 3.5}"/><text class="tx" x="${r1((x1 + x2) / 2)}" y="${y - 4}" text-anchor="middle">${esc(text)}</text></g>`,
      );
    } else {
      const x = x1 + off;
      this.o.push(
        `<g class="dim"><line x1="${x1 + Math.sign(off) * 3}" y1="${y1}" x2="${x + Math.sign(off) * 4}" y2="${y1}"/><line x1="${x2 + Math.sign(off) * 3}" y1="${y2}" x2="${x + Math.sign(off) * 4}" y2="${y2}"/><line x1="${x}" y1="${y1 + 5}" x2="${x}" y2="${y2 - 5}"/><line class="tk" x1="${x - 3.5}" y1="${y1 + 3.5}" x2="${x + 3.5}" y2="${y1 - 3.5}"/><line class="tk" x1="${x - 3.5}" y1="${y2 + 3.5}" x2="${x + 3.5}" y2="${y2 - 3.5}"/><text class="tx" transform="translate(${x - 5} ${r1((y1 + y2) / 2)}) rotate(-90)" text-anchor="middle">${esc(text)}</text></g>`,
      );
    }
    return this;
  }
  label(x: number, y: number, text: string, cls = 'tx') {
    this.o.push(`<text class="${cls}" x="${this.X(x)}" y="${this.Y(y)}" text-anchor="middle">${esc(text)}</text>`);
    return this;
  }
}

export type Detail = { no: number; title: string; members: string[]; svg: string };

const DEFS = `<defs>
<pattern id="d-conc" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#ecebe6"/><circle cx="4" cy="5" r="0.9" fill="#55585e"/><circle cx="15" cy="9" r="0.7" fill="#55585e"/><circle cx="9" cy="17" r="0.8" fill="#55585e"/><circle cx="19" cy="19" r="0.6" fill="#55585e"/><path d="M12 3l2.4 3.6h-4.8z M3 13l2 3h-4z M17 14l1.8 2.6h-3.6z" fill="none" stroke="#55585e" stroke-width="0.6"/></pattern>
<pattern id="d-earth" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#f3efe6"/><line x1="0" y1="0" x2="0" y2="14" stroke="#8a8478" stroke-width="1.6"/><line x1="5" y1="0" x2="5" y2="14" stroke="#8a8478" stroke-width="0.6"/></pattern>
<pattern id="d-ply" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#efe2c4"/><line x1="0" y1="0" x2="0" y2="6" stroke="#7c6a48" stroke-width="0.7"/></pattern>
</defs>`;

function wrap(no: number, title: string, d: Sheet, members: string[]): Detail {
  d.layout();
  const t = esc(title.toUpperCase());
  const svg = `<svg class="det" viewBox="0 0 900 600" role="img" aria-label="Detail ${no}: ${t}" xmlns="http://www.w3.org/2000/svg">${DEFS}
<rect class="frame" x="8" y="8" width="884" height="584"/><rect class="frame2" x="13" y="13" width="874" height="574"/>
${d.o.join('\n')}
<g class="tb"><circle cx="56" cy="548" r="24" class="bub"/><line x1="32" y1="548" x2="80" y2="548" class="bubl"/><text x="56" y="542" text-anchor="middle" class="bubn">${no}</text><text x="56" y="564" text-anchor="middle" class="bubs">S-501</text>
<text x="94" y="546" class="ttl">${t}</text><line x1="94" y1="552" x2="${94 + t.length * 9.2}" y2="552" class="ttll"/><text x="94" y="569" class="tx">SCALE: N.T.S.</text></g></svg>`;
  return { no, title, members, svg };
}

// ---------- 1 · sill anchorage at slab edge ----------
function d1() {
  const d = new Sheet([-18, 48], [-22, 34]);
  d.poly([[-18, -6], [-0.5, -6], [-0.5, -16], [12, -16], [20, -4], [48, -4], [48, -22], [-18, -22]], 'earth');
  d.line(-18, -6, -0.5, -6, 'grade');
  d.poly([[-0.5, 0], [48, 0], [48, -4], [20, -4], [12, -16], [-0.5, -16]], 'conc', 'slab');
  d.brk([48, 1], [48, -5]);
  d.rect(-0.44, 0, 0.44, 34, 'ply', 'sheathing');
  d.rect(0, 1.5, 5.5, 32.5, 'o', 'stud');
  d.cut(0, 0, 5.5, 1.5, 'sill');
  d.brk([-2, 34], [8, 34]);
  d.rect(2.44, -7, 0.62, 9.7, 'st', 'anchor');
  d.pl([[2.75, -7], [2.75, -8], [5, -8], [5, -6.4]], 'stl', 'anchor');
  d.rect(1.25, 1.5, 3, 0.3, 'st', 'anchor');
  d.rect(2.15, 1.8, 1.2, 0.6, 'st', 'anchor');
  d.dim([8, -7], [8, 0], 34, '7" MIN.');
  d.dim([-0.5, -16], [-0.5, 0], -44, '1\'-4"');
  d.note([2.75, 26], '2x6 STUDS @ 16" O.C.', 'stud');
  d.note([-0.22, 20], '7/16" OSB WALL SHEATHING', 'sheathing');
  d.note([4.6, 0.75], '2x6 P.T. SILL PLATE', 'sill');
  d.note([4.0, 1.65], 'SIMPSON BP5/8-3 BEARING\nPLATE WASHER', 'anchor');
  d.note([2.75, -4.5], '5/8"Ø ANCHOR BOLT @ 48" O.C.,\n7" MIN. EMBED., 12" MAX.\nFROM PLATE ENDS', 'anchor');
  d.note([34, -2], '4" CONC. SLAB ON GRADE', 'slab');
  d.note([5, -12], 'THICKENED SLAB EDGE', 'slab');
  d.note([-12, -6], 'FINISH GRADE');
  return wrap(1, 'Sill anchorage at slab edge', d, ['slab', 'anchor', 'sill', 'stud', 'sheathing']);
}

// ---------- 2 · hold-down at shear wall end ----------
function d2() {
  const d = new Sheet([-8, 62], [-28, 50]);
  d.poly([[-8, -28], [62, -28], [62, -26], [-8, -26]], 'earth');
  d.rect(-1, -26, 63, 26, 'conc', 'slab');
  d.brk([62, 2], [62, -27]);
  d.rect(0.2, 1.5, 47.6, 48.3, 'hid', 'sheathing');
  d.rect(0, 0, 60, 1.5, 'o', 'sill');
  d.rect(0, 1.5, 1.5, 48.5, 'o', 'stud');
  d.rect(1.5, 1.5, 1.5, 48.5, 'o', 'stud');
  d.rect(15.25, 1.5, 1.5, 48.5, 'o', 'stud');
  d.rect(31.25, 1.5, 1.5, 48.5, 'o', 'stud');
  d.rect(47.25, 1.5, 1.5, 48.5, 'o', 'stud');
  d.brk([-3, 50], [52, 50]);
  for (let y = 4.4; y < 10; y += 1.3) d.line(3.3, y, 0.6, y, 'hid', 'holdown');
  d.poly([[3, 1.7], [3, 10.3], [3.35, 10.3], [3.35, 4.7], [5.2, 3.9], [5.2, 1.7]], 'st', 'holdown');
  d.rect(4.0, -21, 0.62, 26.4, 'st', 'holdown');
  d.rect(3.7, 4.0, 1.22, 0.75, 'st', 'holdown');
  d.rect(3.0, -21.6, 2.6, 0.6, 'st', 'holdown');
  d.dim([8, -21], [8, 0], 30, 'SSTB24 EMBED.');
  d.note([4.6, 7], 'SIMPSON HDU5-SDS2.5 HOLDOWN', 'holdown');
  d.note([1.8, 8.4], '(14) SDS 1/4"x2-1/2" SCREWS', 'holdown');
  d.note([2.2, 30], '(2) 2x6 END POST', 'stud');
  d.note([30, 44], 'SHEAR WALL SHEATHING BEYOND,\nEDGE NAIL TO END POST', 'sheathing');
  d.note([24, 0.75], '2x6 P.T. SILL PLATE', 'sill');
  d.note([4.3, -12], 'SIMPSON SSTB24 ANCHOR BOLT', 'holdown');
  d.note([40, -14], 'CONC. FOOTING', 'slab');
  return wrap(2, 'Hold-down at shear wall end', d, ['holdown', 'stud', 'sill', 'sheathing', 'slab']);
}

// ---------- 3 · typical wall framing at opening ----------
function d3() {
  const d = new Sheet([0, 124], [0, 110], 400);
  const top = 106.125;
  const r0 = 40;
  const r1 = 88;
  const head = 84;
  const hd = 7.25;
  const sill = 38.7;
  d.line(r0, sill, r1, head, 'thin');
  d.line(r0, head, r1, sill, 'thin');
  const studs: [number, number][] = [[0, 1.5], [1.5, 3], [15.25, 16.75], [31.25, 32.75], [95.25, 96.75], [110.5, 112]];
  for (const [a, b] of studs) d.rect(a, 1.5, b - a, top - 1.5, 'o', 'stud');
  d.rect(37, 1.5, 1.5, top - 1.5, 'o', 'king');
  d.rect(89.5, 1.5, 1.5, top - 1.5, 'o', 'king');
  d.rect(38.5, 1.5, 1.5, head - 1.5, 'o', 'trimmer');
  d.rect(88, 1.5, 1.5, head - 1.5, 'o', 'trimmer');
  d.rect(38.5, head, 51, hd, 'o', 'header');
  d.line(38.5, head + hd / 2, 89.5, head + hd / 2, 'thin', 'header');
  for (const c of [48, 64, 80]) d.rect(c - 0.75, head + hd, 1.5, top - head - hd, 'o', 'cripple');
  d.rect(r0, sill - 1.5, r1 - r0, 1.5, 'o', 'roughSill');
  for (const c of [40.75, 48, 64, 80, 87.25]) d.rect(c - 0.75, 1.5, 1.5, sill - 3, 'o', 'cripple');
  const gaps: [number, number][] = [[3, 15.25], [16.75, 31.25], [32.75, 37], [91, 95.25], [96.75, 110.5]];
  gaps.forEach(([a, b], i) => d.rect(a, 53 + (i % 2 ? 0.75 : -0.75), b - a, 1.5, 'o', 'blocking'));
  d.rect(0, 0, 112, 1.5, 'o', 'sill bottomPlate');
  d.rect(0, top, 112, 1.5, 'o', 'topPlate');
  d.rect(0, top + 1.5, 112, 1.5, 'o', 'topPlate');
  d.dim([r0, 62], [r1, 62], 0, '4\'-0" R.O.');
  d.dim([112, 0], [112, top + 3], 34, '9\'-1 1/8" PLATE HT.');
  d.note([60, 107.6], '(2) 2x6 TOP PLATE, LAP 48" MIN.', 'topPlate');
  d.note([64, 97], '2x6 CRIPPLE STUDS ABOVE HEADER', 'cripple');
  d.note([70, 87.6], 'HEADER - (2) 2x8 MIN.,\nSEE HEADER SCHEDULE', 'header');
  d.note([90.25, 70], 'KING STUD EA. SIDE, FULL HT.', 'king');
  d.note([88.75, 46], 'TRIMMER (JACK) STUD EA. SIDE', 'trimmer');
  d.note([70, 37.95], '2x6 FLAT ROUGH SILL', 'roughSill');
  d.note([64, 18], 'CRIPPLE STUDS BELOW SILL', 'cripple');
  d.note([24, 53], '2x6 BLOCKING @ MID-HEIGHT', 'blocking');
  d.note([16, 80], '2x6 STUDS @ 16" O.C.', 'stud');
  d.note([104, 0.75], '2x6 BOTTOM PLATE\n(P.T. WHERE ON CONCRETE)', 'sill bottomPlate');
  return wrap(3, 'Typical wall framing at opening', d, ['stud', 'king', 'trimmer', 'header', 'cripple', 'roughSill', 'blocking', 'topPlate', 'sill', 'bottomPlate']);
}

// ---------- 4 · floor to wall at rim (floor-to-floor) ----------
function d4() {
  const d = new Sheet([-1, 60], [-30, 36]);
  d.rect(0, -30, 5.5, 27, 'o', 'stud');
  d.cut(0, -3, 5.5, 1.5, 'topPlate');
  d.cut(0, -1.5, 5.5, 1.5, 'topPlate');
  d.rect(1.25, 0, 58.75, 9.25, 'o', 'joist');
  d.cut(0, 0, 1.25, 9.25, 'rim');
  d.rect(0, 9.25, 60, 0.75, 'ply', 'subfloor');
  d.cut(0, 10, 5.5, 1.5, 'bottomPlate');
  d.rect(0, 11.5, 5.5, 24.5, 'o', 'stud');
  d.brk([60, -1], [60, 11]);
  d.brk([-3, -30], [8, -30]);
  d.brk([-3, 36], [8, 36]);
  d.rect(-0.12, -2.8, 0.12, 6.8, 'st', 'ltp4');
  d.rect(-0.56, -30, 0.44, 34.9, 'ply', 'sheathing');
  d.rect(-0.56, 5.1, 0.44, 30.9, 'ply', 'sheathing');
  d.rect(-0.74, -22, 0.18, 46, 'st', 'strap');
  for (let y = -20; y < 23; y += 3) if (Math.abs(y - 5) > 3) d.label(-0.65, y - 0.3, '·', 'nail');
  d.note([30, 4.6], '2x10 FLOOR JOISTS @ 16" O.C.', 'joist');
  d.note([40, 9.6], '3/4" T&G OSB SUBFLOOR,\nGLUE & NAIL', 'subfloor');
  d.note([3.6, 10.75], '2x6 BOTTOM PLATE, NAIL\nTO RIM & JOISTS', 'bottomPlate');
  d.note([3, 26], '2x6 STUDS @ 16" O.C.', 'stud');
  d.note([0.62, 6], '1-1/4" LSL RIM BOARD', 'rim');
  d.note([3.8, -1.5], '(2) 2x6 TOP PLATE', 'topPlate');
  d.note([-0.06, -2], 'SIMPSON LTP4 @ 48" O.C.,\nRIM TO TOP PLATE', 'ltp4');
  d.note([-0.65, -14], 'SIMPSON MSTC48B3 STRAP @\nSHEAR WALL ENDS, CENTER ON RIM', 'strap');
  d.note([-0.34, -24], '7/16" OSB WALL SHEATHING', 'sheathing');
  return wrap(4, 'Floor to wall at rim board', d, ['joist', 'subfloor', 'bottomPlate', 'stud', 'rim', 'topPlate', 'ltp4', 'strap', 'sheathing']);
}

// ---------- 5 · joists lapped at interior bearing wall ----------
function d5() {
  const d = new Sheet([-40, 40], [-36, 12]);
  d.rect(-1.75, -36, 3.5, 33, 'o', 'stud');
  d.cut(-1.75, -3, 3.5, 1.5, 'topPlate');
  d.cut(-1.75, -1.5, 3.5, 1.5, 'topPlate');
  d.rect(-4.5, 0, 44.5, 9.25, 'o', 'joist');
  d.rect(-40, 0, 44.5, 9.25, 'o', 'joist');
  d.line(-4.5, 0, -4.5, 9.25, 'hid', 'joist');
  d.cut(-0.75, 0, 1.5, 9.25, 'joistBlock');
  d.pl([[0.95, 4.4], [0.95, 0.15], [3.4, 0.15]], 'stl', 'a35');
  d.rect(-40, 9.25, 80, 0.75, 'ply', 'subfloor');
  d.brk([-40, -1], [-40, 11]);
  d.brk([40, -1], [40, 11]);
  d.brk([-5, -36], [5, -36]);
  d.dim([-4.5, 0], [4.5, 0], 30, '6" MIN. LAP');
  d.note([-26, 4.6], '2x10 FLOOR JOISTS @ 16" O.C.,\nLAP 6" MIN. OVER BEARING', 'joist');
  d.note([0, 7], '2x10 SOLID BLOCKING @ BEARING', 'joistBlock');
  d.note([2.6, 0.2], 'SIMPSON A35 EA. BLOCK\nTO TOP PLATE', 'a35');
  d.note([26, 9.6], '3/4" T&G OSB SUBFLOOR', 'subfloor');
  d.note([1, -1.5], '(2) 2x4 TOP PLATE', 'topPlate');
  d.note([0, -22], '2x4 BEARING WALL @ 16" O.C.', 'stud');
  return wrap(5, 'Joists lapped at bearing wall', d, ['joist', 'joistBlock', 'a35', 'subfloor', 'topPlate', 'stud']);
}

// ---------- 6 · stair opening framing (plan) ----------
function d6() {
  const d = new Sheet([-8, 104], [0, 160]);
  d.rect(-8, 0, 112, 1.25, 'o', 'rim');
  const full = [8, 88];
  for (const c of full) d.rect(c - 0.75, 1.25, 1.5, 158.75, 'o', 'joist');
  d.rect(23.25, 1.25, 1.5, 158.75, 'o', 'joist');
  d.rect(24.75, 1.25, 1.5, 158.75, 'o', 'joist');
  d.rect(71.25, 1.25, 1.5, 158.75, 'o', 'joist');
  d.rect(69.75, 1.25, 1.5, 158.75, 'o', 'joist');
  d.rect(26.25, 24, 43.5, 1.5, 'o', 'joist');
  d.rect(26.25, 25.5, 43.5, 1.5, 'o', 'joist');
  d.rect(26.25, 123, 43.5, 1.5, 'o', 'joist');
  d.rect(26.25, 124.5, 43.5, 1.5, 'o', 'joist');
  for (const c of [40, 56]) {
    d.rect(c - 0.75, 1.25, 1.5, 22.75, 'o', 'joist');
    d.rect(c - 0.75, 126, 1.5, 34, 'o', 'joist');
    d.rect(c - 1.15, 20.8, 2.3, 3.2, 'st', 'hanger');
    d.rect(c - 1.15, 126, 2.3, 3.2, 'st', 'hanger');
  }
  for (const [x, w] of [[26.25, 2.6], [69.75, -2.6]] as const) {
    d.rect(Math.min(x, x + w), 23.6, Math.abs(w), 3.8, 'st', 'hanger');
    d.rect(Math.min(x, x + w), 122.6, Math.abs(w), 3.8, 'st', 'hanger');
  }
  d.line(26.25, 27, 69.75, 123, 'thin');
  d.line(26.25, 123, 69.75, 27, 'thin');
  d.label(48, 78, 'STAIR OPENING', 'tx bg');
  d.brk([-8, 160], [104, 160]);
  d.note([8, 90], '2x10 FLOOR JOISTS @ 16" O.C.', 'joist');
  d.note([25, 100], '(2) 2x10 TRIMMER JOISTS', 'joist');
  d.note([48, 125], '(2) 2x10 HEADER JOISTS', 'joist');
  d.note([56, 128], 'SIMPSON LUS210 @ EA.\nTAIL JOIST, TYP.', 'hanger');
  d.note([70.5, 25.5], 'SIMPSON LUS210-2 @ EA.\nHEADER END, TYP.', 'hanger');
  d.note([40, 12], '2x10 TAIL JOISTS', 'joist');
  d.note([96, 0.6], 'RIM BOARD', 'rim');
  return wrap(6, 'Stair opening framing plan', d, ['joist', 'hanger', 'rim']);
}

// ---------- 7 · eave: rafter bearing on wall ----------
function d7() {
  const d = new Sheet([-21, 60], [-36, 38]);
  const pd = 10.34;
  const bot = (x: number) => (x - 5.5) * 0.5;
  d.rect(-0.44, -36, 0.44, 33.25, 'ply', 'sheathing');
  d.rect(0, -36, 5.5, 33, 'o', 'stud');
  d.cut(0, -3, 5.5, 1.5, 'topPlate');
  d.cut(0, -1.5, 5.5, 1.5, 'topPlate');
  d.rect(0.5, 0, 59.5, 7.25, 'o', 'ceilingJoist');
  d.poly([[-18, bot(-18)], [0, bot(0)], [0, 0], [5.5, 0], [60, bot(60)], [60, bot(60) + pd], [-18, bot(-18) + pd]], 'o', 'rafter');
  d.pl([[-18.5, bot(-18) + pd + 0.6], [60, bot(60) + pd + 0.6]], 'roof');
  d.cut(-19.5, bot(-18) - 0.15, 1.5, 9.25, 'fascia');
  d.poly([[1.6, -2.6], [2.9, -2.6], [2.9, 1.2], [3.6, 4.6], [2.4, 4.6], [1.6, 1.2]], 'st', 'hurricane');
  d.brk([60, bot(60) - 1], [60, bot(60) + pd + 1.5]);
  d.brk([-3, -36], [8, -36]);
  d.pl([[30, bot(30) + pd + 4], [42, bot(30) + pd + 4], [42, bot(30) + pd + 10]], 'thin');
  d.label(36, bot(30) + pd + 1.6, '12');
  d.label(44.2, bot(30) + pd + 6, '6');
  d.dim([-18, -14], [0, -14], 0, '1\'-6"');
  d.note([40, bot(40) + 5], '2x10 RAFTERS @ 24" O.C.', 'rafter');
  d.note([20, 1.5], '2x8 CEILING JOISTS @ 24" O.C.,\nFACE NAIL TO RAFTER', 'ceilingJoist');
  d.note([3.2, 3.4], 'SIMPSON H2.5A @ EA. RAFTER\nTO TOP PLATE', 'hurricane');
  d.note([-18.75, -12], '2x10 SUB-FASCIA', 'fascia');
  d.note([4.4, -2.2], '(2) 2x6 TOP PLATE', 'topPlate');
  d.note([3, -24], '2x6 STUDS @ 16" O.C.', 'stud');
  d.note([-0.22, -30], '7/16" OSB WALL SHEATHING', 'sheathing');
  d.note([50, bot(50) + pd + 0.6], 'ROOF SHEATHING & ROOFING\nPER ARCH. (NOT IN 3D MODEL)');
  return wrap(7, 'Eave — rafter bearing at wall', d, ['rafter', 'ceilingJoist', 'hurricane', 'fascia', 'topPlate', 'stud', 'sheathing']);
}

// ---------- 8 · rafters at ridge ----------
function d8() {
  const d = new Sheet([-48, 48], [-25, 13]);
  const pd = 10.34;
  const yb = 0.4;
  const b = (x: number) => yb - (Math.abs(x) - 0.75) * 0.5;
  d.poly([[-34.2, -6], [34.2, -6], [45.2, -11.5], [-45.2, -11.5]], 'o', 'collar');
  for (const s of [1, -1]) {
    d.poly([[s * 0.75, yb], [s * 0.75, yb + pd], [s * 48, b(48) + pd], [s * 48, b(48)]], 'o', 'rafter');
    d.poly([[s * 0.75, yb - 0.5], [s * 3.6, b(3.6) - 0.5], [s * 3.6, b(3.6) + 8.2], [s * 0.75, yb + 8.6]], 'st2', 'lssu');
    d.brk([s * 48, b(48) - 1.5], [s * 48, b(48) + pd + 1.5]);
  }
  d.cut(-0.75, 0, 1.5, 11.25, 'ridge');
  d.pl([[-24, b(24) + pd + 0.25], [-0.75, yb + pd + 0.25], [-0.75, 11.5], [0.75, 11.5], [0.75, yb + pd + 0.25], [24, b(24) + pd + 0.25]], 'stl', 'lsta');
  d.pl([[-48, b(48) + pd + 1.4], [-0.9, 12.4], [0.9, 12.4], [48, b(48) + pd + 1.4]], 'roof');
  d.note([0, 6], '2x12 RIDGE BOARD', 'ridge');
  d.note([20, b(20) + 5], '2x10 RAFTERS @ 24" O.C.', 'rafter');
  d.note([2.6, 3], 'SIMPSON LSSU210 @ EA. RAFTER,\nSLOPE TO 6:12', 'lssu');
  d.note([12, b(12) + pd + 0.3], 'SIMPSON LSTA21 ACROSS RIDGE\n@ 48" O.C.', 'lsta');
  d.note([20, -8.7], '2x6 COLLAR TIE @ 48" O.C.,\nUPPER THIRD OF RISE', 'collar');
  d.note([-36, b(36) + pd + 1.4], 'ROOF SHEATHING (NOT IN 3D MODEL)');
  return wrap(8, 'Rafters at ridge', d, ['ridge', 'rafter', 'lssu', 'lsta', 'collar']);
}

// ---------- 9 · gable end framing (elevation) ----------
function d9() {
  const d = new Sheet([-18, 306], [-30, 80], 470);
  const pd = 10.34;
  const bot = (x: number) => (Math.min(x, 288 - x) - 5.5) * 0.5;
  for (let x = 16; x < 288; x += 16) d.rect(x - 0.75, -30, 1.5, 27, 'o', 'stud');
  d.rect(0, -3, 288, 1.5, 'o', 'topPlate');
  d.rect(0, -1.5, 288, 1.5, 'o', 'topPlate');
  for (let x = 16; x < 288; x += 16) {
    if (Math.abs(x - 144) < 4) continue;
    d.poly([[x - 0.75, 0], [x + 0.75, 0], [x + 0.75, bot(x + 0.75)], [x - 0.75, bot(x - 0.75)]], 'o', 'gableStud');
  }
  d.poly([[-18, bot(-18)], [143.25, bot(143.25)], [143.25, bot(143.25) + pd], [-18, bot(-18) + pd]], 'o', 'rafter');
  d.poly([[144.75, bot(144.75)], [306, bot(306)], [306, bot(306) + pd], [144.75, bot(144.75) + pd]], 'o', 'rafter');
  d.cut(143.25, bot(143.25) - 0.3, 1.5, 11.25, 'ridge');
  d.brk([-4, -30], [292, -30]);
  d.note([96, 20], '2x4 GABLE STUDS @ 16" O.C.,\nCUT TO RAFTER SLOPE', 'gableStud');
  d.note([220, bot(220) + 5], '2x10 END RAFTER', 'rafter');
  d.note([144, bot(144) + 8], '2x12 RIDGE BOARD', 'ridge');
  d.note([250, -0.75], '(2) 2x6 TOP PLATE', 'topPlate');
  d.note([272, -16], 'WALL STUDS BELOW', 'stud');
  return wrap(9, 'Gable end framing', d, ['gableStud', 'rafter', 'ridge', 'topPlate', 'stud']);
}

// ---------- 10 · garage roof truss (elevation) ----------
function d10() {
  const d = new Sheet([-14, 198], [-30, 60], 470);
  const tl = (x: number) => 5.4 + (x <= 96 ? x : 192 - x) * 0.5;
  const cv = 3.91;
  d.rect(0, -30, 5.5, 27, 'o', 'stud');
  d.rect(0, -3, 5.5, 1.5, 'o', 'topPlate');
  d.rect(0, -1.5, 5.5, 1.5, 'o', 'topPlate');
  d.rect(192, -30, 5.5, 90, 'o', 'stud');
  d.cut(190.5, -9.25, 1.5, 9.25, 'ledger');
  const p1: P = [64, 1.75];
  const p2: P = [128, 1.75];
  const q1: P = [48, tl(48) + 1.95];
  const q2: P = [144, tl(144) + 1.95];
  const qa: P = [96, tl(96) + 1];
  for (const [a, b] of [[p1, q1], [p1, qa], [p2, qa], [p2, q2]] as [P, P][]) d.bar(a, b, 3.5, 'o', 'truss');
  d.rect(0, 0, 192, 3.5, 'o', 'truss');
  d.poly([[-12, tl(0) - 6], [96, tl(96)], [96, tl(96) + cv], [-12, tl(0) - 6 + cv]], 'o', 'truss');
  d.poly([[96, tl(96)], [192, tl(192)], [192, tl(192) + cv], [96, tl(96) + cv]], 'o', 'truss');
  for (const [x, y, w, h] of [[1, 0.4, 10, 7.6], [181, 0.4, 10, 7.6], [90, tl(96) - 3.5, 12, 8], [58, 0.3, 12, 6.5], [122, 0.3, 12, 6.5], [43, q1[1] - 4.5, 10, 9], [139, q2[1] - 4.5, 10, 9]])
    d.rect(x, y, w, h, 'st2', 'trussPlate');
  d.poly([[2, -2.8], [3.6, -2.8], [3.6, 3.6], [2, 3.6]], 'st', 'hurricane');
  d.poly([[187.6, -2.8], [189.2, -2.8], [189.2, 3.6], [187.6, 3.6]], 'st', 'hurricane');
  d.brk([-4, -30], [10, -30]);
  d.dim([0, -6], [192, -6], 30, '16\'-0" SPAN');
  d.note([30, tl(30) + 2], '2x4 TOP CHORD', 'truss');
  d.note([82, (p1[1] + qa[1]) / 2 + 12], '2x4 WEBS', 'truss');
  d.note([150, 1.75], '2x4 BOTTOM CHORD', 'truss');
  d.note([96, tl(96) + 1], 'TRUSS PLATE (BY FABRICATOR)', 'trussPlate');
  d.note([2.8, 2], 'SIMPSON H2.5A @ EA. BEARING', 'hurricane');
  d.note([191.2, -5], '2x10 P.T. LEDGER, SEE DET. 11', 'ledger');
  d.note([3, -2], '(2) 2x6 TOP PLATE', 'topPlate');
  d.note([110, 30], 'PRE-ENGINEERED WOOD TRUSS\n@ 24" O.C. (DESIGN BY TRUSS\nMANUFACTURER)', 'truss');
  return wrap(10, 'Garage roof truss', d, ['truss', 'trussPlate', 'hurricane', 'ledger', 'topPlate', 'stud']);
}

// ---------- 11 · truss bearing at ledger ----------
function d11() {
  const d = new Sheet([-42, 42], [-36, 31]);
  d.rect(0, -36, 0.44, 66, 'ply', 'sheathing');
  d.rect(0.44, -36, 5.5, 33, 'o', 'stud');
  d.cut(0.44, -3, 5.5, 1.5, 'topPlate');
  d.cut(0.44, -1.5, 5.5, 1.5, 'topPlate');
  d.rect(1.69, 0, 38.31, 9.25, 'o', 'joist');
  d.cut(0.44, 0, 1.25, 9.25, 'rim');
  d.rect(0.44, 9.25, 39.56, 0.75, 'ply', 'subfloor');
  d.cut(0.44, 10, 5.5, 1.5, 'bottomPlate');
  d.rect(0.44, 11.5, 5.5, 18.5, 'o', 'stud');
  d.poly([[0, 5.4], [0, 5.4 + 3.91], [-40, 25.4 + 3.91], [-40, 25.4]], 'o', 'truss');
  d.rect(-40, 0, 40, 3.5, 'o', 'truss');
  d.rect(-10, 0.5, 9.5, 7.5, 'st2', 'trussPlate');
  d.cut(-1.5, -9.25, 1.5, 9.25, 'ledger');
  for (const y of [-2.2, -6.8]) {
    d.rect(-1.6, y - 0.11, 6.6, 0.22, 'st', 'sdws');
    d.rect(-1.85, y - 0.45, 0.3, 0.9, 'st', 'sdws');
  }
  d.poly([[-1.8, -4.4], [-1.5, -4.4], [-1.5, 0.2], [-3.2, 4], [-4.4, 4], [-1.8, 0.2]], 'st', 'hurricane');
  d.brk([-40, -1], [-40, 31]);
  d.brk([40, -1], [40, 11]);
  d.brk([-2, -36], [8, -36]);
  d.brk([-2, 30], [8, 30]);
  d.note([-20, 1.75], 'GARAGE TRUSS @ 24" O.C.', 'truss');
  d.note([-3.8, 3.4], 'SIMPSON H2.5A TRUSS TO LEDGER', 'hurricane');
  d.note([-0.75, -8], '2x10 P.T. LEDGER', 'ledger');
  d.note([3.4, -2.2], 'SIMPSON SDWS TIMBER SCREWS (5")\n@ 16" O.C., STAGGERED', 'sdws');
  d.note([1.06, 6], '1-1/4" LSL RIM BOARD', 'rim');
  d.note([24, 4.6], '2x10 FLOOR JOISTS', 'joist');
  d.note([4, -1.5], '(2) 2x6 TOP PLATE', 'topPlate');
  d.note([3.2, -24], '2x6 HOUSE WALL STUDS', 'stud');
  d.note([0.22, -30], 'WALL SHEATHING', 'sheathing');
  return wrap(11, 'Truss bearing at ledger', d, ['truss', 'hurricane', 'ledger', 'sdws', 'rim', 'joist', 'topPlate', 'stud', 'sheathing', 'trussPlate', 'subfloor', 'bottomPlate']);
}

let cache: Detail[] | null = null;
export function getDetails(): Detail[] {
  cache ??= [d1(), d2(), d3(), d4(), d5(), d6(), d7(), d8(), d9(), d10(), d11()];
  return cache;
}
