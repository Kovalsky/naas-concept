# NAAS Portal Program (new naas.gov.ua)

## What This Is

A program to replace the old 1C-Bitrix site of the National Academy of Agrarian Sciences of Ukraine (naas.gov.ua) with a new web presence, in two lines of work: (a) a static **showcase** of the stakeholder-approved Modern design on `new.naas.gov.ua` (Mirohost, static FTP deploy), and (b) a full **portal** — Next.js frontend + Directus/MySQL backend on the Mirohost eVPS — that serves ALL legacy content 1:1 at the exact old URLs, ready for a zero-redirect domain swap.

GSD orchestrates four pre-existing tracks defined in `docs/superpowers/ROADMAP.md`. The detailed superpowers implementation plans are the **source of truth for execution steps** (user-stated trust ~99%; spot-check, don't re-derive). Plans are owned by their own sessions — **editing another session's plan documents is forbidden**; cross-track decisions go through the ROADMAP or the user.

## Core Value

The old site keeps running untouched until the new portal serves all of its public content at the same URLs — SEO weight survives the eventual domain swap 1:1 (zero redirects for migrated pages).

## Requirements

### Validated

- ✓ `site-modern/` (Astro 5, 43 routes) builds statically; preview live at naas-portal-modern.pages.dev — existing
- ✓ **Modern design approved by stakeholders (2026-07-02); the alternative designs (Light, Gravitas) were rejected** — existing
- ✓ Design-audit fixes (Track 0) executed and committed to `main` (audit items 1–22, commits `aba901e`…`e40d10e`) — existing
- ✓ Shared content layer `content/` at repo root, consumed by the Astro sites — existing
- ✓ Portal architecture decided: decoupled headless — permanent Next.js frontend + Directus on a custom MySQL schema now, Elixir Phoenix later (`docs/architecture/portal-architecture.md`) — existing
- ✓ Mirohost eVPS capabilities verified empirically: Node 20.20.2, MySQL, no root, systemd via support, nginx proxy via panel (`docs/infrastructure/mirohost-server.md`) — existing

### Active

- [ ] **Track 1 — Showcase live:** `site-modern` static build deployed to `new.naas.gov.ua` (Mirohost FTP) + old-site Bitrix banner repointed from dead `naas.com.ua` to the subdomain. **EXECUTING RIGHT NOW by a parallel session** per `docs/superpowers/plans/2026-07-02-modern-static-mirohost.md` — GSD observes and verifies afterwards; it must NOT execute or interrupt this track.
- [ ] **Track 2A — Portal skeleton:** Next.js (App Router, standalone) scaffold in `portal/`, deployed to the eVPS (systemd via Mirohost support, nginx proxy, dedicated subdomain).
- [ ] **Track 2B — Content backend:** custom MySQL schema designed from the real content census, Directus on top of it, JSON→MySQL load script, API driver for the portal `content-store`.
- [ ] **Track 3 — 1:1 legacy migration:** crawl/extract the old site (cp1251→UTF-8), serve exact old URLs (incl. `?ELEMENT_ID=` query URLs), sitemap.xml + JSON-LD, parity verifier, deploy to a non-indexed staging subdomain, domain-swap runbook (document only). Plan: `docs/superpowers/plans/2026-07-02-legacy-migration-portal.md` (branch `feat/legacy-migration-portal`, worktree `naas_migration_wt`).

### Out of Scope

- **Executing the domain swap** — the runbook is a deliverable; the actual switch of `naas.gov.ua` is a separate, user-gated decision that requires Track 2B done and parity re-passed in API mode.
- **Further Light/Gravitas design work** — stakeholders approved Modern (2026-07-02) and rejected the alternatives; existing deploys stay as-is but get no new work.
- **Rewriting the superpowers plans into different approaches** — plans are trusted and session-owned; GSD phases wrap them, they don't replace them.
- **Cloudflare or any foreign CDN/hosting for `*.naas.gov.ua`** — Ukrainian law requires gov.ua sites hosted in Ukraine (SBU-cleared exceptions only); `*.pages.dev` previews are fine because they are not gov.ua domains.
- **Touching the old Bitrix site** beyond the single banner-href change in Track 1 — the old site must keep running in parallel; hosting/admin access is read-only discipline.

## Context

- **Track map:** `docs/superpowers/ROADMAP.md` is the single source of truth for track sequencing. Dependencies: Track 1 depends on Track 0 (done); Track 2B depends on Track 3 Tasks 1–6 (the content census feeds the schema); Track 3 content serving (Tasks 7+) depends on Track 2A; the domain swap depends on Track 2B.
- **Concurrency (live constraint):** a parallel session is executing Track 1 right now in this same checkout (`main`). This session must not touch `site-modern/`, `scripts/`, `content/`, or any of that plan's files while it runs, and must re-check `git status`/`git branch` before every commit. Uncommitted working-tree changes (`content/data/registries.json`, `site-modern/scripts/check-design.mjs`, `site-modern/src/pages/novyny/index.astro`, `curate_doc_titles_r2.py`) belong to other sessions — never stage them.
- **Repo layout:** three Astro prototypes (`site/`, `site-light/`, `site-modern/`) + shared `content/`; worktrees: `naas_migration_wt` (feat/legacy-migration-portal, Track 3), `naas_shared_wt` (feat/shared-content-layer), `naas_light_wt`. Future packages per plans: `migration/` and `portal/`.
- **Old site facts:** `http://naas.gov.ua` — Bitrix, HTTP-only (HTTPS broken/self-signed), windows-1251, hosted on the same Mirohost package; admin via user's own Chrome session (claude-in-chrome, in-page fetch, HttpOnly cookies, read-only).
- **Key source docs:** `docs/architecture/portal-architecture.md` (target architecture), `docs/infrastructure/mirohost-server.md` + `runtime-install-reference.md` (server facts), `docs/design-review-site-modern-2026-07-01.md` (audit), `docs/NAAS_TZ_v9 (lite).docx` (requirements spec authority), `docs/source-of-truth-naas.md` (stakeholder-corrected facts).

## Constraints

- **Legal**: gov.ua domains must be hosted in Ukraine — Mirohost only for `*.naas.gov.ua`; no foreign CDN — law, non-negotiable.
- **Access discipline**: ask the user before EVERY SSH/FTP connection to Mirohost; Bitrix admin and hosting are read-only (single sanctioned mutation: the Track 1 banner href, behind an explicit user gate) — production .gov.ua safety.
- **Server**: Mirohost eVPS-8, 2 vCPU / 4 GB, no root, no compiler, Node 20.20.2 ceiling, MySQL only (no Postgres/Redis), crontab blocked → systemd units via Mirohost support, nginx proxy via panel.
- **Budget**: fixed — hosting already paid; the old site runs in parallel until the swap.
- **Process**: every commit pushed to `origin` `main` (github.com:Kovalsky/naas-concept) — but respect parallel-session interleaving; never stage other sessions' files; all documentation in English, chat in Ukrainian.
- **Doc ownership**: superpowers plans/specs belong to their owning sessions — GSD reads them, never edits them.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Decoupled headless: permanent Next.js front + Directus-on-custom-MySQL now, Phoenix later | Fast phase-1 launch; backend swap invisible behind a stable API contract; Directus doesn't own the schema (unlike Strapi) | — Pending |
| JSON content files now, database later, isolated behind a `content-store` interface | Longest work (crawl+extraction) doesn't depend on schema/CMS; runs parallel to Track 2 | — Pending |
| Modern is THE approved design (2026-07-02); Light/Gravitas rejected | Stakeholder decision | ✓ Good |
| Directus is a precondition of the domain swap, not of the migration | Unblocks Track 3 early tasks | — Pending |
| GSD wraps existing superpowers plans as phases; plans trusted ~99%, not re-verified line-by-line | User decision 2026-07-02; plans are high quality and session-owned | — Pending |
| Tracks 0/1 executed by a parallel session, not by GSD | Track 1 execution in flight at GSD init time; interrupting would risk the live deploy | — Pending |
| Skip GSD project-level research stage | Stack, features, and pitfalls already fixed in architecture/infrastructure specs and audited plans | — Pending |

## Open Questions

- Which design source the portal (Track 3 Task 7+) ports: the architecture doc (written 2026-07-01, pre-approval) says "port the design from `site/`", but stakeholders approved **Modern** on 2026-07-02 — presumably the portal should port `site-modern`'s design. Confirm before Track 3 Task 7.
- Exact portal subdomain for Track 2A (proposal: `portal.naas.gov.ua`).
- Track 2A/2B have no detailed superpowers plans yet — GSD planning will have to produce them (from `portal-architecture.md` + the legacy-migration plan's interfaces), unlike Tracks 1/3 which wrap existing plans.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-02 after initialization*
