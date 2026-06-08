import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Store Notification Email interface matching backend model
export interface StoreNotificationEmail {
  _id: string;
  storeId: string | {
    _id: string;
    storeName: string;
  };
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CreateStoreNotificationEmailPayload {
  storeId: string;
  email: string;
  isVerified?: boolean;
}

interface UpdateStoreNotificationEmailPayload {
  email?: string;
  isVerified?: boolean;
}

interface StoreNotificationEmailContextType {
  storeNotificationEmail: StoreNotificationEmail | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreNotificationEmail | null>;
  create: (payload: CreateStoreNotificationEmailPayload) => Promise<StoreNotificationEmail>;
  update: (id: string, payload: UpdateStoreNotificationEmailPayload) => Promise<StoreNotificationEmail>;
  clear: () => void;
  clearError: () => void;
}

const StoreNotificationEmailContext = createContext<StoreNotificationEmailContextType | undefined>(undefined);

export const StoreNotificationEmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeNotificationEmail, setStoreNotificationEmail] = useState<StoreNotificationEmail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreNotificationEmail | null>>(
        `/store-notification-email/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch store notification email');
      setStoreNotificationEmail(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch store notification email';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateStoreNotificationEmailPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreNotificationEmail>>(
        '/store-notification-email',
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create store notification email');
      setStoreNotificationEmail(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create store notification email';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateStoreNotificationEmailPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<StoreNotificationEmail>>(
        `/store-notification-email/${id}`,
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update store notification email');
      setStoreNotificationEmail(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update store notification email';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setStoreNotificationEmail(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StoreNotificationEmailContextType = {
    storeNotificationEmail,
    loading,
    error,
    getByStoreId,
    create,
    update,
    clear,
    clearError,
  };

  return (
    <StoreNotificationEmailContext.Provider value={value}>
      {children}
    </StoreNotificationEmailContext.Provider>
  );
};

export const useStoreNotificationEmail = (): StoreNotificationEmailContextType => {
  const ctx = useContext(StoreNotificationEmailContext);
  if (!ctx) throw new Error('useStoreNotificationEmail must be used within a StoreNotificationEmailProvider');
  return ctx;
};

export default StoreNotificationEmailContext;

