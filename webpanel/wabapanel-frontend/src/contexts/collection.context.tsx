'use client';

/**
 * Webpanel adapter for codiic `useCollections`.
 * Webpanel stores have no product collections — returns empty lists so
 * collection-driven sections/pickers render empty states.
 */

import { useCallback, useMemo, useState } from 'react';

export type Collection = {
  _id: string;
  storeId?: string;
  title: string;
  urlHandle?: string;
  description?: string;
  imageUrl?: string | null;
  status?: string;
  productsCount?: number;
  [key: string]: unknown;
};

export function useCollections() {
  const [collections] = useState<Collection[]>([]);
  const [loading] = useState(false);

  const emptyFetch = useCallback(async (_storeId: string) => [] as Collection[], []);
  const noopAsync = useCallback(async () => null, []);

  return useMemo(
    () => ({
      collections,
      activeCollection: null as Collection | null,
      activeCollectionLoading: false,
      loading,
      error: null as string | null,
      pagination: { page: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 },
      fetchCollectionsByStoreId: emptyFetch,
      fetchCollectionById: noopAsync,
      createCollection: noopAsync,
      updateCollection: noopAsync,
      deleteCollection: noopAsync,
      searchCollections: async () => [] as Collection[],
      searchProductsInCollection: async () => [] as Array<Record<string, unknown>>,
      clearCollections: () => undefined,
      clearActiveCollection: () => undefined,
    }),
    [collections, loading, emptyFetch, noopAsync]
  );
}
