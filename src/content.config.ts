import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const wohnungen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wohnungen' }),
  schema: z.object({
    title: z.string(),
    teaser: z.string(),
    order: z.number().default(0),
    personenMin: z.number().optional(),
    personen: z.number().optional(),
    schlafzimmer: z.number().optional(),
    groesse: z.number().optional(),
    preisAb: z.number().optional(),
    ausstattung: z.array(z.string()).default([]),
    bild: z.string().optional(),
    bildAlt: z.string().optional(),
    bookingUrl: z.url().optional(),
  }),
});

const seiten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/seiten' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const eintrag = z.object({
  name: z.string(),
  text: z.string(),
  ort: z.string().optional(),
  info: z.string().optional(),
  url: z.url().optional(),
});

const region = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/region' }),
  schema: z.object({
    title: z.string(),
    kurz: z.string(),
    description: z.string(),
    order: z.number().default(0),
    schemaTyp: z.enum(['TouristAttraction', 'Restaurant', 'Event']).optional(),
    eintraege: z.array(eintrag).default([]),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    bild: z.string().optional(),
    bildAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { wohnungen, news, seiten, region };
