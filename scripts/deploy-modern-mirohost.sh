#!/usr/bin/env bash
# Deploy site-modern/dist to Mirohost → new.naas.gov.ua.
# PROJECT RULE: run ONLY after the user has explicitly approved connecting to Mirohost.
# Requires: ~/.naas_hosting.env with NAAS_FTP_HOST/USER/PASS(+PORT) and NAAS_NEW_SITE_DEST
# (subdomain docroot relative to the FTP root; added in Task 4 of the plan).
#
# Deploy gate: dist must contain no unreferenced files EXCEPT the known set in
# scripts/audit_allowlist.txt (files kept in public/ because src/ still mentions
# them — dead HeroWide component images, HERO_IMG source original). Any NEW
# orphan fails the deploy.
set -euo pipefail
source "$HOME/.naas_hosting.env"
: "${NAAS_NEW_SITE_DEST:?Add NAAS_NEW_SITE_DEST to ~/.naas_hosting.env (see Task 4 of the plan)}"

# Mirohost FTP (fvh56) accepts the hosting-account credentials; the dedicated
# NAAS_FTP_USER/PASS lines are unfilled in ~/.naas_hosting.env, so fall back.
FTP_USER="${NAAS_FTP_USER:-${NAAS_SSH_USER:?}}"
FTP_PASS="${NAAS_FTP_PASS:-${NAAS_SSH_PASS:?}}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../site-modern"
npm run build
python3 "$SCRIPT_DIR/audit_dist.py" dist /tmp/naas_audit_deploy > /dev/null
new_orphans=$(comm -23 \
  <(sort /tmp/naas_audit_deploy/orphans.txt | grep -v '^$' || true) \
  <(sort "$SCRIPT_DIR/audit_allowlist.txt"))
if [ -n "${new_orphans}" ]; then
  echo "STOP: new unreferenced files in dist (not in audit_allowlist.txt):"
  echo "${new_orphans}"
  exit 1
fi

# Incremental upload in two passes. astro build regenerates dist/ with fresh mtimes
# every run, so lftp's --only-newer (time-only, "turns off size comparison" per
# lftp(1)) sees every file as newer and re-uploads all ~724 MB. Split instead:
#   Pass 1 — mutable site shell (~7 MB: HTML, _astro, img), docs/ excluded. No size
#     skip, so a same-size text edit (e.g. a footer label) always publishes.
#   Pass 2 — static doc library (~717 MB PDFs). --ignore-time compares by SIZE only,
#     so unchanged docs are skipped; only new or resized files upload.
lftp -u "${FTP_USER},${FTP_PASS}" -p "${NAAS_FTP_PORT:-21}" "${NAAS_FTP_HOST}" -e "
set ftp:ssl-allow true;
set ssl:verify-certificate no;
mirror -R --parallel=4 --verbose -x '^docs/' dist/ ${NAAS_NEW_SITE_DEST};
mirror -R --parallel=4 --verbose --ignore-time dist/docs/ ${NAAS_NEW_SITE_DEST}/docs;
bye"
echo "OK: dist → ${NAAS_NEW_SITE_DEST}"
