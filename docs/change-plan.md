# NAAS site — concrete change plan (per source of truth)

For review. Each item is a **specific** change with the file/page and before→after. Grouped by readiness so you can approve in batches. References (§) point to `source-of-truth-naas.md`.

Legend: ✅ already applied (on branches) · 🟢 ready to apply now (just say go) · 🟡 needs one answer from you/stakeholder · 🔵 needs NAAS-supplied content · 🎨 design decision.

---

## ✅ Already applied (gravitas branch `feat/stakeholder-content-corrections`; light `feat/site-light-build`)
1. Founding year **1931 → 1918** (heroes, header, footer, emblem SVG, history prose).
2. Descriptor «вища галузева установа» → «державна самоврядна наукова організація…».
3. Intro count «50» → **176 / 84** prose.
4. Division **order** → official sequence.
5. **mail.ru** emails removed (3).
6. Press unit → «Відділ інформаційного забезпечення та зв'язків з громадськістю».
7. **Emblem** replaced with high-quality Logos version (both gravitas + light).

---

## 🟢 Ready to apply now (no missing info — your OK only)

### R1 — Contacts: complete the phone/fax (§A5)
`data/contacts.json` + `kontakty.astro`.
- Add **second phone** `+38 (044) 521-92-95` (source lists both 521-92-77 and 521-92-95).
- Add **fax** `+38 (044) 280-57-05` (currently no fax field).
- Result: Президія block shows tel (2 lines) + fax + email; «Відділ інформаційного забезпечення…» block keeps its phone/email.

### R2 — Presidium ordering (§C3, §C4)
`data/persons.json` (current president Гриник І.В. already present — no name changes).
- **Members of Presidium** → sort **alphabetically** by surname.
- **Academician-secretaries** → order **by division** (землеробства → … → наукового забезпечення).
- Leadership block order: President → First Vice-President → Vice-Presidents → Chief Scientific Secretary.
- (If `persons.json` doesn't yet tag who is academician-secretary of which division, that's the one input — see Q4.)

### R3 — Structure page: two-part framing (§C1)
`struktura.astro`.
- Restructure into the model the reviewer asked for:
  - **Частина 1 — Структура апарату Президії НААН** (link/intro to Президія; can reuse existing presidium data).
  - **Частина 2 — Наукові установи НААН** → 6 відділення (each with a one-line description) → institutions under each.
- Add a short **description sentence per division** (what the division covers).

### R4 — Publishing section «Видавнича діяльність» (§B7, §C2)
New page `/vydavnycha-diyalnist` (+ nav/footer link).
- **ДВ «Аграрна наука» НААН** — https://www.agroscience-publishing.org.ua/
- Journals: **Вісник аграрної науки**, **Аграрна наука – виробництву**, **Agricultural Science and Practice** (URLs in §B7).
- **Київський аграрний університет НААН** — https://kaunaas.com

### R5 — Fix the "Звіти про діяльність" link target (§C5)
`lib/site.ts` footer currently points **Звіти про діяльність** → agroscience-publishing (the publisher). Reviewer: reports must be **NAAS activity-report files, not a link to ДВ**. Interim: repoint to the official reports page / a dedicated «Офіційні документи» section (final = actual files, see B3).

---

## 🟡 Needs one answer (then I apply immediately)

### Q1 — Institution roster overhaul (the big content fix: "назви установ не вірні", "не 50")
Plan: rebuild `data/institutes.json` from the authoritative §B catalog — correct names, official URLs, correct division assignment, official order. **Merge strategy:** for each §B institution, keep the address/phone/fax from the current entry where it clearly maps; update name + URL; drop entries not in §B; add missing ones.
Three sub-questions:
- **Q1a** Include **«Інститут садівництва»**? (in the report table, not in the typed list — §E2)
- **Q1b** Відділення аграрної економіки = **6** institutions (typed list) or **4** (report table)? (§E3)
- **Q1c** OK to **drop per-institute addresses/phones** that the source doesn't provide (keep only verified name + URL + whatever maps from the old data), or will the stakeholder send updated contact details?

### Q2 — Innovations catalog link (§F1)
Confirm the exact Google-Drive link (2 characters in the id are unreadable: `…fpdJ[I/l]W0…WDY[I/l]p1A`). Needed for the «Інноваційна діяльність» section.

### Q3 — Presidium currency
`persons.json` lists **Гриник І.В.** as president. Confirm the full roster is current as of now (you'd know — you're on it). If yes, R2 ordering is all that's needed.

### Q4 — Academician-secretaries per division
For R2: who is academician-secretary of each of the 6 divisions (names), if not already in `persons.json`?

---

## 🔵 Needs NAAS-supplied content (I'll scaffold the page now; you fill text/files)

### B1 — New activity sections (§C2)
Pages + nav/footer links, with placeholder until content arrives:
- **Міжнародна діяльність НААН** (`/mizhnarodna-diyalnist`)
- **Виставкова діяльність НААН** (`/vystavkova-diyalnist`)
- **Інноваційна діяльність НААН** (`/innovatsiyna-diyalnist`) — will host the catalog link (Q2).

### B2 — «Публічна інформація» content (§C5, §F7)
Page exists as placeholder; reviewer left it empty. Needs the datasets/scope to publish.

### B3 — «Офіційні документи» section (§C5)
- **Статут** ✅ already on site (`/statut`, statut_naan_2021.pdf) — link it here.
- **Рішення та постанови Президії** — need the documents/files.
- **Звіти про діяльність** — need the actual report **files** (resolves R5 properly).

---

## 🎨 Design direction (feedback: "не лише білим")

### D1 — Add colour, reduce all-white feel
Concrete proposed spots (using existing navy `#1E3A5F` / gold `#B8860B` tokens):
- A **navy stats band** (176 установ · 6 відділень · 84 наук. установи · засн. 1918) under the hero.
- **Gold accent rule** on section headers; alternate **muted/tinted section backgrounds** instead of pure white throughout.
- Optional: a **navy "Структура" or "Видавнича діяльність" CTA band**.
- Needs your nod on how bold to go (I can mock 2 options).

---

## Suggested order
1. Approve **🟢 R1–R5** → I apply now (build-verified, on branch).
2. Answer **🟡 Q1–Q4** → I do the roster + presidium + catalog.
3. Decide **🔵 B1–B3** scaffolding + **🎨 D1** direction.
