# Theme Editor Elements — Implementation Report

**Generated:** May 30, 2026  
**Scope:** Horizon theme / create-theme composer preview (what you see in the theme customizer sidebar + live preview iframe)  
**Reference screenshot:** Home page with Header → Template sections → Footer

---

## Executive summary


| Layer                                           | Total in UI | Completed    | Partial    | Untouched    |
| ----------------------------------------------- | ----------- | ------------ | ---------- | ------------ |
| **Section types** (unique `section.type` slugs) | **38**      | **29** (76%) | **1** (3%) | **8** (21%)  |
| **Add-section catalog items** (picker labels)   | **45**      | **33** (73%) | **1** (2%) | **11** (24%) |
| **Layout sidebar** (always-on header/footer)    | **4**       | **3**        | **0**      | **1**        |
| **Default home template sections**              | **2**       | **1**        | **0**      | **1**        |
| **Nested blocks** (add-block catalog)           | **33**      | **22** (67%) | **0**      | **11** (33%) |
| **Theme settings tab** (global)                 | **19**      | **3** (16%)  | **0**      | **16** (84%) |
| **Editor page templates**                       | **18**      | **2** (11%)  | **0**      | **16** (89%) |


**Bottom line:** Most **marketing/content sections** in the Add section picker work in preview. The biggest gaps are **Featured collection** (default on home — shows *“runtime not implemented yet”*), **slideshow variants**, **footer Utilities**, **account/cart templates**, and **global theme settings** (mostly catalog-only in the sidebar).

---

## How this report was produced

### What “shown in the UI” means

1. **Left sidebar tree** — built from live theme config + `theme.schema.json` via `buildShopifySidebarTree()`
  - File: `Ziplofy/src/create-theme/sidebar/create-theme-sidebar.tree.ts`
2. **Add section modal** — all insertable sections grouped as Header / Template / Footer
  - File: `Ziplofy/src/components/themes/theme-editor-sidebar/add-section-catalog.ts`
3. **Add block modal** — nested blocks inside sections
  - File: `Ziplofy/src/components/themes/theme-editor-sidebar/add-block-catalog.ts`
4. **Theme settings tab** — global style groups
  - File: `Ziplofy/src/components/themes/theme-editor-sidebar/theme-settings-catalog.ts`

### What “implemented” means (composer preview)

Preview iframe uses `**SECTION_RUNTIME_BY_TYPE`** in:

`Ziplofy/src/create-theme/runtime/registry.ts`

If a section type is **missing** from that map, the preview shows:

> Section `"…"` — runtime not implemented yet

(`Ziplofy/src/create-theme/runtime/composer/SectionRuntimeNode.tsx`)

### Secondary path: bundled Horizon theme

When `theme.js` is loaded from `remote-themes/horizon`, **35 section components** under `remote-themes/horizon/src/sections/` plus dedicated pages (`CartPage`, `LoginPage`, etc.) provide fuller coverage. That path is **separate** from the default create-theme composer used in most editor sessions.

---

## Sidebar structure (your screenshot)

```
Header
├── Announcement bar
├── Header
└── + Add section

Template  (page-specific, e.g. Home)
├── Featured collection      ← UNTOUCHED in composer (stub message)
├── Collection list: Bento   ← COMPLETED
├── Image compare            ← COMPLETED (if added)
└── + Add section

Footer
├── Footer                   ← COMPLETED
├── Utilities                ← UNTOUCHED in composer
└── + Add section
```

Default home (`index`) section order from `remote-themes/horizon/theme.default-config.json`:

1. `hero_main` (type: `hero`) — **completed** (may be off-screen above fold)
2. `featured_collection` (type: `featured-collection`) — **untouched** ← matches your screenshot

---

## Section types — full status table

Status is for **create-theme composer preview** unless noted.


