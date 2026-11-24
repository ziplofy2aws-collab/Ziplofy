# Custom-domain SSL — deployment & operations

Automated Let's Encrypt SSL for webpanel storefront custom domains.
Worker runs on the **storefront gateway** (3.107.46.222 — nginx + certbot);
job state lives in `webpanel_store_domains` in the shared Atlas `wabapanel` DB.

## Flow

```
verifyDomain (API) → sslStatus:'pending' → worker claims (atomic) →
DNS re-check → certbot --webroot → /etc/nginx/conf.d/domains/<host>.conf
(atomic write, nginx -t, reload) → sslStatus:'active' + http→https redirect
```

Renewal: certbot's own timer + deploy-hook `codiic-nginx-reload.sh`.
Reconcile (15 min) removes conf files whose hostname is no longer active.

## Deploy (first time)

The gateway has no git checkout — ship the express app over rsync (or clone):

```bash
# FROM YOUR WORKSTATION (repo root, branch crm-12-nov):
rsync -az --exclude node_modules --exclude uploads --exclude '.env*' \
  webpanel/wabapanel-express/ ubuntu@3.107.46.222:/home/ubuntu/webpanel-ssl/wabapanel-express/

# ON THE GATEWAY (3.107.46.222):
cd /home/ubuntu/webpanel-ssl/wabapanel-express
npm ci --omit=dev                                # deps incl. node-cron
cp deploy/ssl-agent/env.ssl-worker.example .env.production
#   → fill MONGODB_URI (wabapanel DB), LETSENCRYPT_EMAIL; CERTBOT_STAGING=true
sudo bash deploy/ssl-agent/setup-gateway.sh      # nginx backup → acme webroot → nginx -t → reload
pm2 start deploy/ssl-agent/ecosystem.config.js   # NOTE: update `cwd` to this path first
pm2 save
```

If rsyncing to a different path, update `cwd` in `ecosystem.config.js` to match.

## Staging verification (before prod certs)

```bash
CERTBOT_STAGING=true                       # in worker env — fake CA, no rate limits
# CRM: connect + verify a test domain pointing at 3.107.46.222
pm2 logs webpanel-ssl-worker               # watch: provisioning → SSL active
curl -sI http://<domain>                   # 301 → https
curl --resolve <domain>:443:3.107.46.222 -vkI https://<domain>  # staging CA warning = OK
sudo certbot renew --dry-run               # renewal check
```

## Production activation

Set `CERTBOT_STAGING=false`, `pm2 restart webpanel-ssl-worker`, then
`POST /api/domains/:id/ssl/retry` for each staged domain — the worker reissues
with the real CA and updates the same nginx conf.

## Rollback

- **nginx**: `sudo cp -a /etc/nginx.backup-<ts>/. /etc/nginx/ && sudo nginx -t && sudo systemctl reload nginx`
- **one domain**: `sudo rm /etc/nginx/conf.d/domains/<host>.conf && sudo nginx -t && sudo systemctl reload nginx`
- **worker**: `pm2 stop webpanel-ssl-worker` — storefronts keep serving; provisioning pauses.
- **API change**: `git revert` the feature commit on the API host + restart.

## Ops commands

```bash
pm2 logs webpanel-ssl-worker --lines 100          # worker log
sudo certbot certificates                          # issued certs + expiry
sudo certbot renew --dry-run                       # renewal test
ls /etc/nginx/conf.d/domains/                      # managed vhosts
sudo nginx -T | grep -A8 'server_name <host>'      # live vhost for a domain
journalctl -t codiic-ssl --since today             # renewal deploy-hook log
# Mongo: db.webpanel_store_domains.find({hostname:'<d>'},{sslStatus:1,sslError:1,sslNextRetryAt:1})
```

## Dashboard-facing statuses (serialized by GET /api/domains/store/:storeId)

`pending` → `issuing` → `active` | `failed` (auto-retries with backoff; the
`ssl/retry` endpoint resets attempts). `sslError` is always a sanitized,
customer-safe message — raw certbot/nginx output stays in worker logs.

## Security notes

- Hostnames pass a strict allowlist before touching filenames/config;
  commands are execFile argv arrays — no shell interpolation anywhere.
- Private keys never leave the gateway; Mongo stores only paths + status.
- DNS is re-verified at issuance time, so certs can't be issued for domains
  that stopped pointing at the platform.
- The reconcile sweep only removes nginx confs — it never deletes cert files.
