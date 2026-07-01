# 1:1 content migration of the old naas.gov.ua (SEO preservation) + Next.js portal — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (user decision 2026-07-02: execution happens in a **NEW session**, fresh subagent per task, review between tasks). Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **DO NOT START until the prerequisite is met:** the new Next.js architecture is set up (Track 2; see the "Prerequisites and track sequencing" section below).
>
> **Language note:** documentation is in English (project rule, 2026-07-02). Ukrainian strings inside code blocks are FUNCTIONAL data — old-site fixtures, expected titles, month names for date parsing, UI text of the Ukrainian-language site — and must remain Ukrainian. Reply to the user in Ukrainian.

**Goal:** move ALL public content of the old `naas.gov.ua` site (Bitrix) onto the new portal (Next.js) one-to-one — same URLs, same titles/content, server-side rendering, sitemap.xml and JSON-LD — and deploy it to a non-indexed `naas.gov.ua` subdomain so that at the moment of the domain switch the SEO weight is preserved 1:1 (zero redirects for migrated pages).

**Architecture:** two new packages in the repo. (1) `migration/` — a Node pipeline: polite BFS crawler of the old site (cp1251→UTF-8) → URL inventory (`inventory.jsonl`) → classification (`url-map.json`) → content extraction into JSON (`out/content/`) → parity verifier. (2) `portal/` — Next.js (App Router, SSG + ISR-ready) that serves the migrated content at the **exact old URLs** (including query-string URLs like `?ELEMENT_ID=`), with an `INDEXING` env toggle (noindex on the subdomain → full indexing after the swap). Content storage for now is JSON files (per the decision "JSON now, database later"); the `content-store` interface isolates that decision so it can later be swapped for the Directus API without touching the pages.

**Tech Stack:** Node ≥20 (20.20.2 on the server — that is the compatibility ceiling), cheerio (HTML parsing), vitest (tests for both packages), Next.js App Router (`output: 'standalone'`, `trailingSlash: true`), rsync+SSH (deploy to the Mirohost eVPS), nginx proxy + systemd via the Mirohost panel/support.

## Prerequisites and track sequencing (WHEN to execute this plan)

Project sequence (fixed by the user 2026-07-02). This plan is **Track 3**, the last one:

- **Track 0 — showcase design fixes:** the implementation plan for `site-modern` design fixes (per the audit `docs/design-review-site-modern-2026-07-01.md`) is being prepared by a PARALLEL session. For this plan, `site-modern/` is foreign territory.
- **Track 1 — deploy the showcase "site as is" (already with Track 0 fixes):** static `site-modern` on `new.naas.gov.ua` — plan `2026-07-02-modern-static-mirohost.md`. Occupies the `new.` subdomain.
- **Track 2 — new-architecture setup — HARD PREREQUISITE of this plan:** per `docs/architecture/portal-architecture.md` (roadmap §10–11) a deployed Next.js portal: initialized `portal/` app, Node process on the server (systemd service via Mirohost support), nginx proxy to the portal subdomain. A separate plan in a separate session (the prompt for it was handed to the user 2026-07-02). Directus+MySQL are **not required** for Track 3 (content storage here is JSON per the "JSON now, database later" decision); if they are already in place — they don't interfere.
- **Track 3 — THIS plan (1:1 migration):** executed AFTER Track 2 — fills the already-deployed Next.js portal with migrated content at the old URLs and prepares the domain switch.

Track 3's technical dependency is Track 2 only. Tracks 0–1 (showcase) are a neighboring line of work that does not technically block the migration, but by user decision runs earlier.

How this plan behaves with things already done in Track 2: **Task 7** (the `portal/` skeleton) and **Task 13** (systemd/nginx/subdomain) do NOT recreate already-existing artifacts — they only **verify** conformance to this plan's contract (`trailingSlash`, conditional `standalone`, env `INDEXING/SITE_ORIGIN/LEGACY_CONTENT_DIR`, port) and **add** whatever is missing. The tests of those tasks are the contract that must pass regardless of who created the app.

## Global Constraints

- **Law:** `*.naas.gov.ua` is hosted ONLY in Ukraine (Mirohost). No Cloudflare / foreign CDNs for gov.ua.
- **Before EVERY connection to the server (SSH/rsync/scp) — explicitly ask the user.** Hard project rule. FTP is not used by this plan (transport is rsync over SSH).
- **The old site is untouchable:** on the server write only into `~/portal-app/` (a new directory). Bitrix files may be read (read-only: `ls`, `cat`, `cp` FROM them), never modified/deleted. No queries against the old site's MySQL in this plan.
- **Crawling the production site is polite:** concurrency 2, ≥500 ms pause between requests, `GET`/`HEAD` only, User-Agent `NAAS-migration/1.0`. Never touch `/bitrix/` (admin/core) — no exception exists below.
- **Parallel sessions in this repo:** `content/`, `site/`, `site-light/`, `site-modern/`, `site-lucidity/`, `scripts/check-facts.mjs` are foreign — do NOT edit. This plan only creates the new directories `migration/`, `portal/`, `docs/runbooks/` + lines in the root `.gitignore`. Do not include other sessions' untracked files (`CLAUDE.md`, `docs/design-review-*.md`) in commits.
- **Branch:** all work on `feat/legacy-migration-portal` (worktree created at execution time — using-git-worktrees skill). Every commit is pushed to `origin` on that branch. Before committing: `git branch --show-current` + `git status --short`.
- Credentials only from `~/.naas_hosting.env` via `source`; never print the values (to output, logs, commits).
- **Node ceiling:** the server runs Node **20.20.2** with no way to upgrade it ourselves. When installing any dependency (`next`, `cheerio`, `vitest`), check its `engines` compatibility with Node 20 and pin an older major if needed.
- Reply to the user in Ukrainian. All documentation in English.

## Reference: verified facts (session 2026-07-02, curl/read)

- Old site: `http://naas.gov.ua` — **http only** (https is broken, self-signed), pages are **windows-1251**. The home page returns 200. `www.naas.gov.ua` also returns 200 without a redirect (duplicate host).
- The old site's `robots.txt` is a Drupal-era relic: `Crawl-delay: 10` + Disallow only for Drupal paths (`/includes/`, `/misc/`, …, `/?q=…`) — **none of them block Bitrix content**. `sitemap.xml` — 404.
- **URL patterns** (from the home page + admin probe):
  - path-based news: `/newsall/newsnaan/8984/` → 200; **also 200 without the trailing slash, no redirect** (duplicates).
  - query-based news: `/newsukraine/?ELEMENT_ID=8959` → 200 (a valid, indexed pattern!).
  - `/2/detail.php?ID=8516` → **404** (a broken link right on the old home page; styled 404 ≈57 KB).
  - content pages: `/content/<section>/<subsection>/` — mixed case (`/content/Intelekt_vlasnist/`), sometimes **without a trailing slash** (`/content/publichna-informaciya/FAO`) and even **with a space** (`/content/publichna-informaciya/pasport budget/`).
  - other root directories (from the Bitrix file manager): `Agrolectures`, `Viddilennya_instituty`, `academi`, `contacts`, `en` (2017-era English version), `news`, `newsall`, `newsukraine`, `newsworld`, `preview`, `content`, `images`, `img`, `slide`, `video`.
