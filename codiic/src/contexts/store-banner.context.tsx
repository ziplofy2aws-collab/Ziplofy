import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreBanner {
  _id: string;
  storeId: string;
  bannerGroupName: string;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateStoreBannerPayload {
  storeId: string;
  bannerGroupName: string;
  imageUrls?: string[];
}

export interface UpdateStoreBannerPayload {
  bannerGroupName?: string;
  imageUrls?: string[];
}

interface StoreBannerContextType {
  banners: StoreBanner[];
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreBanner[]>;
  create: (payload: CreateStoreBannerPayload) => Promise<StoreBanner>;
  update: (id: string, payload: UpdateStoreBannerPayload) => Promise<StoreBanner>;
  clear: () => void;
  clearError: () => void;
}

const StoreBannerContext = createContext<StoreBannerContextType | undefined>(undefined);

export const StoreBannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreBanner[]>>(`/store-banners/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch store banners');
      const list = Array.isArray(data) ? data : [];
      setBanners(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch store banners';
      setError(msg);
      setBanners([]);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateStoreBannerPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreBanner>>('/store-banners', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create store banner');
      setBanners((prev) => [data, ...prev.filter((b) => b._id !== data._id)]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create store banner';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateStoreBannerPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreBanner>>(`/store-banners/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update store banner');
      setBanners((prev) => prev.map((b) => (b._id === data._id ? data : b)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update store banner';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setBanners([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StoreBannerContextType = {
    banners,
    loading,
    error,
    getByStoreId,
    create,
    update,
    clear,
    clearError,
  };

  return (
    <StoreBannerContext.Provider value={value}>{children}</StoreBannerContext.Provider>
  );
};

export const useStoreBanner = (): StoreBannerContextType => {
  const ctx = useContext(StoreBannerContext);
  if (!ctx) throw new Error('useStoreBanner must be used within a StoreBannerProvider');
  return ctx;
};

export default StoreBannerContext;
