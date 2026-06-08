# create-theme (copied from Ziplofy)

Section catalog, presets, and registry — synced from `Ziplofy/src/create-theme`.

**Live storefront preview today:** when `appliedCustomThemeId` is set, render-store loads the saved
`themeConfig` JSON from the API and renders it with the **Horizon** bundle
(create-theme composer in render-store, no theme.js).

Re-copy after element changes:

```bash
node scripts/copy-create-theme-to-render-store.mjs
```

Admin-only UI (not copied): `chrome/`, `sidebar/`, `shell/`, `CreateThemePage.tsx`.
