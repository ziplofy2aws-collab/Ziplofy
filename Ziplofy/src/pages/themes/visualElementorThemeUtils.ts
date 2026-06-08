/**
 * Visual Elementor – shared theme utilities.
 * From-scratch implementation matching BasicElementor behavior.
 * Used for theme loading and style handling in CustomThemeBuilder only.
 */

/**
 * GrapesJS StyleManager sometimes emits unitless multipliers as px (e.g. `line-height: 1.6` → `1.6px`),
 * which collapses text and breaks the canvas. Normalize before applying to DOM/CSS.
 * Returns null to skip applying (e.g. empty string would wipe inherited styles).
 */
export function normalizeStyleManagerCSSValue(propertyName: string, value: string): string | null {
  const v = String(value ?? '').trim();
  if (v === '') return null;
  const p = String(propertyName)
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase();
  if (p === 'line-height') {
    const m = v.match(/^(\d+(?:\.\d+)?)px$/i);
    if (m) {
      const n = parseFloat(m[1]);
      if (n > 0 && n < 4) return m[1];
    }
  }
  // Theme often uses rem (e.g. 1.4rem); StyleManager sometimes emits 1.4px — unreadable / overlapping text
  if (p === 'font-size') {
    const m = v.match(/^(\d+(?:\.\d+)?)px$/i);
    if (m) {
      const n = parseFloat(m[1]);
      if (n > 0 && n < 4) return `${m[1]}rem`;
    }
  }
  // font-weight: 400px is invalid — strip mistaken unit
  if (p === 'font-weight') {
    const m = v.match(/^(\d+)px$/i);
    if (m) return m[1];
  }
  return v;
}

/**
 * Fix bad px values already stored on the component (e.g. after StyleManager sync on select).
 * Returns true if styles were updated.
 */
export function sanitizeComponentStylesFromGrapes(component: any): boolean {
  if (!component?.getStyle) return false;
  try {
    const style = component.getStyle() || {};
    const keys = Object.keys(style);
    if (keys.length === 0) return false;
    const next: Record<string, string> = { ...style };
    let changed = false;
    for (const k of keys) {
      const v = String(style[k] ?? '');
      const nv = normalizeStyleManagerCSSValue(k, v);
      if (nv === null) continue;
      if (nv !== v) {
        next[k] = nv;
        changed = true;
      }
    }
    if (!changed) return false;
    component.setStyle(next);
    try {
      component.view?.updateStyle?.();
    } catch (_) {}
    return true;
  } catch (_) {
    return false;
  }
}

/** Preserve text/editing visuals – do NOT use color: inherit (StyleManager would never apply changes) */
export const PRESERVE_TEXT_COLOR_CSS = `
  .gjs-selected,
  .gjs-selected *,
  .gjs-comp-selected,
  .gjs-comp-selected *,
  .gjs-editing,
  .gjs-editing *,
  .gjs-hovered,
  .gjs-hovered *,
  [contenteditable="true"],
  [contenteditable="true"] *,
  [data-gjs-type="text"],
  [data-gjs-editable="true"] {
    -webkit-text-fill-color: inherit !important;
    caret-color: currentColor !important;
    background-color: transparent !important;
  }
`;

/**
 * GrapesJS iframe extras that stack with the host `.gjs-highlighter` (double edges / grid).
 * Also kills “dashed mode” per-component outlines on highlightable nodes.
 */
export const GJS_IFRAME_OVERLAY_KILL_CSS = `
  .gjs-selected-parent {
    outline: none !important;
    outline-offset: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .gjs-dashed *[data-gjs-highlightable] {
    outline: none !important;
    outline-offset: 0 !important;
  }
`;

