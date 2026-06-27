# Site audit vs source of truth — applied & deferred (2026-06-27)

Branch: **`feat/stakeholder-content-corrections`** (committed, **not pushed**). Companion: `source-of-truth-naas.md` (§ references below point there), `feedback-2026-06-patyka.md`.

`astro build` ✓ green — **45 pages**. All applied changes verified in `dist/`.

## ✅ Applied (high-confidence, unambiguous)

| # | Change | Files |
|---|---|---|
| 1 | **Founding 1931 → 1918** (display year, "Заснована … року", emblem SVG aria + EST., header/footer "ЗАСН.") | `components/HeroImage.astro`, `HeroLeft.astro`, `HeroC.astro`, `HeroWide.astro`, `Header.astro`, `lib/i18n.ts` (`footer.est`) |
| 2 | **History paragraph rewritten** — origin anchored to 1 листопада 1918 (Наказ Мінземсправ №162, Вчений комітет), keeping the 1931 ВУАСГН / 1990 УААН / 2010 national-status lineage | `data/pages/naan-sohodni.md:5` |
| 3 | **Descriptor** «вища галузева наукова установа» → «державна самоврядна наукова організація … провідний центр … головний розпорядник бюджетних коштів» | `data/pages/naan-sohodni.md:1` + 6 `pages/hero-*.astro` meta descriptions |
| 4 | **Count «50» → 176 / 84** in the intro prose (per §A2) | `data/pages/naan-sohodni.md:1` |
| 5 | **Division order** → official sequence землеробства → рослинництва → зоотехнії → ветеринарної → економіки → наукового забезпечення (§A3) | `data/institutes.json` |
| 6 | **Press unit** «Прес-служба» → «Відділ інформаційного забезпечення та зв’язків з громадськістю» (§C3) | `lib/i18n.ts` (`contacts.press`) |
| 7 | **Removed 3 `mail.ru` emails** (biapv@, cnzdiapw@, viapv@) (§C5) | `data/institutes.json` |

`contacts.json` address / phone / email already matched the source — left as-is.

## ⏸ Deferred — needs gap resolution or larger work (NOT applied)

| Item | Why deferred | Blocking gap (§F) |
|---|---|---|
| **Institution roster overhaul** — replace the old 50-institution set with the authoritative §B catalog (names, URLs, correct division assignment) | The source catalog gives names+URLs but **no addresses/phones**; a blind swap loses the contact data the old JSON has. Also two membership gaps unresolved. | §F3 (Інститут садівництва?), §F4 (економіки 6 vs 4), + need new contact details |
| **Structure page count (still shows 50)** | Derived from `institutes.json` length; auto-corrects when the roster is replaced. Temporary mismatch with the corrected 176/84 prose (only visible on this review branch, not live). | tied to roster |
| **Presidium roster** (names, ordering by division / alphabetical) | The handwritten notes give **ordering rules only — no surnames**; current president must be confirmed (logos ref is stale) | §F5 |
| **New sections**: Видавнича / Міжнародна / Виставкова / Інноваційна діяльність (§C2) | New pages — need content + design decision | — |
| **«Офіційні документи» section** (статут, рішення/постанови президії, **звіти as files** not a link to ДВ Аграрна наука) (§C5) | New section + actual document files needed | §F7-adjacent |
| **«Публічна інформація»** content | Reviewer left it empty (—) | §F7 |
| **Emblem**: change the flagged glyph + fix "duller than official" brightness | Needs official hi-res emblem + decision on the symbol | §F6, feedback task B |
| **Innovations catalog link** | Google Drive id has 2 ambiguous chars | §F1 |
| **More colour / less white** (feedback C) | Design direction needed from stakeholder | feedback task C |

## Notes
- `maynovi-pytannya.md:152` keeps "1931" — it is a building's commissioning year (property record), unrelated to the academy's founding. Correctly left.
- The 6 `hero-*.astro` are standalone hero-preview routes; their meta descriptions were corrected for consistency.
- Roster replacement is the highest-value remaining change but is intentionally held until the §F3/§F4 membership questions and the missing per-institute contact details are confirmed by the stakeholder — per the "no guessing" rule.
