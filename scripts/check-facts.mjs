#!/usr/bin/env node
// ============================================================================
// NAAS fact-consistency gate. Scans BOTH codebases (gravitas site/ and light
// site-light/) for source-of-truth facts and fails (exit 1) on any stale or
// inconsistent representation. Run before every deploy:  node scripts/check-facts.mjs
//
// Why this exists: facts (founding year, descriptor, institution count, press
// unit, reports link…) appear in many representations across two parallel
// designs. A change must update ALL of them. This script is the safety net that
// caught the "50 vs 176" institution-count split.
// ============================================================================
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOTS = {
  gravitas: '/Users/falco/dev/naas_github_pages/site',
  light: '/Users/falco/dev/naas_light_wt/site-light',
};

const violations = [];
const v = (sev, fact, where, msg) => violations.push({ sev, fact, where, msg });

// ---- collect all source files from both trees (src + a couple of data dirs) ----
function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist' || e.startsWith('dist-') || e === '.git') continue;
    const p = `${dir}/${e}`;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|tsx|js|mjs|md|json)$/.test(e)) acc.push(p);
  }
  return acc;
}
const files = [];
for (const [, root] of Object.entries(ROOTS)) files.push(...walk(`${root}/src`));
const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } };
const label = (f) => f.includes('/site-light/') ? 'light' : 'gravitas';

