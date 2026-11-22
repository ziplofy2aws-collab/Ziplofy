# travelDocRef — Travel Theme Development Reference

**Audience:** theme developers building travel/tour themes for upload into the Informatic / Ziplofy theme system.

**What this guarantees:** a theme that follows this document uploads cleanly, converts into the Theme Editor, renders its original design on the storefront, receives **live tour packages, traveller sign-in/sign-up, enquiries, bookings and status visibility** automatically — with **zero backend changes** per theme.

---

## 1. What happens to your theme after upload

| Stage | What the platform does |
|---|---|
| Upload (ZIP or folder) | Your files are preserved byte-for-byte under a `contentRoot`. `index.html` + sibling `.html` files are detected as pages; assets (css/js/images/fonts) are kept as-is. |
| Editor conversion | Each `.html` page is converted into editable contract sections (hero, features, pricing cards, rich text…) so the Theme Editor can select and edit text/images/colors/fonts. |
| Storefront render | Visitors see your **original HTML/CSS/JS** served through `/api/storefront/:storeId/theme-site/:themeId/…` — pixel-accurate. |
| Live data injection | At serve time the platform injects real store data into your theme — package records, the auth widget, the enquiry hook. **Your source files are never modified** — everything happens in the response. |
| Industry gating | Travel features activate only when (a) the theme is tagged travel (`tour`, `travel`, `tourism`, `stay`, `holiday`, `destination`…), (b) the store's industry is `tour_travel`, and (c) the theme is the store's **installed + applied** theme. Other-industry tags (`beauty`, `fashion`, `food`…) explicitly disable sync. |

---

## 1A. The rules — follow all of these and every feature works

| # | Rule | Why |
|---|---|---|
| 1 | Ship `index.html` at the theme root; every page a real `.html` file linked by `<a href>` | routing/navigation preserved |
| 2 | All asset + page paths **relative** (`assets/…`, `packages.html`) — never `/…` root-absolute | the site is served under a proxy path |
| 3 | Packages must exist as **≥ 3 same-shape sibling cards each containing an `<img>`**, OR a JS data array (§4) | that's how live records get injected |
| 4 | Give the card list a **travel-ish context**: class/id/section/heading containing `tour`, `packag`, `dest`, `trip`, `travel`, `stay`, `voyage`, `journey`, `holid`, `experien`, `getaway`, `itinerar`, `resort`, `hotel`, `vacation`, `adventure`… | the injector ignores unrelated repeated markup (testimonials, teams, galleries) |
| 5 | Never class package cards/containers `testimonial`, `stories`, `team`, `nav`, `footer`, `review`, `blog`, `logo`, `avatar`, `newsletter`, `faq`, `feature`, `step`, `counter`, `stat` | excluded regions are never rewritten |
| 6 | Each card carries `data-pkg-id="<demo-id>"` and links `package-detail.html?id=<demo-id>` | platform rewrites both to the live record id — detail page + enquiry attach correctly |
| 7 | Card internals: `<h1–h6>` title, an `<img>`, a location element (class with `loc|place|dest|city|country|region` or a pin `<i>`/`svg` next to the text), a price element with a currency amount (`₹45,000` or `&#8377;45,000`), duration text (`6 Days & 5 Nights` / `7D/6N`) | each piece is swapped per record — missing piece = stays as designed |
| 8 | Name your detail page something matching `detail`/`package`/`tour`/`trip`/`itinerar`/`product` (e.g. `package-detail.html`) and render it as a **full static page** — first `<img>` = hero/cover, first `<h1>` = package title, a visible currency price | the `?id=` record is mapped straight into the page — no JS needed |
| 9 | Booking widget needs: a **date input** (`input[type="date"]` preferred — or any input/select with `date` in name/id/placeholder) + a **traveller field** (`− N +` stepper, number input, or `<select>`/input named `traveller`/`traveler`/`pax`/`guest`/`adult`/`passenger`) + a CTA whose text is from §6.1 verbatim | the injected enquiry script reads exactly these |
| 10 | Include a nav link reading `Sign in` / `Log in` / `My account` / `Account` | auto-wired to the injected auth panel — never build your own login |
| 11 | Tag the theme `travel` or `tour` at upload | gates the whole sync layer to travel themes only |
| 12 | Currency can be literal (`₹`) or HTML entity (`&#8377;`) — either is fine | price replacement handles both |

