import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Shipping Override interface matching backend model
export interface ShippingOverride {
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
  isActive: boolean;
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

interface CreateShippingOverridePayload {
  storeId: string;
  countryId: string;
  stateId?: string | null;
  taxRate: number;
  isActive?: boolean;
}

interface UpdateShippingOverridePayload {
  taxRate?: number;
  isActive?: boolean;
}

interface ShippingOverrideContextType {
  shippingOverrides: ShippingOverride[];
  loading: boolean;
  error: string | null;
  createShippingOverride: (payload: CreateShippingOverridePayload) => Promise<ShippingOverride>;
  getShippingOverridesByStoreAndCountry: (storeId: string, countryId: string) => Promise<ShippingOverride[]>;
  getShippingOverrideById: (id: string) => Promise<ShippingOverride>;
  updateShippingOverride: (id: string, payload: UpdateShippingOverridePayload) => Promise<ShippingOverride>;
  deleteShippingOverride: (id: string) => Promise<void>;
  clearShippingOverrides: () => void;
}

const ShippingOverrideContext = createContext<ShippingOverrideContextType | undefined>(undefined);

export const ShippingOverrideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingOverrides, setShippingOverrides] = useState<ShippingOverride[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new shipping override
  const createShippingOverride = useCallback(async (payload: CreateShippingOverridePayload): Promise<ShippingOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<ShippingOverride>>('/shipping-overrides', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create shipping override');
      setShippingOverrides((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create shipping override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shipping overrides by store ID and country ID
  const getShippingOverridesByStoreAndCountry = useCallback(async (
    storeId: string,
    countryId: string
  ): Promise<ShippingOverride[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ShippingOverride[]>>(
        `/shipping-overrides/store/${storeId}/country/${countryId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch shipping overrides');
      setShippingOverrides(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch shipping overrides';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shipping override by ID
  const getShippingOverrideById = useCallback(async (id: string): Promise<ShippingOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ShippingOverride>>(`/shipping-overrides/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch shipping override');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch shipping override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a shipping override
  const updateShippingOverride = useCallback(async (
    id: string,
    payload: UpdateShippingOverridePayload
  ): Promise<ShippingOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<ShippingOverride>>(`/shipping-overrides/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update shipping override');
      setShippingOverrides((prev) => prev.map((override) => (override._id === id ? data : override)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update shipping override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a shipping override
  const deleteShippingOverride = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{}>>(`/shipping-overrides/${id}`);
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete shipping override');
      setShippingOverrides((prev) => prev.filter((override) => override._id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete shipping override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear shipping overrides
  const clearShippingOverrides = useCallback(() => {
    setShippingOverrides([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: ShippingOverrideContextType = {
    shippingOverrides,
    loading,
    error,
    createShippingOverride,
    getShippingOverridesByStoreAndCountry,
    getShippingOverrideById,
    updateShippingOverride,
    deleteShippingOverride,
    clearShippingOverrides,
  };

  return <ShippingOverrideContext.Provider value={value}>{children}</ShippingOverrideContext.Provider>;
};

export const useShippingOverrides = (): ShippingOverrideContextType => {
  const ctx = useContext(ShippingOverrideContext);
  if (!ctx) throw new Error('useShippingOverrides must be used within a ShippingOverrideProvider');
  return ctx;
};

export default ShippingOverrideContext;

