# Аудит спільного контенту: Gravitas vs Light + архітектура спільного джерела

**Дата:** 2026-06-28 · **Стан:** аудит (verified проти коду, без змін) · Доповнює/уточнює `content-architecture.md`.

Мета: винести **весь контент** (дані + тексти) з обох версій у **нейтральне спільне джерело**, яким не «володіє» жоден сайт, щоб Gravitas, Light і всі майбутні версії тягнули однакові дані, а одна правка оновлювала все. Це джерело згодом стає таблицями БД.

---

## 0. TL;DR

- **Топологія зараз асиметрична й крихка.** Увесь спільний контент фізично лежить у Gravitas (`site/src/data`, `site/src/lib`). Light дотягується до нього через **некомітнутий symlink** `naas_light_wt/site → …/naas_github_pages/site` + alias `@shared/* → ../site/src/*`. Symlink **не в git** (`?? site`) — свіжий `git clone` гілки `feat/site-light-build` **не збілдиться**.
- **Що вже спільне:** усі дані (`*.json`), тексти сторінок (`pages/*.md`), chrome-рядки (`lib/i18n.ts`), маршрути/нав/підвал (`lib/site.ts`), реєстри (`lib/registries.ts`), частина секційних масивів (`data/sections.json`). Але всі вони — **всередині Gravitas**, а не в нейтральному місці.
- **Що розходиться (verified):** з 24 спільних маршрутів **лише 3 ідентичні** по meta+hero. Решта вже дрейфанули: 9 різних `kicker`, 10 різних `lead`, 13 `description` є тільки в Light, плюс домашній hero, бренд-назва, і масиви карток (прозорість/атестація/контакти).
- **Рекомендація:** підняти спільний контент із Gravitas у нейтральну теку `content/` на рівні репозиторію; обидва сайти аліасять `@content`; symlink прибрати. Далі — поетапно перенести й розходжений контент (meta/hero/бренд/масиви) у `content/`.

---

## 1. Топологія зараз (verified)

Три git-worktree:

| Worktree | Шлях | Гілка | Сайт |
|---|---|---|---|
| Gravitas (main) | `/Users/falco/dev/naas_github_pages` | `main` | `site/` |
| Light | `/Users/falco/dev/naas_light_wt` | `feat/site-light-build` | `site-light/` |
| (ds, ігноруємо) | `/Users/falco/dev/naas_github_pages-ds` | `design-system-applied` | — |

Механізм спільності Light → Gravitas:

```
naas_light_wt/
  site  →  /Users/falco/dev/naas_github_pages/site     # symlink, UNTRACKED (?? site)
  site-light/
    tsconfig.json   →  "@shared/*": ["../site/src/*"]   # тобто → Gravitas
    src/content.config.ts → loader base "../site/src/data/pages", "../site/src/news.json"
    src/lib/data.ts        → import "@shared/data/*.json"
    src/lib/i18n.ts        → export … from "@shared/lib/i18n"
    src/lib/registries.ts  → export … from "@shared/lib/registries"
    src/lib/site.ts        → import … from "@shared/lib/site" (ремапить лише кілька footer href)
```

**Gravitas** свої дані імпортує **відносними** шляхами (`./src/data/...`, `../lib/...`) — він «джерело». **Light** усе тягне через `@shared`/symlink. Gravitas `tsconfig.json` **не має** `paths` (не може використати `@shared`) — асиметрія закладена структурно.

> **Винятки, де Light має ВЛАСНЕ (не зі спільного):**
> - `site-light/src/lib/images.ts` — власна логіка `astro:assets` оптимізації + власні декоративні фото в `src/assets/photos` (заглушки зі стоку).
> - `site-light/src/config.ts` — `HERO_H1`, `HERO_SLOGAN`, `GA_ID`, `TURNSTILE_SITEKEY`.

---

## 2. Що ВЖЕ спільне (редагується один раз) ✅

Усе фізично в `site/src/` (Gravitas), Light читає через `@shared`:

| Тип | Джерело | Файли |
|---|---|---|
| Дані | `site/src/data/*.json` | persons, institutes, contacts, anonsy, news, registries, agrolectures, elibrary, video, documents, resources |
| Секційні масиви (частина) | `site/src/data/sections.json` | `publications[]`, `officialDocs[]`, `innovationCatalog` — Phase 1 уже зроблено, обидві версії імпортять |
| Тексти сторінок | `site/src/data/pages/*.md` | статут, майнові питання, доступ, атестація, рада молодих, наан-сьогодні… (content-колекція в обох) |
| Новини | `site/src/data/news.json` | content-колекція `news` в обох |
| Chrome-рядки | `site/src/lib/i18n.ts` | `STRINGS{uk,en}` — меню, кнопки, підписи |
| Маршрути/нав/підвал/партнери | `site/src/lib/site.ts` | `ROUTES, NAV, FOOTER, PARTNERS, SEARCH_INDEX, SHOWCASE` |
| Реєстри документів | `site/src/lib/registries.ts` | `registries, byRoute, LEADS` |

