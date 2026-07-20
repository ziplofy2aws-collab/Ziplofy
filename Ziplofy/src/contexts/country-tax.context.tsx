import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Country Tax interface matching backend model
export interface CountryTax {
  _id: string;
  countryId: string | {
    _id: string;
    name: string;
    iso2: string;
    iso3: string;
  };
  taxRate: number;
  createdAt: string;
  updatedAt: string;
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CountryTaxContextType {
  countryTax: CountryTax | null;
  countryTaxMap: Record<string, CountryTax>;
  loading: boolean;
  error: string | null;
  getCountryTaxByCountryId: (countryId: string, options?: { force?: boolean }) => Promise<CountryTax>;
  clearCountryTax: (countryId?: string) => void;
}

const CountryTaxContext = createContext<CountryTaxContextType | undefined>(undefined);

export const CountryTaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryTax, setCountryTax] = useState<CountryTax | null>(null);
  const [countryTaxMap, setCountryTaxMap] = useState<Record<string, CountryTax>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get country tax by country ID
  const getCountryTaxByCountryId = useCallback(async (countryId: string, options?: { force?: boolean }): Promise<CountryTax> => {
    const cached = countryTaxMap[countryId];
    if (cached && !options?.force) {
      setCountryTax(cached);
      return cached;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<CountryTax>>(`/country-taxes/${countryId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch country tax');
      setCountryTax(data);
      setCountryTaxMap((prev) => ({ ...prev, [countryId]: data }));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to fetch country tax';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [countryTaxMap]);

  // Clear country tax
  const clearCountryTax = useCallback((countryId?: string) => {
    if (countryId) {
      setCountryTaxMap((prev) => {
        const next = { ...prev };
        delete next[countryId];
        return next;
      });
      setCountryTax((prev) => {
        if (!prev) return prev;
        const prevCountryId =
          typeof prev.countryId === 'string' ? prev.countryId : prev.countryId?._id ?? '';
        return prevCountryId === countryId ? null : prev;
      });
    } else {
      setCountryTax(null);
      setCountryTaxMap({});
    }
    setError(null);
    setLoading(false);
  }, []);

  const value: CountryTaxContextType = {
    countryTax,
    countryTaxMap,
    loading,
    error,
    getCountryTaxByCountryId,
    clearCountryTax,
  };

  return <CountryTaxContext.Provider value={value}>{children}</CountryTaxContext.Provider>;
};

export const useCountryTax = (): CountryTaxContextType => {
  const ctx = useContext(CountryTaxContext);
  if (!ctx) throw new Error('useCountryTax must be used within a CountryTaxProvider');
  return ctx;
};

export default CountryTaxContext;

