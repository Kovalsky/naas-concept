# Old site (naas.gov.ua) — content inventory for the pending sections

Recon of the legacy Bitrix site to fill the remaining content gaps. The site is **cp1251, HTTP-only, and partly broken** (some `/preview/` pages return "DB query error"; at least one menu link is mislabeled). Public content was fetched directly (curl).

> **Bitrix admin access (corrected 2026-06-28):** the admin's *read* tools (screenshot / page-text / accessibility-tree) all time out because Bitrix holds a live notification connection so the page never reaches "document idle" (`executeScript waited 45000ms for document_idle`). **However, executing JavaScript in the page (`javascript_tool`) works** — it doesn't wait for idle — so the admin IS readable that way (via the user's logged-in session). Findings from the admin are in §Admin below.

## Admin findings (read via JS, 2026-06-28)

The content tree has **38 content iblocks**. Cross-checked against the pending items:
- ❌ **No iblock** for Міжнародна діяльність, Виставкова діяльність, Інноваційна діяльність, or presidium decisions/постанови. They do **not exist** in the admin — confirming they are genuinely *new* sections to be authored by the academy, not migratable.
- ✅ **Президія** exists as iblocks: Бюро президії, Склад президії, Апарат президії (roster already current in `persons.json`).
- ✅ **Публічна інформація** subsections exist as iblocks (Бюджетні запити, Тендери, Наукові розробки, Нормативно-правова база, Планування, Підготовка/атестація, Використання коштів, Паспорт бюджету, Оголошення, Різне, FAO, Вакансії) — mostly already migrated.
- ⚙️ **«Відділення та установи НААН» (iblock 9)** holds the institution structure (6 division sections), but its data is **dated 20.11.2017** — old. It predates «Інститут садівництва» (which only appears in the 2026 report), so the admin has **no URL for садівництво** → it stays name-only, as agreed. The old per-institute contacts here are stale (the reviewer flagged old names) and were intentionally not reused (roster = names + URLs from the fresher typed list).

## ✅ Retrievable (public site)

| Pending item | Old-site location | Status / asset |
|---|---|---|
| **Звіти про діяльність (file)** | `/preview/zvit-pro-diyal'nist'-naan/` → **`http://naas.gov.ua/upload/podani.pdf`** | Valid PDF, **1.18 MB** (94 fonts, 84 images). Candidate activity-report file — **confirm it's the current/correct report** (filename is generic «podani» = "submitted"). The report page also references the publisher (agroscience). |
| **Публічна інформація** | `/content/publichna-informaciya/` — **14 subsections** | Бюджетні запити · Використання коштів держбюджету · Майнові питання · Наукові розробки та пропозиції · Нормативно-правова база · Оголошення · Паспорт бюджетної програми · Підготовка та атестація кадрів · Планування діяльності · Тендери · ФАО · Різне · FAQ. **Mostly already migrated** to the new site (registries + publichna page). |
| **Каталог інноваційних розробок** | `/preview/katalog-…2019-2025/` + the resolved Drive file | `https://drive.google.com/file/d/19noLIfpdJlW0mjxNkY21SQjxhWDYlp1A/view` |
| **Статут** | `/content/statut-naan/` | PDF already on the new site. |
| **Президія** | `/content/prezidiya/` | Roster already current in `persons.json`. |

## ❌ NOT present as clean content on the old site

| Pending item | Finding |
|---|---|
| **Міжнародна діяльність** | «міжнар…» appears **nowhere** on the public site. No section exists. → academy must provide. |
| **Виставкова діяльність** | Menu links to it, but the target page (`…/publichna-informaciya/vitannya/`) renders **«Вакансії»** (mislabeled in their CMS). Only loosely related: `/content/Intelekt_vlasnist/Virtualna-vistavka` (a "virtual exhibition of innovations"). Not a clean section. |
| **Інноваційна діяльність** | No dedicated page — only pieces (the catalog + the virtual exhibition + innovation institutes). |
| **Рішення / постанови Президії** | No public section found. → admin (unreadable) or academy. |

## Conclusion
The old site reliably yields the **activity-report file**, the **Публічна інформація** structure (largely already migrated), the **catalog**, **statut**, and **presidium**. The reviewer's *new* sections (**Міжнародна / Виставкова / Інноваційна діяльність**) and the **presidium decisions** do **not** exist as clean content on the old site — which is consistent with the reviewer's note to «**Додати**» (add) them. Those require **academy-supplied content**; they cannot be migrated because there is nothing migratable.
