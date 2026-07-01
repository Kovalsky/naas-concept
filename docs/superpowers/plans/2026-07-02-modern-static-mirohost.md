# Показ Modern-сайту на new.naas.gov.ua (Mirohost) — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline; рекомендовано — план містить людські гейти підтверджень: панель хостингу, адмінка Bitrix). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** розгорнути статичний білд `site-modern` на піддомені `new.naas.gov.ua` (хостинг Mirohost, той самий пакет, де живе старий сайт) і перенаправити банер «НОВИЙ САЙТ НААН» на старій головній зі здохлого `naas.com.ua` на цей піддомен.

**Architecture:** Astro-сайт уже статичний (43 сторінки, без адаптера). Чистимо сорси від непідлінкованих асетів → чистий `dist` ≈ 682 МБ (10 МБ сайт + 672 МБ бібліотека документів, усі 162 документи реально злінковані) → вивантажуємо по FTP (lftp mirror) у docroot піддомену, створеного через панель Mirohost → міняємо один `href` у Bitrix.

**Tech Stack:** Astro 5 (static), python3 (аудит-скрипт), lftp (аплоад), панель control.mirohost.net (піддомен/DNS/SSL), Bitrix-адмінка старого сайту (read-only + 1 підтверджене збереження), claude-in-chrome для панелі/адмінки.

## Global Constraints

- **Закон:** сайти на доменах/піддоменах gov.ua **не можна хостити за межами України** (виняток лише через СБУ — не наш шлях). Тому тільки Mirohost; жодних Cloudflare/закордонних CDN для `*.naas.gov.ua`. (Наявний деплой на `naas-portal-modern.pages.dev` — не gov.ua-домен, лишається як превʼю, його не чіпаємо.)
- **Перед КОЖНИМ підключенням до Mirohost (SSH або FTP) — явно спитати користувача.** Жорстке правило сесій цього проєкту.
- **Старий сайт недоторканний:** на хостингу писати ТІЛЬКИ в docroot нового піддомену; файли/теки Bitrix у `/var/www/naasZ4` не чіпати. В адмінці Bitrix — read-only; єдина дозволена мутація в цьому плані — заміна `href` банера, і лише після явного «так» користувача на показаний diff.
- **Кожен коміт — одразу push** в `origin` (`git@github.com:Kovalsky/naas-concept.git`), гілка `main`. Перед комітом перевіряти `git branch --show-current` і `git status` (паралельні сесії в цьому репо — реальність). **Не додавати в коміти чужі untracked-файли** (`CLAUDE.md`, `docs/architecture/`, `docs/infrastructure/`, `docs/design-review-*.md`).
- Креденшели тільки з `~/.naas_hosting.env` через `source`; **ніколи не друкувати значення** в вивід/логи/коміти.
- Відповідати користувачу українською.

## Довідка: перевірені факти середовища (сесія 2026-07-01/02)

