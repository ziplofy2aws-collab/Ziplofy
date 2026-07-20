import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type ReturnShippingCost =
  | 'customer provides return shipping'
  | 'free return shipping'
  | 'flat rate return shipping';

export interface ReturnRules {
  _id: string;
  storeId: string;
  enabled: boolean;
  returnWindow: string;
  returnShippingCost: ReturnShippingCost;
  flatRate?: number;
  chargeRestockingFree: boolean;
  restockingFee?: number;
  finalSaleSelection: 'collections' | 'products';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateReturnRulesPayload {
  storeId: string;
  enabled?: boolean;
  returnWindow: string;
  returnShippingCost: ReturnShippingCost;
  flatRate?: number;
  chargeRestockingFree?: boolean;
  restockingFee?: number;
  finalSaleSelection?: 'collections' | 'products';
}

export interface UpdateReturnRulesPayload {
  enabled?: boolean;
  returnWindow?: string;
  returnShippingCost?: ReturnShippingCost;
  flatRate?: number;
  chargeRestockingFree?: boolean;
  restockingFee?: number;
  finalSaleSelection?: 'collections' | 'products';
}

interface ReturnRulesContextType {
  rules: ReturnRules | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<ReturnRules | null>;
  createRules: (payload: CreateReturnRulesPayload) => Promise<ReturnRules>;
  updateRules: (id: string, payload: UpdateReturnRulesPayload) => Promise<ReturnRules>;
}

const ReturnRulesContext = createContext<ReturnRulesContextType | undefined>(undefined);

export const ReturnRulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<ReturnRules | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ReturnRules | null>>(`/return-rules/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch return rules');
      setRules(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch return rules';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRules = useCallback(async (payload: CreateReturnRulesPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<ReturnRules>>('/return-rules', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create return rules');
      setRules(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create return rules';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRules = useCallback(async (id: string, payload: UpdateReturnRulesPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<ReturnRules>>(`/return-rules/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update return rules');
      setRules(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update return rules';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: ReturnRulesContextType = {
    rules,
    loading,
    error,
    getByStoreId,
    createRules,
    updateRules,
  };

  return (
    <ReturnRulesContext.Provider value={value}>{children}</ReturnRulesContext.Provider>
  );
};

export const useReturnRules = (): ReturnRulesContextType => {
  const ctx = useContext(ReturnRulesContext);
  if (!ctx) throw new Error('useReturnRules must be used within a ReturnRulesProvider');
  return ctx;
};

export default ReturnRulesContext;


