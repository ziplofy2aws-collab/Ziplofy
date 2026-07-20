import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type { Country } from './country.context';

export interface MarketInclude {
  _id: string;
  marketId: string;
  countryId: string | Country; // populated in API
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateMarketIncludePayload {
  marketId: string;
  countryId: string;
}

interface MarketIncludesContextType {
  items: MarketInclude[];
  loading: boolean;
  error: string | null;
  getByMarketId: (marketId: string) => Promise<MarketInclude[]>;
  createItem: (payload: CreateMarketIncludePayload) => Promise<MarketInclude>;
  deleteItem: (id: string) => Promise<string>;
}

const MarketIncludesContext = createContext<MarketIncludesContextType | undefined>(undefined);

export const MarketIncludesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MarketInclude[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByMarketId = useCallback(async (marketId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<MarketInclude[]>>(`/market-includes/market/${marketId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch market includes');
      setItems(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch market includes';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload: CreateMarketIncludePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<MarketInclude>>('/market-includes', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to add country to market');
      setItems(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add country to market';
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
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/market-includes/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete market include');
      setItems(prev => prev.filter(i => i._id !== data.deletedId));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete market include';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: MarketIncludesContextType = {
    items,
    loading,
    error,
    getByMarketId,
    createItem,
    deleteItem,
  };

  return (
    <MarketIncludesContext.Provider value={value}>{children}</MarketIncludesContext.Provider>
  );
};

export const useMarketIncludes = (): MarketIncludesContextType => {
  const ctx = useContext(MarketIncludesContext);
  if (!ctx) throw new Error('useMarketIncludes must be used within a MarketIncludesProvider');
  return ctx;
};

export default MarketIncludesContext;


