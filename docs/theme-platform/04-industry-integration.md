# Industry Integration Handbook

How industries are registered, what each actually syncs to a storefront, and which theme tags apply. Every row verified in source — "configured" and "implemented" are distinguished.

## 1. The industry registry

`webpanel/wabapanel-express/src/utils/industryConfig.js`

- **`INDUSTRIES`** — canonical keys + aliases: `tour_travel`, `healthcare`, `education`, `real_estate`, `agency`, `legal`, `hospitality`, `salon`, `other_service`, plus e-commerce keys (`fashion`, `electronics`, `beauty`, `home`, `food`, `jewelry`, `sports`, `other_retail`).
- **`TAG_ALIASES`** — theme tag → industry matching. Example, `tour_travel`: `travel, travels, tour, tours, tourism, trip, trips, vacation, holiday, holidays, getaway, trek, trekking`.
- **`ENTITIES`** — per-industry `SectorRecord` entity definitions (statuses, searchable fields, field schema).
- **`destination`** — `'webpanel'` (service industries) vs `'codiic'` (e-commerce → separate product/catalog stack, NOT this theme pipeline).
- `themeMatchesIndustry` — catalog filtering by tags.
- `industryGate` middleware (`sector.js`) — sector APIs reject industries the store doesn't belong to.

## 2. What's actually implemented per industry

| Industry | SectorRecord entities | Storefront data sync | Enquiry/booking flow | Traveller auth | Status |
|---|---|---|---|---|---|
| `tour_travel` | packages, bookings, travellers, enquiries, settings | **Yes** — cards/data-js/detail page (`theme-site` controller); `GET /travel-packages` API | `POST /travel-packages/:id/enquiries` → enquiries → convert → bookings | `traveller-auth` + `traveller-trips` injected | **Full** |
| `healthcare` | **none in ENTITIES** | `GET /api/storefront/:storeId/clinic` only — `ClinicDoctor` list + `BookingSettings.slug`, gated by `featureOverrides.clinic` | No storefront endpoint — links to standalone booking slug | No | **Partial/bespoke** |
| `education` | none in ENTITIES | none | none | No | **Missing** |
| `real_estate` | properties, enquiries, siteVisits, clients, deals | none — records exist in dashboard only | none | No | **Config only** |
| `agency` | clients, projects, tasks, proposals | none | none | No | **Config only** |
| `legal` | clients, matters, hearings, documents | none | none | No | **Config only** |
| `hospitality` | reservations, guests, rooms, services, settings | none | none | No | **Config only** |
| `salon` | services, staff, customers, bookings, settings | none | none | No | **Config only** |
| `other_service` | services, bookings, customers, settings | none | none | No | **Config only** |
| e-commerce keys | (different stack) | codiic catalog/product APIs | codiic cart/orders | codiic customers | Separate platform |

**Critical implication:** today only `tour_travel` turns a static theme into a *live* storefront. Any other industry's uploaded theme renders statically — design preserved, editor works, but record lists/enquiries/accounts don't sync. Healthcare's clinic endpoint is a narrow exception.

## 3. Tour & Travel — entities and fields

`ENTITIES.tour_travel` in `industryConfig.js`:

- **packages** — statuses `draft/active/sold_out/inactive`; search `title,code,destination,category`; subtitle `destination`; date `departureDate`. `data` fields: `title, code, destination, destinations[], category, country, region, coverImage, galleryImages[], tags[], shortDescription, description, durationDays, durationNights, dateType, departureDate, returnDate, bookingOpens, bookingCloses, minTravellers, maxTravellers, currency, priceBasis, basePrice, adultPrice, childPrice, infantPrice, discountedPrice, inclusions[], exclusions[], itinerary[] (day-wise), custom…`
- **bookings** — statuses `pending/confirmed/cancelled`; code `TVL-####`; fields: package ref, travellers, travelDate, contact info, payments[] (staff-entered).
- **enquiries** — statuses `new/contacted/converted/closed`; code `ENQ-####`; fields: name/email/phone, travellers, travelDate, message, packageId.
- **travellers** — auth records: name, email, phone, `passwordHash` (bcrypt), `sessionToken` (one active session), trips derived.
- **settings** — singleton per workspace (e.g., email/SMTP block used by notifications).

## 4. The 12 travel theme rules (verified against detection code)

1. `index.html` at root; real `.html` pages, `<a href>` nav.
2. Relative paths only (`assets/…`, `packages.html`); never `/…`.
3. Packages = ≥3 same-shape sibling cards each with `<img>` **or** a recognized JS data array.
4. Package region carries travel context (`tour, packag, dest, voyage, stay, itinerar…`).
5. Package regions never named `testimonial/team/nav/footer/stories/logo/newsletter/faq/feature/stat`…
6. Cards carry `data-pkg-id` + link `package-detail.html?id=<id>` — both rewritten to live ids.
7. Card internals: `h1–h6` title, `<img>`, location (text or pin icon), currency amount, `X Days & Y Nights`.
8. Detail filename contains `detail|tour|trip|itinerar|product`; static markup; first `<img>`=hero, first `<h1>`=title, hero/title/price before related-tours.
9. Booking widget: `*date*` input + traveller field (input/select named `traveller|pax|guest|adult|passenger`) + CTA text (`check availability`, `book now`, `enquire`, `reserve`, `get a quote`…).
10. Nav link reading `Sign in`/`My account` — platform wires auth.
11. Tag theme `travel`/`tour` at upload → `themeSupportsPackageSync` gate.
12. Currency literal `₹` or entity `&#8377;` both handled.

Rule 11's gate (`themeSupportsPackageSync`, theme-site controller): travel term in tags/name/slug/description → sync ON; explicit other-industry terms → OFF; ambiguous → defaults ON for safety.

## 5. MEDIVUE / healthcare specifics

- MEDIVUE is a **healthcare** static theme; store industry `healthcare` has **no** entities → no card sync regardless of markup. The only live piece: if the owner has `featureOverrides.clinic=true`, `GET /api/storefront/:storeId/clinic` returns `{enabled, clinicName, bookingSlug, doctors[]}` (`webpanelStorefrontClinicController.js`, models `ClinicDoctor`, `BookingSettings`).
- No injected auth/enquiry widget for healthcare → MEDIVUE's appointment forms have nothing to post to.
- **Recommendation (not implemented):** a generic `services`/appointments entity + healthcare gate analogous to `themeSupportsPackageSync` would close this; tracked in 08-gaps-risks.
