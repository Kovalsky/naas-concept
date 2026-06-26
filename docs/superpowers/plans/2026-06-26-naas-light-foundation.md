# NAAS Light — Foundation Implementation Plan (Plan 1 of 3+)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a new `site-light/` Astro project that shares the current site's content source, ships the light design-system foundation (self-hosted fonts, tokens, Base layout, Header, Footer), supports the V1/V3 hero variants via a build flag, and deploys to two Cloudflare Pages projects — ending with a working light homepage that renders the real hero + real stats.

**Architecture:** A second Astro static project sibling to `site/`. It imports content from `../site/src/data` (single source of truth — no copy, no drift) via a `@shared` path alias + Vite `fs.allow`. A `HERO` build-time env var selects the hero component; the project builds twice → two `dist` dirs → two Pages projects. The current `site/` is never modified.

**Tech Stack:** Astro ^5.6.1 (static output), Cloudflare Pages via Wrangler ^3.114.1, self-hosted fonts via `@fontsource` (Lora, Inter, JetBrains Mono), plain CSS design tokens (no Tailwind CDN).

## Global Constraints

*(Copied verbatim from spec `docs/superpowers/specs/2026-06-26-naas-light-portal-redesign-design.md`. Every task implicitly includes these.)*

- **Current `site/` is never modified** — read-only source of content.
- **Content is single-source:** consume `../site/src/data/*` (JSON + markdown). No copies.
- **No external CSS/font CDN** (no `fonts.googleapis.com`, no `cdn.tailwindcss.com`) — fonts self-hosted as woff2.
- **No invented content:** all text is real/sourced or a clearly-marked placeholder. Hero copy is verbatim old-site text (below).
- **Hero text (verbatim, source `naas.gov.ua` `region-banner`/`.slogan`):** H1 = «Національна академія аграрних наук України»; slogan = «Науково-методичний і координаційний центр з наукових проблем розвитку АПК України».
- **TZ block names** are used exactly; only their arrangement is free.
- **Palette:** navy `#1E3A5F`, navy-deep `#0E1F35`, gold `#B8860B`; ink `#0A0A0A`/`#525252`/`#8a8a8a`; line `#E6E5E1`; canvas `#FFFFFF`; muted `#F8F8F5`.
- **Type:** Lora (display serif, headings weight 500), Inter (body), JetBrains Mono (labels/dates/stats).
- **Real data facts:** founded 1931; 6 відділень; **50 установ**; EDRPOU 00024360; address «01010, Київ, вул. Михайла Омеляновича-Павленка, 9».
- **A11y AA / PageSpeed ≥ 90** are project targets (verified deeply in a later plan; don't regress here).
- **Deploy targets:** `naas-portal-light-v1` (typographic hero), `naas-portal-light-v3` (photo-slider hero).

## File Structure

```
.gitignore                         # NEW (repo root) — ignore node_modules, dist*, .superpowers, .DS_Store
site-light/
├── package.json                   # scripts: dev, build:v1/v3, deploy:v1/v3
├── astro.config.mjs               # reads HERO + OUT_DIR env; vite alias @shared + fs.allow
├── tsconfig.json                  # @shared path alias
├── src/
│   ├── config.ts                  # HERO variant resolver
│   ├── content.config.ts          # collections glob ../site/src/data
│   ├── lib/
│   │   ├── data.ts                # typed re-export of shared JSON via @shared
│   │   └── site.ts                # routes/nav (re-export from shared site.ts)
│   ├── styles/
│   │   └── tokens.css             # design tokens + base element styles + @fontsource imports
│   ├── layouts/
│   │   └── Base.astro             # html shell, fonts, skip-link, header/footer slots
│   ├── components/
│   │   ├── Header.astro           # util slogan strip + emblem + nav + search + lang
│   │   ├── Footer.astro           # real contacts + columns
│   │   ├── HeroTypographic.astro  # V1 hero
│   │   ├── HeroSlider.astro       # V3 hero
│   │   └── Hero.astro             # picks V1/V3 from config
│   └── pages/
│       └── index.astro            # Base + Hero + Stats (proves pipeline)
└── public/
    ├── naas-emblem.png            # copied from site/public
    ├── img -> ../../site/public/img   # symlink (shared news/section images)
    └── docs -> ../../site/public/docs # symlink (shared PDFs)
```

---

### Task 1: Repo `.gitignore` + scaffold empty `site-light` Astro project

**Files:**
- Create: `.gitignore` (repo root)
- Create: `site-light/package.json`
- Create: `site-light/astro.config.mjs`
- Create: `site-light/tsconfig.json`
- Create: `site-light/src/pages/index.astro` (temporary hello page)

- [ ] **Step 1: Create repo-root `.gitignore`**

```gitignore
# dependencies / build
node_modules/
dist/
dist-v1/
dist-v3/
.astro/
.wrangler/

# tooling / os
.superpowers/
.DS_Store
*.log
```

- [ ] **Step 2: Create `site-light/package.json`**

```json
{
  "name": "naas-portal-light",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "build:v1": "HERO=v1 OUT_DIR=dist-v1 astro build",
    "build:v3": "HERO=v3 OUT_DIR=dist-v3 astro build",
    "preview": "astro preview",
    "deploy:v1": "npm run build:v1 && wrangler pages deploy dist-v1 --project-name naas-portal-light-v1",
    "deploy:v3": "npm run build:v3 && wrangler pages deploy dist-v3 --project-name naas-portal-light-v3"
  },
  "dependencies": {
    "astro": "^5.6.1",
    "@fontsource/lora": "^5.0.0",
    "@fontsource/inter": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0"
  },
  "devDependencies": {
    "wrangler": "^3.114.1"
  }
}
```

- [ ] **Step 3: Create `site-light/astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const HERO = process.env.HERO || 'v1';
const OUT_DIR = process.env.OUT_DIR || 'dist';

export default defineConfig({
  site: 'https://naas-portal-light-v1.pages.dev',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  outDir: `./${OUT_DIR}`,
  vite: {
    define: { 'import.meta.env.HERO': JSON.stringify(HERO) },
    resolve: {
      alias: { '@shared': fileURLToPath(new URL('../site/src', import.meta.url)) },
    },
    server: { fs: { allow: ['..'] } },
  },
});
```

- [ ] **Step 4: Create `site-light/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "dist-v1", "dist-v3"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@shared/*": ["../site/src/*"] }
  }
}
```

- [ ] **Step 5: Create temporary `site-light/src/pages/index.astro`**

```astro
---
---
<html lang="uk"><head><meta charset="utf-8" /><title>NAAS Light</title></head>
<body><h1>NAAS Light — scaffold OK</h1></body></html>
```

- [ ] **Step 6: Install and build**

Run: `cd site-light && npm install && npm run build`
Expected: install succeeds; build prints `Complete!` and writes `site-light/dist/index.html`.

- [ ] **Step 7: Verify the current site is untouched**

Run: `git status --porcelain site/`
Expected: **no output** (no changes under `site/`).

- [ ] **Step 8: Commit**

```bash
git add .gitignore site-light/package.json site-light/astro.config.mjs site-light/tsconfig.json site-light/src/pages/index.astro site-light/package-lock.json
git commit -m "chore(site-light): scaffold Astro project + repo gitignore"
```

---

### Task 2: Wire shared content (single source of truth)

**Files:**
- Create: `site-light/src/content.config.ts`
- Create: `site-light/src/lib/data.ts`
- Create: `site-light/src/lib/site.ts`
- Modify: `site-light/src/pages/index.astro` (assert shared data reads)

**Interfaces:**
- Produces: `data.ts` exports `divisions: Division[]`, `divisionCount: number`, `instituteCount: number`, `persons: Person[]`, `anonsy: Anons[]`, `contacts: Contacts`. `site.ts` re-exports `ROUTES`, `NAV`, `EXTERNAL`, `PARTNERS`, `SEARCH_INDEX`, `SHOWCASE`, `FOOTER` from `@shared/lib/site`.

- [ ] **Step 1: Create `site-light/src/content.config.ts`** (loaders point at shared data; base is relative to the `site-light` project root)

```ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const SHARED = '../site/src/data';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: `${SHARED}/pages` }),
  schema: z.object({}).passthrough().optional(),
});

const news = defineCollection({
  loader: file(`${SHARED}/news.json`, {
    parser: (text) => JSON.parse(text).map((o: Record<string, unknown>) => ({ ...o, id: o.slug })),
  }),
  schema: z.object({
    slug: z.string(), date: z.string(), tag: z.string(),
    title: z.string(), teaser: z.string(), image: z.string(), body: z.string(),
  }),
});

export const collections = { pages, news };
```

- [ ] **Step 2: Create `site-light/src/lib/data.ts`** (typed re-export of shared JSON via `@shared` alias)

```ts
import personsRaw from '@shared/data/persons.json';
import institutesRaw from '@shared/data/institutes.json';
import anonsyRaw from '@shared/data/anonsy.json';
import contactsRaw from '@shared/data/contacts.json';

export interface Institute { nazva: string; kerivnyk: string; web: string; email: string; tel: string; faks: string; adresa: string; }
export interface Division { viddilennia: string; ustanovy: Institute[]; }
export interface Person { name: string; post: string; photo: string; phone: string; bio: string; group: 'leadership' | 'members'; featured: boolean; }
export interface Anons { date: string; title: string; teaser: string; image: string; url: string; }
export interface Contacts { address: string; phone: string; email: string; press_email: string; press_phone: string; edrpou: string; edrpou_label: string; }

export const persons: Person[] = personsRaw as Person[];
export const divisions: Division[] = institutesRaw as Division[];
export const anonsy: Anons[] = (anonsyRaw as Anons[]).filter((a) => a.title && a.title.trim());
export const contacts: Contacts = contactsRaw as Contacts;
export const divisionCount = divisions.length;
export const instituteCount = divisions.reduce((n, d) => n + d.ustanovy.length, 0);
```

- [ ] **Step 3: Create `site-light/src/lib/site.ts`** (re-export shared routes/nav so links stay single-source)

```ts
export { ROUTES, NAV, EXTERNAL, PARTNERS, SEARCH_INDEX, SHOWCASE, FOOTER } from '@shared/lib/site';
```

- [ ] **Step 4: Replace `site-light/src/pages/index.astro` with a data-assertion page**

```astro
---
import { divisionCount, instituteCount } from '../lib/data';
import { getCollection } from 'astro:content';
const news = await getCollection('news');
---
<html lang="uk"><head><meta charset="utf-8" /><title>NAAS Light</title></head>
<body>
  <p id="divs">divisions:{divisionCount}</p>
  <p id="insts">institutes:{instituteCount}</p>
  <p id="news">news:{news.length}</p>
</body></html>
```

- [ ] **Step 5: Build and verify shared data resolves to real counts**

Run: `cd site-light && npm run build && grep -oE "divisions:[0-9]+|institutes:[0-9]+|news:[0-9]+" dist/index.html`
Expected: `divisions:6`, `institutes:50`, `news:9`.

- [ ] **Step 6: Commit**

```bash
git add site-light/src/content.config.ts site-light/src/lib/data.ts site-light/src/lib/site.ts site-light/src/pages/index.astro
git commit -m "feat(site-light): share content source from ../site (single source of truth)"
```

---

### Task 3: Self-hosted fonts + design tokens

**Files:**
- Create: `site-light/src/styles/tokens.css`
- Modify: `site-light/src/pages/index.astro` (import tokens to prove bundling)

**Interfaces:**
- Produces: CSS custom properties `--navy --navy-deep --gold --ink --ink2 --ink3 --line --canvas --muted --serif --sans --mono --wrap --gutter`; utility classes `.wrap .serif .mono .kicker .eyebrow`.

- [ ] **Step 1: Create `site-light/src/styles/tokens.css`** (imports bundle local woff2 — no CDN)

```css
/* Self-hosted fonts (woff2 bundled by Vite — no external CDN) */
@import '@fontsource/lora/400.css';
@import '@fontsource/lora/500.css';
@import '@fontsource/lora/600.css';
@import '@fontsource/inter/300.css';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';

*, *::before, *::after { box-sizing: border-box; }
:root {
  --navy:#1E3A5F; --navy-deep:#0E1F35; --gold:#B8860B;
  --ink:#0A0A0A; --ink2:#525252; --ink3:#8a8a8a;
  --line:#E6E5E1; --canvas:#FFFFFF; --muted:#F8F8F5;
  --serif:'Lora',Georgia,serif;
  --sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;
  --wrap:1280px; --gutter:32px;
}
html { scroll-behavior: smooth; }
body { margin:0; font-family:var(--sans); color:var(--ink); background:var(--canvas); -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
a { color:inherit; text-decoration:none; }
h1,h2,h3,h4,p { margin:0; }
img { max-width:100%; display:block; }
::selection { background:var(--navy); color:#fff; }
.wrap { max-width:var(--wrap); margin:0 auto; padding:0 var(--gutter); }
.serif { font-family:var(--serif); }
.mono { font-family:var(--mono); }
.kicker, .eyebrow { font-family:var(--mono); font-size:10px; font-weight:500; letter-spacing:0.13em; text-transform:uppercase; }
.kicker { color:var(--navy); }
.eyebrow { color:var(--ink3); }
@media (max-width:767px){ :root{ --gutter:18px; } }
@media (prefers-reduced-motion: reduce){ html{ scroll-behavior:auto; } *{ animation-duration:.001ms!important; transition-duration:.001ms!important; } }
```

- [ ] **Step 2: Import tokens in `index.astro` frontmatter** (add the import line at top of the `---` block)

```astro
---
import '../styles/tokens.css';
import { divisionCount, instituteCount } from '../lib/data';
import { getCollection } from 'astro:content';
const news = await getCollection('news');
---
```

- [ ] **Step 3: Build and verify fonts are local, not CDN**

Run: `cd site-light && npm run build && grep -rc "fonts.googleapis.com\|cdn.tailwindcss.com" dist/ || echo "0 CDN refs"`
Expected: `0 CDN refs` (no matches).

- [ ] **Step 4: Verify woff2 are emitted locally**

Run: `find site-light/dist -name "*.woff2" | head`
Expected: at least one `.woff2` path under `dist/_astro/` (or `dist/assets/`).

- [ ] **Step 5: Commit**

```bash
git add site-light/src/styles/tokens.css site-light/src/pages/index.astro
git commit -m "feat(site-light): self-hosted fonts + design tokens"
```

---

### Task 4: Base layout + Header + Footer

**Files:**
- Create: `site-light/public/naas-emblem.png` (copied from `site/public`)
- Create: `site-light/src/layouts/Base.astro`
- Create: `site-light/src/components/Header.astro`
- Create: `site-light/src/components/Footer.astro`

**Interfaces:**
- Consumes: `data.ts` (`contacts`), `site.ts` (`NAV`, `FOOTER`).
- Produces: `Base.astro` default slot wraps page content between Header and Footer; accepts props `{ title: string; description?: string }`.

- [ ] **Step 1: Copy the emblem asset**

Run: `mkdir -p site-light/public && cp site/public/naas-emblem.png site-light/public/naas-emblem.png`
Expected: file exists at `site-light/public/naas-emblem.png`.

- [ ] **Step 2: Create `site-light/src/components/Header.astro`** (utility slogan strip carries the verbatim old-site slogan)

```astro
---
import { NAV } from '../lib/site';
---
<header>
  <div class="util"><div class="wrap util-in">
    <span class="slogan">Науково-методичний і координаційний центр з наукових проблем розвитку АПК України</span>
    <span class="lang">UA · <b>EN</b></span>
  </div></div>
  <div class="bar"><div class="wrap bar-in">
    <a href="/" class="brand">
      <img src="/naas-emblem.png" alt="Емблема НААН" width="40" height="40" />
      <span class="brand-t">НААН<span class="brand-sub">Національна академія аграрних наук України</span></span>
    </a>
    <nav class="nav" aria-label="Головна навігація">
      {NAV.map((n) => <a href={n.href}>{n.label}</a>)}
    </nav>
    <form class="search" role="search"><input type="search" placeholder="Пошук по порталу…" aria-label="Пошук" /></form>
  </div></div>
</header>
<style>
  .util { background:var(--navy-deep); }
  .util-in { display:flex; align-items:center; gap:16px; padding-top:8px; padding-bottom:8px; }
  .slogan { color:#cdd6e2; font-size:11px; }
  .lang { margin-left:auto; color:#9fb0c4; font-size:11px; } .lang b { color:#fff; }
  .bar-in { display:flex; align-items:center; gap:16px; padding-top:14px; padding-bottom:14px; }
  .brand { display:flex; align-items:center; gap:12px; }
  .brand-t { font-family:var(--serif); font-weight:600; font-size:15px; line-height:1.15; }
  .brand-sub { display:block; font-family:var(--sans); font-weight:400; font-size:10px; color:var(--ink3); }
  .nav { display:flex; gap:18px; margin-left:8px; font-size:13px; color:#3a3a3a; }
  .nav a:hover { color:var(--navy); }
  .search { margin-left:auto; }
  .search input { width:180px; height:34px; border:1px solid var(--line); border-radius:7px; padding:0 12px; font-size:12px; }
  .search input:focus-visible { outline:2px solid var(--navy); outline-offset:1px; }
</style>
```

- [ ] **Step 3: Create `site-light/src/components/Footer.astro`** (real contacts)

```astro
---
import { contacts } from '../lib/data';
import { FOOTER } from '../lib/site';
---
<footer class="foot"><div class="wrap foot-in">
  <div>
    <b>Контакти</b>
    <p>{contacts.address}</p>
    <p>{contacts.phone} · <a href={`mailto:${contacts.email}`}>{contacts.email}</a></p>
    <p>{contacts.edrpou_label} {contacts.edrpou}</p>
  </div>
  <div>
    <b>Розділи</b>
    {FOOTER.sections.map((s) => <a href={s.href}>{s.label}</a>)}
  </div>
  <div>
    <b>Документи</b>
    {FOOTER.documents.map((d) => <a href={d.href}>{d.label}</a>)}
  </div>
</div></footer>
<style>
  .foot { background:var(--navy-deep); color:#aab6c6; padding:32px 0; margin-top:0; }
  .foot-in { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:24px; font-size:12px; line-height:1.7; }
  .foot b { color:#fff; font-family:var(--serif); display:block; margin-bottom:8px; }
  .foot a { display:block; color:#aab6c6; } .foot a:hover { color:#fff; }
  @media (max-width:767px){ .foot-in{ grid-template-columns:1fr; } }
</style>
```

- [ ] **Step 4: Create `site-light/src/layouts/Base.astro`**

```astro
---
import '../styles/tokens.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
interface Props { title: string; description?: string; }
const { title, description = 'Національна академія аграрних наук України — офіційний портал.' } = Astro.props;
const fullTitle = title === 'НААН' ? title : `${title} — НААН`;
---
<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="/naas-emblem.png" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <a href="#main" class="skip-link">Перейти до основного вмісту</a>
    <Header />
    <main id="main"><slot /></main>
    <Footer />
    <style is:global>
      .skip-link { position:absolute; left:-9999px; top:0; z-index:120; background:var(--navy); color:#fff; padding:12px 16px; border-radius:4px; }
      .skip-link:focus { left:8px; top:8px; }
    </style>
  </body>
</html>
```

- [ ] **Step 5: Temporarily render Base from index to verify** (replace `index.astro`)

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="НААН"><p class="wrap">Контент головної.</p></Base>
```

- [ ] **Step 6: Build and verify header slogan + real contacts render**

Run: `cd site-light && npm run build && grep -c "Науково-методичний і координаційний центр з наукових проблем розвитку АПК України" dist/index.html && grep -c "00024360" dist/index.html`
Expected: each grep prints `1` or more.

- [ ] **Step 7: Commit**

```bash
git add site-light/public/naas-emblem.png site-light/src/layouts/Base.astro site-light/src/components/Header.astro site-light/src/components/Footer.astro site-light/src/pages/index.astro
git commit -m "feat(site-light): Base layout, Header (verbatim slogan), Footer (real contacts)"
```

---

### Task 5: Hero variant mechanism (V1 typographic / V3 slider)

**Files:**
- Create: `site-light/src/config.ts`
- Create: `site-light/src/components/HeroTypographic.astro`
- Create: `site-light/src/components/HeroSlider.astro`
- Create: `site-light/src/components/Hero.astro`

**Interfaces:**
- Consumes: `import.meta.env.HERO` (`'v1'` | `'v3'`, default `'v1'`).
- Produces: `Hero.astro` renders `HeroTypographic` when variant is `v1`, else `HeroSlider`. Both render the verbatim H1 + slogan.

- [ ] **Step 1: Create `site-light/src/config.ts`**

```ts
export type HeroVariant = 'v1' | 'v3';
export const HERO: HeroVariant = (import.meta.env.HERO === 'v3' ? 'v3' : 'v1');
export const HERO_H1 = 'Національна академія аграрних наук України';
export const HERO_SLOGAN = 'Науково-методичний і координаційний центр з наукових проблем розвитку АПК України';
```

- [ ] **Step 2: Create `site-light/src/components/HeroTypographic.astro`** (V1 — calm, no photo, wheat-contour line)

```astro
---
import { HERO_H1, HERO_SLOGAN } from '../config';
---
<section class="hero"><div class="wrap hero-in">
  <div class="kicker">Заснована 1931 · National Academy of Agrarian Sciences of Ukraine</div>
  <h1 class="serif">{HERO_H1}</h1>
  <p class="slogan">{HERO_SLOGAN}</p>
  <span class="gold-rule" aria-hidden="true"></span>
  <svg class="contour" viewBox="0 0 1280 220" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke="#1E3A5F" stroke-width="2"><path d="M0 200 Q640 150 1280 190"/><path d="M0 175 Q640 120 1280 160"/><path d="M0 150 Q640 95 1280 135"/></g>
    <path d="M0 188 Q640 140 1280 180" fill="none" stroke="#B8860B" stroke-width="2"/>
  </svg>
</div></section>
<style>
  .hero { position:relative; overflow:hidden; background:linear-gradient(180deg,#fff,var(--muted)); border-bottom:1px solid var(--line); }
  .hero-in { position:relative; padding:60px 0 52px; }
  .hero h1 { font-family:var(--serif); font-weight:500; font-size:clamp(30px,4vw,44px); line-height:1.08; letter-spacing:-0.02em; max-width:18ch; }
  .hero .slogan { font-size:16px; line-height:1.6; color:var(--ink2); margin-top:16px; max-width:60ch; }
  .gold-rule { display:block; width:48px; height:2px; background:var(--gold); margin-top:22px; }
  .contour { position:absolute; left:0; bottom:0; width:100%; height:160px; opacity:.07; pointer-events:none; }
</style>
```

- [ ] **Step 3: Create `site-light/src/components/HeroSlider.astro`** (V3 — full-width photo, navy wash, slide dots; image is decorative stock, alt empty)

```astro
---
import { HERO_H1, HERO_SLOGAN } from '../config';
---
<section class="hero" aria-label="Головний банер">
  <div class="hero-bg" role="img" aria-label="Пшеничне поле України"></div>
  <div class="wrap hero-in">
    <div class="kicker gold">Заснована 1931 · National Academy of Agrarian Sciences of Ukraine</div>
    <h1 class="serif">{HERO_H1}</h1>
    <p class="slogan">{HERO_SLOGAN}</p>
  </div>
  <div class="dots wrap" aria-hidden="true"><span class="on"></span><span></span><span></span></div>
</section>
<style>
  .hero { position:relative; background:var(--navy-deep); }
  .hero-bg { position:absolute; inset:0; background-image:linear-gradient(115deg,rgba(14,31,53,.82),rgba(14,31,53,.42)),url('/img/hero/wheat-field.jpg'); background-size:cover; background-position:center 40%; }
  .hero-in { position:relative; padding:88px 0 64px; max-width:760px; }
  .hero .kicker.gold { color:#E7C879; }
  .hero h1 { font-family:var(--serif); font-weight:500; color:#fff; font-size:clamp(32px,4.4vw,46px); line-height:1.05; letter-spacing:-0.02em; margin-top:14px; }
  .hero .slogan { color:#cdd7e3; font-size:16px; line-height:1.55; margin-top:16px; max-width:54ch; }
  .dots { position:relative; display:flex; gap:6px; padding-bottom:18px; margin-top:-8px; }
  .dots span { width:8px; height:3px; border-radius:2px; background:rgba(255,255,255,.4); } .dots span.on { width:22px; background:#E7C879; }
</style>
```

> Note: `/img/hero/wheat-field.jpg` is a curated/purchased decorative image added in Task 6's asset step; the build does not fail if it is absent (CSS background only).

- [ ] **Step 4: Create `site-light/src/components/Hero.astro`**

```astro
---
import { HERO } from '../config';
import HeroTypographic from './HeroTypographic.astro';
import HeroSlider from './HeroSlider.astro';
---
{HERO === 'v3' ? <HeroSlider /> : <HeroTypographic />}
```

- [ ] **Step 5: Render Hero from index** (replace `index.astro`)

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
---
<Base title="НААН"><Hero /></Base>
```

- [ ] **Step 6: Verify V1 build renders typographic hero with verbatim slogan**

Run: `cd site-light && npm run build:v1 && grep -c "Національна академія аграрних наук України" dist-v1/index.html && grep -c "hero-bg" dist-v1/index.html || echo "no slider bg (correct for v1)"`
Expected: H1 grep ≥ `1`; `hero-bg` not present (prints `no slider bg (correct for v1)`).

- [ ] **Step 7: Verify V3 build renders slider hero**

Run: `cd site-light && npm run build:v3 && grep -c "hero-bg" dist-v3/index.html`
Expected: `1` (slider hero present).

- [ ] **Step 8: Commit**

```bash
git add site-light/src/config.ts site-light/src/components/Hero.astro site-light/src/components/HeroTypographic.astro site-light/src/components/HeroSlider.astro site-light/src/pages/index.astro
git commit -m "feat(site-light): V1/V3 hero variants via HERO build flag"
```

---

### Task 6: Stats band, shared image assets, and end-to-end homepage proof

**Files:**
- Create: `site-light/src/components/Stats.astro`
- Create: `site-light/public/img` (symlink → `../../site/public/img`)
- Create: `site-light/public/docs` (symlink → `../../site/public/docs`)
- Modify: `site-light/src/pages/index.astro` (Base + Hero + Stats)

**Interfaces:**
- Consumes: `data.ts` (`divisionCount`, `instituteCount`).
- Produces: `Stats.astro` renders three real figures (1931 / divisionCount / instituteCount).

- [ ] **Step 1: Create `site-light/src/components/Stats.astro`**

```astro
---
import { divisionCount, instituteCount } from '../lib/data';
const stats = [
  { n: '1931', l: 'Рік заснування' },
  { n: String(divisionCount), l: 'Наукових відділень' },
  { n: String(instituteCount), l: 'Наукових установ' },
];
---
<section class="stats"><div class="wrap stats-in">
  {stats.map((s) => (
    <div class="cell"><div class="n mono">{s.n}</div><div class="l">{s.l}</div></div>
  ))}
</div></section>
<style>
  .stats { border-bottom:1px solid var(--line); }
  .stats-in { display:grid; grid-template-columns:repeat(3,1fr); padding:26px 0; }
  .cell { padding-left:30px; } .cell:first-child { padding-left:0; } .cell + .cell { border-left:1px solid var(--line); }
  .n { font-size:40px; font-weight:500; color:var(--navy); line-height:1; }
  .l { font-size:12px; color:var(--ink2); margin-top:8px; }
  @media (max-width:560px){ .stats-in{ grid-template-columns:1fr; gap:18px; } .cell,.cell:first-child{ padding-left:0; } .cell + .cell{ border-left:none; } }
</style>
```

- [ ] **Step 2: Symlink shared public assets (single-source images/PDFs)**

Run:
```bash
cd site-light/public
ln -s ../../site/public/img img
ln -s ../../site/public/docs docs
cd ../.. && ls -l site-light/public/img/news | head -3
```
Expected: the symlink resolves and lists real news images (e.g. `art8984.jpg`).

- [ ] **Step 3: Assemble the homepage** (replace `index.astro`)

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import Stats from '../components/Stats.astro';
---
<Base title="НААН" description="Національна академія аграрних наук України — вища галузева наукова установа.">
  <Hero />
  <Stats />
</Base>
```

- [ ] **Step 4: Build both variants and verify real stats render**

Run: `cd site-light && npm run build:v1 && grep -oE ">1931<|>6<|>50<" dist-v1/index.html | sort -u`
Expected: includes `>1931<`, `>6<`, `>50<`.

- [ ] **Step 5: Verify symlinked images are emitted into the build**

Run: `find site-light/dist-v1/img/news -name "*.jpg" | head -1`
Expected: a real image path (symlinked assets copied into the build).

- [ ] **Step 6: Confirm current site still untouched**

Run: `git status --porcelain site/`
Expected: **no output.**

- [ ] **Step 7: Commit**

```bash
git add site-light/src/components/Stats.astro site-light/public/img site-light/public/docs site-light/src/pages/index.astro
git commit -m "feat(site-light): real stats band + shared image assets + homepage pipeline"
```

---

## Deferred to later plans

- **Plan 2 — Homepage blocks:** Структура (photo division cards), Newsroom (featured + list), Новини відділень placeholder, Анонси «Найближчі події», Атестація tiles, Президія portraits, document rows (Статут/Рішення/Звіти/Тендери та Прозорість/Публічна інформація), Рада молодих + ІВ feature pair, Е-ресурси, 4 посилання. Hero photo curation (`/img/hero/wheat-field.jpg` purchased stock + WebP).
- **Plan 3 — Inner pages:** news index/[slug], /anonsy, /struktura, presidium, document/registry pages (incl. «Наукові розробки та пропозиції» migration), prose/markdown pages, /kontakty with Cloudflare Turnstile, 404.
- **Plan 4 — Hardening:** a11y AA audit, PageSpeed ≥ 90 (image WebP/srcset, font preload), SEO (Schema.org, sitemap, robots), GA4, bilingual `<T>` wiring, custom domains.

## Self-Review

- **Spec coverage (Plan 1 portion):** architecture/content-sharing (§3) → Tasks 1–2; design system tokens + self-hosted fonts (§4, §9) → Task 3; Base/Header/Footer with verbatim slogan + real contacts (§5) → Task 4; V1/V3 hero mechanism (§2) → Task 5; real stats + deploy scripts + shared assets (§5, §7, §10) → Tasks 1, 6. Remaining spec sections (homepage blocks, inner pages, hardening) are explicitly deferred to Plans 2–4. No gap within Plan 1's stated scope.
- **Placeholder scan:** no `TBD`/`TODO`/"add error handling"; every code step shows full code; verification steps give exact commands + expected output. The `/img/hero/wheat-field.jpg` reference is explicitly noted as a Plan-2 asset and does not break the build.
- **Type consistency:** `divisionCount`/`instituteCount`/`divisions`/`persons`/`anonsy`/`contacts` defined in Task 2 are used with the same names in Tasks 4 & 6; `HERO`/`HERO_H1`/`HERO_SLOGAN` defined in Task 5 `config.ts` used consistently in hero components; `NAV`/`FOOTER`/`contacts` consumed as exported.
