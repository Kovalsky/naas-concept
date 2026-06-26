import type { ImageMetadata } from 'astro';

/**
 * Build-time optimised access to the shared NAAS image library.
 *
 * The photos physically live in the gravitas build (`site/public/img`, reached here via the
 * repo-level `site` symlink). Shared data (news.json / persons.json / anonsy.json) references
 * them as public-path strings like "/img/news/art8984.jpg". Importing them through this glob —
 * i.e. NOT through Astro's `public/` passthrough — lets `astro:assets` emit resized, modern-format
 * (webp) derivatives instead of shipping the multi-hundred-KB / multi-MB originals.
 *
 * Pages that still need a stable, servable URL (OG images, JSON-LD `image`) keep using the raw
 * "/img/..." string, which `public/img` continues to serve.
 */
// Scoped to the photo trees this build actually renders (news / anonsy / persons). Globbing all of
// `img/**` would eager-load hundreds of unrelated section graphics — including a malformed one that
// fails metadata extraction — and slow the build.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../../../site/public/img/{news,anonsy,persons}/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
  { eager: true },
);

const byPath = new Map<string, ImageMetadata>();
for (const [filePath, mod] of Object.entries(modules)) {
  const i = filePath.indexOf('/img/');
  if (i !== -1) byPath.set(filePath.slice(i), mod.default);
}

/** Resolve a shared "/img/..." data path to an optimisable ImageMetadata (undefined if absent). */
export function img(publicPath: string | undefined): ImageMetadata | undefined {
  return publicPath ? byPath.get(publicPath) : undefined;
}

// Build-local decorative photography (hero + division cards). These are NOT in the shared
// gravitas library — they live in src/assets/photos and are optimised by astro:assets.
// NOTE: current files are placeholder agrarian stock (Wikimedia Commons); production should
// swap in NAAS-owned / licensed photography, keeping the same basenames.
const photoModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
  { eager: true },
);
const photoByName = new Map<string, ImageMetadata>();
for (const [filePath, mod] of Object.entries(photoModules)) {
  const base = filePath.split('/').pop()!.replace(/\.[^.]+$/, '');
  photoByName.set(base, mod.default);
}

/** Resolve a build-local photo by basename, e.g. photo('hero') / photo('d1'). */
export function photo(name: string | undefined): ImageMetadata | undefined {
  return name ? photoByName.get(name) : undefined;
}
