# Preventing partial fact-updates (NAAS — two parallel sites)

This is the process + the automated gate that stops a fact (founding year, descriptor, institution count, contacts, reports link…) from being updated in *some* places but not others — the failure that shipped «50 наукових установ» on the homepage while the prose said 176/84.

## Why partial updates happen here
1. **Two parallel codebases:** `site/` (gravitas) and `site-light/` (light). They **share data** (`@shared` → gravitas `site/src/data/*.json`, `i18n.ts`, `site.ts`) but have **separate pages/components**.
2. **One fact, many representations:** shared JSON · values *derived* at build time (e.g. `instituteCount = Σ ustanovy.length`) · hardcoded JSX/prose · `<meta>` · `alt`/`aria-label` · inline SVG `<text>` · i18n strings · footer/nav config.
3. **Light re-exports the shared config** (`ROUTES`/`FOOTER`) but renders its own pages — so a shared nav/footer change can point to a page that exists in only one version (a dead link).
4. **No mechanism asserted** "same fact ⇒ same value everywhere."

## The algorithm (run for every fact change)
1. **Classify** the fact: structured (counts/dates/contacts/roster/presidium) vs prose vs config/route.
2. **Single source of truth (SSOT):** structured facts live in ONE place (a shared JSON / facts module). Displays **derive** from it — never hardcode a second copy of a number/date.
3. **Enumerate before editing:** grep the fact across **BOTH** trees and every representation kind (data, derived, prose, meta, alt/aria, svg, i18n, footer/nav). Canonical values live in `docs/source-of-truth-naas.md`.
4. **Atomic update:** change the SSOT **and every mirror** in the same change. If a fact must be mirrored in prose, update all mirrors together.
5. **Both versions:** any fact rendered in light's own pages/components must be changed in light too. Any shared route added must have a page in **both** `pages/` trees.
6. **Gate before deploy:** `npm run check` (→ `scripts/check-facts.mjs`) must be green. **Never deploy red.** It is wired into `npm run deploy` for both sites.
7. **One consistent deploy:** deploy gravitas + light together, only after the gate is green for both.

## The gate — `scripts/check-facts.mjs`
Scans both `site/src` and `site-light/src` (+ shared data, + `dist/` when built):
- **Forbidden strings** → fail: «вища галузева», «Прес-служба», publisher `/books` reports link, founding shown as `1931`.
- **Required:** `naas-emblem.png` is the 320px version in both `public/`.
- **Count consistency:** every "N установ" headline must equal the single roster source (`institutes.json` length).
- **Dead links:** every internal footer/nav link must resolve to a built page in **both** `dist/` outputs.

Run: `cd site && npm run check` (checks both). Add a new guarded fact by appending a FORBIDDEN/REQUIRED/consistency entry.

## Known limitation that this encodes
The **institution count** can only be made *correct* by fixing the roster (`institutes.json`) to the authoritative list — until then the gate stays red on `institution-count`, which is the correct signal that a stakeholder decision (Q1) is outstanding. Consistency ≠ correctness: the gate enforces consistency; `source-of-truth-naas.md` + stakeholder answers supply correctness.
