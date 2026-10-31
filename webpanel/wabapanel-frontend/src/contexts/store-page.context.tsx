'use client';

/** Webpanel adapter for codiic `useStorePages` — backed by storePageApi. */

import { useCallback, useMemo, useState } from 'react';
import { storePageApi, type StorePageItem } from '@/lib/store-page';

export type StorePage = StorePageItem & { [key: string]: unknown };

export function useStorePages() {
  const [pages, setPages] = useState<StorePage[]>([]);
  const [activePage, setActivePage] = useState<StorePage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPagesByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    try {
      const res = await storePageApi.listPages(storeId);
      const items = (res.data?.data ?? []) as StorePage[];
      setPages(items);
      return items;
    } catch {
      return [] as StorePage[];
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePage = useCallback(
    async (payload: Partial<StorePage> & { storeId?: string; pageId?: string; _id?: string }) => {
      const { storeId, pageId, _id, ...rest } = payload;
      const id = pageId || _id;
      const res = await storePageApi.updatePage(String(storeId ?? ''), String(id), rest);
      const page = res.data?.data as StorePage;
      setPages((prev) => prev.map((p) => (p._id === id ? page : p)));
      return page;
    },
    []
  );

  const fetchPageById = useCallback(async (_storeId: string, pageId: string) => {
    return pages.find((p) => p._id === pageId) ?? null;
  }, [pages]);

  const createPage = useCallback(async (payload: Partial<StorePage> & { storeId?: string }) => {
    const { storeId, ...rest } = payload;
    const res = await storePageApi.createPage(String(storeId ?? ''), rest);
    const page = res.data?.data as StorePage;
    setPages((prev) => [...prev, page]);
    return page;
  }, []);

  return useMemo(
    () => ({
      pages,
      activePage,
      loading,
      error,
      fetchPagesByStoreId,
      fetchPageById,
      createPage,
      updatePage,
      deletePage: async (storeId: string, pageId: string) => {
        await storePageApi.deletePage(storeId, pageId);
        setPages((prev) => prev.filter((p) => p._id !== pageId));
      },
      clearPages: () => setPages([]),
      clearActivePage: () => setActivePage(null),
    }),
    [pages, activePage, loading, error, fetchPagesByStoreId, fetchPageById, createPage, updatePage]
  );
}