---

## 3. Що РОЗХОДИТЬСЯ (verified divergence inventory)

### 3.1 Per-page `meta` + `hero` — захардкоджено окремо в кожній версії

Метод: екстракція `<Base title/description>` + `<Hero|PageHero kicker/title/lead/crumbs>` з .astro обох версій, маршрут-за-маршрутом (скрипт, не на око). Підсумок по **24 спільних маршрутах**:

| Поле | однакові | **РІЗНІ** | лише Gravitas | лише Light |
|---|---|---|---|---|
| `meta.title` | 21 | 1 | 2 | 0 |
| `meta.description` | 1 | 1 | 0 | **13** |
| `hero.kicker` | 8 | **9** | 2 | 3 |
| `hero.title` | 16 | 1 | 2 | 3 |
| `hero.lead` | 5 | **10** | 2 | 2 |
| `hero.crumbs` | 4 | 0 | 7 | 1 |

**Ідентичні повністю — лише 3 маршрути:** `prozorist/maynovi`, `intelektualna-vlasnist/[slug]`, `publichna-informatsiia/[slug]`.

Приклади дрейфу (той самий маршрут, різний текст):

| Маршрут | Поле | Gravitas | Light |
|---|---|---|---|
| `struktura` | hero.kicker | `Структура Академії` | `6 наукових відділень · 84 наукові установи` ⚠️ хардкод «84» проти обчисленого `divisionCount` |
| `anonsy` | hero.kicker | `Анонси` | `Найближчі події` |
| `kontakty` | hero.kicker | `Контакти` | `Зв'язок з Академією` |
| `prozorist` | hero.kicker | `Прозорість` | `Відкритість та підзвітність` |
| `prozorist/tendery` | meta.title | `Публічні закупівлі — річні плани` | `Публічні закупівлі` |
| `statut` | hero.kicker | `Документи` | `Засновчі документи` |
| `novyny/index` | hero.lead | `Новини та події …` | `Останні новини та повідомлення …` |
| 13 маршрутів | meta.description | *(немає → Base default)* | додано власний опис |
| 7 маршрутів | hero.crumbs | breadcrumb `[НААН сьогодні]` | *(немає)* |

> Також дрейф у **дефолтах `Base.astro`**: різний fallback `description` і різний розгортання `fullTitle` для домашньої.

### 3.2 Домашній hero — той самий текст у різних місцях
- **Light:** `config.ts` → `HERO_H1`, `HERO_SLOGAN`; рендерить `Hero.astro`.
- **Gravitas:** текст усередині компонентів `HeroC.astro` / `HeroWide.astro` (+ `HeroLeft/HeroImage`).
- H1 «Національна академія аграрних наук України» та слоган дублюються між `config.ts` і hero-компонентами.

### 3.3 Бренд-назва + «ЗАСН. 1918» — хардкод у 4 файлах
`Національна академія аграрних наук України` + `ЗАСН. 1918` захардкоджено в `Header.astro` і `Footer.astro` **обох** версій (4 копії назви, 2 копії року). Немає в спільному `i18n`.

### 3.4 Масиви карток — інлайн і розійшлися
| Масив | Gravitas | Light | Стан |
|---|---|---|---|
| Картки «Прозорість» | `prozorist/index.astro` — **5** карток, без іконок | `prozorist/index.astro` — **4** картки, з іконками, інший порядок і текст | ⚠️ дрейф |
| Плитки «Атестація» | (інша структура) | `atestatsiia.astro` — інлайн `tiles[]` | лише Light |
| Картки «Контакти» | (інша структура) | `kontakty.astro` — інлайн `cards[]` | лише Light |

### 3.5 Мікротексти — дубльована логіка
- **Українська плюралізація** «установа/установи/установ» реалізована **двічі й по-різному**: Gravitas `plural()` (повна формула з %100), Light `countWord()` (спрощена). Розходження логіки, не лише тексту.
- **Підписи полів** установ різні набори: Gravitas `Тел./Факс/Email`; Light `Адреса/Сайт/Email/Тел./Факс`.
- Статуси («Чинна редакція», «матеріал готується») — хардкод у кожній версії.

---

## 4. Чому поточна архітектура неправильна

1. **Gravitas «володіє» спільним контентом.** Light — споживач другого сорту через symlink. Третя версія потребувала б ще одного symlink у Gravitas — не масштабується.
2. **Symlink не в git** (`?? site`). Спільне джерело тримається на ручному локальному артефакті; свіжий клон Light не білдиться.
3. **Немає чистої межі.** `site/src/data` і `site/src/lib` змішують і спільний контент, і Gravitas-специфічний код (компоненти, стилі).
4. **Розходження не ловиться.** Однаковий за змістом текст уже розійшовся (розділ 3) — бо редагується у двох місцях, без єдиного джерела й без гейту.

