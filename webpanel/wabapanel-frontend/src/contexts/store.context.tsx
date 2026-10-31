'use client';

/**
 * Webpanel adapter for codiic's `useStore` — the create-theme builder uses
 * `activeStoreId`, `stores`, `setStores`, `applyStoreCustomTheme` and
 * `updateStore`. Backed by the zustand `useStoreStore`.
 */

import { useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { useStoreStore, selectActiveStore, type WebpanelStore } from '@/stores/storeStore';

export type Store = WebpanelStore & {
  appliedCustomThemeId?: string | null;
  appliedTheme?: string | null;
  [key: string]: unknown;
};

export function useStore() {
  const stores = useStoreStore((s) => s.stores) as Store[];
  const activeStoreId = useStoreStore((s) => s.activeStoreId);
  const loading = useStoreStore((s) => s.loading);
  const error = useStoreStore((s) => s.error);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const setActiveStoreId = useStoreStore((s) => s.setActiveStoreId);
  const activeStore = useStoreStore(selectActiveStore) as Store | null;

  const setStores = useCallback(
    (updater: Store[] | ((prev: Store[]) => Store[])) => {
      const next =
        typeof updater === 'function'
          ? updater(useStoreStore.getState().stores as Store[])
          : updater;
      useStoreStore.setState({ stores: next });
    },
    []
  );

  const applyStoreCustomTheme = useCallback(
    async (storeId: string, themeId: string): Promise<Store | null> => {
      const res = await api.post<{
        success: boolean;
        data?: Store;
        message?: string;
      }>(`/stores/${storeId}/apply-custom-theme`, { themeId });
      const updated = (res.data?.data ?? null) as Store | null;
      if (updated) {
        setStores((prev) =>
          prev.map((s) => (s._id === storeId ? { ...s, ...updated } : s))
        );
      }
      return updated;
    },
    [setStores]
  );

  const updateStore = useCallback(
    async (storeId: string, payload: Partial<Store>) => {
      const res = await api.put<{ success: boolean; data?: Store }>(
        `/stores/${storeId}`,
        payload
      );
      return res.data?.data ?? null;
    },
    []
  );

  return useMemo(
    () => ({
      activeStoreId,
      activeStore,
      stores,
      loading,
      error,
      fetchStores,
      setActiveStoreId,
      setStores,
      applyStoreCustomTheme,
      updateStore,
    }),
    [
      activeStoreId,
      activeStore,
      stores,
      loading,
      error,
      fetchStores,
      setActiveStoreId,
      setStores,
      applyStoreCustomTheme,
      updateStore,
    ]
  );
}
