#!/usr/bin/env python3
"""Copy deep-extracted registry files into the site and build a render manifest.
- Source files: naas_extract2/<key>/files/<src>
- documents.json: 11 registries {title, route, files:[{name, src}]}
- Skips podani.pdf (site-wide duplicate), files missing on disk, and files
  over Cloudflare Pages' 25 MiB per-file limit (reported, never fabricated).
"""
import json, os, re, shutil, unicodedata

ROOT = "/Users/falco/dev/naas_github_pages"
EXTRACT = os.path.join(ROOT, "naas_extract2")
DOCS_OUT = os.path.join(ROOT, "site/public/docs")
MANIFEST = os.path.join(ROOT, "site/src/data/registries.json")
STATUT_SRC = os.path.join(ROOT, "naas_content_bundle_extracted/docs/statut_naan_2021.pdf")
MAX_BYTES = 25 * 1024 * 1024  # Cloudflare Pages per-file limit

# Oversized files (>25 MiB) that cannot be hosted on Pages — point to the REAL
# recorded source URL on the old http://naas.gov.ua site (read from live markup,
# verified 200). Keyed by documents.json `src` name. Files without a recorded
# URL are omitted (never invented).
EXTERNAL_URLS = {
    "Katalog-2020_ToPress_1__p234-266.pdf": "http://naas.gov.ua/upload/iblock/4bf/Katalog-2020_ToPress(1)_p234-266.pdf",
    "Katalog-2020_ToPress_1__p121-153.pdf": "http://naas.gov.ua/upload/iblock/8ad/Katalog-2020_ToPress(1)_p121-153.pdf",
}

TRANSLIT = {
    'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ie','ж':'zh','з':'z',
    'и':'y','і':'i','ї':'i','й':'i','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p',
    'р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch',
    'ь':'','ю':'iu','я':'ia',"'":'','’':'',
}
def translit(s):
    out=[]
    for ch in s:
        l=ch.lower()
        if l in TRANSLIT: out.append(TRANSLIT[l] if ch.islower() or not TRANSLIT[l] else TRANSLIT[l])
        else: out.append(ch)
    return ''.join(out)

def slugify(name):
    base, ext = os.path.splitext(name)
    base = translit(base)
    base = unicodedata.normalize('NFKD', base).encode('ascii','ignore').decode()
    base = re.sub(r'[^a-zA-Z0-9]+','-', base).strip('-').lower()
    base = re.sub(r'-{2,}','-', base) or 'file'
    return base[:70] + ext.lower()

def year_of(name):
    yrs = re.findall(r'(19|20)\d{2}', name)
    return int(yrs[-1]+ re.findall(r'(?:19|20)(\d{2})', name)[-1]) if False else (int(re.findall(r'((?:19|20)\d{2})', name)[-1]) if re.findall(r'((?:19|20)\d{2})', name) else 0)

docs = json.load(open(os.path.join(EXTRACT.replace('naas_extract2',''), 'naas_content_bundle_extracted/documents.json'), encoding='utf-8'))

manifest = []
report = []
if os.path.isdir(DOCS_OUT): shutil.rmtree(DOCS_OUT)
for key, reg in docs.items():
    src_dir = os.path.join(EXTRACT, key, "files")
    out_dir = os.path.join(DOCS_OUT, key)
    items = []
    seen = set()
    skipped_missing = []
    skipped_big = []
    for f in reg.get("files", []):
        src_name = f["src"]
        if src_name.lower() == "podani.pdf":
            continue
        src_path = os.path.join(src_dir, src_name)
        if not os.path.isfile(src_path):
            skipped_missing.append(src_name); continue
        size = os.path.getsize(src_path)
        if size > MAX_BYTES:
            ext_url = EXTERNAL_URLS.get(src_name)
            if ext_url:
                items.append({
                    "title": os.path.splitext(f["name"])[0].replace("_"," ").replace("-"," ").strip(),
                    "ext": (os.path.splitext(f["name"])[1].lstrip(".").upper() or "FILE"),
                    "href": ext_url,
                    "year": year_of(f["name"]),
                    "sizeKB": round(size/1024),
                    "external": True,
                })
            else:
                skipped_big.append((src_name, size))
            continue
        safe = slugify(f["name"])
        n=1
        while safe in seen:
            b,e=os.path.splitext(safe); safe=f"{b}-{n}{e}"; n+=1
        seen.add(safe)
        os.makedirs(out_dir, exist_ok=True)
        shutil.copy2(src_path, os.path.join(out_dir, safe))
        title = os.path.splitext(f["name"])[0].replace("_"," ").replace("-"," ").strip()
        ext = os.path.splitext(f["name"])[1].lstrip(".").upper() or "FILE"
        items.append({
            "title": title,
            "ext": ext,
            "href": f"/docs/{key}/{safe}",
            "year": year_of(f["name"]),
            "sizeKB": round(size/1024),
            "external": False,
        })
    # sort: by year desc (0 last), then title
    items.sort(key=lambda x: (-(x["year"] or 0), x["title"].lower()))
    manifest.append({
        "key": key,
        "title": reg["title"],
        "route": reg["route"],
        "source_url": reg.get("source_url",""),
        "count": len(items),
        "items": items,
    })
    report.append((key, reg["route"], len(items), len(skipped_missing), len(skipped_big), skipped_big))

os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
json.dump(manifest, open(MANIFEST,"w",encoding="utf-8"), ensure_ascii=False, indent=2)

# Preserve the Статут PDF in /public/docs (this script rebuilds that dir).
os.makedirs(DOCS_OUT, exist_ok=True)
if os.path.isfile(STATUT_SRC):
    shutil.copy2(STATUT_SRC, os.path.join(DOCS_OUT, "statut_naan_2021.pdf"))

print(f"{'KEY':40} {'ROUTE':50} served  miss  big")
for k,r,served,miss,big,biglist in report:
    print(f"{k:40} {r:50} {served:5}  {miss:4}  {big}")
    for nm,sz in biglist: print(f"      BIG(>25MiB) skipped: {nm} ({round(sz/1048576,1)}MB)")
total=sum(r[2] for r in report)
print(f"\nTOTAL served files: {total}")
print(f"public/docs size: ", end="")
