export type HeroVariant = 'v1' | 'v3';
export const HERO: HeroVariant = (import.meta.env.HERO === 'v3' ? 'v3' : 'v1');
export const HERO_H1 = 'Національна академія аграрних наук України';
export const HERO_SLOGAN = 'Науково-методичний і координаційний центр з наукових проблем розвитку АПК України';

// GA4 measurement id. Empty = analytics disabled (no tag emitted). Set to e.g. 'G-XXXXXXX' to enable.
export const GA_ID: string = '';

// Cloudflare Turnstile site key. Default = Cloudflare test key (always passes, visible widget).
// Replace with the real site key from the Cloudflare dashboard for production.
export const TURNSTILE_SITEKEY: string = '1x00000000000000000000AA';
