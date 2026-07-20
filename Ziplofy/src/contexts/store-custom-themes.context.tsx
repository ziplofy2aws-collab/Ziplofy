import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreCustomTheme {
  _id: string;
  storeId: string;
  themeName: string;
  themeDesc?: string;
  themeConfig: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateStoreCustomThemePayload {
  storeId: string;
  themeName: string;
  themeDesc?: string;
  themeConfig: Record<string, unknown>;
}

export interface UpdateStoreCustomThemePayload {
  themeName?: string;
  themeDesc?: string | null;
  themeConfig?: Record<string, unknown>;
}

interface StoreCustomThemesContextType {
  themes: StoreCustomTheme[];
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreCustomTheme[]>;
  create: (payload: CreateStoreCustomThemePayload) => Promise<StoreCustomTheme>;
  update: (id: string, payload: UpdateStoreCustomThemePayload) => Promise<StoreCustomTheme>;
  deleteTheme: (id: string) => Promise<void>;
  clear: () => void;
  clearError: () => void;
}

const StoreCustomThemesContext = createContext<StoreCustomThemesContextType | undefined>(
  undefined
);

export const StoreCustomThemesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<StoreCustomTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreCustomTheme[]>>(
        `/store-custom-themes/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch store custom themes');
      const list = Array.isArray(data) ? data : [];
      setThemes(list);
      return list;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to fetch store custom themes';
      setError(msg);
      setThemes([]);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateStoreCustomThemePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreCustomTheme>>('/store-custom-themes', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create store custom theme');
      setThemes((prev) => [data, ...prev.filter((t) => t._id !== data._id)]);
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to create store custom theme';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateStoreCustomThemePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreCustomTheme>>(
        `/store-custom-themes/${id}`,
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update store custom theme');
      setThemes((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update store custom theme';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTheme = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(
        `/store-custom-themes/${id}`
      );
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete store custom theme');
      setThemes((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to delete store custom theme';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setThemes([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StoreCustomThemesContextType = {
    themes,
    loading,
    error,
    getByStoreId,
    create,
    update,
    deleteTheme,
    clear,
    clearError,
  };

  return (
    <StoreCustomThemesContext.Provider value={value}>{children}</StoreCustomThemesContext.Provider>
  );
};

export const useStoreCustomThemes = (): StoreCustomThemesContextType => {
  const ctx = useContext(StoreCustomThemesContext);
  if (!ctx) {
    throw new Error('useStoreCustomThemes must be used within a StoreCustomThemesProvider');
  }
  return ctx;
};

export default StoreCustomThemesContext;