/** Selection: no iframe outline — host `.gjs-highlighter` is the single selection ring (avoids double vertical rails). */
export const SELECTION_HIGHLIGHT_BASIC_CSS = `
  .gjs-comp-selected,
  .gjs-selected {
    outline: none !important;
    outline-offset: 0 !important;
  }
  /* Body selected: visible highlight when StyleManager targets body */
  body.ziplofy-body-selected,
  .gjs-wrapper-body.ziplofy-body-selected {
    outline: 2px solid #2563eb !important;
    outline-offset: 2px !important;
  }
  .gjs-comp-hover,
  .gjs-hovered {
    outline: none !important;
    outline-offset: 0 !important;
  }
  /* Full-page root: rely on panel + host highlighter hide */
  body.gjs-comp-selected,
  body.gjs-selected,
  .gjs-wrapper-body.gjs-comp-selected,
  .gjs-wrapper-body.gjs-selected {
    outline: none !important;
    outline-offset: 0 !important;
  }
  /* Selection readability fix: gradient text can become transparent in canvas selection state. */
  .hero-slide-title.gjs-selected,
  .hero-slide-title.gjs-comp-selected,
  .hero-slide-title.gjs-hovered,
  .hero-slide-overlay.gjs-selected .hero-slide-title,
  .hero-slide.gjs-selected .hero-slide-title,
  .gjs-wrapper-body.gjs-selected .hero-slide-title,
  .gjs-wrapper-body.gjs-selected .hero-slide-title.gjs-hovered,
  .hero-slide-caption .gjs-selected,
  .hero-slide-caption .gjs-comp-selected,
  .hero-slide-caption .gjs-hovered {
    opacity: 1 !important;
    filter: none !important;
    mix-blend-mode: normal !important;
  }
` + GJS_IFRAME_OVERLAY_KILL_CSS;

/** Force pointer-events: auto so nav, header, footer, links are clickable for selection (match Basic Elementor) */
export const SELECTION_OVERRIDE_CSS = `
  * { pointer-events: auto !important; }
  html, html *, body, body * { pointer-events: auto !important; }
  nav, nav *, header, header *, footer, footer * { pointer-events: auto !important; }
  .navbar, .navbar *, .navigation, .navigation *, .nav-bar, .nav-bar * { pointer-events: auto !important; }
  [class*="nav"], [class*="nav"] *, [class*="menu"], [class*="menu"] * { pointer-events: auto !important; }
  [role="navigation"], [role="navigation"] * { pointer-events: auto !important; }
  div, span, p, h1, h2, h3, h4, h5, h6, a, button, section, main, article, aside, ul, ol, li, figure, figcaption, label { pointer-events: auto !important; }
  [contenteditable="true"] { pointer-events: auto !important; user-select: text !important; cursor: text !important; -webkit-user-select: text !important; }
  [class*="product"], [class*="product"] *, [class*="card"], [class*="card"] *, [class*="featured"], [class*="featured"] *,
  [class*="grid"], [class*="grid"] *, [class*="swiper"], [class*="swiper"] *, [class*="carousel"], [class*="carousel"] *,
  [class*="hero"], [class*="hero"] *, [class*="section"], [class*="section"] *, [class*="container"], [class*="container"] *,
  [class*="overlay"], [class*="overlay"] *, [class*="wrapper"], [class*="wrapper"] * { pointer-events: auto !important; }
  [style*="min-height"], [style*="min-height"] * { pointer-events: auto !important; }
`;

/** Injected AFTER theme CSS so it wins – themes often use pointer-events: none on overlays, sliders, etc. */
export const POINTER_EVENTS_FINAL_CSS = `
  *, *::before, *::after,
  html, html *, body, body *,
  [data-gjs-type], [data-gjs-selectable], [data-gjs-editable],
  .gjs-selected, .gjs-selected *, .gjs-comp-selected, .gjs-comp-selected *,
  .gjs-hovered, .gjs-hovered *, .gjs-comp-hover {
    pointer-events: auto !important;
  }
`;

