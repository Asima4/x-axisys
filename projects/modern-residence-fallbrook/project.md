---
title: Modern Two-Storey Residence
summary: "A contemporary two-storey home with wrap-around balcony — architectural plans, elevations and sections plus complete structural foundation and framing design."
location: "Fallbrook, California, USA"
year: 2025
sector: "Residential"
status: "Permit set"
disciplines: [arch, str]
cover: ./cover-3d.jpg

renders:
  - src: ./cover-3d.jpg
    caption: 3D model
plans:
  - src: ./plan-ground.jpg
    caption: First floor plan
  - src: ./plan-first.jpg
    caption: Second floor plan
  - src: ./plan-roof.jpg
    caption: Roof plan
elevations:
  - src: ./elevations-front-rear.jpg
    caption: Front & rear elevations
  - src: ./elevations-sides.jpg
    caption: Side elevations
sections:
  - src: ./section-1.jpg
    caption: Cross sections 3 & 4
  - src: ./section-2.jpg
    caption: Cross section 1
structural:
  - src: ./str-foundation.jpg
    caption: Foundation plan
  - src: ./str-slab.jpg
    caption: Slab-on-grade foundation plan
  - src: ./str-framing-first.jpg
    caption: Second floor framing plan
  - src: ./str-framing-roof.jpg
    caption: Roof framing plan
  - src: ./str-details.jpg
    caption: Framing connection details
mep: []

scope:
  - Architectural floor, roof and elevation drawings
  - Building sections
  - Foundation and slab-on-grade design
  - Floor and roof framing plans with schedules
  - Typical framing connection details
tools:
  - Revit
coords: [33.376, -117.251]
brief: "Architectural and structural drawings for a contemporary two-storey home with a continuous balcony."
engineering:
  system: "Cold-formed steel light-frame structure — steel stud shear walls and C-section joists — with steel beams and columns where needed, on concrete spread footings and slab on grade."
  codes:
    - "IBC 2018"
    - "ACI 318"
    - "ACI 301"
    - "AISI S240"
    - "AISC Manual"
  criteria:
    - label: "Basic wind speed (3-s gust)"
      value: "96 mph"
    - label: "Exposure category"
      value: "C"
    - label: "Occupancy category"
      value: "II"
    - label: "Mapped spectral acceleration"
      value: "Ss 1.275g · S1 0.463g"
    - label: "Site class"
      value: "D"
    - label: "Design spectral acceleration"
      value: "SDS 1.02g"
    - label: "Response modification factor"
      value: "R = 6.5"
    - label: "Seismic base shear"
      value: "11.6 kips (ASD)"
    - label: "Analysis procedure"
      value: "Equivalent lateral force"
    - label: "Soil bearing pressure"
      value: "1,500 psf"
  loads:
    - label: "Roof live load"
      value: "20 psf"
    - label: "Floor live load"
      value: "40 psf"
    - label: "Stair live load"
      value: "60 psf"
    - label: "Roof / floor dead load"
      value: "20 psf"
  materials:
    - label: "Cold-formed steel"
      value: "SSMA C-studs & joists"
    - label: "Structural steel (W)"
      value: "ASTM A992 · Fy 50 ksi"
    - label: "Steel tube (HSS)"
      value: "ASTM A500 · Fy 46 ksi"
    - label: "Concrete"
      value: "f'c = 2,500 psi"
    - label: "Grout"
      value: "5,000 psi"
    - label: "Reinforcing steel"
      value: "ASTM A615 Gr 60"
  members:
    - "800S350-68 joists"
    - "800S350-54 joists"
    - "800S162-54 headers"
    - "400S200-54 studs"
    - "400S162-33 studs"
  software:
    - "Revit"
  highlights:
    - value: "SDS 1.02g"
      label: "Design seismic"
    - value: "R = 6.5"
      label: "CFS shear walls"
    - value: "96 mph"
      label: "Basic wind speed"
    - value: "11.6 k"
      label: "Base shear (ASD)"
featured: false
order: 5
draft: false
---

A two-storey residence with full-height glazing and a continuous balcony. Axisys produced the architectural drawing set and a coordinated structural package covering foundations, floor and roof framing, and connection details.
