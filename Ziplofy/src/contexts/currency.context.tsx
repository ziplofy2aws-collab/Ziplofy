import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol?: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: { total: number; page: number; limit: number };
}

export interface GetCurrenciesParams {
  q?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

interface CurrencyContextType {
  currencies: Currency[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  getCurrencies: (params?: GetCurrenciesParams) => Promise<Currency[]>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrencies = useCallback(async (params: GetCurrenciesParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (typeof params.active === 'boolean') query.set('active', String(params.active));
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      const res = await axiosi.get<ApiResponse<Currency[]>>(`/currencies?${query.toString()}`);
      const { success, data, message, meta } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch currencies');
      setCurrencies(data || []);
      if (meta) {
        setTotal(meta.total);
        setPage(meta.page);
        setLimit(meta.limit);
      }
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch currencies';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CurrencyContextType = {
    currencies,
    total,
    page,
    limit,
    loading,
    error,
    getCurrencies,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrencies = (): CurrencyContextType => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrencies must be used within a CurrencyProvider');
  return ctx;
};

export default CurrencyContext;