/** Hide non-active slider slides in iframe (slider JS doesn't run) */
export const ANIMATION_KEYFRAMES_CSS = [
  '@keyframes fadeIn{from{opacity:0}to{opacity:1}}',
  '@keyframes fadeOut{from{opacity:1}to{opacity:0}}',
  '@keyframes slideInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes slideInDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes slideOutUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}',
  '@keyframes slideOutDown{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}',
  '@keyframes bounce{0%,20%,53%,100%{transform:translateZ(0)}40%,43%{transform:translate3d(0,-8px,0)}70%{transform:translate3d(0,-4px,0)}}',
  '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}',
  '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
  '@keyframes zoomIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}',
  '@keyframes zoomOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.5)}}',
].join('\n');

export const SLIDER_FIX_CSS = `
  .swiper-slide:not(:first-child),
  .slick-slide:not(:first-child),
  .carousel-item:not(:first-child):not(.active),
  .slide:not(:first-child):not(.active),
  .slideshow__slide:not(:first-child),
  .hero__slide:not(:first-child),
  .splide__slide:not(:first-child),
  [class*="swiper-wrapper"] > *:not(:first-child),
  [class*="slick-track"] > *:not(:first-child),
  .owl-item:not(:first-child) {
    display: none !important;
    visibility: hidden !important;
  }
  /*
   * NeuralStore / templatemo hero: slides are position:absolute + opacity. Do NOT use .hero-slide:not(:first-child)
   * — Grapes may inject a node before the first slide, hiding every slide. Sibling combinator only hides *following* slides.
   * Force opacity on direct .hero-slide so the first slide still paints if .active is missing in the canvas.
   */
  .hero-slider-wrapper > .hero-slide ~ .hero-slide {
    display: none !important;
    visibility: hidden !important;
  }
  .hero-slider-wrapper > .hero-slide {
    opacity: 1 !important;
  }
  /*
   * Strong deterministic mode for editor canvas:
   * show exactly one hero slide (active, else first fallback), keep it full-size.
   * Prevents split/black-center states when class timing or async script updates race in iframe.
   */
  .hero-slider-wrapper {
    position: relative !important;
    overflow: hidden !important;
  }
  .hero-slider-wrapper > .hero-slide {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    opacity: 0 !important;
    visibility: hidden !important;
    display: flex !important;
  }
  .hero-slider-wrapper > .hero-slide.active {
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 2 !important;
  }
  .hero-slider-wrapper > .hero-slide:first-of-type {
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 1 !important;
  }
  .hero-slider-wrapper > .hero-slide.active:first-of-type {
    z-index: 2 !important;
  }
  .hero-slider-wrapper > .hero-slide > .hero-slide-image {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
`;

