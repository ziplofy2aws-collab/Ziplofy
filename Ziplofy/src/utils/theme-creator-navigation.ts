import type { Store } from '../contexts/store.context';

/** Theme creator URL for the store's live custom (JSON) theme, when set. */
export function themeCreatorPathForStore(store: Pick<Store, 'appliedCustomThemeId'> | null | undefined): string {
  const customThemeId = store?.appliedCustomThemeId?.trim();
  if (customThemeId) {
    return `/themes/create?id=${encodeURIComponent(customThemeId)}`;
  }
  return '/online-store/themes';
}

export function themeCreatorPathForActiveStore(
  stores: Store[],
  activeStoreId: string | null
): string {
  const store = activeStoreId ? stores.find((s) => s._id === activeStoreId) : undefined;
  return themeCreatorPathForStore(store);
}

/** Opens theme creator (or themes list) in a new browser tab. */
export function openThemeCreatorForActiveStore(
  stores: Store[],
  activeStoreId: string | null
): void {
  const path = themeCreatorPathForActiveStore(stores, activeStoreId);
  const url = new URL(path, window.location.origin);
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}
