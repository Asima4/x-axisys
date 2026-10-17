// Catalogue for the concept MEP / BIM coordination model (one office floor and its ceiling plenum).
// Illustrative concept model — sizes are typical, not a design for a specific building.
import type { Member } from './woodFrame';

export const MEP_MEMBERS = {
  slab: { detail: 1, name: 'Floor slab', group: 'Building', color: '#a9a59c', kind: 'concrete', size: 'Concrete slab on metal deck', role: 'Building context: the floor the services sit above and hang from.' },
  column: { detail: 1, name: 'Columns', group: 'Building', color: '#b9b5ad', kind: 'concrete', size: '20\'-0" structural grid', role: 'Fixed obstacles every system has to route around.' },
  beam: { detail: 1, name: 'Steel beams', group: 'Building', color: '#b5543f', size: 'W24 beams, bottom of steel at 12\'-0"', role: 'Set the top of the ceiling plenum — services must run below them or through approved openings.' },
  ceiling: { detail: 1, name: 'Ceiling grid', group: 'Building', color: '#e6e3dc', size: '2x4 suspended grid at 9\'-6" A.F.F.', role: 'Sets the bottom of the plenum and holds lights, diffusers and sprinkler heads.' },

  ahu: { detail: 3, name: 'Air handling unit', group: 'HVAC', color: '#9aa6b2', kind: 'steel', size: 'Packaged AHU on housekeeping pad', role: 'Filters, cools or heats and moves the air for the whole floor.' },
  supplyDuct: { detail: 2, name: 'Supply ductwork', group: 'HVAC', color: '#4f9de0', kind: 'steel', size: '30x14 trunk reducing to 18x12, galvanized', role: 'Carries conditioned air from the AHU to the zones; sized for velocity and static pressure.' },
  returnDuct: { detail: 2, name: 'Return ductwork', group: 'HVAC', color: '#d46aa8', kind: 'steel', size: '22x12 return main', role: 'Brings room air back to the AHU through the return grilles.' },
  vav: { detail: 3, name: 'VAV boxes', group: 'HVAC', color: '#7fb2e5', kind: 'steel', size: 'Pressure-independent VAV terminals', role: 'Vary the airflow to each zone to hold its temperature set point.' },
  diffuser: { detail: 3, name: 'Diffusers & grilles', group: 'HVAC', color: '#eef2f6', kind: 'steel', size: '24x24 ceiling diffusers and return grilles', role: 'Deliver and collect air at the ceiling with an even throw pattern.' },
  flex: { detail: 3, name: 'Flex duct', group: 'HVAC', color: '#c9d3dc', size: 'Insulated flex, 5\'-0" max length', role: 'Final flexible connection from the branch duct to each diffuser.' },

  chw: { detail: 4, name: 'Chilled water', group: 'Piping', color: '#2fb4a5', kind: 'steel', size: '6" CHWS / CHWR, insulated', role: 'Carries chilled water from the central plant to the AHU cooling coil.' },
  hw: { detail: 4, name: 'Heating hot water', group: 'Piping', color: '#e05c4f', kind: 'steel', size: '3" HWS / HWR, insulated', role: 'Feeds the AHU heating coil and VAV reheat coils.' },
  dcw: { detail: 4, name: 'Domestic cold water', group: 'Piping', color: '#5bc0eb', kind: 'steel', size: '2" copper, insulated', role: 'Potable water supply to the restroom fixtures and water heater.' },
  dhw: { detail: 4, name: 'Domestic hot water', group: 'Piping', color: '#f2994a', kind: 'steel', size: '1-1/2" copper with return', role: 'Hot water from the water heater to the fixtures.' },
  sanitary: { detail: 4, name: 'Sanitary & vent', group: 'Piping', color: '#8d6e4b', size: '4" sanitary at 1/4" per ft, vent stack', role: 'Drains the fixtures by gravity and vents the system to atmosphere.' },
  equipment: { detail: 4, name: 'Pumps & water heater', group: 'Piping', color: '#3f8f86', kind: 'steel', size: 'Inline pumps, storage water heater', role: 'Circulate the hydronic loops and heat domestic water.' },
  fixture: { detail: 4, name: 'Plumbing fixtures', group: 'Piping', color: '#f4f4f4', size: 'WCs and lavatories', role: 'The end points the domestic water and sanitary systems serve.' },

  sprinklerMain: { detail: 5, name: 'Sprinkler main', group: 'Fire protection', color: '#e2483a', kind: 'steel', size: '4" Sch. 10 cross main with riser', role: 'Feeds the branch lines from the fire riser.' },
  sprinklerBranch: { detail: 5, name: 'Branch lines & drops', group: 'Fire protection', color: '#ef6a5e', kind: 'steel', size: '1-1/4" branch lines, 1" drops', role: 'Distribute water across the floor to every sprinkler head.' },
  sprinklerHead: { detail: 5, name: 'Sprinkler heads', group: 'Fire protection', color: '#c0c4c9', kind: 'steel', size: 'Pendent heads, spacing per NFPA 13', role: 'Discharge water over their coverage area when they activate.' },

  cableTray: { detail: 6, name: 'Cable tray', group: 'Electrical', color: '#f2c14e', kind: 'steel', size: '18" x 4" ladder tray', role: 'Carries power and data cabling along the floor, supported on trapezes.' },
  conduit: { detail: 6, name: 'Conduit', group: 'Electrical', color: '#c9a227', kind: 'steel', size: '3/4"–1" EMT', role: 'Protects branch circuits from the tray and panels to devices.' },
  panel: { detail: 6, name: 'Panelboards', group: 'Electrical', color: '#6b7480', kind: 'steel', size: 'Lighting & power panelboards', role: 'Distribute power to branch circuits with overcurrent protection.' },
  light: { detail: 6, name: 'Light fixtures', group: 'Electrical', color: '#fff0b8', size: '2x4 LED troffers', role: 'Recessed in the ceiling grid, laid out from the lighting calculation.' },

  support: { detail: 2, name: 'Hangers & seismic bracing', group: 'Coordination', color: '#5f6871', kind: 'steel', size: 'Trapeze & clevis hangers, threaded rods, sway braces', role: 'Hold every system to the structure and restrain it against earthquakes.' },
  clash: { detail: 1, name: 'Clash points', group: 'Coordination', color: '#ff2d55', size: 'Found in the federated model', role: 'Where two systems occupy the same space. Each one is found in clash detection and resolved in coordination before anything is built.' },
} satisfies Record<string, Member>;

export const MEP_GROUPS = ['Building', 'HVAC', 'Piping', 'Fire protection', 'Electrical', 'Coordination'];
