# NAAS Light Portal — Design Spec

**Date:** 2026-06-26
**Status:** Draft for review
**Author:** Design session (brainstorming)

---

## 1. Goal & context

Create a **new, lighter-feeling version** of the NAAS portal that keeps the scholarly, science-first character of the institution but reads as more open and approachable than the current "gravitas" site. The current site stays live and untouched; the new version is a **parallel front end on its own domain(s)**, sharing the same content source so the two never drift.

- **Organisation:** National Academy of Agrarian Sciences of Ukraine (НААН) — a government scientific organisation.
- **Positioning (decided):** **Science first.** NAAS is a research academy, not a business or a state e-service. The agrarian-business / farmer audience is real and important but **secondary** — served *underneath* the scientific identity, never competing with it. Explicitly **not** a Diia-style govtech-app look.
- **Audience:** scientists, lecturers, postgraduates; then agribusiness, farmers, state bodies/communities, citizens.

### Reference & inspiration
- `v3-hybrid.html` (in repo root; mirrored at `kovalsky.github.io/naas-concept/v3-hybrid.html`) is the **feel** reference — light, photography-driven, varied per-section treatments. We take its *spirit and richness*, not a 1:1 port.
- `nan.gov.ua` is a **non-mandatory** reference (named in the TZ, not a requirement).

### Hard rule: no invented content
Every text string and every interactive element must map to **real, sourced content** (migrated data, official NAAS wording) or a **real route / TZ block**. We do **not** invent copy (slogans, headlines, CTAs, section labels) — the academy's scientists scrutinise wording, so fabricated text is a liability. Where real content is genuinely missing, it is shown as a **clearly-marked placeholder**, never invented and never silently presented as real.

---

## 2. Scope

**In scope (this effort):**
- A full-site light redesign covering **all routes the current site has** (~17 routes).
- **Two hero variants**, both shipped, each on its own domain:
  - **V1 — typographic hero** (no photo): calm white hero with the wheat-contour line, serif headline, stat row.
  - **V3 — photo-slider hero**: full-width photographic hero with navy wash, white text, slide indicators.
  - The two variants are **identical except for the hero**; everything below the hero is the same design system.
- Honouring the TZ's **frontend** constraints (see §9).
- Migrating/building the **«Наукові розробки та пропозиції»** content (it lives under Публічна інформація on the old site; partially in `registries.json` as `pubinfo__naukovi_rozrobky`). Full migration of this catalogue is **in scope**.

**Out of scope (explicitly deferred to later sessions / phases):**
- CMS / multi-editor RBAC / WordPress, 2FA, backups, event logging.
- Live Prozorro widget integration (links only for now), Prozorro.Продажі integration.
- **Per-department news aggregation** ("Новини відділень" auto-feed) — shown as a marked placeholder.
- Full-text site search backend (the header search UI is in scope as a pattern; indexing depth is a follow-on).

---

## 3. Architecture

Chosen approach: **second Astro project that shares the existing content source** (Approach A from brainstorming), with a **build-time hero flag** producing the two variants.

```
naas_github_pages/
├── site/                 # CURRENT "gravitas" site — UNTOUCHED. Deploys to naas-portal-new.
│   └── src/data/         # ← single source of truth for content (JSON + markdown)
│       └── ...
└── site-light/           # NEW project (this spec)
    ├── astro.config.mjs  # site: <new domain>; reads HERO build flag
    ├── src/
    │   ├── content.config.ts   # collections glob ../../site/src/data/{pages,news.json}
    │   ├── lib/                 # imports ../../site/src/data/*.json (+ reuse routes/i18n where sensible)
    │   ├── layouts/  components/  pages/  styles/   # NEW design system (this spec)
    │   └── ...
    └── package.json      # deploy:v1 / deploy:v2 scripts → two Pages projects
```

- **Content single-source:** `site-light` does **not** copy content. Its `content.config.ts` loaders point at `../../site/src/data/` and its data modules import the same JSON. Editing a JSON/markdown file updates current + both light variants. (Requires `vite.server.fs.allow: ['..']` for dev.)
- **Two variants from one codebase:** a `HERO` env/build flag (`v1` | `v3`) selects the hero component at build time. Build twice → two `dist/` → two deploys. This build-flag approach is appropriate **only** because V1/V3 are identical except the hero; the gravitas-vs-light split is kept as separate projects, not a flag, because those designs diverge structurally.
- **Current site is never modified.** Its files, build, and deploy (`naas-portal-new`) are unchanged.

