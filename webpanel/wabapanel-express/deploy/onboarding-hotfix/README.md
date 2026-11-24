# Onboarding Hotfix — Manage Profile 404s

## Root cause

The live build under `/var/www/wabapanel-express` predates commits
`41105040` (`/business` + `/industry` endpoints) and `45d3c117`
(`/onboarding` + `/onboarding/profile` endpoints + gateway profile sync).
The deployed CRM frontend already calls all four endpoints, so Manage
Profile / Choose-your-business get 404s.

## What the patch does (all additive/backward-compatible)

| File | Change |
|---|---|
| `src/utils/gatewaySync.js` | NEW — profile→gateway sync + launch-path resolver |
| `src/utils/gatewayModules.js` | replaced with repo version — same exports, adds 7 sector modules (realEstate, agency, legal, hospitality, salon, serviceBusiness, travel), 9 industries, `SERVICE_BUSINESS_OPTIONS`, `SECTOR_MODULE_IDS` |
| `src/middleware/featureGate.js` | replaced with repo version — same exports, adds 7 sector feature keys to FEATURE_CATALOG |
| `src/models/User.js` | +`preferredTimezone`, +`preferredLanguage`, +`platformUserId` |
| `src/controllers/authController.js` | +`getClientBusinessOptions`, `updateClientIndustry`, `getOnboardingStatus`, `saveOnboardingProfile` + exports |
| `src/routes/auth.js` | +2 import names, +4 route lines |

Compatibility was verified: live-era and repo versions of
`gatewayModules.js`/`featureGate.js` export identical names and function
signatures — the repo versions are strict supersets. `provisionVendor`,
module toggles, and all `requireFeature` consumers keep working.

## Apply

```bash
cd /var/www/wabapanel-express
bash deploy/onboarding-hotfix/apply.sh          # backup → patch → node --check
pm2 restart wabapanel-api
```

## Verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://crm-backend.codiic.com/api/auth/onboarding
# expect 401 Unauthorized (route exists, needs token) — not 404
```

Then log in via the gateway → Manage Profile loads; personal/billing/
regional steps save; Choose-your-business lists 9 options.

## Rollback

```bash
cd /var/www/wabapanel-express
cp -a .hotfix-backup-<timestamp>/. .
pm2 restart wabapanel-api
```

## Notes / follow-ups

- `syncProfileToGateway` is best-effort: if `GATEWAY_SSO_SECRET` or
  `GATEWAY_API_URL` are absent it logs and skips — profile saves still
  succeed. Check the prod env has both if gateway profile sync is wanted.
- `45d3c117` also updates `createWorkspace` (store bootstrap + gateway
  sync on first workspace). Not strictly needed for the 404 fix — apply
  the repo version of `src/controllers/workspaceController.js` later if
  new workspaces should auto-create the storefront.
- Unit tests for the new handlers:
  `node --test src/controllers/authController.onboarding.test.mjs`
