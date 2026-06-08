import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StorePrivacyPolicy {
  _id: string;
  storeId: string;
  privacyPolicy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreatePrivacyPolicyPayload {
  storeId: string;
  privacyPolicy: string;
}

export interface UpdatePrivacyPolicyPayload {
  privacyPolicy?: string;
}

interface StorePrivacyPolicyContextType {
  policy: StorePrivacyPolicy | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StorePrivacyPolicy | null>;
  createPolicy: (payload: CreatePrivacyPolicyPayload) => Promise<StorePrivacyPolicy>;
  updatePolicy: (id: string, payload: UpdatePrivacyPolicyPayload) => Promise<StorePrivacyPolicy>;
}

const StorePrivacyPolicyContext = createContext<StorePrivacyPolicyContextType | undefined>(undefined);

export const StorePrivacyPolicyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policy, setPolicy] = useState<StorePrivacyPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StorePrivacyPolicy | null>>(`/store-privacy-policy/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch privacy policy');
      setPolicy(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch privacy policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (payload: CreatePrivacyPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StorePrivacyPolicy>>('/store-privacy-policy', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create privacy policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create privacy policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (id: string, payload: UpdatePrivacyPolicyPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StorePrivacyPolicy>>(`/store-privacy-policy/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update privacy policy');
      setPolicy(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update privacy policy';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: StorePrivacyPolicyContextType = {
    policy,
    loading,
    error,
    getByStoreId,
    createPolicy,
    updatePolicy,
  };

  return (
    <StorePrivacyPolicyContext.Provider value={value}>{children}</StorePrivacyPolicyContext.Provider>
  );
};

export const useStorePrivacyPolicy = (): StorePrivacyPolicyContextType => {
  const ctx = useContext(StorePrivacyPolicyContext);
  if (!ctx) throw new Error('useStorePrivacyPolicy must be used within a StorePrivacyPolicyProvider');
  return ctx;
};

export default StorePrivacyPolicyContext;
