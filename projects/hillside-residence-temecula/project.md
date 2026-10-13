---
title: Hillside Residence with Basement
summary: "Structural design of a two-level hillside home — a concrete basement with retaining walls below light-frame wood floors, shear walls and a trussed roof."
location: "Temecula, California, USA"
year: 2026
sector: "Residential"
status: "Permit set"
disciplines: [str]
cover: ./foundation-plan.jpg

renders: []
plans: []
elevations: []
sections:
  - src: ./details-retaining.jpg
    caption: Foundation, basement and retaining wall sections
  - src: ./details-connections.jpg
    caption: Framing connection details
structural:
  - src: ./foundation-plan.jpg
    caption: Foundation & basement plan
  - src: ./floor-framing.jpg
    caption: Main floor framing plan
  - src: ./roof-framing.jpg
    caption: Roof framing plan
  - src: ./lower-shear-walls.jpg
    caption: Lower level shear wall plan
  - src: ./main-shear-walls.jpg
    caption: Main floor shear wall plan
mep: []

scope:
  - Seismic weight and base shear calculation
  - Shear wall design and hold-down schedule
  - Floor and roof framing design
  - Concrete basement retaining walls, columns and footings
  - Permit structural drawing set and calculation package
tools:
  - AutoCAD
  - TEDDS
  - ForteWEB
coords: [33.49, -117.15]
brief: "Structural engineering for a two-level home stepping down a hillside site, with a basement level retaining the slope."
challenge: "A basement cut into the slope means retaining walls that also carry the house above, in a high seismic region."
outcome: "10-sheet structural permit set and a 131-page calculation package."
engineering:
  system: "Light-frame wood bearing and shear walls over a concrete basement with retaining walls, engineered floor framing and wood roof trusses, on concrete footings."
  codes:
    - "CBC 2022"
    - "ASCE 7-16"
    - "ACI 318-14"
  criteria:
    - label: "Risk category"
      value: "II"
    - label: "Mapped spectral acceleration"
      value: "Ss 1.385g · S1 0.503g"
    - label: "Design spectral acceleration"
      value: "SDS 1.108g"
    - label: "Site class"
      value: "D (default)"
    - label: "Lateral system"
      value: "Wood structural panel shear walls, R = 6.5"
    - label: "Seismic base shear (ASD)"
      value: "35.5 kips"
  loads:
    - label: "Seismic weight"
      value: "375 kips"
  members:
    - "Concrete basement retaining walls"
    - "Concrete columns & footings"
    - "4x6 DF posts"
    - "40 ft roof trusses"
    - "HDU2 / HDU5 / HDU8 / HDU11 hold-downs"
  software:
    - "TEDDS"
    - "ForteWEB"
    - "AutoCAD"
  highlights:
    - value: "131"
      label: "Page calc package"
    - value: "SDS 1.11g"
      label: "Design spectral accel."
    - value: "35.5 k"
      label: "Seismic base shear"
    - value: "10"
      label: "Structural sheets"
featured: false
order: 2
draft: false
---

A two-level family home on a sloping site in Temecula. The lower level is a concrete basement whose retaining walls hold back the hillside and support the light-frame wood house above. Axisys carried out the seismic analysis, shear wall and hold-down design, floor and roof framing, and the concrete retaining walls, columns and footings, issued as a structural permit set with a full calculation package.
