# Metaobjects — Developer Guide for Ziplofy

This document explains what Shopify-style **metaobjects** are, how they relate to **metafields**, and how to implement them in Ziplofy. It matches the current codebase state (UI placeholders exist; backend is not wired yet).

---

## 1. Start with the problem (plain English)

Most of your data already has fixed shapes:

- **Product** → title, price, images, variants
- **Customer** → name, email, addresses
- **Blog post** → title, body, author

But merchants often need **custom structured data** that doesn’t fit those boxes, for example:

- “Size chart” entries (title, image, measurements table)
- “Author” profiles (name, bio, photo) used on many blog posts
- “Store locator” rows (city, address, hours, map link)
- “FAQ item” (question + answer) reused in theme sections

**Metafields** = extra fields **on one existing thing** (one product, one customer, the whole shop).

**Metaobjects** = **reusable custom “mini-records”** you define yourself, then **link** from products, themes, menus, etc.

| Concept | Real-world analogy |
|--------|---------------------|
| **Metafield** | Sticky note on **one** file folder (“this product’s care instructions”) |
| **Metaobject definition** | A blank form template (“Author profile form”) |
| **Metaobject entry** | One filled form (“Jane Doe, bio, photo”) |
| **Reference metafield** | A link from a product/blog to that filled form |

---

## 2. What Shopify calls “metaobjects” (official idea)

Shopify splits it into **two layers**:

### Layer A — Definition (the schema)

You create a **type** once, e.g. `author`, with fields:

- `name` (single line text)
- `bio` (multi-line text)
- `photo` (file)

That’s the **metaobject definition**. It answers: *“What shape is this custom data?”*

### Layer B — Entries (the data)

You create **many rows** of that type:

- Author #1: Jane
- Author #2: Bob

Each row is a **metaobject entry**.

### Layer C — Using them

You don’t usually paste author data on every blog post. You add a **metafield** on the blog post:

- Namespace: `custom`
- Key: `author`
- Type: **metaobject reference** → points to one `author` entry

So the full chain is:

```
Definition (schema)  →  Entries (rows)  →  Referenced from product/blog/theme via metafields
```

---

## 3. Metafields vs metaobjects (don’t mix them up)

| | **Metafield** | **Metaobject** |
|---|---------------|----------------|
| **What** | One custom field on a resource | A custom resource type you invent |
| **Example** | `product.metafields.custom.warranty_text` | Type `size_chart` with fields image + table |
| **Cardinality** | Usually one value per resource | Many entries per type |
| **Reuse** | Tied to that product/customer | Same entry linked from many places |
| **Admin UI** | On product/customer/settings page | Content → Metaobjects list |

They work **together**: metaobjects are often **referenced by metafields**.

---

## 4. What you already have in Ziplofy (today)

### Frontend (UI only, no API yet)

| Path | What it does |
|------|----------------|
| `/content/metaobjects` | List page — **empty array**, comment says “until API connected” |
| `/settings/custom_data/metaobjects/create` | **Create definition** form (name, fields, toggles) — **no save to backend** |
| `/settings/custom_data` | “Coming soon” settings hub |
| `/settings/general/metafields` | Shop metafields placeholder |

### Backend

- Permission keys exist: `content.metaobject_definitions.view`, `create_edit`, `delete`
- **No Mongo models, controllers, or routes** for metaobjects yet

**Conclusion:** **Content → Metaobjects is left** — the Shopify-style UI is sketched; the data layer is missing.

---

## 5. How the feature should be structured (mental model)

Use **three main database concepts** (Shopify does the same logically):

```
┌─────────────────────────────┐
│  MetaobjectDefinition       │  ← “What is an Author?” (schema)
│  storeId, type, name,       │
│  fields[], options          │
└──────────────┬──────────────┘
               │ 1 : many
               ▼
┌─────────────────────────────┐
│  MetaobjectEntry            │  ← “Jane Doe” (one row)
│  definitionId, storeId,     │
│  handle, status,            │
│  fieldValues { ... }        │
└──────────────┬──────────────┘
               │ referenced by
               ▼
┌─────────────────────────────┐
│  Metafield (optional phase) │  ← product.blog.custom.author → entryId
│  ownerType, ownerId,        │
│  namespace, key, value      │
└─────────────────────────────┘
```

