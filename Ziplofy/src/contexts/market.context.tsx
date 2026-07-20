import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface Market {
  _id: string;
  storeId: string;
  name: string;
  status: 'active' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface MarketCountry {
  _id: string;
  name: string;
  officialName: string;
  iso2: string;
  iso3: string;
  numericCode: string;
  region?: string;
  subRegion?: string;
  flagEmoji?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  count?: number;
}

export interface CreateMarketPayload {
  storeId: string;
  name: string;
  status?: 'active' | 'draft';
}

export interface UpdateMarketPayload {
  name?: string;
  status?: 'active' | 'draft';
}

interface MarketContextType {
  markets: Market[];
  storeCountries: MarketCountry[];
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<Market[]>;
  getCountriesByStoreId: (storeId: string) => Promise<MarketCountry[]>;
  createMarket: (payload: CreateMarketPayload) => Promise<Market>;
  updateMarket: (id: string, payload: UpdateMarketPayload) => Promise<Market>;
  deleteMarket: (id: string) => Promise<string>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [storeCountries, setStoreCountries] = useState<MarketCountry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<Market[]>>(`/markets/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch markets');
      setMarkets(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch markets';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCountriesByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<MarketCountry[]>>(`/markets/store/${storeId}/countries`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch market countries');
      setStoreCountries(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch market countries';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMarket = useCallback(async (payload: CreateMarketPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<Market>>('/markets', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create market');
      setMarkets(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create market';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMarket = useCallback(async (id: string, payload: UpdateMarketPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<Market>>(`/markets/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update market');
      setMarkets(prev => prev.map(m => (m._id === id ? data : m)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update market';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMarket = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/markets/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete market');
      setMarkets(prev => prev.filter(m => m._id !== data.deletedId));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete market';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: MarketContextType = {
    markets,
    storeCountries,
    loading,
    error,
    getByStoreId,
    getCountriesByStoreId,
    createMarket,
    updateMarket,
    deleteMarket,
  };

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
};

export const useMarkets = (): MarketContextType => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarkets must be used within a MarketProvider');
  return ctx;
};

export default MarketContext;


