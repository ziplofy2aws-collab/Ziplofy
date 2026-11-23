#!/usr/bin/env bash
# setup-gateway.sh — ONE-TIME storefront-gateway setup for custom-domain SSL.
# Run ON 3.107.46.222 (the nginx/cerbot edge) as a sudo-capable user:
#   sudo bash deploy/ssl-agent/setup-gateway.sh
#
# What it does:
#   1. Backs up /etc/nginx to /etc/nginx.backup-<ts>
#   2. Creates the ACME webroot, snippet dir, and per-domain conf.d dir
#   3. Installs the shared ACME snippet and (safely) includes it in the
#      storefront :80 server block — nginx -t gates the edit
#   4. Installs the certbot renewal deploy-hook
#   5. Verifies the certbot renewal timer exists
#
# It does NOT: touch certs, reload nginx until -t passes, or change DNS.
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/ubuntu/Ziplofy/webpanel/wabapanel-express}"
DEPLOY_DIR="$REPO_DIR/deploy/ssl-agent"
TS="$(date +%Y%m%d%H%M%S)"

step() { echo; echo "== $* =="; }

step "1/5 Backup /etc/nginx"
cp -a /etc/nginx "/etc/nginx.backup-$TS"
echo "backup → /etc/nginx.backup-$TS"

step "2/5 Create dirs"
mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
mkdir -p /etc/nginx/snippets /etc/nginx/conf.d/domains /etc/letsencrypt/renewal-hooks/deploy
chmod 755 /var/www/letsencrypt /etc/nginx/conf.d/domains

step "3/5 ACME snippet + include in the :80 catch-all block"
cp "$DEPLOY_DIR/nginx/codiic-acme.conf" /etc/nginx/snippets/codiic-acme.conf

# Custom domains (pre-cert) hit nginx's DEFAULT :80 server — the one with
# `default_server`/`server_name _`. The ACME include must go there, not the
# *.codiic.com blocks (customer domains don't match those server_names).
TARGET="$(grep -rlE 'listen\s+(\[::\]:)?80[^0-9]' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | xargs grep -l 'default_server\|server_name _' 2>/dev/null | head -1 || true)"
if [ -z "$TARGET" ]; then
    echo "!! Could not auto-detect the :80 catch-all block."
    echo "   Manually add inside that server block:"
    echo "       include /etc/nginx/snippets/codiic-acme.conf;"
else
    echo ":80 catch-all block → $TARGET"
    cp -a "$TARGET" "$TARGET.bak-$TS"
    if grep -q 'snippets/codiic-acme.conf' "$TARGET"; then
        echo "include already present — skipping"
    else
        # Insert the include right after the first server_name line in the file.
        sed -i '/server_name/ i\    include /etc/nginx/snippets/codiic-acme.conf;' "$TARGET"
        nginx -t
        echo "include installed + nginx -t OK"
    fi
fi
nginx -t
systemctl reload nginx
echo "nginx reloaded — ACME webroot live"

step "4/5 Certbot renewal deploy-hook + pm2"
if ! command -v pm2 >/dev/null 2>&1; then
    echo "pm2 not found — installing globally (npm i -g pm2)"
    npm i -g pm2
else
    echo "pm2: $(pm2 --version 2>/dev/null || echo present)"
fi
cp "$DEPLOY_DIR/certbot-deploy-hook.sh" /etc/letsencrypt/renewal-hooks/deploy/codiic-nginx-reload.sh
chmod 0755 /etc/letsencrypt/renewal-hooks/deploy/codiic-nginx-reload.sh
echo "deploy-hook installed"

step "5/5 Renewal timer check (renumbered)"
if systemctl list-timers --all 2>/dev/null | grep -qiE 'certbot|snap.certbot'; then
    echo "certbot renewal timer: present"
else
    echo "!! No certbot systemd timer found."
    echo "   certbot snap/deb usually ships one (snap.certbot.renew or certbot.timer)."
    echo "   Fallback cron:  echo '17 3,15 * * * root certbot renew --quiet' > /etc/cron.d/certbot-renew"
fi

cat <<'EOF'

Done. Remaining manual steps (see DEPLOY.md):
  1. Put the worker env at $REPO_DIR/.env.production (see env.ssl-worker.example)
  2. pm2 start deploy/ssl-agent/ecosystem.config.js && pm2 save
  3. Staging-verify: CERTBOT_STAGING=true, verify a domain, watch pm2 logs
EOF
