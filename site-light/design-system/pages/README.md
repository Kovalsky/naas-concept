# Page overrides

Page-specific deviations from [`../MASTER.md`](../MASTER.md). The master file is the global Source of
Truth; files here record where a single page **legitimately departs** from it (a richer card, a form, a
decorative treatment) so the deviation is intentional and reproducible — not drift.

## Retrieval rule

When building or editing a page:

1. Read `MASTER.md`.
2. Check whether `pages/<page-name>.md` exists (named after the route, e.g. `struktura`, `kontakty`).
3. **If it exists, its rules override MASTER** for that page only.
4. **If not, MASTER governs exclusively.**

## When to add a file here

Add an override file when a page needs a treatment MASTER doesn't sanction **and** that treatment is
deliberate (design intent, not a one-off magic number you forgot to tokenize). If it's just an
un-normalized value, fix it toward the scale instead of documenting an exception.

Keep each file short: what deviates, the exact values, and *why* it's justified.

## Index

| File | Route | Deviation |
|---|---|---|
| [`kontakty.md`](./kontakty.md) | `/kontakty` | Contact cards + inquiry **form** (the only form in the build) |
| [`naan-sohodni.md`](./naan-sohodni.md) | `/naan-sohodni` | President feature card + deputies photo grid + two-column member list |
| [`struktura.md`](./struktura.md) | `/struktura` | Institution-directory field-row cards + navy count chip |

## Pages with NO override (MASTER governs)

`index` (delegates to components), `prozorist/*`, `novyny/*`, `atestatsiia`, `rada-molodykh`, `statut`,
`anonsy`, `publichna-informatsiia*`, `intelektualna-vlasnist*` — these use only sanctioned components or
trivial spacing tweaks. (Where one shows a smell — e.g. `novyny/index` builds its media card with inline
styles — fix it toward `.card`/`.rows`; don't enshrine it as an override.)
