# site-modern — deploy runbook (staging + prod)

The `site-modern/` Astro app is deployed to **two** targets from **one** source. This
runbook is the go-forward process for keeping them identical.

## Targets

| Role | URL | Deploy command | Host |
|------|-----|----------------|------|
| **staging** | https://naas-portal-modern.pages.dev | `npm run deploy:staging` | Cloudflare Pages (foreign — internal preview only) |
| **prod** | http://new.naas.gov.ua | `npm run deploy:prod` | Mirohost (Ukraine — the public showcase) |

Both commands run from `site-modern/`. Both build from the same `site-modern/` source,
so the two targets are identical **by construction** when deployed from the same commit.

- `deploy:staging` = `astro build` + fact check + `wrangler pages deploy` (manual; no CI).
- `deploy:prod` = `scripts/deploy-modern-mirohost.sh` = `astro build` + orphan-audit gate
  (`scripts/audit_dist.py` vs `scripts/audit_allowlist.txt`) + `lftp` mirror of `dist/` to
  the subdomain docroot. Needs `~/.naas_hosting.env`.

> **Legal:** gov.ua domains must be hosted in Ukraine. Cloudflare Pages is fine as a private
> preview URL (`*.pages.dev`), but **never** as a `*.naas.gov.ua` origin. Prod = Mirohost only.

## The single source of truth

All changes go into **`naas_github_pages/site-modern/`** on **`main`** (this repo, this
worktree — not the `-ds` worktree, not another session's worktree). `site-modern` also reads
shared content from the repo-root `content/` layer via `@content` (e.g. `content/site.ts`
partner links), so a content-only commit can change the built HTML.

## Cycle for every change

1. `git pull` — parallel sessions commit to `main`; build from the latest.
2. Edit `site-modern/` (or `content/`). Small change → directly on `main`; larger →
   short-lived feature branch → merge to `main`.
3. `git commit && git push` — **project rule: never deploy an unpushed commit.**
4. `cd site-modern && npm run deploy:staging` → review on pages.dev (fast HTTPS preview).
5. When approved, `npm run deploy:prod` → new.naas.gov.ua. Requires: (a) explicit user go,
   (b) user permission to connect to Mirohost (asked **every** time).
6. Verify in sync (below).

## Guardrails

- **Never** `deploy:staging` from **uncommitted** changes — that is the only way the two
  targets drift.
- **Never** deploy an **unpushed** commit.
- Prod deploy is gated: explicit user approval **and** per-connection Mirohost permission.
- Change **only** `site-modern/` (+ shared `content/` when that is the intent). Do not touch
  other sessions' worktrees or plan/spec docs.

## Verify the two targets are in sync

Two checks — you usually want **both**, because they cover different change types:

**1. Build identity (design / CSS / JS changes).** Astro content-hashes its bundles, so
identical `_astro/*.css|js` filenames ⇒ identical build:

```sh
diff \
  <(curl -s https://naas-portal-modern.pages.dev/ | grep -oE '_astro/[A-Za-z0-9._-]+\.(css|js)' | sort -u) \
  <(curl -s http://new.naas.gov.ua/          | grep -oE '_astro/[A-Za-z0-9._-]+\.(css|js)' | sort -u)
```

**2. Content identity (text changes) — the hash check's blind spot.** Text/content edits
land in the HTML, **not** in the hashed bundles, so check #1 will not see them. Grep a
distinctive string of the change on both live pages, e.g.:

```sh
for u in https://naas-portal-modern.pages.dev/ http://new.naas.gov.ua/; do
  echo "$u"; curl -s "$u" | grep -oE 'Міністерство аграрної політики[^<]*' | head -1
done
```

Empty diff / matching text on both ⇒ in sync.

## Notes

- The subdomain currently serves `robots.txt` = `Disallow: /` (test mode). Flip it before any
  public launch.
- Subdomain HTTPS is invalid (Mirohost wildcard self-signed) → prod is served over **HTTP**,
  and that is why the old-site banner points to `http://new.naas.gov.ua/`. pages.dev is the
  HTTPS preview.
- Mirohost FTP (fvh56) authenticates with the hosting-account credentials; the deploy script
  falls back to `NAAS_SSH_USER/PASS` because the dedicated `NAAS_FTP_USER/PASS` env lines are
  empty.
