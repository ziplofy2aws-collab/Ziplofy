# Tour Package Synchronization Specification

Complete lifecycle from dashboard creation to storefront pixels and back. Verified against `sectorController`, `webpanelStorefrontThemeSiteController.js`, `webpanelStorefrontTravelController.js`, `SectorRecord`, `industryConfig.js`.

## 1. Storage model

`webpanel_sector_records` (`SectorRecord`):

| Field | Type | Notes |
|---|---|---|
| `workspace` | ObjectId | isolation boundary — every query scopes by it |
| `industry` | string | `'tour_travel'` |
| `entity` | string | `'packages'` |
| `title` | string | searchable |
| `status` | string | `draft \| active \| sold_out \| inactive` |
| `data` | Mixed | all package fields (04 §3 list) |
| `archived` | bool | soft-delete; never rendered |
| `linkRefs` | [] | cross-entity links (enquiry→package, booking→enquiry) |
| `urlHandle`, `startsAt`, timestamps | — | slug + sort keys |

## 2. Dashboard CRUD (business side)

Routes (`webpanel/wabapanel-express/src/routes/sector.js`, all `protect` + `industryGate` + workspace scope):

```
GET    /api/sector/:industry/entities           → entity defs for forms
GET    /api/sector/:industry/overview           → counts per entity
GET    /api/sector/:industry/:entity            → list records (search/status/page)
GET    /api/sector/:industry/:entity/:id        → one record
POST   /api/sector/:industry/:entity            → create
PUT    /api/sector/:industry/:entity/:id        → update
DELETE /api/sector/:industry/:entity/:id        → archive (soft)
POST   /api/sector/:industry/:entity/:id/status → setStatus (+notify)
POST   /api/sector/:industry/:entity/:id/duplicate
POST   /api/sector/:industry/enquiries/:id/convert → enquiry → booking
```

"Delete" = `archived:true` — packages are never hard-deleted; `archived` records are excluded from every storefront query.

## 3. Storefront read path (request-time, uncached)

Every `GET /api/storefront/:storeId/theme-site/:themeId/*` HTML request:

1. `resolveSiteContext(storeId, themeId)` → store active, theme installed+applied, editor pack loaded.
2. `themeSupportsPackageSync(theme)` → travel gating (tags/name/slug/desc).
3. `fetchStoreLivePackages(store)` → `SectorRecord.find({workspace, industry:'tour_travel', entity:'packages', status:'active', archived:{$ne:true}}).sort(startsAt,createdAt).limit(48)`.
4. Serve-time transforms on the original file:
   - `injectBase` — `<base href>` for relative assets.
   - `rewriteDataJs` — if the file (or a linked JS) declares a record array, replace each array element with `recordToShape(rec, template, origin)` preserving the theme's own keys.
   - `injectLivePackageCards` — `findCardRuns` (sibling-shape detection + context gate) → clone first card per record via `mapCardToRecord`.
   - `detailPageRecord` — when `?id=`/`?pkg=` resolves a record on a detail-ish filename, map first `<img>`/`<h1>`/price/duration/location/description.
   - `neutralizeDemoFilters`, `patchBudgetConstants` — strip demo counts/ranges.
   - `applyContentOverrides` — saved editor text/image diffs.
   - `injectHeadSnippet` (theme settings), `injectEditorBridge`, `injectStorefrontLogin`, `injectStorefrontEnquiry`.

Sync model: **pull at serve time** — no cache invalidation, no events; an edit is visible on the next page load.

## 4. Record → theme field map

`recordToShape` (JS data channel) — record fills the template object's keys by name:

