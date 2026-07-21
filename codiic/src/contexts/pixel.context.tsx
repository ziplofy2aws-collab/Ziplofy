import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type DataSaleOption =
  | 'qualifies_as_data_sale'
  | 'qualifies_as_data_sale_limited_use'
  | 'does_not_qualify_as_data_sale';

export interface Pixel {
  _id: string;
  storeId: string;
  pixelName: string;
  type: string;
  status: string;
  required: boolean;
  notRequired: boolean;
  marketing: boolean;
  analytics: boolean;
  preferences: boolean;
  dataSale: DataSaleOption;
  code: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreatePixelPayload {
  storeId: string;
  pixelName: string;
  type: string;
  status: string;
  required?: boolean;
  notRequired?: boolean;
  marketing?: boolean;
  analytics?: boolean;
  preferences?: boolean;
  dataSale?: DataSaleOption;
  code: string;
}

export interface UpdatePixelPayload {
  pixelName?: string;
  type?: string;
  status?: string;
  required?: boolean;
  notRequired?: boolean;
  marketing?: boolean;
  analytics?: boolean;
  preferences?: boolean;
  dataSale?: DataSaleOption;
  code?: string;
}

interface PixelContextType {
  pixels: Pixel[];
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<Pixel[]>;
  create: (payload: CreatePixelPayload) => Promise<Pixel>;
  update: (id: string, payload: UpdatePixelPayload) => Promise<Pixel>;
  remove: (id: string) => Promise<Pixel>;
  clear: () => void;
  clearError: () => void;
}

const PixelContext = createContext<PixelContextType | undefined>(undefined);

export const PixelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<Pixel[]>>(`/pixels/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch pixels');
      setPixels(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch pixels';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreatePixelPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<Pixel>>('/pixels', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create pixel');
      setPixels((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create pixel';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdatePixelPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<Pixel>>(`/pixels/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update pixel');
      setPixels((prev) => prev.map((p) => (p._id === id ? data : p)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update pixel';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<Pixel>>(`/pixels/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete pixel');
      setPixels((prev) => prev.filter((p) => p._id !== id));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete pixel';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPixels([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: PixelContextType = {
    pixels,
    loading,
    error,
    fetchByStoreId,
    create,
    update,
    remove,
    clear,
    clearError,
  };

  return <PixelContext.Provider value={value}>{children}</PixelContext.Provider>;
};

export const usePixels = (): PixelContextType => {
  const ctx = useContext(PixelContext);
  if (!ctx) throw new Error('usePixels must be used within a PixelProvider');
  return ctx;
};

export default PixelContext;
