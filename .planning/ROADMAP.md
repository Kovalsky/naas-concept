# Roadmap: NAAS Portal Program (new naas.gov.ua)

## Overview

The program moves in two independent lines that converge on one outcome: the old Bitrix site keeps running untouched while a new web presence grows next to it. First, the already-executed showcase deploy at `new.naas.gov.ua` is independently verified and its one remaining user-gated task (the Bitrix banner) is absorbed (Phase 1). In parallel lines, the old site is fully crawled and extracted into validated JSON (Phase 2) and an empty Next.js portal is stood up as a managed service on the Mirohost eVPS (Phase 3). With both in hand, the portal serves every legacy URL 1:1, passes the parity verifier, goes live on a noindex staging subdomain, and the domain-swap runbook is written (Phase 4). Finally, the content moves into MySQL behind Directus with a content-store API driver and webhook revalidation, making the future domain swap possible (Phase 5). Executing the swap itself is out of v1.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Showcase Verification & Absorption** - Independently verify the live `new.naas.gov.ua` showcase and complete/verify the user-gated Bitrix banner change
- [ ] **Phase 2: Legacy Content Census** - Crawl, classify, and extract ALL public old-site content into validated JSON (cp1251→UTF-8)
- [ ] **Phase 3: Portal Skeleton on eVPS** - Next.js scaffold in `portal/` running as a systemd service behind nginx on a dedicated subdomain
- [ ] **Phase 4: 1:1 Legacy Serving, Parity & Staging** - Portal serves every migrated URL at the exact old URL, parity verifier passes, noindex staging live, swap runbook written
- [ ] **Phase 5: Content Backend (Directus on MySQL)** - Custom MySQL schema from the census, Directus, JSON→MySQL load, content-store API driver, webhook revalidation

## Phase Details

### Phase 1: Showcase Verification & Absorption
**Goal**: The approved Modern showcase is verifiably live at `new.naas.gov.ua`, safely re-deployable, and the old site points to it — without harming the old site
**Depends on**: Nothing (first phase)
**Requirements**: SHOW-01, SHOW-02, SHOW-03, SHOW-04
**Success Criteria** (what must be TRUE):
  1. `curl http://new.naas.gov.ua/` returns 200 with the correct homepage title; sampled public-information section pages return 200; a large scanned PDF (20–25 MB) downloads fully
  2. `robots.txt` on the subdomain disallows all indexing (test mode); a request to a non-existent URL yields the site's own 404 page or a documented server 404 fallback
  3. The old-site homepage banner links to `new.naas.gov.ua`, zero references to dead `naas.com.ua` remain, and the old site still serves 200 with its sections opening as before (banner change is user-gated — completed with the user, then verified)
  4. A re-run of `scripts/deploy-modern-mirohost.sh` (audit deploy-gate, `NAAS_NEW_SITE_DEST` in `~/.naas_hosting.env`) is documented and reproducible
**Plans**: TBD
**Plan source**: Wraps `docs/superpowers/plans/2026-07-02-modern-static-mirohost.md` — ALREADY EXECUTED by a parallel session (tasks 1–5+7 done). This phase VERIFIES and ABSORBS (task 6 banner + independent checks); it does NOT re-execute the deploy.

### Phase 2: Legacy Content Census
**Goal**: Every public page of the old `naas.gov.ua` is mirrored, classified, and extracted into validated UTF-8 JSON content files — the raw material for both legacy serving (Phase 4) and the MySQL schema (Phase 5)
**Depends on**: Nothing (technically independent; runs in parallel with Phases 1 and 3)
**Requirements**: MIGR-01, MIGR-02, MIGR-03
**Success Criteria** (what must be TRUE):
  1. A polite BFS crawl completes with `inventory.jsonl` + a raw mirror covering ALL public pages, with cp1251 text correctly converted to readable UTF-8
  2. `url-map.json` classifies 100% of inventoried URLs — no URL is left unclassified, yielding the content-type census that Phase 5 schema design consumes
  3. The content extractor produces JSON files in `out/content/` that validate against real fixtures for every content type
**Plans**: TBD
**Plan source**: Wraps `docs/superpowers/plans/2026-07-02-legacy-migration-portal.md` Tasks 1–6 (branch `feat/legacy-migration-portal`, worktree `naas_migration_wt`). Plan is trusted and session-owned — GSD wraps, never edits.

