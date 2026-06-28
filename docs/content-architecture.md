# Спільний контент-шар (майбутня БД) — стан і план

Мета: **увесь користувацький текст і контент — в одному спільному джерелі**, щоб обидві версії дизайну (gravitas + light) рендерили однаковий контент, а одна правка оновлювала все. Ці спільні файли згодом стануть таблицями БД.

Базується на повному аудиті обох кодових баз (5 областей, воркфлоу `naas-shared-content-audit`).

---

## 1. Що вже спільне (редагується один раз) ✅

Light споживає спільне трьома механізмами:
- **Re-export:** `site-light/src/lib/{i18n,registries,site}.ts` ре-експортують `@shared/lib/*` (light міняє лише кілька href у FOOTER.resources, тексту не чіпає).
- **Спільні дані:** `site-light/src/lib/data.ts` імпортує ті самі `@shared/data/*.json`.
- **Content-колекції:** обидва `content.config.ts` беруть `../site/src/data/pages/*.md` і `news.json`.

Отже вже з одного джерела:
| Тип | Файл(и) — джерело |
|---|---|
| Дані (особи, установи, контакти, анонси, новини, реєстри) | `site/src/data/*.json` |
| Тексти сторінок (історія, місія, статут, рада молодих…) | `site/src/data/pages/*.md` |
| Chrome (меню, кнопки, підвал, підписи, секційні заголовки) | `site/src/lib/i18n.ts` (STRINGS, uk/en) |
| Маршрути/нав/підвал/партнери/showcase/placeholder | `site/src/lib/site.ts` |
| Ліди реєстрів | `site/src/lib/registries.ts` (LEADS) |

> Виправлення попередньої замітки: light **не має** власного `naan-sohodni.md` — рендериться спільний `site/src/data/pages/naan-sohodni.md`.

## 2. Що дублюється / розходиться (треба правити двічі) ❌

| Категорія | Де (обидві версії) | Зараз |
|---|---|---|
| **Meta сторінки** (`<Base title>` + `description`) | майже кожна сторінка | захардкоджено окремо в кожній версії |
| **Hero сторінки** (kicker / title / lead / crumbs) | майже кожна сторінка | захардкоджено окремо (часто навіть різний текст) |
| **Домашній hero** — H1, слоган, «Заснована 1918», місія | gravitas: `HeroC/HeroLeft/HeroWide/HeroImage.astro`; light: `config.ts` + `Hero.astro` | той самий текст у 5–6 місцях |
| **Назва академії** + «ЗАСН. 1918» | `Header.astro` + `Footer.astro` (обидві версії) | захардкоджено |
| **Масиви-контент** | журнали видавництва, офіційні документи, каталог інновацій (обидві версії); картки прозорості, плитки атестації (різний текст) | захардкоджені масиви в сторінках/компонентах |
| **Мікротексти** | плюральні слова (установа/установи/установ; документ…), підписи полів (Тел./Факс/Email/Сайт), статуси («матеріал готується», «Чинна редакція») | захардкоджено в кожній версії |

## 3. Схема спільного контент-шару (майбутня БД)

Доповнюємо наявну модель (нічого не ламаючи):

1. **`ui_strings`** → `site/src/lib/i18n.ts` STRINGS `{key:{uk,en}}`. Сюди переносимо: `brand.name`, `brand.est`, плюральні слова, підписи полів, статуси, секційні kicker/heading. *(bilingual)*
2. **`page_content`** → НОВИЙ `site/src/data/content.json`, ключ = маршрут:
   ```
   "/struktura": { "meta": {"title","description"}, "hero": {"kicker","title","lead"} }
   ```
   + глобальні блоки: `brand{name,est}`, `homeHero{h1,slogan,founding,mission}`. *(укр., поле en — за потреби; сторінковий контент зараз україномовний)*
3. **`sections`** → той самий `content.json` (або окремий `sections.json`): `publications[]`, `officialDocs[]`, `innovationCatalog`, `prozoristCards[]`, `attestationTiles[]`.
4. **`documents`** → вже є: `site/src/data/pages/*.md` (content-колекція).
5. **`data`** → вже є: `site/src/data/*.json`.

Доступ: тонкий `site/src/lib/content.ts` (типізований геттер `page(route)`), який light ре-експортує — як `i18n`/`registries` зараз.

## 4. План міграції (фазами, кожна — gate-verified, обидві версії)

- **Фаза 1 — мікротексти + бренд + домашній hero** у `i18n`/`content.ts`; перепідключити Header/Footer + 4 hero-компоненти (gravitas) і `config.ts`/`Hero` (light). *(найбільше дублювання прози)*
- **Фаза 2 — масиви-секцій** (publications/officialDocs/innovationCatalog/prozoristCards/attestationTiles) у `content.json`; перепідключити відповідні сторінки/компоненти обох версій. *(дискретні «таблиці»)*
- **Фаза 3 — per-page meta + hero** у `content.json[route]`; перепідключити кожну сторінку обох версій читати `page(route).meta/.hero`. *(найбільший обсяг — ~40 сторінок × 2; робити сторінка-за-сторінкою з білдом)*
- **Фаза 4 — gate:** додати в `scripts/check-facts.mjs` перевірку, що сторінки не містять захардкодженого meta/hero (тягнуть із `content.ts`), щоб новий контент не розходився.

Після цього БД-міграція = експорт `content.json` + `*.json` + `*.md` + `i18n` у таблиці; рендер не змінюється.

---

*Аудит: воркфлоу `naas-shared-content-audit` (5 агентів). Споріднене: `consistency-algorithm.md` (як ловимо розходження), `changes-from-source-documents.md`.*
