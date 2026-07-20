import React, { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';
import { axiosi } from '../config/axios.config';

// Country Tax Override interface matching backend model
export interface CountryTaxOverride {
  _id: string;
  storeId: string | {
    _id: string;
    storeName: string;
  };
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

interface CreateCountryTaxOverridePayload {
  storeId: string;
  countryId: string;
  taxRate: number;
}

interface UpdateCountryTaxOverridePayload {
  taxRate: number;
}

interface CountryTaxOverrideContextType {
  countryTaxOverride: CountryTaxOverride | null;
  countryTaxOverrideMap: Record<string, CountryTaxOverride>;
  loading: boolean;
  error: string | null;
  createCountryTaxOverride: (payload: CreateCountryTaxOverridePayload) => Promise<CountryTaxOverride>;
  getCountryTaxOverrideByStoreAndCountry: (storeId: string, countryId: string, options?: { force?: boolean }) => Promise<CountryTaxOverride | null>;
  updateCountryTaxOverrideByStoreAndCountry: (storeId: string, countryId: string, payload: UpdateCountryTaxOverridePayload) => Promise<CountryTaxOverride>;
  deleteCountryTaxOverrideByStoreAndCountry: (storeId: string, countryId: string) => Promise<void>;
  clearCountryTaxOverride: (storeId?: string, countryId?: string) => void;
}

const CountryTaxOverrideContext = createContext<CountryTaxOverrideContextType | undefined>(undefined);

export const CountryTaxOverrideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryTaxOverride, setCountryTaxOverride] = useState<CountryTaxOverride | null>(null);
  const [countryTaxOverrideMap, setCountryTaxOverrideMap] = useState<Record<string, CountryTaxOverride>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to access current map without causing re-renders
  const countryTaxOverrideMapRef = useRef<Record<string, CountryTaxOverride>>({});
  
  // Keep ref in sync with state
  useEffect(() => {
    countryTaxOverrideMapRef.current = countryTaxOverrideMap;
  }, [countryTaxOverrideMap]);

  // Create a new country tax override
  const createCountryTaxOverride = useCallback(async (
    payload: CreateCountryTaxOverridePayload
  ): Promise<CountryTaxOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<CountryTaxOverride>>(
        '/country-tax-overrides',
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create country tax override');

      // Update cache and state
      const cacheKey = `${payload.storeId}-${payload.countryId}`;
      setCountryTaxOverride(data);
      setCountryTaxOverrideMap((prev) => {
        const updated = { ...prev, [cacheKey]: data };
        countryTaxOverrideMapRef.current = updated;
        return updated;
      });

      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to create country tax override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get country tax override by store ID and country ID
  const getCountryTaxOverrideByStoreAndCountry = useCallback(async (
    storeId: string,
    countryId: string,
    options?: { force?: boolean }
  ): Promise<CountryTaxOverride | null> => {
    const cacheKey = `${storeId}-${countryId}`;
    const cached = countryTaxOverrideMapRef.current[cacheKey];
    
    if (cached && !options?.force) {
      setCountryTaxOverride(cached);
      return cached;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<CountryTaxOverride>>(
        `/country-tax-overrides/store/${storeId}/country/${countryId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch country tax override');
      
      if (data) {
        setCountryTaxOverride(data);
        setCountryTaxOverrideMap((prev) => {
          const updated = { ...prev, [cacheKey]: data };
          countryTaxOverrideMapRef.current = updated;
          return updated;
        });
        return data;
      }
      return null;
    } catch (err: any) {
      // If 404, return null (override doesn't exist, which is valid)
      if (err?.response?.status === 404) {
        setCountryTaxOverride(null);
        // Clear cache entry if override was deleted
        setCountryTaxOverrideMap((prev) => {
          const next = { ...prev };
          delete next[cacheKey];
          countryTaxOverrideMapRef.current = next;
          return next;
        });
        return null;
      }
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to fetch country tax override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update country tax override by store ID and country ID
  const updateCountryTaxOverrideByStoreAndCountry = useCallback(async (
    storeId: string,
    countryId: string,
    payload: UpdateCountryTaxOverridePayload
  ): Promise<CountryTaxOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<CountryTaxOverride>>(
        `/country-tax-overrides/store/${storeId}/country/${countryId}`,
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update country tax override');

      // Update cache and state
      const cacheKey = `${storeId}-${countryId}`;
      setCountryTaxOverride(data);
      setCountryTaxOverrideMap((prev) => {
        const updated = { ...prev, [cacheKey]: data };
        countryTaxOverrideMapRef.current = updated;
        return updated;
      });

      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to update country tax override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete country tax override by store ID and country ID
  const deleteCountryTaxOverrideByStoreAndCountry = useCallback(async (
    storeId: string,
    countryId: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{}>>(
        `/country-tax-overrides/store/${storeId}/country/${countryId}`
      );
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete country tax override');
      
      // Clear from cache and state
      const cacheKey = `${storeId}-${countryId}`;
      setCountryTaxOverrideMap((prev) => {
        const next = { ...prev };
        delete next[cacheKey];
        countryTaxOverrideMapRef.current = next;
        return next;
      });
      setCountryTaxOverride((prev) => {
        if (!prev) return null;
        const prevStoreId = typeof prev.storeId === 'string' ? prev.storeId : prev.storeId?._id ?? '';
        const prevCountryId = typeof prev.countryId === 'string' ? prev.countryId : prev.countryId?._id ?? '';
        return prevStoreId === storeId && prevCountryId === countryId ? null : prev;
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to delete country tax override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear country tax override
  const clearCountryTaxOverride = useCallback((storeId?: string, countryId?: string) => {
    if (storeId && countryId) {
      const cacheKey = `${storeId}-${countryId}`;
      setCountryTaxOverrideMap((prev) => {
        const next = { ...prev };
        delete next[cacheKey];
        return next;
      });
      setCountryTaxOverride((prev) => {
        if (!prev) return null;
        const prevStoreId = typeof prev.storeId === 'string' ? prev.storeId : prev.storeId?._id ?? '';
        const prevCountryId = typeof prev.countryId === 'string' ? prev.countryId : prev.countryId?._id ?? '';
        return prevStoreId === storeId && prevCountryId === countryId ? null : prev;
      });
    } else {
      setCountryTaxOverride(null);
      setCountryTaxOverrideMap({});
    }
    setError(null);
    setLoading(false);
  }, []);

  const value: CountryTaxOverrideContextType = {
    countryTaxOverride,
    countryTaxOverrideMap,
    loading,
    error,
    createCountryTaxOverride,
    getCountryTaxOverrideByStoreAndCountry,
    updateCountryTaxOverrideByStoreAndCountry,
    deleteCountryTaxOverrideByStoreAndCountry,
    clearCountryTaxOverride,
  };

  return <CountryTaxOverrideContext.Provider value={value}>{children}</CountryTaxOverrideContext.Provider>;
};

export const useCountryTaxOverride = (): CountryTaxOverrideContextType => {
  const ctx = useContext(CountryTaxOverrideContext);
  if (!ctx) throw new Error('useCountryTaxOverride must be used within a CountryTaxOverrideProvider');
  return ctx;
};

export default CountryTaxOverrideContext;

