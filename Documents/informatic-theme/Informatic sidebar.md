# Informatic sidebar

Informatic remote-theme editing uses a **small, intentional** set of controls. The left sidebar must stay **simple and shallow** — same philosophy as the catalog sidebar, without commerce pickers.

## Allowed vs not

| Allowed | Not allowed |
| --- | --- |
| Static text + text style ([Editable elements.md](./Editable%20elements.md)) | Padding / spacing systems |
| Standardized **image** / **button** / **container** elements | Flex / direction / position / layout builders |
| Links, menus, simple toggles | Custom CSS panels |
| Site menus ([Menus.md](./Menus.md)) — header **Menu** picker (Replace / Edit / Create) | Dense / deeply nested sidebar trees |
| Footer social links ([Footer social links.md](./Footer%20social%20links.md)) — **Layout → Footer → Social links** | Social URLs hidden only in global theme settings |
| Lead generation forms ([Forms.md](./Forms.md)) — **Add section → Lead generation form** on any page | Manual per-field editing for linked forms |
| **Add section** for insertable catalog types (lead-gen form, …) | Hardcoded-only page section lists with no insert flow |
| Content pickers only where needed (article / page) — see [Content runtime APIs.md](./Content%20runtime%20APIs.md) | Product / collection pickers |
| **Blog post preview picker** on `blog_post` template (Sections tab header) | Commerce entity preview pickers |
| Theme settings: logo, colors, typography, buttons | Style/layout groups “for completeness” |

## Sidebar rules

| Do | Don’t |
| --- | --- |
| Flat list: section → text / image / button | Groups inside groups; nested layout/CSS blocks |
| Primary actions: copy, image, CTA link | Mirror a full visual page-builder |
| Style behind one expand (**Text style** / **Image style** / **Button style**) | Extra nodes only for layout or CSS tuning |
| Hide advanced runtime-only fields (`sidebar: false` / filters) | Show settings merchants don’t need day-to-day |

Schema may still hold advanced fields for the pack/runtime — they must **not** clutter the Informatic sidebar. **Simple beats complete.**

### Blog post template sidebar

When editing **`blog_post`** (blog post details), show one extra control at the top of the **Sections** sidebar (above Layout / section tree):

| Control | Purpose |
| --- | --- |
| **Preview blog post** | Dropdown to pick which store blog post renders in the live preview canvas |
| Search | Filter posts by title or URL handle |
| View on storefront | External link to `/blog/{postHandle}?preview=1` |

This mirrors the catalog theme editor **Preview blog post** card. The picker choice is **not** saved in theme config — only which post is shown while editing.

← Back to [Remote themes criteria.md](./Remote%20themes%20criteria.md)
