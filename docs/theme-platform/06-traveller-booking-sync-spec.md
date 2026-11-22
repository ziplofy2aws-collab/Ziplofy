# Traveller & Booking Synchronization Specification

Customer identity, enquiry, booking, status and notification lifecycle. Verified against `webpanelStorefrontTravelController.js`, `sectorController` (`convertEnquiry`, `setStatus`), `travelBookingNotify.util.js`, and the injected storefront scripts.

## 1. Entity separation (do not conflate)

| Record | Entity | Created by | Statuses |
|---|---|---|---|
| Traveller account | `travellers` | `traveller-auth` (signup) | — |
| Enquiry | `enquiries` (`ENQ-####`) | storefront enquiry POST | `new, contacted, converted, closed` |
| Booking | `bookings` (`TVL-####`) | staff `convertEnquiry` | `pending, confirmed, cancelled` |

A booking is **never** created by the customer — an enquiry is converted by staff, then staff flip booking status. Enquiry and booking are linked via `linkRefs`, not merged.

## 2. Traveller identity

`POST /api/storefront/:storeId/traveller-auth` — `{mode:'signup'|'login', name, email, phone?, password}`

- Signup → creates `travellers` record `{data:{name,email,phone,passwordHash:bcrypt}}` scoped to store workspace; returns `{token, traveller:{name,email}}`.
- Login → verifies bcrypt, rotates `sessionToken` (single active session per traveller).
- Session persists client-side in `localStorage` (injected script); token + email identify the traveller.
- **No** password reset, email verification, or OAuth — gaps, see 08.
- Sign-in entry point = theme nav link ("Sign in"/"My account") auto-wired by `injectStorefrontLogin`.

## 3. Enquiry flow (verified request/response)

Injected script flow:

1. Visitor clicks a recognized CTA (`check availability`, `book now`, `enquire`, `reserve`, `get a quote`…).
2. Script collects `travelDate` from `*date*` fields and count from `traveller|pax|guest|adult|passenger` inputs/selects.
3. If not signed in → injected auth modal; the CTA resumes after login.
4. `POST /api/storefront/:storeId/travel-packages/:packageId/enquiries`

   ```json
   {"name":"Asha","email":"a@b.com","phone":"…","travellers":2,"travelDate":"2026-01-10","message":"…"}
   ```
5. Backend resolves the package **within the same workspace** (`_id` or slug), creates the `enquiries` record with `linkRefs`→{package, traveller}, status `new`.
6. Success UI is injected (toast/modal); failure surfaces a message — themes need no handling.

`packageId` = the live `_id` that was written into `data-pkg-id`/detail URL — identity is carried through the markup itself.

## 4. Staff workflow (dashboard)

- Enquiries list: `GET /api/sector/tour_travel/enquiries` — shows name, contact, package link, travellers, date, message, status.
- Convert: `POST /api/sector/tour_travel/enquiries/:id/convert` → creates `bookings` record `{code:'TVL-####', status:'pending', data:{package, traveller contact, travellers, travelDate, linkRefs:{enquiry}}}` and marks enquiry `converted`.
- Status change: `POST /api/sector/tour_travel/bookings/:id/status` `{status:'confirmed'|'cancelled'}` (+ optional notes); `setStatus` also emits notification hook.
- All queries scoped `{workspace, industry:'tour_travel'}` — store isolation enforced by `industryGate` + `assertStoreForUser`.

## 5. Customer visibility

`GET /api/storefront/:storeId/traveller-trips?email=…&token=…`

Returns the traveller's `enquiries[]` + `bookings[]` (status, code, package title, travelDate, travellers) — rendered by the injected "My trips" panel after sign-in. Status changes (`pending→confirmed→cancelled`) reflect on next fetch.

## 6. Notifications

`travelBookingNotify.util.js` — called from `convertEnquiry` and `setStatus`:

- SMTP transport built from `themeConfig.settings.email` (the *applied theme's* saved settings — hosts, creds entered by the business in the Theme Settings sheet).
- Emails to the **traveller**: enquiry→booking conversion, booking confirmed, booking cancelled.
- Emails to the **business** (owner address): new booking notification.
- No SMS/WhatsApp/push; no email on enquiry *creation* to the customer (gap — see 08).

## 7. Data-flow summary

```
Visitor ─click CTA→ injected script ─POST enquiries→ SectorRecord(enquiries, new)
   ▲                                                      │ dashboard list
   │                                                        ▼ staff convert
   │                                            SectorRecord(bookings, pending)
   │                                                        │ status → confirmed/cancelled
   │                                                        │ notify (SMTP)
   └────────── GET traveller-trips (email+token) ◄── enquiries[] + bookings[]
```

## 8. Supported capture fields (verified — do not invent more)

Storefront enquiry accepts only: `name`, `email`, `phone`, `travellers` (number), `travelDate` (ISO/date string), `message`. Children/infant counts, special-requests, and per-traveller detail fields exist in the package schema (`minTravellers`, `maxTravellers`, child/infant prices) but are **not** captured by the enquiry contract — they're business-side fields only.

## 9. Security posture

- Enquiry endpoint is public POST (no auth header needed at HTTP level; the injected script gates on session). Package resolution is workspace-scoped → no cross-store record access.
- `traveller-auth` has no rate limiting/CAPTCHA — brute-force/credential-stuffing risk (08).
- Passwords only ever as bcrypt hash in `data.passwordHash`; plaintext never stored or logged (verified no logging in the controller).
