# Menus

## Default main menu (minimum)

An Informatic site should ship a sensible default main menu. Minimum:

- Home → `/`
- About → `/about`
- Features → `/features` (or Services → `/services` if the pack uses that label)
- Blog → `/blog` (or `/blogs/all` if the host uses that route)
- Contact → `/contact`

Packs may add Privacy / Terms in the **footer** menu rather than the main nav.

---

## Editable site menus (required)

Same contract as catalog store menus — Informatic calls them **site menus**.

Every valid Informatic pack must wire header (and footer menu columns) so merchants can **choose a menu they created** in Online Store → Menus — mirroring the **catalog theme editor** header menu flow.

### Schema (pack)

1. **Header menu block** — `sections.header.blocks.menu` with:
   - `settings.menu` — stores the selected store menu id (`widget: "menu"`, `sidebar: true`)
   - `settings.menuName` — display name snapshot (`sidebar: false`)
   - `settings.items` — `{ label, href }[]` snapshot written when a menu is applied (`sidebar: false` on item fields)
2. **Footer menu blocks** — same pattern for each footer menu column (`sections.footer.blocks.menu`, `sections.footer.blocks.legal`, …).

Hardcoded-only nav that ignores linked menu items is **not valid**.

### Runtime (theme)

Header (and footer menu columns) read **`settings.items`** from config — not hardcoded link arrays.

When the host supports live menu sync, items may also be resolved from the stored menu id at runtime; until then, the config snapshot from the editor apply step is authoritative for preview and publish.

### Theme editor — header menu picker (required)

When the merchant selects **Layout → Header → Menu** in the Informatic theme editor, the settings panel must show a **Menu** control identical in behavior to the catalog theme editor:

| Action | Behavior |
| --- | --- |
| **Replace** | Dropdown list of menus created in **Online Store → Menus** for the active store |
| **Edit** | Opens inline sheet to edit the selected menu’s items; on save, refreshes header preview |
| **Create** | Opens inline sheet to create a new menu; on save, applies it to the header |
| **Apply** | Writes `settings.menu` (menu id), `settings.menuName`, and `settings.items` (`{ label, href }` rows) into theme config |
| **Preview** | Header nav in the canvas updates immediately after apply |

**Navigation path in editor:** Sections tab → **Layout** → **Header** → **Menu** block → **Menu** field.

Footer menu blocks use the same **Menu** picker on their respective `settings.menu` fields.

**Do not** expose per-link label/href text inputs in the sidebar for store-linked menus — links come from the chosen menu. Manual link rows are only for pack dev fallback when no store is selected.

Related APIs: [Content runtime APIs.md](./Content%20runtime%20APIs.md) → Menus.

---

## Validity checklist (menus)

| Requirement | Valid | Invalid |
| --- | --- | --- |
| Header has `menu` block with `widget: "menu"` on `settings.menu` | ✓ | Missing menu block or wrong widget |
| Editor shows Replace / Edit / Create menu picker | ✓ | Manual-only link text fields for production nav |
| Apply writes menu id + items snapshot to config | ✓ | Menu id stored but items never updated |
| Runtime renders from `settings.items` | ✓ | Hardcoded nav ignoring config |

← Back to [Introduction.md](./Introduction.md)
