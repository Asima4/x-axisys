---
title: Curved Steel Park Pavilion
summary: "Structural analysis and design of an arched steel pavilion — 3D model, ASCE 7 wind, snow and seismic loads, member code checks, connections and foundations."
location: "Maryville, Illinois, USA"
year: 2025
sector: "Public & Recreation"
status: "Design for approval"
disciplines: [str]
cover: ./model-render.jpg

renders:
  - src: ./model-render.jpg
    caption: 3D pavilion model
plans: []
elevations: []
sections: []
structural:
  - src: ./model-3d.jpg
    caption: 3D analysis model
  - src: ./model-front.jpg
    caption: Front view
  - src: ./model-elevation.jpg
    caption: Elevation
  - src: ./model-side.jpg
    caption: Side view
  - src: ./model-sections.jpg
    caption: Section sets
  - src: ./code-check.jpg
    caption: Member code checks
  - src: ./results-moments.jpg
    caption: Bending moment results
  - src: ./results-forces.jpg
    caption: Member force results
mep: []

scope:
  - 3D analysis model of curved HSS steel frame
  - ASCE 7-16 wind, snow and seismic loading
  - Member code checks and deflection
  - Connection and base plate design
  - CMU utility room and foundation design
  - 504-page structural calculation report
tools:
  - RISA-3D
coords: [38.723, -89.956]
brief: "Structural analysis and design of a curved steel pavilion for a public park."
challenge: "Curved steel roof beams on slender columns, open on all sides to wind, snow and seismic loading."
outcome: "504-page structural calculation report issued for approval."
engineering:
  system: "Curved HSS steel roof beams spanning between pipe and tube columns, with the steel frame designed for wind, snow and seismic load, a CMU utility room and concrete foundations."
  codes:
    - "ASCE 7-16"
    - "AISC 341"
    - "ACI 318-19"
  criteria:
    - label: "Risk category"
      value: "III"
    - label: "Design wind speed"
      value: "115 mph"
    - label: "Exposure category"
      value: "C"
    - label: "Seismic design category"
      value: "D"
    - label: "Seismic importance factor"
      value: "Ie = 1.25"
    - label: "Design spectral acceleration"
      value: "SDS 0.43g · SD1 0.241g"
    - label: "Site class"
      value: "D (default)"
  loads:
    - label: "Ground snow load"
      value: "20 psf"
  materials:
    - label: "Steel tube (HSS)"
      value: "ASTM A500"
    - label: "Pipe"
      value: "ASTM A53"
    - label: "Reinforcing steel"
      value: "ASTM A615 Gr 60"
  members:
    - "HSS 10×4×1/4 curved beams"
    - "HSS 10×4×3/16"
    - "HSS 10×6×5/8"
    - "Pipe 6″ columns"
  software:
    - "RISA-3D"
  highlights:
    - value: "504"
      label: "Page calc report"
    - value: "Risk III"
      label: "Public assembly"
    - value: "SDC D"
      label: "Seismic design"
    - value: "115 mph"
      label: "Design wind"
featured: false
order: 7
draft: false
---

A public park pavilion with curved steel roof beams on HSS columns. Axisys carried out the full structural analysis and design — loads, member and connection checks, the adjoining utility room and foundations — documented in a detailed calculation report.
