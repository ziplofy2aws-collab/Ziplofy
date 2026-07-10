# create-theme

Everything for **Create theme** (`/themes/create`) lives under this folder — including editor chrome (sidebar, header, live preview), not the dev theme editor.

## Folder layout

```
create-theme/
├── CreateThemePage.tsx
├── chrome/                    # Header, page picker, live preview, CSS
│   ├── create-theme-chrome.css
│   ├── CreateThemeHeader.tsx
│   ├── CreateThemePagePicker.tsx
│   ├── CreateThemeLivePreview.tsx
│   └── PreviewStatus.tsx
├── sidebar/                   # Forked Shopify-style sidebar (independent of dev editor)
│   ├── CreateThemeEditorSidebar.tsx
│   ├── create-theme-sidebar.tree.ts
│   ├── create-theme-structure-order.ts
│   └── insert-context.ts
├── shell/                     # Add section/block modals + settings panel
├── blocks/                    # Block catalog (preview, editing)
├── {element-id}/              # Section catalog folders
└── utils/                     # Page menu, selection hints (create-theme scoped)
```

**Dev theme editor** (`/themes/dev-editor`) still uses `components/themes/theme-editor-sidebar/` — create-theme does not import those UI modules.

## Regenerate section/block folders

```bash
node scripts/generate-create-theme-elements.mjs
node scripts/generate-create-theme-blocks.mjs
```

Re-fork sidebar internals after large dev sidebar changes:

```bash
node scripts/fork-create-theme-sidebar.mjs
```

## Live storefront + editor canvas UI

- Composer: `runtime/` walks `themeConfig` and mounts section runtimes from each element folder.
- Implemented runtimes: `header/runtime`, `announcement-bar/runtime`, `divider/runtime` (more sections show a placeholder until ported).
- render-store loads `@codiic/create-theme/runtime` when `isStoreCustomTheme` (no `theme.js`).

## Pack load

- `loadCreatorThemeEditorPack`
- Config insert: `utils/theme-editor-insert-section.ts`
