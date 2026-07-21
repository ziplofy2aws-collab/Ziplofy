import type { CollectionListCardsLayoutType } from '../sidebar/theme-editor-collection-list-panel.utils';

export const COLLECTION_LIST_LAYOUT_DEFAULTS: Record<
  CollectionListCardsLayoutType,
  Record<string, string | boolean>
> = {
  bento: {
    cardsGap: '8',
    carouselOnMobile: false,
  },
  grid: {
    columns: '4',
    mobileColumns: '1',
    horizontalGap: '8',
    verticalGap: '8',
    carouselOnMobile: false,
  },
  carousel: {
    columns: '4',
    mobileColumns: '1',
    horizontalGap: '8',
    navigationIcon: 'arrows',
    navigationIconBackground: 'none',
  },
  editorial: {
    collectionCount: '4',
    carouselOnMobile: false,
  },
};

export function isCollectionListCardsLayoutTypePath(path: string): boolean {
  return /\.settings\.cardsLayoutType$/.test(path);
}

export function collectionListLayoutDefaultsForType(
  layoutType: CollectionListCardsLayoutType
): Record<string, string | boolean> {
  return { ...COLLECTION_LIST_LAYOUT_DEFAULTS[layoutType] };
}

export function applyCollectionListLayoutDefaultsToValues(
  values: Record<string, string | boolean>,
  settingsBase: string,
  layoutType: CollectionListCardsLayoutType
): Record<string, string | boolean> {
  const next = { ...values };
  for (const [key, value] of Object.entries(collectionListLayoutDefaultsForType(layoutType))) {
    const path = `${settingsBase}.${key}`;
    if (next[path] === undefined) next[path] = value;
  }
  return next;
}
