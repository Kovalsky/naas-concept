---
title: Bootstrap the standalone naas-portal project
date: 2026-07-05
priority: high
---

# Bootstrap ~/dev/naas-portal as a standalone project

Decision & rationale: `.planning/notes/portal-extraction-decision.md`

## Checklist
- [x] Create `~/dev/naas-portal/`: `git init`, `README.md`, `.gitignore`, `docs/plans/` (carried
      migration plan, verbatim), `docs/PROJECT-BRIEF.md`, initial commit. *(done by Claude, 2026-07-05)*
- [x] Create private GitHub remote `Kovalsky/naas-portal` and push. *(done by Claude, 2026-07-05)*
- [ ] **Needs a new session:** open Claude in `~/dev/naas-portal/` and run `/gsd:new-project`
      (feed `docs/PROJECT-BRIEF.md`). GSD is cwd-anchored, so it must run from that directory.
      Proposed roadmap shape: census → portal + local parity → skeleton smoke-deploy → Directus/MySQL.
- [ ] **After the new roadmap exists:** in THIS repo, remove Phases 2–5 from `.planning/ROADMAP.md`
      via `/gsd:remove-phase` so it keeps only Phase 1 (showcase, done).
- [ ] **After carry-over:** retire `feat/legacy-migration-portal` branch + `naas_migration_wt`
      worktree (`git worktree remove`), and delete the remote branch if desired.

## Notes
- Portal shares no code with this repo (Next.js vs Astro; crawled JSON vs `@content`; eVPS vs FTP).
- Do not edit the carried migration plan — it is owned by another session.
