import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface Catalog {
  _id: string;
  storeId: string;
  title: string;
  status: 'active' | 'draft';
  currencyId: string;
  priceAdjustment: number;
  priceAdjustmentSide: 'increase' | 'decrease';
  includeCompareAtPrice: boolean;
  autoIncludeNewProducts: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateCatalogPayload {
  storeId: string;
  title: string;
  status?: 'active' | 'draft';
  currencyId: string;
  priceAdjustment?: number;
  priceAdjustmentSide?: 'increase' | 'decrease';
  includeCompareAtPrice?: boolean;
  autoIncludeNewProducts?: boolean;
}

export interface UpdateCatalogPayload {
  title?: string;
  status?: 'active' | 'draft';
  currencyId?: string;
  priceAdjustment?: number;
  priceAdjustmentSide?: 'increase' | 'decrease';
  includeCompareAtPrice?: boolean;
  autoIncludeNewProducts?: boolean;
}

interface CatalogContextType {
  catalogs: Catalog[];
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<Catalog[]>;
  createCatalog: (payload: CreateCatalogPayload) => Promise<Catalog>;
  updateCatalog: (id: string, payload: UpdateCatalogPayload) => Promise<Catalog>;
  deleteCatalog: (id: string) => Promise<string>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<Catalog[]>>(`/catalogs/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch catalogs');
      setCatalogs(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch catalogs';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCatalog = useCallback(async (payload: CreateCatalogPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<Catalog>>('/catalogs', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create catalog');
      setCatalogs(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create catalog';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCatalog = useCallback(async (id: string, payload: UpdateCatalogPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<Catalog>>(`/catalogs/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update catalog');
      setCatalogs(prev => prev.map(c => (c._id === id ? data : c)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update catalog';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCatalog = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/catalogs/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete catalog');
      setCatalogs(prev => prev.filter(c => c._id !== data.deletedId));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete catalog';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CatalogContextType = {
    catalogs,
    loading,
    error,
    getByStoreId,
    createCatalog,
    updateCatalog,
    deleteCatalog,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalogs = (): CatalogContextType => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalogs must be used within a CatalogProvider');
  return ctx;
};

export default CatalogContext;


