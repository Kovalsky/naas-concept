# Page overrides

Page-specific deviations from [`../MASTER.md`](../MASTER.md). The master file is the global Source of
Truth; files here record where a single page **legitimately departs** from it (a richer card, a decorative
treatment, a non-standard layout) so the deviation is intentional and reproducible — not drift.

## Retrieval rule

When building or editing a page:

1. Read `MASTER.md`.
2. Check whether `pages/<page-name>.md` exists (named after the route, e.g. `struktura`, `novyny`, `kontakty`).
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
| [`struktura.md`](./struktura.md) | `/struktura` | Navy-gradient division-card headers with wheat motif + overlapping monogram |
| [`naan-sohodni.md`](./naan-sohodni.md) | `/naan-sohodni` | Person cards (featured/deputy/member) + document status-pill cards + tabbed anchor hero |
