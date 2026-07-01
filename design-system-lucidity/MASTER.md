# NAAS Portal — "Lucidity" Design System (MASTER)

> **Source of Truth** for the **Lucidity** identity — *luminous clarity* — of the National Academy of Agrarian
> Sciences of Ukraine (НААН) portal — an editorial / scientific-journal take on the
> institution. This document codifies the system that lives in the reference build
> [`../v3-hybrid.html`](../v3-hybrid.html) and is expressed as tokens in
> [`tokens.css`](./tokens.css). It is **descriptive of what is built** and
> **prescriptive for what comes next**.
>
> When building or editing any page/component in this system, read this file first, then
> the companion [`components.md`](./components.md) (per-component anatomy · tokens · states ·
> variants). Build with **tokens, never raw hex/px** — the only place literal hex lives is
> the primitive layer of `tokens.css`. Use the **exact** token names below
> (`--color-*`, `--btn-*`, `--chip-*`, `--r-*`, `--fs-*`, `--space-*`, `--motion-*`).
>
> This is a **self-contained, third** system. It does **not** modify `site/` (gravitas) or
> the light system; see [§9](#9-relationship-to-gravitas--light). Companion files:
> [`tokens.css`](./tokens.css) · [`tokens.json`](./tokens.json) · [`components.md`](./components.md) ·
> [`README.md`](./README.md).

---

## 1. Product framing

| Dimension | Value |
|---|---|
| **Type** | Government / institutional / academic portal (state research academy, est. 1931) |
| **Identity** | *Lucidity* (luminous clarity) — the **same institutional navy depth as gravitas, held clear and legible rather than heavy**: hairline order, data-precision, restraint. Editorial / scientific-journal in feel — photo-led, catalog-minded, data-forward. The expressive sibling of gravitas, not a replacement |
| **Audience** | Researchers, institutes, civil servants, journalists, the public — and explicitly **international R&D / investment partners** (the build foregrounds an English-chrome partnership narrative) |
| **Job** | Authoritative wayfinding (structure, news, publications, contacts) **plus** a confident first impression — heritage + scientific output rendered as catalog and map |
| **Tone** | Sober, trustworthy, scholarly, heritage — *with editorial confidence*. The photo hero and journal spines carry warmth; restraint still governs. *Not* marketing, *not* trendy |
| **Pattern** | Photo hero → mono stat ribbon → division cards → partner narrative → news/events → journal catalog → Ukraine map → presidium → newsletter/contact → footer |
| **Languages** | Ukrainian (default) + English chrome (kickers, CTAs, partner copy); `lang="uk"` with `data-lang` UA/EN toggle |
| **Stack** | Static HTML reference today (Tailwind CDN + inline styles in the build); the **canonical layer is `tokens.css`**. A future app (`site-lucidity/`) would consume these foundations. Target domain `naas-portal-lucidity` *(proposed)* |

**Best-practice cross-check** (UI/UX Pro Max → *"Accessible & Ethical"* for government/education):
high contrast, ≥14px chrome / readable body, visible focus rings, keyboard nav, reduced-motion,
44px touch targets, conservative navy/wheat palette, **avoid** ornate decoration, low contrast,
gratuitous motion, and AI purple/pink gradients. The Lucidity build aligns — its one expressive
liberty (a photo hero) is disciplined by a fixed navy-multiply overlay so text stays legible.

---

## 2. Design principles

1. **Photo carries warmth; the overlay carries trust.** The hero is a real field photo under a fixed navy-multiply overlay (`--hero-overlay`). The image is allowed to be emotional; the overlay guarantees legibility and keeps the institution sober.
2. **Authority over flair.** One primary action per view; accents are earned, not decorative. Wheat appears only where it means something (CTA fill, audience dots, active underline).
3. **Serif for voice, sans for utility, mono for data.** The three-font system *is* the brand. Mono is load-bearing here — the 56px stat ribbon, DOIs, dates, and map labels are all `--mono`. Don't add a fourth family.
4. **Science is the content; render it as catalog.** Journals get cover spines, institutes get a map, the presidium gets portrait monograms. Scientific output is first-class, not an afterthought list.
5. **Crisp, not soft.** Tighter radii (`--r-card` 8px / `--r-btn` 4px) and **flat border+lift hover** (no drop shadow) are the editorial signature — see [§6](#6-radius-elevation-motion-z-index). This is the single clearest visual difference from gravitas.
6. **Accessible by construction.** Every solid color pair meets WCAG AA at minimum (most hit AAA). Bilingual + high-contrast modes are baseline, not bolt-ons.
7. **The grid is the system.** Prefer the canonical scales below (`--space-*`, `--fs-*`, `--r-*`) over fresh magic numbers.

---

## 3. Color

The palette is the **same navy + wheat + ink** as gravitas (shared V3 lineage), re-expressed
with Lucidity-specific component aliases (hero overlay, journal spines, division gradients,
portrait monogram). Three layers: **primitive → semantic → component**.

> **Palette "B" (chosen 2026-06) — fit to the real NAAS emblem.** Navy stays primary, but the
> non-text accent is the **seal's bright gold** `--gold-500` (`#F0A818`, the official emblem's
> wheat) and a **teal secondary** `--color-secondary` (`--teal-700` `#0B6E80`, echoing the seal's
> frame) is added. Gold **text** still uses `--color-accent-text` (`--gold-700`) — bright gold is
> 2.04:1 on white, non-text only. Teal works as both text and fill (5.9:1). This warms Lucidity
> toward its real logo without abandoning navy. (The teal-primary option "C" was rejected.)

### 3.1 Primitive tokens (`tokens.css :root`, layer 1 — the only place hex lives)

| Token | Value | Role |
|---|---|---|
| `--navy-900` | `#0E1F35` | "deep" — footer, utility bar, newsletter floor, hero overlay anchor |
| `--navy-800` | `#142844` | "dark" — primary hover / pressed |
| `--navy-700` | `#1E3A5F` | **BASE brand** — links, buttons, active, kickers, stat numbers, map |
| `--navy-600` | `#2C3E54` | portrait-monogram gradient start |
| `--navy-500` | `#274059` | decorative navy gradient (catalog headers) |
| `--gold-700` | `#8A6508` | **AA-safe gold for small TEXT** (~5.3:1 on white) |
| `--gold-600` | `#B8860B` | **BASE wheat** — rules, dots, borders, icons, accent CTA fill (non-text) |
| `--gold-300` | `#E8C766` | decorative light gold (wheat motif / crest highlight) |
| `--gold-soft` | `rgba(184,134,11,0.10)` | gold tint fill |
| `--gold-line` | `rgba(184,134,11,0.30)` | gold border (event "Конференція" tag) |
| `--ink-900` | `#0A0A0A` | primary text, headings |
| `--ink-600` | `#525252` | body / secondary text |
| `--ink-500` | `#737373` | captions, meta, tertiary (**lightest text allowed**) |
| `--white` | `#FFFFFF` | page bg, cards, surfaces |
| `--grey-50` | `#F8F9FA` | "muted" — sectioned regions (cool) |
| `--grey-200` | `#E5E5E5` | "line" — borders, dividers (cool) |
| `--warm-200` | `#E7E5E0` | warm border / news-thumb base |
| `--grey-300` | `#CFCDC7` | news-thumb gradient end (warm grey) |
| `--grey-350` | `#C4C4C4` | card-lift hover border, scrollbar thumb |
| `--grey-400` | `#D4D4D4` | photo placeholder base |
| `--black-a55 / a15 / a04 / a03` | `rgba(0,0,0,.55/.15/.04/.03)` | placeholder label · hero fade · header scroll shadow · news-hatch |
| `--on-dark-90…08` | `rgba(255,255,255,.90→.08)` | white-alpha ramp for text/lines on navy; `--on-dark-50` is **decorative-only** (below AA for text) — see §3.4 |
| `--hero-stop-1/2/3` | `rgba(14,31,53,.72)` / `rgba(30,58,95,.55)` / `rgba(14,31,53,.78)` | navy-multiply hero overlay stops |
| `--hc-bg` / `--hc-fg` / `--hc-link` | `#000` / `#FFF` / `#FFFF00` | high-contrast mode |
| `--div-soil/plant/animal/vet/econ/innov` | linear-gradients | division-card photo placeholders, color-coded per відділення |
| `--jc-1…8` | linear-gradients | journal-cover spine gradients (catalog) |

### 3.2 Semantic tokens (layer 2 — bind to these when reasoning about a surface)

| Semantic | → primitive | Notes |
|---|---|---|
| `--color-bg` / `--color-surface` | `--white` | App background, cards, header |
| `--color-surface-muted` | `--grey-50` | Sectioned bands |
| `--color-surface-dark` | `--navy-700` | Navy panels (newsletter, utility bar) |
| `--color-surface-deep` | `--navy-900` | Footer, deepest navy |
| `--color-text` | `--ink-900` | Primary |
| `--color-text-secondary` | `--ink-600` | Body |
| `--color-text-tertiary` | `--ink-500` | Meta — **lightest text; AA-borderline on `--grey-50`, keep on white** |
| `--color-text-on-dark` / `-strong` / `-muted` | `--on-dark-85` / `--white` / `--on-dark-60` | Text on navy |
| `--color-primary` / `-hover` | `--navy-700` / `--navy-800` | Interactive |
| `--color-on-primary` | `--white` | Text on navy |
| `--color-accent` | `--gold-600` | **Non-text accent only** (rules, dots, borders, icons, CTA fill) |
| `--color-accent-text` | `--gold-700` | **The only gold allowed for small text** |
| `--color-on-accent` | `--white` | Text on wheat — see §3.4 caveat |
| `--color-border` / `-warm` / `-hover` | `--grey-200` / `--warm-200` / `--grey-350` | Lines; `-hover` is the card-lift border |
| `--color-focus-ring` | `--navy-700` | Focus outline |
| `--hero-overlay` | gradient of `--hero-stop-1/2/3` | The navy-multiply hero treatment |
| `--hero-fade-bottom` | `transparent → --black-a15` | Subtle hero floor fade |

### 3.3 Component tokens (layer 3 — component-specific aliases)

| Group | Tokens | Resolves to |
|---|---|---|
| **Buttons** | `--btn-primary-bg` / `-bg-hover` / `-fg` | navy / navy-dark / white |
| | `--btn-invert-bg` / `-bg-hover` / `-fg` | white / white-90 / navy — the **on-photo** hero CTA |
| | `--btn-accent-bg` / `-fg` | **`--gold-700` AA-safe wheat / white** — the newsletter submit (5.32:1, see §3.4) |
| | `--btn-ghost-border` / `-fg` / `-fg-hover` | line / ink / navy — bordered, hover→navy |
| **Chips / pills** | `--chip-bg` `-border` `-fg`, `--chip-hover-border` `-hover-fg`, `--chip-active-bg` `-active-fg` | white→navy active; news filter chips |
| | `--pill-dot` | `--color-accent` — **wheat dot on audience pills** |
| **Badges** | `--badge-open-fg` / `-border` | navy / `rgba(30,58,95,.30)` — "Відкритий доступ" |
| | `--badge-sub-fg` / `-border` | tertiary / line — "Передплата" |
| | `--badge-conf-fg` / `-border` | `--color-accent-text` (gold-700, **AA-safe**) / `--gold-line` — "Конференція" |
| **Stat ribbon** | `--stat-num-color` | `--color-primary` (navy) — the 56px mono numbers |
| **Decorative fills** | `--portrait-bg` / `--news-thumb` / `--photo-ph` | navy-monogram gradient / warm thumb gradient / grey placeholder |

> **Tokenization notes** (values in the source that lack a dedicated token — do not silently
> hardcode; promote if reused):
> - `--btn-invert-bg-hover` references `--on-dark-90`, now a **defined** primitive
>   (`rgba(255,255,255,0.90)`) in layer 1 — no literal fallback needed.
> - The **audience-pill hover lift** is `translateY(-1px)` in the build, while `--lift-hover` is `-2px`
>   (card-lift). The 1px pill lift has no token.
> - The **focus ring** uses `--color-focus-ring` for color but its `outline-width: 2px` and
>   `outline-offset: 3px` have no tokens.
> - Hero `background-position: center 40%` and `background-blend-mode: multiply` are part of the
>   photo treatment, not captured beyond `--hero-overlay`.

### 3.4 Contrast (verified, WCAG 2.1 — computed, not asserted)

Ratios below were computed from the literal token hex values (white-alpha rows composited over
the `--navy-900` floor). Solid pairs:

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `--ink-900` `#0A0A0A` | white | **19.8:1** | AAA |
| `--ink-600` `#525252` | white | **7.81:1** | AAA |
| `--ink-500` `#737373` | white | **4.74:1** | AA (normal) |
| `--ink-500` `#737373` | `--grey-50` `#F8F9FA` | **4.50:1** | **AA borderline** — don't go lighter on muted |
| `--navy-700` `#1E3A5F` | white | **11.5:1** | AAA |
| `--navy-700` `#1E3A5F` | `--grey-50` | **10.9:1** | AAA |
| `--navy-700` `#1E3A5F` | `--grey-200` `#E5E5E5` | **9.13:1** | AAA |
| white | `--navy-700` `#1E3A5F` | **11.5:1** | AAA (buttons, newsletter panel) |
| white | `--navy-900` `#0E1F35` | **16.6:1** | AAA (footer, utility bar) |
| `--gold-700` `#8A6508` | white | **5.32:1** | AA (normal text) — the **only** gold for text |
| `--gold-600` `#B8860B` | white | **3.25:1** | **Fails AA for text** → non-text / large-only |
| white | `--gold-700` `#8A6508` | **5.32:1** | **AA** — the wheat CTA fill (`--btn-accent-bg`, darkened from raw gold-600) |

White-alpha text/lines over the `--navy-900` floor (footer, utility bar, newsletter):

| Token | Composited ratio | Verdict |
|---|---|---|
| `--on-dark-85` | **12.2:1** | AAA — primary on-dark text |
| `--on-dark-80` | **10.9:1** | AAA |
| `--on-dark-75` | **9.76:1** | AAA |
| `--on-dark-70` | **8.66:1** | AAA |
| `--on-dark-60` | **6.71:1** | AAA — muted on-dark text |
| `--on-dark-55` | **5.85:1** | AA — **floor for small labels on navy** (footer column heads) |
| `--on-dark-50` | **5.07:1** | **Decorative-only** — AA on the navy-900 floor but **4.14:1 on `--navy-700` panels**; never for text |

> ⚠️ **Wheat-CTA (signature, now AA-resolved).** The newsletter submit
> (`--btn-accent-bg` / `--btn-accent-fg` white) fills with **`--gold-700`**, the AA-safe wheat —
> white-on-gold is **5.32:1**, so the brand wheat moment stays *and* the 13px/600 label passes AA.
> Raw wheat `--gold-600` (white-on-gold **3.25:1**) is **never** used for the CTA fill or for any
> text. For gold *text* use `--color-accent-text` (`--gold-700`); the event "Конференція" tag does
> this correctly.
>
> **Hero text-on-photo** can't be statically verified (the background is a photo). Legibility is
> guaranteed by `--hero-overlay`'s darkest stop (`--hero-stop-3` `rgba(14,31,53,0.78)`) multiplied
> over the image; verify the actual hero photo renders ≥4.5:1 under the overlay before shipping a new image.

---

## 4. Typography

### 4.1 Families & weights (loaded via Google Fonts in the build head)

| Token | Stack | Use |
|---|---|---|
| `--serif` | `'Lora', Georgia, 'Times New Roman', serif` | Hero, section heads, card titles, wordmark, names, divider italic |
| `--sans` | `'Inter', system-ui, …` | Body, nav, UI labels, eyebrow/kicker, buttons (default `body` font) |
| `--mono` | `'JetBrains Mono', ui-monospace, monospace` | **Stat ribbon (56px)**, dates, DOIs, journal meta, map labels, EDRPOU, tabular figures |

Weights loaded: Lora 400/500/600/700, Inter 300–700, JetBrains Mono 400/500/600
(`--fw-light 300 … --fw-bold 700`). **In practice 500/600 carry emphasis** (400 = body default);
hero & section heads are serif **500**, card titles serif 500, stat numbers mono **500**.
Italic Lora is reserved for the "Для наших постійних відвідувачів" divider line.

### 4.2 Type scale (role tokens from `tokens.css` — fluid heads use `clamp()`)

| Role token | Size | Family / weight | Line-height | Tracking |
|---|---|---|---|---|
| `--fs-hero` | `clamp(36px, 5.2vw, 64px)` | serif 500 | `--lh-hero` 1.05 | `--tracking-display` -0.02em |
| `--fs-display` | `clamp(34px, 4.4vw, 56px)` | serif 500 | 1.1–1.15 | -0.01em |
| `--fs-stat` | `clamp(36px, 5.4vw, 56px)` | **mono 500** | 1 | — (tnum) |
| `--fs-h2` | `clamp(32px, 3.8vw, 44px)` | serif 500 | `--lh-heading` 1.15 **(dominant)** | `--tracking-tight` -0.01em |
| `--fs-h2-sm` | `clamp(28px, 3.2vw, 36px)` | serif 500 | 1.15 | -0.01em |
| `--fs-h2-feed` | `32px` | serif 500 | `--lh-heading` 1.15 | — |
| `--fs-h2-panel` | `30px` | serif 500 · newsletter panel | `--lh-heading` 1.15 | — |
| `--fs-h3-xl` | `26px` | serif 500 · events aside | `--lh-heading` 1.15 | — |
| `--fs-h3-panel` | `24px` | serif 500 · contact card | `--lh-heading-loose` 1.2 | — |
| `--fs-h3-lg` | `22px` | serif 500/600 | `--lh-tight` 1.25 | — |
| `--fs-h3` | `20px` | serif 500 | `--lh-snug` 1.375 | — |
| `--fs-lead` | `18px` | sans / serif-italic | `--lh-body` 1.5 | — |
| `--fs-title` | `17px` | serif 500 | snug | — |
| `--fs-name` | `16px` | serif 500 | snug | — |
| `--fs-ui` | `15px` | sans 500 | snug | — |
| `--fs-body` | `14px` | sans 400 | 1.5–1.6 | — |
| `--fs-caption` | `13px` | sans / serif | 1.5 | — |
| `--fs-meta` | `12px` | sans / mono | — | — |
| `--fs-eyebrow` | `11px` | **sans 600** | — | `--tracking-eyebrow` 0.14em, uppercase |
| `--fs-mono` | `11px` | mono | — | `--tracking-wide` 0.05em (date/meta) · `--tracking-mono` 0.12em (journal label) |
| `--fs-micro` / `--fs-nano` | `10px` / `9px` | mono | — | uppercase labels (journal top, footer eyebrow) |
| `--fs-input` | `16px` | sans | — | mobile-input floor (avoid iOS zoom) |

### 4.3 Rules

- **Eyebrow/kicker pattern:** `--fs-eyebrow` (11px) · sans **600** · `letter-spacing: --tracking-eyebrow` (0.14em) · uppercase · `--color-primary` (navy) — muted variant uses `--color-text-tertiary`. (Note: in the build this is `'Inter'` 600, *not* mono — sans is the kicker face here.)
- **Mono is for data.** Stat numbers, dates, DOIs, journal volumes, region labels, phone — all `--mono`, tabular figures. Tracking splits two ways: `--tracking-wide` (0.05em) on mono date/meta labels, `--tracking-mono` (0.12em) on the uppercase journal top label.
- **Mobile inputs ≥ `--fs-input` (16px)** to prevent iOS auto-zoom.
- Cap reading measure: hero lead ~560px, prose/feature copy ~640–720px.
- Don't introduce a fourth family or a display/decorative font (see [§10](#10-anti-patterns)).

---

## 5. Spacing & layout

### 5.1 Spacing scale (4px base — `--space-*`)

`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64 · 80 · 96`
(`--space-1` … `--space-24`). New work uses these steps; the `56px` partner-logo height is on-grid
but unnamed (`--space-14` not defined) — leave or add if reused.

### 5.2 Layout

| Token | Value | Meaning |
|---|---|---|
| `--wrap` | `1320px` | Max content width (every section centers in `max-w-[1320px]`) |
| `--gutter` | `24px` | Horizontal page inset (`px-6`) |
| `--section-y` | `96px` | Default section rhythm (`py-24`) |

**Section rhythm (as built):** `96px` default (research, partners, publications, institutes,
presidium, newsletter), `80px` secondary band (partner strip), `64px` divider; news block is
`pt-8 pb-24`; footer `pt-20 pb-10`. Treat **96 / 80 / 64** as the three rhythm steps (a 32px tight
variant exists in `tokens.css` for compact stacks).

**Fixed layout heights (tokenized):** `--h-utilitybar 32px` · `--h-header 72px` · `--h-hero 640px`
· `--h-stats 200px`.

**Breakpoints (Tailwind defaults in the build):** `sm 640` · `md 768` · `lg 1024`. Mobile head
override at `≤768px` (hero 36px, stat numbers 36px). Recommended systematic set going forward:
**375 / 768 / 1024 / 1440**.

**Grid patterns:** division cards `1 → 2 → 3` cols (gap `--space-6`); partner-narrative `3`-up
(gap-x 40 / gap-y 48); news+events `2:1`; map+list `3:2` (of 5); footer `2 → 3 → 5` cols.
Catalog & presidium are **horizontal-scroll strips** (`.h-scroll`, `width: max-content`), not grids.

---

## 6. Radius, elevation, motion, z-index

> **This section holds the Lucidity signature.** Two things separate Lucidity from gravitas at a
> glance: **tighter radii** and **flat border+lift hover (no shadow)**. Preserve both.

### 6.1 Radius — *tighter than gravitas*

| Token | Value | Use |
|---|---|---|
| `--r-xs` | `2px` | photo-label chips |
| `--r-btn` | `4px` | **buttons, inputs, icon buttons, file/journal badges, footer social squares** |
| `--r-card` | `8px` | **cards, placeholders, journal covers, portraits, date boxes** |
| `--r-pill` | `999px` | filter chips, audience pills |
| `--r-circle` | `50%` | dots, avatars, monogram ring |

Gravitas standardizes content cards on `12px`; Lucidity uses **`8px` card / `4px` button**. This is
the crisp, editorial read — do not soften toward 12px.

### 6.2 Elevation — *flat by default; hover is border+lift, not shadow*

| Token | Value | Use |
|---|---|---|
| `--lift-hover` | `translateY(-2px)` | **the card-lift transform — the signature hover** |
| `--color-border-hover` | `--grey-350` `#C4C4C4` | border color the card shifts to on hover |
| `--shadow-header` | `0 1px 0 var(--black-a04)` | sticky-header scroll cue (1px hairline, not a drop shadow) |
| `--shadow-sm` | `0 8px 22px rgba(30,58,95,0.08)` | **optional** raised card — use sparingly; default is flat |
| `--shadow-overlay` | `0 14px 50px rgba(0,0,0,0.20)` | search / modal overlay only |

Card hover = `transform: var(--lift-hover)` + `border-color: var(--color-border-hover)` over
`--motion-slow`. **No box-shadow on cards** — that's the gravitas reflex; Lucidity stays flat.

### 6.3 Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | `150ms` | filter chips, link icon-gap grow |
| `--motion-base` | `180ms` | audience pills, logo placeholders, generic hover |
| `--motion-slow` | `200ms` | card-lift, map dots (`r`/`fill`), header |
| `--ease` | `ease` | default easing |

`@media (prefers-reduced-motion: reduce)` collapses all three durations to `1ms` (already in
`tokens.css`). Animate `transform`/`opacity` only — never width/height/top/left.

### 6.4 Z-index

| Token | Value | Layer |
|---|---|---|
| `--z-header` | `40` | sticky header |
| `--z-skip` | `100` | skip-link (also the skip-link in build) |
| `--z-overlay` | `110` | search / drawer scrim |
| `--z-modal` | `111` | search / modal dialog |

---

## 7. Components

Full anatomy, token maps, states, and variants live in the companion
[`components.md`](./components.md). A component is on-style when it: uses only token values; has
visible **hover *and* focus** states; uses SVG icons (24×24 viewBox, `currentColor`, stroke
1.5–2); honors the 44px touch minimum; and respects the **flat border+lift** hover law.

Component families in this system (→ see `components.md` for each):

- **Utility bar** — slim `--h-utilitybar` (32px) navy strip: email/phone (mono), high-contrast toggle, UA/EN toggle (`aria-pressed`), social icons.
- **Header** — sticky `--h-header` (72px), `--z-header`: shield crest + two-line serif wordmark + mono "NAAS · ЗАСН. 1931", desktop nav (14px, hover→navy), search icon-button, bordered "Кабінет науковця" ghost button. Scroll adds `--shadow-header`.
- **Photo hero** — `--h-hero` (640px) under `--hero-overlay`: EN/UA eyebrow → `--fs-hero` serif H1 → `--color-text-on-dark` lead → invert CTA (`--btn-invert-*`) + bordered on-photo "Our research" link. Mono photo-credit chip.
- **Stat ribbon** — `--h-stats` (200px), 5 cells, hairline `divide-x`: `--fs-stat` mono **500** `--stat-num-color` numbers + `--fs-caption` labels.
- **Division card** — `--r-card`, photo-top (200px; placeholder = `--div-*` gradient), EN eyebrow + UA serif title (`--fs-h3`) + desc + "Інститути (n) →" link; **card-lift** hover.
- **Partner-narrative feature** — 3-up icon (boxed `--r-card` icon) + serif `--fs-h3-lg` head + body; closes with navy `--btn-primary` CTA.
- **Partner logo strip** — `.logo-ph` 56px bordered cells (`--r-btn`), hover→navy border.
- **Divider + audience pills** — serif-italic centered label between hairlines; `--r-pill` pills each with a `--pill-dot` (wheat) and a `-1px` hover lift.
- **News feed** — filter **chips** (`--chip-*`, active→navy) + article cards (warm-thumb top, mono date·tag, serif `--fs-title`, teaser).
- **Events list** — date box (`--r-card`, mono month/day) + tag badge (`--badge-conf-*` gold / navy / line variants) + serif title.
- **Journal catalog** — `.h-scroll` of cover spines (`--jc-1…8`, aspect 3/4, `--r-card`), title + mono volume/DOI + open-access / subscription badge.
- **Institutes map** — Ukraine SVG outline + `.map-dot` (navy, hover→`r:7` `--color-accent`) + `--btn`-radius filter `select` + search input + divided list.
- **Presidium** — `.h-scroll` of portrait monograms (`--portrait-bg` navy gradient, 4/5, initials ring) + serif `--fs-name` + role caption.
- **Newsletter + Contact** — navy panel (`--color-surface-dark`) with **`--gold-700` wheat** submit (`--btn-accent-*`, AA-safe — §3.4) beside a bordered contact card (mono tel/email, hours, maps link).
- **Footer** — `--color-surface-deep` (navy-900), 5 columns of on-dark links, social squares (`--r-btn`), brochure-download button, bottom legal bar.

---

## 8. Accessibility baseline (already met in the reference build — keep it)

- **Contrast:** every solid text pair ≥ AA (§3.4). Never set text in raw `--gold-600`; use `--color-accent-text` (`--gold-700`). The wheat CTA fills with `--gold-700` (white-on-gold 5.32:1, AA) — the resolved signature (§3.4 ⚠️).
- **Focus:** `.focus-ring:focus-visible` = `2px solid var(--color-focus-ring)` (navy), `offset 3px`, `--r-btn`. Visible on every interactive element. Don't remove it.
- **Touch targets:** aim for **≥44×44**. ⚠️ Several reference-build chrome controls fall short — header search icon-button (`p-2` ≈ 34px), footer social squares (`w-9 h-9` = 36px), chips/pills (~30–34px). **Pad these up to 44px in a production build.**
- **Reduced motion:** `prefers-reduced-motion` zeroes `--motion-*` (transform/opacity only animate).
- **High-contrast mode:** `body.hc` → `--hc-bg` black / `--hc-fg` white / `--hc-link` yellow; photos become `#222` with a dashed outline. Toggled from the utility bar ("Для людей з вадами зору").
- **Bilingual:** `lang="uk"` default + `data-lang` UA/EN toggle with `aria-pressed`; chrome strings swap (kickers/CTAs/partner copy lean English by design).
- **Keyboard & semantics:** skip-link (`--z-skip`) to `#main`; `aria-label` on icon-only buttons; `role="group"` on the language toggle; `<address>`, `aria-labelledby` on the hero; `<title>` tooltips on map dots; decorative SVG `aria-hidden`/decorative images `alt=""`.
- **Color is never the only signal:** journal status pairs color with text ("Відкритий доступ" / "Передплата"); event type pairs the gold/navy tag color with a label; active nav pairs color with weight + underline.

---

## 9. Relationship to gravitas & light

All three NAAS systems share the **V3 lineage**: the same tri-font system (Lora / Inter /
JetBrains Mono), the same navy `#1E3A5F` + wheat `#B8860B` + ink ramp, the same primitive →
semantic → component token architecture, and the same accessibility floor (AA, bilingual,
high-contrast, reduced-motion). They are siblings, not forks — a token named the same thing means
the same thing across systems.

| | **gravitas** (`site/design-system/`) | **Lucidity** ← *this* (`design-system-lucidity/`) | **light** (`site-light/`) |
|---|---|---|---|
| Domain | `naas-portal-gravitas` | `naas-portal-lucidity` *(proposed)* | `naas-portal-light` |
| Hero | Text hero (centered/left, field-contour SVG) | **Photo hero + navy-multiply overlay** | V1/V3 hero variants |
| Card radius | **12px** (soft institutional grid) | **8px** (crisp editorial) | — |
| Button radius | 6px | **4px** | — |
| Card hover | border-shift **+ optional drop shadow** (`--shadow-sm`) | **flat border + `translateY(-2px)` lift, no shadow** | — |
| Signature parts | breadcrumb heroes, registries, doc pages | **mono 56px stat ribbon · journal-cover catalog · h-scroll strips · Ukraine map · portrait monograms · wheat-fill CTA · gold audience dots** | lighter parallel design |
| Stack | Astro 5 → Cloudflare Pages (live) | Static reference + `tokens.css` (no app yet) | Astro, `feat/site-light-build` branch |

**What differs (Lucidity-specific):** the photo hero treatment (`--hero-overlay`), tighter radii,
the flat-hover law, mono as a *display* face (stat ribbon), and the scientific-catalog component
set (journal spines `--jc-*`, division gradients `--div-*`, portrait monogram `--portrait-bg`,
Ukraine map). **What's shared:** palette, fonts, token layering, a11y baseline. When porting a
component between systems, **re-map radii and hover**, keep colors and fonts.

> Boundary: this system is self-contained under `design-system-lucidity/`. It does **not** edit
> `site/` (gravitas) or the light system, and no `site-lucidity/` app scaffold exists yet — these
> are the foundations a future build would consume.

---

## 10. Anti-patterns (do not do)

- ❌ **Drop shadows on cards.** Lucidity hover is **flat border + `--lift-hover` (-2px)**. Reserve `--shadow-*` for overlays/search only.
- ❌ **Softening the radii** toward gravitas's 12px. Cards are `--r-card` (8px), buttons `--r-btn` (4px) — that crispness *is* the identity.
- ❌ **Raw `--gold-600` as text** (3.25:1, fails AA) — use `--color-accent-text` (`--gold-700`). The wheat CTA fill is `--gold-700` (AA-safe), never raw `--gold-600` (§3.4 ⚠️).
- ❌ **A photo hero with no / a weak overlay.** Text legibility depends on `--hero-overlay`; never drop it or lighten below the navy-multiply stops.
- ❌ **Emoji as icons** — use SVG (24×24, `currentColor`, stroke 1.5–2). (The build's `Дякуємо ✓` is a placeholder, not a pattern.)
- ❌ **A fourth font family**, or a display/decorative font. Mono is the only "display" liberty (stat ribbon).
- ❌ **Removing focus rings; hover-only affordances; color-only meaning.**
- ❌ **New magic numbers** when a `--space-*` / `--fs-*` / `--r-*` token fits.
- ❌ **Touch targets < 44px** in production (the reference build's 34–36px chrome buttons must be padded up).
- ❌ **Ornate effects, heavy gradients/shadows, parallax, AI purple/pink gradients.** The decorative `--div-*` / `--jc-*` gradients are placeholder fills for missing photos — replace with real imagery, don't multiply them.
- ❌ **Marketing tone, exclamation CTAs, "sign up!" energy** — this is a state institution. English chrome is partnership-serious, not salesy.
- ❌ **Editing `site/` (gravitas) or the light system** from here, or hardcoding hex/px instead of `var(--token)`.