**Why not the alternatives:** a monorepo/workspaces refactor would relocate the current site's files (risk for no near-term gain); a single-project theme switch across gravitas+light would couple two divergent designs and endanger the live site.

---

## 4. Design system

Same brand palette as today (continuity), lighter expression.

### Tokens
- **Colour:** navy `#1E3A5F` (`--navy`), navy-deep `#0E1F35`, wheat-gold `#B8860B` (`--gold`); ink `#0A0A0A` / `#525252` / `#8a8a8a`; line `#E6E5E1`; canvas `#FFFFFF`; muted `#F8F8F5`. Navy is reserved for **accents, hero wash, and footer** — not full content blocks (that was the heavy look).
- **Type (self-hosted woff2, no CDN):**
  - Display serif — **Lora** (weights 400/500/600), headings at **500** (lighter than bold).
  - Body sans — **Inter** (300–600).
  - Mono — **JetBrains Mono** (labels, dates, stats, eyebrows).
  - e-Ukraine was evaluated and **rejected** as primary (govtech-app voice; loses scholarly serif character) — verified it's a sans-only state family. Kept as a possible alt only if a stakeholder insists.
- **Layout:** single `.wrap` container, **consistent horizontal gutter** (32px desktop / 16–20px mobile), max content width ~1200–1320px. One gutter governs every band (utility strip, header, hero text, stats, sections, footer) so all left edges align.
- **Spacing:** 4/8px rhythm; section padding ~40px desktop.
- **Effects:** thin hairline dividers; small radii (cards ~10px, buttons ~6px); gold as a sparing 2px accent rule; subtle card hover lift.

### Per-block treatment variety (the key lesson)
Each content block gets its **own** visual treatment so sections feel distinct (not a uniform card grid):
- **Photo division cards** (Структура), **editorial news** (featured lead + scannable list), **date-block events list** (Анонси → «Найближчі події»), **presidium portraits**, **bordered attestation tiles**, **document/row list** (governance), **feature pair** (Рада молодих / ІВ), **resource cards**, **stats band**.

---

## 5. Content blocks (strict) & arrangement

The TZ's content sections are the **one strict requirement**: implement **exactly** those blocks, with the TZ's **own names** — no additions, no renames. **Order is a free design choice**; we arrange science-first.

**Blocks (TZ names):** НААН сьогодні · Статут НААН · Керівництво та Президія · Рішення та Постанови Президії · Звіти про діяльність · Структура Академії · Атестація та підготовка кадрів (incl. Аспірантура/Докторантура, Спеціалізовані вчені ради, Наукові видання НААН, Державна атестація та акредитація) · Тендери та Прозорість (incl. Публічні закупівлі, Майнові питання та Оренда, Запобігання корупції, Доступ до публічної інформації) · Публічна інформація · Рада молодих вчених · Інтелектуальна власність · Контакти. Plus: **3 news ribbons** (Новини / Новини відділень / Анонси), **Е-ресурси** (Е-Бібліотека · Відео · Agricultures), **посилання на 4 сайти**, **пошук** (top), **логотип** (top).

**Homepage arrangement (design choice, science-first):**
1. Header: emblem + brand + **exact tagline** «Науково-методичний і координаційний центр з наукових проблем розвитку АПК України» + nav + search (top).
2. Hero (V1 or V3). **Copy is the verbatim old-site hero text** (source: `naas.gov.ua` `region-banner` / `.slogan` elements):
   - H1 = «Національна академія аграрних наук України»
   - Slogan/subhead = «Науково-методичний і координаційний центр з наукових проблем розвитку АПК України»

   No invented slogan. No invented CTA — at most, links to real routes (e.g. «НААН сьогодні» → `/naan-sohodni`).
3. Stats band — real: `1931 · 6 відділень · 50 установ`.
4. **НААН сьогодні** — intro/mission band.
5. **Структура Академії** — photo division cards (6 divisions, real institute counts).
6. **Новини / Новини відділень / Анонси** — editorial news + marked dept placeholder + events list.
7. **Атестація та підготовка кадрів** — sub-tiles.
8. **Керівництво та Президія** — portrait row.
9. **Статут НААН** · **Рішення та Постанови Президії** · **Звіти про діяльність** · **Тендери та Прозорість** · **Публічна інформація** — presented as a row list. **No cluster heading** — these stand as their own TZ-named blocks (the earlier "Документи та прозорість" arranging label was invented and is dropped).
10. **Рада молодих вчених** + **Інтелектуальна власність** — feature pair.
11. **Е-ресурси** → **4 посилання** → footer with **Контакти**.

