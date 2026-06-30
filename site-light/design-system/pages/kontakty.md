# Override — `/kontakty` (Контакти)

Source: [`src/pages/kontakty.astro`](../../src/pages/kontakty.astro). Introduces the build's **only form**,
absent from [`MASTER.md`](../MASTER.md) §7.

## Why
The contacts page needs an inquiry form + contact cards — patterns the shared component kit doesn't cover.
The form is a real, reusable surface and the most important deviation to document.

## Deviations from MASTER

### Contact cards
- `.k-grid` = `repeat(3,1fr)` → `1fr` below 900px (`:119,:145`). `.k-card` `padding:26px` (`:120`).
- `.k-dt` mono `10px`, `0.08em`, uppercase, `--ink3` (`:125`).
- `.k-dd a` = `--navy` link with `border-bottom:1px solid rgba(30,58,95,0.3)` → hover `--navy` (`:128-129`).
  The `rgba(30,58,95,0.3)` underline is raw navy-at-30% → tokenize as `--navy-wash-30` (MASTER §3.3).

### Inquiry form (`.k-form`)
- Grid `1fr 1fr`, `gap:18px`, `max-width:720px` (`:131`) → 1-col below 560px (`:146`).
- Inputs (`:136`): `font-size:15px`, `1px solid var(--line)`, `border-radius:var(--r-btn)`,
  `padding:11px 13px`, **`min-height:46px`** (passes touch target). *(15px is acceptable; bump to 16px if
  iOS auto-zoom is observed.)*
- **Focus is explicit** (`:138`): `outline:2px solid var(--navy); outline-offset:1px; border-color:var(--navy)`
  — matches the global navy ring. This is the pattern §9 item 1 wants the **search input** to adopt.
- `.req` asterisk = `--gold-ink` (`:135`) ✅ AA-safe, not raw `--gold`; `aria-hidden` (the `required`
  attribute carries the semantics).
- `.k-status[data-kind="err"]` = **`#B3261E`** (`:141`) — a brand-new error red with no token → add
  `--danger` (MASTER §3.3). `[data-kind="ok"]` = `--navy` (`:142`).
- Cloudflare Turnstile widget `data-theme="light"` (`:84`); the contacts nav links carry `data-astro-reload`
  so the widget re-initialises on navigation.

## Accessibility (positives to preserve)
Every field has a `<label for>`/`id` pair; `required` + `type`/`inputmode="email"` + `autocomplete` are set;
the status message is a `role="status" aria-live="polite"` region (`:88`). This is the best-labelled surface
in the build — keep it as the form template.

## Action items (this page)
1. Tokenize `#B3261E` → `--danger` and `rgba(30,58,95,0.3)` → `--navy-wash-30`.
2. Consider per-field error association (`aria-describedby`/`aria-invalid`) instead of the single global status (MASTER §9 item 6).
3. Reuse this form's explicit `:focus-visible` pattern to fix the search input (MASTER §9 item 1).
