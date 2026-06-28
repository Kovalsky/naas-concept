# Override — `/naan-sohodni` (НААН сьогодні)

Source: [`src/pages/naan-sohodni.astro`](../../src/pages/naan-sohodni.astro). The richest non-form interior
page — leadership/Presidium — introducing person-layout patterns not in [`MASTER.md`](../MASTER.md) §7.

## Why
The page profiles the Academy's leadership: it needs a **president feature card**, a **deputies photo grid**,
and a **two-column member list** with initials-fallback avatars — none covered by the generic `.card`/`.rows`.

## Deviations from MASTER

### Sub-section heading tier
- `.sub-h` serif `20px`/500 (`:132`) — a heading tier *between* `.h2` and body, used to label Presidium /
  documents blocks. Acceptable; consider promoting to a shared `.h3`-class if it recurs.

### President feature card (`.pres-lead`)
- Flex, `gap:26px`, `background:#fff`, `1px solid var(--line)`, `border-radius:var(--r-card)`,
  `padding:26px` (`:133`). Photo `132×158`, `object-position:center top`, `--muted2` bg (`:134`).
- `.pres-ph` placeholder avatar (`:135`): **`linear-gradient(160deg, #2c3e54, var(--navy))`**,
  `color:rgba(255,255,255,0.6)`, `28px` glyph. The `#2c3e54` start is an un-tokenized navy tint
  (also used in `PresidiumRow.astro:35`) → `--navy-tint` (MASTER §3.3).
- `.pres-lead-name` `24px` (`:137`); `.pres-lead-role` mono `11px`/`0.1em`/uppercase/`--navy` (`:136`).

### Deputies grid + member list
- `.people-grid` `repeat(3,1fr)` gap 22px (`:141`) → 2-col below 768px (`:155`); photos `aspect-ratio:5/6`.
- `.member-list` `repeat(2,1fr)` (`:148`) → 1-col below 768px; `.member-mono` initials circle `38×38`,
  **`border-radius:50%`** (`--r-dot`), `1px solid var(--line)`, `--navy` text, white bg (`:150`).

### Inline document rows
- Doc rows override `.fmt-tile` background inline: `background:var(--navy)` ("DOC", `:117`) and
  `background:var(--gold)` ("WEB", `:122`).
  ⚠️ **a11y:** the "WEB" tile is **white text on `--gold` `#B8860B` (~3:1)** — fails AA for the glyph; use
  `--navy` or `--gold-ink` as the background (MASTER §9 item 13).

## Still inherits from MASTER
Token palette, serif/mono families, `PageHero` breadcrumb shell, `.section`/`.wrap`, `.btn`/`.link-arrow`,
`.kicker`/`.h2`, the global `:focus-visible` ring, and all §8 accessibility rules.

## Action items (this page)
1. Tokenize `#2c3e54` → `--navy-tint` (shared with `PresidiumRow`).
2. Fix the white-on-`--gold` "WEB" badge contrast.
3. Consider promoting **person feature card** + **member-list avatar** into MASTER §7 if they recur.
