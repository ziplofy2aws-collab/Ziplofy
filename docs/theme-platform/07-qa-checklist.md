# Theme QA & Approval Checklist

Gate for approving a submitted theme. **Fail any ★ item → reject.** Non-starred failures → conditional approval with noted defects.

## A. Upload & structure

- [ ] ★ ZIP/folder uploads without error; `index.html` detected at content root
- [ ] ★ All pages present; no missing/duplicate HTML files; every nav `<a href>` resolves (no 404s through the theme-site proxy)
- [ ] ★ All CSS/JS/images/fonts load — DevTools network panel shows zero failed requests under `/api/storefront/…/theme-site/…`
- [ ] No absolute `/…` paths, `http://localhost` references, `file://`, or mixed-content (http asset on https page)
- [ ] No secrets, keys, or credentials anywhere in the theme source
- [ ] Conversion report warnings reviewed (`import` response `report`/`warnings`) — no dropped sections that break the page

## B. Theme Editor

- [ ] ★ Theme opens in `/client/themes/informatic-editor` without errors; preview renders
- [ ] Sections appear in the sidebar tree; inspector click selects the correct element
- [ ] ★ Text edits apply live in preview; image swaps apply; theme settings (colors/fonts) apply
- [ ] ★ Save → reload → changes persist (`GET …/informatic-theme-config/:themeId` returns saved config)
- [ ] Section add/remove works in the contract preview (note: static pages keep structure — verify editor expectations documented)

## C. Storefront rendering

- [ ] ★ Installed + applied theme renders the *original* design on the storefront host — not a generic contract UI
- [ ] ★ Navigation works page-to-page through the proxy; back/forward history sane
- [ ] Responsive: desktop/tablet/mobile viewports all render correctly
- [ ] ★ Zero console errors on every page; theme JS executes (carousels, menus, animations work)
- [ ] Switching applied theme → old theme's assets no longer served (theme-scoped URLs)

## D. Package synchronization (travel themes)

- [ ] ★ Create a package in dashboard → appears on storefront cards on next page load
- [ ] ★ Card shows live title, cover image, destination, price (`₹` formatted), `X Days & Y Nights`
- [ ] `data-pkg-id` on rendered cards = real Mongo `_id`
- [ ] ★ Click card → `package-detail.html?id=<_id>` → detail page shows *that* record's hero/title/price/duration/location/description
- [ ] Edit package (title/price/image) → storefront updates on reload
- [ ] ★ Archive a package → disappears from lists; direct detail URL falls back to demo markup (document the behavior)
- [ ] Set status `draft`/`inactive`/`sold_out` → excluded from storefront
- [ ] Demo cards fully replaced — no leftover demo titles in `aria-label`/alt/text
- [ ] JS data-file themes: `window.X` array contains live records shaped on the theme's template keys
- [ ] Packages without price → demo price remains (document); verify business fills prices

## E. Traveller & enquiry workflow

- [ ] ★ "Sign in"/"My account" nav link opens the injected auth modal
- [ ] Signup → creates `travellers` record; login returns session; "My trips" panel renders
- [ ] ★ CTA (`Check Availability`/`Book now`) → collects date + travellers → requires sign-in → submits
- [ ] ★ `enquiries` record created with correct package link, contact, travellers, date (`ENQ-####` in dashboard)
- [ ] My-trips shows the enquiry immediately
- [ ] Staff convert → `bookings` `TVL-####` `pending`; enquiry → `converted`
- [ ] Status → `confirmed`/`cancelled` → trips panel updates; notification email sent (if SMTP configured)
- [ ] Invalid date / missing travellers → form blocks or submits gracefully with a surfaced error
- [ ] Unavailable (`sold_out`/archived) package → no card, no enquiry path
- [ ] Double-submit → check whether duplicate enquiries are created (currently allowed — flag as known behavior, not a theme defect)

## F. Isolation & security

- [ ] ★ Package from store A never appears on store B's storefront (workspace scoping)
- [ ] ★ Enquiry created on store B never links to store A's package
- [ ] ★ Unapplied/uninstalled theme → theme-site 404
- [ ] ★ Public endpoints return no admin data (check responses for internal fields)
- [ ] `traveller-auth` — wrong password rejected; session token required for trips
- [ ] No theme JS reads/writes platform internals (`__informatic*`) or sets cookies

## G. Approval record

| Item | Value |
|---|---|
| Theme id / name | |
| Store tested | |
| Industry / tags | |
| Tester / date | |
| Verdict | ☐ Approved ☐ Conditional ☐ Rejected |
| Notes / known defects | |
