import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreTermsPolicy {
  _id: string;
  storeId: string;
  termsPolicy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateTermsPolicyPayload {
  storeId: string;
  termsPolicy: string;
}

export interface UpdateTermsPolicyPayload {
  termsPolicy?: string;
}

interface StoreTermsPolicyContextType {
  policy: StoreTermsPolicy | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreTermsPolicy | null>;
  createPolicy: (payload: CreateTermsPolicyPayload) => Promise<StoreTermsPolicy>;
  updatePolicy: (id: string, payload: UpdateTermsPolicyPayload) => Promise<StoreTermsPolicy>;
}

const StoreTermsPolicyContext = createContext<StoreTermsPolicyContextType | undefined>(undefined);

export const StoreTermsPolicyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policy, setPolicy] = useState<StoreTermsPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreTermsPolicy | null>>(`/store-terms-policy/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch terms policy');
      setPolicy(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch terms policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (payload: CreateTermsPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreTermsPolicy>>('/store-terms-policy', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create terms policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create terms policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (id: string, payload: UpdateTermsPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreTermsPolicy>>(`/store-terms-policy/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update terms policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update terms policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: StoreTermsPolicyContextType = {
    policy,
    loading,
    error,
    getByStoreId,
    createPolicy,
    updatePolicy,
  };

  return (
    <StoreTermsPolicyContext.Provider value={value}>{children}</StoreTermsPolicyContext.Provider>
  );
};

export const useStoreTermsPolicy = (): StoreTermsPolicyContextType => {
  const ctx = useContext(StoreTermsPolicyContext);
  if (!ctx) throw new Error('useStoreTermsPolicy must be used within a StoreTermsPolicyProvider');
  return ctx;
};

export default StoreTermsPolicyContext;


