# What was added to the site from the extracted documents

This maps every site change back to the **source image** it came from. Source images + their per-image extractions live in `source-documents/`; the consolidated facts are in `source-of-truth-naas.md`. All changes below are **live on both versions** — gravitas (`naas-portal-gravitas.pages.dev`, branch `main`) and light (`naas-portal-light.pages.dev`, branch `feat/site-light-build`) — unless marked otherwise.

Legend: ✅ applied & live · 📄 placeholder page live (awaiting academy text) · 🔎 verified live.

---

## A. Facts corrected from the documents

| # | Change on site | From source document(s) |
|---|---|---|
| 1 | **Founding year 1931 → 1918** (heroes, header, footer, emblem SVG, history prose) ✅ | `05-presentation-tasks-1918-order` (Наказ Мінземсправ, 1 листопада 1918) · `09-handwritten-about-academy` («рік заснування не 1931, а 1918») · `01-typed-overview-structure` |
| 2 | **History paragraph rewritten** — 1918 origin + 1931/1990/2010 lineage | `05-presentation` · `01-typed-overview-structure` |
| 3 | **Self-descriptor** «вища галузева установа» → «державна самоврядна наукова організація…» ✅ | `01-typed-overview-structure` · `04-presentation-mission-contacts` · `09-handwritten-about-academy` («вислів „вища галузева установа" недоречно») |
| 4 | **Institution count «50» → 176 / 84** (prose) and hero stat → **84 «наукові установи»** ✅ | `01-typed-overview-structure` · `06-report-table-1.1-1.2` (176 установ; 84 бюджетні) · `09-handwritten` («наукових установ не 50») |
| 5 | **Institution roster rebuilt → 46** (correct names + official URLs, 6 divisions) ✅ | `01/02/03-typed-*` (names + website URLs) · `08-report-table-1.5b-1.6` (added «Інститут садівництва») · `09-handwritten` («назви установ не вірні») |
| 6 | **6 divisions in official order** + one-line description each (structure page) ✅ | `01-typed-overview-structure` · `09-handwritten-about-academy` (required division order) |
| 7 | **Contacts: 2nd phone 521-92-95 + fax 280-57-05** ✅ | `04-presentation-mission-contacts` (address/phones/fax block) |
| 8 | **Press unit relabeled** → «Відділ інформаційного забезпечення та зв'язків з громадськістю» (was «Прес-служба») ✅ | `10-handwritten-divisions-publicinfo-officialdocs` / `12-…-fragment` · `12-handwritten-general-page-contacts` |
| 9 | **Presidium ordering** — academician-secretaries by division, members alphabetical ✅ | `13-handwritten-presidium` |

## B. Brand / emblem

| # | Change | From source document(s) |
|---|---|---|
| 10 | **Emblem replaced** with the high-quality version (320×320, both versions) ✅ | `feedback-chat/` («логос… наш більш тускліший виходить» + the official emblem image) · `10-handwritten` («змінити його») |

## C. New sections added (reviewer's «Додати»)

| # | Section | Content source / status |
|---|---|---|
| 11 | **Видавнича діяльність** (`/vydavnycha-diyalnist`) ✅ | `03-typed-publisher-university-catalog` — ДВ «Аграрна наука» + 3 journals (Вісник аграрної науки, Аграрна наука–виробництву, Agricultural Science and Practice). From handwritten «Додати» list (`12-handwritten-general-page-contacts`). |
| 12 | **Інноваційна діяльність** (`/innovatsiyna-diyalnist`) ✅ | Catalog link from `03-typed-…-catalog` (Каталог інноваційних розробок НААН 2019–2025, link recovered by brute-forcing the OCR-ambiguous Drive id). Placeholder for the rest. |
| 13 | **Міжнародна діяльність** (`/mizhnarodna-diyalnist`) 📄 | From handwritten «Додати» list (`12-…`). No content in any source → placeholder; academy must author. |
| 14 | **Виставкова діяльність** (`/vystavkova-diyalnist`) 📄 | From handwritten «Додати» list (`12-…`). No content in any source → placeholder; academy must author. |
| 15 | **Офіційні документи** (`/ofitsiyni-dokumenty`) ✅ | From handwritten note (`10-…`: statute + presidium decisions + activity reports «файли, не посилання на ДВ»). Statute linked; decisions/reports = placeholder pending files. |
| 16 | **«Звіти про діяльність» links repointed** off the publisher → internal Офіційні документи ✅ | `10-handwritten` («звіти… не посилання на ДВ Аграр. наука») |

## D. Link IDs recovered & verified from the images
- **Catalog (Google Drive):** `…/d/19noLIfpdJlW0mjxNkY21SQjxhWDYlp1A/view` → «Katalog-2025.pdf» — `03-typed-…-catalog` (brute-forced the I/l/0 ambiguities, verified live). 🔎
- **Facebook pages:** `1LpPqRJzr1` → facebook.com/cnzdiapw (Донецька ДСГДС); `1EBz6d1Xnq` → facebook.com/isgs.naan (Інститут СГ Степу) — `03-typed-…` / `08-report`, verified live. 🔎

---

## Requested by the reviewer, but content not provided → needs the academy
These sections/items were **explicitly requested in the handwritten notes** (so the *pages* were created per that instruction), but the notes did **not** include the actual text/files, and the content exists nowhere on the old site or in the Bitrix admin (38 iblocks checked). So only the academy can supply them:
- **Text for «Міжнародна діяльність» and «Виставкова діяльність»** — requested in the «Додати» list (`source-documents/12-handwritten-general-page-contacts`); placeholder pages are live, awaiting text.
- **«Рішення та постанови Президії»** files and **«Звіти про діяльність» files** — requested in the «Офіційні документи» note (`source-documents/10-handwritten-divisions-publicinfo-officialdocs`: «має бути звіт про діяльність НААН — файли, не посилання на ДВ»).
- Confirmation that the old site's `podani.pdf` is the correct **activity report** to host.
- «Публічна інформація» is largely already migrated; the old site has 14 subsections (see `old-site-content-inventory.md`).

*Companion docs: `source-documents/` (originals + extractions), `source-of-truth-naas.md`, `feedback-2026-06-patyka.md`, `site-audit-vs-source.md`, `old-site-content-inventory.md`, `consistency-algorithm.md`.*