- **Phase 1** = definitions + entries (what Content → Metaobjects needs).
- **Phase 2** = metafields on product/customer/shop that can **reference** entries.
- **Phase 3** = storefront/theme reads them (Liquid/API equivalent in your theme runtime).

---

## 6. Suggested MongoDB models (Ziplofy3b style)

### Model 1: `MetaobjectDefinition`

Defines the **type** (schema).

```ts
// metaobject-definition.model.ts
{
  storeId: ObjectId,           // required, multi-tenant
  name: string,                // "Author" (display)
  type: string,                // handle: "author" (unique per store)
  description?: string,

  fields: [
    {
      key: string,             // "bio" (slug from label)
      label: string,           // "Bio"
      type: string,            // single_line_text | file | product_reference | ...
      required: boolean,
      list: boolean,           // one vs list (Shopify cardinality)
      validations?: { min?, max?, choices? },
      position: number,
    }
  ],

  options: {
    activeDraftStatus: boolean,
    translations: boolean,
    publishAsWebPages: boolean,      // Shopify: online store URL per entry
    storefrontApiAccess: boolean,
    customerAccountApiAccess: boolean,
  },

  createdAt, updatedAt
}

// Index: { storeId: 1, type: 1 } unique
```

This maps 1:1 to the existing `MetaobjectDefinitionCreatePage` form in the admin app.

---

### Model 2: `MetaobjectEntry`

One **instance** of a definition.

```ts
// metaobject-entry.model.ts
{
  storeId: ObjectId,
  definitionId: ObjectId,      // which schema
  definitionType: string,      // denormalized "author" for fast queries

  displayName: string,         // admin list title (often from a field or handle)
  handle: string,              // "jane-doe" (unique per store + type)

  status: 'active' | 'draft',

  // Actual values — keyed by field.key from definition
  fieldValues: {
    name: "Jane Doe",
    bio: "Writer...",
    photo: "https://cdn.../jane.jpg",   // or cloud storage file id
  },

  // Optional if publishAsWebPages
  seo?: { title?, description? },

  createdAt, updatedAt
}

// Index: { storeId: 1, definitionType: 1, handle: 1 } unique
// Index: { storeId: 1, definitionId: 1 }
```

**Important:** Store values in a flexible `fieldValues` object, but **validate on save** using the definition’s `fields[]` (type checks, required, list, references).

---

### Model 3: `MetafieldDefinition` (later, for product/customer/shop)

Defines *allowed* custom fields on a resource:

```ts
{
  storeId,
  ownerType: 'product' | 'customer' | 'shop' | 'collection' | 'blog_post' | ...,
  namespace: string,           // e.g. "custom"
  key: string,                 // e.g. "author"
  type: string,                // single_line_text | metaobject_reference | ...
  metaobjectDefinitionType?: string,  // if type is metaobject_reference → "author"
  ...
}
```

---

### Model 4: `Metafield` (the actual value on a resource)

```ts
{
  storeId,
  ownerType: 'product',
  ownerId: ObjectId,           // product _id
  namespace: 'custom',
  key: 'author',
  type: 'metaobject_reference',
  value: ObjectId,             // → MetaobjectEntry._id
  // OR for simple types: valueString, valueNumber, valueJson, etc.
}
```

You can start **without** metafields and still ship metaobjects list + CRUD. Metafields connect metaobjects to products/themes later.

---

## 7. API design (admin)

Mirror patterns you already use (collections, blog, cloud storage):

