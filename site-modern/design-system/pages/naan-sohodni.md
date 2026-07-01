# Override — `/naan-sohodni` (НААН сьогодні)

Source: [`src/pages/naan-sohodni.astro`](../../src/pages/naan-sohodni.astro). This is the richest interior
page (Presidium + official documents) and introduces several patterns not in [`MASTER.md`](../MASTER.md) §7.

## Why
The page profiles the Academy's leadership and core documents — it needs **person cards** (with photos and
monograms) and **document cards** (with status), which the generic `.scard`/`.rows` don't cover.

## Deviations from MASTER

### Custom hero with anchor sub-nav
Reuses `.hero` but `padding-bottom:0` and adds an in-page tab strip (`#prezidiya` / `#dokumenty`):
mono-free links 13px, active = navy 600 + 2px navy bottom-border, inactive = `--ink2`; `overflow-x:auto`.
Sections set `scroll-margin-top:92px` so anchored jumps clear the sticky header.

### Featured President card
Horizontal card, **radius 14px** (off the §6.1 scale), `--shadow-md` (`0 8px 24px rgba(30,58,95,0.06)`),
photo 200×240 (`object-fit:cover`) + text block. Eyebrow uses `--gold-ink` ✅ (AA-safe). Name serif `clamp(20px,2.4vw,26px)`/600.

### Deputies grid
`.deputies-grid` = 3 → 2 → 1 columns (900px / 560px). Cards **radius 12px**, photo 104×132 + serif 16px name,
navy 12.5px post, mono 11.5px phone.

### Member cards (monogram)
`.grid--auto-sm`, cards **radius 10px** (off-scale), with a **monogram chip** 38×38, radius 9px, `--gold-soft`
background. ⚠️ **The monogram letter uses raw `var(--gold)` text** — fails AA; should be `--gold-ink` (see MASTER §9 row 7).

### Document cards + status pills
`.grid--auto`, cards **radius 12px**, `padding 26px`. Each leads with a **status pill** (mono 10px uppercase,
radius 4px, 1px border):
- **"Чинна редакція"** → ⚠️ raw `var(--gold)` text + `rgba(184,134,11,0.4)` border — **fails AA** (`:98`); use `--gold-ink` / `--gold-line`.
- **"Архів"** → `--ink3` text + `--line` border.
- **"Зовнішній ресурс"** → `--navy` text + `rgba(30,58,95,0.3)` border.

Actions use the standard `.btn-navy` (download PDF) + `.link-underline` (full text / external).

## Still inherits from MASTER
Token palette, serif/mono families, `.hero` breadcrumb shell, `.section`/`.wrap`, `.btn-navy`, `.link-underline`,
`.kicker`/`.h2-serif`, and all §8 accessibility rules.

## Action items (this page)
1. **a11y:** swap the two raw-`--gold` text uses (`:78` monogram, `:98` status badge) to `--gold-ink`.
2. Normalize the `14px` / `10px` card radii toward `--r-xl` (12) / `--r-lg` (8) when next touched.
3. Consider promoting **person card** and **document/status card** into §7 if they recur on other pages.
