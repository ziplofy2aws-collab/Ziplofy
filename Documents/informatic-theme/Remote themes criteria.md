# Remote Themes Criteria

Standards for installable **Informatic remote themes** in the **Informatic theme editor**.

**Informatic** = content / information websites (marketing, company, knowledge). **Not** e-commerce catalog themes.

This file is the **starting menu** and a short **validity checklist**. Details live in the linked docs below.

---

## Docs menu

| Doc | What it covers |
| --- | --- |
| [Files introduction.md](./Files%20introduction.md) | Pack folder/file structure — manifest, schema, default-config, `src/`, assets |
| [Content runtime APIs.md](./Content%20runtime%20APIs.md) | APIs a valid theme must consume (pages, blogs, menus, forms) |
| [Required pages.md](./Required%20pages.md) | Required page templates, routes, and what each page does |
| [Informatic sidebar.md](./Informatic%20sidebar.md) | What Informatic editing allows / forbids; keep the left sidebar simple |
| [Editable elements.md](./Editable%20elements.md) | Text, image, button, container — editing options tables |
| [Menus.md](./Menus.md) | Default main menu + editable site menus |
| [Footer social links.md](./Footer%20social%20links.md) | Required footer social links block + editable profile URLs |
| [Forms.md](./Forms.md) | Lead generation form linking on contact sections |
| [Pack demo media.md](./Pack%20demo%20media.md) | When pack demo assets show vs placeholders |
| [Introduction.md](./Introduction.md) | Same menu (entry point) |

---

## Validity checklist

A valid Informatic remote theme must:

1. Be a **`react-remote`** pack with manifest + schema + default-config + built JS/CSS ([Files introduction.md](./Files%20introduction.md))
2. Declare and implement the **required Informatic page templates** ([Required pages.md](./Required%20pages.md)) — **no** commerce page requirement
3. Wire **editable site menus** with header **Menu** picker (Replace / Edit / Create) — not hardcoded-only nav ([Menus.md](./Menus.md))
4. Wire **lead generation forms** — insertable **`lead-gen-form`** section on any page + form picker ([Forms.md](./Forms.md))
5. Render page content from **`section_order`** + dynamic section registry — not hardcoded-only page shells
6. Honor **full editable-element contracts** for Text / Image / Button / Container ([Editable elements.md](./Editable%20elements.md))
7. Keep the **Informatic sidebar shallow** ([Informatic sidebar.md](./Informatic%20sidebar.md))
8. **Consume live content APIs** where pages/sections are dynamic ([Content runtime APIs.md](./Content%20runtime%20APIs.md))
9. Treat pack demo media as **hidden by default** ([Pack demo media.md](./Pack%20demo%20media.md))
10. Ship a **footer Social links block** with editable profile URLs ([Footer social links.md](./Footer%20social%20links.md))
11. **Not** ship Product / Collection pickers or commerce-only templates as Informatic requirements

Catalog (commerce) rules stay in [../catalog-theme/](../catalog-theme/).
