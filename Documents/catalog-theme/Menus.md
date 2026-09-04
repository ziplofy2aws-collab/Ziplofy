# Menus

## Default main menu (minimum)

- Home → `/`
- All products → `/collections/all`
- All collections → `/collections`
- All blogs → `/blogs/all`

## Editable store menus (required)

1. **Schema** — Header has a `menu` block with `settings.menu` (renders from `settings.items`).
2. **Editor** — Header → Menu → Create / Replace / Edit store menus.
3. **Apply** — Writes menu id + `{ label, href }` rows into config (`sections.header.blocks.menu.settings.items`).
4. **Runtime** — Header (and any nav using that menu) reads `settings.items` from config.

Hardcoded-only nav that ignores linked menu items is **not valid**.

Related APIs: [E-commerce runtime APIs.md](./E-commerce%20runtime%20APIs.md) → Menus.

← Back to [Introduction.md](./Introduction.md)
