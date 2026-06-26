# NAAS Portal — Brand Voice Audit

Audit of live site copy against [`brand-voice-messaging.md`](./brand-voice-messaging.md).

**Method:** site copy across ~30 component/page files (plus the content data
files they render — `data/news.json`, `data/registries.json`, `data/anonsy.json`,
`data/pages/*.md`, `lib/i18n.ts`, `lib/site.ts`) was extracted and checked
against the voice spec by parallel agents, then **every finding was adversarially
re-verified** against the source before inclusion. [verified: workflow
find→verify, 15 agents; high-severity items + asset/import facts re-confirmed by
direct tool calls — see below]

**Result:** 64 raw findings → **57 confirmed/adjusted, 7 rejected** by
verification. Breakdown: **6 high · 24 medium · 27 low.**

> Spot-checks I re-ran directly: `news.json:6`, `registries.json:1371/1396`,
> `naan-sohodni.md:9`, the `intelektualna-vlasnist.astro` filter, `HeroC.astro:20`,
> `index.astro:11` — all confirmed verbatim. [verified: sed/grep above]

---

## Systemic themes (fix these patterns, not just instances)

1. **Raw filenames as document titles** — `data/registries.json` renders file
   stems directly via `RegistryList.astro:18`: "На сайт", "ПЗ остаточна ред",
   "httpsips.gov.uauainfo resurses.html", "Zvit cilyovi programy2014",
   "...КАЛ.ПЛАН КВІТЕНЬ 2026 копія". **Highest-impact theme.**
2. **OCR garble in `data/pages/*.md`** — broken spacing and typos on the IP and
   property pages ("З акон", "власност і", "Тоопографія", "КАБІНЕТ У МІНІСТРІВ").
3. **Bureaucratic fog** — "здійснює наукове забезпечення", "у процесі
   наповнення", "передбачено технічним завданням" surface in the mission, empty
   states, and placeholders.
4. **Self-superlatives** — "вища галузева наукова установа" (heroes/index),
   "провідних науковців" (news ×3).
5. **Marketing-slogan news headlines** — "Наука, що трансформує ринок: …",
   "Золото Миронівки: …", "Хто проектуватиме агроінновації?".
6. **EN bilingual gaps & drift** — chrome strings missing EN or with translated
   officialese ("Reports on the activities of the NAAS"); hero switcher labels,
   founding tag, copyright, alts not routed through `i18n`.

---

## High severity (6) — prominent copy / rendering defects

1. **Mission paragraph is bureaucratic fog** — `data/pages/naan-sohodni.md:9`
   (rendered in `.prose`). "НААН **здійснює наукове забезпечення**… **забезпечує
   підготовку та атестацію**… **упровадження**…" stacks the exact nominalizations
   the spec forbids on the canonical mission statement.
   → "НААН **формує наукову основу** для розвитку АПК та продовольчої безпеки
   держави, координує фундаментальні й прикладні дослідження, **готує та атестує**
   наукові кадри і **впроваджує** наукові розробки у виробництво."

2. **IP page renders a garbled OCR dump** — `pages/intelektualna-vlasnist.astro:7-9`
   filters md lines only on `!startsWith('#')`, so it renders ~45 rows: the intro,
   the 4 intended sections, **and the entire legal-acts OCR dump (md lines 12-52)**
   with literal "- " markers and broken spacing.
   → Render only the 4 intended subsections; strip "- " markers and the intro;
   fix OCR (e.g. «Закон України «Про охорону прав на винаходи і корисні моделі»»).

3. **Registry titles are raw file stems** — `data/registries.json` (rendered by
   `RegistryList.astro:18` on every registry page). Offenders incl. "На сайт"
   (:18), "Нормативно правова база" (:26, missing hyphen), "ПЗ остаточна ред"
   (:34), "Р чний план" (:501), "Zvit cilyovi programy2014" (:1396).
   → Replace with the document's real, attributable name; never publish workflow
   artifacts. *(Real titles should be confirmed before publishing — examples are
   advisory.)*

4. **Top news headline is a marketing slogan** — `data/news.json:6`. "**Наука, що
   трансформує ринок:** НААН переводить кормовиробництво на стандарти ЄС" renders
   as the article `<h1>`, the `/novyny` card, **and the homepage top-5 feed** — so
   it sits at the very top of the homepage.
   → "НААН переводить кормовиробництво на стандарти ЄС"

5. **Mangled URL as link text** — `data/registries.json:1371`. "httpsips.gov.
   uauainfo resurses.html" is the visible title of an item in the IP registry.
   → "Інформаційно-патентний пошук — ips.gov.ua" *(inferred from the URL; confirm
   against the actual document).*

6. **Latin-transliterated filename as the only item on a page** —
   `data/registries.json:1396`. "Zvit cilyovi programy2014" is the sole entry in
   the «Віртуальна виставка «Інноваційні розробки»» registry.
   → "Звіт за цільовими програмами, 2014"

---

## Medium severity (24) — grouped

**Self-superlative "вища галузева наукова установа"** *(see judgment note below)*
- `HeroC.astro:20`, `index.astro:11` (meta description) — replace with the
  source-accurate "**Державна самоврядна наукова організація** — науково-
  методичний і координаційний центр з наукових проблем розвитку АПК" (also low-sev
  copies in `HeroImage.astro:28`, `HeroWide.astro:21`, `HeroLeft.astro:19`).

**Bureaucratic / internal-process placeholders** (`lib/site.ts:82-83`,
`lib/i18n.ts:44`, `DocPage.astro:24`, `404.astro:10`)
- "Розділ передбачено технічним завданням. Контент у процесі наповнення." →
  "Розділ у підготовці. Матеріали з'являться найближчим часом."
