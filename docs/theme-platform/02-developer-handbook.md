# Codiic Theme Developer Handbook

How to build a theme that uploads cleanly, converts into the Theme Editor, displays live business data, and works on a published storefront. Verified against the actual pipeline.

## 1. Build the static site

Build a complete, real multi-page static site first — exactly what you would ship to any static host:

```
my-theme/
  index.html            ← required, at content root
  packages.html         ← list/grid page
  package-detail.html   ← detail template (filename must contain detail/tour/trip/itinerar/product)
  about.html · contact.html · blog.html …
  assets/
    css/style.css
    js/main.js  js/packages-data.js   ← optional JS data file (preferred channel)
    img/…
```

- Demo content should be *realistic* — the platform maps live records onto your demo structure, so use real-ish titles, prices, durations, locations.
- 6–12 demo cards/items per list; the platform clones your card for every live record (max 48).
- Relative paths only (`assets/…`, `packages.html`). A `<base href>` is injected for you — never hardcode origins.
- Every page reachable via `<a href>` from `index.html` (directly or through other pages).

## 2. Choose your data channel

**Channel A — JS data file (recommended).** Put your demo records in `assets/js/packages-data.js` as a plain array:

```js
window.PACKAGES = [
  {
    id: 'goa-classic',            // ← replaced by live record _id / urlHandle
    slug: 'goa-classic',
    title: 'Goa Classic',         // ← record title
    subtitle: 'Sun & sand',
    description: '…',             // shortDescription/description
    image: 'assets/img/goa.jpg',  // ← coverImage (absolutized to theme-site origin)
    gallery: ['…'],               // ← galleryImages[]
    location: 'Goa',              // ← destination / destinations[0]
    destinations: ['goa'],        // ← slugified destinations[]
    days: 6, nights: 5,           // ← durationDays / durationNights
    duration: '6 Days & 5 Nights',// ← generated label
    price: 45000,                 // ← discountedPrice < basePrice → discounted, else list
    priceWas: 60000,              // ← basePrice/adultPrice when discounted lower
    currency: 'INR',
    badge: 'International',
    category: 'beach_getaway',    // ← category
    categories: ['all','beach-getaway'],
    includes: ['…'], excludes: ['…'],
    url: '#'
  }, …
];
```

Your render code then loops the array and builds DOM — keep it, the platform rewrites the *array*, not your render logic.

Recognized declaration shapes: `window.X = […]`, `const|let|var X = […]`, `window.OBJ = { key: […] }`. The platform identifies record arrays by content shape (id + title + price/img fields), not by name. Non-record arrays (nav links, plain strings) are left alone.

**Channel B — markup only.** If you have no data file, make cards real sibling elements:

```html
<ul class="packages__grid">
  <li><article class="pkg-card" data-pkg-id="demo-1">
    <a class="pkg-card__link" href="package-detail.html?id=demo-1">
      <img src="assets/img/p1.jpg" alt="Goa Classic">
      <h3>Goa Classic</h3>
      <p class="pkg-card__loc"><i class="fa-location-dot"></i> Goa, India</p>
      <span class="pkg-card__days">6 Days &amp; 5 Nights</span>
      <p class="pkg-card__price"><b>₹45,000</b> <s>₹60,000</s></p>
    </a></article></li>
  …(≥3 more same-shape siblings)
</ul>
```

The platform detects the run by shape, maps each record onto a clone of your card (`<img>`, first heading, location element, currency amount, duration text), rewrites `data-pkg-id` and every `?id=`/`?pkg=` href to the real record id, and removes demo cards in that region.

Rules for detection to fire:
- ≥3 consecutive same-shape siblings, each with an `<img>`.
- Element reads as a card (tag `article/li/figure` or class match `card|tour|pack|dest|trip|stay|slide|tile|post|entry|product|offer|deal|room|suite|villa|listing|item`).
- Card or its wrapper/section/nearby heading carries travel context (`tour, packag, dest, trip, travel, stay, holid, voyage, journey, itinerar, getaway, resort, hotel, vacation, adventure, listing, product, offer, deal`…).
- **Never** name package regions `testimonial`, `team`, `review`, `stories`, `blog`, `logo`, `avatar`, `newsletter`, `faq`, `feature`, `step`, `counter`, `stat` — those are excluded zones.

## 3. Detail page

`package-detail.html` is a *template* — fully static markup for one package. On a request with `?id=`/`?pkg=` matching a live record, the platform maps:

| Slot | Source |
|---|---|
| first `<img>` after nav | coverImage |
| first `<h1>` | record title |
| price element (currency symbol/entity or `*price*` class) | formatted price (`₹1,00,000`) |
| `*was*`/strike element | compare price when `discountedPrice < list` |
| `*days*`/`*duration*` text | `X Days & Y Nights` |
| location text | destination |
| description paragraph | shortDescription |

Put hero → title → price → details → CTA in that order; put any related-tours grid *below* them (it's detected as a second card run and injected separately — ids differ, so order matters).

## 4. Booking/enquiry widget

On the detail page (and anywhere else you want lead capture):

```html
<form class="booking-card" data-booking>
  <input type="date" name="travelDate">            <!-- name matching *date* -->
  <select name="travellers">                       <!-- traveller|pax|guest|adult|passenger -->
    <option>2 Adults</option>…
  </select>
  <button type="submit">Check Availability</button>
</form>
```

The platform's injected enquiry script recognizes CTA text (`check availability`, `book now`, `enquire`, `reserve`, `get a quote`, `send enquiry`…), reads the date + traveller fields, requires traveller sign-in (injected), then POSTs to the platform endpoint and creates an `enquiries` record in the dashboard. **You never POST yourself** — no endpoint URLs, no fetch calls, no auth code.

## 5. Sign-in / My-account

Add a nav link that reads **"Sign in"** or **"My account"** — the platform auto-wires it to the injected traveller-auth modal. After login, a "My trips" panel shows the traveller's enquiries/bookings live. Do not build forms for login, signup, password reset, or dashboards — all injected.

## 6. Theme Editor compatibility

Uploaded themes get a generated editor pack. To maximize editable surface:

- Wrap distinct visual sections in top-level semantic containers (`<header>`, `<section>`, `<footer>`); the converter splits on these.
- Every section gets a `data-inspector` id; keep section content inside one container.
- Text nodes in `h1–h6`, `p`, `button`, `a`, `li`, `label` → editable text fields.
- `<img>` → editable image field (CSS `background-image` is **not** swap-targetable on static pages).
- `settings.colors`/`settings.typography` in the generated schema → global color/font pickers in the editor's Theme Settings sheet.
- Editor saves go to `WebpanelStoreInformaticThemeConfig`; for static themes, saved-vs-default diffs are applied as `applyContentOverrides` (text + image src). Structural adds/removes only affect the contract preview, **not** the static HTML.

## 7. Upload & test

1. Zip the *contents* (or the single theme folder) — `index.html` must be at root of the content.
2. Upload via the webpanel Themes → Upload (calls `POST /api/informatic-themes/import-zip` with `name`, `plan`, optional `description`, `price`, `version`, `tags` — **include `travel` or `tour` in tags for travel sync**).
3. Install on a store → Apply → preview on `https://<subdomain>.<platform>/` or the theme-site URL.
4. Walk the QA checklist (07-qa-checklist.md) — homepage is never enough.

## 8. What to never build

- Auth, sessions, tokens, dashboards — platform-injected.
- API calls to Codiic backend — the platform injects everything; themes have no API contract.
- Payment capture — enquiries → bookings → manual confirmation; no payment rail exists in the webpanel stack.
- Admin/business dashboards — themes are storefronts only.
