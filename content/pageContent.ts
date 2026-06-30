// Per-route page content (canonical = Gravitas). Both site versions read meta + hero
// from here so a single edit updates every design. Page bodies stay in ./pages/*.md;
// this holds the per-route chrome (meta title/description, hero kicker/title/lead/crumbs).
import data from './content.json';

export interface Crumb { label: string; href: string; }
export interface PageHero { kicker?: string; title?: string; lead?: string; crumbs?: Crumb[]; }
export interface PageMeta { title: string; description?: string; }
export interface PageEntry { meta: PageMeta; hero?: PageHero; }

const pages = data as Record<string, PageEntry>;

/** Canonical content for a route. Throws if missing, so a rewired page can't silently lose content. */
export function page(route: string): PageEntry {
  const entry = pages[route];
  if (!entry) throw new Error(`[@content] no page content for route "${route}"`);
  return entry;
}