const SKIP_TAGS = ['script', 'style', 'link', 'meta', 'head', 'title', 'path', 'svg', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'];
const CONTAINER_TAGS = ['div', 'section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'form', 'ul', 'ol', 'li', 'figure', 'figcaption', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'fieldset', 'details'];
const TEXT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'blockquote', 'cite', 'img', 'figcaption', 'legend'];

/** Strip GrapesJS canvas CSS erroneously embedded in theme HTML */
export function stripGrapesJSCanvasCss(html: string): string {
  if (!html || typeof html !== 'string') return html;
  let h = html;
  const firstTag = h.search(/<[a-zA-Z][a-zA-Z0-9]*[\s>]/);
  if (firstTag > 0) {
    const leading = h.substring(0, firstTag);
    if (/body\s*\{/.test(leading) && /\.gjs-(?:dashed|selected|highlightable|selected-parent|plh-image)/.test(leading)) {
      h = h.substring(firstTag);
    }
  }
  h = h.replace(/<(div|pre|code|span)[^>]*>([\s\S]*?)<\/\1>/gi, (match: string, _tag: string, content: string) => {
    const c = (content || '').trim();
    if (c.length > 80 && /body\s*\{/.test(c) && /\.gjs-(?:dashed|selected|highlightable|plh-image|grabbing)/.test(c)) return '';
    return match;
  });
  h = h.replace(/(?:^|>)\s*(body\s*\{[\s\S]*?\.gjs-dashed[\s\S]*\}\s*)(?=\s*<)/gi, '');
  return h;
}

/** Add data-gjs-selectable, data-gjs-droppable, data-gjs-editable so elements are selectable */
export function preprocessHtmlForSelectability(html: string): string {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/<([a-z][a-z0-9]*)(\s[^>]*)?>/gi, (match: string, tagName: string, rest: string) => {
    const tag = (tagName || '').toLowerCase();
    if (SKIP_TAGS.includes(tag)) return match;
    const attrs = rest || '';
    if (attrs.includes('data-gjs-selectable')) return match;
    let toAdd = ` data-gjs-selectable="true"`;
    if (CONTAINER_TAGS.includes(tag)) toAdd += ` data-gjs-droppable="*"`;
    if (TEXT_TAGS.includes(tag) && !attrs.includes('data-gjs-editable')) toAdd += ` data-gjs-editable="true" data-gjs-type="text"`;
    return `<${tagName}${attrs}${toAdd}>`;
  });
}

/** Fix gradient values incorrectly wrapped in url() */
export function cleanupCssGradients(css: string): string {
  if (!css) return css;
  const extractBalancedParens = (str: string, start: number): string => {
    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') {
        depth--;
        if (depth === 0) return str.substring(start, i + 1);
      }
    }
    return str.substring(start);
  };
  let out = css;
  const re = /url\(\s*(['"]?)\s*(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient)/gi;
  let m;
  const repl: Array<{ s: number; e: number; r: string }> = [];
  while ((m = re.exec(css)) !== null) {
    const gradStart = m.index + m[0].length - (m[2]?.length || 0);
    const gradContent = extractBalancedParens(css, gradStart + (m[2]?.length || 0));
    const full = (m[2] || '') + gradContent;
    repl.push({ s: m.index, e: gradStart + full.length, r: full });
  }
  for (let i = repl.length - 1; i >= 0; i--) {
    const { s, e, r } = repl[i];
    out = out.substring(0, s) + r + out.substring(e);
  }
  out = out.replace(/url\(\s*(['"]?)\s*(none|initial|inherit|unset|revert|transparent)\s*\1\s*\)/gi, (_: string, __: string, kw: string) => kw);
  return out;
}

/** Remove empty/invalid tags that cause GrapesJS InvalidCharacterError (tag name '') */
export function removeEmptyTags(html: string): string {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/<\s*\/?\s*>/g, '');
}

/**
 * Sanitize block content before appending to a target.
 * Strips full document markup (html/body) and invalid tags that could cause GrapesJS errors.
 */
export function sanitizeBlockContentForAppend(content: string | undefined): string {
  if (!content || typeof content !== 'string') return '';
  let html = content.trim();
  if (!html) return '';
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1].trim();
  const htmlMatch = html.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
  if (htmlMatch) html = htmlMatch[1].trim();
  html = removeEmptyTags(html);
  return html || content;
}

/** Detect content that is CSS instead of HTML (corrupted state) */
export function isContentCssNotHtml(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  const t = content.trim();
  if (/^(body|html|\*|\.|#|@|:root)\s*\{/i.test(t)) return true;
  if (t.includes('{') && t.includes('}') && /\.gjs-(dashed|selected|wrapper|no-select|plh-image|selected-parent)/i.test(t)) return true;
  if (t.includes('{') && t.includes('}') && /\[data-gjs-type\s*[=\]]/.test(t)) return true;
  const firstTag = t.search(/<[a-zA-Z][a-zA-Z0-9]*[\s>]/);
  if (firstTag > 100 && /body\s*\{/.test(t) && /\.gjs-|::-webkit-scrollbar/.test(t)) return true;
  return false;
}
