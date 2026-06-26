import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Markdown body pages (Статут text, Майнові питання, Доступ, Атестація, etc.)
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/data/pages' }),
  schema: z.object({}).passthrough().optional(),
});

// News feed — each item becomes a static route /novyny/[slug]
const news = defineCollection({
  loader: file('./src/data/news.json', {
    parser: (text) => JSON.parse(text).map((o: Record<string, unknown>) => ({ ...o, id: o.slug })),
  }),
  schema: z.object({
    slug: z.string(),
    date: z.string(),
    tag: z.string(),
    title: z.string(),
    teaser: z.string(),
    image: z.string(),
    body: z.string(),
  }),
});

export const collections = { pages, news };
