# E-commerce runtime APIs

APIs a **valid remote theme** must **consume** at runtime (and in the catalog editor where pickers need live store data) so required pages and product/collection sections actually work — not static mocks.

Pages that need these: [Required pages.md](./Required%20pages.md).  
Checkout-owned surfaces (login, signup, forgot password, profile, orders, preferences, cart) are **out of scope** here.

---

## Quick map — area → what to consume

| Area | What the theme must be able to do |
| --- | --- |
| **Products** | List products by store · fetch product by id / URL handle · search products |
| **Collections** | List collections by store · fetch collection by id / URL handle · list products in a collection |
| **Blogs** | List blogs by store · fetch blog by URL handle · list posts for a blog · fetch one post · read / submit comments |
| **Menus** | Resolve linked store menu items (label + href) for header / nav |
| **Site utilities** | Submit contact form · newsletter subscribe |

---

## Products

| Capability | Used for | Notes |
| --- | --- | --- |
| List products by store id | All products page · product pickers in catalog · product sections | e.g. `fetchProductsByStoreId` / products context |
| Product by id | Selected product cards · featured / bestsellers / launches | Selected `productId` drives title, image, price, link |
| Product by URL handle | Product details (PDP) | Route `/products/{urlHandle}` |
| Product search | Search results page | Route `/search` |

**Editor:** **Select product** / **Select products** widgets must load the store’s product list (same store-scoped list API).

---

## Collections

| Capability | Used for | Notes |
| --- | --- | --- |
| List collections by store id | Collections index · collection pickers · collection sections | |
| Collection by id / URL handle | Collection details page | Route `/collections/{urlHandle}` |
| Products in a collection | Collection details · optional “fill from collection” on product sections | |

**Editor:** **Select collection** / **Select collections** widgets must load the store’s collection list.

---

## Blogs

| Capability | Used for | Notes |
| --- | --- | --- |
| List blogs by store id | All blogs page · blog pickers if any | Route `/blogs/all` · e.g. `GET /blogs/store/:storeId` / `fetchBlogsByStoreId` |
| Blog by URL handle | Blog details page | Route `/blogs/{urlHandle}` |
| List posts for a blog (or by store) | Blog details · blog post lists | e.g. `GET /blog-posts/store/:storeId` (+ optional `blogId`) |
| Post by URL handle (blog + post) | Blog post details | Route `/blogs/{blogUrlHandle}/{postUrlHandle}` |
| Read / submit comments | Blog post details (when comments enabled) | |

---

## Menus

| Capability | Used for | Notes |
| --- | --- | --- |
| Store menu items (label + href) | Header / nav that links a store menu | Config stores menu id + `settings.items`; runtime reads items — do not hardcode-only nav |

---

## Site utilities

| Capability | Used for | Notes |
| --- | --- | --- |
| Contact form submit | Contact / forms sections | |
| Newsletter subscribe | Email signup sections | |

---

## By required page (cheat sheet)

| Page template | Must consume |
| --- | --- |
| `index` | Products / collections / blogs as sections need; menus |
| `product` | Product by URL handle |
| `search` | Product search |
| `collections_list` | List collections |
| `all_products` | List products |
| `collection` | Collection by URL handle + its products |
| `all_blogs` | List blogs by store |
| `blogs` | Blog by URL handle + its posts |
| `blog_posts` | Post by blog + post URL handle (+ comments if enabled) |
| `404` | (none required) |

---

## Out of scope (checkout editor)

Do **not** treat these as remote-theme validity requirements:

- Auth / session · signup · forgot password · profile update  
- Orders · preferences · addresses  
- Cart line items · cart quantity / remove  

Those belong to the **checkout editor** pack/pages.

---

## Validity

A remote theme is **not valid** if required pages only show hardcoded demo catalog/blog data and never call these store-scoped APIs (or equivalent SDK / storefront endpoints) for the live store.

← Back to [Introduction.md](./Introduction.md)
