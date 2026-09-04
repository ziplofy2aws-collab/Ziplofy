/** Rich-text helpers for store policy editors (mirrors Codiic theme-editor-rich-text.util). */

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

export function htmlToPlainText(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return '';
  if (typeof document === 'undefined') {
    return trimmed
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim();
  }
  const el = document.createElement('div');
  el.innerHTML = trimmed;
  return (el.textContent ?? '').replace(/\u00a0/g, ' ').trim();
}

export function isRichTextContentEmpty(html: string): boolean {
  const trimmed = html.trim();
  if (!trimmed) return true;
  if (typeof document === 'undefined') {
    return !trimmed.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
  }
  const el = document.createElement('div');
  el.innerHTML = trimmed;
  return !(el.textContent ?? '').replace(/\u00a0/g, ' ').trim();
}

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
  return textOf(a) === textOf(b);
}

export function normalizePolicyContentForSave(html: string): string {
  return isRichTextContentEmpty(html) ? '' : html;
}

export function plainTextToEditorHtml(text: string): string {
  return normalizeRichTextForEditor(text);
}

export function storedPolicyToEditorValue(stored: string): string {
  if (!stored.trim()) return '';
  if (/<[a-z][\s\S]*>/i.test(stored)) return stored;
  return plainTextToEditorHtml(stored);
}
