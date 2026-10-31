'use client';

/**
 * Webpanel adapter for codiic `useProducts`.
 * Webpanel stores have no ecommerce catalog — empty stub.
 */

import { useCallback, useMemo, useState } from 'react';

export type Product = {
  _id: string;
  storeId?: string;
  title?: string;
  name?: string;
  urlHandle?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  images?: Array<{ url?: string }>;
  variants?: Array<Record<string, unknown>>;
  status?: string;
  [key: string]: unknown;
};

export function useProducts() {
  const [products] = useState<Product[]>([]);
  const [loading] = useState(false);

  const emptyFetch = useCallback(async (_storeId: string) => [] as Product[], []);
  const noopAsync = useCallback(async () => null, []);

  return useMemo(
    () => ({
      products,
      product: null as Product | null,
      activeProduct: null as Product | null,
      activeProductLoading: false,
      loading,
      error: null as string | null,
      pagination: { page: 1, totalPages: 1, totalItems: 0 },
      fetchProductsByStoreId: emptyFetch,
      fetchProductById: noopAsync,
      createProduct: noopAsync,
      updateProduct: noopAsync,
      deleteProduct: noopAsync,
      duplicateProduct: noopAsync,
      searchBasic: async () => [] as Product[],
      searchProductWithVariantAndDestination: async () => [],
      clearProducts: () => undefined,
      clearActiveProduct: () => undefined,
    }),
    [products, loading, emptyFetch, noopAsync]
  );
}