### Phase 3: Portal Skeleton on eVPS
**Goal**: An empty Next.js portal runs as a managed service on the Mirohost eVPS, reachable on its own subdomain, redeployable via a gated script
**Depends on**: Nothing (technically independent of Phases 1–2)
**Requirements**: PORT-01, PORT-02, PORT-03
**Success Criteria** (what must be TRUE):
  1. `portal/` (Next.js App Router, `output: 'standalone'`, `trailingSlash: true`, robots off by default) builds and runs on Node 20.20.2
  2. The portal answers 200 on its dedicated subdomain through the nginx reverse proxy; the systemd unit (created by Mirohost support) is `active (running)` and the service comes back after a restart
  3. A redeploy via the rsync+SSH script — with the mandatory user SSH-gate honored — completes and the site still answers 200
**Plans**: TBD
**Plan source**: No superpowers plan exists — GSD plan-phase authors it from `docs/architecture/portal-architecture.md` + `docs/infrastructure/mirohost-server.md`. Open question to resolve during planning: exact subdomain (proposal: `portal.naas.gov.ua`).
**UI hint**: yes

### Phase 4: 1:1 Legacy Serving, Parity & Staging
**Goal**: The portal serves every migrated legacy URL at the EXACT old URL with full server-rendered HTML, passes the parity verifier 1:1 against the old site, is live on a noindex staging subdomain, and the domain-swap runbook exists
**Depends on**: Phase 2 (extracted content), Phase 3 (running portal)
**Requirements**: MIGR-04, MIGR-05, MIGR-06, MIGR-07, MIGR-08, MIGR-09
**Success Criteria** (what must be TRUE):
  1. Every URL in `url-map.json` returns full server-rendered HTML at the exact old path — including `?ELEMENT_ID=` query-string URLs via rewrites, each with a canonical
  2. News feeds and `PAGEN_1` pagination pages render with the same items as the old site
  3. `sitemap.xml` covers all migrated URLs and JSON-LD is present on migrated pages
  4. The parity verifier passes a full local run: URLs, titles, and content match the old site 1:1
  5. The portal is live on a non-indexed `naas.gov.ua` staging subdomain (noindex until the swap), and the domain-swap runbook document exists (preconditions, ~15-minute switch window, rollback) — written, NOT executed
**Plans**: TBD
**Plan source**: Wraps `docs/superpowers/plans/2026-07-02-legacy-migration-portal.md` Tasks 7–14. Open question to resolve before Task 7: portal ports the **Modern** design (stakeholder-approved 2026-07-02), not `site/` as the pre-approval architecture doc says — confirm with the user.
**UI hint**: yes

### Phase 5: Content Backend (Directus on MySQL)
**Goal**: Legacy content lives in a custom MySQL schema behind Directus; the portal reads it through the same content-store interface as the JSON files; publishing an edit revalidates exactly the changed page — the last v1 precondition of the (out-of-scope) domain swap
**Depends on**: Phase 2 (content census feeds the schema), Phase 4 (content-store interface + rendered pages to revalidate)
**Requirements**: BACK-01, BACK-02, BACK-03, BACK-04, BACK-05
**Success Criteria** (what must be TRUE):
  1. A custom MySQL schema exists, designed from the real Phase 2 content census, including an organization/institution entity for future sub-portals
  2. Directus runs on top of that schema (local port) with collections, roles/RBAC, media, and i18n configured
  3. The JSON→MySQL load script imports ALL extracted legacy content — imported record counts match the extraction output
  4. The portal reads from the Directus API through the same `content-store` interface as the JSON files (switching the driver leaves rendered pages identical), and the API contract is documented
  5. Editing a record in Directus fires a webhook that revalidates exactly the changed page — the edit is visible there, other pages are untouched
**Plans**: TBD
**Plan source**: No superpowers plan exists — GSD plan-phase authors it from `docs/architecture/portal-architecture.md` + the legacy-migration plan's interfaces + the Phase 2 census. Directus is a precondition of the domain swap, not of the migration (decision 2026-07-02).

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5. Phases 1–3 are mutually independent (Track 1 verification, Track 3 census, Track 2A skeleton); Phase 4 needs 2+3; Phase 5 needs 2+4.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Showcase Verification & Absorption | 0/TBD | Not started | - |
| 2. Legacy Content Census | 0/TBD | Not started | - |
| 3. Portal Skeleton on eVPS | 0/TBD | Not started | - |
| 4. 1:1 Legacy Serving, Parity & Staging | 0/TBD | Not started | - |
| 5. Content Backend (Directus on MySQL) | 0/TBD | Not started | - |