| Method | Route | Purpose |
|--------|--------|---------|
| GET | `/api/metaobject-definitions/store/:storeId` | List definitions (Content page) |
| POST | `/api/metaobject-definitions` | Create definition |
| GET | `/api/metaobject-definitions/:id` | One definition |
| PUT | `/api/metaobject-definitions/:id` | Update (careful: changing field types is hard) |
| DELETE | `/api/metaobject-definitions/:id` | Delete if no entries (or cascade policy) |
| GET | `/api/metaobject-entries?storeId=&definitionId=` | List entries |
| POST | `/api/metaobject-entries` | Create entry |
| GET | `/api/metaobject-entries/:id` | One entry |
| PUT | `/api/metaobject-entries/:id` | Update |
| DELETE | `/api/metaobject-entries/:id` | Delete |

**Storefront (read-only, later):**

| Method | Route | Purpose |
|--------|--------|---------|
| GET | `/api/storefront/metaobjects/:type/:handle` | Public entry for theme |
| GET | `/api/storefront/metaobjects/:type` | List (if exposed) |

Always use store ACL (e.g. `assertStoreAccess`) like collections and products.

---

## 8. Admin user flow (what the merchant does)

```
1. Content → Metaobjects → "Add definition"
2. Name: "Author", add fields (name, bio, photo)
3. Save → MetaobjectDefinition in DB
4. Back on list → click "Author" → see entries
5. "Add entry" → fill Jane Doe → save MetaobjectEntry
6. (Later) On blog post → metafield "Author" → pick Jane from dropdown
7. (Later) Theme section reads author.bio on storefront
```

The UI already covers **steps 1–2** visually; you need **API + list/detail entry pages** for steps 3–5.

---

## 9. Validation flow (developer detail)

On **create/update entry**, the server should:

1. Load `MetaobjectDefinition` by `definitionId`
2. For each field in definition:
   - If `required` and missing → 400
   - If `type === 'file'` → validate URL against store cloud registry (same as product images)
   - If `type === 'product_reference'` → ensure product belongs to store
   - If `list === true` → value must be array
3. Generate `handle` from display name if empty
4. Save `fieldValues` as JSON

On **update definition**:

- Adding new fields → OK
- Removing fields → OK (orphan data in old entries — hide or migrate)
- Changing field **type** → dangerous; Shopify often blocks or warns

---

## 10. How this connects to theme / storefront

In Shopify, theme does:

```liquid
{{ product.metafields.custom.author.value.bio }}
```

In Ziplofy you would eventually:

1. When rendering product/blog, **resolve metafields** on that resource
2. If value is `metaobject_reference`, **populate** the entry (and maybe nested references)
3. Pass to theme runtime as part of `themeConfig` or page context

For **create-theme** sections (e.g. “Featured authors”):

- Section setting type: `metaobject_list` of type `author`
- Editor loads entries from API for picker
- Preview renders section component with entry data

That’s **phase 3**; not required to ship admin metaobjects.

---

## 11. Suggested implementation phases for Ziplofy

### Phase 1 — MVP (finish Content → Metaobjects)

- Backend: `MetaobjectDefinition` + `MetaobjectEntry` models, CRUD, store ACL
- Wire `ContentPage` list to GET definitions
- Wire `MetaobjectDefinitionCreatePage` Save → POST definition
- New pages: definition detail + entry list + entry create/edit
- Permissions: use existing `content.metaobject_definitions.*`

**Outcome:** Merchant can define types and add rows. **No theme integration yet.**

### Phase 2 — Metafields on resources

- `MetafieldDefinition` + `Metafield` models
- Product/blog “custom fields” UI
- `metaobject_reference` picker (dropdown of entries by type)

### Phase 3 — Storefront + theme editor

- Storefront API to read entries
- Theme sections reference metaobjects
- Optional: “Publish as web pages” → `/pages/metaobjects/author/jane-doe`

---

## 12. File map (where code would live)

### Backend (`Ziplofy3b`)

```
src/models/metaobject/
  metaobject-definition.model.ts
  metaobject-entry.model.ts
src/controllers/
  metaobject-definition.controller.ts
  metaobject-entry.controller.ts
src/routes/
  metaobject-definition.route.ts
  metaobject-entry.route.ts
```

Register routes in `src/index.ts` and export models from `models/index.ts`.

### Frontend (`Ziplofy`)

