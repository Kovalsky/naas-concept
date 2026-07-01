# NAAS Portal — "Lucidity" Design System · Components

> **Source of truth:** [`../v3-hybrid.html`](../v3-hybrid.html) — the reference build.
> **Token layer:** [`./tokens.css`](./tokens.css) — every value below binds to a token there.
> Sibling systems: *gravitas* (`../site/design-system/`) and *light*. This file documents the
> **Lucidity** identity only: photo-led hero with navy-multiply overlay, mono 56px stat ribbon,
> journal catalog + h-scroll + Ukraine map + portrait monograms, **tighter radii** (8px card /
> 4px button), and **flat border+lift hover (no shadow)**.
>
> Every spec is **descriptive of what is built** in `v3-hybrid.html` and **prescriptive** for new
> work. Where the source hardcodes a value that has no token, it is called out as a **NOTE**
> (never silently re-hardcode). Where the source ships a contrast risk, it is flagged **⚠**.

---

## 0. Conventions (apply to every component)

A component is on-style when it uses the token palette, exposes **visible hover *and* focus**
states, draws icons as inline SVG (`viewBox 0 0 24 24`, `currentColor`, stroke 1.2–2), and meets
the **44×44 touch minimum** for any control.

**Focus ring (universal).** Every interactive element carries `.focus-ring`:
`outline: 2px solid var(--color-focus-ring)` (`--navy-700`) · `outline-offset: 3px` ·
`border-radius: var(--r-btn)` (4px) on `:focus-visible`. Focus token = **`--color-focus-ring`**.
This token never changes per component; only the element it sits on does.

**Touch target.** Several source controls render below 44px (utility-bar links on a 32px bar,
header search ~34px, 36px footer social squares, inline underline links). **New/responsive work
must pad the hit area to ≥44×44** even where the visual box is smaller — flagged ⚠ per component.

**Contrast law.** Raw `--color-accent` (`--gold-600`) is **forbidden as text** (~3.2:1 on white).
Small gold text must use **`--color-accent-text`** (`--gold-700`, ~5.3:1). The smallest legible
on-dark label token is **`--on-dark-55`**; anything lighter on navy fails AA.

**Motion.** `--motion-fast` (150ms) chips/links · `--motion-base` (180ms) pills/logos/generic ·
`--motion-slow` (200ms) card-lift / map dots / header. `--ease` = `ease`. Under
`prefers-reduced-motion` all three collapse to 1ms (transform/opacity only).

---

## 1. Buttons — four variants

Shared anatomy: `inline-flex`, `align-items:center`, `gap` 8px for a trailing/leading SVG (14–16px),
`border-radius: var(--r-btn)` (4px), weight 500–600. Sizes seen in source: hero `px-6 py-3.5`
(14px/`--fs-body`, 600); section CTA `px-5 py-3` (13px/`--fs-caption`, 600); header ghost
`px-4 py-2` (13px, 500). All carry `.focus-ring`. ⚠ `py-2`/`py-2.5`/`py-3` heights land at
~34–42px — **pad to ≥44px** for touch.

### 1a. Primary (navy fill)
Anatomy: navy fill, white label. Used for the section-level CTA ("International cooperation office").

