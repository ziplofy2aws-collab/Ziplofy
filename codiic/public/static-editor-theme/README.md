# Static editor theme assets

Used when **`VITE_THEME_EDITOR_STATIC_MODE=true`** and `VITE_THEME_EDITOR_STATIC_BASE_URL=/static-editor-theme`.

Place your reference theme files here:

| File | Purpose |
|------|---------|
| `theme.schema.json` | Editor sidebar schema |
| `theme.default-config.json` | Default section settings |
| `theme.manifest.json` | Templates list + block catalog |
| `theme.js` | Live preview bundle |
| `theme.css` | Live preview styles |

If `VITE_THEME_EDITOR_STATIC_BASE_URL` is unset, the editor loads the bundled pack from `src/theme-packs/{VITE_THEME_EDITOR_STATIC_PACK}/` instead (default: `makeup`).

Set preview URLs if assets are hosted elsewhere:

```
VITE_THEME_EDITOR_STATIC_JS_URL=http://localhost:5180/...
VITE_THEME_EDITOR_STATIC_CSS_URL=http://localhost:5180/...
```
