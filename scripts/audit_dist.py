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
