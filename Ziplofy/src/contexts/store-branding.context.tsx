import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreBranding {
  _id: string;
  storeId: string;
  // Logos
  defaultLogoUrl?: string;
  squareLogoUrl?: string;
  // Colors
  primaryColor?: string;
  contrastColor?: string;
  secondaryColors?: string[];
  secondaryContrastColor?: string;
  // Images
  coverImageUrl?: string;
  // Text
  slogan?: string;
  shortDescription?: string;
  // Social Links
  socialLinks?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateStoreBrandingPayload {
  storeId: string;
  defaultLogoUrl?: string;
  squareLogoUrl?: string;
  primaryColor?: string;
  contrastColor?: string;
  secondaryColors?: string[];
  secondaryContrastColor?: string;
  coverImageUrl?: string;
  slogan?: string;
  shortDescription?: string;
  socialLinks?: Record<string, string>;
}

export interface UpdateStoreBrandingPayload {
  defaultLogoUrl?: string;
  squareLogoUrl?: string;
  primaryColor?: string;
  contrastColor?: string;
  secondaryColors?: string[];
  secondaryContrastColor?: string;
  coverImageUrl?: string;
  slogan?: string;
  shortDescription?: string;
  socialLinks?: Record<string, string>;
}

interface StoreBrandingContextType {
  branding: StoreBranding | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreBranding | null>;
  create: (payload: CreateStoreBrandingPayload) => Promise<StoreBranding>;
  update: (id: string, payload: UpdateStoreBrandingPayload) => Promise<StoreBranding>;
  clear: () => void;
  clearError: () => void;
}

const StoreBrandingContext = createContext<StoreBrandingContextType | undefined>(undefined);

export const StoreBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<StoreBranding | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreBranding | null>>(`/store-branding/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch store branding');
      setBranding(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch store branding';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateStoreBrandingPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreBranding>>('/store-branding', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create store branding');
      setBranding(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create store branding';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateStoreBrandingPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreBranding>>(`/store-branding/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update store branding');
      setBranding(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update store branding';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setBranding(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StoreBrandingContextType = {
    branding,
    loading,
    error,
    getByStoreId,
    create,
    update,
    clear,
    clearError,
  };

  return (
    <StoreBrandingContext.Provider value={value}>{children}</StoreBrandingContext.Provider>
  );
};

export const useStoreBranding = (): StoreBrandingContextType => {
  const ctx = useContext(StoreBrandingContext);
  if (!ctx) throw new Error('useStoreBranding must be used within a StoreBrandingProvider');
  return ctx;
};

export default StoreBrandingContext;