- `site-modern/` — статичний Astro; `npm run build` → `dist/` (43 сторінки, ~4 с). `dist/` у `.gitignore` (рядок 3 кореневого).
- Повний dist до чистки: 704,5 МБ / 335 файлів. Реально референсується 229 файлів = 681,4 МБ. **Сироти: 106 файлів = 23 МБ, УСІ в `img/`** (зайві hero-варіанти `emblem-*`, section-зображення, кілька .doc/.pdf, що помилково лежать в `img/sections`). Битих внутрішніх посилань 0. Сироти перевірено зворотним `grep -F` по всьому dist — 0 згадок (включно з inline-скриптами).
- `public/docs` = 672 МБ: 162 файли (121 PDF), усі злінковані з 13 сторінок (`publichna-informatsiia/*` ×7, `prozorist/tendery`, `atestatsiia`, `statut`, `naan-sohodni`, `intelektualna-vlasnist/*` ×2). Найважче — 14 фін-звітів-сканів по 20–25 МБ. Імена файлів — ASCII-транслітерація (без кирилиці/пробілів, крім хіба одиничних — mirror це переживає).
- `dist/404.html` існує. `public/` не має robots.txt / .htaccess (додамо). Symlink-ів у `public/` нема.
- DNS-зона `naas.gov.ua` — на NS Mirohost (`ns1/ns2/ns3.mirohost.net`); A головного = 77.87.193.125. CAA-записів нема.
- Хостинг: панель `https://control.mirohost.net`, пакет **H-74503**; SSH `vs581.mirohost.net:22`, user `bbnaasnew`, пароль (без ключів); FTP — хост/креди у `~/.naas_hosting.env`; FTP обмежений по IP, цей Mac проходить. Деталі сервера: `docs/infrastructure/mirohost-server.md`.
- `~/.naas_hosting.env` містить змінні (значення не читати вголос): `NAAS_HOST, NAAS_SSH_USER, NAAS_SSH_PORT, NAAS_SSH_KEY, NAAS_SSH_PASS, NAAS_PANEL_URL, NAAS_PANEL_USER, NAAS_PANEL_PASS, NAAS_FTP_HOST, NAAS_FTP_USER, NAAS_FTP_PASS, NAAS_FTP_PORT`.
- На Mac: `rsync` є (`/usr/bin/rsync`), **lftp і sshpass відсутні** → ставимо lftp через brew.
- Старий сайт: `http://naas.gov.ua` (тільки http; https зламаний, self-signed; кодування cp1251). Банер на головній (у контент-зоні, після слайдер-блоку):
  `<a target="_blank"? href="https://naas.com.ua/" ><img src="/upload/medialibrary/b2a/Group 19.png" title="Group 19.png" border="0" alt="Group 19.png" width="1235" height="73" /></a>`
  (атрибути точно як у HTML головної 2026-07-01; напис на картинці: «НОВИЙ САЙТ НААН / САЙТ ПРАЦЮЄ В ТЕСТОВОМУ РЕЖИМІ»). `naas.com.ua` — чужий домен (зареєстр. «PE Skurikhin Mykola»), реєстрація спливла 2026-07-01, сайт не відповідає.
- Адмінка Bitrix: `http://naas.gov.ua/bitrix/admin/` — користувач логіниться сам у своєму Chrome; працювати через `mcp__claude-in-chrome__javascript_tool` (in-page `fetch` з `credentials:'include'` несе HttpOnly-cookie). Тільки GET до кроку збереження. Дашборд повільний (таймаути ~45 с — норма, повторити).

---

### Task 1: Preflight (read-only)

**Files:** нічого не змінюється.

**Interfaces:**
- Produces: підтвердження, що середовище відповідає Довідці; свіжий `dist/`.

- [ ] **Step 1: Стан репо і гілки**

```bash
cd /Users/falco/dev/naas_github_pages
git branch --show-current        # очікувано: main
git status --short               # очікувано: лише untracked CLAUDE.md, docs/architecture/, docs/infrastructure/, docs/design-review-*.md (чужі — не чіпати)
git pull --ff-only origin main
```

Якщо гілка не `main` або є незнайомі зміни в `site-modern/` — зупинитись і спитати користувача (паралельна сесія могла щось міняти).

- [ ] **Step 2: Свіжий білд збирається**

```bash
cd site-modern && npm run build 2>&1 | tail -3
```

Очікувано: `[build] 43 page(s) built` (кількість може трохи зрости, якщо додали сторінки) і `Complete!`.

- [ ] **Step 3: Живий превʼю-деплой відповідає**

```bash
curl -sI --max-time 20 https://naas-portal-modern.pages.dev/ | head -3   # очікувано: HTTP/2 200
```

---

### Task 2: Аудит-скрипт у репо + чистка сиріт + чистий білд

**Files:**
- Create: `scripts/audit_dist.py`
- Delete: ~106 файлів під `site-modern/public/img/` (точний список дає скрипт)