Anything outside these rules still renders — it just won't be wired to live data.

---

## 2. Required package structure

```
my-theme/
├── index.html            ← REQUIRED — the home page (entry point)
├── packages.html         ← packages/tours listing page
├── package-detail.html   ← single-package detail page (recommended)
├── about.html, contact.html …  ← any other pages
└── assets/
    ├── css/…  js/…  images/…  fonts/…   ← relative paths preserved
    └── js/packages-data.js   ← package data file (see §4)
```

Rules:

- **Exactly one `index.html`** marks the content root (shortest path wins if several exist). Everything siblings-level is served.
- Use **relative paths** for all assets/links (`assets/css/style.css`, `packages.html`) — a `<base>` tag is injected at serve time, so root-relative `/assets/…` paths would point at the wrong origin. Do **not** hard-code `http://localhost/…` or CDN-incompatible absolute paths.
- Link pages with real `<a href="packages.html">` links — the editor's page picker reads them to build the page dropdown.
- Hidden files (`.foo`) and common junk (`__MACOSX`, `.DS_Store`, `node_modules`) are skipped on import.
- **Tag the theme for travel** at upload (`tour` / `travel` / `tourism` / `stay` / `holiday` / `destination` in tags or name). Missing tags still sync when industry is undetermined, but **any non-travel industry tag blocks it**.

---

## 3. Page conventions

| File | Becomes | Notes |
|---|---|---|
| `index.html` | Home page | Hero + featured cards render here |
| `packages.html` | Packages listing | Card list or JS-driven grid of all packages |
| `package-detail.html` | Package detail | Reads `?id=` from the URL (see §6.3) |
| `about.html`, `contact.html` … | Content pages | Converted to editable sections |

Use descriptive filenames — the editor's page picker shows them as humanized labels (`packages.html` → "Packages").

---

## 4. Live package data — JS data files (primary contract)

If your theme renders cards from a JS data array, the platform **rewrites that array with live tour-package records** while preserving your object's own shape. This is the most reliable channel — use it whenever possible.

### 4.1 Accepted declaration styles

Any array of package-like objects, declared in any of these forms:

```js
// ✅ all of these are detected and rewritten with live data
window.TRAVELORA_PACKAGES = [ {…}, {…} ];
globalThis.PACKAGES = [ {…} ];
self.TOURS = [ {…} ];
const PACKAGES = [ {…} ];
let toursData = [ {…} ];
var DATA = { packages: [ {…} ] };   // object-property arrays too
```

**Detection rule:** the first object in the array must contain **≥ 3** of these keys:
`title, name, price, img, image, days, nights, duration, destination, location, gallery`.
Nav menus / non-record arrays are detected and left untouched.

### 4.2 Record shape — what we fill for you

Your template object's keys are mapped **by name** — keep your own structure and key names; live values are filled into the matching keys:

