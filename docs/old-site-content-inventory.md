# Old site (naas.gov.ua) — content inventory for the pending sections

Recon of the legacy Bitrix site to fill the remaining content gaps. The site is **cp1251, HTTP-only, and partly broken** (some `/preview/` pages return "DB query error"; at least one menu link is mislabeled). Public content was fetched directly (curl).

> **Bitrix admin note:** the admin panel **cannot be read by browser-automation tools** — it holds a persistent push/pull connection, so the page never reaches "document idle" and screenshot / page-text / accessibility-tree all time out (`executeScript waited 45000ms for document_idle`). This is structural, not transient. Public content was scraped instead; anything admin-only would need manual copy-paste or academy export.

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