| #   | UI label (catalog)                 | Type slug                    | Group         | Status      | Evidence / notes                                                             |
| --- | ---------------------------------- | ---------------------------- | ------------- | ----------- | ---------------------------------------------------------------------------- |
| 1   | Announcement bar                   | `announcement-bar`           | Header        | ✅ Completed | `announcement-bar/runtime/AnnouncementBar.tsx`                               |
| 2   | Header                             | `header`                     | Header        | ✅ Completed | `header/runtime/Header.tsx`                                                  |
| 3   | Footer                             | `footer`                     | Footer        | ✅ Completed | `footer/runtime/Footer.tsx`                                                  |
| 4   | Utilities / Policies and links     | `footer-utilities`           | Footer        | ❌ Untouched | Sidebar + settings exist; no composer runtime. Remote: `FooterUtilities.tsx` |
| 5   | Divider                            | `divider`                    | Layout        | ✅ Completed | `divider/runtime/Divider.tsx`                                                |
| 6   | Hero                               | `hero`                       | Banners       | ✅ Completed | `hero/runtime/Hero.tsx`                                                      |
| 7   | Hero: Bottom aligned               | `hero`                       | Banners       | ✅ Completed | Same runtime, `catalogVariant`                                               |
| 8   | Hero: Marquee                      | `hero`                       | Banners       | ✅ Completed | Same runtime                                                                 |
| 9   | Large logo                         | `hero`                       | Banners       | ✅ Completed | Delegates to `large-logo/runtime/LargeLogo.tsx`                              |
| 10  | Split showcase                     | `hero`                       | Banners       | ✅ Completed | Delegates to `split-showcase/runtime/SplitShowcase.tsx`                      |
| 11  | Layered slideshow                  | `layered-slideshow`          | Banners       | ❌ Untouched | Remote: `LayeredSlideshowSection.tsx`                                        |
| 12  | Slideshow: Full frame              | `slideshow-full-frame`       | Banners       | ❌ Untouched | Remote: `SlideshowFullFrameSection.tsx`                                      |
| 13  | Slideshow: Inset                   | `slideshow-inset`            | Banners       | ❌ Untouched | Remote: `SlideshowInsetSection.tsx`                                          |
| 14  | Collection links: Spotlight        | `collection-links-spotlight` | Collections   | ✅ Completed | `collection-links-spotlight/runtime/`                                        |
| 15  | Collection links: Text             | `collection-links-spotlight` | Collections   | ✅ Completed | Same runtime, text layout mode                                               |
| 16  | Collection list: Bento             | `collection-list-bento`      | Collections   | ✅ Completed | `collection-list-bento/runtime/`                                             |
| 17  | Collection list: Carousel          | `collection-list-carousel`   | Collections   | ✅ Completed | Aliased to `CollectionListBento`                                             |
| 18  | Collection list: Editorial         | `collection-list-editorial`  | Collections   | ✅ Completed | Aliased to `CollectionListBento`                                             |
| 19  | Collection list: Grid              | `collection-list-grid`       | Collections   | ✅ Completed | Aliased to `CollectionListBento`                                             |
| 20  | Contact form                       | `contact-form`               | Forms         | ✅ Completed | `contact-form/runtime/ContactForm.tsx`                                       |
| 21  | Email signup                       | `email-signup`               | Forms         | ✅ Completed | `email-signup/runtime/EmailSignup.tsx`                                       |
| 22  | Custom Liquid                      | `hero` (mis-mapped)          | Layout        | ⚠️ Partial  | Inserts as Hero blueprint — does **not** render Liquid                       |
| 23  | Custom section                     | `custom-section`             | Layout        | ❌ Untouched | Editing UI only. Remote: `CustomSectionSection.tsx`                          |
| 24  | Featured collection (all variants) | `featured-collection`        | Products      | ❌ Untouched | **Critical:** default home section. Remote: `FeaturedCollectionSection.tsx`  |
| 25  | Featured product                   | `product-highlight`          | Products      | ✅ Completed | `product-highlight/runtime/FeaturedProduct.tsx`                              |
| 26  | Product highlight                  | `product-highlight`          | Products      | ✅ Completed | `product-highlight/runtime/ProductHighlight.tsx`                             |
| 27  | Product hotspots                   | `product-hotspots`           | Products      | ❌ Untouched | Remote: `ProductHotspotsSection.tsx`                                         |
| 28  | Recommended products               | `recommended-products`       | Products      | ❌ Untouched | Remote: `RecommendedProductsSection.tsx`                                     |
| 29  | Blog posts: Carousel               | `blog-posts-carousel`        | Storytelling  | ✅ Completed | `blog-posts-carousel/runtime/`                                               |
| 30  | Blog posts: Editorial              | `blog-posts-editorial`       | Storytelling  | ✅ Completed | `blog-posts-editorial/runtime/`                                              |
| 31  | Blog posts: Grid                   | `blog-posts-grid`            | Storytelling  | ✅ Completed | `blog-posts-grid/runtime/`                                                   |
| 32  | Carousel (storytelling)            | `storytelling-carousel`      | Storytelling  | ✅ Completed | `storytelling-carousel/runtime/`                                             |
| 33  | Editorial                          | `editorial`                  | Storytelling  | ✅ Completed | `editorial/runtime/Editorial.tsx`                                            |
| 34  | Editorial: Jumbo text              | `editorial-jumbo`            | Storytelling  | ✅ Completed | `editorial-jumbo/runtime/EditorialJumbo.tsx`                                 |
| 35  | Image compare                      | `image-compare`              | Storytelling  | ✅ Completed | `image-compare/runtime/ImageCompare.tsx`                                     |
| 36  | Image with text                    | `image-with-text`            | Storytelling  | ✅ Completed | `image-with-text/runtime/ImageWithText.tsx`                                  |
| 37  | Logo (storytelling)                | `storytelling-logo`          | Storytelling  | ❌ Untouched | Remote: `StorytellingLogoSection.tsx`                                        |
| 38  | Video                              | `storytelling-video`         | Storytelling  | ✅ Completed | `video/runtime/StorytellingVideo.tsx`                                        |
| 39  | FAQ                                | `faq`                        | Text          | ✅ Completed | `faq/runtime/Faq.tsx`                                                        |
| 40  | Icons with text                    | `icons-with-text`            | Text          | ✅ Completed | `icons-with-text/runtime/IconsWithText.tsx`                                  |
| 41  | Marquee (text)                     | `text-marquee`               | Text          | ✅ Completed | `text-marquee/runtime/TextMarquee.tsx`                                       |
| 42  | Multicolumn                        | `multicolumn`                | Text          | ✅ Completed | `multicolumn/runtime/Multicolumn.tsx`                                        |
| 43  | Pull quote                         | `pull-quote`                 | Text          | ✅ Completed | `pull-quote/runtime/PullQuote.tsx`                                           |
| 44  | Rich text                          | `rich-text`                  | Text          | ✅ Completed | `rich-text/runtime/RichText.tsx`                                             |
| 45  | Product page main                  | `product-main`               | Template page | ✅ Completed | `product-main/runtime/ProductMain.tsx`                                       |


