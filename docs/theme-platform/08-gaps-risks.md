# Known Gaps & Risks Report

Everything below is verified against source — either absent code paths, partial implementations, or architectural risks. Ordered by severity.

## A. Missing functionality

### A1. Non-travel industries have no storefront sync — *high*
Only `tour_travel` has the serve-time sync layer (`themeSupportsPackageSync`, `fetchStoreLivePackages`, `injectStorefrontEnquiry`, `injectStorefrontLogin`, `traveller-trips`). `ENTITIES` defines schemas for `real_estate`, `agency`, `legal`, `hospitality`, `salon`, `other_service` — but **no code reads them for storefront injection**. `healthcare` and `education` have *zero* entities. Healthcare's only live piece is `GET /api/storefront/:storeId/clinic` (doctors + booking slug, `featureOverrides.clinic`-gated).
**Impact:** MEDIVUE and every non-travel theme renders statically — no live services, no enquiry capture, no accounts.
**Fix path:** generalize the sync layer per-entity (`fetchStoreLiveRecords(entity)` + entity-aware `recordToShape` + injected enquiry/auth for service bookings).

### A2. Editor structural edits don't reach static pages — *high*
`collectContentOverrides`/`applyContentOverrides` map only **text and image-src** diffs onto static HTML. Section add/remove/reorder, new fields, and block edits persist to `WebpanelStoreInformaticThemeConfig` but affect only the contract (React) render — the live static page ignores them.
**Impact:** a merchant adding a section in the editor sees it in the preview iframe but never on the published storefront.
**Fix path:** structural override → DOM surgery at serve time, or document as limitation.

### A3. No customer-side booking — *medium*
Enquiries convert to bookings **only via staff** (`convertEnquiry`). No "pay and confirm" path exists — bookings `pending/confirmed/cancelled` are staff-driven; `payments[]` is staff-entered. No payment rail in the webpanel stack.
**Impact:** businesses expecting self-serve booking/checkout don't have it.

### A4. No guest enquiry — *medium*
The enquiry flow hard-requires traveller sign-in (injected gate). No anonymous/guest submission path.
**Impact:** friction for casual enquiries; conversion drop-off.

### A5. Traveller account features absent — *medium*
No password reset, no email/phone verification, no OAuth/social login, single-session-only (new login invalidates the old token), no profile editing, trips list unpaginated.
**Impact:** real-world account UX incomplete.

### A6. Notification coverage gaps — *medium*
`travelBookingNotify` fires on convert + confirm/cancel only. **No** email on enquiry *submission* (customer confirmation), no staff "new enquiry" alert, no SMS/WhatsApp. Requires SMTP creds in `themeConfig.settings.email` — silently disabled if unset.
**Impact:** customers get no acknowledgement; businesses may miss enquiries (must watch the dashboard).

### A7. `sold_out` packages disappear instead of showing state — *low*
Storefront query filters `status:'active'` — `sold_out`/`draft`/`inactive` are excluded, not badged. A "sold out" treatment needs either query widening or a per-card status badge (currently absent).

### A8. No enquiry spam control — *medium*
`POST …/travel-packages/:id/enquiries` is a public endpoint: no rate limit, CAPTCHA, or honeypot. `traveller-auth` likewise.
**Impact:** scripted spam/brute-force surface.

## B. Heuristic fragility (detection risks)

### B1. Card-run detection false negatives — *medium*
Detection requires: ≥3 same-shape siblings, each `<img>`, cardish tag/class, travel context nearby, not an excluded zone. Real failures seen: `header` proximity veto (fixed 2026-11), non-`<li>` wrappers, context keywords missing. A theme violating any rule silently renders demo data.
**Mitigation:** rules are now prescriptive (01 §4, 04 §4); conversion `report.warnings` should flag undetected lists (today it doesn't — gap).

### B2. Detail-page mapping is positional — *low*
First `<img>` = hero, first `<h1>` = title, first currency element = price. Themes putting nav logos above hero or prices before title mis-map. `?id=` for an unknown record falls back to demo markup **silently** — no "package not found" state.
**Mitigation:** explicit ordering rules (02 §3); add a not-found branch (gap).

### B3. `id` field inconsistency — *low*
`recordToShape` uses `rec.urlHandle || rec._id` for data-js `id`/`slug` keys; `mapCardToRecord`/`?id=` resolution uses `_id`. Records carrying a `urlHandle` can emit a data-js id that doesn't match the detail-page `_id` resolution.
**Fix:** normalize on `_id` for links, `urlHandle` only for display/slug fields.

### B4. Demo fields with no record counterpart — *low*
Ratings, review counts, season lists, offer labels, `photoCount` keep demo values (`recordToShape` deliberately skips them). Visible mismatches between cards are possible.
**Fix:** either add record fields (schema already allows `custom…`) or strip demo values.

## C. Architectural risks

- **Per-request record fetch** — `fetchStoreLivePackages` queries Mongo on every HTML request (≤48). No caching: correct freshness, but a traffic burst multiplies DB load. A short-TTL cache keyed by workspace+recordsVersion would help.
- **editorPack 30-min cache** — catalog metadata can be stale half an hour after an admin edits theme assets; records unaffected.
- **No pagination** in markup channel — >48 packages silently truncates. Data-js channel gets the same ≤48 array.
- **Single storefront host resolution** — `checkStoreSubdomain` maps host→store; a misconfigured `customDomain` serving a stale mapping shows the wrong store (needs monitoring of `WebpanelStoreDomain.status`).
- **`urlHandle`/slug resolution in detail pages** relies on `data.slug` — records without a slug match only by `_id`.
- **Contract themes vs static themes diverge** — `injectInformaticDataSources` (block-level binding) applies to the contract path only; static themes use the markup/js channels. A theme must pick its channel at author time — both exist and behave differently.

## D. Data-integrity gaps

- **No duplicate-package prevention** — identical titles/dates create parallel records; both render.
- **`data` is schema-lite** — `SectorRecord.data` is a Mixed bag; sector APIs validate only declared fields' presence, not types/ranges (negative prices, `nights>days`, past departure dates pass).
- **Booking↔package consistency** — a converted enquiry keeps the snapshot; package edits after conversion don't propagate to the booking record.
- **Soft-delete semantics** — archive hides from storefront; no "permanent delete" or restore UI path verified.
