---
# Copy this whole _template folder, rename it (e.g. "green-valley-villa"),
# put your images next to this file and fill in the details below.
# The folder name becomes the page address: /projects/green-valley-villa/

title: Green Valley Villa
summary: Two-storey villa with steel frame, full MEP design and BIM coordination.
location: Dubai, UAE          # optional
year: 2026                    # optional
client: Private client        # optional — leave out if confidential
sector: Residential
status: Completed             # e.g. Completed, In construction, Design stage
area: 420 m²                  # optional
disciplines: [arch, str, mep] # any of: arch, str, mep, bim, render, scan

cover: ./cover.jpg            # main image (3D render works best)

renders:
  - src: ./render-front.jpg
    caption: Front view
plans:
  - src: ./ground-floor-plan.png
    caption: Ground floor plan
elevations:
  - src: ./elevations.png
sections: []
structural:
  - src: ./framing-plan.png
    caption: First floor framing plan
mep:
  - src: ./hvac-layout.png
    caption: HVAC layout

# model: /models/green-valley-villa.glb   # optional 3D model placed in public/models/
order: 10                     # lower numbers appear first
draft: true                   # set to false to publish
---

Write a longer project description here (optional). Explain the brief, the challenges
and what Axisys delivered.