| Your key (case-insensitive, fuzzy) | Filled with | Source field |
|---|---|---|
| `id`, `slug`, `handle`, `urlHandle` | record id (or `urlHandle`) | record `_id` |
| `title`, `name` | package title | `title` |
| `subtitle`, `tagline`, `summary`, `description`, `about`, `blurb`, `excerpt` | short description | `shortDescription` → `description` |
| `img`, `image`, `imageUrl`, `cover`, `thumbnail`, `photo` | cover image URL (absolute) | `coverImage` → `galleryImages[0]` |
| `gallery`, `images`, `photos` | image URL array | `galleryImages` |
| `location`, `route`, `destination`, `dest` | destination text | `destination` → `destinations[0]` |
| `destinations` | slug array | `destinations` (slugified) |
| `days`, `durationDays` | number | `durationDays` |
| `nights`, `durationNights` | number | `durationNights` |
| `duration`, `durationLabel`, `durationText` | `"5 Days & 4 Nights"` | derived |
| `price`, `basePrice`, `adultPrice` | effective price (discounted if lower) | `basePrice`/`adultPrice`/`discountedPrice` |
| `priceWas`, `compareAt`, `originalPrice`, `oldPrice`, `listPrice` | strike-through price when discounted | `basePrice`/`adultPrice` |
| `currency` | `"INR"` etc. | `currency` |
| `category` | category text | `category` |
| `categories`, `types` | `["all", "<slug>"]` | derived from `category` |
| `badge`, `badgeLabel` | Title-cased category | `category` |
| `includ…` | inclusions array | `inclusions` |
| `exclud…` | exclusions array | `exclusions` |
| `url`, `href`, `link` | `"#"` (wire your own detail link — see §6.3) | — |
| `rating`, `reviews`, `photoCount`, `features`, `seasons`, `offerLabel` … | **kept from your template** (presentation fields) | — |

Keys we don't recognize keep your template's demo values — so decorative fields (ratings, badges) never break.

### 4.3 Canonical record example (recommended baseline)

```js
window.TRAVELORA_PACKAGES = [
  {
    id: 'demo-1',
    title: 'Darjeeling Tea Trails',
    subtitle: 'Sunrise at Tiger Hill',
    image: 'assets/img/darjeeling.jpg',
    gallery: ['assets/img/d1.jpg', 'assets/img/d2.jpg'],
    location: 'Darjeeling, India',
    destinations: ['darjeeling'],
    days: 5,
    nights: 4,
    duration: '5 Days & 4 Nights',
    price: 24999,
    currency: 'INR',
    category: 'hill',
    categories: ['all', 'hill'],
    badge: 'Bestseller',
    inclusions: ['Stay', 'Meals', 'Transfers'],
    url: 'package-detail.html',
  },
  // …a few demo records (they will be replaced by live data)
];
```

---

## 5. Live package data — hard-coded HTML cards (fallback)

Themes with **no JS data file** still get live packages. The platform finds runs of **≥ 3 consecutive same-shape sibling cards containing an `<img>`** and clones your card markup per live record.

### 5.1 What counts as a card

- Tags: `<article>`, `<li>`, `<figure>`, or `<div>`/`<a>`/`<section>` **only when the class matches**: `card, tour, pack, packag, dest, trip, stay, slide, tile, post, entry, product, offer, deal, room, suite, villa, listing, item`.
- Must contain an `<img>`.
- Must be **direct siblings** (whitespace/comments between them only) — **wrapping each card in a bare `<li>` inside a `<ul>`/`grid` is fine** and is the recommended semantic markup.
- A `<div>` that wraps `<article>/<li>/<figure>` children is treated as a container, not a card — the repeated element itself is what gets cloned.

### 5.2 Where cards are allowed

The card's own classes, nearby container/section attributes, or the last ~2 headings must match a travel context:

`dest, tour, packag, trip, travel, stay, holid, experien, cruise, safari, trek, journey, voyage, itinerar, getaway, resort, hotel, excursion, adventure, vacation, offer, deal, room, suite, villa, cabin, listing, product`

**Explicitly excluded regions** (never rewritten):
`stories, testimonial, review, blog, news, journal, team, partner, faq, brand, client, logo, instagram, subscriber, newsletter, footer, header, nav, social, avatar, quote, comment, step, service, feature, benefit, counter, stat`

### 5.3 What gets swapped inside each card

| Element | Mapping |
|---|---|
| First `<img>` | `src`/`srcset`/`alt` → cover image + title |
| First heading (`h1–h6`) | package title — **remaining mentions** of the old title (`aria-label`, `alt`, captions) are swept too |
| Location element (class containing `loc|place|dest|city|country|region`, or parent of a pin/map-icon `<i>`/`svg`) | destination — **icon is preserved** |
| First currency amount — literal `₹$€£` **or HTML entity** (`&#8377;`, `&euro;`…) + digits | live price (symbol/entity kept) |
| Duration text (`5 Days & 4 Nights`, `7D/6N`, `10 Days`) | live duration |
| `data-pkg-id` + `?id=` inside `href`s | **rewritten to the live record's `_id`** — detail links always resolve the real package |

