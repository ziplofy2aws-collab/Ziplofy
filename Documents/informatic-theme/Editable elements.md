# Editable elements

Informatic themes use the **same element contracts** as catalog themes for chrome and content styling. Same element ⇒ same editing options, no matter which section it sits in.

Declare fields in **schema**; store values in **config**. Style options sit under one expand on the field (**Text style** / **Image style** / **Button style**) — not as separate deep sidebar nodes.

| Element | Where it appears | Editor widget |
| --- | --- | --- |
| **Text** | Headings, body, button labels, logo text, announcement, footer chrome, feature titles, FAQ questions, … | `styled-text` |
| **Image** | Heroes, banners, backgrounds, feature media, team photos, logo upload, … | `image` |
| **Button** | CTAs (Get started, Learn more, Contact us, primary & secondary actions) | `button` (style expand) |
| **Container** | Section / block wrappers (header, footer, section shells, cards, promo bands, …) | container settings (color fields) |
| **Lead generation form** | Contact section — link a workspace form created in Forms | `form` |

**Informatic does not use** catalog **Product** / **Collection** pickers. Content that comes from CMS / APIs (article titles, page titles, menu labels) is **not** editable as static theme copy after selection — see [Content runtime APIs.md](./Content%20runtime%20APIs.md).

Optional later element types (video, rich HTML block, …) should be added here the same way: one contract, same options everywhere.

**Not editable as static theme copy:** API-owned article titles, linked menu labels, CMS page titles (those come from content APIs after selection). No padding / flex / position / custom CSS on these elements in the Informatic sidebar.

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

**Runtime:** `borderRadius`; overlay layer; gradient layer when enabled. Pack-demo URLs use pack media helpers (see [Pack demo media.md](./Pack%20demo%20media.md)).

**Invalid:** image URL only — missing corner radius, overlay, or gradient.

---

## Button — editing options

A **Button** is a clickable CTA chrome (primary / secondary / Learn more / Contact / Get started, etc.). Same Button element ⇒ same style controls on **each** button instance — not only Theme Settings → Buttons.

The **label string** on the button is still a **Text** element (`styled-text` on the label field). Button here means the **surface / type styles** around that label.

Every Button must support **all** of the options below (one expand / style panel on the button field).

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Background** | Fill color (solid / palette / transparent where the editor allows) | `{key}Background` · color |
| **Text** | Label color | `{key}Text` · color |
| **Borders** | Border color | `{key}Border` · color |
| **Border thickness** | Border width | `{key}BorderThickness` · px (`0`–`20`) |
| **Corner radius** | Round the button | `{key}CornerRadius` · px (`0`–`100`) |
| **Font** | Typography role for the label | `{key}Font` · `body` \| `accent` |
| **Text case** | Capitalization of the label | `{key}TextCase` · `default` \| `uppercase` |

**Example** (`primaryCta`):

- Label (Text): `primaryLabel` · `widget: "styled-text"` (+ Text companions)
- Surface (Button): `primaryCtaBackground`, `primaryCtaText`, `primaryCtaBorder`, `primaryCtaBorderThickness`, `primaryCtaCornerRadius`, `primaryCtaFont`, `primaryCtaTextCase`
- Link / URL: normal URL / link field — not part of Button style

Same pattern for secondary CTAs — each instance gets its **own** companions under that button’s `{key}` prefix.

**Runtime:** `background` / `backgroundColor`, `color`, `borderColor`, `borderWidth`, `borderRadius`, font from Body/Accent role, `textTransform` from text case.

**Invalid:** a Button with only a label (or only a link) and **no** Background / Text / Borders / Border thickness / Corner radius / Font / Text case controls.

---

## Container — editing options

A **container** is a layout wrapper that is the **relative parent** of the elements inside it (footer, header bar, section shell, card, promo band). Child text/images live inside — merchants need basic surface controls on the container itself.

Every container must support **at least** the options below.

| Editing option | What it does | Schema companion |
| --- | --- | --- |
| **Background color** | Fill / surface color of the container | `{key}BackgroundColor` · color · empty = theme default |
| **Text color** | Default text color inherited by children (unless a child Text overrides) | `{key}TextColor` · color · empty = theme default |

**Example** (`footer`): `footerBackgroundColor`, `footerTextColor`. Same for header / section shells.

**Runtime:** apply `backgroundColor` and `color` on the container node.

**Invalid:** a container with only nested editable children and **no** background / text color on the container itself.

---

## Footer social links — editing options

Every Informatic footer must include a **Social links** layout block ([Footer social links.md](./Footer%20social%20links.md)).

| Editing option | What it does | Config path |
| --- | --- | --- |
| **Heading** | Label above the social pills (e.g. “Follow us”) | `sections.footer.blocks.social.settings.heading` · `styled-text` |
| **Facebook URL** | Profile / page link | `sections.footer.blocks.social.settings.facebook` |
| **X (Twitter) URL** | Profile link | `sections.footer.blocks.social.settings.twitter` |
| **Instagram URL** | Profile link | `sections.footer.blocks.social.settings.instagram` |
| **LinkedIn URL** | Profile / company link | `sections.footer.blocks.social.settings.linkedin` |
| **YouTube URL** | Channel link | `sections.footer.blocks.social.settings.youtube` |

**Runtime:** render only networks with a non-empty URL as footer pill links (`target="_blank"`, `rel="noopener noreferrer"`).

**Invalid:** social links only in global theme settings, or a footer with no **Social links** block.

---

## What Informatic deliberately omits

| Catalog element | Informatic |
| --- | --- |
| **Product** / **Select product(s)** | Not used — no commerce catalog |
| **Collection** / **Select collection(s)** | Not used — no commerce catalog |

If a section needs **CMS content** (e.g. pick a blog / article to feature), use content pickers documented in [Content runtime APIs.md](./Content%20runtime%20APIs.md) — not Product/Collection widgets.

← Back to [Introduction.md](./Introduction.md)
