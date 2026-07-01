# Міграція контенту старого naas.gov.ua 1:1 (SEO-збереження) + портал Next.js — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (рішення користувача 2026-07-02: виконання — у **НОВІЙ сесії**, свіжий сабагент на задачу, рев'ю між задачами). Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **НЕ ПОЧИНАТИ, поки не виконана передумова:** засетаплена нова архітектура з Next.js (див. розділ «Передумови й послідовність треків» нижче).

**Goal:** перенести ВЕСЬ публічний контент старого сайту `naas.gov.ua` (Bitrix) на новий портал (Next.js) один-до-одного — з тими самими URL, тими самими title/контентом, server-side рендером, sitemap.xml та JSON-LD — і викотити на неіндексований піддомен `naas.gov.ua` так, щоб у момент перемикання домену SEO-вага збереглась 1:1 (нуль редіректів для мігрованих сторінок).

**Architecture:** два нові пакети в репо. (1) `migration/` — Node-пайплайн: ввічливий BFS-краулер старого сайту (cp1251→UTF-8) → інвентар URL (`inventory.jsonl`) → класифікація (`url-map.json`) → екстракція контенту в JSON (`out/content/`) → верифікатор паритету. (2) `portal/` — Next.js (App Router, SSG + ISR-готовність), який віддає мігрований контент за **точними старими URL** (включно з query-string URL типу `?ELEMENT_ID=`), з env-перемикачем `INDEXING` (noindex на піддомені → повна індексація після свапу). Сховище контенту зараз — JSON-файли (за рішенням: «JSON now, database later»); інтерфейс `content-store` ізолює це рішення, щоб пізніше підмінити на Directus API без зміни сторінок.

**Tech Stack:** Node ≥20 (на сервері 20.20.2 — це стеля сумісності), cheerio (парсинг HTML), vitest (тести обох пакетів), Next.js App Router (`output: 'standalone'`, `trailingSlash: true`), rsync+SSH (деплой на Mirohost eVPS), nginx-proxy + systemd через панель/support Mirohost.

## Передумови й послідовність треків (КОЛИ виконувати цей план)

Цей план — **третій** трек у послідовності. Не починати, поки не закриті перші два:

0. **Showcase «сайт як є» (паралельний трек, вже спланований):** статичний `site-modern` на `new.naas.gov.ua` — план `2026-07-02-modern-static-mirohost.md`. Незалежний від цього плану; займає піддомен `new.`.
1. **Сетап нової архітектури — ПЕРЕДУМОВА цього плану:** за `docs/architecture/portal-architecture.md` (роадмап §10–11) має бути розгорнутий Next.js-портал: ініціалізований застосунок `portal/`, Node-процес на сервері (systemd-сервіс через support Mirohost), nginx-proxy на піддомен порталу. Це окремий план в окремій сесії. Directus+MySQL для ЦЬОГО плану **не обов'язкові** (сховище контенту тут — JSON за рішенням «JSON now, database later»); якщо вони вже стоять — не заважають.
2. **Цей план (1:1 міграція):** виконується ПІСЛЯ п.1 — наповнює вже розгорнутий Next.js-портал мігрованим контентом за старими URL і готує перемикання домену.

Як план поводиться з уже зробленим у п.1: **Task 7** (каркас `portal/`) і **Task 13** (systemd/nginx/піддомен) при вже наявних артефактах НЕ створюють їх заново — лише **звіряють** відповідність контракту цього плану (`trailingSlash`, умовний `standalone`, env `INDEXING/SITE_ORIGIN/LEGACY_CONTENT_DIR`, порт) і **доповнюють** те, чого бракує. Тести цих тасків — контракт, який має пройти незалежно від того, хто створив застосунок.

## Global Constraints

- **Закон:** `*.naas.gov.ua` хоститься ТІЛЬКИ в Україні (Mirohost). Жодних Cloudflare/закордонних CDN для gov.ua.
- **Перед КОЖНИМ підключенням до сервера (SSH/rsync/scp) — явно спитати користувача.** Жорстке правило проєкту. FTP-питання цього плану не стосуються (транспорт — rsync по SSH).
- **Старий сайт недоторканний:** на сервері писати тільки у `~/portal-app/` (нова тека). Файли Bitrix читати можна (read-only: `ls`, `cat`, `cp` З них), змінювати/видаляти — ніколи. Ніяких запитів до MySQL старого сайту в цьому плані.
- **Краулінг прод-сайту — ввічливий:** concurrency 2, пауза ≥500 мс між запитами, тільки `GET`/`HEAD`, User-Agent `NAAS-migration/1.0`. Ніколи не чіпати `/bitrix/` (адмінка/ядро) — виняток нижче не передбачений.
- **Паралельні сесії в репо:** `content/`, `site/`, `site-light/`, `site-modern/`, `site-lucidity/`, `scripts/check-facts.mjs` — чужі, НЕ редагувати. Цей план створює лише нові теки `migration/`, `portal/`, `docs/runbooks/` + рядки в кореневому `.gitignore`. Чужі untracked-файли (`CLAUDE.md`, `docs/architecture/`, `docs/infrastructure/`, `docs/design-review-*.md`) у коміти не включати.
- **Гілка:** уся робота на `feat/legacy-migration-portal` (worktree створюється при виконанні — скіл using-git-worktrees). Кожен коміт — push у `origin` тієї ж гілки. Перед комітом: `git branch --show-current` + `git status --short`.
- Креденшели тільки з `~/.naas_hosting.env` через `source`; значення ніколи не друкувати (у вивід, логи, коміти).
- **Node-стеля:** на сервері Node **20.20.2** без можливості оновити самим. Усі залежності (`next`, `cheerio`, `vitest`) при встановленні перевіряти на `engines`-сумісність із Node 20 і за потреби пінити старішу мажорну версію.
- Відповідати користувачу українською.

## Довідка: перевірені факти (сесія 2026-07-02, curl/read)

- Старий сайт: `http://naas.gov.ua` — **тільки http** (https зламаний, self-signed), сторінки **windows-1251**. Головна віддає 200. `www.naas.gov.ua` теж віддає 200 без редіректу (дубль-хост).
- `robots.txt` старого сайту — друпалівський релікт: `Crawl-delay: 10` + Disallow лише друпалівських шляхів (`/includes/`, `/misc/`, …, `/?q=…`) — **жоден не блокує контент Bitrix**. `sitemap.xml` — 404.
- **Патерни URL** (з головної + admin-probe):
  - path-новини: `/newsall/newsnaan/8984/` → 200; **без trailing slash теж 200 без редіректу** (дублі).
  - query-новини: `/newsukraine/?ELEMENT_ID=8959` → 200 (валідний, індексований патерн!).
  - `/2/detail.php?ID=8516` → **404** (битий лінк прямо на старій головній; стилізована 404 ≈57 КБ).
  - контент-сторінки: `/content/<розділ>/<підрозділ>/` — змішаний регістр (`/content/Intelekt_vlasnist/`), бувають **без trailing slash** (`/content/publichna-informaciya/FAO`) і навіть **з пробілом** (`/content/publichna-informaciya/pasport budget/`).
  - інші кореневі теки (з файл-менеджера Bitrix): `Agrolectures`, `Viddilennya_instituty`, `academi`, `contacts`, `en` (англ. версія 2017 р.), `news`, `newsall`, `newsukraine`, `newsworld`, `preview`, `content`, `images`, `img`, `slide`, `video`.
