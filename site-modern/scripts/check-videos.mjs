#!/usr/bin/env node
// YouTube liveness check via oEmbed (200 = alive, 404/401/403 = deleted/private).
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'data');
for (const file of ['video.json', 'agrolectures.json']) {
  const items = JSON.parse(readFileSync(resolve(DATA, file), 'utf8'));
  console.log('==', file, items.length, 'items');
  for (const v of items) {
    const u = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.youtube}&format=json`;
    const status = await fetch(u).then((r) => r.status).catch(() => 'ERR');
    console.log(status === 200 ? '  alive ' : `  DEAD(${status}) `, v.youtube, '—', v.title.slice(0, 60));
  }
}
