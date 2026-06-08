# Horizon theme pack — editor benchmark

This pack is the **reference schema** for Ziplofy section-based theme editors. New themes (Studio, Volt, etc.) should mirror this structure.

## Files

| File | Purpose |
|------|---------|
| `theme.schema.json` | Every editable path, label, type, widget, group, and nested block for the sidebar + bottom settings sheet |
| `theme.default-config.json` | Default values merged with store overrides in production |
| `theme.manifest.json` | Templates, block catalog, capabilities |
| `create-theme/*/runtime/` | Live section UI; render-store composer reads `themeConfig` (no theme.js) |

## Regenerate after changes

```bash
node scripts/build-horizon-benchmark-schema.mjs
```

Add runtimes under `Ziplofy/src/create-theme/{element}/runtime/`.

## Schema layout

- **globalSettings** — colors, typography, spacing
- **layout** — `announcement_bar`, `header`, `footer`, `footer_utilities` (global sections)
- **templates** — `index`, `product`, `cart`, `login`, `signup`, `forgot_password`, `profile`, `orders`, `preferences`

Each section can have `settingsFields`, `blocks` (with nested `blocks`), and matching paths in `theme.default-config.json` under `sections.*` or `templates.{id}.sections.*`.

## Announcement bar

Section-level settings use grouped widgets (General, Appearance, Padding, Custom CSS). Message copy lives on the **Announcement** block (`blocks.announcement.settings.text`).

## Field coverage

The benchmark schema includes **300+** field definitions: every path used in create-theme / theme runtimes plus editor-only options (e.g. hero `backgroundTone`, product `trust_badges`) for future UI work.
