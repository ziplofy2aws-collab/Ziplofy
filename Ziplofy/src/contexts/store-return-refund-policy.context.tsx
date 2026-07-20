import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreReturnRefundPolicy {
  _id: string;
  storeId: string;
  returnRefundPolicy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateReturnRefundPolicyPayload {
  storeId: string;
  returnRefundPolicy: string;
}

export interface UpdateReturnRefundPolicyPayload {
  returnRefundPolicy?: string;
}

interface StoreReturnRefundPolicyContextType {
  policy: StoreReturnRefundPolicy | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreReturnRefundPolicy | null>;
  createPolicy: (payload: CreateReturnRefundPolicyPayload) => Promise<StoreReturnRefundPolicy>;
  updatePolicy: (id: string, payload: UpdateReturnRefundPolicyPayload) => Promise<StoreReturnRefundPolicy>;
}

const StoreReturnRefundPolicyContext = createContext<StoreReturnRefundPolicyContextType | undefined>(undefined);

export const StoreReturnRefundPolicyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policy, setPolicy] = useState<StoreReturnRefundPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreReturnRefundPolicy | null>>(`/store-return-refund-policy/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch return/refund policy');
      setPolicy(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch return/refund policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (payload: CreateReturnRefundPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreReturnRefundPolicy>>('/store-return-refund-policy', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create return/refund policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create return/refund policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (id: string, payload: UpdateReturnRefundPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreReturnRefundPolicy>>(`/store-return-refund-policy/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update return/refund policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update return/refund policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: StoreReturnRefundPolicyContextType = {
    policy,
    loading,
    error,
    getByStoreId,
    createPolicy,
    updatePolicy,
  };

  return (
    <StoreReturnRefundPolicyContext.Provider value={value}>{children}</StoreReturnRefundPolicyContext.Provider>
  );
};

export const useStoreReturnRefundPolicy = (): StoreReturnRefundPolicyContextType => {
  const ctx = useContext(StoreReturnRefundPolicyContext);
  if (!ctx) throw new Error('useStoreReturnRefundPolicy must be used within a StoreReturnRefundPolicyProvider');
  return ctx;
};

export default StoreReturnRefundPolicyContext;


