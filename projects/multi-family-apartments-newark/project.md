---
title: Multi-Family Apartment Building
summary: "Structural analysis and design of a mid-rise apartment building — full 3D analysis model, seismic and wind analysis, member design, wall panels and story drift checks."
location: "Newark, New Jersey, USA"
year: 2025
sector: "Residential — Multi-family"
status: "Design for approval"
disciplines: [str]
cover: ./model-render.jpg

renders:
  - src: ./model-render.jpg
    caption: 3D structural model
plans: []
elevations: []
sections: []
structural:
  - src: ./model-3d-1.jpg
    caption: 3D analysis model — view 1
  - src: ./model-3d-2.jpg
    caption: 3D analysis model — view 2
  - src: ./model-3d-3.jpg
    caption: 3D analysis model — view 3
  - src: ./model-3d-4.jpg
    caption: 3D analysis model — view 4
  - src: ./model-plan.jpg
    caption: Model plan view
  - src: ./model-materials-1.jpg
    caption: Materials and section sets — view 1
  - src: ./model-materials-2.jpg
    caption: Materials and section sets — view 2
  - src: ./model-materials-3.jpg
    caption: Materials and section sets — view 3
mep: []

scope:
  - Full 3D structural analysis model
  - Seismic and wind analysis to ASCE 7
  - Load combinations and member reactions
  - Concrete, steel and cold-formed member code checks
  - Wall panel design and story drift verification
  - 314-page structural calculation report
tools:
  - RISA-3D
coords: [40.736, -74.172]
brief: "Structural analysis and design of a mid-rise multi-family apartment building."
challenge: "A multi-storey building combining concrete and cold-formed steel, analysed as one complete 3D model for seismic and wind loading."
outcome: "314-page structural calculation report issued for approval."
compare:
  - before: ./compare-model-1.jpg
    after: ./compare-materials-1.jpg
    beforeLabel: Analysis model
    afterLabel: Materials & sections
    caption: "The same 3D analysis model, showing member materials and section sets"
engineering:
  system: "Multi-storey building modelled in full 3D: concrete and masonry lower levels with cold-formed steel wall panels above, steel framing at transfers, analysed for wind and seismic per ASCE 7-22."
  codes:
    - "ASCE 7-22"
    - "ACI 318-19"
    - "AISI S100"
    - "NDS"
    - "TMS 402"
  criteria:
    - label: "Design wind speed"
      value: "115 mph"
    - label: "Exposure category"
      value: "B"
    - label: "Risk category"
      value: "II"
    - label: "Design spectral acceleration"
      value: "SDS 0.292g · SD1 0.071g"
    - label: "Response modification factor"
      value: "R = 4"
  loads: []
  materials:
    - label: "Cold-formed steel panels"
      value: "ASTM A653 SS Gr 33"
    - label: "Concrete"
      value: "3,000 psi normal weight"
    - label: "Steel tube (HSS)"
      value: "ASTM A500"
    - label: "Structural steel"
      value: "ASTM A992 / A572"
    - label: "Reinforcing steel"
      value: "ASTM A615 Gr 60"
  members:
    - "HSS 8×6 columns"
    - "W10×33"
    - "W8×10"
    - "16×18 in concrete beams"
  software:
    - "RISA-3D"
  highlights:
    - value: "314"
      label: "Page calc report"
    - value: "ASCE 7-22"
      label: "Load standard"
    - value: "115 mph"
      label: "Design wind"
    - value: "RISA-3D"
      label: "Analysis model"
featured: false
order: 6
draft: false
---

A multi-storey apartment building analysed as a complete 3D model. Axisys prepared the structural calculation report, covering model properties, seismic and wind analysis, loads, member design, wall panels, deflection and story drift.
