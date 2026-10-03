// Central content for the site. Edit text here rather than inside page files.

export const site = {
  name: 'Axisys Global Engineering',
  shortName: 'Axisys',
  url: 'https://axisysglobal.com',
  tagline: 'Beyond Boundaries, Beyond Blueprints',
  description:
    'Axisys Global Engineering delivers integrated structural, architectural, MEP and BIM engineering — powered by AI, digital delivery and sustainable design.',
};

export const nav = [
  { label: 'Services', href: '/services/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'AI & Innovation', href: '/ai-innovation/' },
  { label: 'About', href: '/about/' },
  { label: 'Careers', href: '/careers/' },
];

export type Service = {
  id: string;
  code: string;
  name: string;
  icon: string;
  summary: string;
  deliverables: string[];
  tools: string[];
};

export type ServiceGroup = {
  id: string;
  title: string;
  intro: string;
  services: Service[];
};

// "The XI" — eleven integrated disciplines, grouped for readability.
export const serviceGroups: ServiceGroup[] = [
  {
    id: 'design-engineering',
    title: 'Design & Engineering',
    intro: 'The core disciplines that make a building stand, function and perform.',
    services: [
      {
        id: 'structural-engineering',
        code: 'X-01',
        name: 'Structural Engineering',
        icon: 'Building2',
        summary:
          'Safe, efficient and buildable structural systems for residential, commercial and industrial projects — in concrete, steel, timber and composite construction.',
        deliverables: ['Structural analysis & design', 'Foundation design', 'Steel & RC detailing', 'Calculation reports'],
        tools: ['ETABS', 'SAP2000', 'Tekla', 'Revit'],
      },
      {
        id: 'architecture',
        code: 'X-02',
        name: 'Architecture',
        icon: 'DraftingCompass',
        summary:
          'Concept-to-construction architectural design that balances function, form, code compliance and cost.',
        deliverables: ['Concept & schematic design', 'Planning drawings', 'Construction documentation', 'Space planning'],
        tools: ['Revit', 'AutoCAD', 'SketchUp', 'Rhino'],
      },
      {
        id: 'mep-engineering',
        code: 'X-03',
        name: 'MEP Engineering',
        icon: 'Zap',
        summary:
          'Coordinated mechanical, electrical and plumbing design that improves energy performance, safety and occupant comfort.',
        deliverables: ['HVAC design & load calculations', 'Power & lighting design', 'Plumbing & drainage', 'Fire protection layouts'],
        tools: ['Revit MEP', 'AutoCAD MEP', 'HAP', 'DIALux'],
      },
      {
        id: 'piping-engineering',
        code: 'X-04',
        name: 'Piping Engineering',
        icon: 'Workflow',
        summary:
          'Process and utility piping design for industrial facilities, from layouts and routing to isometrics and material take-offs.',
        deliverables: ['Piping layouts & routing', 'Isometric drawings', 'Material take-offs', 'Stress-critical line lists'],
        tools: ['AutoCAD Plant 3D', 'Navisworks', 'Revit'],
      },
    ],
  },
  {
    id: 'digital-delivery',
    title: 'Digital Delivery',
    intro: 'Models and visuals that let every stakeholder see, check and agree before anything is built.',
    services: [
      {
        id: 'bim-services',
        code: 'X-05',
        name: 'BIM Services',
        icon: 'Boxes',
        summary:
          'Federated BIM models, clash detection and coordination that cut rework and keep multidisciplinary teams aligned.',
        deliverables: ['LOD 100–500 modelling', 'Clash detection & coordination', 'Scan-to-BIM', 'Quantity take-offs'],
        tools: ['Revit', 'Navisworks', 'Dynamo', 'ACC / BIM 360'],
      },
      {
        id: '3d-rendering-animation',
        code: 'X-06',
        name: '3D Rendering & Animation',
        icon: 'Clapperboard',
        summary:
          'Photorealistic stills, walkthroughs and animations for design reviews, approvals, marketing and sales.',
        deliverables: ['Exterior & interior renders', 'Walkthrough animations', 'Construction sequencing', '360° panoramas'],
        tools: ['Lumion', 'Enscape', 'Twinmotion', '3ds Max'],
      },
      {
        id: 'ar-vr-integration',
        code: 'X-07',
        name: 'AR/VR Integration',
        icon: 'Glasses',
        summary:
          'Immersive design reviews and on-site augmented overlays that make complex designs easy to understand.',
        deliverables: ['VR design reviews', 'AR site overlays', 'Interactive client presentations'],
        tools: ['Unreal Engine', 'Unity', 'Enscape VR'],
      },
      {
        id: '3d-printing-prototypes',
        code: 'X-08',
        name: '3D Printing & Prototypes',
        icon: 'Printer',
        summary:
          'Physical scale models and prototypes produced directly from design models for presentation and validation.',
        deliverables: ['Architectural scale models', 'Component prototypes', 'Model preparation for printing'],
        tools: ['Rhino', 'Fusion 360', 'Slicer workflows'],
      },
    ],
  },
  {
    id: 'advanced-technology',
    title: 'Advanced Technology',
    intro: 'Data, automation and sustainability built into the design process — not added at the end.',
    services: [
      {
        id: 'ai-assisted-design',
        code: 'X-09',
        name: 'AI-Assisted Design',
        icon: 'BrainCircuit',
        summary:
          'AI and automation that speed up design iterations, check models against rules and surface better options earlier.',
        deliverables: ['Design automation scripts', 'Option studies', 'Model QA & rule checking', 'Workflow automation'],
        tools: ['Python', 'Dynamo', 'Grasshopper', 'Machine learning'],
      },
      {
        id: 'drone-laser-scanning',
        code: 'X-10',
        name: 'Drone & Laser Scanning',
        icon: 'ScanLine',
        summary:
          'Accurate as-built capture using drone surveys and terrestrial laser scanning, converted into usable drawings and models.',
        deliverables: ['Point cloud capture & registration', 'Scan-to-BIM', 'Drone site surveys', 'As-built drawings'],
        tools: ['ReCap', 'Cyclone', 'Pix4D'],
      },
      {
        id: 'sustainability-consulting',
        code: 'X-11',
        name: 'Sustainability Consulting',
        icon: 'Leaf',
        summary:
          'Energy modelling, carbon analysis and green building support to meet targets such as LEED, IGBC and GRIHA.',
        deliverables: ['Energy modelling', 'Daylight analysis', 'Embodied carbon studies', 'Green rating support'],
        tools: ['DesignBuilder', 'EnergyPlus', 'IES VE'],
      },
    ],
  },
];

export const allServices = serviceGroups.flatMap((g) => g.services);

export const processSteps = [
  { title: 'Consult', text: 'We learn your goals, constraints, codes and deadlines, then agree a clear scope.' },
  { title: 'Plan', text: 'A delivery plan with milestones, responsibilities, deliverables and review points.' },
  { title: 'Engineer', text: 'Disciplines work in one coordinated model, with regular reviews and quality checks.' },
  { title: 'Deliver', text: 'Issued-for-construction documents, models and ongoing support through the build.' },
];

export const sectors = [
  { name: 'Residential', icon: 'House' },
  { name: 'Commercial & Office', icon: 'Building' },
  { name: 'Industrial & Manufacturing', icon: 'Factory' },
  { name: 'Healthcare & Education', icon: 'School' },
  { name: 'Hospitality & Retail', icon: 'Store' },
  { name: 'Infrastructure', icon: 'Landmark' },
];

export const quoteServiceOptions = [...allServices.map((s) => s.name), 'Multiple services / not sure yet'];
