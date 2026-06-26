# NAAS Portal — Brand Guidelines v1.0

Source-of-truth brand guidelines for **Національна академія аграрних наук
України / National Academy of Agrarian Sciences of Ukraine (NAAS)**, covering
visual identity and (by reference) verbal identity.

## How this document relates to the code

The **canonical implementation of the visual system is
`site/src/styles/global.css`** — it is imported once in `site/src/layouts/Base.astro`
(`import '../styles/global.css';`) and Astro bundles it as the single global
stylesheet for every page. This document *describes and governs* that file; it
does **not** introduce a second token source. When a token changes, change it in
`global.css` and update the table here.

> Note on the `/brand` skill's token pipeline: this project does **not** use
> `assets/design-tokens.json` / `assets/design-tokens.css` (no `assets/` dir
> exists and nothing in the build consumes them). Do **not** run
> `sync-brand-to-tokens.cjs` here — it would create an orphan parallel source of
> truth. `global.css` is authoritative.

**Caveat — some styles live inline in components, not in `global.css`:** the
header utility bar + sticky header (inline styles in `Header.astro`), the footer
(scoped `<style>` in `Footer.astro`), and the `.news-card` base (inline in
`pages/novyny/index.astro`; `global.css` only adds its `:hover`). Pull
header/footer specifics from those components.

Verbal identity (voice, tone, messaging, lexicon) lives in
**[`brand-voice-messaging.md`](./brand-voice-messaging.md)** and is summarized in
§10 below.

---

## Quick reference

| | |
|---|---|
| **Primary color** | Navy `#1E3A5F` (`--navy`) |
| **Accent color** | Gold `#B8860B` (`--gold`) — *rules & borders only* |
| **Primary text** | Ink `#0A0A0A` (`--ink`) |
| **Display/serif font** | Lora |
| **Body/sans font** | Inter |
| **Label/mono font** | JetBrains Mono |
| **Container width** | 1320px (`--wrap`), 24px side padding |
| **Logo** | Raster emblem `public/naas-emblem.png` + serif text wordmark |
| **Voice** | Authoritative · Precise · Civic · Forward-looking · Steady |
| **Default language** | Ukrainian (chrome is UA/EN; body content UA only) |

---

## 1. Logo & emblem

[verified: ls site/public, file naas-emblem.png, grep Base.astro]

- **Emblem (the mark):** `public/naas-emblem.png` — a raster PNG, 228×227,
  8-bit RGBA (~69 KB). There is **no standalone SVG logo**. `HeroImage.astro`
  carries an *inline SVG fallback* emblem (stylized three wheat-ears,
  `viewBox 0 0 600 460`) used only when no raster image is passed.
- **Wordmark:** rendered as **live text, not an image** — a two-line serif
  lockup "Національна академія аграрних наук України" (Lora, 15px header /
  14px footer, weight 600, letter-spacing −0.01em) with a mono founding tag
  "ЗАСН. 1931" (10px, letter-spacing 0.12em) beneath.
- **Favicon:** the same `naas-emblem.png` (`<link rel="icon" type="image/png">`).
  There is no `.ico`.

### Emblem sizing (as used)
| Context | Size | Treatment |
|---------|------|-----------|
| Header | 64×64 | `object-fit: contain`, `flex-shrink: 0`, beside wordmark |
| Footer | 72×72 | identity mark, on navy |
| Native | 228×227 | source asset |
| Alt text | — | "Емблема НААН" (localize to "NAAS emblem" for EN) |

### Hero emblem library
A set of pre-rendered hero treatments lives in `public/img/hero/` — `emblem-navy`,
`emblem-light`, `emblem-navy-deco`, `emblem-navy-ornate`, and `banner-wide`, each
as `.jpg` + optimized `.webp` + a 600px `.webp` variant (plus
`banner-wide-mobile.webp`). These back the homepage hero variant switcher
(classic / emblem / wide). [verified: ls site/public/img/hero]

### Don'ts
- Don't recolor or add effects (shadows/gradients) to the emblem; always
  `object-fit: contain` — never stretch or crop.
- Don't typeset the wordmark in anything but Lora 600; keep the two-line lockup.
- Don't place the navy/dark emblem on a busy or low-contrast background — use the
  `-light` variant on dark surfaces.

---

## 2. Color

All values are CSS custom properties in `:root` of `global.css`.
[verified: Read global.css:6-17]

### Primary — Navy
| Token | Hex | Role |
|-------|-----|------|
| `--navy` | `#1E3A5F` | **Primary brand.** Buttons, active nav/link, kicker, card-hover border, `::selection`, field-contour stroke |
| `--navy-d` | `#142844` | `.btn-navy` hover background |
| `--navy-deep` | `#0E1F35` | Utility bar + footer background (deepest) |