- "Стрічка формується автоматично… Реалізація — у версії з CMS (V2)." →
  "Новини наукових відділень з'являтимуться тут." / EN: "News from the research
  divisions will appear here."

**Marketing-slogan / promotional news framing** (`data/news.json`)
- :24 "Хто проектуватиме агроінновації? У НААН створюють Раду молодих вчених" →
  "У НААН створюють Раду молодих вчених"
- :42 "Золото Миронівки: …" → "Миронівський інститут пшениці НААН провів
  Всеукраїнський день поля — День пшениці"

**Self-superlative "провідних / масштабний"** (`data/news.json:18,36`) — drop
"провідних"/"масштабний". **`:60` "перша українська…"** — keep "перша" only if
sourced.

**OCR / spelling garble in `data/pages/*.md`** (Precise)
- `intelektualna-vlasnist.md:13` "Спе ціальне… власност і" → fix spacing.
- `intelektualna-vlasnist.md:36` "Тоопографія" → "Топографія".
- `maynovi-pytannya.md:3` "ПОСТАНОВА КАБІНЕТ У МІНІСТРІВ…" → "Постанова Кабінету
  Міністрів України «Про затвердження Порядку списання об'єктів державної
  власності»".

**EN bilingual drift** (`data/anonsy.json:4`, `lib/i18n.ts:12`)
- "Reports on the activities of the NAAS" → "NAAS Activity Report".
- `nav.training` UA "Атестація та кадри" → "Атестація та підготовка кадрів"
  (match search index); keep EN "Training & Certification".

**Fog on prominent copy** (`publichna-informatsiia.astro:33`,
`data/news.json:52`)
- "Категорії публічної інформації розпорядника та набори даних. Перелік
  підрозділів:" → "Категорії публічної інформації та набори даних розпорядника."
- "Мінекономіки/довкілля/с-г" → full ministry name spelled out.

**Registry titles** (`registries.json:308,783`) — "…КАЛ.ПЛАН КВІТЕНЬ 2026 копія"
→ "Календарний план НААН на квітень 2026"; "БЮДЖЕТНИЙ ЗАПИТ Форма БЗ 2…" →
"Бюджетний запит, форма БЗ-2 (індивідуальна), КПКВ 6591020 — уточнення станом на
01.01.2026".

---

## Low severity (27) — polish

Condensed; full list in the audit data. Main clusters:

- **Route chrome through `i18n` for EN** — hero switcher labels
  (`Header.astro:29` Класична/Емблема/Банер → Classic/Emblem/Banner), footer
  founding tag & "© 2026…" & "НААН — головна" & emblem alt (`Footer.astro:18-22,70`),
  `atestatsiia.astro:13` hero strings, `publichna-informatsiia.astro:23`
  "перенесено за ТЗ" (internal note — drop or make reader-facing).
- **Drop residual superlatives / hype** — `news.json:6` "трансформує ринок"
  (also high), `news.json:9` "провідних науковців".
- **Spelling / punctuation** — `registries.json:26` "Нормативно правова база" →
  hyphen; `:59` "2026 2030 рр." → en-dash "2026–2030"; `:485` "РІЧНИЙ ПЛАН
  ЗАКУПІВЕЛЬ 2015 рік" → sentence case; `intelektualna-vlasnist.md:6` straight
  quotes → «»; `news.json:45` drop redundant "України".
- **Plainer wording** — `statut.md:5`, `404.astro:10`, `DocPage.astro:24`,
  `registries.json:1346` ("…де готують аспірантів").

---

## Judgment call: "вища галузева наукова установа"

The verifier **rejected** flagging this on `naan-sohodni.md:1` ("вища галузева
наукова установа держави, головний науково-методичний…") — reading "вища /
головний" there as an **accurate tier/role descriptor**, not a boast. But it
**confirmed** replacing the same phrase on the **homepage heroes and meta
description**, where it functions as a self-superlative.

My recommendation: on **marketing surfaces (heroes, meta)** prefer the
source-grounded self-description **"Державна самоврядна наукова організація —
науково-методичний і координаційний центр…"** [verified: naas_about.txt]. On
**institutional/about prose**, "вища галузева наукова установа" is defensible as
a factual descriptor. **This is a call for you** — it depends on NAAS's preferred
official self-description.

---

## Not flagged (rejected by verification) — 7

The adversarial pass dropped these to avoid false positives, e.g.: "вища галузева
наукова установа" on the about page (accurate descriptor); "№8/2010" vs "№ 8/2010"
spacing (trivial, and the spec itself isn't consistent); "Для людей з вадами зору"
(person-first language is not in the spec — taste, not a rule); aria-labels that
are correct as-is. [verified: workflow verify stage, statuses re-extracted]

---

## Recommended next actions

1. **Data hygiene first (highest ROI):** clean `data/registries.json` titles and
   the OCR in `data/pages/intelektualna-vlasnist.md` + `maynovi-pytannya.md`, and
   fix the `intelektualna-vlasnist.astro` filter (defect #2). These are the most
   visible and partly *defects*, not just tone.
2. **De-market the news feed:** strip slogans from `data/news.json` titles
   (#4 and medium items) — they front the homepage.
3. **Rewrite the mission paragraph** (`naan-sohodni.md:9`) and the fog
   placeholders (`lib/site.ts`, `lib/i18n.ts`).
4. **Close the EN chrome gaps** in `lib/i18n.ts` / components.
5. **Decide the "вища галузева" question** (above), then apply consistently.

I can apply any tier of these directly — say the word (e.g. "apply the high-sev
fixes" or "fix the registries titles"). For the registry/document titles I'll
confirm real names with you first, since several rewrites are inferred.
</content>
