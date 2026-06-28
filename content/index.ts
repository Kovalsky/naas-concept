// @content — the single neutral content source for every NAAS site version (gravitas, light, …).
//
// Bulk content is stored as plain data so it can move to a CMS/DB unchanged:
//   ./data/*.json   structured rows (persons, institutes, news, registries, …)
//   ./pages/*.md    long-form page bodies
// Shared structure/strings are thin modules: ./i18n, ./site, ./registries.
// ./schema.ts is the data contract (zod) — the future CMS content model.
//
// Sites consume this layer through the `@content/*` alias and never reach into each
// other. To change the backing store later (files → CMS API), reimplement these
// modules only; consuming sites stay untouched.
export * from './i18n';
export * from './site';
export * from './registries';
