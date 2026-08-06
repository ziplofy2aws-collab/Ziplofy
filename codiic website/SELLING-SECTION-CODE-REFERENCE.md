# Selling Products Section – Code Reference

All HTML, CSS, and JS related to the **Selling Products** section (`index.html` lines 742–875).

---

## 1. HTML – `index.html`

| Lines   | Content |
|---------|--------|
| **742–875** | Full section: `.selling-section`, header, `.selling-content`, center image, SVG connecting lines (4 gradients + 4 wave paths), 4 corner cards (top-left, top-right, bottom-left, bottom-right). |

**Classes used:**  
`selling-section`, `selling-header`, `selling-label`, `selling-headline`, `selling-content`, `selling-center-image`, `connecting-lines-svg`, `wave-path`, `wave-path-1`–`wave-path-4`, `selling-card`, `selling-card-top-left`, `selling-card-top-right`, `selling-card-bottom-left`, `selling-card-bottom-right`, `card-title-selling`, `card-description-selling`.

---

## 2. CSS – `css/style.css`

### Base styles (desktop)

| Lines   | Selector / block |
|---------|-------------------|
| **2917** | `.selling-section` (inside a shared `@media` block – margin/padding/overflow). |
| **7537–7541** | `.selling-section` – background, padding. |
| **7543–7546** | `.selling-header` – text-align, margin. |
| **7548–7555** | `.selling-label` – font, color, uppercase. |
| **7556–7562** | `.selling-headline` – font-size, weight, color. |
| **7564–7570** | `.selling-content` – position, min-height, flex, padding. |
| **7573–7592** | `.selling-center-image` – absolute, transform, size, z-index. |
| **7769–7784** | `.selling-card` – absolute, size, shadow, flex. |
| **7786–7796** | `.selling-card::before` – overlay. |
| **7798–7801** | `.selling-card:hover` – transform, shadow. |
| **7804–7826** | `.selling-card-top-left`, `.selling-card-top-right`, `.selling-card-bottom-left`, `.selling-card-bottom-right` – positioning. |
| **7828–7837** | `.connecting-lines-svg` – absolute, size, z-index. |
| **7840–7858** | `.wave-path`, `.wave-path-1`–`.wave-path-4` – animation. |
| **7861–7873** | `@keyframes waveFlow` – stroke-dasharray, opacity. |
| **7877–7917** | `.selling-card-top-left::before` … `.selling-card-bottom-right::before` – gradient + `boxColorFlow` animations. |
| **7919–8030** | `@keyframes boxColorFlow1` … `boxColorFlow4`. |
| **8015–8030** | `.card-title-selling`, `.card-description-selling`. |

### Responsive – Selling Section

| Lines   | Breakpoint / content |
|---------|----------------------|
| **8033–8060** | `@media (max-width: 1200px)` – content min-height, card size, headline, center-circle. |
| **8062–8127** | `@media (max-width: 968px)` – content, center image, cards (35%, smaller), card positions, `.connecting-lines-svg`. |
| **8130–8209** | `@media (max-width: 768px)` – section/container/header/label/headline; content as grid; hide `.selling-center-image` and `.connecting-lines-svg`; cards relative, full width, stacked; `.card-title-selling`, `.card-description-selling`. |
| **10603–10664** | `@media (max-width: 480px)` (inside a larger media block) – selling section padding, container, headline, content grid, hide center image + SVG, cards stacked, `.card-title-selling`, `.card-description-selling`, `.connecting-lines-svg` opacity. |

---

## 3. JavaScript – `js/script.js`

| Lines   | Purpose |
|---------|--------|
| **464–466** | Selectors: `.selling-header`, `.selling-left`, `.selling-card`. |
| **468–486** | Intersection Observer: `.selling-header` and `.selling-card` fade-in (opacity + translateY/translateX); `.selling-left` fade-in if present. |

**Note:** `.selling-left` is not in the current HTML (742–875); only `.selling-header` and `.selling-card` are used.

---

## Quick reference

- **HTML:** `index.html` **742–875**
- **CSS:** `css/style.css` **2917**, **7537–8030**, **8033–8127**, **8130–8209**, **10603–10664**
- **JS:** `js/script.js` **463–486**
