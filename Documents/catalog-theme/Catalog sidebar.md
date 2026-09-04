# Catalog sidebar

Catalog remote-theme editing uses a **small, intentional** set of controls — narrower than Create Theme. The left sidebar must stay **simple and shallow**.

## Allowed vs not

| Allowed | Not allowed |
| --- | --- |
| Static text + text style ([Editable elements.md](./Editable%20elements.md)) | Padding / spacing systems |
| **Products** + **Select product** ([Editable elements.md](./Editable%20elements.md)) | Flex / direction / position / layout builders |
| **Collections** + **Select collection(s)** ([Editable elements.md](./Editable%20elements.md)) | Custom CSS panels |
| Standardized **image** / **product** / **collection** elements | Dense / deeply nested sidebar trees |
| Links, menus, simple toggles | Create Theme–only chrome |
| Store menus ([Menus.md](./Menus.md)) | Style/layout groups “for completeness” |

## Sidebar rules

| Do | Don’t |
| --- | --- |
| Flat list: section → product / collection / text / image | Groups inside groups; nested layout/CSS blocks |
| Primary actions: copy, image, **Select product**, **Select collection** | Mirror Create Theme’s full settings surface |
| Style behind one expand (**Text style** / **Image style**) | Extra nodes only for layout or CSS tuning |
| Hide Create Theme chrome (`sidebar: false` / catalog filters) | Show settings merchants don’t need day-to-day |

Schema may still hold advanced fields for the pack/runtime — they must **not** clutter the catalog sidebar. **Simple beats complete.**

← Back to [Remote themes criteria.md](./Remote%20themes%20criteria.md)
