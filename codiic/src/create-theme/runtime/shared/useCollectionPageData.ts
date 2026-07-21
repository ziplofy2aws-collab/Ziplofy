import {
  useStorefrontCollections,
  type StorefrontCollection,
  type StorefrontProductItem,
} from '@render-store/sdk';

export type CollectionPageProduct = {
  id: string;
  title: string;
  urlHandle?: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  soldOut: boolean;
};

function toMoney(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function mapProduct(item: StorefrontProductItem): CollectionPageProduct {
  const price = toMoney(item.price) ?? 0;
  const compareAtPrice = toMoney(item.compareAtPrice);
  const imageUrl =
    (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
    (typeof (item as { imageUrl?: string }).imageUrl === 'string'
      ? (item as { imageUrl?: string }).imageUrl!
      : '') ||
    '';

  return {
    id: item._id,
    title: item.title?.trim() || 'Product',
    urlHandle: item.urlHandle?.trim() || undefined,
    price,
    compareAtPrice,
    imageUrl,
    soldOut: false,
  };
}

/** Active collection + products for the collection page template (loaded by storefront route loader). */
export function useCollectionPageData(): {
  collection: StorefrontCollection | null;
  products: CollectionPageProduct[];
  loading: boolean;
  itemCount: number;
} {
  const { activeCollection, products, loading } = useStorefrontCollections();
  const mapped = products.map(mapProduct);

  return {
    collection: activeCollection,
    products: mapped,
    loading,
    itemCount: mapped.length,
  };
}
