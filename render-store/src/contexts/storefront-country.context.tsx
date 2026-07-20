import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface Country {
  _id: string;
  name: string;
  officialName: string;
  iso2: string;
  iso3: string;
  numericCode: string;
  region?: string;
  subRegion?: string;
  flagEmoji?: string;
  currencyCode?: string;
  currencyId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: { total: number; page: number; limit: number };
}

export interface GetCountriesParams {
  q?: string;
  page?: number;
  limit?: number;
}

interface CountryContextType {
  countries: Country[];
  total: number;
  loading: boolean;
  error: string | null;
  getCountries: (params?: GetCountriesParams) => Promise<Country[]>;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const StorefrontCountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCountries = useCallback(async (params: GetCountriesParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const res = await axiosi.get<ApiResponse<Country[]>>(`/countries?${query.toString()}`);
      const { success, data, message, meta } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch countries');
      setCountries(data || []);
      if (meta) {
        setTotal(meta.total);
      }
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch countries';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CountryContextType = {
    countries,
    total,
    loading,
    error,
    getCountries,
  };

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useStorefrontCountries = (): CountryContextType => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useStorefrontCountries must be used within a StorefrontCountryProvider');
  return ctx;
};

export default CountryContext;