**Interfaces:**
- Produces: `scripts/audit_dist.py <dist> <outdir>` → пише `used.txt`, `orphans.txt`, `broken.txt`, `report.txt` в `<outdir>`, друкує звіт; після чистки `orphans.txt` порожній. Task 3 і Task 5 використовують скрипт як deploy-gate.

- [ ] **Step 1: Створити `scripts/audit_dist.py`** (повний вміст; скрипт уже обкатаний на dist 2026-07-02)

```python
#!/usr/bin/env python3
"""Аудит dist: які файли реально референсяться зі сторінок сайту.

Використання: python3 audit_dist.py /path/to/dist /path/to/outdir
Пише used.txt, orphans.txt, broken.txt, report.txt у outdir.
"""
import os, re, sys, urllib.parse
from collections import defaultdict

DIST = os.path.abspath(sys.argv[1])
OUT = os.path.abspath(sys.argv[2])
os.makedirs(OUT, exist_ok=True)

all_files = {}
for root, dirs, files in os.walk(DIST):
    for f in files:
        p = os.path.join(root, f)
        rel = os.path.relpath(p, DIST)
        all_files[rel] = os.path.getsize(p)

used = set()
broken = defaultdict(set)

def norm(ref, base_rel_dir):
    ref = ref.strip()
    if not ref or ref.startswith('#'):
        return None
    if re.match(r'^[a-zA-Z][a-zA-Z0-9+.\-]*:', ref):  # http:, mailto:, tel:, data:
        return None
    if ref.startswith('//'):
        return None
    ref = ref.split('#')[0].split('?')[0]
    if not ref:
        return None
    ref = urllib.parse.unquote(ref)
    if ref.startswith('/'):
        cand = os.path.normpath(ref.lstrip('/'))
    else:
        cand = os.path.normpath(os.path.join(base_rel_dir, ref))
    return cand

def mark(ref, base_rel_dir, source):
    cand = norm(ref, base_rel_dir)
    if cand is None:
        return
    if cand in ('.', ''):
        cand = 'index.html'
    if cand in all_files:
        used.add(cand)
        return
    c2 = os.path.normpath(os.path.join(cand, 'index.html'))
    if c2 in all_files:
        used.add(c2)
        return
    broken[cand].add(source)

ATTR_RE = re.compile(r'''(?:\bsrc|\bhref|\bposter|data-src|data-href)\s*=\s*["']([^"']+)["']''', re.I)
META_CONTENT_RE = re.compile(r'''content\s*=\s*["'](/[^"']+)["']''', re.I)
SRCSET_RE = re.compile(r'''srcset\s*=\s*["']([^"']+)["']''', re.I)
URL_RE = re.compile(r'''url\(\s*['"]?([^'")]+)['"]?\s*\)''')
JS_STR_RE = re.compile(
    r'''["'`](/[^"'`\s]+?\.(?:png|jpe?g|webp|avif|svg|gif|ico|mp4|webm|pdf|docx?|xlsx?|json|txt|csv|woff2?))["'`]''',
    re.I)

for rel in sorted(all_files):
    ext = rel.rsplit('.', 1)[-1].lower() if '.' in rel else ''
    full = os.path.join(DIST, rel)
    base_dir = os.path.dirname(rel)
    if ext == 'html':
        text = open(full, encoding='utf-8', errors='replace').read()
        for m in ATTR_RE.finditer(text):
            mark(m.group(1), base_dir, rel)
        for m in META_CONTENT_RE.finditer(text):
            mark(m.group(1), base_dir, rel)
        for m in SRCSET_RE.finditer(text):
            for part in m.group(1).split(','):
                u = part.strip().split(' ')[0]
                if u:
                    mark(u, base_dir, rel)
        for m in URL_RE.finditer(text):
            mark(m.group(1), base_dir, rel)
    elif ext == 'css':
        text = open(full, encoding='utf-8', errors='replace').read()
        for m in URL_RE.finditer(text):
            mark(m.group(1), base_dir, rel)
    elif ext in ('js', 'mjs'):
        text = open(full, encoding='utf-8', errors='replace').read()
        for m in JS_STR_RE.finditer(text):
            mark(m.group(1), base_dir, rel)

# Сторінки сайту та службові файли — завжди used
for rel in all_files:
    ext = rel.rsplit('.', 1)[-1].lower() if '.' in rel else ''
    base = os.path.basename(rel)
    if ext == 'html':
        used.add(rel)
    elif rel.startswith('_astro' + os.sep):  # хешовані бандли: dynamic imports відносні, рахуємо всі
        used.add(rel)
    elif base in ('robots.txt', '_headers', '_redirects', '.htaccess',
                  'favicon.ico', 'favicon.svg', 'sitemap.xml', 'sitemap-index.xml'):
        used.add(rel)

orphans = {r: s for r, s in all_files.items() if r not in used}
used_sz = sum(all_files[r] for r in used)
orph_sz = sum(orphans.values())
tot_sz = sum(all_files.values())

def hs(n):
    for u in ('B', 'KB', 'MB', 'GB'):
        if n < 1024 or u == 'GB':
            return f'{n:.1f}{u}' if u != 'B' else f'{n}B'
        n /= 1024

def topdir(rel):
    return rel.split(os.sep)[0] if os.sep in rel else '(root)'

rep = []
rep.append(f'Всього файлів: {len(all_files)}  ({hs(tot_sz)})')
rep.append(f'Використовується: {len(used)}  ({hs(used_sz)})')
rep.append(f'Сироти (не референсяться): {len(orphans)}  ({hs(orph_sz)})')
rep.append('')
rep.append('== Сироти за теками ==')
agg = defaultdict(lambda: [0, 0])
for r, s in orphans.items():
    agg[topdir(r)][0] += 1
    agg[topdir(r)][1] += s
for d, (c, s) in sorted(agg.items(), key=lambda kv: -kv[1][1]):
    rep.append(f'  {hs(s):>10}  {c:>4} ф.  {d}')
rep.append('')
rep.append('== Топ-25 найбільших сиріт ==')
for r, s in sorted(orphans.items(), key=lambda kv: -kv[1])[:25]:
    rep.append(f'  {hs(s):>10}  {r}')
rep.append('')
rep.append(f'== Биті внутрішні посилання: {len(broken)} ==')
for tgt in sorted(broken)[:40]:
    srcs = sorted(broken[tgt])
    rep.append(f'  {tgt}   <- {srcs[0]}' + (f' (+{len(srcs)-1})' if len(srcs) > 1 else ''))

report = '\n'.join(rep)
open(os.path.join(OUT, 'report.txt'), 'w').write(report)
open(os.path.join(OUT, 'used.txt'), 'w').write('\n'.join(sorted(used)) + '\n')
open(os.path.join(OUT, 'orphans.txt'), 'w').write('\n'.join(sorted(orphans)) + '\n')
open(os.path.join(OUT, 'broken.txt'), 'w').write(
    '\n'.join(f'{t}\t<- {", ".join(sorted(broken[t]))}' for t in sorted(broken)) + '\n')
print(report)
```

- [ ] **Step 2: Запустити аудит — зафіксувати сиріт**

```bash
cd /Users/falco/dev/naas_github_pages/site-modern
python3 ../scripts/audit_dist.py dist /tmp/naas_audit
```

Очікувано в звіті: `Сироти (не референсяться): ~106 (≈23MB)`, «Сироти за теками» — лише `img`, `Биті внутрішні посилання: 0`. Якщо сироти зʼявились ПОЗА `img/` або є биті посилання — зупинитись, розібратися (контент могли змінити після 2026-07-02).

- [ ] **Step 3: Safety-гейти перед видаленням**

```bash
grep -cv '^img/' /tmp/naas_audit/orphans.txt
# очікувано: 0  (усі сироти в img/)

while IFS= read -r f; do
  base=$(basename "$f")
  grep -rFq -- "$base" src && echo "ЗГАДКА у src: $f"
done < /tmp/naas_audit/orphans.txt
# очікувано: порожній вивід. Якщо є згадки (напр. закоментований код) — ці файли НЕ видаляти, решту можна.
```

- [ ] **Step 4: Видалити сиріт із сорсів**

```bash
while IFS= read -r f; do rm "public/$f"; done < /tmp/naas_audit/orphans.txt
find public -type d -empty -delete
```

(Шляхи в `orphans.txt` відносні до dist і 1:1 збігаються з `public/` — статичні файли Astro копіює як є.)

- [ ] **Step 5: Перевірка — чистий білд без сиріт**

```bash
npm run build 2>&1 | tail -2        # очікувано: Complete!
python3 ../scripts/audit_dist.py dist /tmp/naas_audit2 | head -4
# очікувано: «Сироти (не референсяться): 0», використовується ≈682MB
du -sh dist                          # очікувано: ~682M
```

- [ ] **Step 6: Коміт + push**

```bash
cd /Users/falco/dev/naas_github_pages
git add scripts/audit_dist.py site-modern/public
git status --short   # у staged — ТІЛЬКИ scripts/audit_dist.py і видалення під site-modern/public/img
git commit -m "site-modern: prune ~23MB unreferenced public/img assets; add dist audit script"
git push origin main
```

---

### Task 3: Конфіг під new.naas.gov.ua (site URL, robots, 404, деплой-скрипт)

**Files:**
- Modify: `site-modern/astro.config.mjs`
- Create: `site-modern/public/robots.txt`, `site-modern/public/.htaccess`, `scripts/deploy-modern-mirohost.sh`

**Interfaces:**
- Consumes: `scripts/audit_dist.py` (Task 2).
- Produces: `scripts/deploy-modern-mirohost.sh` — збирає, ганяє аудит (deploy-gate: 0 сиріт) і дзеркалить `dist/` на FTP у `$NAAS_NEW_SITE_DEST`; використовується в Task 5 і для всіх майбутніх редеплоїв.

- [ ] **Step 1: `astro.config.mjs` — канонічний хост**

Замінити вміст на:

```js
// @ts-check
import { defineConfig } from 'astro/config';

// Static output (default). Канонічний хост — new.naas.gov.ua (Mirohost, вимога
// закону про розміщення gov.ua в Україні); naas-portal-modern.pages.dev — превʼю.
export default defineConfig({
  site: 'https://new.naas.gov.ua',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
```

- [ ] **Step 2: `public/robots.txt` — не індексувати, поки «тестовий режим»**

```
# Тестовий режим нового сайту НААН: індексацію вимкнено, щоб не плодити
# дублікати зі старим naas.gov.ua. Зняти Disallow, коли піддомен стане основним.
User-agent: *
Disallow: /
```

- [ ] **Step 3: `public/.htaccess` — 404-сторінка**

```
ErrorDocument 404 /404.html
```

(Спрацює, якщо піддомен віддає Apache; якщо чистий nginx — файл проігнорується, 404 буде серверний. Це косметика, не блокер — фактичну поведінку перевіримо в Task 5 Step 4.)

- [ ] **Step 4: `scripts/deploy-modern-mirohost.sh`** (повний вміст)

```bash
#!/usr/bin/env bash
# Деплой site-modern/dist на Mirohost → new.naas.gov.ua.
# ПРАВИЛО ПРОЄКТУ: запускати ЛИШЕ після явного дозволу користувача на підключення до Mirohost.
# Потребує: ~/.naas_hosting.env з NAAS_FTP_HOST/USER/PASS(+PORT) і NAAS_NEW_SITE_DEST
# (docroot піддомену відносно FTP-кореня; додається в Task 4 Step 4).
set -euo pipefail
source "$HOME/.naas_hosting.env"
: "${NAAS_NEW_SITE_DEST:?Додай NAAS_NEW_SITE_DEST у ~/.naas_hosting.env (див. Task 4)}"

cd "$(dirname "$0")/../site-modern"
npm run build
python3 ../scripts/audit_dist.py dist /tmp/naas_audit_deploy > /dev/null
orphans=$(grep -c . /tmp/naas_audit_deploy/orphans.txt || true)
if [ "${orphans}" != "0" ]; then
  echo "СТОП: у dist ${orphans} непідлінкованих файлів — спершу почисти (див. Task 2)."
  exit 1
fi

lftp -u "${NAAS_FTP_USER},${NAAS_FTP_PASS}" -p "${NAAS_FTP_PORT:-21}" "${NAAS_FTP_HOST}" -e "
set ftp:ssl-allow true;
set ssl:verify-certificate no;
mirror -R --parallel=4 --only-newer --verbose dist/ ${NAAS_NEW_SITE_DEST};
bye"
echo "OK: dist → ${NAAS_NEW_SITE_DEST}"
```

```bash
chmod +x /Users/falco/dev/naas_github_pages/scripts/deploy-modern-mirohost.sh
```

- [ ] **Step 5: Перевірка білда з новими файлами**

```bash
cd /Users/falco/dev/naas_github_pages/site-modern
npm run build 2>&1 | tail -2
ls dist/robots.txt dist/.htaccess dist/404.html
# очікувано: усі три існують (Astro копіює public/ включно з dot-файлами).
# Якщо dist/.htaccess раптом нема — фолбек: у Task 5 закинути його вручну (lftp put).
```

- [ ] **Step 6: Коміт + push**

```bash
cd /Users/falco/dev/naas_github_pages
git add site-modern/astro.config.mjs site-modern/public/robots.txt site-modern/public/.htaccess scripts/deploy-modern-mirohost.sh
git commit -m "site-modern: target new.naas.gov.ua (site URL, robots noindex for test mode, 404 htaccess, mirohost deploy script)"
git push origin main
```

---

### Task 4: Піддомен new.naas.gov.ua у панелі Mirohost (з користувачем)

**Files:** поза репо (панель хостингу). У кінці — один рядок у `~/.naas_hosting.env`.

**Interfaces:**
- Produces: працюючий vhost `new.naas.gov.ua` + DNS A-запис; фактичний **docroot** піддомену, записаний як `NAAS_NEW_SITE_DEST` у `~/.naas_hosting.env` (його споживає `scripts/deploy-modern-mirohost.sh`).

- [ ] **Step 1: Користувач логіниться в панель** `https://control.mirohost.net` у своєму Chrome (якщо ще не залогінений). Агент працює в цій же вкладці через claude-in-chrome.

- [ ] **Step 2: Read-only розвідка** — знайти в панелі керування пакетом `H-74503` розділ доменів/піддоменів (відомі шляхи SPA: `/order/H-74503`, `/order/H-74503/vs_management/...`; шукати пункти типу «Домени», «Піддомени», «Сайти»). Подивитись, як створюється піддомен і чи є опція SSL/Let's Encrypt. **Нічого не зберігати.** Панель — Metro-4 SPA, повільна: таймаути ~45 с — норма.

- [ ] **Step 3: STOP-гейт → створення.** Показати користувачу знайдену форму і параметри: імʼя `new` (→ `new.naas.gov.ua`), docroot який пропонує панель. Після явного «так» — створити піддомен (клік користувача або підтверджена дія агента). Якщо панель дає SSL/Let's Encrypt для піддомену — окремим підтвердженням увімкнути.
  **Фолбек:** якщо панель не вміє піддомени на цьому пакеті — тікет у підтримку Mirohost від користувача: «Прошу створити піддомен new.naas.gov.ua у пакеті H-74503 (docroot у нашому домашньому каталозі, статичний сайт, без PHP) та, якщо можливо, випустити Let's Encrypt-сертифікат для нього».

- [ ] **Step 4: Записати docroot** (шлях, який показала панель; ВІДНОСНО FTP-кореня — звірити через `lftp ls` у Task 5) у env-файл, значення не світити в логи:

```bash
echo 'NAAS_NEW_SITE_DEST=<docroot-з-панелі>' >> ~/.naas_hosting.env
```

- [ ] **Step 5: Перевірка DNS і vhost**

```bash
dig +short new.naas.gov.ua        # очікувано: Aзапис (ймовірно 77.87.193.125 або інший IP пакета)
curl -sI --max-time 20 http://new.naas.gov.ua/ | head -3
# очікувано: будь-яка відповідь сервера (200/403/404) — docroot ще порожній, головне що vhost живий.
# DNS може доїжджати до ~1 год (NS Mirohost — зазвичай хвилини).
```

---

### Task 5: Вивантаження dist (682 МБ) по FTP

**Files:** поза репо (FTP docroot піддомену).

**Interfaces:**
- Consumes: `scripts/deploy-modern-mirohost.sh` (Task 3), `NAAS_NEW_SITE_DEST` (Task 4).

- [ ] **Step 1: Поставити lftp** (на Mac його нема):

```bash
command -v lftp || brew install lftp
```

- [ ] **Step 2: ASK-гейт:** спитати користувача дозвіл на підключення до Mirohost по FTP (правило проєкту — перед кожним підключенням).

- [ ] **Step 3: Звірити docroot і запустити деплой**

```bash
source ~/.naas_hosting.env
lftp -u "${NAAS_FTP_USER},${NAAS_FTP_PASS}" -p "${NAAS_FTP_PORT:-21}" "${NAAS_FTP_HOST}" -e "set ftp:ssl-allow true; set ssl:verify-certificate no; ls; bye"
# очікувано: видно домашній каталог; знайти шлях docroot з Task 4, за потреби скоригувати NAAS_NEW_SITE_DEST

/Users/falco/dev/naas_github_pages/scripts/deploy-modern-mirohost.sh
# очікувано: build → аудит 0 сиріт → mirror ~229 файлів, фінальний рядок "OK: dist → …".
# 682 МБ — перший аплоад триватиме десятки хвилин; повторні (—only-newer) — секунди/хвилини.
```

- [ ] **Step 4: Верифікація сайту на піддомені**

```bash
curl -sI http://new.naas.gov.ua/ | head -5
# очікувано: 200, Content-Type: text/html
curl -s http://new.naas.gov.ua/ | grep -o '<title>[^<]*</title>'
# очікувано: титул головної Modern-сайту
curl -sI http://new.naas.gov.ua/publichna-informatsiia/vykorystannya-koshtiv/ | head -3   # очікувано: 200
curl -sI "http://new.naas.gov.ua/docs/pubinfo__vikoristannya_koshtiv/zvit-za-9-misiatsiv-2025-roku.pdf" | grep -iE 'HTTP|content-length'
# очікувано: 200, Content-Length ≈ 25–26 млн байт
curl -sI http://new.naas.gov.ua/takoi-storinky-nema/ | head -1
# очікувано: 404 (бажано наша сторінка; якщо серверний 404 nginx — прийнятно, зафіксувати)
```

Якщо в Task 4 вмикали SSL — повторити перші дві перевірки з `https://` (валідний сертифікат, 200).

- [ ] **Step 5: Браузерна перевірка** (claude-in-chrome): відкрити `http://new.naas.gov.ua/` — головна рендериться, шрифти Golos Text вантажаться (Google Fonts — зовнішній ресурс, це ок), перемикач світла/темна працює, 2–3 внутрішні переходи ок.

---

### Task 6: Банер на старій головній → new.naas.gov.ua

**Files:** поза репо (контент Bitrix). Єдина мутація старого сайту.

**Interfaces:**
- Consumes: працюючий `new.naas.gov.ua` (Task 5), протокол http/https — за фактом Task 4/5.

- [ ] **Step 1: Read-only розвідка місця банера.** Користувач залогінений в `http://naas.gov.ua/bitrix/admin/`. Через `javascript_tool` у вкладці адмінки — знайти, де лежить `naas.com.ua`:

```js
// найімовірніше банер вставлено WYSIWYG-ом у контент головної (/index.php)
const r = await fetch('/bitrix/admin/fileman_file_view.php?path=%2Findex.php&lang=ru', {credentials:'include'});
const t = await r.text();
console.log('у /index.php:', t.includes('naas.com.ua'));
```

Якщо `false` — спробувати `&lang=ua`, потім переглянути include-области головної (`fileman_admin.php?path=%2F` → файли `*_inc*.php`, `include/`), шукаючи рядок `naas.com.ua`. Тільки GET/перегляд.

- [ ] **Step 2: STOP-гейт.** Показати користувачу точний diff (один атрибут):

```
- href="https://naas.com.ua/"
+ href="http://new.naas.gov.ua/"     ← або https://, якщо в Task 4 випущено сертифікат
```

Чекати явного «так». Обумовити відкат: повернути старий href тим самим шляхом.

- [ ] **Step 3: Одне збереження.** Або користувач сам у візуальному редакторі (Структура сайту → index.php → Редагувати), або агент через адмінку в його Chrome — рівно одна дія збереження, більше нічого не чіпати (жодних «очистити кеш/переіндексувати»).

- [ ] **Step 4: Верифікація**

```bash
curl -s http://naas.gov.ua/ | iconv -f cp1251 -t utf-8 | grep -o 'href="[^"]*new\.naas\.gov\.ua[^"]*"'
# очікувано: href="http(s)://new.naas.gov.ua/"
curl -s http://naas.gov.ua/ | iconv -f cp1251 -t utf-8 | grep -c 'naas\.com\.ua'
# очікувано: 0
```

І клік по банеру в браузері → відкривається новий сайт.

---

### Task 7: Фініш і фіксація знань

**Files:**
- Modify: `docs/infrastructure/mirohost-server.md` (дописати розділ про піддомен: docroot, як створено, SSL-статус; файл untracked і належить іншій сесії — **дописати, але не комітити**)
- Memory: оновити `naas-govua-hosting-law.md` (банер перенаправлено, дата) і `naas-modern-static-audit.md` (чистку виконано, деплой живий) у `~/.claude/projects/-Users-falco-dev-naas-github-pages/memory/`

- [ ] **Step 1: Дописати факти** в `docs/infrastructure/mirohost-server.md`: піддомен `new.naas.gov.ua`, фактичний docroot, спосіб деплою (`scripts/deploy-modern-mirohost.sh`), SSL-статус, дата.

- [ ] **Step 2: Оновити memory-файли** (обидва згадані вище: статус «виконано», фактичний docroot/протокол).

- [ ] **Step 3: Підсумок користувачу:** URL піддомену, розмір вивантаженого, статус SSL, статус банера, відкриті хвости:
  - зняти `Disallow: /` з robots.txt, коли сайт перестане бути «тестовим»;
  - 404 через nginx (якщо .htaccess не спрацював) — за бажання тікет у Mirohost;
  - майбутні редеплої: `scripts/deploy-modern-mirohost.sh` (після дозволу на підключення) + коміт-пуш змін.

---

## Верифікація всього ланцюга (фінальний чекліст)

1. `git log origin/main` містить коміти Task 2 і Task 3; `git status` чистий (крім чужих untracked).
2. `python3 scripts/audit_dist.py site-modern/dist /tmp/a` → 0 сиріт, 0 битих посилань.
3. `curl -sI http://new.naas.gov.ua/` → 200; головна, розділ публічної інформації і великий PDF відкриваються; браузерний спот-чек пройдено.
4. Головна старого сайту: банер веде на `new.naas.gov.ua`, згадок `naas.com.ua` нема.
5. Старий сайт неушкоджений: `curl -sI http://naas.gov.ua/` → 200, розділи відкриваються як до змін.
