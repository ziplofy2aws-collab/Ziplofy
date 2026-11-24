#!/usr/bin/env bash
# Onboarding hotfix — apply with backups + syntax validation.
# Run from the LIVE app dir:  cd /var/www/wabapanel-express && bash deploy/onboarding-hotfix/apply.sh
set -euo pipefail

TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=".hotfix-backup-${TS}"
FILES=(
  src/utils/gatewaySync.js
  src/utils/gatewayModules.js
  src/middleware/featureGate.js
  src/models/User.js
  src/controllers/authController.js
  src/routes/auth.js
)

echo "== backing up to ${BACKUP_DIR} =="
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    mkdir -p "${BACKUP_DIR}/$(dirname "$f")"
    cp -p "$f" "${BACKUP_DIR}/$f"
    echo "  backed up $f"
  fi
done

echo "== applying patch =="
node deploy/onboarding-hotfix/patch.js

echo "== syntax checks =="
for f in "${FILES[@]}"; do
  node --check "$f" && echo "  OK $f"
done

echo
echo "Done. Verify then restart:"
echo "  node -e \"require('./src/routes/auth.js')\"   # module load check"
echo "  pm2 restart wabapanel-api"
echo "  curl -s -o /dev/null -w '%{http_code}' https://crm-backend.codiic.com/api/auth/onboarding   # expect 401 (auth required), not 404"
echo
echo "Rollback:  cp -a ${BACKUP_DIR}/. . && pm2 restart wabapanel-api"
