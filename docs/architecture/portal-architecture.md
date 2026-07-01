# NAAS Portal — architecture of the new backend/frontend

**Status:** agreed (decision made 2026-07-01), ready to begin implementation.
**Audience:** the developer who will begin implementation in the next session.
**Related documents:** [`../infrastructure/mirohost-server.md`](../infrastructure/mirohost-server.md) (server capabilities), [`../infrastructure/runtime-install-reference.md`](../infrastructure/runtime-install-reference.md) (runtime installation).

---

## 1. Purpose and scope

The new `naas.gov.ua` portal replaces the old CMS (1C-Bitrix). The current Astro builds (`site/`, `site-modern/`, …) are **design prototypes**, not the final system. This document describes the target architecture of the full-fledged portal: a React frontend + a custom backend + MySQL, with quality SEO and a convenient custom admin panel for content managers.

**Key requirements (from the client/developer):**
- Quality SEO (a site with a large number of documents/publications, all of which must be indexed).
- A convenient **custom** admin panel for content managers (pain point with the old Bitrix: unclear what will appear on the site after editing).
- Sections are added according to the TZ (requirements spec), and we design the admin panel for them ourselves.
- In the future — a knowledge base, article uploads, sub-portals for the academy's departments/institutions (each one publishing its own content).
- Budget is fixed (hosting already paid for), the old site must keep running in parallel.

## 2. Key decision: decoupled (headless), in two phases

**Architecture — a decoupled frontend and backend (headless):**
- **Frontend — permanently on Next.js (React).** It owns rendering, SEO, and caching.
- **Backend — API + admin panel only**, behind a stable API contract. Initially a ready-made headless CMS, later a custom Phoenix.

**Phasing:**
- **Phase 1 (fast start):** backend = **Directus** (Node headless CMS) on top of **our own clean MySQL schema**. Provides an admin panel, API, authorization/roles, media, i18n, drafts/preview, webhooks — "out of the box".
- **Phase 2 (once more complex tasks arise):** backend → **Elixir Phoenix** (custom API + custom LiveView admin panel), on **the same MySQL schema**. Directus is retired, the frontend doesn't change.

**Why this way:** the backend of a content site is thin (CRUD + serving content), so in phase 1 a ready-made CMS provides almost this entire layer for free → a fast launch. Phase 2 on Phoenix gives full control over the admin panel and a niche stack (a deliberate choice by the developer). Decoupling the frontend/backend makes replacing the backend invisible to the frontend.

## 3. Stack (summary)

| Layer | Phase 1 | Phase 2 | Notes |
|---|---|---|---|
| Frontend | **Next.js (React)** | same | SSR + ISR, SEO, cache; permanent |
| Backend/admin | **Directus** (Node) | **Elixir Phoenix** | behind a stable API contract |
| Admin panel | Directus UI (+ preview) | custom **LiveView** (starting from Backpex) | |
| DB | **MySQL** (custom schema) | the same MySQL schema | Postgres unavailable without root |
| Cache | Next.js **ISR** (file-based) | same | **Redis not needed** (single server) |
| Render | SSR + on-demand + static | same | see section 6 |

## 4. Frontend (Next.js)

- **React, stays forever** (even after the backend moves to Phoenix). The design is carried over from the existing Astro prototypes (HTML/CSS are ported; Astro components → React manually).
- **Rendering:** SSR + **ISR** (Incremental Static Regeneration). Stable pages (homepage, about the academy, sections) — static/ISR; the "long tail" of documents — render on request + cache. Everything serves full HTML → full-fledged SEO.
- **Cache:** ISR by default caches on the **file system**; for a single server this is sufficient, **Redis is not needed** (it would only be needed with multiple instances). [verified: Next.js docs]
- **Bilingual support:** UA/EN (as in the prototypes).
- **Data feed:** via the backend API (Directus now, Phoenix later).

> Rejected alternative: staying on Astro (it can also do SSR+cache and would reuse the existing design). Next.js was chosen deliberately — so the frontend would permanently be in React.

## 5. Backend

### Phase 1 — Directus (headless CMS, Node)
- **Database-first:** we design our own clean MySQL schema, and Directus "wraps" it with an admin panel. [verified: Directus supports MySQL natively]
- Provides **out of the box:** REST + GraphQL API, authorization + roles/permissions (RBAC — critical for institution sub-portals), media/file uploads, field types and relations, **draft/publish + preview** (cures the Bitrix pain point), i18n, **webhooks** (regeneration trigger).
- Runs as a Node process on a local port.

