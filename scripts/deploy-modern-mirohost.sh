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

lftp -u "${NAAS_FTP_USER},${NAAS_FTP_PASS}" -p "${NAAS_FTP_PORT:-21}" "${NAAS_FTP_HOST}" -e "
set ftp:ssl-allow true;
set ssl:verify-certificate no;
mirror -R --parallel=4 --only-newer --verbose dist/ ${NAAS_NEW_SITE_DEST};
bye"
echo "OK: dist → ${NAAS_NEW_SITE_DEST}"