- **Bitrix template s1:** main content lives in `<main class="content">`; `<h1>` is inside it; `<title>` has no site suffix (e.g. «Про НААН»); `meta description/keywords` are present but **empty**. The template has no breadcrumbs.
- **Volume (admin-probe estimates, 2026-06):** 38 content iblocks; `/upload/iblock/` ≈ 3,826 shards, ~10,900 files (~9,200 images); `/upload/medialibrary/` ≈ 846 files; `/content/` — 92 subdirectories. News IDs reach ~8985.
- Prior extractions at the repo root (`naas_extract*`, `naas_content_bundle_extracted`, `naas_news_slice`, `naas_persons`) are **curated slices for the design prototypes, NOT a full migration** (9 news items, 28 persons). Use them only as test fixtures and reference. `naas_news_slice/raw/` holds saved news-page HTML; the root has `naas_about.html`, `naas_home.html` etc. (raw cp1251) — ready-made fixtures.
- Local Node: v25.9.0; `new TextDecoder('windows-1251')` works (verified). Server has Node 20.20.2 (TextDecoder present there too, full-icu — verified in the 2026-07-01 session).
- Server (details: `docs/infrastructure/mirohost-server.md`): eVPS-8 Debian 12, SSH `vs581.mirohost.net:22`, user `bbnaasnew`, password from env; NO root, crontab blocked; systemd services are created by Mirohost support from data we provide; the nginx proxy to an internal port is enabled by us in the `control.mirohost.net` panel (package H-74503); HOME `/var/www/naasZ4` is shared with the old site. Disk: df shows ~242 GB free (the plan's nominal quota is 49 GB — re-check the quota before copying assets).
- **Uncertainty (checked in Task 13):** whether the same physical server serves the live `naas.gov.ua` (A record 77.87.193.125). If yes — assets are copied with a local `cp`; if not — mirror them over HTTP server-to-server.
- The parallel plan `docs/superpowers/plans/2026-07-02-modern-static-mirohost.md` occupies the **`new.naas.gov.ua`** subdomain (static site-modern showcase, FTP). Our portal deploys to a **different** subdomain (default proposal: `portal.naas.gov.ua`; the final name is confirmed by the user in Task 13). Do not touch the showcase.

## URL policy (the doctrine of this plan)

1. **Every migrated page lives at its OLD URL** — byte-for-byte the same path (+query for query URLs). Zero redirects for canonical old URLs.
2. New sections (absent from the old site — "International activity" etc.) get new URLs; out of scope for this plan.
3. Old-site duplicates (the same page with/without a trailing slash; the `www.` host) are normalized: the canonical form is **with the slash, apex host**; the non-canonical form returns 308 → canonical (Next `trailingSlash: true`). This is the only controlled deviation from the old behavior (the old site returned 200 for both) — a redirect to the canonical is safe and better than a duplicate.
4. Assets (`/upload/…`, `/content/**/*.pdf|doc…`, `/images/…`, `/img/…`, `/video/…`, `/slide/…`) keep their **exact paths and file names** (no re-encoding/renaming — byte-identical paths).
5. URLs broken on the old site (404, like `/2/detail.php?ID=8516`) remain 404 on the new one (we do NOT "fix" them).
6. `/bitrix/**` (template css/js/admin) is **not migrated** — the new portal has its own frontend layer.
7. Internal service routes of the new portal that did not exist on the old site (`/newsukraine/el/<id>` — the rewrite target) emit a `canonical` pointing to the old query form themselves.

## Data schema (the contract between `migration/` and `portal/`)

```
migration/out/
  inventory.jsonl          # 1 line = 1 URL (committed to git — this is the SEO contract)
  url-map.json             # classification: key → {type, feed?, id?, page?}   (committed)
  assets-manifest.tsv      # asset_path <TAB> referrer <TAB> status <TAB> bytes (committed)
  reports/                 # crawl/parity reports (committed)
  raw/                     # raw page bytes <sha1(key)>.html (gitignored)
  content/                 # extracted content (gitignored; deployed via rsync)
    index.json             # { "<key>": {file,type,title,feed?,id?,date?} }
    pages/<sha1(key)>.json # LegacyPage (schema below)
```

`inventory.jsonl` record: `{"key","path","query":{},"fetchUrl","status","contentType","title","sha1","bytes","location"?,"referrer","fetchedAt","rawFile"?}`.
`key` is the canonical identifier: the **decoded** UTF-8 path + the sorted whitelisted query (`?ELEMENT_ID=8959`). The trailing slash is the **raw discovered form** (as the old site links it: `/newsall/newsnaan/8984/` with a slash, but `/content/publichna-informaciya/FAO` without; do NOT "canonicalize" the slash before fetching — slash twins are deduplicated, and reconciliation on the portal side is a `content-store` fallback). `fetchUrl` keeps the **original** percent-encoding (for re-fetching from the old server).

`LegacyPage` (JSON in `content/pages/`):

```json
{
  "key": "/content/statut-naan/",
  "type": "page | news-article | listing | home",
  "feed": "newsnaan", "id": 8984, "viaQuery": false,
  "title": "Статут НААН",
  "metaDescription": null,
  "h1": "Статут НААН",
  "dateISO": "2026-06-24",
  "bodyHtml": "<p>…original href/src, no <script>…</p>",
  "images": ["/upload/iblock/29b/ФОТО.jpg"],
  "files": [{"href": "/upload/podani.pdf", "text": "Звіт"}],
  "sourceUrl": "http://naas.gov.ua/content/statut-naan/",
  "fetchedAt": "2026-07-02T12:00:00Z",
  "contentSha1": "…"
}
```

The `feed/id/viaQuery/dateISO` fields are news-only; `metaDescription` is almost always `null` (empty on the old site — we record the fact, we do NOT invent descriptions in this plan).

---

### Task 1: Working branch + `migration/` scaffold

**Files:**
- Create: `migration/package.json`, `migration/.gitignore`, `migration/README.md`
- Modify: `/.gitignore` (root — 3 lines)

**Interfaces:**
- Produces: npm package `naas-migration` with a working `npm test` (vitest), directories `lib/ bin/ test/ out/`.

- [ ] **Step 1: Branch/worktree**

The worktree was **already created** on 2026-07-02 (together with the commit of this plan): `/Users/falco/dev/naas_migration_wt`, branch `feat/legacy-migration-portal` (pushed to origin). Enter it; if the worktree was removed — recreate it from the existing branch:

```bash
cd /Users/falco/dev/naas_migration_wt 2>/dev/null || {
  cd /Users/falco/dev/naas_github_pages
  git worktree add ../naas_migration_wt feat/legacy-migration-portal
  cd ../naas_migration_wt
}
git branch --show-current   # expected: feat/legacy-migration-portal
git pull --ff-only origin feat/legacy-migration-portal
```

- [ ] **Step 2: Package scaffold**

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

`migration/README.md` — 10 lines: the pipeline's purpose, command order (`crawl → extract → verify`), links to this plan and `docs/architecture/portal-architecture.md`.

- [ ] **Step 3: Dependencies with an engines check**

```bash
cd migration
npm i cheerio && npm i -D vitest
node -e "for (const p of ['cheerio','vitest']) console.log(p, require('./node_modules/'+p+'/package.json').engines ?? 'no engines field')"
```

Expected: engines absent or compatible with `>=20`. If any package requires Node >20 — pin the previous major (`npm i vitest@2`) and record that in the README.

- [ ] **Step 4: Root `.gitignore`**

Append to the root `.gitignore`:

```
# ── Legacy-migration pipeline: raw mirrors and extracted content (regenerable) ──
/migration/out/raw/
/migration/out/content/
/migration/out/crawl-state.json
```

- [ ] **Step 5: vitest smoke test**

`migration/test/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';
describe('toolchain', () => {
  it('decodes windows-1251 with the native TextDecoder', () => {
    const buf = Uint8Array.from([0xEF, 0xF0, 0xE8, 0xE2, 0xB3, 0xF2]);
    expect(new TextDecoder('windows-1251').decode(buf)).toBe('привіт');
  });
});
```

Run: `npm test` → expected `1 passed`.

- [ ] **Step 6: Commit + push**

```bash
git add migration .gitignore
git commit -m "migration: scaffold pipeline package (vitest, cheerio, out/ layout)"
git push -u origin feat/legacy-migration-portal
```

---

### Task 2: cp1251 decoding + URL normalization (`lib/decode.js`)

**Files:**
- Create: `migration/lib/decode.js`, `migration/test/decode.test.js`

**Interfaces:**
- Produces (consumed by Tasks 3–5, 12):
  - `decodeBody(buf: Uint8Array, contentTypeHeader: string): string`
  - `smartDecodeURIComponent(s: string): string` — %-sequences: UTF-8, falling back to cp1251 when invalid
  - `normalizeUrl(raw: string, base?: string): null | {external:true, href} | {external:false, key, path, query, droppedParams, fetchUrl}`
  - `politeFetch(url, {method?, timeoutMs?, retries?}): Promise<{status, headers, buf, location?}>` — redirect:'manual', backoff 1s/4s/10s, UA `NAAS-migration/1.0`

- [ ] **Step 1: Tests (failing)**

`migration/test/decode.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { decodeBody, smartDecodeURIComponent, normalizeUrl } from '../lib/decode.js';

const CP1251_PRYVIT = Uint8Array.from([0xEF, 0xF0, 0xE8, 0xE2, 0xB3, 0xF2]);

describe('decodeBody', () => {
  it('honors the charset from the header', () => {
    expect(decodeBody(CP1251_PRYVIT, 'text/html; charset=windows-1251')).toBe('привіт');
  });
  it('no charset: tries utf-8, falls back to cp1251 when invalid', () => {
    expect(decodeBody(new TextEncoder().encode('démo'), 'text/html')).toBe('démo');
    expect(decodeBody(CP1251_PRYVIT, 'text/html')).toBe('привіт');
  });
});

describe('smartDecodeURIComponent', () => {
  it('utf-8 percent escapes', () => {
    expect(smartDecodeURIComponent('%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%82')).toBe('статут');
  });
  it('cp1251 percent escapes (legacy Bitrix links)', () => {
    expect(smartDecodeURIComponent('%F1%F2%E0%F2%F3%F2')).toBe('статут');
  });
  it('spaces and plain characters', () => {
    expect(smartDecodeURIComponent('/content/pasport%20budget/')).toBe('/content/pasport budget/');
  });
});

describe('normalizeUrl', () => {
  it('relative → key on the naas.gov.ua host', () => {
    const r = normalizeUrl('/newsall/newsnaan/8984/', 'http://naas.gov.ua/');
    expect(r).toMatchObject({ external: false, key: '/newsall/newsnaan/8984/', query: {} });
  });
  it('www + https normalize to http apex', () => {
    const r = normalizeUrl('https://www.naas.gov.ua/content/statut-naan/');
    expect(r.external).toBe(false);
    expect(r.fetchUrl).toBe('http://naas.gov.ua/content/statut-naan/');
  });
  it('whitelisted query is kept and sorted, junk is dropped', () => {
    const r = normalizeUrl('/newsukraine/?utm_source=x&ELEMENT_ID=8959');
    expect(r.key).toBe('/newsukraine/?ELEMENT_ID=8959');
    expect(r.droppedParams).toEqual(['utm_source']);
  });
  it('PAGEN_* is whitelisted', () => {
    expect(normalizeUrl('/news/?PAGEN_1=3').key).toBe('/news/?PAGEN_1=3');
  });
  it('fragment is stripped; externals are flagged; javascript: → null', () => {
    expect(normalizeUrl('/content/kontakti/#map').key).toBe('/content/kontakti/');
    expect(normalizeUrl('https://prozorro.gov.ua/x').external).toBe(true);
    expect(normalizeUrl('javascript:void(0)')).toBe(null);
  });
  it('decoded path in key, original encoding in fetchUrl', () => {
    const r = normalizeUrl('/upload/%F1%F2%E0%F2%F3%F2.pdf');
    expect(r.key).toBe('/upload/статут.pdf');
    expect(r.fetchUrl).toBe('http://naas.gov.ua/upload/%F1%F2%E0%F2%F3%F2.pdf');
  });
});
```

- [ ] **Step 2: Confirm the tests fail**

Run: `npx vitest run test/decode.test.js` → expected: FAIL (`Cannot find module '../lib/decode.js'`).

- [ ] **Step 3: Implementation**

`migration/lib/decode.js`:

```js
const D1251 = new TextDecoder('windows-1251');
const DUTF8_STRICT = new TextDecoder('utf-8', { fatal: true });

export function decodeBody(buf, contentTypeHeader = '') {
  const m = /charset=([\w-]+)/i.exec(contentTypeHeader);
  const cs = (m?.[1] || '').toLowerCase();
  if (cs === 'utf-8' || cs === 'utf8') return new TextDecoder('utf-8').decode(buf);
  if (cs === 'windows-1251' || cs === 'cp1251') return D1251.decode(buf);
  if (cs) { try { return new TextDecoder(cs).decode(buf); } catch { /* unknown charset */ } }
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

- [ ] **Step 4: Tests green**

Run: `npx vitest run test/decode.test.js` → expected: all PASS.

- [ ] **Step 5: Commit + push**

```bash
git add migration/lib/decode.js migration/test/decode.test.js
git commit -m "migration: cp1251-aware decoding, URL normalization, polite fetcher"
git push
```

---

### Task 3: BFS crawler (`lib/crawl.js`)

**Files:**
- Create: `migration/lib/crawl.js`, `migration/test/crawl.test.js`

**Interfaces:**
- Consumes: `normalizeUrl`, `decodeBody`, `politeFetch` (Task 2).
- Produces (consumed by Tasks 4–6):
  - `crawl({seeds, fetchFn, delayMs, maxPages, state, onPage, onCheckpoint, saveRaw}): Promise<{inventory: Map<key,Rec>, assets: Map<path,AssetRec>, state}>` — `onCheckpoint(stateSnapshot)` fires every 50 pages (resumability of the live crawl)
  - `Rec = {key,path,query,fetchUrl,status,contentType,title,sha1,bytes,location?,referrer,fetchedAt,rawFile?}` (the `inventory.jsonl` schema)
  - `AssetRec = {path, fetchUrl, referrer}` (statuses/sizes are filled in by Task 6)
  - `extractLinks(html: string, baseUrl: string): {pages: string[], assets: string[]}`
  - An asset is: path prefix `/upload/|/images/|/img/|/video/|/slide/` OR extension `pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|gif|webp|bmp|mp[34]|avi|rtf|txt`; `/bitrix/**` is ignored entirely.

- [ ] **Step 1: Tests (failing)**

`migration/test/crawl.test.js` — a mini-site as a URL→response map, `fetchFn` is a stub:

```js
import { describe, it, expect } from 'vitest';
import { crawl, extractLinks } from '../lib/crawl.js';

const enc1251 = (s) => {
  // encode Ukrainian into cp1251 for realistic bytes: ASCII only in this stub + the letter "і" (0xB3)
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
  it('splits pages/assets, drops /bitrix/ and externals', () => {
    const html = '<a href="/content/a/">a</a><img src="/upload/x/у.jpg"><a href="/bitrix/js/x.js">b</a><a href="/doc.pdf">d</a>';
    const { pages, assets } = extractLinks(html, 'http://naas.gov.ua/');
    expect(pages).toEqual(['/content/a/']);
    expect(assets.sort()).toEqual(['/doc.pdf', '/upload/x/у.jpg']);
  });
});

describe('crawl', () => {
  it('BFS visits everything reachable, writes an inventory with titles and statuses', async () => {
    const { inventory, assets } = await crawl({ seeds: ['/'], fetchFn, delayMs: 0 });
    expect(inventory.get('/')).toMatchObject({ status: 200, title: 'NAAS' });
    expect(inventory.get('/content/a/')).toMatchObject({ status: 200, title: 'A' });
    expect(inventory.get('/newsall/newsnaan/8984/')).toMatchObject({ status: 200 });
    expect(inventory.get('/newsukraine/?ELEMENT_ID=8959')).toMatchObject({ status: 200, title: 'Q news' });
    expect(inventory.get('/gone/')).toMatchObject({ status: 404 });
    expect(inventory.has('/bitrix/admin/')).toBe(false);
    expect([...assets.keys()].sort()).toEqual(['/upload/iblock/x/фото.jpg', '/upload/podani.pdf'].sort());
  });
  it('resumes from state (already-visited pages are not re-fetched)', async () => {
    let calls = 0;
    const counting = async (u) => { calls++; return fetchFn(u); };
    const first = await crawl({ seeds: ['/'], fetchFn: counting, delayMs: 0 });
    const callsAfterFirst = calls;
    await crawl({ seeds: ['/'], fetchFn: counting, delayMs: 0, state: first.state });
    expect(calls).toBe(callsAfterFirst); // nothing was re-downloaded
  });
});
```

- [ ] **Step 2: Tests fail**

Run: `npx vitest run test/crawl.test.js` → FAIL (`Cannot find module '../lib/crawl.js'`).

- [ ] **Step 3: Implementation**

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

// slash twin: /a/ ↔ /a (query untouched). Keys are stored RAW (as the old site
// links them); the twin is used only for deduplication — to avoid fetching both forms.
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

- [ ] **Step 4: Tests green**

Run: `npx vitest run test/crawl.test.js` → PASS. Watch the `/newsukraine/?ELEMENT_ID=8959` case: the `/newsukraine/` path already has the slash and the query is preserved (the test catches it).

- [ ] **Step 5: Commit + push**

```bash
git add migration/lib/crawl.js migration/test/crawl.test.js
git commit -m "migration: resumable BFS crawler with asset manifest and bitrix/external filtering"
git push
```

---

### Task 4: URL classification (`lib/classify.js`)

**Files:**
- Create: `migration/lib/classify.js`, `migration/test/classify.test.js`

**Interfaces:**
- Consumes: `Rec` records (Task 3).
- Produces (consumed by Tasks 5, 6, 9–12): `classify(rec) → {type, feed?, id?, viaQuery?, page?}`; types: `home | news-article | listing | page | redirect | gone | error | unclassified`. `buildUrlMap(inventoryIterable) → {map: Object<key,cls>, report: {counts, unclassified: string[]}}`.

- [ ] **Step 1: Tests (failing)**

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
  it('home page', () => expect(classify(rec('/')).type).toBe('home'));
  it('path-based news', () =>
    expect(classify(rec('/newsall/newsnaan/8984/'))).toMatchObject({ type: 'news-article', feed: 'newsnaan', id: 8984 }));
  it('query-based news', () =>
    expect(classify(rec('/newsukraine/?ELEMENT_ID=8959'))).toMatchObject({ type: 'news-article', feed: 'newsukraine', id: 8959, viaQuery: true }));
  it('feeds and pagination', () => {
    expect(classify(rec('/news/'))).toMatchObject({ type: 'listing', feed: 'news', page: 1 });
    expect(classify(rec('/newsall/?PAGEN_1=3'))).toMatchObject({ type: 'listing', feed: 'newsall', page: 3 });
  });
  it('content pages (including spaces and mixed case)', () => {
    expect(classify(rec('/content/publichna-informaciya/pasport budget/')).type).toBe('page');
    expect(classify(rec('/content/Intelekt_vlasnist/')).type).toBe('page');
    expect(classify(rec('/preview/katalog-x/')).type).toBe('page');
    expect(classify(rec('/Agrolectures/')).type).toBe('page');
  });
  it('statuses take precedence', () => {
    expect(classify(rec('/2/detail.php?ID=8516', 404)).type).toBe('gone');
    expect(classify(rec('/x/', 301, { location: '/y/' }))).toMatchObject({ type: 'redirect', to: '/y/' });
    expect(classify(rec('/x/', 0)).type).toBe('error');
  });
});
```

- [ ] **Step 2: Tests fail**

Run: `npx vitest run test/classify.test.js` → FAIL.

- [ ] **Step 3: Implementation**

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

- [ ] **Step 4: Tests green**

Run: `npx vitest run test/classify.test.js` → PASS.

- [ ] **Step 5: Commit + push**

```bash
git add migration/lib/classify.js migration/test/classify.test.js
git commit -m "migration: URL classification into home/news/listing/page/gone/redirect"
git push
```

---

### Task 5: Content extractor (`lib/extract.js`) — on real fixtures

**Files:**
- Create: `migration/lib/extract.js`, `migration/test/extract.test.js`, `migration/test/fixtures/` (real cp1251 pages)

**Interfaces:**
- Consumes: `decodeBody` (Task 2), `classify` (Task 4).
- Produces (consumed by Tasks 6, 8): `extractPage(rawBuf, rec, cls) → LegacyPage` (schema — see "Data schema"). Guarantees: `bodyHtml` has no `<script>/<style>/<form>/on* attributes/javascript: hrefs`, original `href/src` are NOT rewritten; the first `<h1>` is lifted into the `h1` field and removed from `bodyHtml`; `title` is the exact `<title>` text; `metaDescription: null` when the attribute is empty.

- [ ] **Step 1: Fixtures from real saved pages**

```bash
mkdir -p migration/test/fixtures
cp /Users/falco/dev/naas_github_pages/naas_about.html    migration/test/fixtures/about.cp1251.html
cp /Users/falco/dev/naas_github_pages/naas_struktura.html migration/test/fixtures/struktura.cp1251.html
ls /Users/falco/dev/naas_github_pages/naas_news_slice/raw | head -5
```

Expected: `naas_news_slice/raw` contains saved news-page HTML; copy ONE file as `migration/test/fixtures/news-article.cp1251.html`. If the directory is empty/different — fetch a live page:

```bash
curl -s --max-time 20 "http://naas.gov.ua/newsall/newsnaan/8984/" -o migration/test/fixtures/news-article.cp1251.html
```

Then eyeball the date markup in the news page (for the selector in Step 2):

```bash
python3 -c "
import re
raw = open('migration/test/fixtures/news-article.cp1251.html','rb').read().decode('cp1251')
m = re.search(r'<main class=\"content\">(.{0,800})', raw, re.S)
print(m.group(1) if m else 'NO MAIN')"
```

Record the actual date block in the test (Bitrix usually renders the date as text at the top of the detail block — take the exact selector/regex from the HTML you see; the test below has a `DATE_ASSERT` placeholder to fill with the real value from the fixture).

- [ ] **Step 2: Tests (failing)**

`migration/test/extract.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractPage } from '../lib/extract.js';

const load = (f) => new Uint8Array(readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const CT = 'text/html; charset=windows-1251';

describe('extractPage: content page (about)', () => {
  const page = extractPage(load('about.cp1251.html'),
    { key: '/content/about_naan/', path: '/content/about_naan/', contentType: CT, fetchUrl: 'http://naas.gov.ua/content/about_naan/' },
    { type: 'page' });
  it('exact title and h1', () => {
    expect(page.title).toBe('Про НААН');
    expect(page.h1).toBe('Про НААН');
  });
  it('empty meta description → null', () => expect(page.metaDescription).toBe(null));
  it('bodyHtml: no scripts, no first h1, has text', () => {
    expect(page.bodyHtml).not.toMatch(/<script/i);
    expect(page.bodyHtml).not.toMatch(/<h1/i);
    expect(page.bodyHtml.length).toBeGreaterThan(500);
  });
  it('href/src are not rewritten (stay relative)', () => {
    expect(page.bodyHtml).not.toMatch(/https?:\/\/naas\.gov\.ua\/upload/);
  });
});

describe('extractPage: news article', () => {
  const page = extractPage(load('news-article.cp1251.html'),
    { key: '/newsall/newsnaan/8984/', path: '/newsall/newsnaan/8984/', contentType: CT, fetchUrl: 'http://naas.gov.ua/newsall/newsnaan/8984/' },
    { type: 'news-article', feed: 'newsnaan', id: 8984 });
  it('has title, h1, body', () => {
    expect(page.title.length).toBeGreaterThan(5);
    expect(page.h1.length).toBeGreaterThan(5);
    expect(page.bodyHtml.length).toBeGreaterThan(200);
  });
  it('news date is recognized (DATE_ASSERT: fill in the exact date from the fixture)', () => {
    expect(page.dateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('images from the body land in images[]', () => {
    for (const src of page.images) expect(src).toMatch(/^\//);
  });
});
```

- [ ] **Step 3: Tests fail**

Run: `npx vitest run test/extract.test.js` → FAIL (`Cannot find module '../lib/extract.js'`).

- [ ] **Step 4: Implementation**

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

  // cleanup: scripts/styles/forms/event handlers
  $main.find('script, style, noscript, form, iframe[src*="bitrix"]').remove();
  $main.find('*').each((_, el) => {
    for (const name of Object.keys(el.attribs ?? {})) {
      if (/^on/i.test(name)) $(el).removeAttr(name);
      if (name === 'href' && /^\s*javascript:/i.test(el.attribs[name])) $(el).removeAttr('href');
    }
  });

  const h1 = $main.find('h1').first().text().trim();
  $main.find('h1').first().remove();

  // date (news only): look in the first text nodes of main
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

- [ ] **Step 5: Tests green; DATE_ASSERT filled in**

Run: `npx vitest run test/extract.test.js` → PASS. If the news date does not parse — inspect the real format in the fixture (Step 1) and extend `parseUkrDate` for it (add the matching regex + a dedicated unit test for that format). Complete the `DATE_ASSERT` test with the exact value (e.g. `expect(page.dateISO).toBe('2026-06-24')`).

- [ ] **Step 6: Commit + push**

```bash
git add migration/lib/extract.js migration/test/extract.test.js migration/test/fixtures
git commit -m "migration: legacy page extractor (title/h1/date/body sanitize) on real cp1251 fixtures"
git push
```

---

### Task 6: CLI runners + the FULL live crawl and extraction

**Files:**
- Create: `migration/bin/crawl-live.js`, `migration/bin/extract-all.js`, `migration/bin/report.js`
- Output: `migration/out/inventory.jsonl`, `migration/out/url-map.json`, `migration/out/assets-manifest.tsv`, `migration/out/reports/crawl-report.md`, `migration/out/content/**` (gitignored), `migration/out/raw/**` (gitignored)

**Interfaces:**
- Consumes: `crawl`, `classify/buildUrlMap`, `extractPage` (Tasks 3–5).
- Produces: files per the "Data schema" — the contract for Tasks 8–12. `index.json`: `{"<key>": {"file":"pages/<sha1>.json","type","title","feed"?,"id"?,"date"?}}`.

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
  console.log('UNCLASSIFIED (first 30):', report.unclassified.slice(0, 30));
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

`bin/report.js` — a markdown report in `out/reports/crawl-report.md`: URL counts by type and status, top-20 largest pages, all `error` URLs, all `unclassified`, asset counts by prefix (`/upload/iblock/`, `/upload/medialibrary/`, `/content/`, other), dropped query params with frequencies (collect from `droppedParams` — add that field to `Rec` during the crawl if it is not recorded yet):

```js
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('../out/', import.meta.url).pathname;
const inv = readFileSync(OUT + 'inventory.jsonl', 'utf8').trim().split('\n').map(JSON.parse);
const map = JSON.parse(readFileSync(OUT + 'url-map.json', 'utf8'));
const assets = readFileSync(OUT + 'assets-manifest.tsv', 'utf8').trim().split('\n');
const by = (arr, f) => arr.reduce((m, x) => (m[f(x)] = (m[f(x)] ?? 0) + 1, m), {});
const lines = [
  '# Crawl report ' + new Date().toISOString().slice(0, 10),
  '## Statuses', JSON.stringify(by(inv, (r) => r.status)),
  '## Types', JSON.stringify(by(Object.values(map), (c) => c.type)),
  '## Assets by prefix', JSON.stringify(by(assets, (l) => l.split('\t')[0].split('/').slice(0, 3).join('/'))),
  '## Errors (status 0)', ...inv.filter((r) => r.status === 0).map((r) => '- ' + r.key),
  '## Unclassified', ...Object.entries(map).filter(([, c]) => c.type === 'unclassified').map(([k]) => '- ' + k),
];
writeFileSync(OUT + 'reports/crawl-report.md', lines.join('\n') + '\n');
console.log('report written');
```

- [ ] **Step 3: Limited trial crawl (smoke against the live site)**

```bash
cd migration && node bin/crawl-live.js 40
```

Expected: ~40 pages in `out/inventory.jsonl`, no crashes, 200s visible in the log, `DONE: 40 pages, N assets` (N > 20). Eyeball 3 records: `head -3 out/inventory.jsonl`.

- [ ] **Step 4: FULL crawl (long — an hour or two, resumable)**

```bash
node bin/crawl-live.js 2>&1 | tee out/reports/crawl-log.txt
```

This is ~thousands of pages at a 500 ms delay. If it gets interrupted — just restart (the state file resumes). Watchdog expectations: the inventory size must plateau; news IDs range up to ~9000.

- [ ] **Step 5: Classification + extraction + report**

```bash
node bin/extract-all.js && node bin/report.js
```

Expected: `unclassified` — zero or isolated URLs. IF there are `unclassified` patterns — extend the rules in `classify.js` (first a test for the new pattern in `test/classify.test.js`, then the rule), re-run `extract-all`. Repeat until 0 unclassified.

- [ ] **Step 6: Completeness sanity check (human checkpoint)**

Compare against the known reference numbers (see Reference):

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

Expectations (order of magnitude): news-articles — hundreds to thousands, max id ≈ 8990+; assets — thousands (the admin probe estimated ~10,900 files in /upload, part of which is not linked from pages — a smaller number in the manifest is NORMAL; unlinked content is not indexed and not migrated). **Show this report to the user and wait for an "ok" before Task 7+** (this is the main volume checkpoint).

- [ ] **Step 7: Commit + push (the inventory goes into git)**

```bash
git add migration/bin migration/out/inventory.jsonl migration/out/url-map.json \
        migration/out/assets-manifest.tsv migration/out/reports
git commit -m "migration: full live crawl inventory + classification + extraction reports"
git push
```

---

### Task 7: Portal skeleton `portal/` (Next.js, standalone, robots off)

**Files:**
- Create: `portal/` (create-next-app), `portal/next.config.ts` (edits), `portal/src/middleware.ts`, `portal/src/app/robots.txt/route.ts`, `portal/vitest.config.ts`, `portal/test/helpers/server.ts`, `portal/test/robots.test.ts`
- Modify: `/.gitignore` (add `portal/.next/`)

**Interfaces:**
- Produces: a Next.js app that builds (`npm run build`) and serves: `/robots.txt` (Disallow when `INDEXING!=on`), the `X-Robots-Tag: noindex, nofollow` header on all responses when `INDEXING!=on`. Env contract (consumed by Tasks 8–13): `INDEXING=on|off` (default off), `SITE_ORIGIN` (e.g. `http://portal.naas.gov.ua`), `LEGACY_CONTENT_DIR` (default `../migration/out/content`).
- Test helper `startPortal(env): Promise<{origin, stop}>` — builds/starts the prod server on a free port (consumed by tests of Tasks 8–11).

- [ ] **Step 1: Bootstrap (or verification of what the architecture track already created)**

**If `portal/` ALREADY exists** (created by the "architecture setup" track — see "Prerequisites"): do NOT recreate it. Skip create-next-app; run only the engines check (command below) and treat Steps 2–5 as VERIFICATION/ADDITION of the existing config (add `trailingSlash`/conditional `standalone`/robots/middleware/vitest if missing; do not touch existing routes). If `portal/` does not exist:

```bash
cd /Users/falco/dev/naas_migration_wt   # this plan's worktree
npx create-next-app@latest portal --ts --app --src-dir --no-tailwind --eslint --import-alias "@/*" --use-npm
node -e "console.log(require('./portal/node_modules/next/package.json').engines)"
```

Expected: engines compatible with Node **20.9+** (the server = 20.20.2). If the latest Next requires Node >20 — install the newest major that supports 20: `cd portal && npm i next@<latest-supporting-node20>` (check engines in the npm registry: `npm view next@15 engines`, `npm view next@16 engines` — pick the newest compatible) and record the choice in `portal/README.md`.

- [ ] **Step 2: Config**

`portal/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,          // the portal's canonical URL form ends with a slash (slash twins → 308)
  // standalone only for the production build (deploy.sh sets STANDALONE=1):
  // locally `next start` does not work with standalone output — tests use a regular build
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

- [ ] **Step 4: vitest + the server test helper**

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
    fileParallelism: false, // suites rebuild the shared .next with different env — sequential only
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

// metadata/canonical are baked in AT BUILD TIME (SSG) → suites with different env pass rebuild:'1'.
// robots.txt is force-dynamic (reads env per request) and needs no rebuild.
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

  it('robots.txt disallows everything', async () => {
    const t = await (await fetch(origin + '/robots.txt')).text();
    expect(t).toContain('Disallow: /');
    expect(t).not.toContain('Sitemap:');
  });
  it('X-Robots-Tag: noindex on pages', async () => {
    const r = await fetch(origin + '/');
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
```

- [ ] **Step 5: Tests green**

Run: `cd portal && npx vitest run test/robots.test.ts` → PASS (the first run builds, ~1–2 min).

- [ ] **Step 6: gitignore + Commit + push**

Add the line `/portal/.next/` to the root `.gitignore`. Then:

```bash
git add portal .gitignore
git commit -m "portal: Next.js skeleton (standalone, trailingSlash) with INDEXING env, robots, X-Robots-Tag"
git push
```

---

### Task 8: Content-store + the catch-all legacy-page route

**Files:**
- Create: `portal/src/lib/content-store.ts`, `portal/src/app/[...slug]/page.tsx`, `portal/src/app/page.tsx` (replaces the default), `portal/src/app/legacy-body.css`, `portal/test/fixtures/content/**` (a small fixture content set), `portal/test/legacy-routes.test.ts`
- Modify: `portal/src/app/layout.tsx`

**Interfaces:**
- Consumes: `migration/out/content/index.json` + `pages/*.json` (Task 6); the `LegacyPage` format.
- Produces (consumed by Tasks 9–11):
  - `contentIndex(): Map<string, IndexEntry>`; `getByKey(key: string): LegacyPage | null`
  - `newsIndex(): Map<string /*feed*/, Map<number /*id*/, string /*key*/>>`
  - `listNews(feed: string, page: number, perPage: number): {items: IndexEntryWithKey[], total: number}` (sorted date desc, then id desc)
  - the `<LegacyArticle page={LegacyPage} />` component — `<h1>` + body via `dangerouslySetInnerHTML`
  - Key rule: the path is decoded; pages carry a trailing slash.

- [ ] **Step 1: Fixture content for the tests**

Create `portal/test/fixtures/content/index.json` + `pages/…` by hand (5 records — keys exactly as in the production index):

```json
{
  "/content/statut-naan/": { "file": "pages/statut.json", "type": "page", "title": "Статут НААН" },
  "/content/publichna-informaciya/pasport budget/": { "file": "pages/pasport.json", "type": "page", "title": "Паспорт бюджетної програми" },
  "/newsall/newsnaan/8984/": { "file": "pages/n8984.json", "type": "news-article", "title": "Новина 8984", "feed": "newsnaan", "id": 8984, "date": "2026-06-24" },
  "/newsukraine/?ELEMENT_ID=8959": { "file": "pages/n8959.json", "type": "news-article", "title": "Новина 8959", "feed": "newsukraine", "id": 8959, "date": "2026-06-20" },
  "/": { "file": "pages/home.json", "type": "home", "title": "Національна академія аграрних наук України" }
}
```

Each `pages/*.json` is a valid `LegacyPage` (copy the structure from "Data schema", body like `"<p>Тестовий контент …</p>"`; add `"images": []` and `"h1": "Заголовок новини 8984"` to n8984).

- [ ] **Step 2: Tests (failing)**

`portal/test/legacy-routes.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('1:1 legacy routes', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'off', SITE_ORIGIN: 'http://x.local', rebuild: '1',
  });
  afterAll(() => stop());

  it('plain path: 200, exact <title>, body in the HTML', async () => {
    const r = await fetch(origin + '/content/statut-naan/');
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain('<title>Статут НААН</title>');
    expect(html).toContain('Тестовий контент');
  });
  it('path with a space (browser-encoded) — 200', async () => {
    const r = await fetch(origin + '/content/publichna-informaciya/pasport%20budget/');
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('Паспорт бюджетної програми');
  });
  it('path-based news — 200 + h1', async () => {
    const html = await (await fetch(origin + '/newsall/newsnaan/8984/')).text();
    expect(html).toContain('Заголовок новини 8984');
  });
  it('unknown path — a REAL 404 status', async () => {
    const r = await fetch(origin + '/no/such/page/');
    expect(r.status).toBe(404);
  });
  it('slashless variant → 308 to the canonical', async () => {
    const r = await fetch(origin + '/content/statut-naan', { redirect: 'manual' });
    expect([301, 308]).toContain(r.status);
    expect(r.headers.get('location')).toContain('/content/statut-naan/');
  });
});
```

- [ ] **Step 3: Tests fail**

Run: `npx vitest run test/legacy-routes.test.ts` → FAIL (no routes yet; the default home serves boilerplate).

- [ ] **Step 4: Store implementation**

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

// slash twin: the inventory stores the old site's RAW form (sometimes slashless, e.g.
// "/content/publichna-informaciya/FAO"), while Next with trailingSlash:true always
// normalizes the request to the slashed form → look up both.
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

- [ ] **Step 5: Routes and rendering**

`portal/src/app/legacy-body.css` (minimal typography for the legacy body):

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

export const dynamicParams = false; // the full list is known at build time

// Paths that have their OWN static routes (Task 10) — exclude from the catch-all,
// otherwise Next generates the same path from two routes (build conflict).
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

`portal/src/lib/seo.ts(x)` — a minimal version for this task (the full one lands in Task 11):

```tsx
import type { Metadata } from 'next';
import type { LegacyPage } from '@/lib/content-store';

// The URL form the portal actually serves with a 200: query keys — the exact old
// query form (their path already has the slash); path keys — with a slash (trailingSlash:true).
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
  return { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title }; // extended in Task 11
}
```

`portal/src/app/page.tsx` (home = the migrated old home; temporary, until the design port):

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

`layout.tsx`: import `./legacy-body.css`, set `<html lang="uk">`, remove the create-next-app boilerplate styles (keep a minimal `<body>{children}</body>` with a simple header «НААН — портал (тестовий режим)» and a footer).

- [ ] **Step 6: Tests green**

Run: `npx vitest run test/legacy-routes.test.ts` → PASS. Pay special attention to the space-in-path test. If `generateStaticParams` trips over Cyrillic/space segments — verify that segments are passed DECODED (Next encodes them itself in the route manifest); `legacyKeyFromSlug` decodes both cases.

Build scale: on real content this is thousands of SSG pages. If a full `npm run build` becomes unacceptably long (>30 min), the allowed fallback is `dynamicParams = true` + `generateStaticParams` returning only the top-500 keys — the rest render on first request and get cached (ISR behavior). The 404 semantics survive: `getByKey` returns `null` → `notFound()`; the tests do not change.

- [ ] **Step 7: Commit + push**

```bash
git add portal/src portal/test
git commit -m "portal: content-store + catch-all legacy routes with exact titles and 404s"
git push
```

---

### Task 9: Query-string URLs (`?ELEMENT_ID=`) via rewrites + canonicals

**Files:**
- Create: `portal/src/app/newsukraine/el/[id]/page.tsx` (+ analogous routes for other feeds IF `url-map.json` has query news for those feeds), `portal/test/query-urls.test.ts`
- Modify: `portal/next.config.ts` (rewrites), `portal/src/lib/seo.ts` (query-form canonical)

**Interfaces:**
- Consumes: `newsIndex()`, `getByKey` (Task 8); `url-map.json` (Task 6) — WHICH feeds have the query form, check there: `python3 -c "import json; m=json.load(open('../migration/out/url-map.json')); print(sorted({v['feed'] for v in m.values() if v.get('viaQuery')}))"`.
- Produces: a URL like `/newsukraine/?ELEMENT_ID=8959` returns 200 with the article content; `<link rel="canonical">` (when INDEXING=on) points to the **exact query form** — both on the external query URL and on the internal `/newsukraine/el/8959/`.

- [ ] **Step 1: Tests (failing)**

`portal/test/query-urls.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('query-string legacy URLs', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'on',
    SITE_ORIGIN: 'http://x.local', CANONICAL_ORIGIN: 'http://naas.gov.ua', rebuild: '1',
  });
  afterAll(() => stop());

  it('?ELEMENT_ID= serves the article (via rewrite)', async () => {
    const r = await fetch(origin + '/newsukraine/?ELEMENT_ID=8959');
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('Новина 8959');
  });
  it('canonical = the exact old query form', async () => {
    const html = await (await fetch(origin + '/newsukraine/?ELEMENT_ID=8959')).text();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959');
  });
  it('the internal path /newsukraine/el/8959/ also canonicalizes to the query form', async () => {
    const html = await (await fetch(origin + '/newsukraine/el/8959/')).text();
    expect(html).toContain('http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959');
  });
  it('unknown ELEMENT_ID → 404', async () => {
    const r = await fetch(origin + '/newsukraine/?ELEMENT_ID=999999');
    expect(r.status).toBe(404);
  });
});
```

- [ ] **Step 2: Tests fail**

Run: `npx vitest run test/query-urls.test.ts` → FAIL.

- [ ] **Step 3: Rewrites**

Add to `portal/next.config.ts`:

```ts
async rewrites() {
  return {
    beforeFiles: [
      {
        source: '/newsukraine/',
        has: [{ type: 'query', key: 'ELEMENT_ID', value: '(?<eid>\\d+)' }],
        destination: '/newsukraine/el/:eid/',
      },
      // + one block per feed with viaQuery in url-map.json (see Interfaces)
    ],
  };
},
```

If the named capture in `has.value` does not work on the chosen Next version (the test checks this!) — fallback: make the `/newsukraine/` page dynamic (`export const dynamic = 'force-dynamic'`) and read `searchParams.ELEMENT_ID` right in the listing page, rendering the article instead of the list. The test does not change — it checks behavior, not mechanism.

- [ ] **Step 4: The element page**

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

In `pageMetadata` (seo.ts) the canonical is already built from `page.key` — for query news the `key` is `/newsukraine/?ELEMENT_ID=8959`, so the canonical is automatically "the exact old query form". Verify that this holds and nothing "normalizes" the key.

Unknown ELEMENT_ID: the rewrite lands on `/newsukraine/el/999999/`; with `dynamicParams=false` Next returns 404 by itself.

- [ ] **Step 5: Tests green**

Run: `npx vitest run test/query-urls.test.ts` → PASS. If the canonical does not appear — remember: `alternates.canonical` renders only when set (INDEXING=on in this suite — exactly for that).

- [ ] **Step 6: Commit + push**

```bash
git add portal/src portal/test/query-urls.test.ts
git commit -m "portal: legacy query-string news URLs served via rewrites with exact-form canonicals"
git push
```

---

### Task 10: News feeds + PAGEN_1 pagination

**Files:**
- Create: `portal/src/app/news/page.tsx`, `portal/src/app/news/page/[n]/page.tsx` (+ the same for `newsall`, `newsukraine`, `newsworld`), `portal/src/lib/news-list.tsx`, `portal/test/listings.test.ts`
- Modify: `portal/next.config.ts` (PAGEN_1 rewrite)

**Interfaces:**
- Consumes: `listNews` (Task 8); the real perPage — verify against crawl data: open any `/news/?PAGEN_1=2` from `out/raw/` and count the teasers on the old site's page; record that value in `PER_PAGE`.
- Produces: `/news/` (page 1), `/news/?PAGEN_1=k` → the same article set the old site had on page k (date desc order). Canonical of page k = `/news/?PAGEN_1=k` (k>1), of page 1 = `/news/`.
- Mandatory check: `python3 -c "import json; m=json.load(open('../migration/out/url-map.json')); print(sorted({v['feed'] for v in m.values() if v['type']=='listing'}))"` — if the list contains listing feeds OUTSIDE the four news ones (paginated `/content/...` sections etc.), add an identical "rewrite + pages" pair for each (same template, different FEED/base path) — otherwise those URLs will fail verify-parity (Task 12).

- [ ] **Step 1: Tests (failing)**

`portal/test/listings.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest';
import path from 'node:path';
import { startPortal } from './helpers/server';

const FIXTURES = path.resolve(__dirname, 'fixtures', 'content');

describe('feeds', async () => {
  const { origin, stop } = await startPortal({
    LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'on',
    SITE_ORIGIN: 'http://x.local', CANONICAL_ORIGIN: 'http://naas.gov.ua', rebuild: '1',
  });
  afterAll(() => stop());

  it('/newsall/ is 200 and links to an article', async () => {
    const html = await (await fetch(origin + '/newsall/')).text();
    expect(html).toContain('/newsall/newsnaan/8984/');
  });
  it('/newsall/?PAGEN_1=1 returns 200 (rewrite)', async () => {
    const r = await fetch(origin + '/newsall/?PAGEN_1=1');
    expect(r.status).toBe(200);
  });
  it('an out-of-range empty page → 404', async () => {
    const r = await fetch(origin + '/newsall/?PAGEN_1=99');
    expect(r.status).toBe(404);
  });
});
```

- [ ] **Step 2: Tests fail** — Run: `npx vitest run test/listings.test.ts` → FAIL.

- [ ] **Step 3: Implementation**

`portal/src/lib/news-list.tsx`:

```tsx
import { listNews } from '@/lib/content-store';
import { notFound } from 'next/navigation';

export const PER_PAGE = 20; // VERIFY against a real old-site page (see Interfaces) and fix

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

Article links: for query news `it.key` already contains `?ELEMENT_ID=…` — exactly right (we link to the canonical old form).

`portal/src/app/newsall/page.tsx` (clones for news/newsukraine/newsworld — identical, different FEED):

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

`next.config.ts` — add to `beforeFiles` for EACH feed:

```ts
{
  source: '/newsall/',
  has: [{ type: 'query', key: 'PAGEN_1', value: '(?<p>\\d+)' }],
  destination: '/newsall/page/:p/',
},
```

(Order: PAGEN rules come AFTER the ELEMENT_ID rules of the same feed.) `?PAGEN_1=99` (out of range) → `/newsall/page/99/` → dynamicParams=false → 404 — the test checks this.

- [ ] **Step 4: Tests green** — Run: `npx vitest run test/listings.test.ts` → PASS.

- [ ] **Step 5: Verify PER_PAGE against reality**

```bash
python3 - <<'EOF'
import re, json, hashlib
# count teasers on the saved /newsall/ page (see rawFile in inventory.jsonl)
inv = [json.loads(l) for l in open('../migration/out/inventory.jsonl')]
page = next(r for r in inv if r['key'] == '/newsall/')
raw = open('../migration/out/' + page['rawFile'], 'rb').read().decode('cp1251', 'replace')
print('news links on the page:', len(set(re.findall(r'/newsall/newsnaan/(\d+)/', raw))))
EOF
```

Fix `PER_PAGE` to that number if ≠20. This keeps "page k on the old site == page k on the new one".

- [ ] **Step 6: Commit + push**

```bash
git add portal/src portal/test/listings.test.ts portal/next.config.ts
git commit -m "portal: news feeds with Bitrix-compatible PAGEN_1 pagination and canonicals"
git push
```

---

### Task 11: sitemap.xml + full JSON-LD

**Files:**
- Create: `portal/src/app/sitemap.xml/route.ts`, `portal/test/seo.test.ts`
- Modify: `portal/src/lib/seo.ts` (full JSON-LD builders), `portal/src/app/layout.tsx` (Organization JSON-LD)

**Interfaces:**
- Consumes: `contentIndex()` (Task 8), the env contract (Task 7).
- Produces: `/sitemap.xml` — valid XML of all canonical migrated URLs (`loc` = `CANONICAL_ORIGIN`+key, including query URLs; `lastmod` = date when present) when INDEXING=on; **404 when off**. JSON-LD: `GovernmentOrganization` in the layout; `NewsArticle` (headline/datePublished/image/mainEntityOfPage/inLanguage uk) for news; `WebPage` + `BreadcrumbList` (from path segments) for pages.

- [ ] **Step 1: Tests (failing)**

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

  it('sitemap contains plain and query URLs', async () => {
    const xml = await (await fetch(origin + '/sitemap.xml')).text();
    expect(xml).toContain('<loc>http://naas.gov.ua/content/statut-naan/</loc>');
    expect(xml).toContain('<loc>http://naas.gov.ua/newsukraine/?ELEMENT_ID=8959</loc>'.replace('&', '&amp;'));
    expect(xml).toContain('<lastmod>2026-06-24</lastmod>');
  });
  it('a news page carries NewsArticle JSON-LD', async () => {
    const html = await (await fetch(origin + '/newsall/newsnaan/8984/')).text();
    const m = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/gs)!;
    const blobs = m.map((s) => JSON.parse(s.replace(/<\/?script[^>]*>/g, '')));
    const art = blobs.find((b) => b['@type'] === 'NewsArticle');
    expect(art).toBeTruthy();
    expect(art.datePublished).toBe('2026-06-24');
    expect(art.headline.length).toBeGreaterThan(3);
  });
  it('the layout carries GovernmentOrganization', async () => {
    const html = await (await fetch(origin + '/')).text();
    expect(html).toContain('"GovernmentOrganization"');
  });
});

describe('sitemap disabled on staging', async () => {
  const { origin, stop } = await startPortal({ LEGACY_CONTENT_DIR: FIXTURES, INDEXING: 'off', rebuild: '1' });
  afterAll(() => stop());
  it('404 when INDEXING=off', async () => {
    expect((await fetch(origin + '/sitemap.xml')).status).toBe(404);
  });
});
```

- [ ] **Step 2: Tests fail** — Run: `npx vitest run test/seo.test.ts` → FAIL.

- [ ] **Step 3: Implementation**

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

(Volume < 50,000 URLs and < 50 MB — a single file; if the Task 6 report shows more — split into a sitemap index + chunks of 40,000 via an analogous `sitemap-<n>.xml` route handler.)

`portal/src/lib/seo.ts` — extend:

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

In `layout.tsx` — `<JsonLd data={organizationLd()} />` inside `<body>`.

- [ ] **Step 4: Tests green** — Run: `npx vitest run test/seo.test.ts` → PASS.

- [ ] **Step 5: Full portal test run**

Run: `cd portal && npm test` (all suites) → PASS.

- [ ] **Step 6: Commit + push**

```bash
git add portal/src portal/test/seo.test.ts
git commit -m "portal: sitemap.xml (canonical keys incl. query URLs) + NewsArticle/WebPage/Org JSON-LD"
git push
```

---

### Task 12: Parity verifier + a full local run

**Files:**
- Create: `migration/bin/verify-parity.js`, `migration/lib/parity.js`, `migration/test/parity.test.js`
- Output: `migration/out/reports/parity-report.tsv`, `migration/out/reports/parity-summary.md`

**Interfaces:**
- Consumes: `inventory.jsonl`, `url-map.json`, `content/` (Task 6); a running portal (`--base http://127.0.0.1:3000`).
- Produces: `checkParity(rec, cls, page, res, htmlText) → {ok, fails: string[]}`; CLI `node bin/verify-parity.js --base <origin> [--live] [--sample N]`. Exit code 1 when there are failures. Checks by type:
  - `page|news-article|home`: new status 200; the NEW `<title>` == the OLD `rec.title` (exact, after whitespace collapsing); the extracted `bodyHtml` text is contained in the new HTML (normalized; word-level Jaccard ≥ 0.9); every `images[]` entry returns 200 on the new origin (HEAD).
  - `gone`: new status 404. `redirect`: 301/308 and Location == `cls.to`.
  - `listing`: status 200 (content equivalence of listings is not required — the item set is guaranteed by the store).
  - `--live`: additionally re-fetch the old URL and compare its FRESH title with `rec.title` (content drift since the crawl).

- [ ] **Step 1: Tests (failing)**

`migration/test/parity.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { normText, jaccardWords, checkParity } from '../lib/parity.js';

describe('normText/jaccard', () => {
  it('normalizes tags and whitespace', () => {
    expect(normText('<p>Привіт  <b>світ</b>!</p>')).toBe('привіт світ!');
  });
  it('jaccard is 1.0 on identical input, <1 on different', () => {
    expect(jaccardWords('а б в г', 'а б в г')).toBe(1);
    expect(jaccardWords('а б в г', 'а б х у')).toBeLessThan(0.6);
  });
});

describe('checkParity', () => {
  const rec = { key: '/content/x/', title: 'Сторінка X', status: 200 };
  const page = { bodyHtml: '<p>Це тіло сторінки X з фактами.</p>', images: [] };
  it('ok when the title matches and the body is contained', () => {
    const html = '<html><head><title>Сторінка X</title></head><body><main>Це тіло сторінки X з фактами.</main></body></html>';
    expect(checkParity(rec, { type: 'page' }, page, { status: 200 }, html).ok).toBe(true);
  });
  it('fails on a different title', () => {
    const html = '<html><head><title>Інша</title></head><body>Це тіло сторінки X з фактами.</body></html>';
    const r = checkParity(rec, { type: 'page' }, page, { status: 200 }, html);
    expect(r.ok).toBe(false);
    expect(r.fails.join()).toContain('title');
  });
  it('gone must be 404', () => {
    expect(checkParity({ key: '/dead/' }, { type: 'gone' }, null, { status: 404 }, '').ok).toBe(true);
    expect(checkParity({ key: '/dead/' }, { type: 'gone' }, null, { status: 200 }, '').ok).toBe(false);
  });
});
```

- [ ] **Step 2: Tests fail** — Run: `npx vitest run test/parity.test.js` → FAIL.

- [ ] **Step 3: Implementation**

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
        const sim = jaccardWords(body, full); // the body is a subset of the full page; chrome depresses Jaccard
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
    // the portal's trailingSlash normalization (slash twin → canonical form) — follow the redirect once
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
// asset check: every image referenced by the content
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

- [ ] **Step 4: Tests green** — Run: `npx vitest run test/parity.test.js` → PASS.

- [ ] **Step 5: Full local run (real content)**

```bash
cd portal && npm run build && npx next start -p 3000 &   # with the default LEGACY_CONTENT_DIR
cd ../migration && node bin/verify-parity.js --base http://127.0.0.1:3000 2>&1 | tail -5
```

Expected: `failures: 0` for pages. Image failures are NORMAL locally (assets are not copied yet — they appear on the server in Task 13): count them and make sure ALL failures are of type `asset`, none page-level. If there are page-level failures — investigate each one (either an extraction gap or an unnoticed URL pattern), fix the corresponding task's component, repeat. **Show `parity-summary.md` to the user.**

- [ ] **Step 6: Commit + push**

```bash
git add migration/lib/parity.js migration/bin/verify-parity.js migration/test/parity.test.js migration/out/reports
git commit -m "migration: parity verifier (status/title/body/images vs old site) + local full run report"
git push
```

---

### Task 13: Deploy to the non-indexed subdomain (SSH gates!)

**Files:**
- Create: `migration/bin/copy-assets.sh` (runs ON THE SERVER), `portal/deploy/deploy.sh`, `portal/deploy/systemd-request.txt`, `portal/deploy/env.production.example`

**Interfaces:**
- Consumes: the portal's standalone build (Tasks 7–11), `migration/out/content` (Task 6), `assets-manifest.tsv` (Task 6).
- Produces: a live portal at `http(s)://<subdomain>.naas.gov.ua` with `X-Robots-Tag: noindex`; assets copied on the server; a systemd request for Mirohost.

**GATES (before each one — explicitly ask the user):** (G1) first SSH inspection; (G2) rsync upload; (G3) running copy-assets on the server; (G4) subdomain name choice + panel actions; (G5) sending the systemd request to support.

**If the "architecture setup" track already created the systemd service / nginx proxy / subdomain** — G4/G5 become VERIFICATION rather than creation: check that the proxy points to the portal's port, the service is active (`systemctl status`), the env file carries this plan's contract (`INDEXING=off` on staging!) — then continue from Step 8.

- [ ] **Step 1: Deploy artifacts**

`portal/deploy/env.production.example`:

```
INDEXING=off
SITE_ORIGIN=http://portal.naas.gov.ua
# CANONICAL_ORIGIN is set ONLY at the main-domain switch (see the runbook)
LEGACY_CONTENT_DIR=/var/www/naasZ4/portal-app/content
PORT=3300
HOSTNAME=127.0.0.1
```

`portal/deploy/deploy.sh`:

```bash
#!/usr/bin/env bash
# Upload the portal to the Mirohost eVPS. ASK the user before running (SSH gate G2).
set -euo pipefail
source ~/.naas_hosting.env
DEST="${NAAS_SSH_USER}@${NAAS_HOST}"
P="${NAAS_SSH_PORT:-22}"
APP=/var/www/naasZ4/portal-app

cd "$(dirname "$0")/.."
STANDALONE=1 npm run build
# standalone: server.js + minimal node_modules; static and public are added alongside
rsync -az -e "ssh -p $P" .next/standalone/ "$DEST:$APP/app/"
rsync -az -e "ssh -p $P" .next/static/ "$DEST:$APP/app/.next/static/"
rsync -az -e "ssh -p $P" public/ "$DEST:$APP/app/public/"
rsync -az -e "ssh -p $P" ../migration/out/content/ "$DEST:$APP/content/"
rsync -az -e "ssh -p $P" ../migration/out/assets-manifest.tsv ../migration/bin/copy-assets.sh "$DEST:$APP/"
echo "uploaded to $APP"
```

`migration/bin/copy-assets.sh` (goes to the server; reads the manifest, copies files from the old docroot into the portal's `public/` — NO renames):

```bash
#!/usr/bin/env bash
# RUNS ON THE SERVER. Read-only towards the old site: only cp FROM it.
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
echo "copied=$copied missing=$missing (see copy-assets-missing.log)"
```

`portal/deploy/systemd-request.txt` (the support-ticket template for Mirohost — filled in with facts from G1; deliberately in Ukrainian, it is a message to Ukrainian-speaking support, not documentation):

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

- [ ] **Step 2 (G1): SSH inspection** — ASK THE USER, then:

```bash
source ~/.naas_hosting.env
ssh -p "${NAAS_SSH_PORT:-22}" "${NAAS_SSH_USER}@${NAAS_HOST}" '
  echo "--- HOME:"; ls ~ | head -30
  echo "--- old-site docroot (looking for bitrix + upload):";
  for d in ~ ~/www ~/naas.gov.ua ~/httpdocs; do [ -d "$d/bitrix" ] && echo "DOCROOT=$d"; done
  echo "--- listening ports:"; (command -v ss >/dev/null && ss -ltn | awk "{print \$4}" | grep -oE "[0-9]+$" | sort -n | uniq | tail -20) || netstat -ltn 2>/dev/null | tail -20
  echo "--- disk/quota:"; df -h ~ | tail -1; quota -s 2>/dev/null || true
  echo "--- does this server serve the live naas.gov.ua:";
  curl -s -o /dev/null -w "local-vhost:%{http_code}\n" -H "Host: naas.gov.ua" http://127.0.0.1/ || true
  echo "--- server IP vs DNS:"; hostname -I 2>/dev/null; getent hosts naas.gov.ua || true
'
```

Record: `OLD_DOCROOT` (the directory containing `bitrix/` and `upload/`), a free port (3300 or another), and the CONCLUSION: whether the live site runs on this server. **If local-vhost ≠ 200 or the IPs do not match** — assets can NOT be taken with a local cp; replace Step 4 with server-side mirroring (on the server: `while read path …; do curl -s --create-dirs -o "$PUB$path" "http://naas.gov.ua$path"; sleep 0.2; done < assets-manifest.tsv` — the same script contract: a byte-for-byte copy into `public/`).

- [ ] **Step 3 (G2): Upload** — ASK, then `bash portal/deploy/deploy.sh`. Expected: `uploaded to /var/www/naasZ4/portal-app`. Right after, ship the env: copy `env.production.example` → to the server as `portal-app/env.production` (fixing SITE_ORIGIN to the chosen subdomain and PORT to the chosen port).

- [ ] **Step 4 (G3): Assets on the server** — ASK, then:

```bash
ssh -p "${NAAS_SSH_PORT:-22}" "${NAAS_SSH_USER}@${NAAS_HOST}" '
  cd /var/www/naasZ4/portal-app &&
  chmod +x copy-assets.sh &&
  ./copy-assets.sh <OLD_DOCROOT from G1> /var/www/naasZ4/portal-app/app/public 2>&1 | tail -3
'
```

Expected: `copied=<thousands> missing=<few>`. Review `copy-assets-missing.log` (first 20): normal misses are files that were already 404 on the old site.

- [ ] **Step 5: Trial start on the server (no systemd, temporary)** — in the same SSH session:

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

Expected: three `…:200` and `X-Robots-Tag: noindex, nofollow`. (Remember: without systemd the process dies after a reboot — temporary until G5.)

- [ ] **Step 6 (G4): Subdomain + nginx proxy in the panel** — ASK the user: **which subdomain name?** (proposal: `portal.naas.gov.ua`; `new.naas.gov.ua` is taken by the showcase plan). Then the user (or the agent via claude-in-chrome, read-only navigation with the user clicking "create") in `control.mirohost.net`, package H-74503: create the subdomain + enable "Nginx → proxy requests to a specific service" to `127.0.0.1:<port>`. Afterwards:

```bash
curl -sI --max-time 20 http://portal.naas.gov.ua/ | head -5
curl -s -o /dev/null -w "%{http_code}\n" "http://portal.naas.gov.ua/newsukraine/?ELEMENT_ID=8959"
curl -s http://portal.naas.gov.ua/robots.txt
```

Expected: 200 + `X-Robots-Tag: noindex, nofollow`; 200 on the query URL; robots `Disallow: /`. If the panel offers SSL for the subdomain (Let's Encrypt) — enable it and verify https; if not — http is enough for staging (noindex is in place anyway).

- [ ] **Step 7 (G5): systemd request** — show the user `portal/deploy/systemd-request.txt` (with the actual port/paths); the user sends it to Mirohost support. After support replies: `systemctl status naas-portal` (over ssh) → active; kill the nohup process from Step 5 (`pkill -f "node server.js"` ONLY our own process — check `pgrep -af "portal-app"` before killing).

- [ ] **Step 8: Full parity against staging**

```bash
cd migration && node bin/verify-parity.js --base http://portal.naas.gov.ua --live 2>&1 | tail -5
```

Expected: `failures: 0` (now including images!). DRIFT rows (content changed on the old site since the crawl) are a signal to repeat Task 6 Steps 4–5 (delta re-crawl: the state file picks up what is new) and redeploy the content (Step 3 of this task). Commit the report:

```bash
git add migration/out/reports && git commit -m "migration: staging parity report (0 failures)" && git push
```

---

### Task 14: Domain-swap runbook (a document; NOT executed)

**Files:**
- Create: `docs/runbooks/naas-domain-swap.md`

**Interfaces:**
- Consumes: everything above. THIS runbook is executed in a future session on a separate user command.

- [ ] **Step 1: Write the runbook** — `docs/runbooks/naas-domain-swap.md` with these sections (every item is a concrete command or panel action, no "etc."):

```markdown
# Runbook: switching naas.gov.ua to the new portal

## Preconditions (all must hold)
- [ ] Parity: verify-parity --live against staging = 0 failures (report fresh, ≤ 3 days old)
- [ ] Stakeholders confirmed the launch in writing
- [ ] Google Search Console access for naas.gov.ua EXISTS (if not — set it up IN ADVANCE, verify via DNS TXT in the Mirohost panel)
- [ ] The naas-portal systemd service has been active ≥ 1 week without crashes (status + uptime)
- [ ] The SSL certificate for the naas.gov.ua apex is READY (Mirohost panel / support ticket; the old site had a broken self-signed one — this must be fixed BEFORE the swap)

## Freeze and the final delta (day X-1)
- [ ] Announce a content freeze on the old site (agreement with the editors)
- [ ] cd migration && node bin/crawl-live.js   # the state file fetches only what is new
- [ ] node bin/extract-all.js && node bin/report.js
- [ ] local verify (Task 12 Step 5) → 0 page-level failures
- [ ] content deploy: bash portal/deploy/deploy.sh (SSH gate) + copy-assets.sh for new assets
- [ ] node bin/verify-parity.js --base http://portal.naas.gov.ua --live → 0 failures

## The switch (day X; ~15-minute window; every step reversible)
- [ ] Mirohost panel: nginx for host naas.gov.ua (and www.naas.gov.ua) → proxy to 127.0.0.1:<portal port>
      (the old site STAYS on disk and in MySQL — that is the rollback)
- [ ] The portal's env.production: INDEXING=on, SITE_ORIGIN=https://naas.gov.ua, CANONICAL_ORIGIN=https://naas.gov.ua
- [ ] systemctl restart naas-portal (via the access support granted)
- [ ] Enable 301 http→https and www→apex (nginx panel; if the panel cannot — a support ticket IN ADVANCE)
- [ ] Smoke: curl -sI https://naas.gov.ua/ (200, WITHOUT the X-Robots-Tag noindex); /robots.txt (Allow + Sitemap);
      /sitemap.xml (200, valid XML); 5 sampled old URLs (list below) — 200 with the correct title
      - http://naas.gov.ua/content/statut-naan/  → 301 to https → 200
      - https://naas.gov.ua/newsall/newsnaan/8984/
      - https://naas.gov.ua/newsukraine/?ELEMENT_ID=8959
      - https://naas.gov.ua/content/publichna-informaciya/pasport%20budget/
      - https://naas.gov.ua/upload/podani.pdf (asset)
- [ ] The portal's staging subdomain: disable or close it (nginx off / keep noindex) — to avoid duplicates

## Afterwards (day X .. X+14)
- [ ] GSC: add https://naas.gov.ua (URL prefix), submit /sitemap.xml
- [ ] Bing Webmaster: same
- [ ] Daily: GSC Coverage (Indexed/Excluded), portal logs for 404s (grep " 404 " via the SSH gate) — any 404 on a URL from inventory.jsonl = a regression, fix immediately
- [ ] The «НОВИЙ САЙТ НААН» banner on the old home no longer exists (the old home is off) — make sure the showcase new.naas.gov.ua is noindex and does not compete
- [ ] After 14 days: a final parity --live run + a report to the stakeholders

## Rollback (on a critical regression in the first hours)
- [ ] Panel: nginx naas.gov.ua → back to the old Bitrix (PHP) — the old site was never touched, it is alive
- [ ] env: INDEXING=off on the portal, restart
- [ ] Record the cause in docs/runbooks/ (post-mortem), fix, repeat the swap
```

- [ ] **Step 2: Commit + push**

```bash
git add docs/runbooks/naas-domain-swap.md
git commit -m "docs: domain-swap runbook (freeze, final delta, flip, GSC, rollback)"
git push
```

---

## Out of scope for this plan (follow-up plans)

1. **Design port** — porting the chosen design system (Astro prototypes) into the portal's React components; migrated pages get their full look (URLs and content do NOT change — only the wrapper/styles).
2. **Directus + MySQL (architecture Phase 1)** — content moves from JSON into the DB; `content-store.ts` switches from fs reads to an API client (the interface is already isolated).
3. **New sections per the requirements doc** (International/Exhibition/Innovation activity etc.) — new URLs, content supplied by the academy.
4. **A full EN locale** — the old `/en/` is migrated as-is by this plan; a new bilingual UX is separate.
5. Cosmetics: good meta descriptions for top pages — an ADDITION, SEO-safe, but done deliberately and separately.

## Acceptance criteria for the plan as a whole

1. `migration/out/inventory.jsonl` covers everything reachable from the seeds (BFS plateau), 0 unclassified.
2. `verify-parity --base <staging> --live` → **0 failures**: every old 200 URL returns 200 with the same `<title>` and body; every old 404 is a 404; assets return 200.
3. Staging: `X-Robots-Tag: noindex, nofollow` on every response + robots.txt `Disallow: /` + sitemap 404. Switching indexing on is ONE env variable.
4. `INDEXING=on` mode (test-verified): a canonical on every page, a valid sitemap.xml with all canonical URLs (including query forms), JSON-LD of three types.
5. Rendering is fully server-side: all content is present in the raw HTML response (checked by the verify-parity parser without executing JS).
6. The swap runbook exists and is self-contained.
