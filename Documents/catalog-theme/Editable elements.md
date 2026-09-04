# Editable elements

Catalog themes use shared **element** contracts. Same element ⇒ same editing options, no matter which section `category` it sits in.

Declare fields in **schema**; store values in **config**. Style options sit under one expand on the field (**Text style** / **Image style**) — not as separate deep sidebar nodes.

| Element | Where it appears | Editor widget |
| --- | --- | --- |
| **Text** | Headings, body, button labels, logo text, announcement, footer chrome, … | `styled-text` |
| **Image** | Heroes, banners, backgrounds, lifestyle/chrome images, logo upload, … | `image` |
| **Button** | CTAs, Shop / View all / Add to cart / primary & secondary actions on sections and chrome | `button` (style expand) |
| **Container** | Section / block wrappers that are the relative parent of child elements (footer, header chrome, section shells, cards, promo bands, …) | container settings (color fields) |
| **Collection** | Collection grids, category rails, tiles, featured collection slots, … | `collection` / `collections` |
| **Product** | Product cards, featured product, bestsellers, launches, signature rails, … | `product` / `products` |

More element types (video, …) will be added here the same way.

**Not editable as static theme copy:** API product titles, prices, collection titles, linked menu labels (those come from the store API after selection). API product/collection **images** are not pack image slots (see [Pack demo media.md](./Pack%20demo%20media.md)). No padding / flex / position / custom CSS on these elements in catalog.

---

## Text — editing options

Every static text slot must support **all** of the options below.

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Content** | The text string | `{key}` · `widget: "styled-text"` |
| **Size** | Font size | `{key}FontSize` · px (`10`–`72`) |
| **Font** | Font family | `{key}FontFamily` · empty = theme default |
| **Weight** | Font weight | `{key}FontWeight` · `default` \| `400` \| `500` \| `600` \| `700` \| `800` |
| **Color** | Text color | `{key}TextColor` · empty = theme default |
| **Background** | Show/hide fill behind text | `{key}BackgroundEnabled` · boolean |
| **Background color** | Fill color when background is on | `{key}BackgroundColor` |
| **Corner radius** | Round the text background | `{key}BackgroundCornerRadius` · `0`–`40` px |
| **Letter spacing** | Tracking | `{key}LetterSpacing` · `0`–`20` → `0.00em`–`0.20em` |
| **Casing** | Upper / lower / title case | `{key}TextCase` · `default` \| `uppercase` \| `lowercase` \| `capitalize` |

**Example** (`heading`): `heading`, `headingFontSize`, `headingFontFamily`, `headingFontWeight`, `headingTextColor`, `headingBackgroundEnabled`, `headingBackgroundColor`, `headingBackgroundCornerRadius`, `headingLetterSpacing`, `headingTextCase`.

**Runtime:** apply as `fontSize`, `fontFamily`, `fontWeight`, `color`, `letterSpacing`, `textTransform`; if background on → `backgroundColor`, `borderRadius`, light padding.

**Invalid:** content only, or missing any option in the table above.

---

## Image — editing options

Every editable image slot must support **all** of the options below.

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Image** | Replace / clear the image | `{key}` or `{key}ImageUrl` · `widget: "image"` |
| **Corner radius** | Round image corners | `{key}CornerRadius` · `0`–`40` px |
| **Overlay** | Color wash on top of the image | `{key}OverlayColor` · color · `{key}OverlayOpacity` · `0`–`100` |
| **Gradient** | Optional gradient overlay | `{key}GradientEnabled` · `{key}GradientFrom` · `{key}GradientTo` · `{key}GradientDirection` (`to-top`, `to-bottom`, `to-left`, `to-right`, …) |

**Example** (`media`): `mediaImageUrl`, `mediaCornerRadius`, `mediaOverlayColor`, `mediaOverlayOpacity`, `mediaGradientEnabled`, `mediaGradientFrom`, `mediaGradientTo`, `mediaGradientDirection`.

**Runtime:** `borderRadius`; overlay layer (`background` + opacity); gradient layer (`linear-gradient`) when enabled. Applies for merchant images and placeholders. Pack-demo URLs use `resolveRemoteThemeMediaUrl` (see [Pack demo media.md](./Pack%20demo%20media.md)).

**Invalid:** image URL only — missing corner radius, overlay, or gradient.

---

## Button — editing options

A **Button** is a clickable CTA chrome (primary / secondary / Shop / View all / Add to cart, etc.). Same Button element ⇒ same style controls on **each** button instance in a section — not only Theme Settings → Buttons.

The **label string** on the button is still a **Text** element (`styled-text` on the label field). Button here means the **surface / type styles** around that label.

