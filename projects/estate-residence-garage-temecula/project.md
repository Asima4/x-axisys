---
title: Estate Residence, ADU & Six-Car Garage
summary: "Structural design for a large estate — the main house and ADU, plus a two-level six-car garage with steel moment frames and Strong-Wall shear panels at its wide openings."
location: "Temecula, California, USA"
year: 2026
sector: "Residential"
status: "Permit set"
disciplines: [str]
cover: ./house-floor-framing.jpg

renders: []
plans: []
elevations: []
sections:
  - src: ./steel-connections.jpg
    caption: Steel beam & column connection details
  - src: ./steel-details.jpg
    caption: Steel framing details
  - src: ./column-details.jpg
    caption: Column, base plate & footing details
structural:
  - src: ./house-foundation.jpg
    caption: Main house foundation plan
  - src: ./house-floor-framing.jpg
    caption: Main house floor framing plan
  - src: ./house-roof-framing.jpg
    caption: Main house roof framing plan
  - src: ./house-shear-walls.jpg
    caption: Main house shear wall plan
  - src: ./garage-foundation.jpg
    caption: Six-car garage foundation plan
  - src: ./garage-floor-framing.jpg
    caption: Garage second level floor framing
  - src: ./garage-roof-framing.jpg
    caption: Garage roof framing plan
  - src: ./garage-shear-walls.jpg
    caption: Garage first level shear wall plan
  - src: ./moment-frames.jpg
    caption: Moment frame line diagrams
  - src: ./mf-members.jpg
    caption: RISA-3D moment frame — W18x50 beam on W8x21 columns
  - src: ./mf-loads.jpg
    caption: RISA-3D moment frame — applied loads
  - src: ./mf-moments.jpg
    caption: RISA-3D moment frame — bending moments
  - src: ./mf-code-check.jpg
    caption: RISA-3D moment frame — member code checks (max 0.79)
mep: []

scope:
  - Seismic weight and base shear for the garage and the main house & ADU
  - Steel moment frame analysis and design (RISA-3D)
  - Steel connection design (IDEA StatiCa)
  - Wood shear walls, Strong-Wall panels and hold-downs
  - Steel, LVL and glulam beams, headers and posts
  - Footings, grade beams and slab on grade
  - Permit structural drawing sets and calculation packages
tools:
  - RISA-3D
  - IDEA StatiCa
  - ForteWEB
  - TEDDS
  - AutoCAD
coords: [33.5, -117.05]
brief: "Structural engineering for an estate property: a main house with an ADU, and a separate two-level six-car garage."
challenge: "Wide garage door openings leave little wall for bracing, so the lateral system combines steel moment frames, Strong-Wall panels and wood shear walls in a high seismic region."
outcome: "Two 19-sheet structural permit sets and about 490 pages of calculations."
engineering:
  system: "Light-frame wood shear walls with Simpson Strong-Wall panels and steel moment frames at the garage openings; steel W-shape beams and columns with LVL and glulam framing in the main house, on concrete footings, grade beams and slab on grade."
  codes:
    - "ASCE 7-16"
    - "ACI 318"
    - "NDS"
  criteria:
    - label: "Risk category"
      value: "II"
    - label: "Design wind speed"
      value: "96 mph"
    - label: "Mapped spectral acceleration"
      value: "Ss 1.39g · S1 0.509g"
    - label: "Design spectral acceleration"
      value: "SDS 1.112g"
    - label: "Site class"
      value: "D (default)"
    - label: "Lateral system"
      value: "Wood shear walls (R = 6.5), steel moment frames"
    - label: "Garage seismic base shear (ASD)"
      value: "17.8 kips"
    - label: "Main house & ADU seismic base shear (ASD)"
      value: "20.9 kips"
  loads:
    - label: "Garage seismic weight"
      value: "188 kips"
    - label: "Main house & ADU seismic weight"
      value: "221 kips"
  members:
    - "W18x50 / W8x21 moment frames"
    - "W12x26, W12x35, W24x62 steel beams"
    - "HSS6x6x1/4 columns"
    - "LVL & glulam beams and headers"
    - "Strong-Wall WSW / WSWH panels"
    - "HDU2 / HDU5 / HDU8 hold-downs"
  software:
    - "RISA-3D"
    - "IDEA StatiCa"
    - "ForteWEB"
    - "TEDDS"
  highlights:
    - value: "≈490"
      label: "Pages of calcs"
    - value: "38"
      label: "Structural sheets"
    - value: "0.79"
      label: "Max frame code check"
    - value: "96 mph"
      label: "Design wind"
featured: false
order: 3
draft: false
---

An estate property in Temecula with a main house and ADU, and a separate two-level garage for six cars. The garage's wide door openings leave little solid wall, so its lateral system combines steel moment frames, analysed in RISA-3D, with Simpson Strong-Wall panels and wood shear walls. In the main house, steel W-shape beams and columns work alongside LVL and glulam framing. Axisys designed the structure of both buildings, including the steel connections, hold-downs and foundations, and issued permit drawing sets with full calculation packages.
