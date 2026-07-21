import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface CatalogMarket {
  _id: string;
  catalogId: string;
  marketId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateCatalogMarketPayload {
  catalogId: string;
  marketId: string;
}

interface CatalogMarketContextType {
  items: CatalogMarket[];
  loading: boolean;
  error: string | null;
  getByCatalogId: (catalogId: string) => Promise<CatalogMarket[]>;
  createItem: (payload: CreateCatalogMarketPayload) => Promise<CatalogMarket>;
  deleteItem: (id: string) => Promise<string>;
}

const CatalogMarketContext = createContext<CatalogMarketContextType | undefined>(undefined);

export const CatalogMarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CatalogMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByCatalogId = useCallback(async (catalogId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<CatalogMarket[]>>(`/catalog-markets/catalog/${catalogId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch catalog markets');
      setItems(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch catalog markets';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload: CreateCatalogMarketPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<CatalogMarket>>('/catalog-markets', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to add market to catalog');
      setItems(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add market to catalog';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/catalog-markets/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete catalog market');
      setItems(prev => prev.filter(i => i._id !== data.deletedId));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete catalog market';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CatalogMarketContextType = {
    items,
    loading,
    error,
    getByCatalogId,
    createItem,
    deleteItem,
  };

  return (
    <CatalogMarketContext.Provider value={value}>{children}</CatalogMarketContext.Provider>
  );
};

export const useCatalogMarkets = (): CatalogMarketContextType => {
  const ctx = useContext(CatalogMarketContext);
  if (!ctx) throw new Error('useCatalogMarkets must be used within a CatalogMarketProvider');
  return ctx;
};

export default CatalogMarketContext;


