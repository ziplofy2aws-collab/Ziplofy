#!/usr/bin/env bash
# Certbot deploy hook — install at:
#   /etc/letsencrypt/renewal-hooks/deploy/codiic-nginx-reload.sh
# chmod 0755. Runs only when a certificate is actually renewed.
# Validates nginx config before reloading; a failed test leaves the last
# working config in place (nginx keeps running the old one).
set -euo pipefail

if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
    logger -t codiic-ssl "nginx reloaded after certbot renewal of: ${RENEWED_DOMAINS:-unknown}"
else
    logger -t codiic-ssl "ERROR: nginx -t failed after certbot renewal of ${RENEWED_DOMAINS:-unknown} — reload skipped"
    exit 1
fi
