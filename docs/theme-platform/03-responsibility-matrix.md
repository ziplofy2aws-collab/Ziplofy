# Platform vs Developer Responsibility Matrix

Implementation column states **verified** code (with file), **partial**, or **missing**. Source paths relative to repo root.

## Packaging & upload

| Requirement | Theme developer | Codiic platform | Actual implementation | Gap / risk |
|---|---|---|---|---|
| Valid ZIP/folder with root `index.html` | Author site, zip correctly | Extract, detect content root, catalog | `codiic-server/src/utils/informatic-import/import-static-theme-zip.ts`; upload routes `src/routes/informatic-theme.route.ts` (`POST /import-zip`, `/import-folder`, `/from-s3`) | Content root = dir containing `index.html`; nested zips or missing index → 400 with clear message |
| File size/file count limits | Stay under 200MB zip / 500 files | Enforce via multer | `informatic-theme.route.ts` multer config | Folder cap 25MB total — heavier sites must use ZIP |
| Upload auth | — | Require staff auth + 'Theme Management' permission | `authorizePermission('Theme Management','upload')` on routes | Public cannot upload — by design |
| Original file storage | — | Persist all files to S3, keep tree | `informatic-theme-s3-ingest.ts` → `s3Assets.contentRoot.prefix` | — |
| Editor conversion | Nothing | Parse HTML → schema/config/manifest/React pack | `convert-static-theme.ts` → `ConvertedInformaticPack` (schemaJson, defaultConfigJson, manifestJson, themeJs, themeCss, thumbnail, report, warnings) | Heuristic section split; complex nested sections may collapse |
| Catalog record | — | Create `InformaticTheme` doc | `informatic-theme.model.ts`; `POST` handlers create + log report | `tags` drive industry gating — upload must set them |

## Rendering

| Requirement | Theme developer | Codiic platform | Actual implementation | Gap / risk |
|---|---|---|---|---|
| Original design preserved | Relative paths, semantic HTML | Serve original files via proxy | `webpanelStorefrontThemeSiteController.js` `getStorefrontThemeSiteFile`; `<base>` injection; `staticSiteUrl` returned by `webpanelInformaticThemeRuntime.util.js` | Root-absolute `/…` assets would escape `<base>` — author relative |
| Two render paths | — | Route static vs contract | `staticSiteUrl` when `contentRoot.prefix` exists, else `remoteThemeJsUrl` + config | Correct by design |
| Store resolution | — | Host → store mapping | `GET /api/store-subdomain/check?host=` (`webpanelStoreController.checkStoreSubdomain`); subdomain + `customDomain` + verified `WebpanelStoreDomain` | Custom domain flow exists but DNS/verify UX is new |
| Applied-theme enforcement | — | Only serve installed+applied theme | `resolveSiteContext` + `isInformaticThemeInstalled` (`webpanelInformaticInstalledThemeController.js`) | Old theme URLs 404 after switch — correct |
| Asset proxying | Relative paths | Rewrite + proxy every file | same controller; `absolutizeUrl` on injected record media | CDN/media URLs must be absolute in record data |

## Theme Editor

| Requirement | Theme developer | Codiic platform | Actual implementation | Gap / risk |
|---|---|---|---|---|
| Editable fields | Semantic sections/elements | Generate schema fields per element type | `convert-static-theme.ts` widget map (color→color, img→image, url→url, cta→button, text→styled-text); schema shape = `theme.schema.json` (globalSettings/layout/templates/sectionCatalog) | Schema is heuristic — some elements become styled-text blobs |
| Inspector click-to-edit | — | `data-inspector` markers + overlay | `InformaticInspectorLayer.tsx`, `informatic-inspector.ts`, `injectEditorBridge` in theme-site | Bridge injects on static pages for editor iframe context |
| Save & reload persistence | — | Store config + re-apply | `WebpanelStoreInformaticThemeConfig` (`GET/PUT/DELETE /api/stores/:storeId/informatic-theme-config/:themeId`); editor `InformaticThemeEditor.tsx` | Config merges over defaults each load |
| Edits reach static HTML | Nothing | Map saved diffs → static markup | `collectContentOverrides` + `applyContentOverrides` (text + image src) | **Only text/images.** Section reorder/add/remove, new fields → contract render only, not static pages |
| Global theme settings | Define palette-ish CSS | `settings.colors/typography` via `injectHeadSnippet`/`buildConfigOverrides` | `webpanelStorefrontThemeSiteController.js` | Inline styles in theme override settings — keep inline styling minimal |