*Rows 6–10 share one runtime (`hero`). Rows 14–19 share collection runtimes. Rows 24–26 share product-highlight runtime.*

### Unique type slugs summary


| Status      | Count  | Type slugs                                                                                                                                                                                   |
| ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Completed | **29** | See `SECTION_RUNTIME_BY_TYPE` in `registry.ts`                                                                                                                                               |
| ⚠️ Partial  | **1**  | Custom Liquid → renders as `hero`                                                                                                                                                            |
| ❌ Untouched | **8**  | `featured-collection`, `layered-slideshow`, `slideshow-full-frame`, `slideshow-inset`, `product-hotspots`, `recommended-products`, `custom-section`, `footer-utilities`, `storytelling-logo` |


---

## Template page sections (page switcher in editor)

From `Ziplofy/src/create-theme/utils/theme-page-registry.ts` + `theme.schema.json` templates.


| Editor page        | Primary section(s)            | Composer status     | Remote theme page             |
| ------------------ | ----------------------------- | ------------------- | ----------------------------- |
| Home page          | `hero`, `featured-collection` | Hero ✅ / Featured ❌ | `HomePage.tsx` ✅              |
| Product page       | `product-main`                | ✅ Completed         | `ProductPage.tsx` ✅           |
| Cart               | `cart-main`                   | ❌ Untouched         | `CartPage.tsx` ✅              |
| Login              | `login-main`                  | ❌ Untouched         | `LoginPage.tsx` ✅             |
| Sign up            | `signup-main`                 | ❌ Untouched         | `SignupPage.tsx` ✅            |
| Forgot password    | `forgot-main`                 | ❌ Untouched         | `ForgotPasswordPage.tsx` ✅    |
| Profile            | `profile-main`                | ❌ Untouched         | `ProfilePage.tsx` ✅           |
| Orders             | `orders-main`                 | ❌ Untouched         | `OrdersPage.tsx` ✅            |
| Preferences        | `preferences-main`            | ❌ Untouched         | `PreferencesPage.tsx` ✅       |
| All products       | (collection template)         | ❌ Untouched         | Partial via collection routes |
| Collections list   | —                             | ❌ Untouched         | —                             |
| Collection page    | —                             | ❌ Untouched         | —                             |
| Blogs / Blog posts | —                             | ❌ Untouched         | —                             |
| Search             | —                             | ❌ Untouched         | —                             |
| Pages              | —                             | ❌ Untouched         | —                             |
| Gift card          | —                             | ❌ Untouched         | —                             |
| Checkout           | —                             | ❌ Untouched         | —                             |


