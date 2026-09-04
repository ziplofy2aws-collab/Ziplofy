# Lead generation forms

Every valid **Informatic** remote theme must let merchants **place a lead generation form on any page** — not only on the Contact template.

Forms are created in the web panel (**Forms** — `/client/forms`). The theme editor provides an insertable **Lead generation form** section and a **form picker** on each instance.

Related: [Content runtime APIs.md](./Content%20runtime%20APIs.md) · [Required pages.md](./Required%20pages.md) · [Informatic sidebar.md](./Informatic%20sidebar.md)

---

## Core requirement (validity)

A valid Informatic theme **must**:

1. Declare **`lead-gen-form`** in **`sectionCatalog`** (insertable section type)
2. Render pages from **`templates.{pageId}.section_order`** — not hardcoded-only section lists
3. Implement **`LeadGenFormSection`** (or equivalent) that loads + submits a linked workspace form
4. Expose the theme editor **Add section → Lead generation form** flow on every content page template

Merchants must be able to **add**, **configure** (pick form + heading/copy), and **remove** lead-gen form sections on Home, About, Features, Pricing, Contact, FAQ, etc.

The Contact page may **also** keep its built-in contact section (name / email / message + optional linked form). The insertable **`lead-gen-form`** section is the primary pattern for “put a form anywhere.”

---

## Schema (pack)

### Insertable section catalog

Root-level **`sectionCatalog`** entry:

| Field | Purpose |
| --- | --- |
| `type` | `lead-gen-form` |
| `label` | “Lead generation form” |
| `insertable` | `true` |
| `settingsFields` | Form picker + heading / subheading / button / container colors |

When inserted, the editor creates a unique instance id (e.g. `lead_gen_form_m2abc`) under:

- `templates.{pageId}.sections.{instanceId}`
- `templates.{pageId}.section_order[]`

### Per-instance settings

| Field | Purpose | Editor |
| --- | --- | --- |
| `settings.formId` | Selected workspace form id | `widget: "form"`, `sidebar: true` |
| `settings.formName` | Display name snapshot | `sidebar: false` |
| `settings.heading` / `subheading` | Section copy | `styled-text` |
| `settings.primaryLabel` | Submit button label | `styled-text` |
| `settings.primaryCta*` | Button chrome | `button` widget |
| `settings.backgroundColor` / `textColor` | Container | color |

---

## Theme editor — add form anywhere (required)

| Action | Behavior |
| --- | --- |
| **Add section** | Sidebar footer → **Lead generation form** on the current page |
| **Replace form** | Section settings → **Lead generation form** picker (Forms list) |
| **Create** | Opens `/client/forms` in a new tab |
| **Remove** | **Remove** on insertable section rows in the sidebar tree |
| **Apply** | Writes `formId` + `formName` + section copy into config |
| **Preview** | Canvas renders linked form fields immediately |

**Navigation:** Sections tab → choose page (Home, About, …) → **Add section** → **Lead generation form** → pick form in settings.

Do **not** expose manual field editing for linked forms — fields come from the Forms builder.

---

## Runtime (theme)

### Page rendering

Each page template component must render:

```text
templates.{templateId}.section_order  →  section type registry  →  section component
```

### Lead-gen form section

When `settings.formId` is set:

1. Fetch form definition (`GET` storefront or public form API)
2. Render dynamic fields
3. Submit (`POST` storefront lead-gen form API)

When `formId` is empty, show an editor/storefront placeholder prompting the merchant to select a form.

### Contact section (optional dual mode)

The fixed **Contact** section may still support:

- Built-in name / email / message → `POST /api/storefront/:storeId/contact-form-submissions`
- **Or** linked form via `settings.formId` (legacy / convenience on Contact page only)

---

## Storefront APIs (host)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/storefront/:storeId/lead-gen-forms/:formId` | Form definition (store-scoped) |
| `POST` | `/api/storefront/:storeId/lead-gen-forms/:formId/submit` | Submit linked form |
| `POST` | `/api/storefront/:storeId/contact-form-submissions` | Built-in contact section only |

Editor preview may use `GET /api/forms/:id/public` when no store is selected.

### SDK

- `useStorefrontLeadGenForm()` — `loadForm(formId)`, `submitForm(formId, values)`
- `useStorefrontContactForm()` — built-in contact submit

---

## Validity

An Informatic remote theme is **not valid** if:

- Merchants cannot **insert** a lead-gen form section on arbitrary pages, or
- Inserted sections ignore `formId` and never call lead-gen form APIs, or
- Pages ignore `section_order` and only render a fixed hardcoded section list

← Back to [Remote themes criteria.md](./Remote%20themes%20criteria.md)
