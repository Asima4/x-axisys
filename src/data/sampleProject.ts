import { building as B } from '../lib/building';

const gfa = B.width * B.depth * B.levels.length;

export const sampleProject = {
  slug: 'sample-residence',
  title: 'Two-Storey Residence',
  sector: 'Residential',
  summary:
    'A sample project showing how Axisys delivers architecture, structure and MEP from one coordinated model — complete with an interactive 3D model and a full drawing set.',
  disciplines: ['arch', 'str', 'mep'] as const,
  facts: [
    { label: 'Type', value: 'Detached residence' },
    { label: 'Gross floor area', value: `${Math.round(gfa)} m²` },
    { label: 'Storeys', value: String(B.levels.length) },
    { label: 'Structure', value: 'Steel frame · pad footings' },
    { label: 'MEP', value: 'Ducted HVAC · LED · heat pump' },
    { label: 'Deliverables', value: '3D model · 9 drawing sheets' },
  ],
  scope: [
    {
      discipline: 'Architecture',
      icon: 'DraftingCompass',
      items: ['Floor plans for every level', 'Elevations and material schedule', 'Door, window and room data', 'Photoreal 3D views'],
    },
    {
      discipline: 'Structure',
      icon: 'Building2',
      items: ['Foundation and framing plans', 'Steel member and footing schedules', 'Connection and base plate details', 'Lateral bracing design'],
    },
    {
      discipline: 'MEP',
      icon: 'Zap',
      items: ['HVAC ductwork and equipment', 'Plumbing, drainage and risers', 'Lighting, power and cable routes', 'Clash-checked against structure'],
    },
  ],
};
