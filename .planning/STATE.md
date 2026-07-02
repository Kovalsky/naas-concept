# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-02)

**Core value:** The old site keeps running untouched until the new portal serves all of its public content at the same URLs — SEO weight survives the eventual domain swap 1:1 (zero redirects for migrated pages).
**Current focus:** Phase 1 — Showcase Verification & Absorption

## Current Position

Phase: 1 of 5 (Showcase Verification & Absorption)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-07-02 — Roadmap created (5 phases, 21/21 requirements mapped)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: GSD phases WRAP the existing superpowers plans (Tracks 1/3); plans are trusted ~99% and session-owned — never edited by GSD. Tracks 2A/2B get GSD-authored plans.
- [Init]: Track 1 was executed by a parallel session (tasks 1–5+7 done, site live at http://new.naas.gov.ua) — Phase 1 verifies + absorbs (banner task 6 is user-gated), it does NOT re-execute.
- [Init]: Directus (Phase 5) is a precondition of the domain swap, not of the migration — census (Phase 2) runs first and feeds the schema.
- [Init]: Executing the domain swap is OUT of v1 — the runbook (MIGR-09) is a document only.

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: SHOW-03 banner href change in Bitrix is user-gated — requires the user at the keyboard (read-only admin discipline otherwise).
- [Phase 3]: Exact portal subdomain not decided (proposal: `portal.naas.gov.ua`) — resolve during Phase 3 planning.
- [Phase 4]: Design source for the portal — architecture doc (pre-approval) says port `site/`, but stakeholders approved Modern on 2026-07-02 — confirm with the user before legacy-migration Task 7.
- [Global]: A parallel session works in this same checkout — re-check `git status`/`git branch` before every commit; never stage other sessions' files; ask the user before EVERY SSH/FTP connection to Mirohost.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-02
Stopped at: Roadmap + state initialized; Phase 1 not yet planned
Resume file: None
