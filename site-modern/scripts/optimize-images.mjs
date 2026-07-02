#!/usr/bin/env node
// Generates WebP variants for the raster images referenced by templates.
// Naming: <name>.<width>.webp next to the original under public/img/.
// Widths: hero 960+1600, news 480+960, announcements 160+480.
import sharp from 'sharp';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = resolve(ROOT, 'public');
const DATA = resolve(ROOT, '..', 'content', 'data');

const news = JSON.parse(readFileSync(resolve(DATA, 'news.json'), 'utf8'));
const anonsy = JSON.parse(readFileSync(resolve(DATA, 'anonsy.json'), 'utf8'));

const jobs = new Map(); // '/img/...' -> Set<width>
const add = (src, widths) => {
  if (!src || !src.startsWith('/img/')) return;
  const set = jobs.get(src) ?? new Set();
  for (const w of widths) set.add(w);
  jobs.set(src, set);
};

add('/img/news/art8965.png', [960, 1600]); // homepage hero
for (const n of news) add(n.image, [480, 960]);
for (const a of anonsy) add(a.image, [160, 480]);

let made = 0;
for (const [src, widths] of jobs) {
  const abs = resolve(PUB, src.slice(1));
  if (!existsSync(abs)) { console.warn('skip (missing):', src); continue; }
  const meta = await sharp(abs).metadata();
  for (const w of widths) {
    const out = abs.replace(/\.(jpe?g|png)$/i, `.${w}.webp`);
    await sharp(abs).resize({ width: Math.min(w, meta.width ?? w) }).webp({ quality: 72 }).toFile(out);
    console.log(out.replace(PUB, ''), Math.round(statSync(out).size / 1024) + 'KB');
    made++;
  }
}
console.log(`done: ${made} webp files`);