```html
<!-- ✅ ideal hard-coded card shape -->
<section class="destinations">
  <h2>Popular Destinations</h2>
  <article class="dest-card" data-pkg-id="demo-1">
    <img src="assets/img/greece.jpg" alt="Santorini">
    <h3>Santorini Escape</h3>
    <p class="location"><i class="icon-pin"></i> Greece</p>
    <span class="price">₹45,000</span>
    <span class="duration">6 Days & 5 Nights</span>
  </article>
  <!-- 3+ siblings like this -->
</section>
```

### 5.4 Static detail pages — `package-detail.html?id=<id>`

Detail pages need **no JS at all**. When the page is served with a `?id=`/`?pkg=` param that resolves to a live record (record `_id` or `data.slug`), and the filename matches `detail|package|product|tour|trip|itinerar`, the record is mapped into the **whole page** using the same field rules as §5.3:

- first `<img>` → hero/cover image (+ alt = title)
- first `<h1>` (any `h1–h6`) → package title
- first currency amount (literal or entity) → live price
- location element → destination · duration text → live duration

So a fully static `package-detail.html` renders the clicked package correctly — hero, title, price all live. "Related package" card runs on the same page are independently replaced (each keeps its own correct `?id=` link).

**Layout rule:** put the package hero/title/price *before* any "related tours" section so the first-heading/first-img mapping hits the package, not a related card.

---

## 6. Enquiry / "Check availability" wiring

The platform injects a script that turns your booking CTA into a **real enquiry** — no theme-side code needed.

### 6.1 CTA detection

Any `<button>` or `<a>` whose text (≤ 48 chars) matches:

`check availability, book now, book this, book package, reserve, enquire, enquiry, send enquiry, request a callback, request a quote, get a quote`

While the editor inspector is off, clicking the CTA **submits an enquiry instead of navigating**.

### 6.2 Fields read from your markup

| Field | How it's found | Rule |
|---|---|---|
| **Departure date** | `input[type="date"]` (preferred), or `input`/`select` with `name`/`id`/`placeholder` containing `date` — inside the CTA's booking container | **Required** — missing → red outline + "Please select a departure date first" |
| **Traveller count** | a 1–2 digit number sitting between two `<button>`s (your `− 2 +` stepper); a number input; or an `input`/`<select>` whose `name` contains `traveller`, `traveler`, `pax`, `guest`, `adult`, or `passenger` (option values like `"3-4"`/`"5+"` are parsed) | defaults to 1 |
| **Package identity** | resolution order → (1) `data-pkg-id` on the CTA's card → (2) `?id=` or `?pkg=` URL param → (3) `sessionStorage.traveloraSelectedPackage.id` → (4) first `[data-pkg-id]` on the page → (5) `window.TRAVELORA_PACKAGES[0].id` | required to submit |

> **Best practice:** put `data-pkg-id="<record-id>"` on each listing card (your JS can render `p.id`) and make detail-page links `package-detail.html?id=<id>` — then every CTA is unambiguous.

### 6.3 What the user experiences

1. Picks travellers + date → clicks CTA
2. **Validation** — date required; package must resolve
3. **Not signed in** → the sign-in panel opens; on successful sign-in/sign-up the enquiry **auto-submits**
4. Green toast: `Enquiry sent — ENQ-000X. Our travel team will contact you shortly.`

---

## 7. Traveller auth (login / signup)

A fully-working account widget is injected into every served page of travel themes — **do not build your own auth**.