- **Шаблон Bitrix s1:** основний контент у `<main class="content">`; `<h1>` всередині; `<title>` без суфікса сайту (напр. «Про НААН»); `meta description/keywords` присутні, але **порожні**. Хлібних крихт у шаблоні нема.
- **Обсяг (оцінки admin-probe 2026-06):** 38 контент-iblock-ів; `/upload/iblock/` ≈ 3 826 шардів, ~10 900 файлів (~9 200 зображень); `/upload/medialibrary/` ≈ 846 файлів; `/content/` — 92 підтеки. Новинні ID сягають ~8985.
- Попередні витяги в корені репо (`naas_extract*`, `naas_content_bundle_extracted`, `naas_news_slice`, `naas_persons`) — **куровані зрізи для дизайн-прототипів, НЕ повна міграція** (9 новин, 28 персон). Використовуємо їх лише як тест-фікстури та довідку. `naas_news_slice/raw/` містить збережені HTML новинних сторінок; у корені лежать `naas_about.html`, `naas_home.html` тощо (сирі cp1251) — готові фікстури.
- Локальний Node: v25.9.0; `new TextDecoder('windows-1251')` працює (перевірено). На сервері Node 20.20.2 (TextDecoder там теж є, full-icu — перевірено в сесії 2026-07-01).
- Сервер (деталі: `docs/infrastructure/mirohost-server.md`): eVPS-8 Debian 12, SSH `vs581.mirohost.net:22`, user `bbnaasnew`, пароль з env; root НЕМА, crontab заблоковано; systemd-сервіси створює support Mirohost за нашими даними; nginx-proxy на внутрішній порт вмикаємо самі в панелі `control.mirohost.net` (пакет H-74503); HOME `/var/www/naasZ4` спільний зі старим сайтом. Диск: df показує ~242 ГБ вільно (номінал тарифу 49 ГБ — квоту звірити перед копіюванням асетів).
- **Невизначеність (перевіряється в Task 12):** чи той самий фізичний сервер віддає live `naas.gov.ua` (A-запис 77.87.193.125). Якщо так — асети копіюються локальним `cp`; якщо ні — дзеркалимо по HTTP сервер-до-сервера.
- Паралельний план `docs/superpowers/plans/2026-07-02-modern-static-mirohost.md` займає піддомен **`new.naas.gov.ua`** (статичний showcase site-modern, FTP). Наш портал деплоїться на **інший** піддомен (пропозиція за замовчуванням: `portal.naas.gov.ua`; фінальне ім'я підтверджує користувач у Task 12). Showcase не чіпаємо.

## Політика URL (доктрина цього плану)

1. **Кожна мігрована сторінка живе за своїм СТАРИМ URL** — байт-у-байт той самий path (+query для query-URL). Нуль редіректів для канонічних старих URL.
2. Нові розділи (яких на старому сайті нема — «Міжнародна діяльність» тощо) — за новими URL; це поза цим планом.
3. Дублі старого сайту (та сама сторінка з/без trailing slash; `www.`-хост) нормалізуються: канонічна форма — **зі слешем, apex-хост**; неканонічна форма віддає 308 → канонічну (Next `trailingSlash: true`). Це єдине контрольоване відхилення від старої поведінки (старий віддавав 200 на обидві) — редірект на канонікал безпечний і кращий за дубль.
4. Асети (`/upload/…`, `/content/**/*.pdf|doc…`, `/images/…`, `/img/…`, `/video/…`, `/slide/…`) зберігають **точні шляхи й імена файлів** (без перекодування/переіменування — байт-ідентичні шляхи).
5. Биті на старому сайті URL (404, як `/2/detail.php?ID=8516`) лишаються 404 і на новому (їх НЕ «чинимо»).
6. `/bitrix/**` (шаблонні css/js/адмінка) на новий сайт **не переносяться** — у нового порталу власний фронтенд-шар.
7. Внутрішні службові маршрути нового порталу, яких не було на старому (`/newsukraine/el/<id>` — ціль rewrite), самі емітують `canonical` на стару query-форму.

## Схема даних (контракт між `migration/` і `portal/`)

```
migration/out/
  inventory.jsonl          # 1 рядок = 1 URL (комітиться в git — це SEO-контракт)
  url-map.json             # класифікація: key → {type, feed?, id?, page?}   (комітиться)
  assets-manifest.tsv      # asset_path <TAB> referrer <TAB> status <TAB> bytes (комітиться)
  reports/                 # звіти краулінгу/паритету (комітяться)
  raw/                     # сирі байти сторінок <sha1(key)>.html (gitignored)
  content/                 # видобутий контент (gitignored; деплоїться rsync-ом)
    index.json             # { "<key>": {file,type,title,feed?,id?,date?} }
    pages/<sha1(key)>.json # LegacyPage (схема нижче)
```

Запис `inventory.jsonl`: `{"key","path","query":{},"fetchUrl","status","contentType","title","sha1","bytes","location"?,"referrer","fetchedAt","rawFile"?}`.
`key` — канонічний ідентифікатор: **декодований** UTF-8 path + відсортований whitelist-query (`?ELEMENT_ID=8959`). Слеш у кінці — **сира виявлена форма** (як лінкує старий сайт: `/newsall/newsnaan/8984/` зі слешем, але `/content/publichna-informaciya/FAO` — без; НЕ «канонізувати» слеш до фетчу — слеш-твіни дедуплікуються, а узгодження на боці порталу робить `content-store` фолбеком). `fetchUrl` зберігає **оригінальне** відсоткове кодування (для повторних фетчів зі старого сервера).

`LegacyPage` (JSON у `content/pages/`):

```json
{
  "key": "/content/statut-naan/",
  "type": "page | news-article | listing | home",
  "feed": "newsnaan", "id": 8984, "viaQuery": false,
  "title": "Статут НААН",
  "metaDescription": null,
  "h1": "Статут НААН",
  "dateISO": "2026-06-24",
  "bodyHtml": "<p>…оригінальні href/src, без <script>…</p>",
  "images": ["/upload/iblock/29b/ФОТО.jpg"],
  "files": [{"href": "/upload/podani.pdf", "text": "Звіт"}],
  "sourceUrl": "http://naas.gov.ua/content/statut-naan/",
  "fetchedAt": "2026-07-02T12:00:00Z",
  "contentSha1": "…"
}
```

Поля `feed/id/viaQuery/dateISO` — тільки для новин; `metaDescription` майже завжди `null` (на старому сайті порожньо — фіксуємо факт, НЕ вигадуємо описи в цьому плані).

---

### Task 1: Робоча гілка + каркас `migration/`

**Files:**
- Create: `migration/package.json`, `migration/.gitignore`, `migration/README.md`
- Modify: `/.gitignore` (корінь — 3 рядки)

**Interfaces:**
- Produces: npm-пакет `naas-migration` з робочим `npm test` (vitest), теки `lib/ bin/ test/ out/`.

- [ ] **Step 1: Гілка/worktree**

Worktree **вже створено** 2026-07-02 (разом із комітом цього плану): `/Users/falco/dev/naas_migration_wt`, гілка `feat/legacy-migration-portal` (запушена в origin). Увійти; якщо worktree прибрали — відтворити з наявної гілки:

```bash
cd /Users/falco/dev/naas_migration_wt 2>/dev/null || {
  cd /Users/falco/dev/naas_github_pages
  git worktree add ../naas_migration_wt feat/legacy-migration-portal
  cd ../naas_migration_wt
}
git branch --show-current   # очікувано: feat/legacy-migration-portal
git pull --ff-only origin feat/legacy-migration-portal
```

- [ ] **Step 2: Каркас пакета**

`migration/package.json`:

```json
{
  "name": "naas-migration",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "vitest run",
    "crawl": "node bin/crawl-live.js",
    "extract": "node bin/extract-all.js",
    "verify": "node bin/verify-parity.js"
  }
}
```

`migration/.gitignore`:

```
out/raw/
out/content/
out/crawl-state.json
node_modules/
```

`migration/README.md` — 10 рядків: призначення пайплайна, порядок команд (`crawl → extract → verify`), посилання на цей план і `docs/architecture/portal-architecture.md`.

- [ ] **Step 3: Залежності з перевіркою engines**

```bash
cd migration
npm i cheerio && npm i -D vitest
node -e "for (const p of ['cheerio','vitest']) console.log(p, require('./node_modules/'+p+'/package.json').engines ?? 'no engines field')"
```

Очікувано: engines відсутні або сумісні з `>=20`. Якщо якийсь пакет вимагає Node >20 — пінити попередню мажорну (`npm i vitest@2`) і зафіксувати в README.

- [ ] **Step 4: Кореневий `.gitignore`**

Додати в кінець кореневого `.gitignore`:

```
# ── Legacy-migration pipeline: сирі дзеркала й видобутий контент (регенеруються) ──
/migration/out/raw/
/migration/out/content/
/migration/out/crawl-state.json
```

- [ ] **Step 5: Смок-тест vitest**

`migration/test/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';
describe('toolchain', () => {
  it('декодує windows-1251 нативним TextDecoder', () => {
    const buf = Uint8Array.from([0xEF, 0xF0, 0xE8, 0xE2, 0xB3, 0xF2]);
    expect(new TextDecoder('windows-1251').decode(buf)).toBe('привіт');
  });
});
```

Run: `npm test` → очікувано `1 passed`.

- [ ] **Step 6: Commit + push**

```bash
git add migration .gitignore
git commit -m "migration: scaffold pipeline package (vitest, cheerio, out/ layout)"
git push -u origin feat/legacy-migration-portal
```

---

### Task 2: Декодування cp1251 + нормалізація URL (`lib/decode.js`)

**Files:**
- Create: `migration/lib/decode.js`, `migration/test/decode.test.js`

**Interfaces:**
- Produces (споживають Task 3–5, 12):
  - `decodeBody(buf: Uint8Array, contentTypeHeader: string): string`
  - `smartDecodeURIComponent(s: string): string` — %-послідовності: UTF-8, а якщо невалідні — cp1251
  - `normalizeUrl(raw: string, base?: string): null | {external:true, href} | {external:false, key, path, query, droppedParams, fetchUrl}`
  - `politeFetch(url, {method?, timeoutMs?, retries?}): Promise<{status, headers, buf, location?}>` — redirect:'manual', backoff 1с/4с/10с, UA `NAAS-migration/1.0`

- [ ] **Step 1: Тести (падають)**

`migration/test/decode.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { decodeBody, smartDecodeURIComponent, normalizeUrl } from '../lib/decode.js';

const CP1251_PRYVIT = Uint8Array.from([0xEF, 0xF0, 0xE8, 0xE2, 0xB3, 0xF2]);

describe('decodeBody', () => {
  it('поважає charset із заголовка', () => {
    expect(decodeBody(CP1251_PRYVIT, 'text/html; charset=windows-1251')).toBe('привіт');
  });
  it('без charset: пробує utf-8, при невалідності падає на cp1251', () => {
    expect(decodeBody(new TextEncoder().encode('démo'), 'text/html')).toBe('démo');
    expect(decodeBody(CP1251_PRYVIT, 'text/html')).toBe('привіт');
  });
});

describe('smartDecodeURIComponent', () => {
  it('utf-8 відсотки', () => {
    expect(smartDecodeURIComponent('%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%82')).toBe('статут');
  });
  it('cp1251 відсотки (легасі-лінки Bitrix)', () => {
    expect(smartDecodeURIComponent('%F1%F2%E0%F2%F3%F2')).toBe('статут');
  });
  it('пробіли й звичайні символи', () => {
    expect(smartDecodeURIComponent('/content/pasport%20budget/')).toBe('/content/pasport budget/');
  });
});

describe('normalizeUrl', () => {
  it('відносний → key з хоста naas.gov.ua', () => {
    const r = normalizeUrl('/newsall/newsnaan/8984/', 'http://naas.gov.ua/');
    expect(r).toMatchObject({ external: false, key: '/newsall/newsnaan/8984/', query: {} });
  });
  it('www + https нормалізуються в http apex', () => {
    const r = normalizeUrl('https://www.naas.gov.ua/content/statut-naan/');
    expect(r.external).toBe(false);
    expect(r.fetchUrl).toBe('http://naas.gov.ua/content/statut-naan/');
  });
  it('whitelist-query лишається і сортується, сміття відкидається', () => {
    const r = normalizeUrl('/newsukraine/?utm_source=x&ELEMENT_ID=8959');
    expect(r.key).toBe('/newsukraine/?ELEMENT_ID=8959');
    expect(r.droppedParams).toEqual(['utm_source']);
  });
  it('PAGEN_* у whitelist', () => {
    expect(normalizeUrl('/news/?PAGEN_1=3').key).toBe('/news/?PAGEN_1=3');
  });
  it('фрагмент зрізається; зовнішні позначаються; javascript: → null', () => {
    expect(normalizeUrl('/content/kontakti/#map').key).toBe('/content/kontakti/');
    expect(normalizeUrl('https://prozorro.gov.ua/x').external).toBe(true);
    expect(normalizeUrl('javascript:void(0)')).toBe(null);
  });
  it('декодований шлях у key, оригінальне кодування у fetchUrl', () => {
    const r = normalizeUrl('/upload/%F1%F2%E0%F2%F3%F2.pdf');
    expect(r.key).toBe('/upload/статут.pdf');
    expect(r.fetchUrl).toBe('http://naas.gov.ua/upload/%F1%F2%E0%F2%F3%F2.pdf');
  });
});
```

- [ ] **Step 2: Переконатися, що тести падають**

Run: `npx vitest run test/decode.test.js` → очікувано: FAIL (`Cannot find module '../lib/decode.js'`).

- [ ] **Step 3: Імплементація**

`migration/lib/decode.js`:

```js
const D1251 = new TextDecoder('windows-1251');
const DUTF8_STRICT = new TextDecoder('utf-8', { fatal: true });

export function decodeBody(buf, contentTypeHeader = '') {
  const m = /charset=([\w-]+)/i.exec(contentTypeHeader);
  const cs = (m?.[1] || '').toLowerCase();
  if (cs === 'utf-8' || cs === 'utf8') return new TextDecoder('utf-8').decode(buf);
  if (cs === 'windows-1251' || cs === 'cp1251') return D1251.decode(buf);
  if (cs) { try { return new TextDecoder(cs).decode(buf); } catch { /* невідомий charset */ } }
  try { return DUTF8_STRICT.decode(buf); } catch { return D1251.decode(buf); }
}

export function smartDecodeURIComponent(s) {
  const bytes = [];
  const enc = new TextEncoder();
  for (let i = 0; i < s.length; ) {
    if (s[i] === '%' && /^[0-9a-fA-F]{2}$/.test(s.slice(i + 1, i + 3))) {
      bytes.push(parseInt(s.slice(i + 1, i + 3), 16));
      i += 3;
    } else {
      for (const b of enc.encode(s[i])) bytes.push(b);
      i += 1;
    }
  }
  const u8 = Uint8Array.from(bytes);
  try { return DUTF8_STRICT.decode(u8); } catch { return D1251.decode(u8); }
}

const HOSTS = new Set(['naas.gov.ua', 'www.naas.gov.ua']);
const KEEP = new Set(['ELEMENT_ID', 'ID', 'SECTION_ID']);
const isKept = (k) => KEEP.has(k) || /^PAGEN_\d+$/.test(k);

export function normalizeUrl(raw, base = 'http://naas.gov.ua/') {
  let u;
  try { u = new URL(raw, base); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (!HOSTS.has(u.hostname)) return { external: true, href: u.href };

  const kept = [], droppedParams = [];
  for (const [k, v] of u.searchParams) (isKept(k) ? kept : droppedParams).push([k, v]);
  kept.sort((a, b) => a[0].localeCompare(b[0]));

  const path = smartDecodeURIComponent(u.pathname);
  const qs = kept.length ? '?' + kept.map(([k, v]) => `${k}=${v}`).join('&') : '';
  return {
    external: false,
    key: path + qs,
    path,
    query: Object.fromEntries(kept),
    droppedParams: droppedParams.map(([k]) => k),
    fetchUrl: 'http://naas.gov.ua' + u.pathname + qs,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function politeFetch(url, { method = 'GET', timeoutMs = 30000, retries = 3 } = {}) {
  const backoff = [1000, 4000, 10000];
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'manual',
        signal: ctl.signal,
        headers: { 'user-agent': 'NAAS-migration/1.0 (site owner; contact: webmaster)' },
      });
      const buf = method === 'HEAD' ? new Uint8Array() : new Uint8Array(await res.arrayBuffer());
      return {
        status: res.status,
        headers: Object.fromEntries(res.headers),
        buf,
        location: res.headers.get('location') ?? undefined,
      };
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(backoff[Math.min(attempt, backoff.length - 1)]);
    } finally {
      clearTimeout(timer);
    }
  }
  return { status: 0, headers: {}, buf: new Uint8Array(), error: String(lastErr) };
}
```

- [ ] **Step 4: Тести зелені**

Run: `npx vitest run test/decode.test.js` → очікувано: усі PASS.

- [ ] **Step 5: Commit + push**

```bash
git add migration/lib/decode.js migration/test/decode.test.js
git commit -m "migration: cp1251-aware decoding, URL normalization, polite fetcher"
git push
```

---

### Task 3: BFS-краулер (`lib/crawl.js`)

**Files:**
- Create: `migration/lib/crawl.js`, `migration/test/crawl.test.js`

**Interfaces:**
- Consumes: `normalizeUrl`, `decodeBody`, `politeFetch` (Task 2).
- Produces (споживають Task 4–6):
  - `crawl({seeds, fetchFn, delayMs, maxPages, state, onPage, onCheckpoint, saveRaw}): Promise<{inventory: Map<key,Rec>, assets: Map<path,AssetRec>, state}>` — `onCheckpoint(stateSnapshot)` викликається кожні 50 сторінок (для резюмовності живого краулу)
  - `Rec = {key,path,query,fetchUrl,status,contentType,title,sha1,bytes,location?,referrer,fetchedAt,rawFile?}` (схема `inventory.jsonl`)
  - `AssetRec = {path, fetchUrl, referrer}` (статуси/розміри добиває Task 6)
  - `extractLinks(html: string, baseUrl: string): {pages: string[], assets: string[]}`
  - Асетом вважається: path-префікс `/upload/|/images/|/img/|/video/|/slide/` АБО розширення `pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|gif|webp|bmp|mp[34]|avi|rtf|txt`; `/bitrix/**` ігнорується повністю.

- [ ] **Step 1: Тести (падають)**

`migration/test/crawl.test.js` — мінісайт як мапа URL→відповідь, `fetchFn` — стаб:

```js
import { describe, it, expect } from 'vitest';
import { crawl, extractLinks } from '../lib/crawl.js';

const enc1251 = (s) => {
  // кодуємо українську в cp1251 для реалістичних байтів: тільки ASCII в цьому стабі + літера "і" (0xB3)
  return Uint8Array.from([...s].map((ch) => (ch === 'і' ? 0xb3 : ch.charCodeAt(0))));
};

const SITE = new Map([
  ['http://naas.gov.ua/', {
    status: 200, ct: 'text/html; charset=windows-1251',
    body: enc1251('<html><head><title>NAAS</title></head><body><main class="content">' +
      '<a href="/content/a/">A</a> <a href="/newsall/newsnaan/8984/">N</a>' +
      '<a href="/newsukraine/?ELEMENT_ID=8959">Q</a> <a href="/bitrix/admin/">skip</a>' +
      '<a href="https://prozorro.gov.ua/">ext</a> <img src="/upload/iblock/x/фото.jpg">' +
      '<a href="/upload/podani.pdf">pdf</a></main></body></html>'),
  }],
  ['http://naas.gov.ua/content/a/', { status: 200, ct: 'text/html; charset=windows-1251',
    body: enc1251('<html><head><title>A</title></head><body><main class="content"><a href="/">home</a><a href="/gone/">g</a></main></body></html>') }],
  ['http://naas.gov.ua/newsall/newsnaan/8984/', { status: 200, ct: 'text/html; charset=windows-1251',
    body: enc1251('<html><head><title>News 8984</title></head><body><main class="content">text</main></body></html>') }],
  ['http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959', { status: 200, ct: 'text/html; charset=windows-1251',
    body: enc1251('<html><head><title>Q news</title></head><body><main class="content">q</main></body></html>') }],
  ['http://naas.gov.ua/gone/', { status: 404, ct: 'text/html', body: enc1251('<html><title>404</title></html>') }],
]);

const fetchFn = async (url) => {
  const hit = SITE.get(url);
  if (!hit) return { status: 404, headers: { 'content-type': 'text/html' }, buf: new Uint8Array() };
  return { status: hit.status, headers: { 'content-type': hit.ct }, buf: hit.body };
};

describe('extractLinks', () => {
  it('розділяє сторінки/асети, ріже /bitrix/ і зовнішні', () => {
    const html = '<a href="/content/a/">a</a><img src="/upload/x/у.jpg"><a href="/bitrix/js/x.js">b</a><a href="/doc.pdf">d</a>';
    const { pages, assets } = extractLinks(html, 'http://naas.gov.ua/');
    expect(pages).toEqual(['/content/a/']);
    expect(assets.sort()).toEqual(['/doc.pdf', '/upload/x/у.jpg']);
  });
});

describe('crawl', () => {
  it('BFS обходить усе досяжне, пише інвентар з титулами і статусами', async () => {
    const { inventory, assets } = await crawl({ seeds: ['/'], fetchFn, delayMs: 0 });
    expect(inventory.get('/')).toMatchObject({ status: 200, title: 'NAAS' });
    expect(inventory.get('/content/a/')).toMatchObject({ status: 200, title: 'A' });
    expect(inventory.get('/newsall/newsnaan/8984/')).toMatchObject({ status: 200 });
    expect(inventory.get('/newsukraine/?ELEMENT_ID=8959')).toMatchObject({ status: 200, title: 'Q news' });
    expect(inventory.get('/gone/')).toMatchObject({ status: 404 });
    expect(inventory.has('/bitrix/admin/')).toBe(false);
    expect([...assets.keys()].sort()).toEqual(['/upload/iblock/x/фото.jpg', '/upload/podani.pdf'].sort());
  });
  it('резюмується зі state (уже пройдені не перефетчуються)', async () => {
    let calls = 0;
    const counting = async (u) => { calls++; return fetchFn(u); };
    const first = await crawl({ seeds: ['/'], fetchFn: counting, delayMs: 0 });
    const callsAfterFirst = calls;
    await crawl({ seeds: ['/'], fetchFn: counting, delayMs: 0, state: first.state });
    expect(calls).toBe(callsAfterFirst); // нічого не перекачувалось
  });
});
```

- [ ] **Step 2: Тести падають**

Run: `npx vitest run test/crawl.test.js` → FAIL (`Cannot find module '../lib/crawl.js'`).

- [ ] **Step 3: Імплементація**

`migration/lib/crawl.js`:

```js
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { normalizeUrl, decodeBody, politeFetch } from './decode.js';

const ASSET_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|gif|webp|bmp|mp[34]|avi|rtf|txt)$/i;
const ASSET_PREFIX = /^\/(upload|images|img|video|slide)\//i;
const isAssetPath = (p) => ASSET_PREFIX.test(p) || ASSET_RE.test(p);
const isBitrix = (p) => /^\/bitrix\//i.test(p);
const sha1 = (buf) => createHash('sha1').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const pages = new Set(), assets = new Set();
  const candidates = [];
  $('a[href], area[href]').each((_, el) => candidates.push($(el).attr('href')));
  $('img[src]').each((_, el) => candidates.push($(el).attr('src')));
  $('img[srcset], source[srcset]').each((_, el) => {
    for (const part of ($(el).attr('srcset') || '').split(','))
      candidates.push(part.trim().split(/\s+/)[0]);
  });
  for (const raw of candidates) {
    if (!raw) continue;
    const n = normalizeUrl(raw, baseUrl);
    if (!n || n.external) continue;
    if (isBitrix(n.path)) continue;
    if (isAssetPath(n.path)) assets.add(n.key);
    else pages.add(n.key);
  }
  return { pages: [...pages], assets: [...assets] };
}

// слеш-твін: /a/ ↔ /a (query не чіпається). Ключі зберігаємо СИРИМИ (як лінкує старий
// сайт), а твін використовуємо лише для дедуплікації — щоб не качати обидві форми.
export function slashTwin(key) {
  const [p, q] = key.split('?');
  if (isAssetPath(p) || p === '/') return null;
  const twin = p.endsWith('/') ? p.slice(0, -1) : p + '/';
  return twin + (q ? '?' + q : '');
}

export async function crawl({
  seeds, fetchFn = (u) => politeFetch(u), delayMs = 500, maxPages = Infinity,
  state = { done: {}, queue: [] }, onPage = () => {}, onCheckpoint = null, saveRaw = null,
}) {
  const inventory = new Map(Object.entries(state.done));
  const assets = new Map(Object.entries(state.assets ?? {}));
  const queue = [...state.queue];
  const seen = new Set();
  const markSeen = (k) => { seen.add(k); const t = slashTwin(k); if (t) seen.add(t); };
  for (const k of [...inventory.keys(), ...queue]) markSeen(k);
  const enqueue = (k) => { if (!seen.has(k)) { queue.push(k); markSeen(k); } };

  for (const s of seeds) {
    const n = normalizeUrl(s);
    if (n && !n.external) enqueue(n.key);
  }

  const snapshot = () => ({
    done: Object.fromEntries(inventory), assets: Object.fromEntries(assets), queue: [...queue],
  });

  let fetched = 0;
  while (queue.length && fetched < maxPages) {
    const key = queue.shift();
    if (inventory.has(key)) continue;
    const n = normalizeUrl(key);
    const res = await fetchFn(n.fetchUrl);
    fetched++;
    const contentType = res.headers['content-type'] ?? '';
    const rec = {
      key, path: n.path, query: n.query, fetchUrl: n.fetchUrl,
      status: res.status, contentType, title: '', sha1: '', bytes: res.buf.length,
      location: res.location, referrer: '', fetchedAt: new Date().toISOString(),
    };
    if (res.status >= 300 && res.status < 400 && res.location) {
      const loc = normalizeUrl(res.location, n.fetchUrl);
      if (loc && !loc.external) {
        enqueue(loc.key);
        rec.location = loc.key;
      }
    } else if (/text\/html/i.test(contentType) && res.buf.length) {
      const html = decodeBody(res.buf, contentType);
      rec.sha1 = sha1(res.buf);
      rec.title = cheerio.load(html)('title').first().text().trim();
      if (saveRaw) rec.rawFile = await saveRaw(key, res.buf);
      const links = extractLinks(html, n.fetchUrl);
      for (const pk of links.pages) enqueue(pk);
      for (const ak of links.assets)
        if (!assets.has(ak)) assets.set(ak, { path: ak, fetchUrl: normalizeUrl(ak).fetchUrl, referrer: key });
    }
    inventory.set(key, rec);
    onPage(rec, { queued: queue.length, done: inventory.size });
    if (onCheckpoint && inventory.size % 50 === 0) onCheckpoint(snapshot());
    if (delayMs) await sleep(delayMs);
  }

  return { inventory, assets, state: snapshot() };
}
```

- [ ] **Step 4: Тести зелені**

Run: `npx vitest run test/crawl.test.js` → PASS. Якщо `canonicalPageKey` ламає кейс `/newsukraine/?ELEMENT_ID=8959` — шлях `/newsukraine/` вже зі слешем, query зберігається (тест це ловить).

- [ ] **Step 5: Commit + push**

```bash
git add migration/lib/crawl.js migration/test/crawl.test.js
git commit -m "migration: resumable BFS crawler with asset manifest and bitrix/external filtering"
git push
```

---

### Task 4: Класифікація URL (`lib/classify.js`)

**Files:**
- Create: `migration/lib/classify.js`, `migration/test/classify.test.js`

**Interfaces:**
- Consumes: записи `Rec` (Task 3).
- Produces (споживають Task 5, 6, 9–12): `classify(rec) → {type, feed?, id?, viaQuery?, page?}`; типи: `home | news-article | listing | page | redirect | gone | error | unclassified`. `buildUrlMap(inventoryIterable) → {map: Object<key,cls>, report: {counts, unclassified: string[]}}`.

- [ ] **Step 1: Тести (падають)**

`migration/test/classify.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { classify } from '../lib/classify.js';

const rec = (key, status = 200, extra = {}) => {
  const [path, qs] = key.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs ?? ''));
  return { key, path, query, status, ...extra };
};

describe('classify', () => {
  it('головна', () => expect(classify(rec('/')).type).toBe('home'));
  it('path-новина', () =>
    expect(classify(rec('/newsall/newsnaan/8984/'))).toMatchObject({ type: 'news-article', feed: 'newsnaan', id: 8984 }));
  it('query-новина', () =>
    expect(classify(rec('/newsukraine/?ELEMENT_ID=8959'))).toMatchObject({ type: 'news-article', feed: 'newsukraine', id: 8959, viaQuery: true }));
  it('стрічки та пагінація', () => {
    expect(classify(rec('/news/'))).toMatchObject({ type: 'listing', feed: 'news', page: 1 });
    expect(classify(rec('/newsall/?PAGEN_1=3'))).toMatchObject({ type: 'listing', feed: 'newsall', page: 3 });
  });
  it('контент-сторінки (включно з пробілами й регістром)', () => {
    expect(classify(rec('/content/publichna-informaciya/pasport budget/')).type).toBe('page');
    expect(classify(rec('/content/Intelekt_vlasnist/')).type).toBe('page');
    expect(classify(rec('/preview/katalog-x/')).type).toBe('page');
    expect(classify(rec('/Agrolectures/')).type).toBe('page');
  });
  it('статуси перекривають', () => {
    expect(classify(rec('/2/detail.php?ID=8516', 404)).type).toBe('gone');
    expect(classify(rec('/x/', 301, { location: '/y/' }))).toMatchObject({ type: 'redirect', to: '/y/' });
    expect(classify(rec('/x/', 0)).type).toBe('error');
  });
});
```

- [ ] **Step 2: Тести падають**

Run: `npx vitest run test/classify.test.js` → FAIL.

- [ ] **Step 3: Імплементація**

`migration/lib/classify.js`:

```js
const FEEDS = ['news', 'newsall', 'newsukraine', 'newsworld'];
const FEED_ALT = /^\/(news|newsall|newsukraine|newsworld)\/(?:([\w-]+)\/)?(\d+)\/$/;

export function classify(rec) {
  const { path, query = {}, status } = rec;
  if (status >= 300 && status < 400) return { type: 'redirect', to: rec.location ?? null };
  if (status === 404 || status === 410) return { type: 'gone' };
  if (status !== 200) return { type: 'error' };
  if (path === '/') return { type: 'home' };

  const m = path.match(FEED_ALT);
  if (m) return { type: 'news-article', feed: m[2] ?? m[1], id: Number(m[3]), viaQuery: false };

  const feedRoot = FEEDS.find((f) => path === `/${f}/` || path === `/${f}`);
  if (feedRoot && (query.ELEMENT_ID || query.ID))
    return { type: 'news-article', feed: feedRoot, id: Number(query.ELEMENT_ID ?? query.ID), viaQuery: true };
  const pagen = Object.keys(query).find((k) => /^PAGEN_\d+$/.test(k));
  if (feedRoot) return { type: 'listing', feed: feedRoot, page: pagen ? Number(query[pagen]) : 1 };
  if (pagen) return { type: 'listing', feed: path, page: Number(query[pagen]) };

  if (Object.keys(query).length === 0) return { type: 'page' };
  if (query.ELEMENT_ID || query.ID) return { type: 'news-article', feed: path, id: Number(query.ELEMENT_ID ?? query.ID), viaQuery: true };
  return { type: 'unclassified' };
}

export function buildUrlMap(inventory) {
  const map = {}, counts = {}, unclassified = [];
  for (const rec of inventory) {
    const cls = classify(rec);
    map[rec.key] = cls;
    counts[cls.type] = (counts[cls.type] ?? 0) + 1;
    if (cls.type === 'unclassified') unclassified.push(rec.key);
  }
  return { map, report: { counts, unclassified } };
}
```

- [ ] **Step 4: Тести зелені**

Run: `npx vitest run test/classify.test.js` → PASS.

- [ ] **Step 5: Commit + push**

```bash
git add migration/lib/classify.js migration/test/classify.test.js
git commit -m "migration: URL classification into home/news/listing/page/gone/redirect"
git push
```

---

### Task 5: Екстрактор контенту (`lib/extract.js`) — на реальних фікстурах

**Files:**
- Create: `migration/lib/extract.js`, `migration/test/extract.test.js`, `migration/test/fixtures/` (реальні cp1251-сторінки)

**Interfaces:**
- Consumes: `decodeBody` (Task 2), `classify` (Task 4).
- Produces (споживають Task 6, 8): `extractPage(rawBuf, rec, cls) → LegacyPage` (схема — див. «Схема даних»). Гарантії: `bodyHtml` без `<script>/<style>/<form>/on*-атрибутів/javascript:-href`, оригінальні `href/src` НЕ переписуються; перший `<h1>` винесений у поле `h1` і видалений із `bodyHtml`; `title` — точний текст `<title>`; `metaDescription: null`, якщо атрибут порожній.

- [ ] **Step 1: Фікстури з реальних збережених сторінок**

```bash
mkdir -p migration/test/fixtures
cp /Users/falco/dev/naas_github_pages/naas_about.html    migration/test/fixtures/about.cp1251.html
cp /Users/falco/dev/naas_github_pages/naas_struktura.html migration/test/fixtures/struktura.cp1251.html
ls /Users/falco/dev/naas_github_pages/naas_news_slice/raw | head -5
```

Очікувано: у `naas_news_slice/raw` — збережені HTML новин; скопіювати ОДИН файл як `migration/test/fixtures/news-article.cp1251.html`. Якщо тека порожня/інша структура — витягнути живу сторінку:

```bash
curl -s --max-time 20 "http://naas.gov.ua/newsall/newsnaan/8984/" -o migration/test/fixtures/news-article.cp1251.html
```

Потім подивитися очима структуру дати в новині (для селектора в Step 2):

```bash
python3 -c "
import re
raw = open('migration/test/fixtures/news-article.cp1251.html','rb').read().decode('cp1251')
m = re.search(r'<main class=\"content\">(.{0,800})', raw, re.S)
print(m.group(1) if m else 'NO MAIN')"
```

Записати в тест фактичний блок дати (Bitrix зазвичай рендерить дату текстом на початку detail-блоку — точний селектор/regex взяти з побаченого HTML; тест нижче містить місце `DATE_ASSERT`, яке треба заповнити реальним значенням із фікстури).

- [ ] **Step 2: Тести (падають)**

`migration/test/extract.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractPage } from '../lib/extract.js';

const load = (f) => new Uint8Array(readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const CT = 'text/html; charset=windows-1251';

describe('extractPage: контент-сторінка (about)', () => {
  const page = extractPage(load('about.cp1251.html'),
    { key: '/content/about_naan/', path: '/content/about_naan/', contentType: CT, fetchUrl: 'http://naas.gov.ua/content/about_naan/' },
    { type: 'page' });
  it('точний title і h1', () => {
    expect(page.title).toBe('Про НААН');
    expect(page.h1).toBe('Про НААН');
  });
  it('порожній meta description → null', () => expect(page.metaDescription).toBe(null));
  it('bodyHtml: без script, без першого h1, з текстом', () => {
    expect(page.bodyHtml).not.toMatch(/<script/i);
    expect(page.bodyHtml).not.toMatch(/<h1/i);
    expect(page.bodyHtml.length).toBeGreaterThan(500);
  });
  it('href/src не переписані (лишаються відносними)', () => {
    expect(page.bodyHtml).not.toMatch(/https?:\/\/naas\.gov\.ua\/upload/);
  });
});

describe('extractPage: новина', () => {
  const page = extractPage(load('news-article.cp1251.html'),
    { key: '/newsall/newsnaan/8984/', path: '/newsall/newsnaan/8984/', contentType: CT, fetchUrl: 'http://naas.gov.ua/newsall/newsnaan/8984/' },
    { type: 'news-article', feed: 'newsnaan', id: 8984 });
  it('має title, h1, тіло', () => {
    expect(page.title.length).toBeGreaterThan(5);
    expect(page.h1.length).toBeGreaterThan(5);
    expect(page.bodyHtml.length).toBeGreaterThan(200);
  });
  it('дата новини розпізнана (DATE_ASSERT: підставити точну дату з фікстури)', () => {
    expect(page.dateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('зображення з тіла потрапляють у images', () => {
    for (const src of page.images) expect(src).toMatch(/^\//);
  });
});
```

- [ ] **Step 3: Тести падають**

Run: `npx vitest run test/extract.test.js` → FAIL (`Cannot find module '../lib/extract.js'`).

- [ ] **Step 4: Імплементація**

`migration/lib/extract.js`:

```js
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { decodeBody } from './decode.js';

const MONTHS = {
  'січня': 1, 'лютого': 2, 'березня': 3, 'квітня': 4, 'травня': 5, 'червня': 6,
  'липня': 7, 'серпня': 8, 'вересня': 9, 'жовтня': 10, 'листопада': 11, 'грудня': 12,
};

export function parseUkrDate(text) {
  let m = text.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = text.match(/(\d{1,2})\s+([а-яіїє]+)\s+(\d{4})/i);
  if (m && MONTHS[m[2].toLowerCase()])
    return `${m[3]}-${String(MONTHS[m[2].toLowerCase()]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

export function extractPage(rawBuf, rec, cls) {
  const html = decodeBody(rawBuf, rec.contentType);
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const md = ($('meta[name="description"]').attr('content') ?? '').trim();
  const metaDescription = md.length ? md : null;

  let $main = $('main.content').first();
  if (!$main.length) $main = $('main').first();
  if (!$main.length) $main = $('body');

  // чистка: скрипти/стилі/форми/події
  $main.find('script, style, noscript, form, iframe[src*="bitrix"]').remove();
  $main.find('*').each((_, el) => {
    for (const name of Object.keys(el.attribs ?? {})) {
      if (/^on/i.test(name)) $(el).removeAttr(name);
      if (name === 'href' && /^\s*javascript:/i.test(el.attribs[name])) $(el).removeAttr('href');
    }
  });

  const h1 = $main.find('h1').first().text().trim();
  $main.find('h1').first().remove();

  // дата (для новин): шукаємо в перших текстових вузлах main
  let dateISO = null;
  if (cls.type === 'news-article') {
    const headText = $main.text().slice(0, 400);
    dateISO = parseUkrDate(headText);
  }

  const images = [];
  $main.find('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('/')) images.push(src);
  });
  const files = [];
  $main.find('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar|rtf)(\?|$)/i.test(href))
      files.push({ href, text: $(el).text().trim() });
  });

  const bodyHtml = ($main.html() ?? '').trim();
  return {
    key: rec.key, type: cls.type,
    ...(cls.feed ? { feed: cls.feed } : {}), ...(cls.id ? { id: cls.id } : {}),
    ...(cls.viaQuery !== undefined ? { viaQuery: cls.viaQuery } : {}),
    title, metaDescription, h1, dateISO,
    bodyHtml, images, files,
    sourceUrl: rec.fetchUrl, fetchedAt: rec.fetchedAt ?? new Date().toISOString(),
    contentSha1: createHash('sha1').update(bodyHtml).digest('hex'),
  };
}
```

- [ ] **Step 5: Тести зелені; DATE_ASSERT заповнено**

Run: `npx vitest run test/extract.test.js` → PASS. Якщо дата новини не парситься — подивитися реальний формат у фікстурі (Step 1) і розширити `parseUkrDate` під нього (додати відповідний regex + окремий unit-тест на цей формат). Тест `DATE_ASSERT` доповнити точним значенням (напр. `expect(page.dateISO).toBe('2026-06-24')`).

- [ ] **Step 6: Commit + push**

```bash
git add migration/lib/extract.js migration/test/extract.test.js migration/test/fixtures
git commit -m "migration: legacy page extractor (title/h1/date/body sanitize) on real cp1251 fixtures"
git push
```

---

### Task 6: CLI-раннери + ПОВНИЙ живий краул і екстракція

**Files:**
- Create: `migration/bin/crawl-live.js`, `migration/bin/extract-all.js`, `migration/bin/report.js`
- Output: `migration/out/inventory.jsonl`, `migration/out/url-map.json`, `migration/out/assets-manifest.tsv`, `migration/out/reports/crawl-report.md`, `migration/out/content/**` (gitignored), `migration/out/raw/**` (gitignored)

**Interfaces:**
- Consumes: `crawl`, `classify/buildUrlMap`, `extractPage` (Tasks 3–5).
- Produces: файли за «Схемою даних» — контракт для Tasks 8–12. `index.json`: `{"<key>": {"file":"pages/<sha1>.json","type","title","feed"?,"id"?,"date"?}}`.

- [ ] **Step 1: `bin/crawl-live.js`**

```js
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { crawl } from '../lib/crawl.js';

const OUT = new URL('../out/', import.meta.url).pathname;
mkdirSync(OUT + 'raw', { recursive: true });
mkdirSync(OUT + 'reports', { recursive: true });

const SEEDS = [
  '/', '/news/', '/newsall/', '/newsukraine/', '/newsworld/', '/en/',
  '/content/about_naan/', '/content/prezidiya/', '/content/publichna-informaciya/',
  '/content/Intelekt_vlasnist/', '/content/kontakti/', '/content/literatura/',
  '/content/statut-naan/', '/content/youngscientists/', '/content/academ/',
  '/Agrolectures/', '/Agro_lectures/', '/Viddilennya_instituty/', '/academi/', '/contacts/', '/preview/',
];

const statePath = OUT + 'crawl-state.json';
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : undefined;
const maxPages = Number(process.argv[2] ?? Infinity);

const saveRaw = (key, buf) => {
  const name = createHash('sha1').update(key).digest('hex') + '.html';
  writeFileSync(OUT + 'raw/' + name, buf);
  return 'raw/' + name;
};

const { inventory, assets, state: finalState } = await crawl({
  seeds: SEEDS, delayMs: 500, maxPages, state, saveRaw,
  onPage: (rec, { queued, done }) => {
    if (done % 25 === 0) console.log(`${done} done, ${queued} queued; last: ${rec.status} ${rec.key}`);
  },
  onCheckpoint: (snap) => writeFileSync(statePath, JSON.stringify(snap)),
});

writeFileSync(statePath, JSON.stringify(finalState));
writeFileSync(OUT + 'inventory.jsonl', [...inventory.values()].map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(OUT + 'assets-manifest.tsv',
  [...assets.values()].map((a) => `${a.path}\t${a.referrer}\t\t`).join('\n') + '\n');
console.log(`DONE: ${inventory.size} pages, ${assets.size} assets`);
```

- [ ] **Step 2: `bin/extract-all.js` + `bin/report.js`**

`bin/extract-all.js`:

```js
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildUrlMap } from '../lib/classify.js';
import { extractPage } from '../lib/extract.js';

const OUT = new URL('../out/', import.meta.url).pathname;
const inventory = readFileSync(OUT + 'inventory.jsonl', 'utf8')
  .trim().split('\n').map((l) => JSON.parse(l));

const { map, report } = buildUrlMap(inventory);
writeFileSync(OUT + 'url-map.json', JSON.stringify(map, null, 1));
console.log('classification:', JSON.stringify(report.counts));
if (report.unclassified.length) {
  console.log('UNCLASSIFIED (перші 30):', report.unclassified.slice(0, 30));
}

mkdirSync(OUT + 'content/pages', { recursive: true });
const index = {};
let extracted = 0, skipped = 0;
for (const rec of inventory) {
  const cls = map[rec.key];
  if (!['home', 'page', 'news-article', 'listing'].includes(cls.type)) { skipped++; continue; }
  if (!rec.rawFile) { skipped++; continue; }
  const page = extractPage(new Uint8Array(readFileSync(OUT + rec.rawFile)), rec, cls);
  const file = 'pages/' + createHash('sha1').update(rec.key).digest('hex') + '.json';
  writeFileSync(OUT + 'content/' + file, JSON.stringify(page, null, 1));
  index[rec.key] = {
    file, type: cls.type, title: page.title,
    ...(cls.feed ? { feed: cls.feed } : {}), ...(cls.id ? { id: cls.id } : {}),
    ...(page.dateISO ? { date: page.dateISO } : {}),
  };
  extracted++;
}
writeFileSync(OUT + 'content/index.json', JSON.stringify(index, null, 1));
console.log(`extracted ${extracted}, skipped ${skipped}`);
```

`bin/report.js` — markdown-звіт у `out/reports/crawl-report.md`: кількість URL за типом і статусом, топ-20 найбільших сторінок, усі `error`-URL, усі `unclassified`, кількість асетів за префіксом (`/upload/iblock/`, `/upload/medialibrary/`, `/content/`, інші), дропнуті query-параметри з частотами (зібрати з `droppedParams` — додати їх запис у `Rec` при краулі, якщо ще нема):

```js
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('../out/', import.meta.url).pathname;
const inv = readFileSync(OUT + 'inventory.jsonl', 'utf8').trim().split('\n').map(JSON.parse);
const map = JSON.parse(readFileSync(OUT + 'url-map.json', 'utf8'));
const assets = readFileSync(OUT + 'assets-manifest.tsv', 'utf8').trim().split('\n');
const by = (arr, f) => arr.reduce((m, x) => (m[f(x)] = (m[f(x)] ?? 0) + 1, m), {});
const lines = [
  '# Crawl report ' + new Date().toISOString().slice(0, 10),
  '## Статуси', JSON.stringify(by(inv, (r) => r.status)),
  '## Типи', JSON.stringify(by(Object.values(map), (c) => c.type)),
  '## Асети за префіксом', JSON.stringify(by(assets, (l) => l.split('\t')[0].split('/').slice(0, 3).join('/'))),
  '## Помилки (status 0)', ...inv.filter((r) => r.status === 0).map((r) => '- ' + r.key),
  '## Unclassified', ...Object.entries(map).filter(([, c]) => c.type === 'unclassified').map(([k]) => '- ' + k),
];
writeFileSync(OUT + 'reports/crawl-report.md', lines.join('\n') + '\n');
console.log('report written');
```

- [ ] **Step 3: Пробний обмежений краул (смок на живому сайті)**

```bash
cd migration && node bin/crawl-live.js 40
```

Очікувано: ~40 сторінок в `out/inventory.jsonl`, без крашів, у логу видно 200-ки, `DONE: 40 pages, N assets` (N > 20). Перевірити очима 3 записи: `head -3 out/inventory.jsonl`.

- [ ] **Step 4: ПОВНИЙ краул (довгий — година-дві, резюмовний)**

```bash
node bin/crawl-live.js 2>&1 | tee out/reports/crawl-log.txt
```

Це ~тисячі сторінок з delay 500 мс. Якщо обірвалось — просто перезапустити (state-файл продовжить). Watchdog-очікування: розмір інвентаря має вийти на плато; новинні ID у діапазоні до ~9000.

- [ ] **Step 5: Класифікація + екстракція + звіт**

```bash
node bin/extract-all.js && node bin/report.js
```

Очікувано: `unclassified` — нуль або поодинокі URL. ЯКЩО є `unclassified`-патерни — розширити правила `classify.js` (спершу тест на новий патерн у `test/classify.test.js`, потім правило), перезапустити `extract-all`. Повторювати до 0 unclassified.

- [ ] **Step 6: Санітарна звірка повноти (checkpoint для людини)**

Порівняти зі звісними опорними цифрами (Довідка):

```bash
python3 - <<'EOF'
import json
inv = [json.loads(l) for l in open('out/inventory.jsonl')]
news = [k for k in (json.load(open('out/url-map.json'))).items() if k[1]['type']=='news-article']
print('pages total:', len(inv))
print('news-articles:', len(news))
print('max news id:', max((c.get('id',0) for _,c in news), default=0))
EOF
wc -l out/assets-manifest.tsv
```

Очікування (порядок величин): news-articles — сотні-тисячі, max id ≈ 8990+; асетів — тисячі (admin-probe оцінював ~10 900 файлів в /upload, з них частина не злінкована зі сторінок — менше число в манфесті НОРМАЛЬНЕ; НЕзлінковане не індексується і не мігрується). **Показати цей звіт користувачу і дочекатись «ок» перед Task 7+** (це головний контроль обсягу).

- [ ] **Step 7: Commit + push (інвентар — у git)**

```bash
git add migration/bin migration/out/inventory.jsonl migration/out/url-map.json \
        migration/out/assets-manifest.tsv migration/out/reports
git commit -m "migration: full live crawl inventory + classification + extraction reports"
git push
```

---

### Task 7: Каркас порталу `portal/` (Next.js, standalone, robots off)

**Files:**
- Create: `portal/` (create-next-app), `portal/next.config.ts` (правки), `portal/src/middleware.ts`, `portal/src/app/robots.txt/route.ts`, `portal/vitest.config.ts`, `portal/test/helpers/server.ts`, `portal/test/robots.test.ts`
- Modify: `/.gitignore` (додати `portal/.next/`)

**Interfaces:**
- Produces: Next-застосунок, що збирається (`npm run build`) і віддає: `/robots.txt` (Disallow при `INDEXING!=on`), заголовок `X-Robots-Tag: noindex, nofollow` на всіх відповідях при `INDEXING!=on`. Env-контракт (споживають Task 8–13): `INDEXING=on|off` (default off), `SITE_ORIGIN` (напр. `http://portal.naas.gov.ua`), `LEGACY_CONTENT_DIR` (default `../migration/out/content`).
- Тест-хелпер `startPortal(env): Promise<{origin, stop}>` — збирає/стартує prod-сервер на вільному порту (споживають тести Task 8–11).

- [ ] **Step 1: Bootstrap (або звірка вже створеного архітектурним треком)**

**Якщо `portal/` ВЖЕ існує** (створений треком «сетап архітектури» — див. «Передумови»): НЕ створювати заново. Пропустити create-next-app; виконати лише перевірку engines (команда нижче) і далі Step 2–5 як ЗВІРКУ/ДОПОВНЕННЯ наявного конфігу (додати `trailingSlash`/умовний `standalone`/robots/middleware/vitest, якщо їх нема; існуючі маршрути не чіпати). Якщо `portal/` нема:

```bash
cd /Users/falco/dev/naas_migration_wt   # worktree цього плану
npx create-next-app@latest portal --ts --app --src-dir --no-tailwind --eslint --import-alias "@/*" --use-npm
node -e "console.log(require('./portal/node_modules/next/package.json').engines)"
```

Очікувано: engines сумісні з Node **20.9+** (сервер = 20.20.2). Якщо latest Next вимагає Node >20 — поставити останню мажорну, що підтримує 20: `cd portal && npm i next@<остання-з-node20>` (звірити по engines у npm registry: `npm view next@15 engines`, `npm view next@16 engines` — обрати найновішу сумісну) і зафіксувати вибір у `portal/README.md`.

- [ ] **Step 2: Конфіг**

`portal/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,          // канонічна форма URL порталу — зі слешем (слеш-твіни → 308)
  // standalone тільки для прод-збірки (deploy.sh ставить STANDALONE=1):
  // локально `next start` зі standalone-режимом не працює — тести використовують звичайний білд
  ...(process.env.STANDALONE === '1' ? { output: 'standalone' as const } : {}),
  poweredByHeader: false,
};

export default nextConfig;
```

- [ ] **Step 3: Middleware (X-Robots-Tag) + robots.txt**

`portal/src/middleware.ts`:

```ts
import { NextResponse } from 'next/server';

export function middleware() {
  const res = NextResponse.next();
  if (process.env.INDEXING !== 'on') res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = { matcher: '/:path*' };
```

`portal/src/app/robots.txt/route.ts`:

```ts
export const dynamic = 'force-dynamic';

export function GET() {
  const on = process.env.INDEXING === 'on';
  const origin = process.env.SITE_ORIGIN ?? '';
  const body = on
    ? `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
```

- [ ] **Step 4: vitest + серверний тест-хелпер**

```bash
cd portal && npm i -D vitest
```

`portal/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    testTimeout: 180_000,
    hookTimeout: 180_000,
    fileParallelism: false, // сюїти перебудовують спільний .next з різним env — тільки послідовно
  },
});
```

`portal/test/helpers/server.ts`:

```ts
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..', '..');
let built = false;

// metadata/canonical запікаються ПРИ БІЛДІ (SSG) → сюїти з іншим env передають rebuild:'1'.
// robots.txt — force-dynamic (читає env на запит), для нього rebuild не потрібен.
export async function startPortal(env: Record<string, string> = {}) {
  const { rebuild, ...rest } = env;
  const runEnv = { ...process.env, INDEXING: 'off', ...rest };
  if (!built || rebuild === '1') {
    execSync('npm run build', { cwd: ROOT, env: runEnv, stdio: 'inherit' });
    built = true;
  }
  const port = 3900 + Math.floor(Math.random() * 100);
  const child: ChildProcess = spawn('npx', ['next', 'start', '-p', String(port)], {
    cwd: ROOT, env: runEnv, stdio: 'pipe',
  });
  const origin = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 60; i++) {
    try { await fetch(origin + '/robots.txt'); return { origin, stop: () => child.kill() }; }
    catch { await delay(1000); }
  }
  child.kill();
  throw new Error('portal did not start');
}
```

`portal/test/robots.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import { startPortal } from './helpers/server';

describe('robots/noindex (staging default)', async () => {
  const { origin, stop } = await startPortal({ INDEXING: 'off', SITE_ORIGIN: 'http://x.local' });
  afterAll(() => stop());

  it('robots.txt забороняє все', async () => {
    const t = await (await fetch(origin + '/robots.txt')).text();
    expect(t).toContain('Disallow: /');
    expect(t).not.toContain('Sitemap:');
  });
  it('X-Robots-Tag: noindex на сторінках', async () => {
    const r = await fetch(origin + '/');
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
```

- [ ] **Step 5: Тести зелені**

Run: `cd portal && npx vitest run test/robots.test.ts` → PASS (перший запуск збирає білд, ~1–2 хв).

- [ ] **Step 6: gitignore + Commit + push**

Додати в кореневий `.gitignore` рядок `/portal/.next/`. Потім:

```bash
git add portal .gitignore
git commit -m "portal: Next.js skeleton (standalone, trailingSlash) with INDEXING env, robots, X-Robots-Tag"
git push
```

---### Task 8: Content-store + catch-all маршрут легасі-сторінок

**Files:**
- Create: `portal/src/lib/content-store.ts`, `portal/src/app/[...slug]/page.tsx`, `portal/src/app/page.tsx` (заміна дефолтної), `portal/src/app/legacy-body.css`, `portal/test/fixtures/content/**` (маленький фікстурний контент-набір), `portal/test/legacy-routes.test.ts`
- Modify: `portal/src/app/layout.tsx`

**Interfaces:**
- Consumes: `migration/out/content/index.json` + `pages/*.json` (Task 6); формат `LegacyPage`.
- Produces (споживають Task 9–11):
  - `contentIndex(): Map<string, IndexEntry>`; `getByKey(key: string): LegacyPage | null`
  - `newsIndex(): Map<string /*feed*/, Map<number /*id*/, string /*key*/>>`
  - `listNews(feed: string, page: number, perPage: number): {items: IndexEntryWithKey[], total: number}` (сортування: date desc, потім id desc)
  - компонент `<LegacyArticle page={LegacyPage} />` — `<h1>` + тіло через `dangerouslySetInnerHTML`
  - Правило ключа: шлях декодований, для сторінок — trailing slash.

- [ ] **Step 1: Фікстурний контент для тестів**

Створити `portal/test/fixtures/content/index.json` + `pages/…` вручну (5 записів — ключі точно як у продовому індексі):

```json
{
  "/content/statut-naan/": { "file": "pages/statut.json", "type": "page", "title": "Статут НААН" },
  "/content/publichna-informaciya/pasport budget/": { "file": "pages/pasport.json", "type": "page", "title": "Паспорт бюджетної програми" },
  "/newsall/newsnaan/8984/": { "file": "pages/n8984.json", "type": "news-article", "title": "Новина 8984", "feed": "newsnaan", "id": 8984, "date": "2026-06-24" },
  "/newsukraine/?ELEMENT_ID=8959": { "file": "pages/n8959.json", "type": "news-article", "title": "Новина 8959", "feed": "newsukraine", "id": 8959, "date": "2026-06-20" },
  "/": { "file": "pages/home.json", "type": "home", "title": "Національна академія аграрних наук України" }
}
```

Кожен `pages/*.json` — валідний `LegacyPage` (скопіювати структуру зі «Схеми даних», тіло типу `"<p>Тестовий контент …</p>"`, у n8984 додати `"images": []`, `"h1": "Заголовок новини 8984"`).

- [ ] **Step 2: Тести (падають)**

`portal/test/legacy-routes.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('легасі-маршрути 1:1', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'off', SITE_ORIGIN: 'http://x.local', rebuild: '1',
  });
  afterAll(() => stop());

  it('простий шлях: 200, точний <title>, тіло в HTML', async () => {
    const r = await fetch(origin + '/content/statut-naan/');
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain('<title>Статут НААН</title>');
    expect(html).toContain('Тестовий контент');
  });
  it('шлях із пробілом (енкодиться браузером) — 200', async () => {
    const r = await fetch(origin + '/content/publichna-informaciya/pasport%20budget/');
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('Паспорт бюджетної програми');
  });
  it('path-новина — 200 + h1', async () => {
    const html = await (await fetch(origin + '/newsall/newsnaan/8984/')).text();
    expect(html).toContain('Заголовок новини 8984');
  });
  it('невідомий шлях — СПРАВЖНІЙ 404-статус', async () => {
    const r = await fetch(origin + '/no/such/page/');
    expect(r.status).toBe(404);
  });
  it('варіант без слеша → 308 на канонічний', async () => {
    const r = await fetch(origin + '/content/statut-naan', { redirect: 'manual' });
    expect([301, 308]).toContain(r.status);
    expect(r.headers.get('location')).toContain('/content/statut-naan/');
  });
});
```

- [ ] **Step 3: Тести падають**

Run: `npx vitest run test/legacy-routes.test.ts` → FAIL (роутів ще нема; дефолтна головна віддає boilerplate).

- [ ] **Step 4: Імплементація store**

`portal/src/lib/content-store.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';

export type IndexEntry = { file: string; type: string; title: string; feed?: string; id?: number; date?: string };
export type LegacyPage = {
  key: string; type: string; feed?: string; id?: number; viaQuery?: boolean;
  title: string; metaDescription: string | null; h1: string; dateISO: string | null;
  bodyHtml: string; images: string[]; files: { href: string; text: string }[];
  sourceUrl: string; fetchedAt: string; contentSha1: string;
};

const ROOT = () => process.env.LEGACY_CONTENT_DIR
  ?? path.join(process.cwd(), '..', 'migration', 'out', 'content');

let idx: Map<string, IndexEntry> | null = null;
let news: Map<string, Map<number, string>> | null = null;

export function contentIndex(): Map<string, IndexEntry> {
  if (!idx) {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT(), 'index.json'), 'utf8'));
    idx = new Map(Object.entries(j));
  }
  return idx;
}

// слеш-твін: інвентар зберігає СИРУ форму старого сайту (буває без слеша, напр.
// "/content/publichna-informaciya/FAO"), а Next із trailingSlash:true завжди приводить
// запит до форми зі слешем → шукаємо обидві.
const slashTwin = (key: string): string | null => {
  const [p, q = ''] = key.split('?');
  if (p === '/') return null;
  const twin = p.endsWith('/') ? p.slice(0, -1) : p + '/';
  return twin + (q ? '?' + q : '');
};

export function getByKey(key: string): LegacyPage | null {
  const idx = contentIndex();
  const twin = slashTwin(key);
  const e = idx.get(key) ?? (twin ? idx.get(twin) : undefined);
  if (!e) return null;
  return JSON.parse(fs.readFileSync(path.join(ROOT(), e.file), 'utf8'));
}

export function newsIndex(): Map<string, Map<number, string>> {
  if (!news) {
    news = new Map();
    for (const [key, e] of contentIndex()) {
      if (e.type !== 'news-article' || !e.feed || !e.id) continue;
      if (!news.has(e.feed)) news.set(e.feed, new Map());
      news.get(e.feed)!.set(e.id, key);
    }
  }
  return news;
}

export function listNews(feed: string, page: number, perPage: number) {
  const entries = [...contentIndex().entries()]
    .filter(([, e]) => e.type === 'news-article' && e.feed === feed)
    .sort(([, a], [, b]) => (b.date ?? '').localeCompare(a.date ?? '') || (b.id ?? 0) - (a.id ?? 0));
  return {
    total: entries.length,
    items: entries.slice((page - 1) * perPage, page * perPage).map(([key, e]) => ({ key, ...e })),
  };
}

export function legacyKeyFromSlug(slug: string[] | undefined): string {
  const segs = (slug ?? []).map((s) => { try { return decodeURIComponent(s); } catch { return s; } });
  return '/' + segs.join('/') + (segs.length ? '/' : '');
}
```

- [ ] **Step 5: Маршрути й рендер**

`portal/src/app/legacy-body.css` (мінімальна типографіка легасі-тіла):

```css
.legacy-body { max-width: 60rem; margin: 0 auto; padding: 1rem; line-height: 1.6; font-family: system-ui, sans-serif; }
.legacy-body img { max-width: 100%; height: auto; }
.legacy-body table { border-collapse: collapse; }
.legacy-body td, .legacy-body th { border: 1px solid #ccc; padding: .3rem .5rem; }
```

`portal/src/app/[...slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { contentIndex, getByKey, legacyKeyFromSlug } from '@/lib/content-store';
import { LegacyArticle } from '@/lib/legacy-article';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false; // повний перелік відомий на білді

// Шляхи, які мають ВЛАСНІ статичні маршрути (Task 10) — виключити з catch-all,
// інакше Next згенерує той самий шлях із двох роутів (конфлікт на білді).
const EXPLICIT = new Set(['/news/', '/newsall/', '/newsukraine/', '/newsworld/']);
const withSlash = (k: string) => (k.endsWith('/') ? k : k + '/');

export function generateStaticParams() {
  return [...contentIndex().keys()]
    .filter((k) => !k.includes('?') && k !== '/' && !EXPLICIT.has(withSlash(k)))
    .map((k) => ({ slug: k.split('/').filter(Boolean) }));
}

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getByKey(legacyKeyFromSlug((await params).slug));
  if (!page) return {};
  return pageMetadata(page);
}

export default async function LegacyRoute({ params }: Props) {
  const page = getByKey(legacyKeyFromSlug((await params).slug));
  if (!page) notFound();
  return <LegacyArticle page={page} />;
}
```

`portal/src/lib/legacy-article.tsx`:

```tsx
import type { LegacyPage } from '@/lib/content-store';
import { JsonLd, jsonLdFor } from '@/lib/seo';

export function LegacyArticle({ page }: { page: LegacyPage }) {
  return (
    <article className="legacy-body">
      <JsonLd data={jsonLdFor(page)} />
      <h1>{page.h1 || page.title}</h1>
      {page.dateISO && <time dateTime={page.dateISO}>{page.dateISO}</time>}
      <div dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
    </article>
  );
}
```

`portal/src/lib/seo.ts(x)` — мінімальна версія для цього таска (повна — Task 11):

```tsx
import type { Metadata } from 'next';
import type { LegacyPage } from '@/lib/content-store';

// Форма URL, яку портал реально віддає з кодом 200: query-ключі — точна стара
// query-форма (path у них уже зі слешем); path-ключі — зі слешем (trailingSlash:true).
export function servedKey(key: string): string {
  if (key.includes('?')) return key;
  return key.endsWith('/') ? key : key + '/';
}

export function pageMetadata(page: LegacyPage): Metadata {
  const on = process.env.INDEXING === 'on';
  const origin = process.env.CANONICAL_ORIGIN ?? process.env.SITE_ORIGIN ?? '';
  return {
    title: page.title,
    ...(page.metaDescription ? { description: page.metaDescription } : {}),
    ...(on && origin ? { alternates: { canonical: origin + servedKey(page.key) } } : {}),
    ...(on ? {} : { robots: { index: false, follow: false } }),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function jsonLdFor(page: LegacyPage): object {
  return { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title }; // розширюється в Task 11
}
```

`portal/src/app/page.tsx` (головна = мігрована стара головна; тимчасово, до дизайн-порту):

```tsx
import { getByKey } from '@/lib/content-store';
import { LegacyArticle } from '@/lib/legacy-article';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  const page = getByKey('/');
  return page ? pageMetadata(page) : {};
}

export default function Home() {
  const page = getByKey('/');
  if (!page) return <main className="legacy-body"><h1>НААН</h1></main>;
  return <LegacyArticle page={page} />;
}
```

`layout.tsx`: імпортувати `./legacy-body.css`, `<html lang="uk">`, прибрати boilerplate-стилі create-next-app (лишити мінімальний `<body>{children}</body>` з простим хедером «НААН — портал (тестовий режим)» і футером).

- [ ] **Step 6: Тести зелені**

Run: `npx vitest run test/legacy-routes.test.ts` → PASS. Особлива увага: тест шляху з пробілом. Якщо `generateStaticParams` спотикається на кириличних/пробільних сегментах — перевірити, що сегменти передаються ДЕкодованими (Next сам енкодить у маніфесті маршрутів); `legacyKeyFromSlug` декодує обидва випадки.

Масштаб білда: на реальному контенті це тисячі SSG-сторінок. Якщо повний `npm run build` стане неприйнятно довгим (>30 хв), дозволений фолбек: `dynamicParams = true` + `generateStaticParams` повертає лише топ-500 ключів — решта рендериться на першому запиті й кешується (ISR-поведінка). 404-семантика зберігається: `getByKey` поверне `null` → `notFound()`; тести не змінюються.

- [ ] **Step 7: Commit + push**

```bash
git add portal/src portal/test
git commit -m "portal: content-store + catch-all legacy routes with exact titles and 404s"
git push
```

---

### Task 9: Query-string URL (`?ELEMENT_ID=`) через rewrites + канонікали

**Files:**
- Create: `portal/src/app/newsukraine/el/[id]/page.tsx` (+ аналогічні для інших feed-ів, ЯКЩО у `url-map.json` є query-новини цих feed-ів), `portal/test/query-urls.test.ts`
- Modify: `portal/next.config.ts` (rewrites), `portal/src/lib/seo.ts` (канонікал query-форми)

**Interfaces:**
- Consumes: `newsIndex()`, `getByKey` (Task 8); `url-map.json` (Task 6) — ЯКІ саме feed-и мають query-форму, дивитися там: `python3 -c "import json; m=json.load(open('../migration/out/url-map.json')); print(sorted({v['feed'] for v in m.values() if v.get('viaQuery')}))"`.
- Produces: URL виду `/newsukraine/?ELEMENT_ID=8959` віддає 200 з контентом статті; `<link rel="canonical">` (при INDEXING=on) вказує на **точну query-форму** — і на зовнішній query-URL, і на внутрішній `/newsukraine/el/8959/`.

- [ ] **Step 1: Тести (падають)**

`portal/test/query-urls.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('query-string легасі-URL', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'on',
    SITE_ORIGIN: 'http://x.local', CANONICAL_ORIGIN: 'http://naas.gov.ua', rebuild: '1',
  });
  afterAll(() => stop());

  it('?ELEMENT_ID= віддає статтю (через rewrite)', async () => {
    const r = await fetch(origin + '/newsukraine/?ELEMENT_ID=8959');
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('Новина 8959');
  });
  it('canonical = точна стара query-форма', async () => {
    const html = await (await fetch(origin + '/newsukraine/?ELEMENT_ID=8959')).text();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959');
  });
  it('внутрішній шлях /newsukraine/el/8959/ теж канонізується на query-форму', async () => {
    const html = await (await fetch(origin + '/newsukraine/el/8959/')).text();
    expect(html).toContain('http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959');
  });
  it('невідомий ELEMENT_ID → 404', async () => {
    const r = await fetch(origin + '/newsukraine/?ELEMENT_ID=999999');
    expect(r.status).toBe(404);
  });
});
```

- [ ] **Step 2: Тести падають**

Run: `npx vitest run test/query-urls.test.ts` → FAIL.

- [ ] **Step 3: Rewrites**

У `portal/next.config.ts` додати:

```ts
async rewrites() {
  return {
    beforeFiles: [
      {
        source: '/newsukraine/',
        has: [{ type: 'query', key: 'ELEMENT_ID', value: '(?<eid>\\d+)' }],
        destination: '/newsukraine/el/:eid/',
      },
      // + по одному блоку на кожен feed із viaQuery у url-map.json (див. Interfaces)
    ],
  };
},
```

Якщо named-capture у `has.value` не спрацює на обраній версії Next (перевіряється тестом!) — запасний варіант: зробити `/newsukraine/` сторінку динамічною (`export const dynamic = 'force-dynamic'`) і читати `searchParams.ELEMENT_ID` прямо в сторінці листингу, рендерячи статтю замість списку. Тест не змінюється — він перевіряє поведінку, не механізм.

- [ ] **Step 4: Сторінка елемента**

`portal/src/app/newsukraine/el/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { newsIndex, getByKey } from '@/lib/content-store';
import { LegacyArticle } from '@/lib/legacy-article';
import { pageMetadata } from '@/lib/seo';

const FEED = 'newsukraine';

export const dynamicParams = false;
export function generateStaticParams() {
  return [...(newsIndex().get(FEED)?.keys() ?? [])].map((id) => ({ id: String(id) }));
}

function resolve(idStr: string) {
  const key = newsIndex().get(FEED)?.get(Number(idStr));
  return key ? getByKey(key) : null;
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = resolve((await params).id);
  return page ? pageMetadata(page) : {};
}

export default async function NewsElement({ params }: Props) {
  const page = resolve((await params).id);
  if (!page) notFound();
  return <LegacyArticle page={page} />;
}
```

У `pageMetadata` (seo.ts) канонікал уже будується з `page.key` — для query-новини `key` = `/newsukraine/?ELEMENT_ID=8959`, тож канонікал автоматично «точна стара query-форма». Перевірити, що це так, і нічого не «нормалізує» ключ.

Невідомий ELEMENT_ID: rewrite веде на `/newsukraine/el/999999/`; при `dynamicParams=false` Next віддасть 404 сам.

- [ ] **Step 5: Тести зелені**

Run: `npx vitest run test/query-urls.test.ts` → PASS. Якщо канонікал не з'являється — пам'ятати: `alternates.canonical` рендериться лише коли заданий (INDEXING=on у цьому тесті — саме для цього).

- [ ] **Step 6: Commit + push**

```bash
git add portal/src portal/test/query-urls.test.ts
git commit -m "portal: legacy query-string news URLs served via rewrites with exact-form canonicals"
git push
```

---

### Task 10: Стрічки новин + пагінація PAGEN_1

**Files:**
- Create: `portal/src/app/news/page.tsx`, `portal/src/app/news/page/[n]/page.tsx` (+ те саме для `newsall`, `newsukraine`, `newsworld`), `portal/src/lib/news-list.tsx`, `portal/test/listings.test.ts`
- Modify: `portal/next.config.ts` (rewrite PAGEN_1)

**Interfaces:**
- Consumes: `listNews` (Task 8); реальний perPage — звірити з crawl-даними: відкрити будь-який `/news/?PAGEN_1=2` у `out/raw/` і порахувати кількість тизерів на сторінці старого сайту; це значення зафіксувати в `PER_PAGE`.
- Produces: `/news/` (сторінка 1), `/news/?PAGEN_1=k` → той самий набір статей, що мав старий сайт на сторінці k (порядок date desc). Канонікал сторінки k = `/news/?PAGEN_1=k` (k>1), сторінки 1 = `/news/`.
- Обов'язкова звірка: `python3 -c "import json; m=json.load(open('../migration/out/url-map.json')); print(sorted({v['feed'] for v in m.values() if v['type']=='listing'}))"` — якщо у списку є listing-фіди ПОЗА четвіркою новинних (пагіновані розділи `/content/...` тощо), для кожного додати ідентичну пару «rewrite + сторінки» (той самий шаблон, інший FEED/базовий шлях) — інакше ці URL проваляться у verify-parity (Task 12).

- [ ] **Step 1: Тести (падають)**

`portal/test/listings.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('стрічки', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'on',
    SITE_ORIGIN: 'http://x.local', CANONICAL_ORIGIN: 'http://naas.gov.ua', rebuild: '1',
  });
  afterAll(() => stop());

  it('/newsall/ 200 і містить лінк на статтю', async () => {
    const html = await (await fetch(origin + '/newsall/')).text();
    expect(html).toContain('/newsall/newsnaan/8984/');
  });
  it('/newsall/?PAGEN_1=1 віддає 200 (rewrite)', async () => {
    const r = await fetch(origin + '/newsall/?PAGEN_1=1');
    expect(r.status).toBe(200);
  });
  it('порожня сторінка за межею → 404', async () => {
    const r = await fetch(origin + '/newsall/?PAGEN_1=99');
    expect(r.status).toBe(404);
  });
});
```

- [ ] **Step 2: Тести падають** — Run: `npx vitest run test/listings.test.ts` → FAIL.

- [ ] **Step 3: Імплементація**

`portal/src/lib/news-list.tsx`:

```tsx
import { listNews } from '@/lib/content-store';
import { notFound } from 'next/navigation';

export const PER_PAGE = 20; // ЗВІРИТИ з реальною сторінкою старого сайту (див. Interfaces) і виправити

export function NewsList({ feed, page }: { feed: string; page: number }) {
  const { items, total } = listNews(feed, page, PER_PAGE);
  if (!items.length && page > 1) notFound();
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  return (
    <main className="legacy-body">
      <h1>{feed}</h1>
      <ul>
        {items.map((it) => (
          <li key={it.key}>
            {it.date && <time dateTime={it.date}>{it.date}</time>}{' '}
            <a href={it.key}>{it.title}</a>
          </li>
        ))}
      </ul>
      <nav>
        {page > 1 && <a href={`/${feed}/${page - 1 > 1 ? `?PAGEN_1=${page - 1}` : ''}`}>← новіші</a>}{' '}
        {page < pages && <a href={`/${feed}/?PAGEN_1=${page + 1}`}>старіші →</a>}
      </nav>
    </main>
  );
}
```

Лінк на статтю: `it.key` для query-новин уже містить `?ELEMENT_ID=…` — саме так і треба (посилаємось на канонічну стару форму).

`portal/src/app/newsall/page.tsx` (клони для news/newsukraine/newsworld — ідентичні, інший FEED):

```tsx
import type { Metadata } from 'next';
import { NewsList } from '@/lib/news-list';

const FEED = 'newsall';

export function generateMetadata(): Metadata {
  const on = process.env.INDEXING === 'on';
  const origin = process.env.CANONICAL_ORIGIN ?? '';
  return { title: 'Новини НААН', ...(on && origin ? { alternates: { canonical: `${origin}/${FEED}/` } } : {}) };
}

export default function Page() {
  return <NewsList feed={FEED} page={1} />;
}
```

`portal/src/app/newsall/page/[n]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { NewsList, PER_PAGE } from '@/lib/news-list';
import { listNews } from '@/lib/content-store';

const FEED = 'newsall';

export const dynamicParams = false;
export function generateStaticParams() {
  const { total } = listNews(FEED, 1, PER_PAGE);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  return Array.from({ length: pages }, (_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const n = Number((await params).n);
  const on = process.env.INDEXING === 'on';
  const origin = process.env.CANONICAL_ORIGIN ?? '';
  const canonical = n === 1 ? `/${FEED}/` : `/${FEED}/?PAGEN_1=${n}`;
  return { title: `Новини НААН — сторінка ${n}`, ...(on && origin ? { alternates: { canonical: origin + canonical } } : {}) };
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  return <NewsList feed={FEED} page={Number((await params).n)} />;
}
```

`next.config.ts` — до `beforeFiles` додати для КОЖНОГО feed:

```ts
{
  source: '/newsall/',
  has: [{ type: 'query', key: 'PAGEN_1', value: '(?<p>\\d+)' }],
  destination: '/newsall/page/:p/',
},
```

(Порядок: PAGEN-правила ПІСЛЯ ELEMENT_ID-правил того ж feed.) `?PAGEN_1=99` (за межею) → `/newsall/page/99/` → dynamicParams=false → 404 — тест це перевіряє.

- [ ] **Step 4: Тести зелені** — Run: `npx vitest run test/listings.test.ts` → PASS.

- [ ] **Step 5: Звірити PER_PAGE з реальністю**

```bash
python3 - <<'EOF'
import re, json, hashlib
# порахувати тизери на збереженій сторінці /newsall/ (див. rawFile в inventory.jsonl)
inv = [json.loads(l) for l in open('../migration/out/inventory.jsonl')]
page = next(r for r in inv if r['key'] == '/newsall/')
raw = open('../migration/out/' + page['rawFile'], 'rb').read().decode('cp1251', 'replace')
print('лінків на новини на сторінці:', len(set(re.findall(r'/newsall/newsnaan/(\d+)/', raw))))
EOF
```

Виправити `PER_PAGE` на це число, якщо ≠20. Це утримує відповідність «сторінка k у старого == сторінка k у нового».

- [ ] **Step 6: Commit + push**

```bash
git add portal/src portal/test/listings.test.ts portal/next.config.ts
git commit -m "portal: news feeds with Bitrix-compatible PAGEN_1 pagination and canonicals"
git push
```

---

### Task 11: sitemap.xml + повний JSON-LD

**Files:**
- Create: `portal/src/app/sitemap.xml/route.ts`, `portal/test/seo.test.ts`
- Modify: `portal/src/lib/seo.ts` (повні JSON-LD-білдери), `portal/src/app/layout.tsx` (Organization JSON-LD)

**Interfaces:**
- Consumes: `contentIndex()` (Task 8), env-контракт (Task 7).
- Produces: `/sitemap.xml` — валідний XML усіх канонічних мігрованих URL (`loc` = `CANONICAL_ORIGIN`+key, включно з query-URL; `lastmod` = date, якщо є) при INDEXING=on; **404 при off**. JSON-LD: `GovernmentOrganization` у layout; `NewsArticle` (headline/datePublished/image/mainEntityOfPage/inLanguage uk) для новин; `WebPage` + `BreadcrumbList` (з сегментів шляху) для сторінок.

- [ ] **Step 1: Тести (падають)**

`portal/test/seo.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('sitemap + JSON-LD (INDEXING=on)', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'on',
    SITE_ORIGIN: 'http://x.local', CANONICAL_ORIGIN: 'http://naas.gov.ua', rebuild: '1',
  });
  afterAll(() => stop());

  it('sitemap містить прості й query-URL', async () => {
    const xml = await (await fetch(origin + '/sitemap.xml')).text();
    expect(xml).toContain('<loc>http://naas.gov.ua/content/statut-naan/</loc>');
    expect(xml).toContain('<loc>http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959</loc>'.replace('&', '&amp;'));
    expect(xml).toContain('<lastmod>2026-06-24</lastmod>');
  });
  it('новина має NewsArticle JSON-LD', async () => {
    const html = await (await fetch(origin + '/newsall/newsnaan/8984/')).text();
    const m = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/gs)!;
    const blobs = m.map((s) => JSON.parse(s.replace(/<\/?script[^>]*>/g, '')));
    const art = blobs.find((b) => b['@type'] === 'NewsArticle');
    expect(art).toBeTruthy();
    expect(art.datePublished).toBe('2026-06-24');
    expect(art.headline.length).toBeGreaterThan(3);
  });
  it('layout має GovernmentOrganization', async () => {
    const html = await (await fetch(origin + '/')).text();
    expect(html).toContain('"GovernmentOrganization"');
  });
});

describe('sitemap вимкнений на стейджингу', async () => {
  const { origin, stop } = await startPortal({ LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'off', rebuild: '1' });
  afterAll(() => stop());
  it('404 при INDEXING=off', async () => {
    expect((await fetch(origin + '/sitemap.xml')).status).toBe(404);
  });
});
```

- [ ] **Step 2: Тести падають** — Run: `npx vitest run test/seo.test.ts` → FAIL.

- [ ] **Step 3: Імплементація**

`portal/src/app/sitemap.xml/route.ts`:

```ts
import { contentIndex } from '@/lib/content-store';

import { servedKey } from '@/lib/seo';

export const dynamic = 'force-dynamic';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  if (process.env.INDEXING !== 'on') return new Response('Not found', { status: 404 });
  const origin = process.env.CANONICAL_ORIGIN ?? process.env.SITE_ORIGIN ?? '';
  const urls = [...contentIndex().entries()]
    .filter(([, e]) => ['page', 'news-article', 'home', 'listing'].includes(e.type))
    .map(([key, e]) =>
      `<url><loc>${esc(origin + servedKey(key))}</loc>${e.date ? `<lastmod>${e.date}</lastmod>` : ''}</url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
```

(Обсяг < 50 000 URL і < 50 МБ — один файл; якщо звіт Task 6 покаже більше — розбити на sitemap-index + чанки по 40 000, аналогічним route-хендлером `sitemap-<n>.xml`.)

`portal/src/lib/seo.ts` — доповнити:

```ts
export function jsonLdFor(page: LegacyPage): object {
  const origin = process.env.CANONICAL_ORIGIN ?? process.env.SITE_ORIGIN ?? '';
  const url = origin + page.key;
  if (page.type === 'news-article') {
    return {
      '@context': 'https://schema.org', '@type': 'NewsArticle',
      headline: page.h1 || page.title,
      ...(page.dateISO ? { datePublished: page.dateISO } : {}),
      ...(page.images.length ? { image: page.images.map((i) => origin + i) } : {}),
      mainEntityOfPage: url, inLanguage: 'uk',
      publisher: { '@type': 'GovernmentOrganization', name: 'Національна академія аграрних наук України' },
    };
  }
  const crumbs = page.key.split('?')[0].split('/').filter(Boolean);
  return {
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: page.title, url, inLanguage: 'uk',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Головна', item: origin + '/' },
        ...crumbs.map((seg, i) => ({
          '@type': 'ListItem', position: i + 2, name: decodeURIComponent(seg),
          item: origin + '/' + crumbs.slice(0, i + 1).join('/') + '/',
        })),
      ],
    },
  };
}

export function organizationLd(): object {
  return {
    '@context': 'https://schema.org', '@type': 'GovernmentOrganization',
    name: 'Національна академія аграрних наук України',
    alternateName: 'НААН',
    url: (process.env.CANONICAL_ORIGIN ?? process.env.SITE_ORIGIN ?? '') + '/',
  };
}
```

У `layout.tsx` — `<JsonLd data={organizationLd()} />` в `<body>`.

- [ ] **Step 4: Тести зелені** — Run: `npx vitest run test/seo.test.ts` → PASS.

- [ ] **Step 5: Повний тестовий прогін порталу**

Run: `cd portal && npm test` (усі сюїти) → PASS.

- [ ] **Step 6: Commit + push**

```bash
git add portal/src portal/test/seo.test.ts
git commit -m "portal: sitemap.xml (canonical keys incl. query URLs) + NewsArticle/WebPage/Org JSON-LD"
git push
```

---

### Task 12: Верифікатор паритету + повний локальний прогін

**Files:**
- Create: `migration/bin/verify-parity.js`, `migration/lib/parity.js`, `migration/test/parity.test.js`
- Output: `migration/out/reports/parity-report.tsv`, `migration/out/reports/parity-summary.md`

**Interfaces:**
- Consumes: `inventory.jsonl`, `url-map.json`, `content/` (Task 6); запущений портал (`--base http://127.0.0.1:3000`).
- Produces: `checkParity(rec, cls, page, res, htmlText) → {ok, fails: string[]}`; CLI `node bin/verify-parity.js --base <origin> [--live] [--sample N]`. Exit code 1, якщо є провали. Перевірки за типом:
  - `page|news-article|home`: новий статус 200; `<title>` НОВОГО == `rec.title` СТАРОГО (точно, після схлопування пробілів); текст видобутого `bodyHtml` міститься в новому HTML (нормалізовано; Jaccard по словах ≥ 0.9); усі `images[]` віддають 200 на новому origin (HEAD).
  - `gone`: новий статус 404. `redirect`: 301/308 і Location == `cls.to`.
  - `listing`: статус 200 (контентна еквівалентність листингів не вимагається — состав елементів гарантує store).
  - `--live`: додатково перефетчити старий URL і звірити його СВІЖИЙ title з `rec.title` (дрейф контенту з моменту краулу).

- [ ] **Step 1: Тести (падають)**

`migration/test/parity.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { normText, jaccardWords, checkParity } from '../lib/parity.js';

describe('normText/jaccard', () => {
  it('нормалізує теги і пробіли', () => {
    expect(normText('<p>Привіт  <b>світ</b>!</p>')).toBe('привіт світ!');
  });
  it('jaccard 1.0 на ідентичних, <1 на різних', () => {
    expect(jaccardWords('а б в г', 'а б в г')).toBe(1);
    expect(jaccardWords('а б в г', 'а б х у')).toBeLessThan(0.6);
  });
});

describe('checkParity', () => {
  const rec = { key: '/content/x/', title: 'Сторінка X', status: 200 };
  const page = { bodyHtml: '<p>Це тіло сторінки X з фактами.</p>', images: [] };
  it('ok коли title збігається і тіло входить', () => {
    const html = '<html><head><title>Сторінка X</title></head><body><main>Це тіло сторінки X з фактами.</main></body></html>';
    expect(checkParity(rec, { type: 'page' }, page, { status: 200 }, html).ok).toBe(true);
  });
  it('фейл на різному title', () => {
    const html = '<html><head><title>Інша</title></head><body>Це тіло сторінки X з фактами.</body></html>';
    const r = checkParity(rec, { type: 'page' }, page, { status: 200 }, html);
    expect(r.ok).toBe(false);
    expect(r.fails.join()).toContain('title');
  });
  it('gone має бути 404', () => {
    expect(checkParity({ key: '/dead/' }, { type: 'gone' }, null, { status: 404 }, '').ok).toBe(true);
    expect(checkParity({ key: '/dead/' }, { type: 'gone' }, null, { status: 200 }, '').ok).toBe(false);
  });
});
```

- [ ] **Step 2: Тести падають** — Run: `npx vitest run test/parity.test.js` → FAIL.

- [ ] **Step 3: Імплементація**

`migration/lib/parity.js`:

```js
import * as cheerio from 'cheerio';

export const normText = (html) =>
  cheerio.load(`<div>${html}</div>`)('div').text().replace(/\s+/g, ' ').trim().toLowerCase();

export function jaccardWords(a, b) {
  const A = new Set(a.split(' ')), B = new Set(b.split(' '));
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export function checkParity(rec, cls, page, res, htmlText) {
  const fails = [];
  const t = cls.type;
  if (t === 'gone') {
    if (res.status !== 404) fails.push(`status ${res.status} != 404`);
  } else if (t === 'redirect') {
    if (![301, 308].includes(res.status)) fails.push(`status ${res.status} != 30x`);
    else if (cls.to && !(res.location ?? '').includes(cls.to)) fails.push(`location ${res.location} != ${cls.to}`);
  } else if (t === 'listing') {
    if (res.status !== 200) fails.push(`status ${res.status}`);
  } else { // page | news-article | home
    if (res.status !== 200) fails.push(`status ${res.status}`);
    else {
      const newTitle = (cheerio.load(htmlText)('title').first().text() ?? '').replace(/\s+/g, ' ').trim();
      const oldTitle = (rec.title ?? '').replace(/\s+/g, ' ').trim();
      if (newTitle !== oldTitle) fails.push(`title "${newTitle}" != "${oldTitle}"`);
      if (page) {
        const body = normText(page.bodyHtml);
        const full = normText(htmlText);
        const sim = jaccardWords(body, full); // тіло — підмножина повної сторінки; Jaccard занижений хромом
        const contained = body.length < 40 ? full.includes(body) : sim >= 0.5 || full.includes(body.slice(0, 300));
        if (!contained) fails.push(`body similarity too low (${sim.toFixed(2)})`);
      }
    }
  }
  return { ok: fails.length === 0, fails };
}
```

`migration/bin/verify-parity.js`:

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { checkParity } from '../lib/parity.js';
import { politeFetch, decodeBody } from '../lib/decode.js';

const args = process.argv.slice(2);
const base = args[args.indexOf('--base') + 1];
const live = args.includes('--live');
const sampleIdx = args.indexOf('--sample');
const sample = sampleIdx >= 0 ? Number(args[sampleIdx + 1]) : Infinity;
if (!base) { console.error('usage: verify-parity --base <origin> [--live] [--sample N]'); process.exit(2); }

const OUT = new URL('../out/', import.meta.url).pathname;
const inv = readFileSync(OUT + 'inventory.jsonl', 'utf8').trim().split('\n').map(JSON.parse);
const map = JSON.parse(readFileSync(OUT + 'url-map.json', 'utf8'));
const index = JSON.parse(readFileSync(OUT + 'content/index.json', 'utf8'));

const rows = [['key', 'type', 'ok', 'fails']];
let bad = 0, checked = 0;
for (const rec of inv.slice(0, sample)) {
  const cls = map[rec.key];
  if (!cls || cls.type === 'error' || cls.type === 'unclassified') continue;
  const entry = index[rec.key];
  const page = entry ? JSON.parse(readFileSync(OUT + 'content/' + entry.file, 'utf8')) : null;
  let res = await politeFetch(base + rec.key, { retries: 1, timeoutMs: 20000 });
  if ([301, 308].includes(res.status) && res.location
      && ['page', 'news-article', 'home', 'listing'].includes(cls.type)) {
    // trailingSlash-нормалізація порталу (слеш-твін → канонічна форма) — йдемо за редіректом раз
    res = await politeFetch(new URL(res.location, base + rec.key).href, { retries: 1, timeoutMs: 20000 });
  }
  const html = res.buf.length ? new TextDecoder().decode(res.buf) : '';
  const { ok, fails } = checkParity(rec, cls, page, res, html);
  if (live && ok && ['page', 'news-article', 'home'].includes(cls.type)) {
    const old = await politeFetch(rec.fetchUrl, { retries: 1 });
    const oldHtml = decodeBody(old.buf, old.headers['content-type'] ?? '');
    const oldTitle = (oldHtml.match(/<title>(.*?)<\/title>/s)?.[1] ?? '').replace(/\s+/g, ' ').trim();
    if (oldTitle && oldTitle !== rec.title) rows.push([rec.key, cls.type, 'DRIFT', `live title changed: "${oldTitle}"`]) && bad++;
  }
  rows.push([rec.key, cls.type, ok ? 'ok' : 'FAIL', fails.join('; ')]);
  if (!ok) bad++;
  if (++checked % 100 === 0) console.log(`${checked} checked, ${bad} failures`);
}
// перевірка асетів: усі зображення з контенту
const imgSet = new Set();
for (const e of Object.values(index)) {
  const p = JSON.parse(readFileSync(OUT + 'content/' + e.file, 'utf8'));
  for (const i of p.images) imgSet.add(i);
}
let imgBad = 0;
for (const img of imgSet) {
  const r = await politeFetch(base + encodeURI(img), { method: 'HEAD', retries: 1, timeoutMs: 15000 });
  if (r.status !== 200) { rows.push([img, 'asset', 'FAIL', `status ${r.status}`]); imgBad++; }
}
writeFileSync(OUT + 'reports/parity-report.tsv', rows.map((r) => r.join('\t')).join('\n') + '\n');
writeFileSync(OUT + 'reports/parity-summary.md',
  `# Parity ${new Date().toISOString()}\n- pages checked: ${checked}\n- page failures: ${bad}\n- images checked: ${imgSet.size}\n- image failures: ${imgBad}\n- base: ${base}\n`);
console.log(`pages: ${checked}, failures: ${bad}; images: ${imgSet.size}, img failures: ${imgBad}`);
process.exit(bad + imgBad ? 1 : 0);
```

- [ ] **Step 4: Тести зелені** — Run: `npx vitest run test/parity.test.js` → PASS.

- [ ] **Step 5: Повний локальний прогін (реальний контент)**

```bash
cd portal && npm run build && npx next start -p 3000 &   # з дефолтним LEGACY_CONTENT_DIR
cd ../migration && node bin/verify-parity.js --base http://127.0.0.1:3000 2>&1 | tail -5
```

Очікувано: `failures: 0` для сторінок. Провали по зображеннях НОРМАЛЬНІ локально (асети ще не скопійовані — вони з'являться на сервері в Task 13): порахувати їх і переконатися, що ВСІ провали — тип `asset`, жоден — сторінковий. Якщо є сторінкові провали — розібрати кожен (це або пропуск екстракції, або незамічений патерн URL), виправити відповідний Task-компонент, повторити. **Показати `parity-summary.md` користувачу.**

- [ ] **Step 6: Commit + push**

```bash
git add migration/lib/parity.js migration/bin/verify-parity.js migration/test/parity.test.js migration/out/reports
git commit -m "migration: parity verifier (status/title/body/images vs old site) + local full run report"
git push
```

---

### Task 13: Деплой на неіндексований піддомен (SSH-гейти!)

**Files:**
- Create: `migration/bin/copy-assets.sh` (виконується НА СЕРВЕРІ), `portal/deploy/deploy.sh`, `portal/deploy/systemd-request.txt`, `portal/deploy/env.production.example`

**Interfaces:**
- Consumes: standalone-білд порталу (Task 7–11), `migration/out/content` (Task 6), `assets-manifest.tsv` (Task 6).
- Produces: живий портал на `http(s)://<піддомен>.naas.gov.ua` з `X-Robots-Tag: noindex`; асети скопійовані на сервері; systemd-заявка для Mirohost.

**ГЕЙТИ (перед кожним — явне питання користувачу):** (G1) перший SSH-огляд; (G2) rsync аплоад; (G3) запуск copy-assets на сервері; (G4) вибір імені піддомена + дії в панелі; (G5) надсилання systemd-заявки support-у.

**Якщо трек «сетап архітектури» вже створив systemd-сервіс / nginx-proxy / піддомен** — G4/G5 стають ЗВІРКОЮ, а не створенням: перевірити, що проксі вказує на порт порталу, сервіс активний (`systemctl status`), env-файл містить контракт цього плану (`INDEXING=off` на стейджингу!) — і рухатися далі зі Step 8.

- [ ] **Step 1: Артефакти деплою**

`portal/deploy/env.production.example`:

```
INDEXING=off
SITE_ORIGIN=http://portal.naas.gov.ua
# CANONICAL_ORIGIN задається ЛИШЕ при перемиканні основного домену (див. runbook)
LEGACY_CONTENT_DIR=/var/www/naasZ4/portal-app/content
PORT=3300
HOSTNAME=127.0.0.1
```

`portal/deploy/deploy.sh`:

```bash
#!/usr/bin/env bash
# Аплоад порталу на Mirohost eVPS. Перед запуском СПИТАТИ користувача (SSH-гейт G2).
set -euo pipefail
source ~/.naas_hosting.env
DEST="${NAAS_SSH_USER}@${NAAS_HOST}"
P="${NAAS_SSH_PORT:-22}"
APP=/var/www/naasZ4/portal-app

cd "$(dirname "$0")/.."
STANDALONE=1 npm run build
# standalone: server.js + мінімальний node_modules; static і public докладаються поруч
rsync -az -e "ssh -p $P" .next/standalone/ "$DEST:$APP/app/"
rsync -az -e "ssh -p $P" .next/static/ "$DEST:$APP/app/.next/static/"
rsync -az -e "ssh -p $P" public/ "$DEST:$APP/app/public/"
rsync -az -e "ssh -p $P" ../migration/out/content/ "$DEST:$APP/content/"
rsync -az -e "ssh -p $P" ../migration/out/assets-manifest.tsv ../migration/bin/copy-assets.sh "$DEST:$APP/"
echo "uploaded to $APP"
```

`migration/bin/copy-assets.sh` (іде на сервер; читає манфест, копіює файли зі старого docroot у `public/` порталу — БЕЗ перейменувань):

```bash
#!/usr/bin/env bash
# ЗАПУСКАЄТЬСЯ НА СЕРВЕРІ. Read-only до старого сайту: тільки cp З нього.
# usage: ./copy-assets.sh <old_docroot> <portal_public>
set -euo pipefail
OLD="$1"; PUB="$2"
[ -d "$OLD" ] || { echo "old docroot not found: $OLD"; exit 1; }
mkdir -p "$PUB"
missing=0; copied=0
while IFS=$'\t' read -r path _referrer _status _bytes; do
  [ -z "$path" ] && continue
  src="$OLD$path"; dst="$PUB$path"
  if [ -f "$src" ]; then
    mkdir -p "$(dirname "$dst")"
    cp -p "$src" "$dst"; copied=$((copied+1))
  else
    echo "MISSING: $path" >> copy-assets-missing.log; missing=$((missing+1))
  fi
done < assets-manifest.tsv
echo "copied=$copied missing=$missing (див. copy-assets-missing.log)"
```

`portal/deploy/systemd-request.txt` (текст заявки для support Mirohost — заповнюється фактами з G1):

```
Прохання створити systemd-сервіс:
  Назва:            naas-portal
  Користувач:       bbnaasnew
  Робоча тека:      /var/www/naasZ4/portal-app/app
  Команда запуску:  /usr/bin/node server.js
  Env-файл:         /var/www/naasZ4/portal-app/env.production
  Порт (внутрішній): 3300 (слухає 127.0.0.1)
  Автозапуск:       так (after network.target)
  Доступ нам:       start / restart / status
```

- [ ] **Step 2 (G1): SSH-огляд** — СПИТАТИ КОРИСТУВАЧА, потім:

```bash
source ~/.naas_hosting.env
ssh -p "${NAAS_SSH_PORT:-22}" "${NAAS_SSH_USER}@${NAAS_HOST}" '
  echo "--- HOME:"; ls ~ | head -30
  echo "--- який docroot старого сайту (шукаємо bitrix + upload):";
  for d in ~ ~/www ~/naas.gov.ua ~/httpdocs; do [ -d "$d/bitrix" ] && echo "DOCROOT=$d"; done
  echo "--- вільні порти:"; (command -v ss >/dev/null && ss -ltn | awk "{print \$4}" | grep -oE "[0-9]+$" | sort -n | uniq | tail -20) || netstat -ltn 2>/dev/null | tail -20
  echo "--- диск/квота:"; df -h ~ | tail -1; quota -s 2>/dev/null || true
  echo "--- чи цей сервер віддає live naas.gov.ua:";
  curl -s -o /dev/null -w "local-vhost:%{http_code}\n" -H "Host: naas.gov.ua" http://127.0.0.1/ || true
  echo "--- IP сервера vs DNS:"; hostname -I 2>/dev/null; getent hosts naas.gov.ua || true
'
```

Записати: `OLD_DOCROOT` (тека з `bitrix/` і `upload/`), вільний порт (3300 чи інший), і ВИСНОВОК: чи live-сайт на цьому сервері. **Якщо local-vhost ≠ 200 або IP не збігається** — асети НЕ можна взяти локальним cp; замінити Step 4 на server-side дзеркалення (на сервері: `while read path …; do curl -s --create-dirs -o "$PUB$path" "http://naas.gov.ua$path"; sleep 0.2; done < assets-manifest.tsv` — той самий скрипт-контракт: копія байт-у-байт у `public/`).

- [ ] **Step 3 (G2): Аплоад** — СПИТАТИ, потім `bash portal/deploy/deploy.sh`. Очікувано: `uploaded to /var/www/naasZ4/portal-app`. Слідом закинути env: скопіювати `env.production.example` → на сервер як `portal-app/env.production` (виправивши SITE_ORIGIN на обраний піддомен, PORT на обраний порт).

- [ ] **Step 4 (G3): Асети на сервері** — СПИТАТИ, потім:

```bash
ssh -p "${NAAS_SSH_PORT:-22}" "${NAAS_SSH_USER}@${NAAS_HOST}" '
  cd /var/www/naasZ4/portal-app &&
  chmod +x copy-assets.sh &&
  ./copy-assets.sh <OLD_DOCROOT з G1> /var/www/naasZ4/portal-app/app/public 2>&1 | tail -3
'
```

Очікувано: `copied=<тисячі> missing=<мало>`. Переглянути `copy-assets-missing.log` (перші 20): нормальні пропуски — файли, що вже були 404 на старому сайті.

- [ ] **Step 5: Тестовий запуск на сервері (без systemd, тимчасово)** — у тому ж SSH-сеансі:

```bash
ssh -p "${NAAS_SSH_PORT:-22}" "${NAAS_SSH_USER}@${NAAS_HOST}" '
  cd /var/www/naasZ4/portal-app/app &&
  set -a && . ../env.production && set +a &&
  nohup /usr/bin/node server.js > ../portal.log 2>&1 & sleep 5
  curl -s -o /dev/null -w "home:%{http_code}\n" http://127.0.0.1:3300/
  curl -s -o /dev/null -w "statut:%{http_code}\n" "http://127.0.0.1:3300/content/statut-naan/"
  curl -s -o /dev/null -w "qnews:%{http_code}\n" "http://127.0.0.1:3300/newsukraine/?ELEMENT_ID=8959"
  curl -sI http://127.0.0.1:3300/ | grep -i x-robots-tag
'
```

Очікувано: три `…:200` і `X-Robots-Tag: noindex, nofollow`. (Пам'ятати: без systemd процес умре після ребута — це тимчасово до G5.)

- [ ] **Step 6 (G4): Піддомен + nginx-proxy у панелі** — СПИТАТИ користувача: **яке ім'я піддомена?** (пропозиція: `portal.naas.gov.ua`; `new.naas.gov.ua` зайнятий showcase-планом). Далі користувач (або агент через claude-in-chrome, read-only навігація + користувач клікає «створити») у `control.mirohost.net`, пакет H-74503: створити піддомен + увімкнути «Nginx → проксування запитів до специфічного сервісу» на `127.0.0.1:<порт>`. Після цього:

```bash
curl -sI --max-time 20 http://portal.naas.gov.ua/ | head -5
curl -s -o /dev/null -w "%{http_code}\n" "http://portal.naas.gov.ua/newsukraine/?ELEMENT_ID=8959"
curl -s http://portal.naas.gov.ua/robots.txt
```

Очікувано: 200 + `X-Robots-Tag: noindex, nofollow`; 200 на query-URL; robots `Disallow: /`. Якщо панель дає SSL для піддомена (Let's Encrypt) — увімкнути й перевірити https; якщо ні — http достатньо для стейджингу (noindex все одно стоїть).

- [ ] **Step 7 (G5): systemd-заявка** — показати користувачу `portal/deploy/systemd-request.txt` (з фактичними портом/шляхами), він надсилає в support Mirohost. Після відповіді support: `systemctl status naas-portal` (через ssh) → active; прибити nohup-процес зі Step 5 (`pkill -f "node server.js"` ТІЛЬКИ свій процес — перевірити `pgrep -af "portal-app"` перед kill).

- [ ] **Step 8: Повний паритет проти стейджингу**

```bash
cd migration && node bin/verify-parity.js --base http://portal.naas.gov.ua --live 2>&1 | tail -5
```

Очікувано: `failures: 0` (включно з зображеннями тепер!). DRIFT-рядки (контент змінився на старому сайті з моменту краулу) — це сигнал повторити Task 6 Step 4–5 (докраул дельти: state-файл підхопить нове) і передеплоїти контент (Step 3 цього таска). Звіт закомітити:

```bash
git add migration/out/reports && git commit -m "migration: staging parity report (0 failures)" && git push
```

---

### Task 14: Runbook перемикання домену (документ, БЕЗ виконання)

**Files:**
- Create: `docs/runbooks/naas-domain-swap.md`

**Interfaces:**
- Consumes: усе попереднє. Виконується ЦЕЙ runbook у майбутній сесії за окремою командою користувача.

- [ ] **Step 1: Написати runbook** — `docs/runbooks/naas-domain-swap.md` з розділами (кожен пункт — конкретна команда або дія в панелі, без «і т.д.»):

```markdown
# Runbook: перемикання naas.gov.ua на новий портал

## Передумови (усі мають бути виконані)
- [ ] Паритет: verify-parity --live проти стейджингу = 0 failures (звіт свіжий, ≤ 3 днів)
- [ ] Стейкхолдери підтвердили запуск письмово
- [ ] Доступ до Google Search Console на naas.gov.ua Є (якщо нема — завести ЗАЗДАЛЕГІДЬ, підтвердити через DNS TXT у панелі Mirohost)
- [ ] systemd-сервіс naas-portal активний ≥ 1 тиждень без падінь (status + uptime)
- [ ] SSL-сертифікат для апекса naas.gov.ua ГОТОВИЙ (панель Mirohost / тікет support; старий сайт мав битий self-signed — це треба полагодити ДО свапу)

## Фриз і фінальна дельта (день X-1)
- [ ] Оголосити контент-фриз старого сайту (домовленість з редакторами)
- [ ] cd migration && node bin/crawl-live.js   # state-файл докачає лише нове
- [ ] node bin/extract-all.js && node bin/report.js
- [ ] локальний verify (Task 12 Step 5) → 0 сторінкових провалів
- [ ] деплой контенту: bash portal/deploy/deploy.sh (гейт SSH) + copy-assets.sh для нових асетів
- [ ] node bin/verify-parity.js --base http://portal.naas.gov.ua --live → 0 failures

## Перемикання (день X; вікно ~15 хв; кожен крок відкотний)
- [ ] Панель Mirohost: nginx для host naas.gov.ua (і www.naas.gov.ua) → proxy на 127.0.0.1:<порт порталу>
      (старий сайт ЛИШАЄТЬСЯ на диску й у MySQL — це і є rollback)
- [ ] env.production порталу: INDEXING=on, SITE_ORIGIN=https://naas.gov.ua, CANONICAL_ORIGIN=https://naas.gov.ua
- [ ] systemctl restart naas-portal (через доступ, наданий support)
- [ ] Увімкнути 301 http→https і www→apex (панель nginx; якщо панель не вміє — тікет support ЗАЗДАЛЕГІДЬ)
- [ ] Смок: curl -sI https://naas.gov.ua/ (200, БЕЗ X-Robots-Tag noindex); /robots.txt (Allow + Sitemap);
      /sitemap.xml (200, валідний XML); 5 вибіркових старих URL (зі списку нижче) — 200 і правильний title
      - http://naas.gov.ua/content/statut-naan/  → 301 на https → 200
      - https://naas.gov.ua/newsall/newsnaan/8984/
      - https://naas.gov.ua/newsukraine/?ELEMENT_ID=8959
      - https://naas.gov.ua/content/publichna-informaciya/pasport%20budget/
      - https://naas.gov.ua/upload/podani.pdf (асет)
- [ ] Стейджинговий піддомен портала: вимкнути або закрити (nginx off / noindex лишити) — щоб не плодити дублі

## Після (день X .. X+14)
- [ ] GSC: додати https://naas.gov.ua (URL-prefix), сабмітнути /sitemap.xml
- [ ] Bing Webmaster: те саме
- [ ] Щодня: GSC Coverage (Indexed/Excluded), логи порталу на 404 (grep " 404 " через ssh-гейт) — будь-який 404 на URL з inventory.jsonl = регресія, лагодити негайно
- [ ] Банер «НОВИЙ САЙТ НААН» на старій головній більше не існує (стара головна вимкнена) — переконатися, що showcase new.naas.gov.ua має noindex і не конкурує
- [ ] Через 14 днів: parity --live фінальний прогін + звіт стейкхолдерам

## Rollback (якщо критична регресія в перші години)
- [ ] Панель: nginx naas.gov.ua → назад на старий Bitrix (PHP) — старий сайт не чіпали, він живий
- [ ] env: INDEXING=off на порталі, restart
- [ ] Зафіксувати причину в docs/runbooks/ (post-mortem), виправити, повторити свап
```

- [ ] **Step 2: Commit + push**

```bash
git add docs/runbooks/naas-domain-swap.md
git commit -m "docs: domain-swap runbook (freeze, final delta, flip, GSC, rollback)"
git push
```

---

## Поза скоупом цього плану (наступні плани)

1. **Дизайн-порт** — перенесення обраної дизайн-системи (Astro-прототипи) у React-компоненти порталу; мігровані сторінки отримують повноцінний вигляд (URL і контент НЕ змінюються — тільки обгортка/стилі).
2. **Directus + MySQL (Фаза 1 архітектури)** — контент із JSON переїжджає в БД; `content-store.ts` перемикається з fs-читання на API-клієнт (інтерфейс уже ізольований).
3. **Нові розділи за ТЗ** (Міжнародна/Виставкова/Інноваційна діяльність тощо) — нові URL, контент від академії.
4. **EN-локаль як повноцінна** — стара `/en/` мігрується as-is цим планом; новий двомовний UX — окремо.
5. Косметика: гарні описи (meta description) для топ-сторінок — ДОДАВАННЯ, безпечне для SEO, але робиться свідомо окремо.

## Критерії приймання плану в цілому

1. `migration/out/inventory.jsonl` покриває все досяжне з сідів (плато BFS), 0 unclassified.
2. `verify-parity --base <staging> --live` → **0 failures**: кожен старий 200-URL віддає 200 з тим самим `<title>` і тілом; кожен старий 404 — 404; асети — 200.
3. Стейджинг: `X-Robots-Tag: noindex, nofollow` на кожній відповіді + robots.txt `Disallow: /` + sitemap 404. Перемикання на індексацію — ОДНА env-змінна.
4. `INDEXING=on`-режим (перевірено тестами): canonical на кожній сторінці, валідний sitemap.xml з усіма канонічними URL (включно з query-формами), JSON-LD трьох типів.
5. Рендеринг повністю server-side: увесь контент присутній у сирому HTML відповіді (перевіряється парсером verify-parity без виконання JS).
6. Runbook свапу існує і самодостатній.
