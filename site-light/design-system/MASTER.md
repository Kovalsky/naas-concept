# NAAS Light Portal — Design System (MASTER)

> **Source of Truth** for the **light** ("Наукова ясність" / Scientific Clarity) build of the
> National Academy of Agrarian Sciences of Ukraine (НААН) portal — `naas-portal-light`.
> This document codifies the design system that already lives in
> [`src/styles/tokens.css`](../src/styles/tokens.css) + [`src/styles/global.css`](../src/styles/global.css)
> and the component layer. It is **descriptive of what is built** and **prescriptive for what comes next**.
>
> When building or editing any page/component, read this file first. If a page-specific override exists in
> [`pages/`](./pages/), its rules take precedence (see [§11](#11-page-overrides)).
>
> Companion file: [`tokens.css`](./tokens.css) — the live primitives plus the additive scale tokens this
> document references (reference layer; see [§10](#10-adoption--migration)).
>
> **Relationship to the gravitas build:** light shares the *same brand DNA* — navy `#1E3A5F` / gold
> `#B8860B`, the Lora + Inter + JetBrains Mono three-font system, and a 1320px grid. It is **not** a
> restyle; it is a *lighter, flatter expression*: navy used sparingly (accent / wash / footer), gold as
> thin rules and dots only, hairline borders instead of shadows, more whitespace.

---

## 1. Product framing

| Dimension | Value |
|---|---|
| **Type** | Government / institutional / academic portal (state research academy, est. 1931) |
| **Audience** | Researchers, institutes, civil servants, journalists, the public — broad, all-ages, all-abilities |
| **Job** | Authoritative wayfinding to structure, transparency data, news, documents, and contacts |
| **Tone** | Sober, trustworthy, scholarly, heritage. *Not* marketing, *not* trendy |
| **Design language** | **"Наукова ясність"** (Scientific Clarity): flat, airy, hairline. Navy = accent / wash / footer only; gold = thin rules / dots / tags only; Lora 500 display · Inter body · JetBrains Mono labels ([`global.css:1-5`](../src/styles/global.css)) |
| **Pattern** | Institutional gateway: breadcrumb heroes, card/list directories, document registries |
| **Languages** | Ukrainian (default, `lang="uk"`) + English *chrome* toggle (`data-lang`); **body content stays Ukrainian** |
| **Stack** | Astro 5 static output → Cloudflare Pages (`naas-portal-light`). No CSS framework; hand-rolled tokens + scoped/inline styles. **Fonts self-hosted via `@fontsource` (no external CDN).** |

**Best-practice cross-check** (UI/UX Pro Max → *"Accessible & Ethical"* style for government/education):
high contrast, 16px+ base, visible focus rings, keyboard nav, reduced-motion, ~44px touch targets,
conservative navy/grey palette, **avoid** ornate decoration, low contrast, gratuitous motion, and AI
purple/pink gradients. The current build aligns with all of these (see [§8](#8-accessibility-standards-baseline--already-met-keep-it)); the few exceptions are tracked in [§9](#9-known-inconsistencies--recommendations).

---

## 2. Design principles

1. **Clarity over flair.** Restraint signals trust. One primary action per view; navy and gold are *earned*, never decorative filler.
2. **Flat and hairline.** Separation comes from 1px `--line` borders and whitespace, **not** shadows. The entire build uses only **two** box-shadows, both on overlays ([§6.2](#62-elevation-shadow-scale)). Do not add elevation to cards.
3. **Serif for voice, sans for utility, mono for metadata.** The three-font system is the brand. Don't add a fourth family.
4. **Navy is the accent, not the canvas.** Navy fills only chrome (util bar, footer, V3 hero) and primary controls; gold is reserved for thin rules, the 5px division dots, and small AA-safe text (`--gold-ink`).
5. **Documents are first-class.** Registries, PDFs and external links get real components (`.rows` / `.fmt-tile` / `RegistryList`), not afterthoughts.
6. **Accessible by construction.** Every colour pair, focus state, and the bilingual + high-contrast chrome are part of the baseline, not a retrofit.
7. **No dead links.** Navigation is sourced from `src/lib/site.ts` so menus, footer, cards and search stay in sync.
8. **The grid is the system.** Prefer the canonical scales below over fresh magic numbers.

---

## 3. Colour

### 3.1 Primitive tokens (as built — `tokens.css :root`)

| Token | Hex / value | Role |
|---|---|---|
| `--canvas` | `#FFFFFF` | Page background, cards |
| `--muted` | `#F8F9FA` | Section/hero background (cool grey) |
| `--muted2` | `#F2F1EC` | Image placeholders, warm grey wash |
| `--ink` | `#0A0A0A` | Primary text, headings |
| `--ink2` | `#525252` | Body / secondary text |
| `--ink3` | `#6B6B6B` | Captions, meta, tertiary (**lightest text allowed**) |
| `--line` | `#E5E5E5` | Borders, dividers (cool) |
| `--line2` | `#ECEBE7` | Borders (warm) |
| `--navy` | `#1E3A5F` | **Primary** brand: links, buttons, active states, kickers, accent rails |
| `--navy-d` | `#142844` | Primary hover/pressed |
| `--navy-deep` | `#0E1F35` | Util bar, footer & V3 hero surface (dark) |
| `--gold` | `#B8860B` | **Accent**: thin rules, division dots, file badges (non-text) |
| `--gold-light` | `#E7C879` | Gold on dark (kickers, focus ring on navy chrome) — ~10:1 on navy |
| `--gold-ink` | `#8A6508` | **AA-safe gold for small text** (~5:1 on white) |

> Light's live `:root` is already a step ahead of gravitas: it ships `--gold-light`, `--gutter`, and the
> radius tokens (`--r-card`/`--r-btn`/`--r-pill`) as real, used variables.

### 3.2 Semantic mapping

Bind to these when reasoning about a new surface (see [`tokens.css`](./tokens.css) for the aliases).

| Semantic | → primitive | Notes |
|---|---|---|
| `--color-bg` | `--canvas` | App background |
| `--color-surface` | `#FFFFFF` | Cards, sheets, header |
| `--color-surface-muted` | `--muted` | Sectioned regions |
| `--color-surface-dark` | `--navy-deep` | Util bar, footer, V3 hero |
| `--color-text` / `-secondary` / `-tertiary` | `--ink` / `--ink2` / `--ink3` | Primary / body / meta |
| `--color-on-dark` | `rgba(255,255,255,0.72)` | Body text on navy chrome |
| `--color-primary` / `-hover` | `--navy` / `--navy-d` | Interactive |
| `--color-accent` | `--gold` | **Non-text accent only** |
| `--color-accent-text` | `--gold-ink` | Gold used as small text |
| `--color-accent-on-dark` | `--gold-light` | Gold on navy |
| `--color-focus-ring` / `-on-dark` | `--navy` / `--gold-light` | Focus outline (see [§8](#8-accessibility-standards-baseline--already-met-keep-it)) |

### 3.3 Off-token colours found in the codebase

These exist in components today but are **not** in `:root`. Promote them (names in [`tokens.css`](./tokens.css) §promoted) so they're themeable and consistent.

| Value | Where | Meaning | Recommended token |
|---|---|---|---|
| `#1F7A4D` | `RegistryList.astro:7` | XLS/XLSX badge (spreadsheet = green) | `--filetype-sheet` |
| `#737373` | `RegistryList.astro:8` | PNG/JPG badge grey (≠ `--ink2`/`--ink3`) | `--filetype-img` |
| `#525252` | `RegistryList.astro:18` | Badge fallback (= `--ink2` value, hardcoded) | use `--ink2` |
| `#B3261E` | `kontakty.astro:141` | Form error text — **only red in the build** | `--danger` |
| `#2C3E54` | `PresidiumRow.astro:35`, `naan-sohodni.astro:135` | Placeholder-avatar gradient start (navy tint) | `--navy-tint` |
| `#16314F` | `HeroSlider.astro:16` | Hero SVG gradient stop (navy tint) | `--navy-hero` |
| `#EEF1F5` | `EResources.astro:38` | E-resource icon-chip background | `--icon-chip` |
| `#C4C4C4` | `AttestationTiles.astro:37`, global `.card-lift` | Card/tile hover border | `--color-border-hover` |
| `#FFF` (×21) | Header/Footer/cards/heroes | White surface/text on dark | `--surface` / keep `#fff` on dark |
| `rgba(30,58,95,0.07)` | `struktura.astro:81` | Navy @7% chip wash | `--navy-wash-07` |
| `rgba(30,58,95,0.30)` | `kontakty.astro:128` | Navy @30% link underline | `--navy-wash-30` |
| `rgba(10,20,35,0.55 / 0.45)` | `Header.astro:143-144` | Overlay scrims | `--scrim` / `--scrim-soft` |

**File-badge palette** (`RegistryList.astro:5-9`): PDF `--gold`, DOC/DOCX `--navy`, XLS/XLSX `#1F7A4D`,
images `#737373`, fallback `--ink2`. *(These live in a TS map / inline SVG attrs where CSS `var()` can't be
used directly — promote the values, but they'll stay as JS constants.)*

### 3.4 Contrast (WCAG 2.1)

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `--ink` `#0A0A0A` | white | ~20:1 | AAA |
| `--ink2` `#525252` | white | ~7.8:1 | AAA |
| `--ink3` `#6B6B6B` | white | ~5.3:1 | AA (normal) |
| `--navy` `#1E3A5F` | white | ~11.5:1 | AAA |
| `--gold` `#B8860B` | white | ~3.25:1 | **Fails AA for text** → non-text/large only |
| `--gold-ink` `#8A6508` | white | ~5.0:1 | AA (normal text) |
| `--gold-light` `#E7C879` | `--navy` / `--navy-deep` | ~10:1 | AAA (gold on navy) |
| white | `--navy-deep` `#0E1F35` | ~16.6:1 | AAA |

**Rule:** never set body/meta text in raw `--gold`; use `--gold-ink` on light or `--gold-light` on navy.
`--ink3` is the lightest text allowed. (Light's `--ink3 #6B6B6B` is slightly darker than gravitas's
`#737373`, so it clears AA on `--muted` more comfortably.)

---

## 4. Typography

### 4.1 Families (self-hosted via `@fontsource` in `tokens.css`)

| Token | Stack | Use | Weights shipped |
|---|---|---|---|
| `--serif` | `'Lora', Georgia, serif` | Headings, hero, card titles, search input, prose headings | 400 / 500 / 600 |
| `--sans` | `'Inter', system-ui, …` | Body, navigation, UI labels (default `body` font) | 300 / 400 / 500 / 600 |
| `--mono` | `'JetBrains Mono', ui-monospace, monospace` | Kickers, meta, dates, file types, EDRPOU, numerals | 400 / 500 |

**Display weight is Lora 500** (not 600) — the lighter, airier voice. `.mono` sets
`font-feature-settings:"tnum"` ([`global.css:9`](../src/styles/global.css)); for numeric *columns* prefer an
explicit `font-variant-numeric: tabular-nums` (no component opts in today — see [§9](#9-known-inconsistencies--recommendations)).

### 4.2 Type scale (roles)

The codebase spans **~24 fixed px sizes + 8 fluid `clamp()` heads** — notable sprawl, especially the
half-px run (`9.5 · 10.5 · 11.5 · 12.5 · 13.5 · 14.5 · 15.5`). Consolidate toward these roles.

| Role | Size | Family / weight | Line-height | Source |
|---|---|---|---|---|
| `hero-v3` (home photo hero) | `clamp(34px, 5vw, 60px)` | serif 500 | 1.04 | `HeroSlider.astro:53` |
| `hero-v1` (typographic hero) | `clamp(32px, 5vw, 56px)` | serif 500 | 1.05 | `HeroTypographic.astro:34` |
| `page-h1` (interior hero) | `clamp(30px, 4vw, 50px)` | serif 500 | 1.06 | `global.css:102` |
| `h2` (section) | `clamp(26px, 3.2vw, 36px)` | serif 500 | 1.14 | `global.css:21` |
| `h2--lg` | `clamp(30px, 3.8vw, 44px)` | serif 500 | 1.08 | `global.css:22` |
| `h3` / sub-heading | 19–20px | serif 500 | 1.22 | `global.css:111` |
| `lead` | 16px (`clamp(16,1.7vw,18–19)` in heroes) | sans/serif | 1.55–1.62 | `global.css:23` |
| `body` | 15–16px (prose 16) | sans 400 | 1.6–1.72 | `global.css:107` |
| `body-sm` | 13.5–14.5px | sans | 1.5–1.6 | rows/cards |
| `caption` | 12–13px | sans | 1.5 | labels |
| `kicker` | 10px | mono 500 | — | `tokens.css` (.kicker/.eyebrow), 0.13em uppercase |
| `meta` | 10–11px | mono | — | 0.04–0.14em uppercase |

**Recommended numeric scale** (collapse the half-px run toward the nearest step):
`10 · 11 · 12 · 13 · 14 · 15.5 · 16 · 18 · 19 · 20 · 24` + the fluid heads above.

### 4.3 Rules

- **Base body ≥ 15px**; the contact form input is 15px with `min-height:46px` (avoids iOS auto-zoom risk; bump to 16px if zoom is observed). Search input is 22px serif.
- Line length: `.lead` caps at `62ch`; `.prose` at `760px`; hero leads at `52–56ch`.
- Kicker pattern: `.kicker` = mono · 10px · 500 · `letter-spacing:0.13em` · uppercase · `--navy`; `.eyebrow` / `.kicker--muted` = same in `--ink3`.
- Use **mono figures** for dates, years, counts, phone, EDRPOU; add `tabular-nums` for aligned columns.

---

## 5. Spacing & layout

### 5.1 Spacing scale (4px base — recommended canonical)

`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64 · 72`

Section rhythm: `.section { padding: 72px 0 }` → `48px` under 768px ([`global.css:12-16`](../src/styles/global.css));
consecutive sections get a hairline `border-top: 1px solid var(--line)`. Component gaps cluster at
16/18/20/22/24/26/32/48 — new work uses the scale above; normalise opportunistically (don't mass-rewrite
tuned components — see [§9](#9-known-inconsistencies--recommendations)).

### 5.2 Layout

| Token | Value | Meaning |
|---|---|---|
| `--wrap` | `1320px` | Max content width (`.wrap` adds `padding: 0 var(--gutter)`) |
| `--gutter` | `32px` (→ `18px` < 768px) | Horizontal page inset |
| `--section-y` | `72px` (→ `48px`) | Section vertical padding |

**Content-width caps** (distinct from breakpoints): prose `760px`, registry lead `680px`, article body
`820px`, search dialog `860px`, contact form `720px`, hero copy `52–56ch`.

### 5.3 Breakpoints (desktop-first, `max-width` only)

As-built scale: **`900` / `767` / `560`** (plus one stray `540` in `struktura.astro:98` → normalise to `560`).

| Breakpoint | Typical switch |
|---|---|
| `900px` | 3/4-col grids → 1–2 col; footer 4-col → 2-col; header nav ↔ drawer (`.only-desktop`/`.only-mobile` swap at `900px`, [`global.css:135-138`](../src/styles/global.css)) |
| `767px` | 2-col → 1-col; `--gutter` 32 → 18; section padding 72 → 48; hero `min-height` 580 → 480 |
| `560px` | final 2-col → 1-col; footer bottom-bar stacks |

> There is **no `min-width` query anywhere** — the build is purely desktop-first. Recommended systematic
> set going forward: **375 / 768 / 1024 / 1440** (introduce gradually; don't retrofit en masse).

**Grid patterns in use:** fixed `repeat(N,1fr)` (Stats 4, StructureCards 3, PresidiumRow 4) and
`repeat(auto-fill, minmax(280–320px, 1fr))` (struktura, prozorist, novyny). Standard gaps 16–22px.

---

## 6. Radius, elevation, z-index, motion

### 6.1 Radius

Light has a **clean radius system** — no 3px/12px sprawl. Live tokens cover it:

| Token | Value | Use |
|---|---|---|
| `--r-btn` | 4px | buttons, inputs, file badges (`.fmt-tile`), icon buttons |
| `--r-card` | 8px | cards, list containers (`.rows`), placeholders, image corners |
| `--r-pill` | 999px | pills, segmented control, demo badges |
| `--r-dot` | 50% | division dots, round monogram chips |

> Only off-scale value: `.nrow-img` uses a stray `6px` ([`Newsroom.astro:114`](../src/components/Newsroom.astro)) — normalise to `--r-card`.

### 6.2 Elevation (shadow scale)

The **entire build uses only two shadows**, both on Header overlays — the flat, hairline aesthetic is the point. **Do not add shadows to cards** (use border + `--color-border-hover` on hover).

| Token | Value | Use |
|---|---|---|
| `--shadow-overlay` | `0 14px 50px rgba(0,0,0,0.2)` | Search overlay (`Header.astro:145`) |
| `--shadow-drawer` | `-12px 0 40px rgba(0,0,0,0.18)` | Mobile drawer (`Header.astro:156`) |

### 6.3 Z-index scale (as built → tokenise)

| Token | Value | Layer |
|---|---|---|
| `--z-header` | 60 | Sticky header |
| `--z-drawer-scrim` | 90 | Mobile-drawer scrim |
| `--z-drawer` | 100 | Mobile drawer |
| `--z-search-scrim` | 110 | Search scrim |
| `--z-search` | 111 | Search dialog |
| `--z-skip` | 130 | Skip-link (`Base.astro:105`) — beats everything |

### 6.4 Motion

The build uses **only three durations and one easing** — keep it that tight.

| Token | Value | Use |
|---|---|---|
| `--motion-fade` | 150ms | Scrim fade (`@keyframes naasFade`) |
| `--motion-base` | 160ms | Hover micro-interactions (gap nudge, colour, background) |
| `--motion-enter` | 200ms | Panel entrance (`@keyframes naasDrop`) + card lift |
| `--ease` | `ease` | The only easing in the build |

**Always** honour `prefers-reduced-motion` — `tokens.css` already nukes animation/transition durations to
~0 and disables smooth scroll ([`tokens.css:44`](../src/styles/tokens.css)); Astro's `ClientRouter` auto-disables
view transitions under it. Animate `transform`/`opacity` only; never width/height/top/left.

---

## 7. Components

Every component is on-style when it: uses the token palette, has a visible hover **and** relies on the
global `:focus-visible` ring (don't strip it), uses inline SVG icons (`currentColor`/token strokes), and keeps
controls comfortably tappable. The shared classes below live in [`global.css`](../src/styles/global.css); the
named `.astro` components compose them.

### 7.1 Buttons (`.btn` family — `global.css:38-48`)
`.btn` = navy fill, white text, `--r-btn`, `padding 12px 22px`, 13.5px/600, gap 9px, hover → `--navy-d`
(`--motion-base`). Variants: `.btn--ghost` (transparent, 1px `--line`, hover `--muted`), `.btn--light`
(white fill, navy text — used on the dark V3 hero). **One primary CTA per view.** *(Height ≈ 37–38px — see [§9](#9-known-inconsistencies--recommendations).)*

### 7.2 Link — arrow (`.link-arrow` — `global.css:29-36`)
Navy text + 1px navy bottom-border, 13.5px/600; hover grows the icon gap `7→11px` (`--motion-base`). The
site's standard "read more / go to" affordance. The same gap-nudge pattern recurs in `.dcard-link`,
`.proz-arrow`, `.hero3-ghost`.

### 7.3 Card (`.card` / `.card-lift` — `global.css:51-55`)
White, 1px `--line`, `--r-card`; `.card-lift:hover` → `translateY(-2px)` + border `--color-border-hover`
(200ms). Flat — **no shadow**. Used by `FeaturePair`, `StructureCards` (`.dcard`), `EResources` (`.er`).

### 7.4 List rows + file badge (`.rows` / `.fmt-tile` — `global.css:78-89`)
Bordered container (`--r-card`, `overflow:hidden`), rows flex `gap 16px`, `padding 16px 20px`, 1px `--line`
separators, hover → `--muted` (`--motion-fade`+). `.fmt-tile` = 42×30 mono badge, `--r-btn`, white text,
colour by extension ([§3.3](#33-off-token-colours-found-in-the-codebase)). Consumed by `DocRows`, `RegistryList`.

### 7.5 Pills (`.pill` family — `global.css:67-75`)
Mono 10px/500, `0.08em` uppercase, `padding 4px 9px`, 1px border, `--r-pill`. `.pill--gold`
(`--gold-ink` text + gold border) and `.pill--navy` (navy text + navy border). **Colour always pairs with text.**

### 7.6 Breadcrumb hero (`.page-hero` + `PageHero.astro`)
`--muted` band with a faint diagonal hairline, bottom `--line`, `padding 30px 0 42px`. Mono `.crumbs`
(11px `--ink3`, separators `aria-hidden`), serif H1 `clamp(30px,4vw,50px)`/500 (`max-width:20ch`), optional
`.lead`, optional `.gold-rule` (48×2px). `PageHero` has **no scoped CSS** — pure global. Used on **16 pages**
and by `DocPage`. The hero owns the title; `.prose > h1:first-child` is hidden.

### 7.7 Home heroes — V3 (default) and V1
- **V3 `HeroSlider.astro` (`/`, default):** despite the name, a **static** photo/navy hero (no carousel JS).
  `.hero3` = `--navy-deep`, `min-height 580px` (480 mobile), decorative agrarian SVG (field lines + gold
  furrows) under a `linear-gradient` wash. Serif H1 `clamp(34px,5vw,60px)`/500 in white; `.hero3-kick` in
  `--gold-light`; CTAs = `.btn--light` (primary) + a ghost link. Credit line bottom-right (`aria-hidden`).
- **V1 `HeroTypographic.astro` (`/v1`):** light gradient (white → `--muted`) typographic hero, serif H1
  `clamp(32px,5vw,56px)` in `--ink`, gold rule, `.btn` + `.link-arrow` CTAs, faint navy/gold contour SVG.
- **`Hero.astro` + `config.HERO` are dead code** (no page imports `Hero.astro`; the two routes hard-select).
  `VariantSwitch.astro` is a **design-review affordance**, not production chrome — exclude it from the system.

### 7.8 Section + kicker (`.section` / `.sect-head` / `.h2`)
`.section--white` / `.section--muted` alternate; consecutive sections get a hairline top border. `.sect-head`
= kicker + serif `.h2` on the left, an "all →" `.link-arrow.only-desktop` on the right (mobile link below).
Division dots (`.dcard-dot`, 5px gold circle) and the mission rule (`border-left:2px var(--gold)`) are the
sanctioned gold accents.

### 7.9 Home content blocks (`HomeBody.astro`, identical for V1/V3)
In order: `Stats` (4-cell metric strip, 46px navy mono numerals, hairline column dividers) → `AboutBand`
(intro + gold-ruled mission aside) → `StructureCards` (division cards, gold dot + gap-nudge link) →
`Newsroom` (featured article + news list + announcements date-blocks + a "відділення" placeholder) →
`AttestationTiles` (numbered tiles with a 3px navy left rail, `--gold-ink` numerals) → `PresidiumRow`
(portrait grid, initials fallback avatar) → `DocRows` (numbered `.rows`, navy vs grey arrows for internal vs
external) → `FeaturePair` (two CTA cards) → `EResources` (3 external-resource cards, navy book icon).

### 7.10 Document page (`DocPage.astro`)
Composition wrapper: `PageHero` + `.section--white` > `.wrap` > `.prose` rendering a `pages` collection
entry, with a "Контент у процесі наповнення" fallback. No scoped CSS. Used by `rada-molodykh`,
`prozorist/dostup`, `prozorist/maynovi`.

### 7.11 Registry (`RegistryList.astro`)
Document registry: a `.rows` list where each row has a colour-coded `.fmt-tile` (extension text inside),
title, optional external note, size + year (mono), and a navy download / grey external SVG. Powers
`atestatsiia`, `prozorist/tendery`, and the `[slug]` registry pages.

### 7.12 Prose (`.prose` — `global.css:106-118`)
Markdown body: `max-width 760px`, 16px/1.72 `--ink2`. Serif 500 headings; first `h1` hidden (hero owns it);
links navy with a subtle underline; blockquote with a gold left border.

### 7.13 Placeholder (`.placeholder` + `.demo-badge`)
Dashed `#d6d4ce` border, `--r-card`, centred `--ink3`, with a `.demo-badge` (mono, `--gold-ink`, gold-tint
border, pill). Honest "у наповненні" empty state. *(The `Placeholder.astro` component itself is currently
unused — pages inline the markup; the `.demo-badge` also appears in `Newsroom`'s departments band.)*

### 7.14 Header (`Header.astro`)
- **Utility bar:** `--navy-deep`, `min-height 34px` — high-contrast toggle (`aria-pressed`, visible label) + UA/EN language toggle (`role="group"`, `aria-pressed`). Slogan desktop-only.
- **Main header:** sticky `z 60`, translucent white + `backdrop-filter saturate(180%) blur(8px)`, `min-height 80px`, bottom `--line`. Emblem 56px + serif wordmark + mono "ЗАСН. 1931". Desktop nav 14px (active = navy 600 + 2px gold `.nav-mark` underline). Search + menu controls are true **44×44 `.icon-btn`s**.
- **Search overlay:** scrim `z 110` + dialog `z 111` (`role="dialog" aria-modal`), drops from top (`naasDrop`), serif 22px input, live title filter over `SEARCH_INDEX` + news. **Focus-trapped, ESC closes, focus restored** to trigger. Focus affordance = the row underline shifting `--navy`→`--gold` on `:focus-within`, **plus** an explicit `:focus-visible` navy ring on the input (added 2026-06-27, [§9](#9-known-inconsistencies--recommendations) #1).
- **Mobile drawer:** right sheet `min(340px,86vw)`, scrim `z 90` / panel `z 100`, focus-trapped, 16px rows ≈ 46px.

### 7.15 Footer (`Footer.astro`) + `Partners`
`--navy-deep` surface, white-alpha text. Emblem + wordmark + address (mono tel/email/EDRPOU), 3 link columns
(4-col → 2-col @900 → 1-col @560), bottom bar with © + sitemap. `Partners` = sober official state-portal links
(no marketing styling), full-width band above the footer.

---

## 8. Accessibility standards (baseline — already met; keep it)

- **Contrast:** all text ≥ AA ([§3.4](#34-contrast-wcag-21)). Never use raw `--gold` for text.
- **Focus (strong):** a single global `:focus-visible` ring — `outline: 2px solid var(--navy); outline-offset: 2px`
  on every interactive role ([`global.css:126-128`](../src/styles/global.css)) — **with a dark-chrome override** so
  the ring stays visible on navy: `.util / .foot / .hero3 :focus-visible { outline-color: var(--gold-light) }`
  (`global.css:130`). This is cleaner than per-component focus styling — preserve it.
- **Skip link:** `Перейти до основного вмісту` → `#main`, reveals on focus (`Base.astro:99,105-106`).
- **Keyboard:** focus trap + ESC + focus-restore in both search and drawer dialogs (`Header.astro:183-212,265`); tab order matches visual order.
- **Icon-only controls** carry `aria-label` (search, menu, close, drawer-close); toggles carry visible text + `aria-pressed` + a wrapping `role="group"`.
- **Headings:** exactly one `<h1>` per page (hero or `PageHero`); section landmarks use `aria-labelledby`; no skipped levels.
- **Images:** meaningful images have real alt (emblem, portraits = person name); decorative thumbnails use `alt=""`; all decorative SVG/dots/rules are `aria-hidden`.
- **Reduced motion:** blanket kill-switch in `tokens.css` covers `naasDrop`/`naasFade`, hover transitions, and (via Astro) `ClientRouter`.
- **Colour is never the only signal:** file badges pair colour with the extension text; pills carry mono text; active nav pairs colour + weight + a gold underline; form status uses an `aria-live` text region.
- **High-contrast mode:** `html[data-hc="true"] { filter: saturate(0) contrast(1.2) }`, toggle persisted, applied pre-paint.
- **Bilingual chrome:** `<T>` renders both UA/EN; CSS shows the active one; language persisted + applied pre-paint to avoid FOUC.
- **Viewport allows zoom:** `width=device-width, initial-scale=1` (no `maximum-scale`/`user-scalable`).
- **Contact form:** every field has a `<label for>`, `required`, semantic `type`/`inputmode`/`autocomplete`, and an `aria-live="polite"` status region.

---

## 9. Known inconsistencies & recommendations

> **Remediation pass — 2026-06-27.** A targeted pass fixed the highest-leverage items: a build-time
> **image pipeline** ([§9.1](#91-performance--build)), the **`<html lang>`** correctness bug, the **search
> focus ring**, **`aria-current`** on nav/drawer/breadcrumb, **mono 600/700** webfonts (no more synthetic
> bold), **contact inputs → 16px**, **`scroll-margin`** for anchors/skip-link, and **`/img` + `/docs` cache
> headers**. Rows marked ✅ are done; ◑ partial; ☐ still open.

| # | Issue | Action / recommendation | Status |
|---|---|---|---|
| 1 | Search input stripped its outline (`Header.astro:152`) | Added `.search-row input:focus-visible` navy ring | ✅ Fixed |
| 2 | `<html lang>` flipped to `en` over Ukrainian body | Root stays `lang="uk"`; `<T>` chrome spans now carry `lang="en"`/`"uk"` (`T.astro`, `Header.astro`, `Base.astro`) | ✅ Fixed |
| 3 | Nav active state not programmatic; drawer had none | `aria-current="page"` + `.drawer-a.active` on nav, drawer, breadcrumb | ✅ Fixed |
| 14 | Mono weight 600/700 synthesised (only 400/500 loaded) | Imported `@fontsource/jetbrains-mono/600` + `/700` | ✅ Fixed |
| 4 | Sub-44px targets: util toggles, nav/footer links, VariantSwitch pills, `.btn` ~37–38px | Contact input → 16px done; **util/nav/footer controls still < 44/24px** | ◑ Partial |
| 5 | News-index titles are `<span>` not headings (`novyny/index.astro`) | Use `<h3>` for SR list navigation | ☐ Open |
| 6 | Form errors one global message; `novalidate`, email unchecked | Per-field `aria-describedby`/`aria-invalid`, email regex, focus-to-error | ☐ Open |
| 7 | High-contrast = greyscale filter, not a theme | Real `html[data-hc]` token theme (darker ink, heavier borders, kept accents) | ☐ Open |
| 8 | Off-token colours (`#1F7A4D`, `#B3261E`, `#2C3E54`, `#16314F`, `#EEF1F5`, `#C4C4C4`, navy washes, `#fff`) | Promote to tokens ([§3.3](#33-off-token-colours-found-in-the-codebase) / [`tokens.css`](./tokens.css)) | ☐ Open |
| 9 | Font-size sprawl (~24 fixed + clamps; half-px run 9.5–15.5) | Collapse to the [§4.2](#42-type-scale-roles) scale | ☐ Open |
| 10 | Stray breakpoint `540px` (`struktura.astro:98`) | Normalise to `560` | ☐ Open |
| 11 | Mono numerals lack `tabular-nums` (Stats, registries, dates) | Add `font-variant-numeric: tabular-nums` | ☐ Open |
| 12 | Inline-style hotspots (`novyny/index`, `naan-sohodni` doc rows) | Extract a `NewsCard` / `.rows` variants | ☐ Open |
| 13 | "WEB" fmt-tile white on `--gold` ~3:1 (`naan-sohodni.astro:122`) | Use `--navy` / `--gold-ink` background | ☐ Open |
| 15 | Overlays don't make background `inert` / lock scroll (`Header.astro`) | Toggle `inert` on page wrappers + body scroll-lock while a panel is open | ☐ Open |
| 16 | Inter weight 300 imported but unused (`tokens.css`) | Remove the `@fontsource/inter/300` import | ☐ Open |
| 17 | `.prose` measure ~85–90ch (`global.css:107` `max-width:760px`) | Cap ~68ch (use `ch`, like `.lead`) | ☐ Open |
| 18 | VariantSwitch demo toggle + `/v1` route ship to production | Gate behind an env flag or strip from prod | ☐ Open |
| 19 | External `target="_blank"` links give no "new tab" cue | Off-screen "(opens in new tab)" span / `aria-label` suffix | ☐ Open |
| 20 | 12 ad-hoc `rgba(255,255,255,a)` on-dark values, no token | Collapse to ~3 text + 1 border on-dark tokens; audit `0.5`/`0.66` for AA | ☐ Open |
| 21 | Arrow SVG copy-pasted across 9 files (14↔15px drift) | Extract one `<Icon name="arrow"/>` | ☐ Open |

### 9.1 Performance & build (added 2026-06-27)

News/anonsy/person photos were shipped raw from the shared `public/img` library (PNGs to ~1 MB, one anonsy
JPG 2.4 MB) and reused full-res even for 64px thumbnails. Fixed by [`src/lib/images.ts`](../src/lib/images.ts):
an `import.meta.glob` over the shared photo tree — reached via the repo-level `site` symlink, *outside*
`public/` so `astro:assets` optimises it — resolved by the `/img/...` data path → `<Image format="webp">`
with responsive `widths`/`sizes`. Results: `art8965.png` 1.03 MB → 22–284 kB webp variants;
`seminar-aspok.jpg` 2.4 MB → 17–494 kB. The article hero (LCP) is now `loading="eager" fetchpriority="high"`;
below-fold images stay `lazy`. OG / JSON-LD keep the raw `/img/...` string (served by `public/img`).
The glob is scoped to `{news,anonsy,persons}` — a corrupted file under `img/sections/` fails metadata
extraction, so don't widen it without filtering.

**Remaining perf items:** preload the LCP display font (Lora 500); ship a resized emblem + a dedicated
1200×630 OG image; the unreferenced raw `/img/news` originals are still copied into `dist/` by the public
passthrough (harmless, prunable once nothing references the strings).

> **Process note (project memory):** light's pixel output is carefully tuned. Fonts are **self-hosted**
> (`@fontsource`), so there is no Google-Fonts CDN hang — but before asserting any responsive/overflow
> issue, still verify with the same-origin **iframe probe** (not a headless `--screenshot`), and use the
> threaded server. Don't mass-rewrite tuned components to "fix" the scales above without verifying the
> rendered result.

---

## 10. Adoption / migration

Unlike gravitas, light's primitives (`src/styles/tokens.css`) are **already live and imported** — they
ship the palette, fonts, `--wrap`/`--gutter`, and the radius tokens. This `design-system/tokens.css` is a
**reference layer** that mirrors those primitives *and* adds the scale tokens MASTER references
(`--space-*`, `--shadow-*`, `--z-*`, `--motion-*`, type-scale `--fs-*`, semantic aliases, promoted
off-token colours). **It is not imported** — wiring it in changes nothing visually because the additive
variables are unused until a component references them.

Suggested rollout (each step independently verifiable, zero forced visual change):
1. Append the **additive** blocks from `design-system/tokens.css` into the live `src/styles/tokens.css` (or `@import` the reference file). No-op visually.
2. Replace one off-token literal with its new token (e.g. `#B3261E` → `--danger` in `kontakty.astro`); verify with the iframe probe; commit.
3. Repeat per value/component. Tackle the a11y items ([§9](#9-known-inconsistencies--recommendations) #1–#7) as standalone fixes.

---

## 11. Page overrides

Pages that legitimately deviate from MASTER document the delta in [`pages/<page>.md`](./pages/).

> Read `MASTER.md`. Then check `pages/<page-name>.md` (named after the route). If it exists, **its rules
> override** MASTER for that page. If not, MASTER governs exclusively.

Current documented overrides: see [`pages/`](./pages/) — `kontakty` (contact cards + inquiry form),
`naan-sohodni` (Presidium leadership layout), `struktura` (institution directory cards).

---

## 12. Anti-patterns (do not do)

- ❌ Emoji as icons — use inline SVG (`currentColor` / token strokes).
- ❌ Raw `--gold` for body/meta text (fails AA) — use `--gold-ink` (light) or `--gold-light` (navy).
- ❌ A fourth font family, or display/decorative fonts.
- ❌ **Shadows on cards** — the system is flat; separate with borders + whitespace.
- ❌ Navy as a page canvas — navy is accent/chrome only.
- ❌ Ornate effects, heavy gradients, parallax, AI purple/pink gradients.
- ❌ Removing focus rings (esp. the global `:focus-visible`); hover-only affordances; colour-only meaning.
- ❌ New magic numbers/colours/breakpoints when a scale token fits.
- ❌ Hardcoded nav/footer links — source them from `src/lib/site.ts`.
- ❌ Disabling zoom / fixed-px container widths / horizontal scroll on mobile.
- ❌ Marketing tone, exclamation CTAs, "sign up" energy — this is a state institution.