## Live data sync (travel)

| Requirement | Theme developer | Codiic platform | Actual implementation | Gap / risk |
|---|---|---|---|---|
| Package records exist | — | CRUD via sector API | `POST/PUT/GET/DELETE /api/sector/:industry/[:entity[/:id]]` (`sector.js` + `sectorController`); `SectorRecord` model | Travel only — other industries lack sync (see 04) |
| Cards show live records | Expose card list or data array | Detect + inject at serve time | `findCardRuns`/`injectLivePackageCards`, `rewriteDataJs` + `recordToShape` | Detection is heuristic — rules in 01 §4 mandatory |
| Stable package identity | `data-pkg-id`, `?id=` links | Rewrite to record `_id`/`urlHandle` | `mapCardToRecord` rewrites attrs + hrefs; detail resolve `_id` or `data.slug` | `urlHandle` vs `_id` used in two paths — records with urlHandle edge case (see 08) |
| Detail page live | Static detail template | `detailPageRecord` + `mapCardToRecord` first-hit mapping | filename regex `detail|package|product|tour|trip|itinerar`; `?id=`/`?pkg=` | First-img/first-h1 assumption — see 02 §3 ordering rules |
| Demo data removed | — | Neutralize hard-coded filters/counts | `neutralizeDemoFilters`, `patchBudgetConstants` | Only for matched regions — orphan demo text elsewhere stays |
| Freshness | — | Per-request fetch | `fetchStoreLivePackages` query each theme-site request (≤48 records); editorPack 30-min cache | Not event-based; no webhook — new package appears on next request, near-real-time |
| Cross-store isolation | — | Workspace + install scoping | records queried by `store.workspace`; theme-site checks applied/install per store | Verified |

## Traveller / booking

| Requirement | Theme developer | Codiic platform | Actual implementation | Gap / risk |
|---|---|---|---|---|
| Sign-in entry point | Nav link "Sign in"/"My account" | Inject auth modal + session | `injectStorefrontLogin` (theme-site); `POST /api/storefront/:storeId/traveller-auth` (`webpanelStorefrontTravelController.js`) | No password reset / email verification |
| Enquiry capture | Form with date + travellers + CTA text | Inject submit script → record | `injectStorefrontEnquiry`; `POST /api/storefront/:storeId/travel-packages/:packageId/enquiries` | Guest enquiry not supported — requires traveller session |
| Enquiry → booking | — | Staff convert action | `POST /api/sector/:industry/enquiries/:id/convert` → `bookings` record `pending`, back-link | No customer-side booking creation |
| Status changes | — | Staff status API + notifications | `POST /api/sector/:industry/:entity/:id/status`; `travelBookingNotify.util.js` | Status set = `pending/confirmed/cancelled` (+ record `archived`) |
| My-trips visibility | Nav hook only | Injected panel + API | `GET /api/storefront/:storeId/traveller-trips?email&token` | Requires session token; no pagination |
| Notifications | — | SMTP on convert/confirm/cancel | `travelBookingNotify` reading `themeConfig.settings.email` | Email only; no SMS/WhatsApp; needs SMTP config |

## Security & isolation

| Requirement | Theme developer | Codiic platform | Actual implementation | Gap / risk |
|---|---|---|---|---|
| No secrets in theme | Don't embed | — | — | Scan is manual — add to QA |
| Auth ownership | Never implement | Injected auth + bcrypt records | `webpanelStorefrontTravelController.js` (`bcrypt`, `sessionToken` on travellers record) | No rate-limit/CAPTCHA on `traveller-auth` (brute-force surface) |
| Admin API protection | — | `protect` + `assertStoreForUser` (`{_id,userId}`) + `industryGate` | `webpanelAuth.middleware.js`, `sector.js` | Verified |
| Public surface | Public pages only | theme-site + storefront GETs public; POSTs create records only | `webpanelStorefront.js` | Enquiry endpoint is public POST — spam control absent |
| Isolation | — | workspace-scoped queries; store-scoped config | `SectorRecord.workspace`, `…InstalledTheme.store`, `…ThemeConfig.store` | Verified |
