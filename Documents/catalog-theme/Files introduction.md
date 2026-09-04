# Files introduction

How a **remote theme** pack is organized on disk — folders and files, and what each one means.

Example pack root: `remote-themes/{themeId}/` (e.g. `remote-themes/watch/`).

---

## Folder map (short)

```
remote-themes/{themeId}/
├── theme.manifest.json          # Pack ID card
├── theme.schema.json            # What merchants can edit
├── theme.default-config.json    # Default values on install
├── package.json                 # Build / deps for this pack
├── vite.config.ts               # Bundler config → theme.js / theme.css
├── tsconfig.json                # TypeScript config
├── public/
│   └── assets/                  # Pack demo images, fonts, static media
├── scripts/                     # Pack maintenance scripts (optional)
├── src/                         # Theme source (React runtime)
│   ├── index.ts                 # Bundle entry — exports the theme
│   ├── contract.ts              # Shared types / editor contract helpers
│   ├── theme.css                # Global theme styles
│   ├── tokens.tsx               # Design tokens (colors, type, …)
│   ├── pages/                   # Page template routes / shells
│   ├── sections/                # Section UI (heroes, products, …)
│   ├── layout/                  # Header, footer, announcement, …
│   ├── components/              # Shared UI pieces
│   ├── lib/                     # Styles, helpers, config readers
│   └── shell/                   # App shell / providers wiring
└── dist/                        # Build output (theme.js, theme.css, copied JSON)
```

---

## Core pack files (required)

These three JSON files plus the built JS/CSS are what the platform loads.

| File | What it is |
| --- | --- |
| **`theme.manifest.json`** | Pack **identity & inventory**: `id`, `name`, `version`, type (`react-remote`), paths to JS/CSS/schema/config, list of **page templates**, capabilities, block/section type labels. → *Who is this theme, and what does it ship?* |
| **`theme.schema.json`** | **Editor blueprint**: global settings fields, templates → sections (`category`, `settingsFields`, blocks, widgets). Drives the catalog / Create Theme sidebar. Does **not** store merchant values. → *What can be edited, and how?* |
| **`theme.default-config.json`** | **Default config**: real starting values (colors, copy, image URLs, product/collection ids, section order). Applied on install until the merchant saves their own. → *What does it look like out of the box?* |

How they work together:

```
manifest  →  discover pack + templates + asset paths
schema    →  build editor sidebar / field widgets
config    →  render preview & live storefront values
```

---

## Build & tooling files

| File / folder | What it is |
| --- | --- |
| **`package.json`** | Pack package name, scripts (`build`, local sync), peer deps (React, router). |
| **`vite.config.ts`** | Bundles `src` into the remote runtime assets (`theme.js`, `theme.css`). |
| **`tsconfig.json`** | TypeScript compiler options for the pack. |
| **`scripts/`** | Optional one-off / maintenance scripts (enrich schema, sync local preview, …). Not loaded by the storefront at runtime. |

---

## Source (`src/`)

| Path | What it is |
| --- | --- |
| **`src/index.ts`** | Entry point the bundler uses; exports the remote theme module the host loads. |
| **`src/contract.ts`** | Types / helpers shared with the host editor contract. |
| **`src/theme.css`** | Global CSS for the pack. |
| **`src/tokens.tsx`** | Design tokens (colors, fonts, spacing) used across sections. |
| **`src/pages/`** | Page-level templates that match manifest template ids (home, product, collection, blogs, …). |
| **`src/sections/`** | Section components (e.g. bestsellers, hero, category rails) that read config settings. |
| **`src/layout/`** | Chrome shared across pages: header, footer, announcement bar, dividers. |
| **`src/components/`** | Reusable presentational pieces used by sections/layout. |
| **`src/lib/`** | Style helpers, config readers, media/URL helpers, editor attributes. |
| **`src/shell/`** | Outer shell / wiring that mounts the theme inside the host. |

Exact subfolder names can vary by pack; the roles above should stay the same.

---

## Assets & build output

| Path | What it is |
| --- | --- |
| **`public/assets/`** | Pack **demo** media (images, etc.) shipped with the theme for marketing demos. In catalog editor / live storefront these are usually hidden behind placeholders unless opted in (see [Pack demo media.md](./Pack%20demo%20media.md)). |
| **`dist/`** | Build output: `theme.js`, `theme.css`, and copies of manifest / schema / default-config for hosting or local preview. |

---

## What merchants never edit directly

Merchants change values through the **catalog theme editor** (sidebar). That writes into **saved theme config** (same shape as `theme.default-config.json`). They do not hand-edit schema or source files.

| Audience | Touches |
| --- | --- |
| Theme author | `src/`, JSON pack files, `public/assets/`, build |
| Platform | Loads `manifest` → assets + schema + config |
| Merchant | Editor UI only → saved config |

← Back to [Introduction.md](./Introduction.md)
