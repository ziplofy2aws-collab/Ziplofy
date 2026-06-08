/** True when the storefront is running inside the Ziplofy theme editor iframe. */
export function isThemeEditorPreview(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('ziplofy-theme-preview-root');
}