**Editor pages with working composer preview:** Home (partial), Product page.

---

## Nested blocks (Add block picker)

**Catalog:** 33 blocks in `BLOCK_CATALOG` (`add-block-catalog.ts`)  
**Block runtime registry:** 22 blocks in `CREATE_THEME_BLOCKS` (`render-store/src/create-theme/blocks/registry.ts`)

Blocks only render **inside a parent section** that implements them. If the parent section is untouched, blocks appear in the sidebar but not in preview.

### ✅ Completed (22) — have block runtime


| Block                | Category   |
| -------------------- | ---------- |
| Button               | Basic      |
| Heading              | Basic      |
| Logo                 | Basic      |
| Text                 | Basic      |
| Jumbo text           | Decorative |
| Marquee              | Decorative |
| Group                | Layout     |
| Spacer               | Layout     |
| Menu                 | Links      |
| Popup link           | Links      |
| Buy buttons          | Product    |
| Description          | Product    |
| Price                | Product    |
| Product card         | Product    |
| Product inventory    | Product    |
| Recommended products | Product    |
| Review stars         | Product    |
| SKU                  | Product    |
| Special instructions | Product    |
| Swatches             | Product    |
| Title                | Product    |
| Variant picker       | Product    |


### ❌ Untouched (11) — in catalog, no block runtime


| Block              | Category   | Notes                                      |
| ------------------ | ---------- | ------------------------------------------ |
| Icon               | Basic      | Schema/picker only                         |
| Image              | Basic      | Schema/picker only                         |
| Page               | Basic      | Schema/picker only                         |
| Video              | Basic      | Schema/picker only                         |
| Collection card    | Collection | Parent-dependent                           |
| Collection title   | Collection | Parent-dependent                           |
| Comparison slider  | Decorative | Section-level `image-compare` handles this |
| Copyright          | Footer     | Parent `footer-utilities` untouched        |
| Follow on Shop     | Footer     | Parent-dependent                           |
| Payment icons      | Footer     | Parent-dependent                           |
| Policy links       | Footer     | Parent `footer-utilities` untouched        |
| Social media links | Footer     | Parent-dependent                           |
| Contact form       | Forms      | Section-level runtime exists               |
| Email signup       | Forms      | Section-level runtime exists               |
| Accordion          | Layout     | FAQ section has accordion behavior         |


*Contact form / Email signup work as **sections**, not as standalone block runtimes.*

### Notable parent → child relationships


| Parent section      | Nested blocks in sidebar                 | Preview            |
| ------------------- | ---------------------------------------- | ------------------ |
| Announcement bar    | `announcement`                           | ✅                  |
| Header              | `logo`, `menu`, menu links               | ✅                  |
| Footer              | `newsletter`, `social_links`             | ✅                  |
| Utilities           | `copyright`, `policy_links`, `social`    | ❌ (parent missing) |
| Hero                | `heading`, buttons, etc.                 | ✅                  |
| Featured collection | `collection_header`, `product_card`      | ❌ (parent missing) |
| Featured product    | buy buttons, price, variant picker, etc. | ✅                  |
| FAQ                 | `faq_item`                               | ✅                  |
| Icons with text     | `icon_with_text_item`                    | ✅                  |
| Multicolumn         | `multicolumn_item`                       | ✅                  |


---

## Theme settings tab (global)

19 items in `THEME_SETTINGS_CATALOG` — **display catalog** for the Theme settings sidebar.


| Setting group         | Composer / live preview                                |
| --------------------- | ------------------------------------------------------ |
| Colors                | ✅ Wired via `globalSettings` in schema + config tokens |
| Typography            | ✅ Wired via `globalSettings`                           |
| Page layout (spacing) | ✅ Wired via `globalSettings.spacing`                   |
| Logo and favicon      | ❌ Catalog only                                         |
| Animations            | ❌ Catalog only                                         |
| Badges                | ❌ Catalog only                                         |
| Buttons               | ❌ Catalog only                                         |
| Cart                  | ❌ Catalog only                                         |
| Drawers               | ❌ Catalog only                                         |
| Icons                 | ❌ Catalog only                                         |
| Input fields          | ❌ Catalog only                                         |
| Popovers and modals   | ❌ Catalog only                                         |
| Prices                | ❌ Catalog only                                         |
| Product cards         | ❌ Catalog only                                         |
| Search                | ❌ Catalog only                                         |
| Swatches              | ❌ Catalog only                                         |
| Variant pickers       | ❌ Catalog only                                         |
| Custom CSS            | ❌ Catalog only                                         |
| Theme style (info)    | ❌ Info row only                                        |