| Theme key | Source |
|---|---|
| `id`, `slug`, `handle`, `urlHandle` | `rec.urlHandle \|\| rec._id` |
| `title`, `name` | `rec.title` |
| `subtitle`, `tagline`, `summary`, `description`, `about`, `blurb`, `excerpt` | `shortDescription \|\| description` |
| `img`, `image`, `imageUrl`, `cover`, `thumbnail`, `photo` | `coverImage \|\| galleryImages[0]` (absolutized) |
| `gallery`, `images`, `photos` | `galleryImages[]` |
| `location`, `route`, `destination`, `dest` | `destination \|\| destinations[0]` |
| `destinations` (array key) | `destinations[]` slugified |
| `days`, `nights`, `durationDays/Nights` | `durationDays/Nights` |
| `duration`, `durationLabel/Text` | `X Days & Y Nights` |
| `price`, `basePrice`, `adultPrice` | `discountedPrice` if `0 < d < list`, else `basePrice→adult→child→infant` |
| `priceWas`, `compareAt`, `originalPrice`, `oldPrice`, `listPrice` | list price when a discount exists |
| `currency` | `data.currency` (default `INR`) |
| `badge` | category (title-cased) |
| `categories`, `types` | `['all', slugify(category)]` |
| `category` | `category` |
| `includ*`, `exclud*` | `inclusions[]`, `exclusions[]` |
| `url`, `href`, `link` | `'#'` (links rewritten by markup layer) |
| `rating`, `reviews`, `photoCount`, `features`, `seasons`, `offerLabel`… | **left as template demo value** — no record fields exist |

`mapCardToRecord` (markup channel) — DOM surgery on a cloned card: `data-pkg-id`→`rec._id`; `?id=`/`?pkg=` hrefs→id; `<img src/alt>`→cover/title; first heading→title; location element→destination; price node (₹ literal or `&#8377;`)→formatted price; duration text→`X Days & Y Nights`; leftover demo title in `aria-label`/alt swept.

## 5. Identity & linking

- Stable id = Mongo `_id` (`urlHandle` preferred when present for data-js `id`/`slug` fields; markup links always use `_id`).
- Cards link `package-detail.html?id=<_id>`; the detail request resolves `SectorRecord.findOne({_id, workspace, entity:'packages'})` (or `data.slug` match) → maps template.
- **Duplicate prevention:** none — records are independent docs; if staff creates two identical packages both render.
- **Missing record:** `?id=` matching nothing → page serves as authored (demo content).
- **Unpublished handling:** `status≠'active'` or `archived` → excluded from lists; direct detail link falls back to demo markup. No 404 signal to the theme.

## 6. Enquiry entry point

`POST /api/storefront/:storeId/travel-packages/:packageId/enquiries`
Body (verified): `{name, email, phone, travellers, travelDate, message?}` — injected script fills name/email/phone from the traveller session, `travellers`/`travelDate` from the form. Creates `enquiries` record (`ENQ-####`, `linkRefs`→package+traveller). Guest submission rejected — requires traveller auth first.

## 7. Sequence diagrams

```
Create/edit (dashboard)              Serve (storefront)
Panel → POST/PUT /api/sector/…       Browser → GET theme-site/…/packages.html
  → industryGate + workspace           → resolveSiteContext (install/applied)
  → SectorRecord upsert                → fetchStoreLivePackages (active ≤48)
                                       → rewriteDataJs | injectLivePackageCards
                                       → inject widgets → HTML → browser
Delete/unpublish                     Detail view
Panel → DELETE (archive) / status    Browser → package-detail.html?id=<_id>
  → archived:true                      → detailPageRecord → mapCardToRecord
  → next request excludes it           → enquiry widget bound
```

## 8. Verified behaviors / caveats

- New package visible ~immediately (next request; editorPack 30-min cache affects catalog metadata only, not records).
- `sold_out` packages are **excluded** (status filter = `active` only) — they disappear rather than showing a badge (gap, see 08).
- Packages without `basePrice`/`adultPrice` keep the theme's demo price text in markup channel (data-js channel gets `0`) — always fill prices.
- Max 48 records per injection; beyond that, no pagination in markup channel.
- Record image fields must be absolute URLs or the theme-site `absolutizeUrl` handles relative-to-origin paths.