- **UI:** floating "Sign in" button (bottom-right) → dark Codiic-branded panel (yellow `#FBBF24` accent): Sign in ⇄ Create account.
- **Auto-hook:** any nav link whose text is exactly `sign in`, `log in`, `log on`, `sign up`, `my account`, or `account` (case-insensitive) is rewired to open the panel — so include one in your header and it Just Works.
- **Session:** opaque token persisted in `localStorage` (`informatic-traveller:<storeId>`); survives reloads; "Sign out" clears it.
- **Records created:** signup creates a `travellers` record in Tour & Travel (name/email/phone, bcrypt-hashed password, linked contact).
- **My trips:** the signed-in panel shows the traveller's enquiries + bookings with live status badges (`Enquiry received → Converted to booking → Pending confirmation → Confirmed`) — this is the customer's visible proof their booking was received/confirmed.

Programmatic hooks (rarely needed):

```js
window.__informaticOpenLogin();                       // open the sign-in panel
document.addEventListener('informatic-traveller-auth', fn);  // fired on login/signup
```

---

## 8. Status model (what staff sees vs what the customer sees)

### Enquiries (entity `enquiries`, auto-ref `ENQ-####`)

`new → contacted → qualified → quotation_sent → converted | lost`

Customer-facing labels in My Trips: *Enquiry received, Contacted, Qualified, Quote sent, Converted to booking, Closed.*

### Bookings (entity `bookings`, auto-ref `TVL-####`)

`draft → pending → confirmed → completed | cancelled | no_show`

Customer-facing labels: *Draft, Pending confirmation, Confirmed, Cancelled, Completed, No show.*

### Notifications

- **Convert to booking** (staff action) → customer gets a "Booking request received" email + My Trips shows the enquiry as *Converted to booking* alongside the new pending booking.
- **Confirm / Cancel** in the bookings panel → status email + badge updates live.
- Emails require the store's theme SMTP settings (Theme settings → email). My Trips works regardless.

---

## 9. Public API surface (already wired — for reference)

