// Member catalogue for the sample light-frame (wood) house explorer.
// Sizes are typical prescriptive light-frame practice for an illustrative model, not a design.

export type MemberGroup = 'Foundation' | 'Walls' | 'Floor' | 'Roof' | 'Connectors';

export type Member = {
  name: string;
  group: MemberGroup;
  color: string;
  size: string;
  role: string;
  kind?: 'wood' | 'osb' | 'concrete' | 'steel' | 'treated' | 'lvl';
};

export const MEMBERS = {
  slab: {
    name: 'Concrete slab-on-grade',
    group: 'Foundation',
    color: '#a9a59c',
    kind: 'concrete',
    size: '4" slab, thickened under bearing walls',
    role: 'Carries every load path down to the soil. Thickened edges act as the footing under the walls.',
  },
  anchor: {
    name: 'Anchor bolts',
    group: 'Foundation',
    color: '#8d969f',
    kind: 'steel',
    size: '5/8" Ø @ 4\'-0" o.c., 12" from plate ends',
    role: 'Cast into the concrete and bolted through the sill plate to stop the walls sliding or lifting.',
  },
  sill: {
    name: 'Sill plate (treated)',
    group: 'Foundation',
    color: '#9fae7c',
    kind: 'treated',
    size: '2x6 pressure-treated',
    role: 'The first piece on the concrete. Preservative-treated lumber that the walls are built from and anchored through.',
  },
  stud: {
    name: 'Studs',
    group: 'Walls',
    color: '#dcb47a',
    size: '2x6 @ 16" o.c. exterior · 2x4 interior',
    role: 'The vertical members of the wall. They carry floor and roof loads down and back up the sheathing and finishes.',
  },
  king: {
    name: 'King studs',
    group: 'Walls',
    color: '#e2bd85',
    size: 'Full-height 2x each side of an opening',
    role: 'Run full height beside every opening, tying the header into the plates and taking wind load around the opening.',
  },
  trimmer: {
    name: 'Trimmer (jack) studs',
    group: 'Walls',
    color: '#d3a86c',
    size: '2x under each end of a header',
    role: 'Short studs fastened to the king studs. They carry the header load down to the plate.',
  },
  header: {
    name: 'Headers',
    group: 'Walls',
    color: '#c38f55',
    kind: 'lvl',
    size: '(2) 2x8 / (2) 2x10 · LVL at the garage door',
    role: 'Beams over doors and windows that span the opening and carry the load above out to the trimmers.',
  },
  cripple: {
    name: 'Cripple studs',
    group: 'Walls',
    color: '#e6c48f',
    size: '2x on the 16" stud layout',
    role: 'Short studs above headers and below window sills. They keep the stud layout continuous for sheathing and finishes.',
  },
  roughSill: {
    name: 'Rough sills',
    group: 'Walls',
    color: '#cfa064',
    size: '2x laid flat',
    role: 'The framed bottom of a window opening. It supports the window, with cripple studs below.',
  },
  blocking: {
    name: 'Wall blocking',
    group: 'Walls',
    color: '#c99a5e',
    size: '2x between studs at mid-height',
    role: 'Fire-blocking, stud bracing and backing for fixtures and cabinets.',
  },
  topPlate: {
    name: 'Double top plate',
    group: 'Walls',
    color: '#d1a467',
    size: '(2) 2x, lapped at corners and splices',
    role: 'Caps the wall, ties walls together at corners and spreads joist and rafter loads into the studs.',
  },
  bottomPlate: {
    name: 'Bottom (sole) plate',
    group: 'Walls',
    color: '#d6ab6f',
    size: '2x on the subfloor',
    role: 'The base of the upper-floor walls, nailed through the subfloor into the joists and rim board.',
  },
  sheathing: {
    name: 'Shear wall sheathing',
    group: 'Walls',
    color: '#d9bd8c',
    kind: 'osb',
    size: '7/16" OSB, edge-nailed',
    role: 'Wood structural panels nailed to the framing turn a wall into a shear wall that resists wind and earthquake loads.',
  },
  rim: {
    name: 'Rim board',
    group: 'Floor',
    color: '#c8975a',
    kind: 'lvl',
    size: '1-1/4" x 9-1/4" LSL',
    role: 'Closes the ends of the floor joists, carries the wall above and ties the floor diaphragm together.',
  },
  joist: {
    name: 'Floor joists',
    group: 'Floor',
    color: '#dfb87e',
    size: '2x10 @ 16" o.c.',
    role: 'Span between bearing walls to carry the second floor. Lapped over the centre bearing wall.',
  },
  joistBlock: {
    name: 'Joist blocking',
    group: 'Floor',
    color: '#c5965b',
    size: '2x10 solid blocking',
    role: 'Braces the joists against rolling and passes floor shear down into the bearing walls.',
  },
  subfloor: {
    name: 'Subfloor',
    group: 'Floor',
    color: '#dcc08f',
    kind: 'osb',
    size: '3/4" T&G OSB, glued and nailed',
    role: 'The floor deck. It also acts as the horizontal diaphragm that delivers lateral load to the shear walls.',
  },
  ceilingJoist: {
    name: 'Ceiling joists',
    group: 'Roof',
    color: '#e0ba82',
    size: '2x8 @ 24" o.c.',
    role: 'Carry the ceiling and tie the walls together at plate level to resist rafter thrust.',
  },
  rafter: {
    name: 'Rafters',
    group: 'Roof',
    color: '#d8ad70',
    size: '2x10 @ 24" o.c., 6:12 pitch',
    role: 'Sloped members that carry roof dead, snow and wind loads down to the walls.',
  },
  ridge: {
    name: 'Ridge board',
    group: 'Roof',
    color: '#c38f55',
    size: '2x12',
    role: 'The member at the peak that the rafters frame against from both sides.',
  },
  collar: {
    name: 'Collar ties',
    group: 'Roof',
    color: '#cda064',
    size: '2x6 @ 48" o.c.',
    role: 'Horizontal ties in the upper third of the roof that hold rafter pairs together under wind uplift.',
  },
  gableStud: {
    name: 'Gable studs',
    group: 'Roof',
    color: '#e4c08a',
    size: '2x @ 16" o.c.',
    role: 'Fill the triangular gable ends between the top plate and the end rafter or truss.',
  },
  fascia: {
    name: 'Sub-fascia',
    group: 'Roof',
    color: '#c99a5e',
    size: '2x across the rafter tails',
    role: 'Ties the rafter tails together and supports the gutter and fascia trim.',
  },
  truss: {
    name: 'Roof trusses',
    group: 'Roof',
    color: '#dab070',
    size: 'Prefabricated 2x4 chords and webs @ 24" o.c.',
    role: 'Engineered triangulated frames (top chord, bottom chord and webs) that span the garage with no interior support.',
  },
  ledger: {
    name: 'Ledger',
    group: 'Roof',
    color: '#9fae7c',
    kind: 'treated',
    size: '2x10, bolted to the house framing',
    role: 'Supports the garage trusses where they meet the two-storey house wall.',
  },
  holdown: {
    name: 'Hold-downs',
    group: 'Connectors',
    color: '#9aa4ae',
    kind: 'steel',
    size: 'Steel bracket + anchor rod at shear-wall ends',
    role: 'Anchor the end posts of each shear wall into the foundation so the wall cannot overturn.',
  },
  strap: {
    name: 'Floor-to-floor straps',
    group: 'Connectors',
    color: '#9aa4ae',
    kind: 'steel',
    size: 'Steel strap ties across the floor framing',
    role: 'Connect the upper shear-wall ends to the wall below, continuing the uplift load path through the floor.',
  },
  hurricane: {
    name: 'Hurricane ties',
    group: 'Connectors',
    color: '#9aa4ae',
    kind: 'steel',
    size: 'At every rafter and truss',
    role: 'Clip each rafter or truss to the top plate to resist wind uplift.',
  },
  trussPlate: {
    name: 'Truss plates',
    group: 'Connectors',
    color: '#aab3bc',
    kind: 'steel',
    size: 'Galvanized toothed steel plates',
    role: 'Pressed into both faces of every truss joint to connect the chords and webs.',
  },
} satisfies Record<string, Member>;

export type MemberId = keyof typeof MEMBERS;

export const GROUPS: MemberGroup[] = ['Foundation', 'Walls', 'Floor', 'Roof', 'Connectors'];
