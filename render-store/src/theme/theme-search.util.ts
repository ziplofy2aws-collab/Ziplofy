export function readThemeSearchCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const search = (settings?.search ?? {}) as Record<string, unknown>;
  const popover = (search.popover ?? {}) as Record<string, unknown>;

  const productCornerRadius = Number(popover.productCornerRadius);
  const cardCornerRadius = Number(popover.cardCornerRadius);
  const titleCase = typeof popover.titleCase === 'string' ? popover.titleCase : 'default';

  return {
    '--ziplofy-search-product-radius': `${Number.isFinite(productCornerRadius) ? productCornerRadius : 0}px`,
    '--ziplofy-search-card-radius': `${Number.isFinite(cardCornerRadius) ? cardCornerRadius : 4}px`,
    '--ziplofy-search-title-transform': titleCase === 'uppercase' ? 'uppercase' : 'none',
  };
}

export function readThemeSearchEmptyStateCollection(
  config: Record<string, unknown> | null | undefined
): { id: string; title: string; handle: string } {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const search = (settings?.search ?? {}) as Record<string, unknown>;

  return {
    id: typeof search.emptyStateCollectionId === 'string' ? search.emptyStateCollectionId : '',
    title:
      typeof search.emptyStateCollectionTitle === 'string' ? search.emptyStateCollectionTitle : '',
    handle:
      typeof search.emptyStateCollectionHandle === 'string' ? search.emptyStateCollectionHandle : '',
  };
}
