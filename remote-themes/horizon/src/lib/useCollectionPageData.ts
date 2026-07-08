import {
  useStorefrontCollections,
  type StorefrontCollection,
  type StorefrontProductItem,
} from '@render-store/sdk';

export type CollectionPageProduct = {
  id: string;
  urlHandle: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  soldOut: boolean;
};

function mapProduct(item: StorefrontProductItem): CollectionPageProduct {
  const variants = item.variants;
  const firstVariant = Array.isArray(variants) && variants.length ? variants[0] : null;
  const price =
    typeof firstVariant?.price === 'number'
      ? firstVariant.price
      : typeof item.price === 'number'
        ? item.price
        : 0;
  const compareAtPrice =
    typeof firstVariant?.compareAtPrice === 'number' ? firstVariant.compareAtPrice : null;
  const qty = typeof firstVariant?.quantity === 'number' ? firstVariant.quantity : null;
  const imageUrl =
    (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
    (typeof item.imageUrl === 'string' ? item.imageUrl : '') ||
    '';

  return {
    id: item._id,
    urlHandle: item.urlHandle?.trim() || item._id,
    title: item.title?.trim() || 'Product title',
    price,
    compareAtPrice,
    imageUrl,
    soldOut: qty !== null ? qty <= 0 : false,
  };
}

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
