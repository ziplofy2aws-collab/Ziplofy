import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Tax Rate interface matching backend model
export interface TaxRate {
  _id: string;
  storeId: string | {
    _id: string;
    storeName: string;
  };
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
  taxRate: number;
  taxLabel: string;
  calculationMethod?: 'added' | 'instead' | 'compounded' | null;
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

interface CreateTaxRatePayload {
  storeId: string;
  countryId: string;
  stateId?: string | null;
  taxRate: number;
  taxLabel: string;
  calculationMethod?: 'added' | 'instead' | 'compounded' | null;
}

interface UpdateTaxRatePayload {
  taxRate?: number;
  taxLabel?: string;
  calculationMethod?: 'added' | 'instead' | 'compounded' | null;
}

interface GetTaxRatesByStoreParams {
  countryId?: string;
  stateId?: string | null;
}

// State with tax details interface
export interface StateWithTaxDetails {
  _id: string;
  name: string;
  code: string;
  type?: string;
  countryId: string;
  countryIso2: string;
  taxRate: number;
  taxLabel: string | null;
  calculationMethod: 'added' | 'instead' | 'compounded' | null;
  isOverride: boolean;
  overrideId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Federal tax info interface
export interface FederalTaxInfo {
  taxRate: number;
  taxLabel: string | null;
  calculationMethod: null; // Federal tax doesn't have calculation method
  isOverride: boolean;
  overrideId: string | null;
}

// States with tax details response interface
export interface StatesWithTaxDetailsResponse {
  country: {
    _id: string;
    name: string;
    iso2: string;
  };
  federalTax: FederalTaxInfo;
  states: StateWithTaxDetails[];
}

interface TaxRateOverrideContextType {
  taxRates: TaxRate[];
  loading: boolean;
  error: string | null;
  createTaxRate: (payload: CreateTaxRatePayload) => Promise<TaxRate>;
  getTaxRatesByStoreId: (storeId: string, params?: GetTaxRatesByStoreParams) => Promise<TaxRate[]>;
  getTaxRateByStoreAndState: (storeId: string, stateId: string, countryId?: string) => Promise<TaxRate>;
  updateTaxRate: (id: string, payload: UpdateTaxRatePayload) => Promise<TaxRate>;
  deleteTaxRate: (id: string) => Promise<void>;
  getTaxRateById: (id: string) => Promise<TaxRate>;
  getStatesWithTaxDetails: (storeId: string, countryId: string) => Promise<StatesWithTaxDetailsResponse>;
  deleteTaxOverridesByStoreAndCountry: (storeId: string, countryId: string) => Promise<{ deletedCount: number }>;
  clearTaxRates: () => void;
}

const TaxRateOverrideContext = createContext<TaxRateOverrideContextType | undefined>(undefined);

export const TaxRateOverrideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new tax rate
  const createTaxRate = useCallback(async (payload: CreateTaxRatePayload): Promise<TaxRate> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<TaxRate>>('/tax-rates', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create tax rate');
      setTaxRates((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create tax rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tax rates by store ID
  const getTaxRatesByStoreId = useCallback(async (
    storeId: string,
    params?: GetTaxRatesByStoreParams
  ): Promise<TaxRate[]> => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (params?.countryId) query.set('countryId', params.countryId);
      if (params?.stateId !== undefined) {
        query.set('stateId', params.stateId === null ? 'null' : params.stateId);
      }
      const queryString = query.toString();
      const url = `/tax-rates/store/${storeId}${queryString ? `?${queryString}` : ''}`;
      const res = await axiosi.get<ApiResponse<TaxRate[]>>(url);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax rates');
      setTaxRates(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax rates';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tax rate by store ID and state ID
  const getTaxRateByStoreAndState = useCallback(async (
    storeId: string,
    stateId: string,
    countryId?: string
  ): Promise<TaxRate> => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (countryId) query.set('countryId', countryId);
      const queryString = query.toString();
      const url = `/tax-rates/store/${storeId}/state/${stateId}${queryString ? `?${queryString}` : ''}`;
      const res = await axiosi.get<ApiResponse<TaxRate>>(url);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax rate');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a tax rate
  const updateTaxRate = useCallback(async (
    id: string,
    payload: UpdateTaxRatePayload
  ): Promise<TaxRate> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<TaxRate>>(`/tax-rates/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update tax rate');
      setTaxRates((prev) => prev.map((rate) => (rate._id === id ? data : rate)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update tax rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a tax rate
  const deleteTaxRate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{}>>(`/tax-rates/${id}`);
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete tax rate');
      setTaxRates((prev) => prev.filter((rate) => rate._id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete tax rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tax rate by ID
  const getTaxRateById = useCallback(async (id: string): Promise<TaxRate> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<TaxRate>>(`/tax-rates/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax rate');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get states with tax details (overrides if exist, otherwise defaults)
  const getStatesWithTaxDetails = useCallback(async (
    storeId: string,
    countryId: string
  ): Promise<StatesWithTaxDetailsResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StatesWithTaxDetailsResponse>>(
        `/tax-rates/store/${storeId}/country/${countryId}/states`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch states with tax details');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch states with tax details';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete all tax overrides for a store and country
  const deleteTaxOverridesByStoreAndCountry = useCallback(async (
    storeId: string,
    countryId: string
  ): Promise<{ deletedCount: number }> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedCount: number; storeId: string; countryId: string }>>(
        `/tax-rates/store/${storeId}/country/${countryId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete tax overrides');
      // Remove deleted tax rates from state
      setTaxRates((prev) => prev.filter((rate) => {
        const rateStoreId = typeof rate.storeId === 'object' ? rate.storeId._id : rate.storeId;
        const rateCountryId = typeof rate.countryId === 'object' ? rate.countryId._id : rate.countryId;
        return rateStoreId !== storeId || rateCountryId !== countryId;
      }));
      return { deletedCount: data.deletedCount };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete tax overrides';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear tax rates
  const clearTaxRates = useCallback(() => {
    setTaxRates([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: TaxRateOverrideContextType = {
    taxRates,
    loading,
    error,
    createTaxRate,
    getTaxRatesByStoreId,
    getTaxRateByStoreAndState,
    updateTaxRate,
    deleteTaxRate,
    getTaxRateById,
    getStatesWithTaxDetails,
    deleteTaxOverridesByStoreAndCountry,
    clearTaxRates,
  };

  return <TaxRateOverrideContext.Provider value={value}>{children}</TaxRateOverrideContext.Provider>;
};

export const useTaxRateOverrides = (): TaxRateOverrideContextType => {
  const ctx = useContext(TaxRateOverrideContext);
  if (!ctx) throw new Error('useTaxRateOverrides must be used within a TaxRateOverrideProvider');
  return ctx;
};

export default TaxRateOverrideContext;