---

## Remote Horizon theme vs composer gap

`remote-themes/horizon/src/sections/` contains **35** section implementations. The bundled theme covers most gaps in the composer:


| Missing in composer    | Present in remote theme            |
| ---------------------- | ---------------------------------- |
| `featured-collection`  | ✅ `FeaturedCollectionSection.tsx`  |
| `layered-slideshow`    | ✅ `LayeredSlideshowSection.tsx`    |
| `slideshow-full-frame` | ✅ `SlideshowFullFrameSection.tsx`  |
| `slideshow-inset`      | ✅ `SlideshowInsetSection.tsx`      |
| `product-hotspots`     | ✅ `ProductHotspotsSection.tsx`     |
| `recommended-products` | ✅ `RecommendedProductsSection.tsx` |
| `custom-section`       | ✅ `CustomSectionSection.tsx`       |
| `storytelling-logo`    | ✅ `StorytellingLogoSection.tsx`    |
| `footer-utilities`     | ✅ `layout/FooterUtilities.tsx`     |
| Cart / auth pages      | ✅ Dedicated `pages/*.tsx`          |


**Implication:** Work is largely **porting remote-theme section components into `Ziplofy/src/create-theme/*/runtime/`** and registering them in `registry.ts`.

---

## Priority gaps (recommended fix order)

1. **Featured collection** — on every default home page; users see stub immediately after hero.
2. **Footer utilities** — always in footer group; settings panels work, preview does not.
3. **Slideshow family** (3 variants) — common in Add section → Banners.
4. **Product hotspots & Recommended products** — in Products category.
5. **Storytelling Logo** — single missing storytelling variant.
6. **Custom section** — blank canvas with blocks (Shopify parity).
7. **Custom Liquid** — fix mapping (currently inserts Hero).
8. **Cart + customer account templates** — needed for full storefront editor parity.
9. **Theme settings** — wire remaining 16 catalog groups to live preview.

---

## Key source files


| Purpose                       | Path                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Section catalog (UI labels)   | `Ziplofy/src/components/themes/theme-editor-sidebar/add-section-catalog.ts`    |
| Block catalog                 | `Ziplofy/src/components/themes/theme-editor-sidebar/add-block-catalog.ts`      |
| Sidebar tree                  | `Ziplofy/src/create-theme/sidebar/create-theme-sidebar.tree.ts`                |
| **Composer runtime registry** | `Ziplofy/src/create-theme/runtime/registry.ts`                                 |
| Missing-section stub          | `Ziplofy/src/create-theme/runtime/composer/SectionRuntimeNode.tsx`             |
| Block runtime registry        | `render-store/src/create-theme/blocks/registry.ts`                             |
| Theme schema (canonical)      | `remote-themes/horizon/theme.schema.json`                                      |
| Default theme config          | `remote-themes/horizon/theme.default-config.json`                              |
| Remote full renderers         | `remote-themes/horizon/src/sections/*.tsx`                                     |
| Editor page registry          | `Ziplofy/src/create-theme/utils/theme-page-registry.ts`                        |
| Theme settings catalog        | `Ziplofy/src/components/themes/theme-editor-sidebar/theme-settings-catalog.ts` |


---

## Visual reference (your screenshot)


| Element visible                               | Expected status                              |
| --------------------------------------------- | -------------------------------------------- |
| Announcement bar (purple banner)              | ✅ Renders                                    |
| Header (My Store, nav, icons)                 | ✅ Renders                                    |
| Featured collection                           | ❌ Shows *"runtime not implemented yet"*      |
| Collection list: Bento ("Shop by collection") | ✅ Renders                                    |
| Footer / Utilities                            | Footer ✅ if scrolled; Utilities ❌ if present |


---

*This report reflects the **create-theme composer** path used by the theme editor preview iframe. Bundled `remote-themes/horizon` may show more complete UI when `theme.js` is loaded.*