| State | Property → token |
|---|---|
| Default | bg `--btn-primary-bg` (`--color-primary`/`--navy-700`); text `--btn-primary-fg` (white) |
| Hover | bg `--btn-primary-bg-hover` (`--color-primary-hover`/`--navy-800`); `transition --motion-base` |
| Active / pressed | bg held at `--btn-primary-bg-hover` (`--navy-800` — the ramp's "pressed" navy); `transform translateY(1px)` *(not in source — recommend)* |
| Focus-visible | outline `--color-focus-ring`, offset 3px |
| Disabled | *(not in source — recommend 0.5 opacity + `cursor:not-allowed` + `aria-disabled`)* |

### 1b. Invert (white fill, on photo)
Anatomy: white fill, navy label — sits on the photo hero. Used for hero "Investment & partnership".

| State | Property → token |
|---|---|
| Default | bg `--btn-invert-bg` (white); text `--btn-invert-fg` (`--color-primary`) |
| Hover | bg `--btn-invert-bg-hover` → `var(--on-dark-90, rgba(255,255,255,.90))` |
| Active / pressed | bg `--on-dark-80` (white dimmed one step past hover's `--on-dark-90`); `transform translateY(1px)` *(not in source — recommend)* |
| Focus-visible | outline `--color-focus-ring`, offset 3px (visible against photo) |
| Disabled | *(not in source — recommend 0.5 opacity + `cursor:not-allowed` + `aria-disabled`; rare on the hero)* |

**NOTE:** `--btn-invert-bg-hover` resolves to **`--on-dark-90`** (`rgba(255,255,255,0.90)`), now a
defined token in the primitive ramp (90/85/80/75/70/60/55/50/40/30/20/15/10/08). The literal
`var(--on-dark-90, rgba(255,255,255,.90))` fallback in the table is belt-and-suspenders, no longer required.

### 1c. Accent (wheat fill — newsletter only)
Anatomy: wheat fill, white label. The single sanctioned wheat-filled CTA ("Підписатися").

| State | Property → token |
|---|---|
| Default | bg `--btn-accent-bg` (`--gold-700` — AA-safe wheat); text `--btn-accent-fg` (`--color-on-accent`/white) |
| Hover | `opacity: .90` (source) — *no dedicated token; recommend a `--gold-700`→darker hover* |
| Active / pressed | `opacity: .85` (a step past hover); `transform translateY(1px)` *(not in source — recommend a darker `--gold-700` press token)* |
| Focus-visible | outline `--color-focus-ring`, offset 3px |
| Disabled | 0.5 opacity + `cursor:not-allowed` + `aria-disabled` — **applies during/after submit**: while the JS swaps the label to "Дякуємо ✓" (§22) the control is disabled to guard against double-submit |

**Contrast:** white on `--btn-accent-bg` (`--gold-700`) ≈ **5.3:1** — **passes AA**. The fill is the
AA-safe wheat, **not** raw `--gold-600`. Never spec raw gold (`--color-accent`/`--gold-600`) as a
text/label fill (~3.2:1, fails AA); gold *text* uses `--color-accent-text` (`--gold-700`). Keep the
label ≥600 weight.

### 1d. Ghost (bordered → navy)
Anatomy: transparent fill, 1px border, ink label. Used for header "Кабінет науковця"; an
**on-dark inverse** is used for the footer "Завантажити брошуру" button (see §20).

| State | Property → token |
|---|---|
| Default | border `--btn-ghost-border` (`--color-border`); text `--btn-ghost-fg` (`--color-text`) |
| Hover | border `--chip-hover-border`/`--color-primary`; text `--btn-ghost-fg-hover` (`--color-primary`) |
| Active / pressed | border + text `--color-primary-hover` (`--navy-800`); `transform translateY(1px)` *(not in source — recommend)* |
| Focus-visible | outline `--color-focus-ring`, offset 3px |
| Disabled | border stays `--color-border`, text `--color-text-tertiary`; `cursor:not-allowed` + `aria-disabled` *(not in source — recommend)* |

---

## 2. Underline / "go-to" link (3 sub-forms)

The site's recurring "read more / go to" affordance — **not** a button. Three forms:

**2a. Section link** (`Усі відділення →`, `Усі новини →`, `Каталог видань →`): 14px/`--fs-body`,
500, text `--color-primary`, 1px bottom border `--color-primary`, `pb-1`. Hover → `opacity:.80`.

**2b. Card arrow link** (`Інститути відділення (8) →`): 13px/`--fs-caption`, 500,
`--color-primary`, `inline-flex gap 6px`. Hover grows the gap (`gap 6→8px`) at `--motion-fast` —
the arrow slides, no color change.

**2c. On-photo link** (hero "Our research →"): white text, 1px bottom border `--on-dark-40`.
Hover → border `--white`. Trailing 16px arrow SVG.

| State | 2a / 2b | 2c (on photo) |
|---|---|---|
| Default | text/border `--color-primary` | text white; border `--on-dark-40` |
| Hover | `opacity .80` (2a) / `gap`+`--motion-fast` (2b) | border `--white` |
| Focus-visible | `--color-focus-ring`, offset 3px | `--color-focus-ring`, offset 3px |

⚠ Inline links are short — ensure ≥44px tappable line-height on mobile.

---

## 3. Eyebrow / kicker

Anatomy: `.eyebrow` = Inter (`--sans`) · `--fs-eyebrow` (11px) · weight `--fw-semibold` (600) ·
`letter-spacing var(--tracking-eyebrow)` (0.14em) · `text-transform:uppercase`. Always paired
above a serif H2 (or a feature/contact title). Color is contextual:

| Context | Color token | Note |
|---|---|---|
| On light section (default) | `--color-primary` (navy) | research, partners, publications, institutes, presidium, contact |
| On division card | `--color-text-tertiary` (`--ink-500`) | ⚠ `--ink-500` on `--color-surface-muted` ≈ 4.5:1 (AA-borderline) |
| On hero photo | `--color-text-on-dark` (`--on-dark-85`) at 70% in source | source uses `white/70`; keep ≥`--on-dark-55` |
| Newsletter (on navy) | `--color-text-on-dark-muted` (`--on-dark-60`) | passes on navy-700 (~5.4:1) |
| Footer column label | source `white/50` (`--on-dark-50`) | ⚠ **fails AA (~4.4:1)** — raise to `--on-dark-55` |

---

## 4. Section header block

Anatomy: `flex items-end justify-between`, `mb 48–64px`. Left stack = eyebrow (§3) + serif H2
(`--serif`, `--fw-medium` 500, `--tracking-tight`). Optional right-aligned §2a link. H2 size is
role-scaled by section weight:

| Use | Size token | px |
|---|---|---|
| Hero-grade section ("Напрямки досліджень", "Чому НААН…") | `--fs-h2` | 44 |
| Standard section ("Наукові видання", "Наші інститути", "Президія") | `--fs-h2-sm` | 36 |
| Feed / partners block ("Останні новини", "Міжнародні партнери") | `--fs-h2-feed` | 32 |
| Newsletter panel H2 | `--fs-h2-panel` | 30 |
| Events aside H2 | `--fs-h3-xl` | 26 |
| Contact card H2 | `--fs-h3-panel` | 24 |

Line-height: section heads use `--lh-heading` (1.15, the **DOMINANT** value); the contact-card H2
(and journal-cover title) use `--lh-heading-loose` (1.2); card/news/event titles use `--lh-snug`
(1.375). **NOTE:** 30/26/24 now have dedicated tokens (`--fs-h2-panel` / `--fs-h3-xl` /
`--fs-h3-panel`) — use them rather than minting new sizes.

---

## 5. Utility bar (slim top)

Anatomy: full-bleed band, height `--h-utilitybar` (32px), bg `--color-surface-dark`
(`--navy-700`/`bg-naas`), text `--fs-meta` (12px) white. Inner `--wrap` (1320) max, `--gutter`
(24) inset, `flex justify-between`. **Left:** email + phone links (12px icon + label, `gap 6px`),
separated by a `--on-dark-40` "·". **Right:** high-contrast toggle button → `·` → UA/EN language
toggle (`role=group`) → `·` → 4 social links (14px icons, `gap 10px`).

| Element | State | Property → token |
|---|---|---|
| Mail/phone/social link | Default | color white |
| | Hover | color `--on-dark-80` (source `white/80`) |
| | Focus-visible | `--color-focus-ring`, offset 3px |
| Lang button (active) | — | `--fw-semibold`, color white, `aria-pressed=true` |
| Lang button (inactive) | Default | color `--on-dark-70`; Hover → white |
| Separator "·" | — | `--on-dark-40` |

⚠ All controls sit inside a 32px bar → **far below 44px touch**. On mobile, either hide the bar
or expand the tap area. The A11y toggle and lang toggle are icon/short-text controls and must keep
`aria-label`/`aria-pressed` (present in source).

---

## 6. Sticky header (+ scroll shadow)

Anatomy: `position:sticky; top:0; z-index var(--z-header)` (40), bg `--color-surface` (white),
height `--h-header` (72px), bottom border transparent→`--color-border` on scroll. Inner `--wrap`
+ `--gutter`, `flex justify-between`. **Left:** crest SVG (40×44; shield `--navy-700` fill, wheat
strokes `--gold-600`) + two-line wordmark — serif `--fs-ui` (15px) `--fw-semibold` `--color-text`,
sub-line mono `--fs-micro` (10px) `--color-text-secondary` (`NAAS · ЗАСН. 1931`). **Center:**
desktop nav (`hidden lg:flex`, `gap 32px`), links `--fs-body` (14px) `--fw-medium` `--color-text`.
**Right:** icon search button (`p-2`, 18px icon) + ghost "Кабінет науковця" (§1d, `md:` up).

| Element | State | Property → token |
|---|---|---|
| Header bar | Default | border-bottom transparent |
| | Scrolled (`>8px`, JS adds `.header-scrolled`) | border-bottom `--color-border` + `--shadow-header` (`0 1px 0 var(--black-a04)`); `transition --motion-slow` |
| Nav link | Hover | color `--color-primary`; Focus `--color-focus-ring` |
| Search button | Hover | bg `--color-surface-muted` (`hover:bg-muted`), `--r-btn` |
| | Focus-visible | `--color-focus-ring`, offset 3px |
| Cabinet (ghost) | — | see §1d |

⚠ Search button ≈34×34 → **pad to 44×44**. Icon-only search needs its `aria-label="Пошук"`
(present). No active/disabled nav states in source.

---

## 7. Photo hero

Anatomy: `position:relative`, height `--h-hero` (640px; ⚠ mobile override → 36px headline,
`.hero-headline`). Background = `.hero-photo`: `--hero-overlay` (navy multiply: `--hero-stop-1/2/3`)
over the photo, `background-blend-mode: multiply, normal`, floor `--navy-700`. Content column
`max-w 720px`, vertically centered, `z-10`. Stack: photo-credit label (top-right, mono
`--fs-micro` 10px `--on-dark-40`) → eyebrow (§3, on-dark) → H1 (`--serif` `--fw-medium`,
`--fs-hero` clamp 36–64px, `--lh-hero` 1.05, `--tracking-display` −0.02em, color white) → sub
paragraph (`--fs-lead` 18px, `--color-text-on-dark`/`--on-dark-85`, `--lh-body`) → action row
(`gap 24px`): **invert button** (§1b) + **on-photo link** (§2c). Bottom: 128px non-interactive
fade `--hero-fade-bottom` (`transparent → --black-a15`).

Tokens consumed: `--hero-overlay`, `--hero-stop-1/2/3`, `--hero-fade-bottom`, `--black-a15`,
`--fs-hero`, `--lh-hero`, `--tracking-display`, `--fs-lead`, `--color-text-on-dark`, `--on-dark-40`,
`--btn-invert-*`, `--h-hero`.

States: only the interactive children carry states (invert button §1b, on-photo link §2c). The
hero surface itself is static. ⚠ Photo-credit label at `--on-dark-40` is **decorative meta**, not
content — fine to keep low-contrast; do not promote it to body copy.

---

## 8. Stat ribbon

Anatomy: white band, top border `--color-border` (`.hairline`), height `--h-stats` (200px). Inner
`--wrap` + `--gutter`. Grid: `2 cols` mobile → `5 cols` `md:`, `divide-x divide-line`
(`--color-border` verticals), each cell `flex-col justify-center px-6`, first cell `pl-0`. Per cell:
**number** mono (`--mono`) `--fs-stat` (clamp 36–56px; ⚠ mobile `.stats-num`→36px) `--fw-medium`,
`--lh-none` (1, leading-none), color `--stat-num-color` (`--color-primary`) — then **label** `--fs-caption` (13px)
`--color-text-secondary`, `mt-3`. Figures use non-breaking spaces (`3 500+`) and `tnum` features.

| Part | Token |
|---|---|
| Number | `--stat-num-color` (= `--color-primary`), `--fs-stat`, `--mono`, `--fw-medium` |
| Label | `--color-text-secondary`, `--fs-caption` |
| Dividers | `--color-border` |
| Top rule | `--color-border` |

No interactive states (static data). Use `aria-label` on the section (`Ключові показники`).

---

## 9. Division / research card (`.card-lift`)

Anatomy: `article`, bg `--color-surface` (white), 1px `--color-border` (`.hairline`),
`border-radius var(--r-card)` (8px), `overflow:hidden`. **Top:** `.photo-ph` media block,
height 200px (real image in source; placeholder fallback = `--photo-ph`/`--grey-400` + 135°
hatch + a mono `.ph-label` chip `--r-xs`/2px). **Body** `p-7` (28px): eyebrow EN (§3, `--ink-500`) →
serif title `--fs-h3` (20px) `--fw-medium` `--lh-snug` → desc `--fs-body` (14px)
`--color-text-secondary` `--lh-relaxed` → card-arrow link (§2b) `mt-5`.

The **`--div-soil/plant/animal/vet/econ/innov`** gradients are the color-coded photo placeholders
(per відділення) used when no image loads.

| State | Property → token |
|---|---|
| Default | border `--color-border`; `transform:none`; `transition transform/border-color --motion-slow` |
| Hover | `transform var(--lift-hover)` (translateY −2px); border `--color-border-hover` (`--grey-350`) — **flat lift, no shadow** |
| Focus-visible | the inner link owns focus → `--color-focus-ring` |

**NOTE:** the hover is **border + lift only** — the Lucidity signature. Do **not** add `--shadow-sm`
(that's the gravitas news-card behavior).

---

## 10. "Why partner" feature

Anatomy: 3-up grid (`gap-x-10 gap-y-12`). Per item: **icon box** `48×48` (`w-12 h-12`),
`border-radius var(--r-card)`, 1px `--color-border`, centered 22px SVG stroke 1.5, color
`--color-primary` → serif headline `--fs-h3-lg` (22px) `--fw-medium` `--lh-heading` → body
`--fs-ui` (15px) `--color-text-secondary` `--lh-relaxed`. Below the grid: a `border-t`
(`--color-border`) CTA row (`flex justify-between`) — supporting copy `--fs-body` `--ink-600` +
**primary button** (§1a).

Tokens: `--r-card`, `--color-border`, `--color-primary`, `--fs-h3-lg`, `--fs-ui`,
`--color-text-secondary`, `--btn-primary-*`. Static (no hover) except the CTA button.
**NOTE:** the 48px icon box has no dedicated token — it is `--r-card` + `--color-border`; keep it
square (48 = `--space-12`).

---

## 11. Partner logo strip (`.logo-ph`)

Anatomy: responsive grid (`2 → sm:4 → lg:8 cols`, `gap-3`). Each tile = `.logo-ph`: height 56px,
`flex` centered, 1px `--color-border`, `border-radius var(--r-btn)` (4px), Inter `--fw-medium`
`--fs-caption` (13px), color `--color-text-tertiary` (`--ink-500`), bg white. Below: a `border-t`
summary line with a mono count (`47`, `--mono` `--color-text`) in `--fs-ui`.

| State | Property → token |
|---|---|
| Default | text `--color-text-tertiary`; border `--color-border` |
| Hover | text `--color-primary`; border `--color-border-hover`; `transition --motion-base` |
| Focus-visible | `--color-focus-ring` if made focusable (source tiles are non-links) |

---

## 12. Section divider

Anatomy: centered transition band (`py-16`). Row: `h-px` rule (`bg-line`/`--color-border`, capped
`max-w 180px`) — `flex-1` each side of a centered serif-italic label `--fs-lead` (18px),
`font-style:italic`, `--color-text-secondary` ("Для наших постійних відвідувачів"). Below: a
wrapped row of **audience pills** (§13). Purely structural — no states.

Tokens: `--color-border`, `--fs-lead`, `--color-text-secondary`.

---

## 13. Audience pill (`.audience-pill`)

Anatomy: `inline-flex align-items:center gap 8px`, `padding 10px 20px`, 1px `--color-border`,
`border-radius var(--r-pill)` (999px), `--fs-body` (14px), color `--color-text`, bg white. Leading
**gold dot** `.dot` 6px circle (`--r-circle`), bg `--pill-dot` (= `--color-accent`/`--gold-600`).

| State | Property → token |
|---|---|
| Default | border `--color-border`; text `--color-text`; dot `--pill-dot` |
| Hover | border `--color-primary`; text `--color-primary`; `transform translateY(-1px)`; `transition --motion-base` |
| Focus-visible | `--color-focus-ring`, offset 3px |

The dot is **non-text gold** — correct use of `--color-accent`. ⚠ Pill height ≈ 38px → pad to
≥44px on touch.

---

## 14. News card

Anatomy: `article.group`, no border/box — image-led editorial card. **Top:** thumb
`border-radius var(--r-card)` (8px), height 180px (real image in source; placeholder fallback =
`--news-thumb`, warm-200→grey-300, with a 45° hatch; base bg `--warm-200`). Then mono date·tag line
`--fs-mono` (11px) `--color-text-tertiary` `--tracking-wide` (0.05em) uppercase → serif title `--fs-title`
(17px) `--fw-medium` `--lh-snug` → teaser `--fs-caption` (13px) `--color-text-secondary`
`--lh-relaxed`.

| State | Property → token |
|---|---|
| Default | title `--color-text` |
| Hover (`group-hover`) | title → `--color-primary` |
| Focus-visible | wrap the card in a focusable link → `--color-focus-ring` |

**NOTE:** source thumbs use real `<div background-image>` with `--warm-200` base; the `--news-thumb`
gradient token is the no-image fallback. No card border or lift — distinct from §9.

---

## 15. Filter chip (`.chip`)

Anatomy: `button`, `--fs-caption` (13px), `padding 6px 14px`, `border-radius var(--r-pill)` (999px),
1px `--chip-border` (`--color-border`), color `--chip-fg` (`--color-text-secondary`), bg
`--chip-bg` (white), `cursor:pointer`, `transition all --motion-fast`. These are filter **toggles**,
not tabs: wrap them in `role="group"` (with an `aria-label`) and give each `aria-pressed="true|false"`
— **not** `role="tablist"`/`aria-selected` (a tablist requires `role="tab"` children + roving tabindex).
Mirrors the UA/EN language toggle's `aria-pressed` pattern.

| State | Property → token |
|---|---|
| Default | bg `--chip-bg`; border `--chip-border`; text `--chip-fg`; `aria-pressed="false"` |
| Hover | border `--chip-hover-border` (`--color-primary`); text `--chip-hover-fg` (`--color-primary`) |
| Active (`.chip--active`, `aria-pressed="true"`) | bg `--chip-active-bg` (`--color-primary`); text `--chip-active-fg` (white); border `--color-primary` |
| Focus-visible | `--color-focus-ring`, offset 3px |
| Disabled | *(not in source)* |

⚠ Chip height ≈ 30px → **pad to ≥44px** touch row on mobile.

---

## 16. Event row (date box + tag)

Anatomy: `li.flex gap-4 group`. **Date box:** `flex-shrink-0 w-16` (64px), `text-center`, 1px
`--color-border`, `border-radius var(--r-card)` (8px), `py-2` — month mono `--fs-micro` (10px)
`--color-primary` uppercase `--tracking-wide`; day serif `--fs-h3-lg` (22px) `--fw-semibold`
`--lh-none` (1); weekday mono `--fs-micro` `--color-text-tertiary`. **Body** `flex-1 min-w-0`:
**event tag** (variant below) → title `--fs-ui` (15px) `--fw-medium` `--lh-snug`
(`group-hover → --color-primary`) → meta `--fs-meta` (12px) `--color-text-tertiary`.

**Event tag** = `inline-block`, mono `--fs-micro` (10px) uppercase `--tracking-wide`,
`border-radius var(--r-btn)` (4px), `px-2 py-0.5`, 1px border. Three variants:

| Variant | Source | Token (fg / border) | Note |
|---|---|---|---|
| **conf** (Конференція) | `text-wheat` + `border-wheat/30` | `--badge-conf-fg` (`--color-accent-text`/`--gold-700`) / `--badge-conf-border` (`--gold-line`) | ⚠ **source uses raw `--gold-600` text (~3.2:1, fails AA)** — token system corrects to `--color-accent-text` |
| **navy** (Захист дисертації) | `text-naas` + `border-naas/30` | `--badge-open-fg` (`--color-primary`) / `--badge-open-border` (`rgba(30,58,95,.30)`) | AA pass |
| **grey** (Конкурс / Зібрання) | `text-ink2` + `border-line` | `--badge-sub-fg` (`--color-text-tertiary`) / `--badge-sub-border` (`--color-border`) | **NOTE:** source text is `--ink-600`; token `--badge-sub-fg` resolves to `--ink-500` — reconcile to one |

| State | Property → token |
|---|---|
| Default | title `--color-text`; tag per variant |
| Hover (`group-hover`) | title → `--color-primary` |
| Focus-visible | row link → `--color-focus-ring` |

---

## 17. Journal-cover card + access badge

Anatomy: `article w-[200px] flex-shrink-0` (lives in an h-scroll §18). **Cover** `.journal-cover`:
`aspect-ratio 3/4`, `border-radius var(--r-card)` (8px), `overflow:hidden`, background =
`--jc-1 … --jc-8` (catalog spine gradients). Overlays: `.top` (mono `--fs-nano` 9px,
`--on-dark-70`, `--tracking-mono` (0.12em) uppercase — e.g. "Q3 · Scopus") and `.title` (serif `--fs-ui` 15px,
white, `--lh-snug`). **Meta block** below (`mt-3`): journal name `--fs-caption` (13px) `--fw-medium`
`--color-text` → mono DOI/issue line `--fs-micro` (10px) `--color-text-tertiary` → **access badge**.

**Access badge** = `inline-block`, `--fs-micro` (10px), `border-radius var(--r-btn)` (4px),
`px-1.5 py-0.5`, 1px border. Two variants:

| Variant | Source | Token (fg / border) |
|---|---|---|
| **open-access** (Відкритий доступ) | `text-naas` + `border-naas/30` | `--badge-open-fg` (`--color-primary`) / `--badge-open-border` (`rgba(30,58,95,.30)`) |
| **subscription** (Передплата) | `text-ink3` + `border-line` | `--badge-sub-fg` (`--color-text-tertiary`) / `--badge-sub-border` (`--color-border`) |

States: card is static; if wrapped in a link, focus → `--color-focus-ring`, hover may adopt the
§9 lift (not in source — keep flat unless promoted). ⚠ cover `.title` is white on dark gradients —
all `--jc-*` are dark enough for AA; don't lighten the gradients.

---

## 18. Horizontal-scroll strip (`.h-scroll`)

Anatomy: `overflow-x:auto`, `scrollbar-width:thin`, `scrollbar-color: var(--color-border-hover) transparent`
(thumb = `--color-border-hover`/`--grey-350`, resolves to #C4C4C4). Webkit: track transparent, thumb
`--color-border-hover` `border-radius var(--r-btn)`, height 8px. Inner rail `flex gap-5` (20px),
`width:max-content`, `pb-4`. Edge-bleeds the gutter via `-mx-6 px-6`. Hosts the journal catalog
(§17) and presidium portraits (§19).

Tokens: `--color-border-hover` (scrollbar thumb), `--r-btn`, `--space-5` (gap). No hover/active
state on the rail itself. **A11y:** ensure keyboard scroll / visible focus on child cards; provide
the mono hint caption where used.

---

## 19. Ukraine institute map

Anatomy: panel `bg-muted` (`--color-surface-muted`), 1px `--color-border`,
`border-radius var(--r-card)` (8px), `p-8`, `min-height 480px`. Inline SVG `viewBox 0 0 600 400`:
country outline `fill:white stroke var(--color-primary)` (1.2, opacity .7); Crimea dashed
(opacity .4); Dnipro line (opacity .25); **dots** `g fill=--color-primary` (`.map-dot`, r 3–5);
region labels mono 8px `--color-text-secondary` (`#525252`); footnote mono `--fs-micro` (10px)
`--color-text-tertiary`.

| State | Property → token |
|---|---|
| Dot default | `fill --color-primary`; `r` 3–5 |
| Dot hover | `fill --color-accent` (`--gold-600`); `r:7`; `transition r/fill --motion-slow` |
| Focus-visible | ring `--color-focus-ring`, offset 3px (source has none — **must be added**) |

⚠ **Required:** dots are interactive (`cursor:pointer`, `<title>` tooltips) but are **not
keyboard-focusable** in source. They **must** be made keyboard-focusable (`tabindex="0"` + `.focus-ring`,
ring `--color-focus-ring`) and **must** carry a **non-color state cue** — the grown radius / a stroke
change — because fill-color alone fails the "color is never the only signal" rule. Pad the tap target
to **≥44×44** (the r 3–7 dots are far below the touch minimum).

---

## 20. Institute list (select + search + rows)

Anatomy: right rail (`lg:col-span-2`). **Filter label:** mono `--fs-meta` (12px) uppercase
`--tracking-wide` `--color-text-tertiary`. **Select:** `w-full`, 1px `--color-border`,
`border-radius var(--r-btn)`, `px-4 py-3`, `--fs-body` (14px), bg white, `.focus-ring`.
**Search input:** relative wrapper with a 16px leading icon (`--color-text-tertiary`, absolute
`left-3`); input `pl-10 pr-4 py-3`, 1px `--color-border`, `--r-btn`, `--fs-body`, bg white,
`type=search`, `.focus-ring`. **Rows:** `ul` with `divide-y divide-line` + `border-t/border-b`
(`--color-border`); each `li.py-4` → title `--fs-body` (14px) `--fw-medium` `--color-text`, meta
row `--fs-meta` (12px) `--color-text-tertiary` with `·` separators colored `--color-border`
(`text-line`). Footer: §2a link "Повний список (42) →".

| Control | State | Property → token |
|---|---|---|
| Select / Search | Default | border `--color-border`; text `--color-text`; bg white |
| | Hover | border `--color-border-hover` (`--grey-350`); `transition --motion-base` |
| | Focus-visible | `--color-focus-ring`, offset 3px |
| | Disabled | bg `--color-surface-muted`; text `--color-text-tertiary`; 0.5 opacity; `cursor:not-allowed` + `aria-disabled` *(not in source — recommend)* |
| | Invalid / error | `aria-invalid="true"` + `aria-describedby` → inline message `--fs-meta` (12px); border + ring emphasised to `--color-primary` (2px). **NOTE: the palette has no danger/error token — don't mint a raw red hex; flag a `--color-danger` gap (see §28) and lean on `aria-invalid` + the message until one exists** |
| Row | Hover | *(none in source — recommend `--color-surface-muted` wash)* |

⚠ **Inputs are `--fs-body` (14px) < `--fs-input` (16px)** → risks iOS auto-zoom. The token
`--fs-input` (16px) exists precisely for this — apply on mobile. Inputs `py-3` ≈ 46px tall (meets
44px ✓).

---

## 21. Presidium portrait

Anatomy: `article w-[220px] flex-shrink-0` (in an h-scroll §18). **Portrait** `.portrait-ph`:
`border-radius var(--r-card)` (8px), `aspect-ratio 4/5`, bg `--portrait-bg`
(`--navy-600 → --navy-700`), `flex` bottom-centered, `pb 18px`. Monogram device: a 56px ring
(`::before`, `border-radius var(--r-circle)`, bg `--on-dark-08` (`rgba(255,255,255,.08)`), 1.5px border
`--on-dark-15` (`rgba(255,255,255,.15)`)) + initials (`::after data-initials`) serif `--fw-medium` 18px,
`--on-dark-55`, tracking 0.04em. **Caption:** serif name `--fs-name` (16px) `--fw-medium`
`--lh-snug` `--color-text`; role `--fs-meta` (12px) `--color-text-tertiary`.

Tokens: `--portrait-bg`, `--navy-600`, `--navy-700`, `--r-card`, `--r-circle`, `--on-dark-08`,
`--on-dark-15`, `--on-dark-55`, `--fs-name`, `--fs-meta`, `--color-text-tertiary`. **NOTE:** the
ring fill `white/.08` and stroke `white/.15` now have exact tokens — `--on-dark-08` / `--on-dark-15`;
use them. Static unless the card becomes a link (then focus → `--color-focus-ring`).

---

## 22. Newsletter CTA

Anatomy: navy panel, bg `--color-surface-dark` (`--navy-700`/`bg-naas`), text white,
`border-radius var(--r-card)` (8px), `p-10 lg:p-12`. Stack: eyebrow `--color-text-on-dark-muted`
(`--on-dark-60`) → serif H2 `--fs-h2-panel` (30px) `--fw-medium` `--lh-heading` (see §4) → body
`--on-dark-75` `--fs-body` `--lh-relaxed` → **form** (`flex`, `gap-3`) → fine print `--on-dark-50`
`--fs-mono`/11px (⚠ `--on-dark-50` is decorative-only/below AA — raise to `--on-dark-55` for legible fine print).

Form parts:
- **Email input:** `flex-1`, `px-4 py-3`, `--r-btn`, bg white, text `--color-text` (`text-ink`),
  `--fs-body` (14px), `.focus-ring`, `aria-label`. ⚠ 14px < `--fs-input` (16px) → iOS zoom.
- **Submit:** accent button §1c (`--btn-accent-bg`/wheat, white label). On submit, JS swaps label
  to "Дякуємо ✓".

| Element | State | Property → token |
|---|---|---|
| Email input | Default | bg white; text `--color-text` |
| | Focus-visible | `--color-focus-ring` |
| | Disabled | 0.5 opacity; `cursor:not-allowed` + `aria-disabled` — set **during/after submit**, while the button label reads "Дякуємо ✓" |
| | Invalid / error | required field → `aria-invalid="true"` + `aria-describedby` to an inline message; message `--fs-mono` (11px) at **≥`--on-dark-55`** (legible on navy — never `--on-dark-50`); input border emphasised to `--color-primary` (2px). **NOTE: no danger/error token in the palette — don't hardcode a red hex; flag a `--color-danger` gap (see §28)** |
| Submit | Default/Hover/Focus | see §1c (white-on-`--gold-700` ~5.3:1, AA-safe) |
| | Disabled | see §1c **Disabled** — applies during/after submit |

---

## 23. Contact card

Anatomy: bordered card, 1px `--color-border`, `border-radius var(--r-card)` (8px), `p-10 lg:p-12`.
Header: eyebrow `--color-primary` + serif H2 `--fs-h3-panel` (24px) `--fw-medium` `--lh-heading-loose`. **Rows** (`space-y-5`,
`--fs-body`): each `flex gap-4` with an 18px leading SVG (`--color-text-tertiary`, stroke 1.5) and
a text block — primary line `--color-text`, secondary line `--color-text-secondary`; phone/email
are **mono links** `--color-text` `hover:--color-primary`. Footer: §2a link with a 13px ext-arrow
("Маршрут на Google Maps").

| Element | State | Property → token |
|---|---|---|
| tel / mailto link | Default | `--color-text`, `--mono` |
| | Hover | `--color-primary` |
| | Focus-visible | `--color-focus-ring` |

Tokens: `--color-border`, `--r-card`, `--color-primary`, `--color-text`, `--color-text-secondary`,
`--color-text-tertiary`, `--fs-body`, `--fs-meta`, `--mono`.

---

## 24. Footer

Anatomy: full-bleed, **bg `--color-surface-deep` (`--navy-900`)** — the shipped surface (the source build used `--navy-700`; standardized to navy-900, see NOTE), text white, `pt-20 pb-10`. Inner
`--wrap` + `--gutter`. 5-column grid (`gap-12 lg:gap-8`): **(1)** crest (white shield / navy
strokes) + serif wordmark `--fs-name`/14px + "Контакти" eyebrow + `<address>` (mono tel/email,
`--fs-caption`); **(2–4)** link columns — eyebrow label + `clean-list space-y-3` of
`--fs-caption` links; **(5)** social squares + download button. Bottom bar: `border-t`
(`--on-dark-10`) `pt-8 flex justify-between`, © line + 3 policy links, all `--fs-meta` (12px)
`--on-dark-60`.

> **NOTE (resolved):** the reference build rendered the footer on `--navy-700`, but the shipped
> system (`tokens.css` + `demo.html`) standardizes the footer on **`--color-surface-deep`
> (`--navy-900`)** — matching MASTER §3.2 and the utility bar. On-dark contrast below is computed
> against the navy-900 floor (where `--on-dark-55` is the small-label minimum, §3.4).

**Column eyebrow label:** source `white/50` (`--on-dark-50`). ⚠ **Fails AA (~4.4:1)** at 11px on
navy — raise to **`--on-dark-55`** (the documented min).

**Footer link:**
| State | Property → token |
|---|---|
| Default | `--on-dark-80` (`white/80`) |
| Hover | `--white` |
| Focus-visible | `--color-focus-ring` |

**Social square:** `w-9 h-9` (36px), 1px `--on-dark-20` border, `border-radius var(--r-btn)`,
16px icon.
| State | Property → token |
|---|---|
| Default | border `--on-dark-20`; icon white |
| Hover | bg `--white`; icon `--color-primary` |
| Focus-visible | `--color-focus-ring` |
⚠ 36×36 < 44px touch — **enlarge the hit area**. Icon-only → keep `aria-label` (present).

**Download button (on-dark ghost):** text white, 1px `--on-dark-30` border (`white/30`, now a
defined token), `px-4 py-2.5`, `--r-btn`, `--fs-caption`;
hover → bg `--white` / text `--color-primary`. Focus → `--color-focus-ring`.

**Bottom-bar link:** `--on-dark-60` → hover `--white`; focus `--color-focus-ring`.

---

## 25. Skip link

Anatomy: `.skip-link` — off-screen (`left:-9999px`) until focus, then `left:8px; top:8px`. bg
`--navy-700` (`--color-primary`/`--color-surface-dark`), text white, `padding 12px 16px`,
`z-index var(--z-skip)` (100). Targets `#main`.

| State | Property → token |
|---|---|
| Default | visually hidden |
| Focus | revealed top-left; bg `--color-primary`; text white; above all via `--z-skip` |

Must be the **first focusable element** and beat every other layer (`--z-skip` = 100 ≥
`--z-overlay`/`--z-modal`). ✓ touch/clickable size adequate (40px tall).

---

## 26. High-contrast mode

Trigger: utility-bar `#accessibilityToggle` button toggles `body.hc` (JS). Anatomy of the override
layer:

| Rule | Token |
|---|---|
| `body.hc` base | bg `--hc-bg` (#000); text `--hc-fg` (#fff) |
| `body.hc *` | bg transparent + `background-image:none`; text `--hc-fg`; border `--hc-fg`; `box-shadow:none` |
| `body.hc a, body.hc button` | color `--hc-link` (#ffff00) |
| `body.hc .photo-ph/.news-ph/.portrait-ph/.journal-cover/.hero-photo` | bg `#222` + `outline:1px dashed #fff` (decorative surfaces flattened) |
| `body.hc img` | `filter: grayscale(1) contrast(1.5)` |

Tokens: `--hc-bg`, `--hc-fg`, `--hc-link`. **NOTE:** `#222` and the dashed `#fff` outline are
inline HC values without tokens; promote to `--hc-*` if HC is themed further. The toggle button
needs its `aria-label`/pressed state (source has `aria-label`, **add `aria-pressed` toggle**).

---

## 27. Crest / logo mark (`.crest`)

> ⚠️ **PLACEHOLDER — not the real logo.** The `.crest` SVG below (navy shield + gold wheat-ear +
> "НААН") is an **invented mark drawn for the gallery**, NOT the official NAAS emblem. The real
> emblem is a colour seal — **`site/public/naas-emblem.png`** (teal frame, pale-teal field, bright
> gold wheat arch, open book, green sprout, "НААН/NAAS" banner) — and the shipping **gravitas**
> system already uses it as header/footer/favicon (`site/src/components/Header.astro`,
> `Footer.astro`, `Base.astro`). A real Lucidity build must use that asset (or an approved
> simplified small-size lockup), **not** this drawn crest.
>
> Two open items for the build: **(a)** the seal's palette (teal + bright gold `#F0A818`) differs
> from the Lucidity chrome (navy `#1E3A5F` + dark wheat `#B8860B`) — decide whether the chrome stays
> a quiet frame for the fixed seal or shifts toward the seal's hues; **(b)** at header sizes
> (~40px) the seal's fine linework + banner text won't read — a simplified monogram/mark may be
> needed. The spec below documents the placeholder's mechanics only.

The institutional mark — a **navy shield carrying a gold wheat-ear** with "НААН" set in the serif.
It opens the §6 header lock-up and the §24 footer column; both describe it inline, this is the
canonical spec.

**Anatomy:** inline `svg width="40" height="44" viewBox="0 0 40 44"`. Three layers:
- **shield** — `path` fill `--color-primary` (`--navy-700`), rounded-base silhouette.
- **wheat ear** — central stalk + three symmetric grain-pairs, `stroke` `--color-accent`
  (`--gold-600`), `stroke-width 1.2`, `fill:none` — the one **earned** gold in the mark.
- **"НААН" label** — `text` at the shield base, `font-family var(--serif)` (Lora),
  `font-size 6`, `--fw-bold` (700), fill `--white`.

Pairs with the wordmark at `gap-3` (12px). Sits **inside** the focusable header/footer home link
(§6/§24), which owns the `--color-focus-ring` — the mark itself is static, no hover/active.

| Variant | Shield fill | Ear + label fill | Surface |
|---|---|---|---|
| `.crest` (default) | `--color-primary` (`--navy-700`) | ear `--color-accent` (`--gold-600`); label `--white` | light (white header) |
| `.crest--invert` | `--white` | both `--color-primary` (`--navy-700`) | dark (navy footer / panels) |

**`.crest--invert`** (dark surfaces — footer, navy panels) simply swaps the two tokens: **white
shield**, **navy ear + navy "НААН"**. No third colour is introduced.

**Sizing:** **40×44** in both the header (§6) and footer (§24) lock-ups; keep the
`viewBox 0 0 40 44` and scale via `width`/`height` — don't redraw at other proportions.

**Token purity:** the source hardcodes fills inline (`fill="#1E3A5F"`, `stroke="#B8860B"`,
`fill="#fff"`, `font-family="Lora"`). **Prescriptive:** drive every fill/stroke from a `.crest`
CSS class (`fill: var(--color-primary)`, `stroke: var(--color-accent)`, the `text`
`font-family: var(--serif)`) — **no inline hex** on the SVG. This is the only place gold appears as
a non-text graphic in the brand mark (correct, earned use of `--color-accent`).

**Accessibility:**
- **Decorative beside the wordmark** (the §6/§24 use — the adjacent "Національна академія аграрних
  наук України" text already names the academy): `aria-hidden="true"` on the SVG so the name isn't
  announced twice. ✓ both source instances do this.
- **Standalone** (mark with no adjacent wordmark — a compact or favicon-style lock-up): it must
  carry the accessible name — `role="img"` + `<title>Національна академія аграрних наук України</title>`
  (or `aria-label`).
- The rendered `НААН` glyphs are **decorative** — the accessible name comes from the
  `<title>`/label or the adjacent wordmark, never the SVG `<text>`.

---

## 28. Consolidated NOTES & contrast flags

**Token gaps (source value with no/ambiguous token — do not re-hardcode):**
1. ✓ *Resolved* — `--on-dark-90` (referenced by `--btn-invert-bg-hover`) is **now defined** in the ramp. §1b.
2. ✓ *Resolved* — footer download `white/30` border now maps to the defined **`--on-dark-30`**. §24.
3. ✓ *Resolved* — portrait monogram ring `white/.08` fill + `white/.15` stroke now map to **`--on-dark-08`** / **`--on-dark-15`**. §21.
4. Off-scale paddings `py-2.5`/`py-3.5` (the 30/26/24px heads now have tokens — `--fs-h2-panel`/`--fs-h3-xl`/`--fs-h3-panel`, §4).
5. Grey event/access tags: source text `--ink-600` vs token `--badge-sub-fg` = `--ink-500`. §16.
6. HC `#222` / dashed-white surfaces have no tokens. §26.
7. ✓ *Resolved* — **footer surface** standardized on `--color-surface-deep` (`--navy-900`) in the
   shipped tokens/demo (source build used `--navy-700`). §24.

**Contrast risks (⚠):**
- **Raw gold text on the "Конференція" event tag** (source `text-wheat`, ~3.2:1) — must use
  `--badge-conf-fg`/`--color-accent-text`. §16.
- **Accent button fill is now `--gold-700`** (AA-safe wheat, white-on-gold ≈ 5.3:1 — **passes AA**).
  Raw `--gold-600` (`--color-accent`) stays forbidden as text/label fill; gold *text* uses
  `--color-accent-text`. Keep the label ≥600 weight. §1c, §22.
- **Footer column eyebrow `--on-dark-50`** (~4.4:1 on navy) — raise to `--on-dark-55`. §3, §24.
- `--color-text-tertiary` (`--ink-500`) eyebrows/meta on `--color-surface-muted` ≈ 4.5:1 (AA-floor) —
  don't go lighter on muted. §3, §9.
- Hero photo-credit label `--on-dark-40` — decorative only; never use for content. §7.

**Touch-target risks (⚠, all need ≥44×44 hit area on touch):** utility-bar controls (32px bar §5),
header search (~34px §6), filter chips (~30px §15), audience pills (~38px §13), footer social
squares (36px §24), inline underline links (§2).

**Keyboard/a11y to add (not in source):** focusable map dots + non-color state (§19), `aria-pressed`
on the HC toggle (§26), row hover/focus on the institute list (§20).

**Lucidity invariants (don't drift toward gravitas):** card hover = **`--lift-hover` + border, no
shadow** (§9); radii are tight — `--r-card` 8px / `--r-btn` 4px / `--r-xs` 2px; stat numbers are
**mono 56px** (`--fs-stat`, `--mono`); gold is **earned** — dots/rules/icons/accent-CTA fill only,
never as small text (use `--color-accent-text`).