### Accent — Gold
| Token | Hex | Role |
|-------|-----|------|
| `--gold` | `#B8860B` | **Rules & borders ONLY** — active-nav underline, 3px footer top border, section/footer ticks, hero-switch underline, focus underline shift, field-contour accent path |
| `--gold-ink` | `#8A6508` | **The only AA-safe gold for small text** (~5:1 on white/muted) |
| `--gold-soft` | `rgba(184,134,11,0.10)` | 10% gold tint — *declared, reserved* (no consumer yet) |

> **Critical rule (from the source comment):** `--gold` is for rules/borders, not
> text. For any gold text use `--gold-ink`.

### Ink — text hierarchy
| Token | Hex | Role |
|-------|-----|------|
| `--ink` | `#0A0A0A` | Primary text / headings (highest contrast) |
| `--ink2` | `#525252` | Body, leads, card descriptions, inactive nav |
| `--ink3` | `#737373` | Muted — breadcrumbs, fact labels, placeholders, founding line |

### Surfaces & lines
| Token | Hex | Role |
|-------|-----|------|
| `--canvas` | `#FFFFFF` | Page background |
| `--muted` | `#F8F9FA` | `.section--muted`, breadcrumb hero band |
| `--muted2` | `#F2F1EE` | Warm-grey document-row hover fill |
| `--line` | `#E5E5E5` | Primary border / divider |
| `--line2` | `#E7E5E0` | Warm line — *declared, reserved* (no consumer yet) |

### Accessibility
- Body text `--ink`/`--ink2` on white meets WCAG AA+.
- `--navy` on white ≈ 9.8:1 — AAA for text; used for primary actions.
- **Gold for text must be `--gold-ink`** (`--gold` fails AA for small text).
- High-contrast mode: `html[data-hc="true"] { filter: saturate(0) contrast(1.22) }`,
  toggled from the utility bar.

---

## 3. Typography

Loaded via Google Fonts in `Base.astro` with `display=swap`
[verified: grep Base.astro:36]:

```
--serif: 'Lora', Georgia, serif;                          /* ital 400,500,600,700 + italic 400,500 */
--sans:  'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;  /* 300,400,500,600,700 */
--mono:  'JetBrains Mono', ui-monospace, monospace;       /* 400,500,600 */
```

- **Serif (Lora)** — display & editorial: all H1/H2/H3, card titles, fact
  numbers, the wordmark, search input.
- **Sans (Inter)** — body default on `<body>`: nav, body copy, leads, buttons,
  card descriptions, document rows.
- **Mono (JetBrains Mono)** — labels: kicker, breadcrumbs, footer/section heads,
  fact labels, row URLs, founding tag, the UA/EN toggle.

### Type scale (as implemented)
[verified: Read global.css + workflow visual-extract of HeroC/Header/Footer]

| Element | Font | Weight | Size | Line-height | Tracking |
|---------|------|--------|------|-------------|----------|
| Homepage hero H1 (`HeroC`) | serif | 600 | `clamp(30px, 4vw, 46px)` | 1.12 | −0.018em |
| Inner-page hero H1 (`.hero h1`) | serif | 500 | `clamp(30px, 3.8vw, 44px)` | 1.08 | −0.02em |
| Section H2 (`.h2-serif`) | serif | 500 | `clamp(26px, 3vw, 34px)` | — | −0.01em |
| Card title (`.scard .t`) | serif | 600 | 19px | 1.25 | — |
| Homepage subtitle (`HeroC p`) | serif | 500 | `clamp(17px, 2vw, 21px)` | 1.42 | — |
| Hero lead (`.hero .lead`) | sans | 400 | 16px | 1.6 | — |
| Prose body (`.prose`) | sans | 400 | 15.5px | 1.72 | — |
| Card description (`.scard .d`) | sans | 400 | 13.5px | 1.5 | — |
| Nav link | sans | 500 / 600 active | 14px | — | — |
| Kicker (`.kicker`) | mono | 600 | 11px | — | 0.14em, uppercase |
| Breadcrumbs (`.crumbs`) | mono | 400 | 11px | — | — |
| Fact number (`.fact-num`) | serif | 600 | `clamp(34px, 3.4vw, 42px)` | 1 | — |
| Founding tag (`ЗАСН. 1931`) | mono | 400 | 10px | — | 0.12em |

`.prose` headings: H2 serif 24px, H3 serif 19px; the first `<h1>` in prose is
hidden because the hero already renders the page title.

---

## 4. Spacing & layout
[verified: Read global.css + visual-extract]

