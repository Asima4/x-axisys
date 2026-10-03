# Axisys Global Engineering — Website

Official website for **Axisys Global Engineering** — *Beyond Boundaries, Beyond Blueprints*.

Built with [Astro](https://astro.build) as a fast static site, hosted on Netlify.

## Pages

| URL | Page |
| --- | --- |
| `/` | Home |
| `/services/` | The XI — 11 engineering services |
| `/projects/` | Project portfolio (sample project + your real projects) |
| `/projects/sample-residence/` | Sample project: interactive 3D model, renders and 9 drawing sheets |
| `/ai-innovation/` | AI & Innovation, StruxNova |
| `/about/` | About |
| `/careers/` | Careers + job application form (CV upload) |
| `/contact/` | Contact + quote request form |
| `/privacy-policy/`, `/terms/` | Legal |

## Editing content

Most text lives in **`src/data/site.ts`** (services, process steps, sectors, navigation).
Page-specific text is in `src/pages/*.astro`.

## 3D model & drawing set (sample project)

The sample residence is generated from one data file: **`src/lib/building.ts`** (grids, rooms, walls, openings, steel, ducts, pipes, lights).

- `src/scripts/viewer3d.ts` builds the interactive Three.js model with Architecture / Structure / MEP / Coordinated views and an exploded view.
- `src/lib/sheets.ts` draws the 9 SVG sheets (A-101, A-102, A-201, S-101, S-201, S-501, M-101, P-101, E-101) from the same data, so every drawing matches the model.
- Render images in `src/assets/renders/` were captured from the 3D viewer.

## Adding a real project

1. Copy `projects/_template` to a new folder, e.g. `projects/green-valley-villa/` (the folder name becomes the URL).
2. Put your images in that folder — 3D renders, plans, elevations, structural and MEP drawings (JPG/PNG/WebP).
   - Have a PDF drawing set? Convert pages to images:
     `pip install pymupdf` then `python scripts/pdf-to-images.py "projects/green-valley-villa/drawings.pdf"`
3. Edit `project.md`: title, summary, disciplines, and list your images under `renders`, `plans`, `elevations`, `structural`, `mep`.
4. Optional 3D model: export a `.glb` (e.g. from Revit via a glTF exporter, SketchUp, Blender), place it in `public/models/` and set `model: /models/your-file.glb`.
5. Set `draft: false`, then `npm run build` and upload again.

> Only publish client work you have permission to share. Remove client names, addresses and stamps from title blocks if needed.
> Original PDFs/DWG/RVT files in `projects/` are ignored by git and are **not** uploaded to the website — only the images you reference are.

## Develop locally

Requires Node.js 22+.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs the site to dist/
```

> Forms only send on the live Netlify site, not on `npm run dev`.

## Hosting (Netlify)

The site is hosted free on **Netlify**, connected to this GitHub repo. Every `git push` to `main` rebuilds and publishes the site automatically (settings in `netlify.toml`).

- Domain: `axisysglobal.com` is registered at Hostinger. DNS there points the site to Netlify (A record `@` and CNAME `www`); the MX/TXT records for Hostinger email stay unchanged.
- HTTPS certificate: issued automatically by Netlify.

### Forms

The quote form (`/contact/`) and job application form (`/careers/`, with CV upload) use **Netlify Forms**.
Submissions appear in Netlify → Site → Forms, and email notifications to `info@axisysglobal.com` are set under Forms → Form notifications.
Spam protection: hidden honeypot field plus Netlify's built-in spam filter.