> **Not Strapi.** Strapi owns the DB schema itself → migrating to Phoenix would be painful. Directus doesn't touch our schema → Phoenix can later simply pick it up. This is critical for phase 2.

### Phase 2 — Elixir Phoenix (future)
- A custom **API** + **custom admin panel on LiveView** (starting from the **Backpex** library — CRUD scaffolding, then customization for editors).
- Runs on **the same MySQL schema** via Ecto.
- Reasons: full control over the admin UX + a niche stack (developer job security). Real-time (LiveView) — a bonus, not critical.

## 6. Rendering and caching (important for "many documents + SEO")

**Not a "full static rebuild"** (doesn't scale to thousands of documents). Instead:
- **SSR + cache + invalidation on content change** (essentially ISR): a page is rendered once, then served from cache; when content changes, only that page is regenerated.
- Stable pages — static/ISR; document pages — on-demand + cache → a new document goes live immediately, without rebuilding the entire site.

**Invalidation:** when content is saved, the CMS fires a **webhook** → Next.js performs on-demand revalidation of exactly the changed page.

**Why caching is mandatory:** the server is 2 vCPU / 4 GB. Bare SSR under crawlers (Google crawling through thousands of documents) might not be able to handle rendering on every hit. Caching removes this problem. We put the cache in the application (ISR), because full control over nginx is not guaranteed.

## 7. API contract (the linchpin of the architecture)

**The most important thing for a painless phase 2:** lock in a stable API contract between the frontend and backend from day one. Then the Directus → Phoenix swap is transparent to the frontend (it doesn't know who's responding). If Directus's data shape doesn't suit us directly — lay down a thin adapter/BFF.

## 8. Deployment topology (Mirohost eVPS-8 server)

Server details and constraints: [`../infrastructure/mirohost-server.md`](../infrastructure/mirohost-server.md).

- **Processes (Node), each on its own internal port:**
  - Next.js (frontend rendering)
  - Directus (CMS/API/admin panel)
- **Persistence/autostart:** systemd services **are created by Mirohost** (we provide the start command, working directory, user, port, env); we are given access to start/restart/status. (crontab for our user is blocked, so `@reboot` is not an option.)
- **Public access:** nginx reverse proxy to the internal ports — **we configure this ourselves** in the Mirohost control panel.
- **DB:** MySQL (already present on the server).
- **Cache:** file-based (ISR) in the application. Redis is not needed and is not offered in the panel.
- **The old site (Bitrix) lives on this same server — do not touch it.** HOME = `/var/www/naasZ4` is shared with the old site.

## 9. Institution sub-portals (future)

Directus's RBAC/multi-tenancy (and later, roles in Phoenix) lets each institution/department have its own access and publish its own content. Build an "organization/institution" entity into the schema, along with the binding of content and users to it, in advance.

## 10. Roadmap

- **Phase 0 — DB schema.** Design a clean, normalized MySQL schema for the sections from the TZ (news, documents/publications, institutions/departments, pages, persons, events, media). This is a long-lived asset — don't outsource it to the CMS.
- **Phase 1 — launch (target ~weeks):**
  1. Stand up Directus on this schema (Node, local port), configure collections, roles, media, i18n.
  2. Lock in the API contract.
  3. Next.js frontend consuming the API: SSR/ISR, porting the design from Astro, SEO, UA/EN.
  4. Directus webhook → revalidate in Next.js.
  5. Coordinate with Mirohost on systemd services for both processes; configure the nginx proxy in the panel.
  6. Roll out (subdomain), without touching the old site.
- **Phase 2 — Phoenix (once more complex tasks arise):** Phoenix + Ecto on the same schema; a custom LiveView admin panel (from Backpex); retire Directus. Request the Erlang/Elixir runtime from Mirohost in advance (see install-reference).

## 11. First steps for the next session

1. Gather/clarify the TZ for the site's sections → build the **MySQL schema** (Phase 0).
2. Prototype Directus locally on this schema; verify roles and preview.
3. Document the **API contract** (endpoints/fields consumed by the frontend).
4. Initialize the Next.js project, port the design from `site/` (Astro), configure ISR + i18n.
5. Implement the revalidation webhook.
6. Prepare the data for the systemd services and send it to Mirohost; configure the proxy.

## 12. Open questions

- Exact content model/schema — depends on the TZ for the sections.
- The subdomain for the new portal (which one exactly) and the coexistence strategy with the old site.
- Whether to leave some marketing pages on Astro static (possible savings on porting) — by default, everything goes on Next.js.
- Details of sub-portal multi-tenancy (Phase 2+).
