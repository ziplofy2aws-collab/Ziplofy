/** Whether a link href is valid for the Insert link dialog (Shopify-style). */
export function isValidThemeEditorLinkHref(href: string): boolean {
  const t = href.trim();
  if (!t) return false;
  if (t.startsWith('/') || t.startsWith('#')) return true;
  if (/^mailto:/i.test(t) || /^tel:/i.test(t)) return true;
  return /^https?:\/\//i.test(t);
}
