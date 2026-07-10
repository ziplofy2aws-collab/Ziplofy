import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreShippingPolicy {
  _id: string;
  storeId: string;
  shippingPolicy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateShippingPolicyPayload {
  storeId: string;
  shippingPolicy: string;
}

export interface UpdateShippingPolicyPayload {
  shippingPolicy?: string;
}

interface StoreShippingPolicyContextType {
  policy: StoreShippingPolicy | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreShippingPolicy | null>;
  createPolicy: (payload: CreateShippingPolicyPayload) => Promise<StoreShippingPolicy>;
  updatePolicy: (id: string, payload: UpdateShippingPolicyPayload) => Promise<StoreShippingPolicy>;
}

const StoreShippingPolicyContext = createContext<StoreShippingPolicyContextType | undefined>(undefined);

export const StoreShippingPolicyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policy, setPolicy] = useState<StoreShippingPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreShippingPolicy | null>>(`/store-shipping-policy/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch shipping policy');
      setPolicy(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch shipping policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (payload: CreateShippingPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreShippingPolicy>>('/store-shipping-policy', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create shipping policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create shipping policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (id: string, payload: UpdateShippingPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreShippingPolicy>>(`/store-shipping-policy/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update shipping policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update shipping policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: StoreShippingPolicyContextType = {
    policy,
    loading,
    error,
    getByStoreId,
    createPolicy,
    updatePolicy,
  };

  return (
    <StoreShippingPolicyContext.Provider value={value}>{children}</StoreShippingPolicyContext.Provider>
  );
};

export const useStoreShippingPolicy = (): StoreShippingPolicyContextType => {
  const ctx = useContext(StoreShippingPolicyContext);
  if (!ctx) throw new Error('useStoreShippingPolicy must be used within a StoreShippingPolicyProvider');
  return ctx;
};

export default StoreShippingPolicyContext;


