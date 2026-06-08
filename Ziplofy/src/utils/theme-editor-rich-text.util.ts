/** Normalize stored value for TipTap (plain text → simple HTML). */
export function normalizeRichTextForEditor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  const escaped = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const paragraphs = escaped.split(/\n\n+/).map((p) => p.replace(/\n/g, '<br>'));
  return paragraphs.map((p) => `<p>${p}</p>`).join('');
}

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'a',
  'ol',
  'ul',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
]);

/** Minimal allowlist sanitizer for theme preview rich text. */
export function sanitizeThemeRichTextHtml(html: string): string {
  if (!html.trim()) return '';
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return Array.from(el.childNodes).map(walk).join('');
    }
    if (tag === 'br') return '<br>';
    const attrs =
      tag === 'a' && el.getAttribute('href')
        ? ` href="${el.getAttribute('href')!.replace(/"/g, '&quot;')}"`
        : '';
    const inner = Array.from(el.childNodes).map(walk).join('');
    return `<${tag}${attrs}>${inner}</${tag}>`;
  };
  return Array.from(doc.body.childNodes).map(walk).join('');
}

const OL_STYLE = 'list-style-type:decimal;list-style-position:outside;padding-left:1.5em;margin:0.35em 0';
const UL_STYLE = 'list-style-type:disc;list-style-position:outside;padding-left:1.5em;margin:0.35em 0';
const LI_STYLE = 'display:list-item';
const LI_P_STYLE = 'margin:0;display:inline';

/** Sanitize and add inline list styles so bullets/numbers show in preview iframes. */
export function prepareRichTextHtmlForPreview(html: string): string {
  const safe = sanitizeThemeRichTextHtml(html);
  if (!safe.trim()) return '';
  if (typeof DOMParser === 'undefined') return safe;

  const doc = new DOMParser().parseFromString(`<div id="rt-root">${safe}</div>`, 'text/html');
  const root = doc.getElementById('rt-root');
  if (!root) return safe;

  root.querySelectorAll('ol').forEach((el) => {
    el.setAttribute('style', OL_STYLE);
  });
  root.querySelectorAll('ul').forEach((el) => {
    el.setAttribute('style', UL_STYLE);
  });
  root.querySelectorAll('li').forEach((el) => {
    el.setAttribute('style', LI_STYLE);
  });
  root.querySelectorAll('li > p').forEach((el) => {
    el.setAttribute('style', LI_P_STYLE);
  });

  return root.innerHTML;
}

export function richTextHasBlockMarkup(html: string): boolean {
  return /<(?:p|ol|ul|h[1-6]|div)\b/i.test(html);
}

/** Compare stored HTML without fighting TipTap's normalization (prevents editor reset loops). */
export function isRichTextEditorContentEqual(a: string, b: string): boolean {
  const left = normalizeRichTextForEditor(a).replace(/\s+/g, ' ').trim();
  const right = normalizeRichTextForEditor(b).replace(/\s+/g, ' ').trim();
  if (left === right) return true;
  if (typeof document === 'undefined') return false;

  const el = document.createElement('div');
  const textOf = (html: string) => {
    el.innerHTML = normalizeRichTextForEditor(html);
    return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  };
  return textOf(a) === textOf(b) && richTextHasBlockMarkup(a) === richTextHasBlockMarkup(b);
}
