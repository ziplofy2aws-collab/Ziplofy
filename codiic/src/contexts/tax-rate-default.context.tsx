import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Tax Default interface matching backend model
export interface TaxDefault {
  _id: string;
  countryId: string | {
    _id: string;
    name: string;
    iso2: string;
  };
  stateId?: string | {
    _id: string;
    name: string;
    code: string;
  } | null;
  taxLabel: string;
  taxRate: number;
  calculationMethod?: 'added' | 'instead' | 'compounded' | null;
  isOverride?: boolean;
  overridden?: boolean;
  overrideId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

interface TaxRateDefaultContextType {
  taxDefaults: TaxDefault[];
  loading: boolean;
  error: string | null;
  getTaxDefaultsByCountryId: (countryId: string, storeId?: string) => Promise<TaxDefault[]>;
  getTaxDefaultByCountryAndState: (countryId: string, stateId: string) => Promise<TaxDefault>;
  getTaxDefaultById: (id: string) => Promise<TaxDefault>;
  clearTaxDefaults: () => void;
}

const TaxRateDefaultContext = createContext<TaxRateDefaultContextType | undefined>(undefined);

export const TaxRateDefaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taxDefaults, setTaxDefaults] = useState<TaxDefault[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get tax defaults by country ID (with optional storeId to check for overrides)
  const getTaxDefaultsByCountryId = useCallback(async (
    countryId: string,
    storeId?: string
  ): Promise<TaxDefault[]> => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (storeId) query.set('storeId', storeId);
      const queryString = query.toString();
      const url = `/tax-defaults/country/${countryId}${queryString ? `?${queryString}` : ''}`;
      const res = await axiosi.get<ApiResponse<TaxDefault[]>>(url);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax defaults');
      setTaxDefaults(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax defaults';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tax default by country ID and state ID
  const getTaxDefaultByCountryAndState = useCallback(async (
    countryId: string,
    stateId: string
  ): Promise<TaxDefault> => {
    try {
      setLoading(true);
      setError(null);
      const url = `/tax-defaults/country/${countryId}/state/${stateId}`;
      const res = await axiosi.get<ApiResponse<TaxDefault>>(url);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax default');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax default';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tax default by ID
  const getTaxDefaultById = useCallback(async (id: string): Promise<TaxDefault> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<TaxDefault>>(`/tax-defaults/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax default');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax default';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear tax defaults
  const clearTaxDefaults = useCallback(() => {
    setTaxDefaults([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: TaxRateDefaultContextType = {
    taxDefaults,
    loading,
    error,
    getTaxDefaultsByCountryId,
    getTaxDefaultByCountryAndState,
    getTaxDefaultById,
    clearTaxDefaults,
  };

  return <TaxRateDefaultContext.Provider value={value}>{children}</TaxRateDefaultContext.Provider>;
};

export const useTaxRateDefaults = (): TaxRateDefaultContextType => {
  const ctx = useContext(TaxRateDefaultContext);
  if (!ctx) throw new Error('useTaxRateDefaults must be used within a TaxRateDefaultProvider');
  return ctx;
};

export default TaxRateDefaultContext;

