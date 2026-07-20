/** True when the storefront is running inside the codiic theme editor iframe. */
export function isThemeEditorPreview(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('codiic-theme-preview-root');
}