---

## 5. Цільова архітектура — нейтральне спільне джерело

Підняти спільний контент **з Gravitas у нейтральну теку рівня репозиторію**, яку аліасять обидва (й майбутні) сайти. Symlink прибрати.

```
naas_github_pages/
  content/                      # ← нейтральне спільне джерело (майбутня БД)
    data/        *.json         # persons, institutes, contacts, anonsy, news, registries, sections…
    pages/       *.md           # тіла сторінок
    strings/     ui.ts|json     # i18n STRINGS + мікротексти + бренд + плюралізація + підписи полів
    site.ts                     # ROUTES, NAV, FOOTER, PARTNERS
    registries.ts               # registries, LEADS
    content.json                # НОВЕ: per-route {meta,hero} + homeHero + brand (розходжений контент → уніфікований)
  sites/                        # (варіант A) обидва дизайни як сусіди
    gravitas/                   # було site/
    light/                      # було site-light/
```

Кожен сайт: `@content/* → ../../content/*` (tsconfig + astro alias). Жодного symlink. Доступ до per-page контенту — тонкий типізований геттер `content/lib.ts` → `page(route).meta/.hero`, який обидва сайти імпортять однаково.

**Варіанти фізичної організації (рішення за вами — впливає на git/деплой-воркфлоу):**

- **A. Монорепо, обидва сайти сусідами під `sites/`, `content/` в корені.** Найчистіше, масштабовано на v3, без symlink, свіжий клон працює. Ціна: «гілка-на-дизайн» стає «тека-на-дизайн»; Light зливається в спільний tree; два білд/деплой-таргети (вони вже є: `dist-v1/dist-v3`, окремі CF Pages проєкти).
- **B. Гілки окремо; `content/` у корені main; Light аліасить через symlink на нейтральну `content/`.** Менший крок, зберігає гілку-на-дизайн. Але symlink-крихкість лишається; `content/` на main, гілка Light залежить від сусіднього worktree.
- **C. Окремий workspace-пакет `@naas/content` (pnpm/npm workspaces).** Найбільш «правильно» (явна версіонована залежність), але найважче зараз (workspace-тулінг, білд-крок).

Рекомендація: **A** — найчистіша межа й масштаб; B як проміжний крок, якщо гілкову модель поки чіпати не хочемо.

---

## 6. План міграції (поетапно, кожна фаза — gate-verified, обидві версії білдяться)

- **Фаза 0 — каркас.** Створити `content/`; перенести наявне вже-спільне (`data/*`, `pages/*`, `i18n`, `site`, `registries`, `sections`) із `site/src` у `content/`. Gravitas і Light переключити на `@content`. Прибрати symlink. *(механічно, без зміни тексту — лише розташування)*
- **Фаза 1 — бренд + домашній hero + мікротексти** у `content/strings` + `content.json` (`brand{name,est}`, `homeHero{h1,slogan}`, плюралізація, підписи). Перепідключити Header/Footer + hero-компоненти/`config.ts`.
- **Фаза 2 — масиви карток** (прозорість/атестація/контакти) у `content/data`. *Потрібно обрати канонічний варіант* (розділ 7).
- **Фаза 3 — per-page meta+hero** у `content.json[route]`. ~24 маршрути × 2; сторінка-за-сторінкою з білдом. *Потрібно обрати канонічний текст для ~10 дрейфаних lead/kicker.*
- **Фаза 4 — гейт** у `scripts/check-facts.mjs`: сторінки не містять захардкодженого meta/hero/бренду (тягнуть із `content`), щоб новий контент не розходився.

Після цього БД-міграція = експорт `content/` у таблиці; рендер не змінюється.

---

## 7. Відкриті рішення (потрібен вибір канонічного контенту)

Уніфікація вимагає обрати ОДНЕ значення там, де версії розійшлися:
- ~10 hero `lead` і 9 `kicker` (напр. прозорість: `Прозорість` vs `Відкритість та підзвітність`).
- meta `description`: брати Light-версії (їх 13, Gravitas покладається на default)?
- Картки «Прозорість»: 5 (Gravitas) чи 4 (Light), з іконками чи без.
- `struktura` kicker: обчислювати з даних (як Gravitas) — прибрати хардкод «84».

Це контент-рішення (можливо, за погодженням зі стейкхолдером), не технічні — виносимо в окремий крок після узгодження каркаса.

---

*Метод аудиту: прямі tool-перевірки коду обох worktree (tsconfig/astro alias, lib re-exports, content.config, скрипт екстракції meta+hero по 24 маршрутах, git-стан symlink). Споріднене: `content-architecture.md`, `consistency-algorithm.md`.*
