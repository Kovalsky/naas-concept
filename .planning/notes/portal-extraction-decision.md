---
title: Portal extraction — split the Node 1:1 portal into its own standalone project
date: 2026-07-05
context: /gsd:explore session on roadmap dissatisfaction
---

# Decision: extract the Node portal into a standalone project

## Summary
The Node.js 1:1 SEO portal (legacy-content serving + eventual Directus/MySQL backend) is
extracted from this repo (`naas_github_pages`) into its own standalone project at
`~/dev/naas-portal/` — its own git repository, its own GitHub remote, and its own GSD
`.planning/` roadmap. This repo remains the **Modern showcase + design archive**.

## Why the split is clean (verified)
The portal work shares ZERO code with this repo's showcase/designs:
- **Framework:** Next.js (portal) vs Astro (all `site*/`).
- **Content source:** crawled legacy JSON (`migration/out/content/*.json`) vs the TS `content/`
  layer (`@content`) that only the Astro sites consume.
- **Host/subdomain:** `portal.naas.gov.ua` on the eVPS vs `new.naas.gov.ua` static showcase (FTP).

So the ~3.3 GB of `site/` + `site-modern/` + design variants + scratch extract dirs do not travel.

## Target structure
```
~/dev/naas-portal/            standalone repo (own git + GitHub remote + .planning)
  ├─ migration/               crawl old site → decode cp1251 → classify → extract → out/content/*.json
  ├─ portal/                  Next.js standalone app (reads content via a content-store interface)
  └─ .planning/               own GSD roadmap
```
`migration/` and `portal/` are SIBLINGS (portal reads `../migration/out/`).

## Phasing decision (JSON scaffold → Directus)
- Build the portal against JSON first; prove 1:1 parity LOCALLY (fast loop, no DB).
- The JSON stage is NOT throwaway: the portal reads content through a **content-store interface**;
  the final phase swaps the implementation to MySQL/Directus behind the SAME interface — portal
  code (routing, SSR, SEO, sitemap, parity) is not rewritten.
- One cheap **empty-skeleton smoke deploy** to the eVPS de-risks systemd/nginx/subdomain
  (support-gated) independently of Directus.
- The FIRST content deploy to the server is the **Directus-backed** one — the stated end state.
- Production/indexed go-live (domain swap) stays OUT of v1 scope until Directus + swap runbook exist.

## Constraints carried over
- gov.ua must be hosted in Ukraine → Mirohost only, no foreign CDN.
- eVPS: 2 vCPU / 4 GB, no root, Node 20.20.2 ceiling, MySQL only, systemd units via Mirohost support.
- The old site keeps running untouched; SEO weight survives the eventual 1:1 domain swap.

## Execution source of truth
`docs/plans/2026-07-02-legacy-migration-portal.md` (13-task plan) is copied **verbatim** into the
new repo (owned by another session — not edited). `/gsd:new-project` in the new repo derives the roadmap.

## Fate of the old scaffolding (this repo)
- `feat/legacy-migration-portal` branch + `naas_migration_wt` worktree become vestigial once the
  plan is carried over — retire them.
- This repo's GSD roadmap Phases 2–5 move to the new project; this repo keeps Phase 1 (showcase, done).
- git history of the portal branch is NOT preserved (clean start).