// ---------------------------------------------------------------------------
// 1. FORBIDDEN strings (rejected by stakeholder) — must appear NOWHERE.
// ---------------------------------------------------------------------------
const FORBIDDEN = [
  { fact: 'descriptor', re: /вища галузева/g, msg: '«вища галузева» rejected by stakeholder — use «державна самоврядна наукова організація».' },
  { fact: 'press-unit', re: /[Пп]рес-?служб/g, msg: 'Press unit must be «Відділ інформаційного забезпечення та зв’язків з громадськістю», not «Прес-служба».' },
  { fact: 'reports-link', re: /agroscience-publishing\.org\.ua\/books/g, msg: '«Звіти про діяльність» must NOT link to the publisher /books — point to the internal «Офіційні документи» page.' },
];
// Founding year: 1931 is forbidden ONLY in a founding context (not lineage / equipment years).
const FOUNDING_1931 = /(ЗАСН\.?\s*1931|EST\.?\s*1931|[Зз]аснован[аоиі]*\s+1931|засновано[^.]{0,30}1931|n:\s*['"]1931['"]|foundingDate:\s*['"]1931['"])/g;

for (const f of files) {
  const txt = read(f);
  for (const { fact, re, msg } of FORBIDDEN) {
    if (re.test(txt)) v('FAIL', fact, `${label(f)}:${f.split('/src/')[1]}`, msg);
  }
  if (FOUNDING_1931.test(txt)) v('FAIL', 'founding-year', `${label(f)}:${f.split('/src/')[1]}`, 'Founding year shown as 1931 — must be 1918.');
}

// ---------------------------------------------------------------------------
// 2. REQUIRED: emblem is the 320×320 high-quality asset in both public dirs.
// ---------------------------------------------------------------------------
for (const [name, root] of Object.entries(ROOTS)) {
  const png = `${root}/public/naas-emblem.png`;
  if (!existsSync(png)) { v('FAIL', 'emblem', `${name}:public`, 'naas-emblem.png missing.'); continue; }
  try {
    const dim = execSync(`sips -g pixelWidth -g pixelHeight "${png}"`, { encoding: 'utf8' });
    const w = +(/pixelWidth:\s*(\d+)/.exec(dim)?.[1] || 0);
    if (w < 300) v('FAIL', 'emblem', `${name}:public`, `naas-emblem.png is ${w}px — expected the 320px high-quality version.`);
  } catch { /* sips unavailable; skip */ }
}

// ---------------------------------------------------------------------------
// 3. CONSISTENCY: institution count.
//    Scheme: "наукові установи / наукових установ" headline = 84 (authoritative
//    budget scientific institutions); the macro figures «N установ і організацій»
//    (176 total) and «N бюджетні наукові установи» (84) are labelled separately;
//    the roster (institutes.json) is what struktura LISTS. The old/rejected
//    value 50 must appear nowhere; the "наукових установ" headline must be uniform.
// ---------------------------------------------------------------------------
const rosterPath = `${ROOTS.gravitas}/src/data/institutes.json`;
let rosterLen = null;
try {
  const roster = JSON.parse(read(rosterPath));
  rosterLen = roster.reduce((n, d) => n + (d.ustanovy?.length || 0), 0);
} catch { v('FAIL', 'institution-count', 'shared', 'cannot read institutes.json'); }

if (rosterLen === 50) v('FAIL', 'institution-count', 'shared:data/institutes.json', 'Roster still has 50 institutions (old/rejected list). Rebuild to the authoritative list.');

const headline = new Map(); // headline "наукових установ" number -> [where]
for (const f of files) {
  const txt = read(f);
  // rejected stale number adjacent to an institution noun
  if (/\b50\s+(наукови|установ|підпорядкован)/i.test(txt))
    v('FAIL', 'institution-count', `${label(f)}:${f.split('/src/')[1]}`, 'Shows "50" institutions — rejected by stakeholder («не 50»).');
  // headline "(\d) наукові установи / наукових установ" (adjacent) must be uniform
  let m; const re = /(\d{2,3})\s+наукови[хй]\s+установ[аи]?/gi;
  while ((m = re.exec(txt))) {
    const k = m[1];
    if (!headline.has(k)) headline.set(k, []);
    headline.get(k).push(`${label(f)}:${f.split('/src/')[1]}`);
  }
}
if (headline.size > 1) {
  v('FAIL', 'institution-count', `headline values: {${[...headline.keys()].join(', ')}}`,
    'The "наукових установ" headline shows different numbers across surfaces: ' +
    [...headline.entries()].map(([k, w]) => `${k}→[${w.join(', ')}]`).join('  '));
}

// ---------------------------------------------------------------------------
// 4. DEAD LINKS: every internal footer/nav link must resolve to a built page in
//    BOTH versions. Runs against dist/ when present (build first for full check).
//    Catches "shared route added, but page only created in one version".
// ---------------------------------------------------------------------------
for (const [name, root] of Object.entries(ROOTS)) {
  const dist = `${root}/dist`;
  const home = `${dist}/index.html`;
  if (!existsSync(home)) continue; // not built; skip
  const html = read(home);
  // footer/nav internal links (href="/something", no scheme, no #-only)
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);
  const uniq = [...new Set(hrefs)].filter((h) => h !== '/' && !h.startsWith('/_') && !/\.(png|jpg|jpeg|svg|webp|pdf|ico|xml|css|js|txt)$/.test(h));
  for (const h of uniq) {
    const clean = h.replace(/\/$/, '');
    const candidates = [`${dist}${clean}/index.html`, `${dist}${clean}.html`];
    if (!candidates.some(existsSync)) {
      v('FAIL', 'dead-link', `${name}:dist`, `Internal link ${h} has no built page in the ${name} version (footer/nav points to a page that does not exist here).`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const fails = violations.filter((x) => x.sev === 'FAIL');
if (!violations.length) {
  console.log('✅ check-facts: all source-of-truth facts consistent across gravitas + light.');
  process.exit(0);
}
console.log(`\nNAAS fact-consistency report — ${fails.length} FAIL\n${'='.repeat(60)}`);
for (const x of violations) {
  console.log(`\n[${x.sev}] ${x.fact}  (${x.where})\n   ${x.msg}`);
}
console.log(`\n${'='.repeat(60)}\n${fails.length ? '❌ FAIL — fix before deploy.' : '⚠️  warnings only.'}`);
process.exit(fails.length ? 1 : 0);
