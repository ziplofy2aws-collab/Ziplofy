import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Types mirrored from backend (Ziplofy3b)
export interface StoreBillingAddress {
  _id: string;
  storeId: string;
  legalBusinessName: string;
  country: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreBillingAddressRequest {
  storeId: string;
  legalBusinessName: string;
  country: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface UpdateStoreBillingAddressRequest {
  legalBusinessName?: string;
  country?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}

export interface ApiResponseList {
  success: boolean;
  message: string;
  data: StoreBillingAddress[];
  count: number;
}

export interface ApiResponseSingle {
  success: boolean;
  message: string;
  data: StoreBillingAddress;
}

// Context shape
interface StoreBillingAddressContextType {
  addresses: StoreBillingAddress[];
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<void>;
  createAddress: (payload: CreateStoreBillingAddressRequest) => Promise<StoreBillingAddress>;
  updateAddress: (id: string, payload: UpdateStoreBillingAddressRequest) => Promise<StoreBillingAddress>;
  deleteAddress: (id: string) => Promise<void>;
  clearError: () => void;
  clear: () => void;
}

const StoreBillingAddressContext = createContext<StoreBillingAddressContextType | undefined>(undefined);

export const StoreBillingAddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<StoreBillingAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByStoreId = useCallback(async (storeId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponseList>(`/store-billing-address/store/${storeId}`);
      setAddresses(res.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch billing addresses';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (payload: CreateStoreBillingAddressRequest): Promise<StoreBillingAddress> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponseSingle>('/store-billing-address', payload);
      const created = res.data.data;
      setAddresses(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create billing address';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAddress = useCallback(async (id: string, payload: UpdateStoreBillingAddressRequest): Promise<StoreBillingAddress> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponseSingle>(`/store-billing-address/${id}`, payload);
      const updated = res.data.data;
      setAddresses(prev => prev.map(a => (a._id === id ? updated : a)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update billing address';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete(`/store-billing-address/${id}`);
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete billing address';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clear = useCallback(() => setAddresses([]), []);

  const value: StoreBillingAddressContextType = {
    addresses,
    loading,
    error,
    fetchByStoreId,
    createAddress,
    updateAddress,
    deleteAddress,
    clearError,
    clear,
  };

  return (
    <StoreBillingAddressContext.Provider value={value}>
      {children}
    </StoreBillingAddressContext.Provider>
  );
};

export const useStoreBillingAddress = (): StoreBillingAddressContextType => {
  const ctx = useContext(StoreBillingAddressContext);
  if (!ctx) throw new Error('useStoreBillingAddress must be used within a StoreBillingAddressProvider');
  return ctx;
};

export default StoreBillingAddressContext;


