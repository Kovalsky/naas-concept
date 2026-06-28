# Override — `/struktura` (Структура Академії)

Source: [`src/pages/struktura.astro`](../../src/pages/struktura.astro). Overrides
[`MASTER.md`](../MASTER.md) §7.3/§7.9 for the institution directory cards.

## Why
The structure page is a **directory of subordinate institutions**. A plain `.card` under-communicates;
each institution gets a field-row card (label/value contact rows) and each division a count chip. The richer
treatment is intentional and confined to this page.

## Deviations from MASTER

### Division group + count chip
- `.div-count` chip (`:78-83`): mono `11.5px`/600, `color:var(--navy)`, **`background:rgba(30,58,95,0.07)`**,
  `padding:6px 11px`, `border-radius:var(--r-pill)`. The `rgba(30,58,95,0.07)` is raw navy-at-7% → tokenize
  as `--navy-wash-07` (MASTER §3.3); the same wash recurs elsewhere.

### Institution card (`.inst`)
- `padding:22px 24px` (`:87`). Internal divider `.inst-fields` `border-top:1px solid var(--line);
  padding-top:14px` (`:89`) — a hairline rule *inside* the card separating name from contact rows.
- `.inst-row` label+value flex, `gap:12px` (`:90`); `.inst-label` mono **`9.5px`**, `0.06em`, uppercase,
  `--ink3`, `width:50px` (`:91-94`) — smaller than MASTER `meta` (10–11px), acceptable for dense tabular
  contact labels. `.inst-val` `13px`/`--ink2` (`:95`); `.inst-val.mono` `12.5px`/`--ink` (`:96`);
  `.inst-link` `13px`/`--navy` (`:97`).
- Grid `repeat(auto-fill, minmax(280px, 1fr))`, `gap:16px` (`:85`) → `1fr` below **`540px`** (`:99`).

## Still inherits from MASTER
Token palette, serif/mono families, `PageHero` breadcrumb shell, `.section`/`.wrap`, the global
`:focus-visible` ring, hairline `--line` borders, and all §8 accessibility rules.

## Action items (this page)
1. Tokenize `rgba(30,58,95,0.07)` → `--navy-wash-07`.
2. Normalise the stray `540px` breakpoint → `560px` (MASTER §5.3 / §9 item 10).
3. `.inst-link` is distinguished from body by `--navy` colour only (no underline) — **colour-only link
   affordance**; consider an underline for non-colour distinction (MASTER §12).
4. `.inst-label` at `9.5px` is very small — verify legibility at the largest Dynamic-Type / zoom setting.
