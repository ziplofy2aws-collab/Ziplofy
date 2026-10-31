import { isRichTextEditorContentEqual } from './theme-editor-rich-text.util';

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

const PRODUCT_DESC_ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
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
  'mark',
  'sub',
  'sup',
  'blockquote',
  'hr',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'div',
  'iframe',
  'code',
  'pre',
  'label',
  'input',
]);

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function isSafeRichTextUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('#')) return true;
  try {
    const parsed = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    return SAFE_LINK_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

function isSafeImageSrc(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:image/')) return true;
  return isSafeRichTextUrl(trimmed);
}

function isSafeIframeSrc(src: string): boolean {
  try {
    const parsed = new URL(src.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      parsed.protocol === 'https:' &&
      (host === 'www.youtube.com' ||
        host === 'youtube.com' ||
        host === 'www.youtube-nocookie.com' ||
        host === 'youtube-nocookie.com')
    );
  } catch {
    return false;
  }
}

function sanitizeElement(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (!PRODUCT_DESC_ALLOWED_TAGS.has(tag)) {
    return Array.from(el.childNodes).map((child) => sanitizeNode(child)).join('');
  }

  if (tag === 'br') return '<br>';
  if (tag === 'hr') return '<hr>';
  if (tag === 'img') {
    const src = el.getAttribute('src') || '';
    if (!isSafeImageSrc(src)) return '';
    const width = el.getAttribute('width');
    const height = el.getAttribute('height');
    const alt = el.getAttribute('alt');
    const attrs = [`src="${escapeAttr(src)}"`];
    if (width) attrs.push(`width="${escapeAttr(width)}"`);
    if (height) attrs.push(`height="${escapeAttr(height)}"`);
    if (alt) attrs.push(`alt="${escapeAttr(alt)}"`);
    return `<img ${attrs.join(' ')} />`;
  }
  if (tag === 'iframe') {
    const src = el.getAttribute('src') || '';
    if (!isSafeIframeSrc(src)) return '';
    return `<iframe src="${escapeAttr(src)}" allowfullscreen></iframe>`;
  }
  if (tag === 'a') {
    const href = el.getAttribute('href') || '';
    if (href && !isSafeRichTextUrl(href)) {
      return Array.from(el.childNodes).map((child) => sanitizeNode(child)).join('');
    }
    const attrs = href ? [`href="${escapeAttr(href)}"`, 'rel="noopener noreferrer"'] : [];
    const target = el.getAttribute('target');
    if (target === '_blank') attrs.push('target="_blank"');
    const inner = Array.from(el.childNodes).map((child) => sanitizeNode(child)).join('');
    return `<a${attrs.length ? ` ${attrs.join(' ')}` : ''}>${inner}</a>`;
  }

  const inner = Array.from(el.childNodes).map((child) => sanitizeNode(child)).join('');
  return `<${tag}>${inner}</${tag}>`;
}

function sanitizeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  return sanitizeElement(node as Element);
}

/** Strip unsafe tags/attributes from product description HTML before save or HTML-mode commit. */
export function sanitizeProductDescriptionHtml(html: string): string {
  if (!html.trim()) return '';
  if (typeof DOMParser === 'undefined') return html.trim();

  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.body.childNodes).map((node) => sanitizeNode(node)).join('');
}

export function descriptionHasPendingLocalImages(html: string): boolean {
  if (!html.trim() || typeof DOMParser === 'undefined') return false;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('img[src]')).some((img) => {
    const src = img.getAttribute('src') || '';
    return src.startsWith('data:image/') || src.startsWith('blob:');
  });
}

export function descriptionsAreEquivalent(a: string, b: string): boolean {
  return isRichTextEditorContentEqual(a, b);
}

export const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;

export function isDescriptionWithinMaxLength(html: string): boolean {
  return sanitizeProductDescriptionHtml(html).length <= PRODUCT_DESCRIPTION_MAX_LENGTH;
}