All under `/api/storefront/:storeId`, no staff auth:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/theme-site/:themeId/<path>` | Serve theme files (with injections) |
| `GET` | `/travel-packages` | List live tour packages |
| `GET` | `/travel-packages/:id` | Single package detail |
| `POST` | `/travel-packages/:id/enquiries` | Create enquiry — `{name*, email*, phone, travellers, travelDate: "YYYY-MM-DD", message}` → `{enquiryId, enquiryRef}` |
| `POST` | `/traveller-auth` | `{mode:"login"|"signup", name?, email*, password*, phone?}` → `{traveller: {id, name, email, phone, sessionToken}}` |
| `GET` | `/traveller-trips?email=&token=` | Traveller's enquiries + bookings with statuses (requires `sessionToken`) |

---

## 10. Tour & Travel data schema (what a package record contains)

Entity `packages` — fields your theme can rely on being set in the admin panel:

```
title, code, destination, destinations[], category, country, region,
coverImage, galleryImages[], tags[], shortDescription, description,
durationDays, durationNights, dateType, departureDate, returnDate,
bookingOpens, bookingCloses, minTravellers, maxTravellers,
currency, priceBasis, basePrice, adultPrice, childPrice, infantPrice,
discountedPrice, taxPercent, addons[{title, price}]
```

`travellers`: `name, displayName, dob, nationality, phone, email, city, country, address, emergencyContactName/Phone, passportNo, passportExpiry, visaNotes, preferredDestinations[], travelType, accommodationPref, dietary, accessibility, notes`

`enquiries`: `enquiryRef, name, phone, email, destinations[], packageId→link, travelDate, dateFlexibility, paxCount, budgetMin/Max, tourType, accommodationPref, source, specialRequirements, nextFollowUp, contactLog[]`

`bookings`: `bookingRef, customerName, phone, email, packageId→link, leadTravellerId→link, travellerIds[]→links, departureDate, returnDate, adults, children, infants, roomPreference, transportPreference, addons[], specialRequests, source, enquiryId→link, subtotal/taxAmount/discount/total/paidTotal/balance, payments[], refundAmount, cancelReason`

---

## 11. Editor compatibility (how your markup becomes editable)

- The converter maps each page into contract sections — **clear semantic structure converts best**: use `<section>` with a heading (`h1–h3`) per block, `<header>`/`<footer>` landmarks, and real `<img>` tags (not CSS `background-image` for editable images).
- **Editable in the editor → live on the site after Save:** text (fields named heading, title, subheading, eyebrow, label, ctaLabel, buttonLabel, body, description, tagline…), images (any setting containing `image|img|photo|picture|avatar|logo|poster|media`), colors and fonts (CSS-variable injection).
- **Not editable on the static canvas:** adding/removing/reordering sections — those live in the contract layer only. Design for content swaps, not structural rewrites.
- Demo **price-range/destination filters are neutralized** automatically at serve time so live records always show — don't rely on hard-coded filter bounds.

---

## 12. Do / Don't checklist

**DO**
- ✅ Ship an `index.html` + real multi-page links (`<a href="…">`)
- ✅ Keep a JS data array (`window.X = [...]`) as the single source of cards — best sync quality
- ✅ Put `data-pkg-id` on cards; link details as `package-detail.html?id=<id>`
- ✅ Wrap cards in bare `<li>`s inside a `<ul class="…-grid">` — semantic and detected
- ✅ Name the detail page `package-detail.html` (or anything containing `detail`/`tour`/`trip`/`itinerar`/`product`) — its `?id=` param maps the record into hero/title/price automatically
- ✅ Put the package hero/title/price **above** any "related tours" section on detail pages
- ✅ Use `input[type="date"]` and a real `− N +` stepper or a `traveller`-named `<select>` in booking widgets
- ✅ Use CTA text from §6.1 verbatim ("Check availability", "Book now"…)
- ✅ Include a "Sign in" link in your nav — it's auto-wired
- ✅ Use travel-ish class names (`dest-card`, `tour-card`, `package-item`, `pkg-card`) on repeated cards
- ✅ Tag the theme `travel`/`tour` on upload

**DON'T**
- ❌ Root-absolute asset paths (`/assets/…`) — keep relative
- ❌ Inline `<script>`-generated *only* card markup with no fallback — either a data array or ≥3 hard-coded sibling cards
- ❌ Cards nested inside other cards, or non-sibling card layouts
- ❌ `stories`/`testimonial`/`team`/`nav`/`footer` classes on package cards — they're excluded regions
- ❌ Your own login/auth UI — the widget is injected; duplicate panels confuse users
- ❌ Hard-code demo-only filters that would hide records (they're neutralized anyway)
- ❌ Icon-only location/price elements where the price sits inside an `<i>` tag — keep text in a real element

---

## 13. Reference skeleton

```html
<!-- index.html -->
<header><nav>
  <a href="index.html">Home</a>
  <a href="packages.html">Packages</a>
  <a href="#contact">Contact</a>
  <a href="#login">Sign in</a>          <!-- auto-opens the auth panel -->
</nav></header>

<section class="hero"><h1>…</h1></section>

<section class="destinations">
  <h2>Featured Tours</h2>
  <article class="dest-card" data-pkg-id="…">
    <img src="assets/img/t1.jpg" alt="">
    <h3>…</h3>
    <p class="location"><i class="icon-pin"></i> …</p>
    <span class="price">₹…</span>
    <span class="duration">…</span>
    <a href="package-detail.html?id=…">View details</a>
  </article>
  <!-- 3+ sibling cards -->
</section>
```

```html
<!-- package-detail.html -->
<aside class="booking-widget">
  <div class="travellers-stepper">
    <button type="button">−</button><span>2</span><button type="button">+</button>
  </div>
  <input type="date" name="departure">
  <button type="button">Check availability</button>   <!-- → real enquiry -->
</aside>
```

```js
// assets/js/packages-data.js — the live-data contract
window.TRAVELORA_PACKAGES = [ { id, title, image, location, days, nights, price, … } ];
```

Follow this document and your theme uploads → converts → renders → syncs with zero per-theme backend work.
