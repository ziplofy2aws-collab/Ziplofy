import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreContactInfo {
  _id: string;
  storeId: string;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateContactInfoPayload {
  storeId: string;
  contactInfo: string;
}

export interface UpdateContactInfoPayload {
  contactInfo?: string;
}

interface StoreContactInfoContextType {
  info: StoreContactInfo | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreContactInfo | null>;
  createInfo: (payload: CreateContactInfoPayload) => Promise<StoreContactInfo>;
  updateInfo: (id: string, payload: UpdateContactInfoPayload) => Promise<StoreContactInfo>;
}

const StoreContactInfoContext = createContext<StoreContactInfoContextType | undefined>(undefined);

export const StoreContactInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [info, setInfo] = useState<StoreContactInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreContactInfo | null>>(`/store-contact-info/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch contact info');
      setInfo(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch contact info';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createInfo = useCallback(async (payload: CreateContactInfoPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreContactInfo>>('/store-contact-info', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create contact info');
      setInfo(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create contact info';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInfo = useCallback(async (id: string, payload: UpdateContactInfoPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreContactInfo>>(`/store-contact-info/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update contact info');
      setInfo(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update contact info';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: StoreContactInfoContextType = {
    info,
    loading,
    error,
    getByStoreId,
    createInfo,
    updateInfo,
  };

  return (
    <StoreContactInfoContext.Provider value={value}>{children}</StoreContactInfoContext.Provider>
  );
};

export const useStoreContactInfo = (): StoreContactInfoContextType => {
  const ctx = useContext(StoreContactInfoContext);
  if (!ctx) throw new Error('useStoreContactInfo must be used within a StoreContactInfoProvider');
  return ctx;
};

export default StoreContactInfoContext;


