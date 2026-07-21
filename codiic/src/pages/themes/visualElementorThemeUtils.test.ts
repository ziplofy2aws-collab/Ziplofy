import { describe, it, expect } from 'vitest';
import {
  stripGrapesJSCanvasCss,
  preprocessHtmlForSelectability,
  cleanupCssGradients,
  removeEmptyTags,
  sanitizeBlockContentForAppend,
  isContentCssNotHtml,
} from './visualElementorThemeUtils';

describe('stripGrapesJSCanvasCss', () => {
  it('returns input when empty', () => {
    expect(stripGrapesJSCanvasCss('')).toBe('');
    expect(stripGrapesJSCanvasCss(null as any)).toBe(null);
    expect(stripGrapesJSCanvasCss(undefined as any)).toBe(undefined);
  });

  it('strips leading body CSS with gjs classes before first tag', () => {
    const html = `body { .gjs-dashed { outline: 1px dashed } }<div>content</div>`;
    expect(stripGrapesJSCanvasCss(html)).toBe('<div>content</div>');
  });

  it('strips embedded gjs CSS blocks in div/pre/code/span', () => {
    const html = '<div><pre>body { .gjs-dashed { } }</pre> long gjs content here</pre></div>';
    const result = stripGrapesJSCanvasCss(html);
    expect(result).not.toContain('.gjs-dashed');
  });

  it('returns plain HTML unchanged', () => {
    const html = '<div><p>Hello</p></div>';
    expect(stripGrapesJSCanvasCss(html)).toBe(html);
  });
});

describe('preprocessHtmlForSelectability', () => {
  it('returns input when empty', () => {
    expect(preprocessHtmlForSelectability('')).toBe('');
    expect(preprocessHtmlForSelectability(null as any)).toBe(null);
  });

  it('adds data-gjs-selectable to elements', () => {
    const html = '<div>test</div>';
    expect(preprocessHtmlForSelectability(html)).toContain('data-gjs-selectable="true"');
  });

  it('adds data-gjs-droppable for container tags', () => {
    const html = '<section>content</section>';
    const result = preprocessHtmlForSelectability(html);
    expect(result).toContain('data-gjs-droppable="*"');
    expect(result).toContain('data-gjs-selectable="true"');
  });

  it('adds data-gjs-editable for text tags', () => {
    const html = '<p>paragraph</p>';
    const result = preprocessHtmlForSelectability(html);
    expect(result).toContain('data-gjs-editable="true"');
    expect(result).toContain('data-gjs-type="text"');
  });

  it('skips script and style tags', () => {
    const html = '<script>alert(1)</script><style>.x{}</style>';
    const result = preprocessHtmlForSelectability(html);
    expect(result).not.toContain('data-gjs-selectable');
    expect(result).toBe(html);
  });

  it('does not add data-gjs-selectable if already present', () => {
    const html = '<div data-gjs-selectable="true">test</div>';
    expect(preprocessHtmlForSelectability(html)).toBe(html);
  });
});

describe('cleanupCssGradients', () => {
  it('returns input when empty', () => {
    expect(cleanupCssGradients('')).toBe('');
    expect(cleanupCssGradients(null as any)).toBe(null);
  });

  it('unwraps url(linear-gradient(...))', () => {
    const css = 'background: url(linear-gradient(to right, red, blue));';
    const result = cleanupCssGradients(css);
    expect(result).toContain('linear-gradient(to right, red, blue)');
    expect(result).not.toContain('url(linear-gradient');
  });

  it('handles radial-gradient', () => {
    const css = 'bg: url(radial-gradient(circle, red, blue));';
    const result = cleanupCssGradients(css);
    expect(result).toContain('radial-gradient(circle, red, blue)');
    expect(result).not.toContain('url(radial-gradient');
  });

  it('fixes url(none)', () => {
    const css = 'background: url(none);';
    expect(cleanupCssGradients(css)).toBe('background: none;');
  });

  it('fixes url(transparent)', () => {
    const css = 'background: url(transparent);';
    expect(cleanupCssGradients(css)).toBe('background: transparent;');
  });
});

describe('removeEmptyTags', () => {
  it('returns input when empty', () => {
    expect(removeEmptyTags('')).toBe('');
    expect(removeEmptyTags(null as any)).toBe(null);
  });

  it('removes empty tags like < >', () => {
    expect(removeEmptyTags('<div>a< >b</div>')).toBe('<div>ab</div>');
  });

  it('removes empty tags matching pattern', () => {
    expect(removeEmptyTags('<div>a< >b</div>')).toBe('<div>ab</div>');
  });
});

describe('sanitizeBlockContentForAppend', () => {
  it('returns empty for null or undefined', () => {
    expect(sanitizeBlockContentForAppend(undefined)).toBe('');
    expect(sanitizeBlockContentForAppend(null as any)).toBe('');
  });

  it('returns empty for empty string', () => {
    expect(sanitizeBlockContentForAppend('')).toBe('');
    expect(sanitizeBlockContentForAppend('   ')).toBe('');
  });

  it('strips body wrapper', () => {
    const html = '<body><div>content</div></body>';
    expect(sanitizeBlockContentForAppend(html)).toBe('<div>content</div>');
  });

  it('strips html wrapper', () => {
    const html = '<html><body><p>x</p></body></html>';
    expect(sanitizeBlockContentForAppend(html)).toContain('<p>x</p>');
  });

  it('removes empty tags from content', () => {
    const html = '<div>a< >b</div>';
    expect(sanitizeBlockContentForAppend(html)).toBe('<div>ab</div>');
  });
});

describe('isContentCssNotHtml', () => {
  it('returns false for plain HTML', () => {
    expect(isContentCssNotHtml('<div>hello</div>')).toBe(false);
    expect(isContentCssNotHtml('<html><body>x</body></html>')).toBe(false);
  });

  it('returns true for body {}', () => {
    expect(isContentCssNotHtml('body {}')).toBe(true);
  });

  it('returns true for content with .gjs-dashed and braces', () => {
    expect(isContentCssNotHtml('.gjs-dashed { outline: 1px }')).toBe(true);
  });

  it('returns true for :root {}', () => {
    expect(isContentCssNotHtml(':root { --x: 1 }')).toBe(true);
  });

  it('returns false for empty or null', () => {
    expect(isContentCssNotHtml('')).toBe(false);
    expect(isContentCssNotHtml(null as any)).toBe(false);
  });
});
