# Required page templates

Required pages for a valid installable **Informatic** remote theme. Declare each template id in `theme.manifest.json` → `templates` and implement the matching runtime route. That list is authoritative per pack. Schema also describes each template’s sections.

Pages that need live data must use the APIs documented in [Content runtime APIs.md](./Content%20runtime%20APIs.md).

Informatic themes **do not require** commerce templates (`product`, `collection`, `cart`, `orders`, …). Those belong to [catalog-theme Required pages](../catalog-theme/Required%20pages.md).

| # | Template id | Page | Typical route | What it does |
| --- | --- | --- | --- | --- |
| 1 | `index` | Home | `/` | Marketing / content home (hero, features, CTAs, …) |
| 2 | `about` | About | `/about` | Company / product story, team, mission |
| 3 | `features` | Features | `/features` | Feature / capability / service overview |
| 4 | `pricing` | Pricing | `/pricing` | Plans / pricing table (static or CMS-driven copy) |
| 5 | `blog_list` | Blog index | `/blog` or `/blogs/all` | Lists articles / posts |
| 6 | `blog_post` | **Blog post details** | `/blog/{slug}` | Single article — title, meta, featured image, HTML body |
| 7 | `contact` | Contact | `/contact` | Contact section — built-in form **or** linked lead-gen form + contact details |
| 8 | `faq` | FAQ | `/faq` | Frequently asked questions |
| 9 | `privacy` | Privacy policy | `/privacy` | Store privacy policy (web panel Policies) |
| 10 | `terms` | Terms of service | `/terms` | Store terms of service (web panel Policies) |
| 11 | `return_refund` | Return & refund | `/return-refund` | Return and refund policy (web panel Policies) |
| 12 | `contact_info` | Contact information | `/contact-information` | Legal contact information — **required** for EU sales |
| 13 | `404` | Not found | (fallback) | Page-not-found |
| 14 | `search` | Search | `/search` | Content / article search (optional but recommended) |

---

## Store policy pages (`privacy`, `terms`, `return_refund`, `contact_info`)

Every valid Informatic pack **must** implement policy page templates that load content from the web panel **Online Store → Policies** area.

| Concern | Requirement |
| --- | --- |
| **Policy types** | `privacy`, `terms`, `return-refund`, `contact` (no shipping policy for Informatic) |
| **Data source** | `GET /api/storefront/:storeId/policies/:policyType` |
| **Section type** | `store-policy` — renders API HTML body; theme config provides heading/colors fallback |
| **Contact information** | `contact_info` template at `/contact-information` — distinct from the `/contact` form page |
| **Theme editor** | Page picker **Policies** submenu lists all four policy pages for preview |

Merchants publish policy copy in `/client/online-store/policies`. Until published, the theme shows placeholder copy from `theme.default-config.json`.

---

## Blog post details page (`blog_post`)

Every valid Informatic pack **must** implement a **blog post details** template.

| Concern | Requirement |
| --- | --- |
| **Template id** | `blog_post` in manifest + schema |
| **Runtime component** | `BlogPostPage` in theme contract |
| **Primary route** | `/blog/{postSlug}` — post resolved by `urlHandle` |
| **Alternate route (optional)** | `/blogs/{blogHandle}/{postHandle}` if the host supports two-segment blog URLs |
| **Data source** | `GET /api/storefront/:storeId/blog-posts/by-slug/:slug` (see [Content runtime APIs.md](./Content%20runtime%20APIs.md)) |
| **Preview** | `?preview=1` may load hidden posts in theme editor / admin preview |
| **Theme config role** | Section styling (colors, typography on wrappers) — **not** the article title/body after API connect |
| **Fallback copy** | `theme.default-config.json` demo heading/body when no post is selected (editor dev mode) |

**Must render when post loads:**

- Article title
- Author and published/updated date (when present)
- Featured image (when present)
- HTML body (`content`)
- Optional breadcrumb back to parent blog
- Preview banner when viewing a hidden post in preview mode

**Theme editor:** when editing `blog_post`, the left sidebar must expose a **Preview blog post** picker (same flow as catalog theme editor) so merchants choose which article renders in the canvas. Selection is editor-only state — do not persist in theme config.

---

## Custom CMS pages (`page`)

| Concern | Requirement |
| --- | --- |
| **Template id** | `page` in manifest + schema |
| **Route** | `/{urlHandle}` at storefront root (e.g. `/my-custom-page`) |
| **Legacy route** | `/pages/{urlHandle}` may remain for backward compatibility |
| **Data source** | `GET /api/storefront/:storeId/pages/by-handle/:urlHandle` |
| **Reserved handles** | Custom page handles must not collide with fixed theme routes (`about`, `privacy`, `blog`, …) |

**Theme editor:** page picker **Pages** submenu + sidebar **Preview custom page** picker when editing the `page` template.

---

## Contact page (`contact`)

| Concern | Requirement |
| --- | --- |
| **Template id** | `contact` in manifest + schema |
| **Contact section** | `ContactSection` with built-in name / email / message **or** dynamic fields from linked form |
| **Lead gen anywhere** | Insertable **`lead-gen-form`** section via **Add section** on any page ([Forms.md](./Forms.md)) |
| **Built-in submit** | When no form linked on Contact section: `POST /api/storefront/:storeId/contact-form-submissions` |
| **Linked form submit** | When `formId` set: `GET` + `POST` storefront lead-gen form APIs |

---

### Optional (pack may include)

| Template id | Page | Notes |
| --- | --- | --- |
| `login` / `signup` | Auth | Only if the Informatic host exposes customer/member auth |
| `knowledge` | Knowledge base | Hub of help articles if the product has KB |

### Explicitly out of scope for Informatic

Do **not** require: `product`, `collection`, `collections_list`, `all_products`, `cart`, `orders`, `order_details`, checkout templates. Do **not** include a **shipping policy** template — Informatic uses return/refund, privacy, terms, and contact information only.

← Back to [Introduction.md](./Introduction.md)
