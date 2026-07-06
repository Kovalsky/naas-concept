# Design status — Modern is canonical; all other variants are DEPRECATED

**Decided 2026-07-06 (stakeholder).** The **Modern** design (`site-modern/`) is the chosen,
production design — deployed live to **https://new.naas.gov.ua** (HTTPS is now valid). It is the
**only** maintained/deployable design.

## DEPRECATED — do NOT update or deploy; kept only as archive, pending removal

| Variant | Location | Was |
|---|---|---|
| Gravitas | `site/` | original Astro design |
| Light / Lite | `site-light/` | lighter variant |
| Navy | `site-navy/` | navy variant |
| Lucidity (design system) | `design-system-lucidity/` | editorial/scientific design system |
| Lucidity (app) | `site-lucidity/` (in worktree `naas_shared_wt`) | Astro app on the shared content layer |

These are **not** to be updated, rebuilt, or deployed. The stakeholder is undecided between
deleting them and keeping them as an archive — for now they stay. Any real content/design change
goes into **`site-modern/` only**.

## Shared content note
`content/` is read by several variants via `@content`. A content edit changes the *source* of all
of them, but only `site-modern/` is built + deployed (to new.naas.gov.ua); the deprecated variants
are never rebuilt, so the change reaches production only through Modern.