Every Button must support **all** of the options below (one expand / style panel on the button field).

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Background** | Fill color (supports solid / palette / transparent where the editor allows) | `{key}Background` · color |
| **Text** | Label color | `{key}Text` · color |
| **Borders** | Border color | `{key}Border` · color |
| **Border thickness** | Border width | `{key}BorderThickness` · px (`0`–`20`) |
| **Corner radius** | Round the button | `{key}CornerRadius` · px (`0`–`100`) |
| **Font** | Typography role for the label | `{key}Font` · `body` \| `accent` |
| **Text case** | Capitalization of the label | `{key}TextCase` · `default` \| `uppercase` |

**Example** (`primaryCta` / hero primary button):

- Label (Text): `primaryLabel` · `widget: "styled-text"` (+ Text companions as usual)
- Surface (Button): `primaryCtaBackground`, `primaryCtaText`, `primaryCtaBorder`, `primaryCtaBorderThickness`, `primaryCtaCornerRadius`, `primaryCtaFont`, `primaryCtaTextCase`
- Link / URL (if editable): keep as a normal URL / link field, not part of Button style

Same pattern for secondary CTAs (`secondaryCta…`), “View all”, cart / buy buttons, and so on — each instance gets its **own** companions under that button’s `{key}` prefix.

**Runtime:** apply on the button node as `background` / `backgroundColor`, `color`, `borderColor`, `borderWidth`, `borderRadius`, `fontFamily` / weight from the chosen Body or Accent role, and `textTransform` from text case. Prefer CSS vars when the instance maps to theme primary/secondary; otherwise inline styles from the companions.

**Invalid:** a Button with only a label string (or only a link) and **no** Background / Text / Borders / Border thickness / Corner radius / Font / Text case controls — merchants cannot restyle that CTA per the Button contract.

---

## Container — editing options

A **container** is a layout wrapper that is the **relative parent** of the elements inside it (e.g. footer, header bar, section shell, card, promo band). Child text/images live inside that container — so the merchant needs basic surface controls on the container itself, not only on each child.

Every container must support **at least** the options below.

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Background color** | Fill / surface color of the container | `{key}BackgroundColor` · color · empty = theme / design default |
| **Text color** | Default text color inherited by children inside the container (unless a child Text element overrides with its own color) | `{key}TextColor` · color · empty = theme / design default |

**Example** (`footer`): `footerBackgroundColor`, `footerTextColor`. Same pattern for other shells (`headerBackgroundColor` / `headerTextColor`, section `backgroundColor` / `textColor`, and so on).

**Runtime:** apply on the container node as `backgroundColor` and `color` (so unset child text can inherit). Child **Text** elements may still set their own `{key}TextColor` and win over the container default.

**Why required:** without these, merchants cannot restyle a whole band (e.g. dark footer → light footer) without editing every nested text slot. Containers are the place for that surface control.

**Invalid:** a container with only nested editable children and **no** background color / text color on the container itself.

---

## Collection — editing options

When an element is marked as a **collection**, the catalog sidebar must expose **store collection selection** so the merchant can pick which collection(s) to show. The section runtime then renders those selected collections (title, cover, link, products as the section design requires) from the store API.

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Select collection** | Pick **one** store collection (dropdown / picker) | `{key}` · `widget: "collection"` |
| **Select collections** | Pick **multiple** store collections (multi-select) | `{key}` · `widget: "collections"` |

Use `collection` for a single slot (e.g. one tile / one featured collection). Use `collections` when the merchant chooses several (e.g. a grid or rail of collections).

**Example** (shop-by-category tiles): `tile1CollectionHandle` · `widget: "collection"` · label **Select collection**; or section-level `collectionHandles` · `widget: "collections"` · label **Select collections**.

**Runtime:** selected collection handle / id drives title, cover, link (and any products list) from the store collections API. Do **not** invent static theme text fields for collection titles that always come from the API.

**Invalid:** a collection element with only hardcoded demo names/images and no Select collection(s) control — the section cannot let the merchant choose which store collections to show.

---

## Product — editing options

When an element is marked as a **product**, the catalog sidebar must expose **store product selection** so the merchant can pick which product(s) to show from a dropdown / picker. The section runtime then renders those selected products (title, image, price, link) from the store API.

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Select product** | Pick **one** store product (dropdown / picker) | `{key}` · `widget: "product"` |
| **Select products** | Pick **multiple** store products (multi-select) | `{key}` · `widget: "products"` |

Use `product` for a single card / slot (label e.g. **Select product** / **Change product**). Use `products` when the merchant chooses several at once.

**Example** (bestsellers cards): `card1ProductId` · `widget: "product"` · label **Select product**. Optional section-level collection picker may fill empty slots — it does **not** replace Select product on discrete product cards.

**Runtime:** selected `productId` drives title, image, price, and link from the store products API (`fetchProductsByStoreId` / products context). Do **not** invent static theme text fields for product titles or prices that always come from the API.

**Invalid:** a product element with only hardcoded demo names/images and no Select product(s) control — the section cannot let the merchant choose which store products to show.

← Back to [Introduction.md](./Introduction.md)
