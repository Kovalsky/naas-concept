# NAAS — top-level track map of the project

Single source of truth for the sequencing of the "new naas.gov.ua portal" tracks. Each track has its own plan owned by its own session; **editing another session's plans is forbidden** (document-ownership rule, 2026-07-02) — cross-track decisions are recorded here. An executing session reads this file before executing its plan.

Created 2026-07-02 as onboarding input for the GSD (Get Shit Done) framework, which the user is installing on top of Superpowers.

## Tracks table

| Track | Name | Plan / document | Status (2026-07-02) | Depends on |
|---|---|---|---|---|
| **0** | Design fixes for the showcase (`site-modern`) per the audit `docs/design-review-site-modern-2026-07-01.md` | being written by a parallel session; file not yet present in `docs/superpowers/plans/` | plan in progress | — |
| **1** | Deploy the showcase "site as is, with fixes" to `new.naas.gov.ua` (Mirohost, static, FTP) + repoint the banner in Bitrix | `docs/superpowers/plans/2026-07-02-modern-static-mirohost.md` | plan ready, execution not started | Track 0 (deploy with design fixes included — user decision) |
| **2A** | New-architecture setup, phase A: Next.js portal skeleton (`portal/`) + deploy of the empty scaffold to the eVPS (systemd via Mirohost support, nginx proxy, subdomain; proposal: `portal.naas.gov.ua`) | no plan yet; a self-contained prompt for a fresh session is with the user (chat, 2026-07-02) | not started | — (technically independent of Tracks 0/1) |
| **2B** | New-architecture setup, phase B: MySQL schema (designed from the real content census), Directus on top of it, JSON→MySQL load script, API driver for the portal content-store | no plan yet | not started | the inventory phase of Track 3 (Tasks 1–6: crawl → inventory → content-type report) — it provides the material for the schema |
| **3** | 1:1 SEO migration of the old `naas.gov.ua` content onto the portal: crawl/extraction, exact old URLs, sitemap/JSON-LD, verify-parity, noindex staging, domain-swap runbook | `docs/superpowers/plans/2026-07-02-legacy-migration-portal.md` (branch `feat/legacy-migration-portal`, worktree `naas_migration_wt`) | plan ready, execution not started | Tasks 1–6 — nothing; content serving (Tasks 7+) — Track 2A; **domain swap — only after Track 2B** (before switching `naas.gov.ua`, publishing via Directus must work, content must be loaded into MySQL, and verify-parity must pass again in API mode) |

## Notes

- Tracks 0/1 (showcase) and Tracks 2/3 (portal) are technically independent lines of work: different subdomains, different processes; the showcase does not block the architecture.
- Directus is a precondition of the **domain swap**, not of the migration (decision 2026-07-02): the longest part of the migration (crawl+extraction) does not depend on the schema/CMS and runs in parallel with Track 2.
- Execution of Track 2/3 plans: fresh session + superpowers:subagent-driven-development.
- All project documentation is written in English (user rule, 2026-07-02); chat language remains Ukrainian.
