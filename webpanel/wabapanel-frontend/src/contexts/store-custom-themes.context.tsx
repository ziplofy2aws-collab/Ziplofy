'use client';

/** Webpanel adapter for codiic `useStoreCustomThemes` — backed by wabapanel-express custom-themes routes. */

import { useCallback, useMemo, useState } from 'react';
import api from '@/lib/api';

export type StoreCustomTheme = {
  _id: string;
  storeId: string;
  themeName: string;
  themeDesc?: string | null;
  themeConfig: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStoreCustomThemePayload = {
  storeId: string;
  themeName: string;
  themeDesc?: string;
  themeConfig: Record<string, unknown>;
};

export type UpdateStoreCustomThemePayload = {
  themeName?: string;
  themeDesc?: string | null;
  themeConfig?: Record<string, unknown>;
};

export function useStoreCustomThemes() {
  const [themes, setThemes] = useState<StoreCustomTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: StoreCustomTheme[] }>(
        `/stores/${storeId}/custom-themes`
      );
      const items = res.data?.data ?? [];
      setThemes(items);
      return items;
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to load custom themes';
      setError(message);
      return [] as StoreCustomTheme[];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateStoreCustomThemePayload) => {
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: StoreCustomTheme }>(
        `/stores/${payload.storeId}/custom-themes`,
        payload
      );
      const theme = res.data?.data as StoreCustomTheme;
      setThemes((prev) => [theme, ...prev]);
      return theme;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, payload: UpdateStoreCustomThemePayload) => {
      setLoading(true);
      try {
        const res = await api.put<{ success: boolean; data: StoreCustomTheme }>(
          `/custom-themes/${id}`,
          payload
        );
        const theme = res.data?.data as StoreCustomTheme;
        setThemes((prev) => prev.map((t) => (t._id === id ? theme : t)));
        return theme;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTheme = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/custom-themes/${id}`);
      setThemes((prev) => prev.filter((t) => t._id !== id));
      return { deletedId: id };
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setThemes([]), []);
  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      themes,
      loading,
      error,
      getByStoreId,
      create,
      update,
      deleteTheme,
      clear,
      clearError,
    }),
    [themes, loading, error, getByStoreId, create, update, deleteTheme, clear, clearError]
  );
}