```
src/contexts/metaobject-definition.context.tsx
src/contexts/metaobject-entry.context.tsx
src/pages/ContentPage.tsx                              ← wire list (already exists)
src/pages/settings/MetaobjectDefinitionCreatePage.tsx    ← wire save
src/pages/MetaobjectDefinitionDetailsPage.tsx            ← new
src/pages/MetaobjectEntryEditPage.tsx                    ← new
```

---

## 13. One example end-to-end

**Merchant wants “Size chart” on products.**

1. **Definition** `size_chart`: fields `title`, `image`, `measurements` (json or rich text)
2. **Entries**: “Men’s tops”, “Women’s dresses”, …
3. **Metafield** on product: `custom.size_chart` → type `metaobject_reference` → definition `size_chart`
4. **Product “Blue T-Shirt”** → metafield points to entry “Men’s tops”
5. **Storefront product page** → theme reads metafield → renders size chart block

Without metaobjects you’d duplicate size chart data on every product or hard-code it in the theme. Metaobjects make it **one source of truth, many links**.

---

## 14. Short answers (FAQ)

| Question | Answer |
|----------|--------|
| **What are Shopify metaobjects?** | Custom content types you define (schema + many rows), reusable across the store. |
| **Is Content → Metaobjects what’s left?** | Yes — UI shell exists; **backend + wiring + entry management** are missing. |
| **What models do we need minimum?** | `MetaobjectDefinition` + `MetaobjectEntry`. Metafields come later for linking to products/blogs. |
| **How do we structure it?** | Definition = schema per store. Entry = row. Metafield = pointer from product/blog to entry (phase 2). |

---

## 15. Field types (align with existing create UI)

The admin `MetaobjectDefinitionCreatePage` already lists these field types. Use the same enum on the backend:

| Value | Label |
|-------|--------|
| `single_line_text` | Single line text |
| `multi_line_text` | Multi-line text |
| `integer` | Integer |
| `decimal` | Decimal |
| `file` | File |
| `date` | Date |
| `date_time` | Date and time |
| `url` | URL |
| `json` | JSON |
| `color` | Color |
| `boolean` | True or false |
| `product_reference` | Product reference |
| `collection_reference` | Collection reference |

Later you may add `metaobject_reference` for nested metaobjects.

---

## 16. Definition options (from create form)

These toggles on `MetaobjectDefinitionCreatePage` should persist on `options`:

| Option | Meaning |
|--------|---------|
| **Active/draft status** | Entries can be draft vs published |
| **Translations** | Multi-locale field values (future) |
| **Publish as web pages** | Each entry gets a storefront URL |
| **Storefront API access** | Entries readable on storefront |
| **Customer account API access** | Entries readable in customer account area |

---

## 17. Security checklist

- Every admin route: `assertStoreAccess(req, storeId)`
- Whitelist fields on create/update (no arbitrary `fieldValues` keys beyond definition)
- File URLs: `assertOptionalStoreCloudImageUrl` / store cloud registry (same as collections)
- Product/collection references: verify IDs belong to the same store
- Storefront routes: only expose entries where `options.storefrontApiAccess === true` and `status === 'active'`
- Permissions: gate UI with `content.metaobject_definitions.*` (already seeded)

---

## 18. Related routes in the app today

| Route | Status |
|-------|--------|
| `GET /content/metaobjects` | List UI — needs API |
| `GET /settings/custom_data/metaobjects/create` | Create definition UI — needs POST |
| `GET /settings/custom_data` | Coming soon hub |
| `GET /settings/general/metafields` | Shop metafields placeholder |

---

## 19. Recommended next step

Implement **Phase 1** in this order:

1. `MetaobjectDefinition` model + CRUD API
2. Wire create definition form + content list
3. `MetaobjectEntry` model + CRUD API
4. Definition detail page with entry list + entry editor

That completes the Content → Metaobjects feature for merchants without waiting on metafields or theme work.

---

*Last updated: May 2026 — Ziplofy monorepo (`Ziplofy` admin + `Ziplofy3b` API).*