- **Container:** `--wrap` = 1320px; `.wrap` padding `0 24px`, centered.
- **Section rhythm:** `.section` = `60px 0`; `--white` = white; `--muted` =
  `--muted` bg + 1px `--line` top border.
- **Heroes:** breadcrumb hero `30px 0 40px`; homepage hero `64px 0 56px`.
- **Header:** sticky, 84px tall; utility bar 34px. **Footer:** `56px 0 26px`.
- **Grid:** `.grid` gap 16px; `--auto` = `repeat(auto-fit, minmax(300px,1fr))`
  (`-sm` 280px, `-lg` 380px).
- **Radius scale:** 2px (focus) · 3px (cards, rows) · 6px (buttons, icon
  buttons) · 8px (placeholder) · 12px (news-card, hero-emblem).
- **Max-widths:** prose 820px · hero lead 640px · hero content 860px · subtitle
  720px · search dialog 860px · mobile drawer `min(340px, 86vw)`.
- **Breakpoints:** 900px (desktop nav ⇄ mobile drawer; footer 1-col) · 640px
  (utility labels → icons) · 560px (footer 2-col; facts stack).

---

## 5. Components
[verified: Read global.css + visual-extract]

| Component | Spec |
|-----------|------|
| **`.btn-navy`** (primary button) | Inline-flex pill, `12px 22px`, radius 6px, 13.5px/600, gap 9px; navy → `--navy-d` on hover (160ms) |
| **`.link-underline`** (text CTA) | 14px/600 navy with 1px navy underline; gap 7→11px on hover; focus-visible 2px navy outline, offset 4px |
| **`.scard`** (showcase card) | Column, 24px, 1px `--line`, radius 3px, white; hover border → navy; serif title 19px/600, sans desc 13.5px `--ink2`; SVG icons navy |
| **`.news-card`** | Base inline in `novyny/index.astro` (radius 12px); `global.css` adds hover: navy border + `0 8px 22px rgba(30,58,95,0.08)` |
| **`.rows`** (document/link rows) | 1px `--line` container, radius 3px; rows gap 18px, `17px 22px`, divided; hover `--muted2`; title 15px/600, desc 13px `--ink2`, URL mono 12px navy |
| **`.hero`** (breadcrumb band) | `--muted` bg, 1px `--line` bottom; crumbs + optional kicker + serif H1 + lead |
| **`HeroC`** (homepage classic, default) | Centered, max-width 860px; serif H1, navy serif subtitle, gold 36×2px rule + italic founding line, link-underline CTAs, fact cluster; wheat-field SVG bg at 0.06 opacity |
| **`.placeholder`** | 1px **dashed** `--line`, radius 8px, padding `48px 32px`, centered `--ink3` |
| **`.prose`** | max-width 820px, 15.5px/1.72 `--ink2`; serif headings; navy links with soft underline |
| **`.kicker`** | mono 11px/600, 0.14em, uppercase, navy (`--muted` variant `--ink3`) |
| **Header / utility bar** | Utility bar `--navy-deep`, 34px (hero-switch on homepage, HC toggle, UA/EN). Header sticky, `rgba(255,255,255,0.96)` + `blur(8px) saturate(180%)`, 1px `--line` bottom, 84px; emblem + serif wordmark |
| **Footer** | `--navy-deep`, 3px **gold** top border; identity rail + 3-col links; gold 20×2px tick under heads; mono heads `rgba(255,255,255,0.62)`; links `0.78` → `#fff` + `translateX(3px)` |
| **Search overlay / mobile drawer** | Scrim `rgba(10,20,35,0.55)`; white dialog with `naasDrop`; serif 22px input; row underline navy → gold on focus; drawer `min(340px,86vw)` with focus trap |

**Box-shadow vocabulary** (sparse, navy-tinted): card/news hover
`0 8px 22px rgba(30,58,95,0.08)`; hero-emblem `0 18px 46px rgba(14,31,53,0.22)`;
search dialog `0 14px 50px rgba(0,0,0,0.2)`; drawer `-12px 0 40px rgba(0,0,0,0.18)`.

---

## 6. Motion
[verified: Read global.css:35-53 + visual-extract]

- **Durations:** 140ms (rows bg, hero-opt) · 150ms (footer links) · 160ms (cards,
  buttons, link gap, news-card, search row) · 200ms (search dialog, drawer drop).
- **Keyframes:** `naasFade` (opacity 0→1, scrims); `naasDrop` (opacity +
  `translateY(-10px)` → settle, dialogs/drawer).
- **Smooth scroll** on `<html>`, reset to `auto` under reduced motion.
- **`prefers-reduced-motion: reduce`** near-eliminates all animation/transition
  and disables smooth scroll. Honor it — never bypass.

