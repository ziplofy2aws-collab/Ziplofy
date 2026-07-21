# Theme editor — global section catalog

## `section-element-catalog.json` (master)

**Single file** listing every theme editor element and how to edit it:

- **Add section** items (Hero: Marquee, Featured collection: Grid, …) with UI metadata + full `editing` defs
- **Schema-only** sections (product page, cart, login, …) not in Add section
- **Blocks** from Add block modal + schema block definitions on each section type

Regenerate after catalog or schema changes:

```bash
node scripts/generate-section-element-catalog.mjs
```

Sources merged by the generator:

| Input | Role |
|-------|------|
| `section-editing-support.json` | Fields, panels, blocks per section type |
| `section-add-catalog.manifest.json` | Add section list + insert mapping |

```ts
import { getCatalogElementById, getSectionElementCatalog } from '@/theme-editor';

const heroMarquee = getCatalogElementById('hero-marquee');
// heroMarquee.editing → fields, panels, blocks for type `hero`
```

---

## `section-editing-support.json`

Single registry of **section types** and their editor fields/panels (Horizon benchmark).

Use it when:

1. **Building a theme** — see which settings, blocks, and nested blocks a section type should expose.
2. **Theme editor runtime** — `resolveEditingPanelForNode()` loads panel fields when the merchant selects a section/block.

## Regenerate after schema changes

```bash
node scripts/generate-section-editing-support.mjs
```

Run after `node scripts/build-horizon-benchmark-schema.mjs` when Horizon editor fields change.

## Structure

```text
sectionTypes.{type}
  ├── fields[]          — section-level settings (keys only; paths built at runtime)
  ├── panels.default    — which fields/groups appear in the bottom sheet
  └── blocks.{blockId}
        ├── fields[]
        ├── panels
        └── nested.{nestedId}   — e.g. product_card → media, product_title, price
```

## Section types (Horizon benchmark)

| Type | Placement |
|------|-----------|
| `announcement-bar` | layout |
| `header` | layout |
| `divider` | layout, template |
| `footer` | layout |
| `footer-utilities` | layout |
| `hero` | template |
| `featured-collection` | template |

Import in code:

```ts
import { resolveEditingPanelForNode, getSectionEditingSupport } from '@/theme-editor';
```
