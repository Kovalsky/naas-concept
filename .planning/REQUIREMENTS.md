# Requirements: NAAS Portal Program (new naas.gov.ua)

**Defined:** 2026-07-02
**Core Value:** The old site keeps running untouched until the new portal serves all of its public content at the same URLs — SEO weight survives the eventual domain swap 1:1.

Requirements are derived from the pre-existing superpowers plans and `docs/superpowers/ROADMAP.md` (categories = tracks). The plans are the source of truth for execution detail; these REQ-IDs are the outcome-level contract GSD verifies against.

## v1 Requirements

### Showcase (Track 1)

> Executed by a parallel session per `docs/superpowers/plans/2026-07-02-modern-static-mirohost.md`. As of 2026-07-02 the session reports tasks 1–5+7 done (site live at `http://new.naas.gov.ua`, HTTP-only) and task 6 (banner) left for the user — GSD's job here is independent verification + absorbing the residue, not execution.

- [ ] **SHOW-01**: The static site-modern build (0 orphan files, 0 broken internal links) is served at `new.naas.gov.ua` — homepage 200 with correct title, public-information section pages 200, large PDFs (20–25 MB) download
- [ ] **SHOW-02**: `robots.txt` disallows all indexing while the site is in test mode; 404 responses work (own 404 page, or a documented server 404 fallback)
- [ ] **SHOW-03**: The old-site homepage banner links to `new.naas.gov.ua`, zero references to `naas.com.ua` remain, and the old site is unharmed (200, sections open as before)
- [ ] **SHOW-04**: Redeploys are repeatable and documented: `scripts/deploy-modern-mirohost.sh` with the audit deploy-gate + `NAAS_NEW_SITE_DEST` in `~/.naas_hosting.env`

### Portal skeleton (Track 2A)

- [ ] **PORT-01**: `portal/` Next.js App Router scaffold (`output: 'standalone'`, `trailingSlash: true`, robots off by default) builds and runs on Node 20.20.2
- [ ] **PORT-02**: The portal runs on the Mirohost eVPS as a systemd service (unit created by Mirohost support) behind an nginx reverse proxy on a dedicated subdomain
- [ ] **PORT-03**: A deploy script (rsync+SSH) exists with a mandatory user SSH-gate; redeploys are repeatable

### Content backend (Track 2B)

- [ ] **BACK-01**: A custom MySQL schema is designed from the real content census (content types from the Track 3 inventory), including an organization/institution entity for future sub-portals
- [ ] **BACK-02**: Directus runs on top of that schema (local port) with collections, roles/RBAC, media, and i18n configured
- [ ] **BACK-03**: A JSON→MySQL load script imports all extracted legacy content
- [ ] **BACK-04**: A `content-store` API driver lets the portal read from the Directus API behind the same interface as the JSON files; the API contract is documented
- [ ] **BACK-05**: Publishing via Directus works end-to-end: an edit triggers a webhook → on-demand revalidation of exactly the changed page

### Legacy migration (Track 3)

> Wraps the 14-task plan `docs/superpowers/plans/2026-07-02-legacy-migration-portal.md` (branch `feat/legacy-migration-portal`, worktree `naas_migration_wt`).

- [ ] **MIGR-01**: A polite BFS crawler mirrors ALL public pages of the old site (cp1251→UTF-8) into `inventory.jsonl` + a raw mirror
- [ ] **MIGR-02**: URL classification (`url-map.json`) covers every inventoried URL
- [ ] **MIGR-03**: The content extractor produces JSON content files (`out/content/`) validated on real fixtures
- [ ] **MIGR-04**: The portal serves every migrated URL at the EXACT old URL (including `?ELEMENT_ID=` query-string URLs via rewrites + canonicals) with full server-rendered HTML
- [ ] **MIGR-05**: News feeds and `PAGEN_1` pagination are reproduced
- [ ] **MIGR-06**: `sitemap.xml` and JSON-LD exist on all migrated pages
- [ ] **MIGR-07**: The parity verifier passes on a full local run (URLs/titles/content 1:1 against the old site)
- [ ] **MIGR-08**: The portal is deployed to a non-indexed `naas.gov.ua` staging subdomain (noindex until the swap)
- [ ] **MIGR-09**: A domain-swap runbook document exists (preconditions, ~15-minute switch window, rollback) — written, NOT executed

## v2 Requirements

### Backend phase 2

- **PHX-01**: Elixir Phoenix backend on the same MySQL schema; custom LiveView admin (from Backpex); Directus retired
- **PHX-02**: Erlang/OTP + Elixir runtime installed by Mirohost support (per `docs/infrastructure/runtime-install-reference.md`)

### Expansion

- **EXP-01**: Institution sub-portals (multi-tenancy on the organization entity)
- **EXP-02**: Knowledge base / article uploads
- **EXP-03**: Remove `Disallow: /` from the showcase robots.txt when it stops being "test mode" (separate decision)
- **EXP-04**: Execute the domain swap per the runbook (user-gated, requires Track 2B + parity re-pass in API mode)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Executing the domain swap in v1 | Requires Track 2B done + parity re-passed in API mode; separate user decision |
| Further Light/Gravitas design work | Stakeholders approved Modern on 2026-07-02; alternatives rejected |
| Cloudflare / foreign CDN for `*.naas.gov.ua` | Ukrainian law: gov.ua sites must be hosted in Ukraine |
| Any old-Bitrix change beyond the Track 1 banner href | Old site is untouchable; read-only discipline on prod .gov.ua |
| Editing the superpowers plan documents | Session doc-ownership rule; plans are trusted source of truth |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated by roadmap) | | |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 0
- Unmapped: 21 ⚠️

---
*Requirements defined: 2026-07-02*
*Last updated: 2026-07-02 after initial definition*
