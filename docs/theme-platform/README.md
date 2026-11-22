# Codiic Theme Platform — Investigation Report & Documentation Index

Verified against source on **2026-11-21**. Every claim below was traced to code; where behavior is heuristic or absent it is marked as such.

## Documents

| Doc | Contents |
|---|---|
| [01-platform-requirements.md](01-platform-requirements.md) | Universal requirements every uploaded theme must satisfy |
| [02-developer-handbook.md](02-developer-handbook.md) | Step-by-step build guide for theme developers |
| [03-responsibility-matrix.md](03-responsibility-matrix.md) | Platform vs developer responsibility matrix with implementation status |
| [04-industry-integration.md](04-industry-integration.md) | Industry registry, per-industry entities, tags, sync flows |
| [05-package-sync-spec.md](05-package-sync-spec.md) | Complete tour-package data lifecycle (dashboard → storefront → back) |
| [06-traveller-booking-sync-spec.md](06-traveller-booking-sync-spec.md) | Traveller auth, enquiry, booking and notification lifecycle |
| [07-qa-checklist.md](07-qa-checklist.md) | Acceptance testing and approval/rejection criteria |
| [08-gaps-risks.md](08-gaps-risks.md) | Missing functionality, incomplete integrations, technical risks |

## System topology (verified)

```
Theme developer ZIP/folder
        │  POST /api/informatic-themes/import-zip | /import-folder   (codiic-server, auth + 'Theme Management' permission)
        ▼
convert-static-theme.ts  ──►  heuristic section extraction
        │                     (schemaJson, defaultConfigJson, manifestJson,
        │                      themeJs, themeCss, thumbnail, warnings, report)
        ▼
S3:  informatic-themes/catalog/<themeId>/{theme/, react assets, *.json}
DB:  codiic.informatic_themes  {name, slug, plan, price, version, tags[],
                                s3Assets{contentRoot.prefix, reactTheme*, thumbnail},
                                manifestSummary, isActive, uploadBy}
        │
        │  webpanel catalog picker ── GET /api/informatic-themes (proxied by wabapanel-express)
        ▼
wabapanel: webpanel_informatic_installed_themes  {store, informaticThemeId, installedAt, uninstalledAt}
           webpanel_stores.appliedTheme
           webpanel_store_informatic_theme_configs  {store, themeId, config}   ← editor saves
        │
        │  storefront render path
        ▼
webpanel-store-renderer (:3003)
  host ─► GET /api/store-subdomain/check?host=<host>      (subdomain | customDomain → storeId)
        ─► GET /api/storefront/:storeId/informatic-theme-runtime
              resolveStoreInformaticThemeRuntime()
                = installed? → editor-pack → merge savedConfig → injectInformaticDataSources
                → { themeConfig, remoteThemeJsUrl, remoteThemeCssUrl, staticSiteUrl }
        │
        ├─ staticSiteUrl present (uploaded static theme)
        │     → <iframe src="/api/storefront/:storeId/theme-site/:themeId/">
        │     → theme-site serves ORIGINAL files and injects:
        │         <base href> · live package cards · JS data-file rewrite
        │         detail-page record map · saved-config overrides ·
        │         editor bridge · traveller login widget · enquiry script
        │
        └─ no staticSiteUrl (remote React theme)
              → renderer loads remoteThemeJsUrl + themeConfig (contract render)
```

## Key verified facts (headline findings)

1. **Upload is real conversion, not a zip store.** `convert-static-theme.ts` parses HTML with a lite DOM parser, heuristically classifies sections (hero, stats, features, testimonials, pricing, CTA, rich text), emits `theme.schema.json` + `theme.default-config.json` + `theme.manifest.json` + a React bundle pair (`themeJs`/`themeCss`) — alongside preserving the original files under `s3Assets.contentRoot.prefix`.
2. **Two render paths coexist.** Uploaded static themes render their *original* HTML/CSS/JS through `/api/storefront/:storeId/theme-site/:themeId/*`; remote React themes render through `remoteThemeJsUrl` + merged config. The path chosen depends solely on `s3Assets.contentRoot.prefix`.
3. **Live data injection is server-side, at serve time, never cached into the theme.** Package records are fetched per request (`status:'active'`, non-archived, store's records workspace), then mapped into (a) JS data arrays, (b) hard-coded card markup, (c) contract config blocks. Edits appear on the next request — no build/deploy needed.
4. **Enquiry and booking are SEPARATE SectorRecord entities**, not states. `enquiries` (ENQ-####) converts to `bookings` (TVL-####, status `pending`) via `POST /api/sector/:industry/enquiries/:id/convert`; staff then flips status via `POST /api/sector/:industry/:entity/:id/status`.
5. **Traveller auth is platform-injected** — a script added to every served HTML page of the applied travel theme. Themes never implement auth. Signup creates a `travellers` SectorRecord (bcrypt hash) + session token.
6. **Customer visibility is dual-channel**: injected "My trips" panel (session token + email → `/traveller-trips`) and SMTP email on convert/confirm/cancel (`travelBookingNotify.util.js` reading `themeConfig.settings.email`).
7. **Industry gating is real but asymmetric.** `tour_travel` is the only industry with full storefront sync (packages + enquiry + auth + trips). Healthcare has only a bespoke `GET /api/storefront/:storeId/clinic` (doctors + booking slug, featureOverride-gated). Education and all other webpanel industries have **no** storefront sync layer at all — they get the static site + contract data only.
8. **Ownership isolation is enforced** by `{_id, userId}` store lookup (`assertStoreForUser`) for admin routes and by `store.industry`/workspace scoping for records. Cross-store data leaks are structurally prevented.
9. **Editor edits reach static themes only as content diffs** — `collectContentOverrides` maps saved-vs-default text/image paths onto the static HTML. Structural edits (reorder/add/remove sections) apply to the *contract* render only; uploaded static pages keep their layout.
10. **Theme Editor and Theme Builder are different systems.** The Theme Builder (codiic e-commerce stack) is untouched by the Informatic/uploaded-theme pipeline; the Informatic editor (`/client/themes/informatic-editor`) is the contract editor.
