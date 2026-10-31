export type CollectionProductSort =
  | 'manual'
  | 'title-asc'
  | 'title-desc'
  | 'price-high'
  | 'price-low'
  | 'newest'
  | 'oldest';

export const COLLECTION_PRODUCT_SORT_OPTIONS: Array<{ value: CollectionProductSort; label: string }> = [
  { value: 'title-asc', label: 'Product title A–Z' },
  { value: 'title-desc', label: 'Product title Z–A' },
  { value: 'price-high', label: 'Highest price' },
  { value: 'price-low', label: 'Lowest price' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'manual', label: 'Manually' },
];

export const COLLECTION_FORM_APPEARANCE = 'minimal' as const;
