# Override — `/struktura` (Структура Академії)

Source: [`src/pages/struktura.astro`](../../src/pages/struktura.astro). Overrides
[`MASTER.md`](../MASTER.md) §7.3 (section card) for the institution cards.

## Why
The structure page is a **directory of institutions** grouped by scientific division. A plain `.scard`
under-communicates; each institution gets an identity card with a branded header. The richer treatment is
intentional and confined to this page.

## Deviations from MASTER

### Division group header
- Serif H2 `clamp(20px, 2.4vw, 26px)`/600 + a **count chip**: mono 11px/600 navy on
  `rgba(30,58,95,0.07)`, `padding 5px 9px`, **radius 5px** (MASTER chip = 3–4px → acceptable variant).
- Group separated by a **3px top border `--navy`** (same device as homepage feeds, MASTER §7.8).

### Institution card (`<article>`)
- Card radius **12px** + `overflow:hidden` — matches the §9.1 *recommended* card standard (12px).
- **Decorative header band** (84px), not in MASTER:
  - Background `linear-gradient(150deg, #274059 0%, #16304d 100%)` → tokens `--navy-grad-1`/`--navy-grad-2`.
  - Diagonal hairline texture `repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 10px)`.
  - **Wheat motif** SVG, stroke `#E8C766` (→ `--gold-2`) at `opacity 0.5`. Decorative → `aria-hidden`-equivalent (no alt needed).
- **Overlapping monogram**: 50×50, radius **10px**, navy fill, **3px white border**, serif initials,
  shadow `0 4px 10px rgba(0,0,0,0.1)`, pulled up with `margin-top:-24px` over the header band.
- Contact `<dl>`: 2-col grid, mono labels at **9.5px** uppercase `--ink3` (smaller than MASTER `meta` 10–11px —
  acceptable for dense tabular contact data), values mono 12.5px.

## Still inherits from MASTER
Token palette, serif/mono families, `--line` borders, navy links, focus/hover behavior, 44px touch
targets, breadcrumb `Hero`, `.section`/`.wrap` layout, and all §8 accessibility rules.

## Notes
- The gradient + wheat header is the **only** sanctioned decorative-gradient surface. Don't propagate it to
  other card types (MASTER §12: avoid heavy gradients generally).
- The `9.5px` label size and `#274059/#16304D/#E8C766` colors should be tokenized (see MASTER §3.3) but the
  *visual treatment* itself is approved here.