---

## 7. Accessibility
[verified: Read global.css + visual-extract; Base.astro skip-link]

- **Focus:** `:focus-visible` = 2px `currentColor` outline, offset 2px (surface-
  adaptive: navy/ink on light, white/gold on dark). `.link-underline` = 2px navy,
  offset 4px. Search row shifts underline navy → gold on `:focus-within`.
- **Skip link** (`Base.astro`): off-screen, appears on focus, jumps to `#main`.
- **High-contrast mode:** `html[data-hc="true"]` desaturate + boost contrast,
  user-toggled.
- **Gold text rule:** only `--gold-ink` for text (AA); `--gold` is decoration.
- **Reduced motion:** full media-query block (see §6).
- **`::selection`** = navy bg, white text.
- **Controls:** icon-only controls carry `aria-label`; util labels collapse to
  icons ≤640px but keep names via `aria-label`; nav uses weight + gold underline
  for `aria-current`. Mobile drawer & search trap focus, restore on close, close
  on Escape.

---

## 8. Decorative motif — the field-contour rule
[verified: Read global.css:72-74; visual-extract of FieldRule.astro/HeroC]

The single signature graphic is a **stylized wheat-field horizon**:

- **`FieldRule.astro`** — SVG `viewBox 0 0 1320 26`, navy stroke width 1, two
  quadratic curves (`M0 16 Q660 5 1320 16` at 0.5 opacity; `M0 21 Q660 10 1320 21`
  at 0.32). Used as the `.sect-rule` divider between sections (height 20px,
  opacity 0.55, margin-bottom 30px).
- **`HeroC` background** — five stacked navy contour curves at 0.06 opacity plus
  **one gold accent curve** behind the centered hero.
- **Gold is the single recurring accent gesture** — 3px footer border, ticks,
  the founding-line rule, active-nav underline. Use gold sparingly, as a line,
  never as a fill or text.
- **Opacity ladder** sets hierarchy: decorative strokes 0.06–0.55; white-on-navy
  text layered at 0.92 / 0.85 / 0.82 / 0.78 / 0.62 / 0.4 / 0.3.

---

## 9. Bilingual system (UA / EN)
[verified: grep Base.astro:24-25 (localStorage 'naas-lang'); visual-extract of T.astro/i18n.ts]

- **Scope: chrome only.** Navigation, labels, footer, and search UI are
  bilingual; **body / article content is Ukrainian only.**
- **Mechanism:** `<T k="..." />` looks up `STRINGS[k]` in `src/lib/i18n.ts` and
  emits *both* variants inline: `<span class="t-uk">…</span><span class="t-en">…</span>`.
  `global.css` toggles visibility — `.t-en { display:none }` by default;
  `html[data-lang="en"]` swaps them.
- **Default = Ukrainian** (`lang="uk"`, no `data-lang`). Language is stored in
  `localStorage` key `naas-lang` and applied to `<html data-lang>` before paint
  to avoid flash; the utility-bar toggle also sets `document.documentElement.lang`
  and `aria-pressed`, and swaps the search placeholder (`data-ph-uk`/`data-ph-en`).
- **Rule:** any new chrome string must be added in **both** languages via
  `i18n.ts` — and the EN must read as a peer institution would, not as a literal
  translation (see voice doc §6, and audit findings on EN drift).

---

## 10. Voice & tone (summary)

Full spec: **[`brand-voice-messaging.md`](./brand-voice-messaging.md)**.

NAAS is a **state, self-governing scientific organization** — the
scientific-methodological and coordination centre for Ukraine's agro-industrial
complex. The voice carries that authority without sounding bureaucratic or
promotional.

**Five traits:** Authoritative (not pompous) · Precise (not jargon-bound) ·
Civic (not bureaucratic) · Forward-looking (not utopian) · Steady (not detached).

**Avoid:** self-superlatives ("найкращий / провідний / вища … установа" used as
boast), hype ("революційний / трансформує ринок"), bureaucratic fog
("здійснює забезпечення", nominalizations), stray exclamation marks, and EN that
reads as translated officialese. Use **НААН** (never legacy УААН / "Uaan").

---

## 11. Known gaps & reserved tokens
[verified: visual-extract notes + grep of global.css]

- `--line2` (`#E7E5E0`) and `--gold-soft` are **declared but unused** — reserved.
- Header/footer specifics are inline in their components, not `global.css`
  (see top note).
- No `.ico` favicon (PNG only); no standalone SVG logo (raster emblem + inline
  SVG fallback only).
- Several content/copy issues are tracked separately in
  **[`brand-audit.md`](./brand-audit.md)**.
</content>