---

## 6. Interaction map (first-class)

Every interactive element states **target · behavior · data source · status** (Spec'd = designed behavior; Decorative = visual pattern only, not yet designed). Routes verified against `site/src/lib/site.ts` (`ROUTES`/`EXTERNAL`).

| Element | Target | Behavior | Data source | Status |
|---|---|---|---|---|
| Header logo | `/` (home) | navigate | — | Spec'd |
| Header search | site search | open search overlay over `SEARCH_INDEX` + news titles | `site.ts SEARCH_INDEX` | Spec'd (UI); deep indexing deferred |
| Lang UA/EN | toggles `data-lang` | in-place language switch (`<T>` pattern) | i18n | Spec'd |
| Primary nav items | `ROUTES.today / structure / training / transparency / news / contacts` | navigate | `site.ts NAV` | Spec'd |
| Hero links (real routes only) | e.g. `/naan-sohodni`, `/struktura` | navigate | `site.ts` | Spec'd — invented "Наукове партнерство" CTA **dropped** |
| Stat cells | none | static | `data.ts` counts | Spec'd (non-interactive) |
| "Докладніше про НААН →" | `/naan-sohodni` | navigate | — | Spec'd |
| Division card "Установи відділення (N) →" | `/struktura` (+ division anchor) | navigate | `institutes.json` | Spec'd |
| **News filter chips** | — | — | — | **DROPPED for launch** (see §6.1) |
| Featured news + news rows | `/novyny/[slug]` | navigate | `news.json` collection | Spec'd |
| "Усі новини →" | `/novyny` | navigate | — | Spec'd |
| Новини відділень items | none (placeholder) | non-interactive, **marked ЗРАЗОК** | none yet (CMS phase) | Placeholder |
| Анонси / «Найближчі події» items | `/anonsy` | navigate | `anonsy.json` | Spec'd |
| Attestation tiles | `/atestatsiia` (+ sub-anchors) | navigate | page content | Spec'd |
| Presidium portraits | `/naan-sohodni#prezidiya` | navigate | `persons.json` | Spec'd |
| Doc rows (Статут / Рішення / Звіти / Тендери та Прозорість / Публічна інформація) | `/statut` (or `EXTERNAL.statutePdf`), `/naan-sohodni#rishennia`, `EXTERNAL.reports`, `/prozorist`, `/publichna-informatsiia` | navigate / open PDF / external | `site.ts` | Spec'd |
| Рада молодих вчених | `/rada-molodykh` | navigate | — | Spec'd |
| Інтелектуальна власність | `/intelektualna-vlasnist` | navigate | — | Spec'd |
| Е-ресурси (Е-Бібліотека / Відео / Agricultures) | `EXTERNAL.eLib / video / agrolectures` | external | `site.ts EXTERNAL` | Spec'd |
| 4 посилання | president.gov.ua / kmu.gov.ua / rada.gov.ua / minagro.gov.ua | external | `site.ts PARTNERS` | Spec'd |
| Footer contacts | mailto/tel | open mail/phone | `contacts.json` | Spec'd |

### 6.1 News taxonomy decision
- The tag-filter chips shown in mock iterations are **dropped for launch.** Justification: only **9 news items** exist; freeform `tag` values mix *source* ("Президія") and *topic* ("АПК"), which is not a coherent taxonomy.
- The news section is a straight feed → `/novyny`; each item → `/novyny/[slug]`.
- **Future** filtering, when volume grows, should be **by відділення** — a real, data-backed taxonomy that also ties into the TZ's per-department aggregation. Any new interactive control must be added to this map with a defined behavior before it ships.

---

## 7. Content & data policy

- **Strict-real for text content and many-instance content.** All text (block names, copy, news, anonsy, persons, institutes, contacts) comes from the real migrated data in `site/src/data/`. Content types that have many instances each carrying real media — e.g. the **100+ news items, each with its own photo** — must use the real photos; we do **not** generate or substitute these.
- **Stock/decorative imagery is allowed** for hero and section decoration (division cards, About band). Final build curates these deliberately (incl. purchased stock); a consistent navy-tint/duotone keeps section imagery cohesive with the palette.
- **Placeholders must be visibly marked** (e.g. `ЗРАЗОК · демо-наповнення` badge) so stakeholders know that content needs to be mined/supplied (Новини відділень).
- Real data confirmed: 6 divisions / **50 установ** (not 42); founded **1931**; news 9 items w/ photos; anonsy 4 w/ photos; leadership 7 w/ photos+bios; EDRPOU **00024360**; address `01010, Київ, вул. Михайла Омеляновича-Павленка, 9`.

---

## 8. Page archetypes (full site)

All current routes re-themed. Archetypes to design:
- **Home** (two hero variants).
- **List/feed** — `/novyny` (news index + `/novyny/[slug]` article), `/anonsy`.
- **Structure** — `/struktura` (divisions → institutes with fields: назва, керівник, web, email, тел, факс, адреса; фото/лого only if data exists — currently none for institutes).
- **People** — `/naan-sohodni#prezidiya` (presidium portraits + bios).
- **Document/registry** — `/statut`, `/publichna-informatsiia`(+`[slug]`), `/prozorist`(+ tendery/maynovi/dostup/zapobihannia), `/atestatsiia`.
- **Prose/markdown** — markdown body pages (`/naan-sohodni`, `/rada-molodykh`, `/intelektualna-vlasnist`, etc.).
- **Contacts** — `/kontakty` (with **Cloudflare Turnstile** on the inquiry form).
- **404**.

---

## 9. Frontend constraints (from TZ, in scope)

- **Accessibility:** WCAG 2.1 **AA** — contrast ≥ 4.5:1, visible focus rings, keyboard nav, ARIA, alt text, skip link, reduced-motion respected.
- **Performance:** Google PageSpeed **≥ 90** mobile & desktop → **no Tailwind CDN** (build CSS), **self-hosted fonts** (woff2, `font-display: swap`), **WebP + lazy + srcset**, hero ≥ 1920×1080, reserve image dimensions (CLS).
- **SEO:** Schema.org (Article, Person, Dataset), Open Graph, `sitemap.xml`, `robots.txt`.
- **Analytics:** GA4 tag + goals.
- **Bilingual UA/EN** (reuse the `<T>` pattern; default UA).
- **Security (frontend-touching):** Cloudflare Turnstile on the contact form; CSP/security headers at deploy; HTTPS/TLS via Cloudflare. (Backend security items are out of scope here.)
- Cross-browser: latest 2 of Chrome/Firefox/Safari/Edge. Responsive breakpoints ≤767 / 768–1023 / 1024+.

---

## 10. Deployment

- Naming follows the design-system identity: **"NAAS Portal Gravitas"** (current) and **"NAAS Portal Light"** (new).
- `site-light` builds twice (`HERO=v1`, `HERO=v3`) → two Cloudflare Pages projects:
  - **`naas-portal-light-v1`** (typographic hero)
  - **`naas-portal-light-v3`** (photo-slider hero)
- Current `site` continues to deploy unchanged (conceptually "NAAS Portal Gravitas").
- Custom domains map to the same scheme; default `*.pages.dev` until custom domains are assigned.

---

## 11. Decisions (resolved) & remaining input

**Resolved:**
1. **Domains/project names:** `naas-portal-light-v1` + `naas-portal-light-v3` (current = "NAAS Portal Gravitas").
2. **Hero copy:** real/sourced only — official name + verbatim descriptor; no invented slogan (§5).
3. **Governance label:** dropped (was invented); blocks stand under their TZ names (§5).
4. **Hero CTA:** invented "Наукове партнерство" dropped; hero links only to real routes (§6).

**Remaining input (optional, can drop in later — not blocking):**
- Final **custom domains** (vs default `*.pages.dev`).

*(Hero slogan resolved: taken verbatim from the old-site `region-banner` — see §5.)*

---

## 12. Success criteria
- All TZ content blocks present, named per TZ, reachable; no invented or renamed sections.
- Two homepages (V1, V3) live on separate domains, sharing one content source with the current site; current site unaffected.
- Each content block visually distinct (no uniform-grid monotony); science-first arrangement.
- PageSpeed ≥ 90, WCAG AA, self-hosted fonts, real text/multi-instance content, marked placeholders.
- Every interactive element has a defined target/behavior per the interaction map (§6).
