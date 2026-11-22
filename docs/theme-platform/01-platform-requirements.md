# Codiic Theme Platform Requirements

Universal requirements for **every** theme uploaded to Codiic (ZIP or folder). Verified against the actual import + serving pipeline.

## 1. Package structure

- **One** `index.html` at the theme content root. The importer detects the content root as the directory containing `index.html` (`import-static-theme-zip.ts`).
- ZIP ≤ 200 MB (`multer` limit, single `file` field) **or** folder upload ≤ 500 files / 25 MB (multipart `files[]`, `webkitRelativePath` preserved).
- Every page is a real `.html` file; navigation via real `<a href="page.html">` links — no SPA routers, no JS-only page switching.
- All asset references **relative**: `assets/…`, `page.html`. Never root-absolute (`/assets/…`) — the site is served under a prefixed proxy path and a `<base>` tag is injected; root-absolute paths would escape it.
- No hard-coded origins (`http://localhost:…`, IPs, `file://`) in markup, CSS or JS.
- No secrets/API keys/credentials anywhere in the theme.

## 2. Assets

- Images: `assets/img/…` (or any relative dir). Prefer optimized formats (webp/jpg/png); provide meaningful `alt` (it doubles as the injected title text).
- CSS/JS: relative links; inline `<script>`/`<style>` allowed for behavior but **data must live in declarative arrays or markup**, not imperative DOM construction (see §4).
- Fonts: local files or Google Fonts CDN links are served as-is.

## 3. Pages & navigation

- Header/nav on every page; links must be crawlable `<a href>` (menus built purely from JS arrays still work for rendering, but page-level links must exist).
- Keep page filenames descriptive — `packages.html`, `package-detail.html`, `about.html`, `contact.html` (detail-page detection keys on filenames: `detail|package|product|tour|trip|itinerar`).

## 4. Dynamic content contract (two accepted channels)

A theme becomes *live* when the platform can find its repeated business records:

**A. JS data file (preferred — richest mapping)** — an array of objects in any of:
```js
window.TRAVEL_PACKAGES = [ { id:'goa', title:'Goa', img:'…', location:'…', days:6, nights:5, price:45000, … } ];
const PACKAGES = [ … ];                       // const/let/var
window.DATA = { packages: [ … ] };            // object property
```
- First object in the array is the *template* — every key it declares is filled per live record (see 05-package-sync-spec §field map).
- Non-record arrays (nav menus, link lists) are detected and left alone.

**B. Hard-coded card markup (fallback)** — ≥3 consecutive same-shape sibling elements, each containing an `<img>`. Tag/class must read as a card (`article`, `li`, `figure`, or `div`/`a`/`section` whose class matches `card|tour|pack|dest|trip|stay|slide|tile|post|entry|product|offer|deal|room|suite|villa|listing|item`), and the card or its nearby container/section/headings must carry travel context (`tour, packag, dest, trip, travel, stay, holid, experien, voyage, journey, itinerar, getaway, resort, hotel, vacation, adventure, listing, product, offer, deal`…). Excluded-zone names (`testimonial, stories, team, nav, footer, review, blog, logo, avatar, newsletter, faq, feature, step, counter, stat`…) are never rewritten.

## 5. Semantic HTML & accessibility

- Real headings (`h1–h6`), buttons (`<button>`/`<a>`), form elements (`<form>`, `<input>`, `<select>`).
- Interactive elements must be keyboard-reachable; the platform's injected widgets are ARIA-labelled — don't strip them.
- Responsive layouts (desktop/tablet/mobile) — the editor has a device toggle and storefront traffic is mixed.

## 6. Editor compatibility (see also 02 §Editor)

- Editable text = real text nodes inside headings, paragraphs, buttons, labels.
- Editable images = `<img>` elements with a `src` (background images in CSS are **not** editor-swap targets on static pages).
- Editable colors/fonts = theme settings in the converted schema (`settings.colors`, `settings.typography`) applied globally — local inline styles stay as authored.

## 7. Safe JavaScript

- No `eval`/`new Function` on remote data, no document.write, no credential exfiltration, no crypto miners, no obfuscated blobs.
- Theme JS runs in the storefront origin — same-origin rules apply; don't touch `window.__informatic*` internals (they're the platform's).

## 8. Industry tags (upload-time)

- Tag the theme's industry at upload (`travel`/`tour`, `healthcare`, `salon`, …). Tags drive catalog visibility per store industry and gate the data-sync layer (04-industry-integration).

## 9. Security posture

- HTTPS-embeddable (no mixed content) — storefronts can run under custom domains.
- No third-party trackers unless declared; no cookies set by theme JS.
- Public pages must be safe when rendered for anonymous visitors — no privileged data assumptions.
