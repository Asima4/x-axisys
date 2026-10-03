import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Real projects live in /projects/<project-folder>/project.md with their images alongside.
// See projects/_template/project.md for a ready-to-copy example.
const imageItem = (image: () => z.ZodTypeAny) =>
  z.object({
    src: image(),
    caption: z.string().optional(),
  });

const projects = defineCollection({
  loader: glob({
    pattern: ['**/project.md', '!_template/**'],
    base: './projects',
    // The folder containing project.md becomes the URL: projects/green-valley-villa/project.md → /projects/green-valley-villa/
    generateId: ({ entry }) => entry.split(/[\\/]/).slice(-2)[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      location: z.string().optional(),
      year: z.union([z.string(), z.number()]).optional(),
      client: z.string().optional(),
      sector: z.string().default('Residential'),
      status: z.string().optional(),
      area: z.string().optional(),
      disciplines: z.array(z.enum(['arch', 'str', 'mep', 'bim', 'render', 'scan'])).default(['arch']),
      cover: image().optional(),
      renders: z.array(imageItem(image)).default([]),
      plans: z.array(imageItem(image)).default([]),
      elevations: z.array(imageItem(image)).default([]),
      sections: z.array(imageItem(image)).default([]),
      structural: z.array(imageItem(image)).default([]),
      mep: z.array(imageItem(image)).default([]),
      model: z.string().optional(), // path to a .glb in /public, e.g. /models/my-project.glb
      video: z.string().optional(), // path to an .mp4 in /public, e.g. /videos/my-project.mp4
      videoPoster: image().optional(),
      scope: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      coords: z.tuple([z.number(), z.number()]).optional(), // [latitude, longitude] for the project map
      brief: z.string().optional(),
      challenge: z.string().optional(),
      outcome: z.string().optional(),
      compare: z
        .array(
          z.object({
            before: image(),
            after: image(),
            beforeLabel: z.string(),
            afterLabel: z.string(),
            caption: z.string().optional(),
          }),
        )
        .default([]),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
