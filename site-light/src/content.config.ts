import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const SHARED = '../content';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: `${SHARED}/pages` }),
  schema: z.object({}).passthrough().optional(),
});

const news = defineCollection({
  loader: file(`${SHARED}/data/news.json`, {
    parser: (text) => JSON.parse(text).map((o: Record<string, unknown>) => ({ ...o, id: o.slug })),
  }),
  schema: z.object({
    slug: z.string(), date: z.string(), tag: z.string(),
    title: z.string(), teaser: z.string(), image: z.string(), body: z.string(),
  }),
});

export const collections = { pages, news };
