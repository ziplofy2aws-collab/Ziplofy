const themeChosenKey = (storeId: string) => `codiic.setup.themeChosen.${storeId}`;

export function isStoreThemeChosen(storeId: string | null | undefined): boolean {
  if (!storeId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(themeChosenKey(storeId)) === '1';
  } catch {
    return false;
  }
}

export function markStoreThemeChosen(storeId: string | null | undefined): void {
  if (!storeId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(themeChosenKey(storeId), '1');
  } catch {
    /* ignore quota / private mode */
  }
}
