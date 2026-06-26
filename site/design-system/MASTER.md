# NAAS Portal — Design System (MASTER)

> **Source of Truth** for the National Academy of Agrarian Sciences of Ukraine (НААН) portal.
> This document codifies the design system that already lives in
> [`src/styles/global.css`](../src/styles/global.css) (the "V3 design tokens") and the
> component layer. It is **descriptive of what is built** and **prescriptive for what comes next**.
>
> When building or editing any page/component, read this file first. If a page-specific
> override exists in [`pages/`](./pages/), its rules take precedence (see
> [§11 Page overrides](#11-page-overrides)).
>
> Companion file: [`tokens.css`](./tokens.css) — the same foundations expressed as CSS custom
> properties (reference layer; see [§10 Adoption](#10-adoption--migration)).

---

## 1. Product framing

| Dimension | Value |
|---|---|
| **Type** | Government / institutional / academic portal (state research academy, est. 1931) |
| **Audience** | Researchers, institutes, civil servants, journalists, the public — broad, all-ages, all-abilities |
| **Job** | Authoritative wayfinding to structure, transparency data, news, documents, and contacts |
| **Tone** | Sober, trustworthy, scholarly, heritage. *Not* marketing, *not* trendy |
| **Pattern** | Institutional gateway: breadcrumb heroes, card/list directories, document registries |
| **Languages** | Ukrainian (default) + English chrome toggle (`data-lang`); `lang="uk"` |
| **Stack** | Astro 5 static output → Cloudflare Pages (`naas-portal-new`). No CSS framework; hand-rolled tokens + inline styles |

**Best-practice cross-check** (UI/UX Pro Max → *"Accessible & Ethical"* style for government/education):
high contrast, 16px+ base, visible focus rings, keyboard nav, reduced-motion, 44px touch targets,
conservative navy/grey palette, **avoid** ornate decoration, low contrast, gratuitous motion, and
AI purple/pink gradients. The current build already aligns with all of these.

---

## 2. Design principles

1. **Authority over flair.** Restraint signals trust. One primary action per view; accents are earned, not decorative.
2. **Serif for voice, sans for utility, mono for metadata.** The three-font system is the brand. Don't add a fourth family.
3. **Documents are first-class.** Registries, PDFs and external links are core content — they get real components, not afterthoughts.
4. **Accessible by construction.** Every color pair, focus state, and touch target meets WCAG AA at minimum (most hit AAA). Bilingual and high-contrast modes are part of the baseline.
5. **No dead links.** All navigation is sourced from [`src/lib/site.ts`](../src/lib/site.ts) so menus, footer, cards and search stay in sync.
6. **The grid is the system.** Prefer the canonical scales below over fresh magic numbers.

---

## 3. Color

### 3.1 Primitive tokens (as built — `global.css :root`)

| Token | Hex / value | Role |
|---|---|---|
| `--canvas` | `#FFFFFF` | Page background, cards |
| `--muted` | `#F8F9FA` | Section/hero background (cool grey) |
| `--muted2` | `#F2F1EE` | Row hover, warm grey wash |
| `--ink` | `#0A0A0A` | Primary text, headings |
| `--ink2` | `#525252` | Body / secondary text |
| `--ink3` | `#737373` | Captions, meta, disabled |
| `--line` | `#E5E5E5` | Borders, dividers (cool) |
| `--line2` | `#E7E5E0` | Borders (warm) |
| `--navy` | `#1E3A5F` | **Primary** brand: links, buttons, active states, kickers |
| `--navy-d` | `#142844` | Primary hover/pressed |
| `--navy-deep` | `#0E1F35` | Footer & utility-bar surface (dark) |
| `--gold` | `#B8860B` | **Accent**: rules, active underline, borders, icons (non-text) |
| `--gold-soft` | `rgba(184,134,11,0.10)` | Gold tint fills |
| `--gold-ink` | `#8A6508` | **AA-safe gold for small text** (~5.3:1 on white) |

### 3.2 Semantic mapping

These are the *intended meanings*; bind to them when reasoning about a new surface (see `tokens.css` for the aliases).

| Semantic | → primitive | Notes |
|---|---|---|
| `--color-bg` | `--canvas` | App background |
| `--color-surface` | `#FFFFFF` | Cards, sheets, header |
| `--color-surface-muted` | `--muted` | Sectioned regions |
| `--color-text` | `--ink` | Primary |
| `--color-text-secondary` | `--ink2` | Body |
| `--color-text-tertiary` | `--ink3` | Meta — **lightest text allowed; AA-borderline on `--muted`** |
| `--color-primary` | `--navy` | Interactive |
| `--color-primary-hover` | `--navy-d` | |
| `--color-on-primary` | `#FFFFFF` | Text on navy |
| `--color-accent` | `--gold` | Non-text accent only |
| `--color-accent-text` | `--gold-ink` | Gold used as small text |
| `--color-border` | `--line` | |
| `--color-focus-ring` | `--navy` | Focus outline |

### 3.3 Extended / off-token colors found in the codebase

These exist in components today but are **not** in `:root`. Promote them to named tokens (recommended names below) so they're themeable and consistent.

| Value | Where | Meaning | Recommended token |
|---|---|---|---|
| `#1F7A4D` | `RegistryList.astro` | XLS/XLSX file-type badge (spreadsheet = green) | `--filetype-sheet` |
| `#737373` | `RegistryList.astro` | PNG/JPG badge (= `--ink3`) | reuse `--ink3` |
| `#274059` → `#16304D` | `struktura.astro` card header gradient | Decorative navy gradient | `--navy-grad-1 / --navy-grad-2` |
| `#E8C766` | `struktura.astro` wheat motif | Decorative light-gold stroke | `--gold-2` |
| `rgba(184,134,11,0.4)` | `naan-sohodni.astro` "current edition" badge border | Gold border at 40% | `--gold-line` |

File-badge palette (RegistryList): PDF `--gold`, DOC/DOCX `--navy`, XLS/XLSX `#1F7A4D`, images `--ink3`, fallback `--ink2`.

### 3.4 Contrast (verified, WCAG 2.1)

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `--ink` `#0A0A0A` | white | ~20:1 | AAA |
| `--ink2` `#525252` | white | ~7.8:1 | AAA |
| `--ink3` `#737373` | white | ~4.7:1 | AA (normal) |
| `--ink3` `#737373` | `--muted` `#F8F9FA` | ~4.5:1 | **AA borderline** — don't go lighter on muted |
| `--navy` `#1E3A5F` | white | ~11.5:1 | AAA |
| `--gold` `#B8860B` | white | ~3.25:1 | **Fails AA for text** → use for non-text/large only |
| `--gold-ink` `#8A6508` | white | ~5.3:1 | AA (normal text) |
| white | `--navy-deep` `#0E1F35` | ~16.6:1 | AAA |

**Rule:** never set body/meta text in raw `--gold`; use `--gold-ink`. Keep `--ink3` as the lightest text on any surface, and prefer it on white rather than `--muted`.

---

## 4. Typography

### 4.1 Families (loaded via Google Fonts in `Base.astro`)

| Token | Stack | Use |
|---|---|---|
| `--serif` | `'Lora', Georgia, serif` | Headings, hero, brand wordmark, card titles, search input, prose headings |
| `--sans` | `'Inter', system-ui, …` | Body, navigation, UI labels (default `body` font) |
| `--mono` | `'JetBrains Mono', ui-monospace, monospace` | Kickers, meta, dates, file types, EDRPOU, tabular figures |

Weights loaded: Lora 400/500/600/700 (+italic 400/500), Inter 300–700, JetBrains Mono 400/500/600.
**In practice only 500 and 600 are used** for emphasis (400 = body default). Italic Lora is used for the founding line.

### 4.2 Type scale (roles)

The codebase currently spans ~21 fixed px sizes plus 14 fluid `clamp()` heads. Consolidate to these roles.

| Role | Size | Family / weight | Line-height | Tracking |
|---|---|---|---|---|
| `display` (home hero H1) | `clamp(30px, 4vw, 46px)` | serif 600 | 1.12 | -0.018em |
| `h1` (page hero) | `clamp(30px, 3.8vw, 44px)` | serif 500 | 1.08 | -0.02em |
| `h2` (section) | `clamp(26px, 3vw, 34px)` | serif 500 | 1.25 | -0.01em |
| `h2-feed` | 22px | serif 600 | 1.25 | — |
| `h3` | 19–20px | serif 600 | 1.25 | — |
| `lead` | `clamp(17px, 2vw, 21px)` / 16px | serif 500 / sans | 1.42–1.65 | — |
| `body` | 15.5px (prose) / 15px | sans 400 | 1.5–1.72 | — |
| `body-sm` | 13.5–14px | sans | 1.5 | — |
| `caption` | 12–13px | sans | 1.5 | — |
| `kicker` | 11px | mono 600 | — | 0.14em, uppercase |
| `meta` | 10–11px | mono | — | 0.04–0.14em, uppercase |

**Recommended numeric scale** to normalize toward (collapse 12.5→12, 13.5→13/14, 14.5→14, etc.):
`10 · 11 · 12 · 13 · 14 · 15.5 · 16 · 17 · 19 · 22 · 24` + fluid heads.

### 4.3 Rules

- **Base body ≥ 15.5px**; mobile inputs ≥ 16px (avoid iOS auto-zoom). Search input is 22px serif.
- Line length: cap prose at `max-width: 820px`; leads at ~620–720px.
- Kicker pattern: mono · 11px · 600 · `letter-spacing:0.14em` · uppercase · `--navy` (muted variant uses `--ink3`).
- Use **tabular/mono figures** for dates, years, counts, phone, EDRPOU.

---

## 5. Spacing & layout

### 5.1 Spacing scale (4px base — recommended canonical)

`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64 · 72 · 90`

The codebase uses many off-grid values (9, 11, 13, 17, 18, 22, 26, 34…). **New work uses the scale above;**
normalize existing values toward the nearest step opportunistically (don't mass-rewrite tuned components — see §9).

### 5.2 Layout

| Token | Value | Meaning |
|---|---|---|
| `--wrap` | `1320px` | Max content width (`.wrap` adds `padding: 0 24px`) |
| Section padding | `56–64px` vertical | `.section` = `60px 0` |
| Gutter | `24px` | Horizontal page inset |

**Breakpoints:** `560px` (stack fact cluster), `900px` (`.only-mobile` / `.only-desktop` swap — header nav ↔ drawer).
Recommended systematic set going forward: **375 / 768 / 1024 / 1440**.

**Grid helpers:** `.grid` (gap 16px) with `--auto` (minmax 300px), `--auto-sm` (280px), `--auto-lg` (380px) auto-fit columns.

---

## 6. Radius, elevation, z-index, motion

### 6.1 Radius

> ⚠️ **Known inconsistency:** `global.css` components (`.scard`, `.rows`) use **`3px`**, but page-level
> cards/lists use **`12px`** (13 occurrences across 8 files — 7 pages + `RegistryList`). A few cards also use
> off-scale **`9 / 10 / 14px`** (naan-sohodni person/document cards, struktura monogram). Pick one per surface class. **Recommendation:**
> standardize content **cards & list containers on `12px`** (dominant, softens the institutional grid),
> keep **`3px`/`4px` for inline chips/badges**, `6px` for buttons/inputs/media. See §9.

Canonical scale:

| Token | Value | Use |
|---|---|---|
| `--r-xs` | 3px | inline badges, fine chips |
| `--r-sm` | 4px | file-type badges, small chips |
| `--r-md` | 6px | buttons, inputs, icon buttons, thumbnails |
| `--r-lg` | 8px | medium cards, placeholders |
| `--r-xl` | 12px | content cards, list containers (target standard) |
| `--r-pill` | 50% | avatars / circular |

### 6.2 Elevation (shadow scale)

Soft, navy-tinted, low-spread — never harsh. Reserve elevation for overlays and hover, not static layout.

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 8px 22px rgba(30,58,95,0.08)` | Card hover (`.news-card`) |
| `--shadow-md` | `0 8px 24px rgba(30,58,95,0.06)` | Raised cards |
| `--shadow-lg` | `0 14px 50px rgba(0,0,0,0.2)` | Search overlay |
| `--shadow-drawer` | `-12px 0 40px rgba(0,0,0,0.18)` | Mobile drawer |

### 6.3 Z-index scale (as built → tokenize)

| Token | Value | Layer |
|---|---|---|
| `--z-header` | 60 | Sticky header |
| `--z-overlay-scrim` | 90 | Mobile-drawer scrim |
| `--z-overlay` | 100 | Mobile drawer |
| `--z-modal-scrim` | 110 | Search scrim |
| `--z-modal` | 111 | Search dialog |
| `--z-skip` | 120 | Skip-link (must beat everything) |

### 6.4 Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 140ms | row/link hover (color/background) |
| `--motion-base` | 160ms | card border, button background |
| `--motion-slow` | 200ms | panel enter (`naasDrop`) |
| Easing | `ease` (default) | enter; exit shorter |
| Keyframes | `naasFade` (opacity) — scrims at 150ms/160ms; `naasDrop` (opacity + translateY -10px) — panels at 200ms | overlays |

**Always** honor `prefers-reduced-motion` — `global.css` already nukes animation/transition durations to ~0
and disables smooth scroll under that query. Animate `transform`/`opacity` only; never width/height/top/left.

---

## 7. Components

Every component is on-style when it: uses the token palette, has visible hover **and** focus states,
uses SVG icons (24×24 viewBox, `currentColor`, stroke 1.6–2), and meets the 44px touch minimum for controls.

### 7.1 Button — primary (`.btn-navy`)
Navy fill, white text, `--r-md` (6px), `padding 12px 22px`, 13.5px/600, gap 9px for trailing icon.
Hover → `--navy-d`, `--motion-base`. **One primary CTA per view.**

### 7.2 Link — underline (`.link-underline`)
Navy text + 1px navy bottom-border, 14px/600. Hover grows icon gap 7→11px (`--motion-base`).
The site's standard "read more / go to" affordance.

### 7.3 Card — section (`.scard`)
White, 1px `--line` border, 24px padding, `gap 9px`, serif 19px/600 title + `--ink2` description.
Hover → border `--navy` (+ optional `--shadow-sm` for `.news-card`). Currently `3px` radius → migrate to `--r-xl`.
Title row: title + trailing arrow icon, space-between.

### 7.4 List rows (`.rows` / `.row`)
Bordered container, rows separated by 1px `--line`, `padding 17px 22px`, gap 18px.
`.row-title` 15px/600 ink · `.row-desc` 13px ink2 · `.row-url` mono 12px navy. Hover row → `--muted2`.

### 7.5 Registry row + file badge (`RegistryList.astro`)
Document list with a mono file-type badge (46×30, `--r-sm`, white text) colored by extension (see §3.3),
title (14.5px), optional external note, year (mono), and a download/external SVG. Container `12px` radius.

### 7.6 Breadcrumb hero (`.hero` + `Hero.astro`)
`--muted` band, bottom `--line`, `padding 30px 0 40px`. Mono breadcrumb trail (`.crumbs`, 11px ink3,
hover navy), serif H1 (`clamp(30px,3.8vw,44px)`/500, lh 1.08, -0.02em), optional `.lead` (16px ink2, max 640px).
Used by `DocPage` and all interior pages. The hero renders the page title — markdown bodies suppress their leading H1.

### 7.7 Centered hero (`HeroC.astro`)
Home hero: centered stack ≤860px — kicker → serif display H1 → serif navy subtitle → gold rule + italic
founding line → mission paragraph → 3 underline links → **fact cluster** (3 serif navy numbers with mono labels,
1px `--line` dividers; stacks under 560px). Decorative field-contour SVG at 6% opacity, clipped by its own viewport.

A left-aligned variant **`HeroLeft.astro`** (max 880px, fact cluster left-aligned full-width) is the original
A/B alternative, wired to `/hero-c`. The **live homepage** (`index.astro`) defaults to the centered `HeroC`
(via a build-time switch that can swap in an image hero).

### 7.8 Section + kicker + FieldRule
`.section` (`--white` / `--muted` variants, `--muted` adds top `--line`). Lead with `.kicker` then `.h2-serif`.
`FieldRule` is the decorative agronomic divider between sections. Three-feed homepage blocks use a **3px top
border** color-coded per feed: news = `--navy`, departments = `--ink3`, announcements = `--gold`.

### 7.9 Placeholder (`.placeholder`)
Dashed `--line` border, `--r-lg`, centered `--ink3` text — for ТЗ sections awaiting content. Honest empty state.

### 7.10 Prose (`.prose`)
Markdown body: max 820px, 15.5px/1.72 `--ink2`. Serif headings; links navy with subtle underline.
First `h1` hidden (hero owns the title).

### 7.11 Header (`Header.astro`)
- **Utility bar:** `--navy-deep`, 34px, right-aligned — high-contrast toggle (`data-hc`) + UA/EN language toggle (`aria-pressed`).
- **Main header:** sticky, `z 60`, translucent white + `backdrop-filter blur(8px)`, 84px, bottom `--line`.
  Emblem (64px) + two-line serif wordmark + mono "ЗАСН. 1931". Desktop nav 14px (active = navy 600 + 2px gold underline).
  Search (44×44) + mobile menu (44×44) controls.
- **Search overlay:** scrim `z 110` + dialog `z 111`, serif 22px input (`outline:none`), live-filtered results from `SEARCH_INDEX` + news.
  Focus is trapped, ESC closes, focus returns to trigger. **Focus affordance:** the `.search-row` underline shifts from
  2px `--navy` (rest) to `--gold` on `:focus-within` (160ms) — the same gold accent as active nav.
- **Mobile drawer:** right sheet `min(340px,86vw)`, scrim `z 90` / panel `z 100`, focus-trapped, 44px+ rows.

### 7.12 Footer (`Footer.astro`) + Partners
`--navy-deep` surface, white-alpha text. Emblem + wordmark + address (mono tel/email), 3 link columns
(auto-fit minmax 190px), bottom bar with © and EDRPOU. `.ft-link` 0.78→1.0 white on hover.
`Partners` = sober official state-portal links (no marketing styling).

### 7.13 News card (`.news-card`)
Image-top article card used on `/novyny` (and as a 60×60-thumbnail row variant in the homepage news feed).
`--r-xl` (12px), `overflow:hidden`, 1px `--line`; cover image (400×200, `height:200px`, `object-fit:cover`),
then mono date·tag (10.5px `--ink3`) → serif 18px/600 title → 13.5px `--ink2` teaser. Hover (160ms) →
border `--navy` + `--shadow-sm` (`global.css:127`).

---

## 8. Accessibility standards (baseline — already met; keep it)

- **Contrast:** all text ≥ AA (§3.4). Never use raw `--gold` for text.
- **Focus:** visible focus indicators throughout; the search field shows focus via its container underline shifting `--navy`→`--gold` on `:focus-within` (the input itself is `outline:none` by design). Don't remove focus affordances.
- **Touch targets:** controls ≥ 44×44 (search, menu, drawer rows).
- **Keyboard:** skip-link to `#main`; full focus trapping + restore in search & drawer; ESC closes overlays; tab order matches visual order.
- **Reduced motion:** `prefers-reduced-motion` disables animation + smooth scroll.
- **High-contrast mode:** `html[data-hc="true"]` applies `saturate(0) contrast(1.22)`.
- **Bilingual:** `<T>` renders both UA/EN; CSS shows the active one; language persisted, applied pre-paint to avoid FOUC; `html.lang` updated.
- **Semantics:** `aria-label` on icon-only buttons, `role="dialog"`, `aria-pressed` on toggles, `<address>`, breadcrumb `nav`, descriptive alt (decorative imgs use `alt=""`).
- **Color is never the only signal:** file types pair color badges with the extension text; active nav pairs color with weight + underline.

---

## 9. Known inconsistencies & recommendations

| # | Issue | Recommendation | Risk |
|---|---|---|---|
| 1 | **Card radius** split 3px (global.css) vs 12px (pages) | Standardize content cards/lists on `--r-xl` (12px); chips on 3–4px; buttons/inputs 6px | Low — visual, intentional choice |
| 2 | **Off-token colors** (#1F7A4D, #E8C766, #274059/#16304D, gold-40) | Promote to named tokens (§3.3) | Low |
| 3 | **Font-size sprawl** (~21 fixed + 14 clamp) | Collapse to the §4.2 scale opportunistically | Low |
| 4 | **Spacing off-grid** (9/11/13/17/22/26…) | New work on 4px scale; normalize gradually | Low |
| 5 | **Footer column labels** at `rgba(255,255,255,0.45)` ≈ **4.4:1** on `--navy-deep` | Bump alpha to ~`0.55` (→ ~5.8:1) for AA on 10px labels | Low — a11y |
| 6 | **Inline-style soup** in Header/Footer/HomeSections/pages | Migrate repeated patterns to `global.css` classes / tokens incrementally | Medium — refactor, verify pixels |
| 7 | **Raw `--gold` as text** in `naan-sohodni` (status badge 10px `:98`, member monogram 16px `:78`) — fails AA (~3.25:1) | Switch both to `--gold-ink` (the featured President card at `:52` already does) | Medium — a11y |

> **Process note (from project memory):** this site's pixel output is carefully tuned and the sandbox
> blocks Google Fonts. Before asserting any responsive/overflow issue, verify with the same-origin
> **iframe probe** (not a headless `--screenshot`), and render with fonts mapped to a dead host so the
> page doesn't hang on `fonts.googleapis.com`. Don't mass-rewrite tuned components to "fix" the scales
> above without verifying the rendered result.

---

## 10. Adoption / migration

`tokens.css` is a **reference layer**: it mirrors the live `:root` from `global.css` *exactly* and adds the
new scale tokens (`--r-*`, `--shadow-*`, `--z-*`, `--motion-*`, spacing, semantic aliases). **It is not yet
imported** — wiring it in changes nothing visually because the new variables are simply unused until a
component references them.

Suggested rollout (each step independently verifiable, zero forced visual change):
1. `@import './../design-system/tokens.css'` at the top of `global.css` (or move `:root` there). No-op visually.
2. Replace magic numbers in **one** component with tokens; verify with the iframe probe; commit.
3. Repeat per component. Reconcile radius (§9.1) when you touch each card surface.

---

## 11. Page overrides

Pages that legitimately deviate from MASTER document the delta in [`pages/<page>.md`](./pages/).
Retrieval rule when building a page:

> Read `MASTER.md`. Then check `pages/<page-name>.md`. If it exists, **its rules override** MASTER for that page.
> If not, MASTER governs exclusively.

Current documented overrides: see [`pages/`](./pages/) (e.g. `struktura` — navy-gradient division-card headers + wheat motif).

---

## 12. Anti-patterns (do not do)

- ❌ Emoji as icons — use SVG (24×24, `currentColor`).
- ❌ Raw `--gold` for body/meta text (fails AA) — use `--gold-ink`.
- ❌ A fourth font family, or display/decorative fonts.
- ❌ Ornate effects, heavy gradients/shadows, parallax, AI purple/pink gradients.
- ❌ Removing focus rings; hover-only affordances; color-only meaning.
- ❌ New magic numbers when a scale token fits.
- ❌ Hardcoded nav/footer links — source them from `src/lib/site.ts`.
- ❌ Disabling zoom / fixed-px container widths / horizontal scroll on mobile.
- ❌ Marketing tone, exclamation CTAs, "sign up" energy — this is a state institution.
