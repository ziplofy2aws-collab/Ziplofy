# Content runtime APIs

APIs a **valid Informatic remote theme** must **consume** at runtime (and in the editor where pickers need live data) so required pages and content sections work — not static mocks.

Pages that need these: [Required pages.md](./Required%20pages.md).

Informatic themes **do not** consume commerce product / collection / cart APIs. For those, see [../catalog-theme/E-commerce runtime APIs.md](../catalog-theme/E-commerce%20runtime%20APIs.md).

---

## Quick map — area → what to consume

| Area | What the theme must be able to do |
| --- | --- |
| **Pages / CMS** | Fetch CMS / static pages by slug (about, privacy, terms, custom pages) when content is API-backed |
| **Blogs / articles** | List posts · fetch post by slug · optional categories / comments |
| **Menus** | Resolve linked site menu items (label + href) for header / nav |
| **Lead generation forms** | Load linked workspace form fields · submit on contact section |
| **Site utilities** | Submit contact form · newsletter subscribe |

---

## Blogs / articles

| Capability | Used for | Notes |
| --- | --- | --- |
| List posts (by site / workspace) | Blog index · featured article sections | `GET /api/storefront/:storeId/blog-posts` |
| Post by slug | **Blog post details** (`blog_post` template) | `GET /api/storefront/:storeId/blog-posts/by-slug/:slug` |
| List blogs | Blog index filters · breadcrumb parent | `GET /api/storefront/:storeId/blogs` |
| Optional: categories / tags | Filters on blog index | |
| Optional: comments R/W | Blog post when enabled | |

**Primary blog post route (webpanel Informatic host):** `/blog/{postSlug}` where `postSlug` is the post `urlHandle`.

**Preview:** append `?preview=1` (or `preview=true`) to load hidden posts in theme editor / admin preview links.

**Editor — blog post details preview picker**

When the merchant edits the `blog_post` template, the Informatic theme editor sidebar shows **Preview blog post** (mirrors catalog theme editor):

| Behavior | Detail |
| --- | --- |
| When shown | Sidebar **Sections** tab while preview page = `blog_post` |
| Data | Store blogs + blog posts from admin APIs |
| Selection | `{ blogHandle, postHandle }` — **editor React state only**, not schema/config |
| Canvas | Live preview fetches post via storefront `by-slug` API and renders in `BlogPostPage` |
| Default | Auto-select first visible post with valid handles |
| External link | Open storefront `/blog/{postHandle}?preview=1` in new tab |

Do **not** add preview-picker fields to `theme.schema.json`. Schema stays limited to editable section settings (wrapper colors, typography on fallback demo copy, etc.).

**Editor:** if a section features specific articles (carousel, featured posts), expose **Select article(s)** loaded from the store post list — not hardcoded-only demo titles.

---

## Pages / CMS

| Capability | Used for | Notes |
| --- | --- | --- |
| Page by slug | Privacy, terms, about (when CMS-backed) | Theme may also keep static copy in config for simple packs |
| List pages | Optional page pickers | |

Packs may ship **static** privacy/terms copy in `theme.default-config.json` for install defaults, but if the host has CMS pages, prefer API content when linked.

---

## Menus

| Capability | Used for | Notes |
| --- | --- | --- |
| List store menus | Theme editor header/footer menu picker | `GET /api/stores/:storeId/menus` |
| Menu + items by id | Apply menu to theme config | `GET /api/stores/:storeId/menus/:menuId` |
| Site menu items (label + href) | Header / nav that links a site menu | Config stores menu id + `settings.items`; runtime reads items — do not hardcode-only nav |

**Theme editor:** Header → Menu block → **Menu** field uses `widget: "menu"` and must offer **Replace / Edit / Create** against store menus (see [Menus.md](./Menus.md)). On apply, write menu id + `{ label, href }[]` snapshot into config.

---

## Lead generation forms

| Capability | Used for | Notes |
| --- | --- | --- |
| List workspace forms | Theme editor contact **Lead generation form** picker | `GET /api/forms` (authenticated workspace) |
| Form definition by id | Render linked form on contact section | `GET /api/storefront/:storeId/lead-gen-forms/:formId` |
| Submit linked form | Contact page when `settings.formId` is set | `POST /api/storefront/:storeId/lead-gen-forms/:formId/submit` |
| Public form (fallback) | Editor preview without store | `GET /api/forms/:id/public` |

**Theme editor:** Contact section → **Lead generation form** field uses `widget: "form"` (see [Forms.md](./Forms.md)). **Also:** sidebar **Add section → Lead generation form** on any page template.

**Runtime:** Pages render from `templates.{pageId}.section_order`. Section type `lead-gen-form` loads dynamic fields from the linked form. Contact section may still use built-in submit when no form is linked.

---

## Site utilities

| Capability | Used for | Notes |
| --- | --- | --- |
| Contact form submit | Built-in contact sections (no linked form) | `POST /api/storefront/:storeId/contact-form-submissions` |
| Lead gen form submit | Contact section when `formId` linked | `POST /api/storefront/:storeId/lead-gen-forms/:formId/submit` |
| Newsletter subscribe | Email signup sections | |

---

## By required page (cheat sheet)

| Page template | Must consume |
| --- | --- |
| `index` | Menus; blogs/articles as sections need |
| `about` / `features` / `pricing` / `faq` | Config + optional CMS page by slug |
| `blog_list` | List posts |
| `blog_post` | Post by slug (**blog post details page**) + editor preview picker |
| `contact` | Linked lead-gen form **or** built-in contact submit + config for address / email display |
| `privacy` / `terms` | CMS page by slug **or** config HTML/markdown |
| `search` | Content / post search when implemented |
| `404` | (none required) |

---

## Out of scope (commerce)

Do **not** treat these as Informatic validity requirements:

- Products · collections · cart · checkout  
- Orders · customer addresses · commerce search  

Those belong to **catalog** remote themes.

---

## Validity

An Informatic remote theme is **not valid** if required content pages only show hardcoded demo articles/menus and never call these site-scoped APIs (or equivalent SDK / host endpoints) for the live site — when those surfaces are meant to be dynamic.

← Back to [Introduction.md](./Introduction.md)
