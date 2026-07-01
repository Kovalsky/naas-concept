# NAAS "Lucidity" Design System

> **Lucidity** — luminous clarity. The same institutional navy depth as *gravitas*, but
> held clear and legible rather than heavy: hairline order, data-precision, editorial calm.

The **third** NAAS design system, extracted from the reference build
[`../v3-hybrid.html`](../v3-hybrid.html). Sibling of the two that already ship:

| System | Lives in | Domain | Character |
|---|---|---|---|
| **gravitas** | `site/design-system/` | `naas-portal-gravitas` | Sober institutional gateway; text hero; 12px cards |
| **light** | `site-light/` (branch) | `naas-portal-light` | Lighter parallel design (V1/V3 heroes) |
| **Lucidity** ← *this* | `design-system-lucidity/` | `naas-portal-lucidity` *(proposed)* | Editorial / scientific-journal treatment |

## What makes Lucidity distinct

Same tri-font system (Lora / Inter / JetBrains Mono) and core palette
(navy `#1E3A5F` · wheat `#B8860B` · ink ramp) as gravitas — they share the **V3 lineage** —
but a different visual identity:

- **Photo-led hero** with a navy-multiply overlay over a real field photo (not a text hero).
- **Tighter radii** — `8px` cards / `4px` buttons (gravitas standardizes on 12px). Crisper, more editorial.
- **Mono data ribbon** — 56px JetBrains-Mono stat numbers split by hairline dividers.
- **Scientific-catalog components** — journal-cover spines, horizontal-scroll strips, Ukraine institute map, portrait monograms.
- **Flat hover** — cards lift + change border color (`translateY(-2px)`), no drop shadow.
- **Wheat earns the CTA** — the newsletter submit is an AA-safe wheat fill (`--gold-700`); gold dots mark audience pills.

## Files

| File | Purpose |
|---|---|
| `tokens.css` | **Canonical** CSS custom properties (primitive → semantic → component). Import this. |
| `tokens.json` | Complete 1:1 mirror of `tokens.css` as structured config (verbatim CSS values, grouped primitive/semantic/component/scale) — for generators / Tailwind theme. Regenerate from `tokens.css`; don't hand-edit. |
| `MASTER.md` | The design-system spec — read first when building. |
| `components.md` | Per-component specs (anatomy · tokens · states · variants). |
| `demo.html` | Tokenized component gallery — imports `tokens.css`, uses only `var()`. Visual QA. |

## Quick start

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="design-system-lucidity/tokens.css" />
```

```css
.cta {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-fg);
  border-radius: var(--r-btn);
  font: var(--fw-semibold) var(--fs-body)/1 var(--sans);
  transition: background var(--motion-base) var(--ease);
}
.cta:hover { background: var(--btn-primary-bg-hover); }
```

**Rule:** build with tokens, never raw hex/px. The only place literal hex lives is the
primitive layer of `tokens.css`. Accent gold (`--color-accent`) is for rules/dots/borders/icons —
for gold *text* use `--color-accent-text` (`--gold-700`, AA-safe).

> This is a new, self-contained system. It does **not** modify `site/` (gravitas) or the
> light system. No app scaffold (`site-lucidity/`) exists yet — these are the design foundations
> a future build would consume.
