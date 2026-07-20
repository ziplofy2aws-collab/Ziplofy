import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface NotificationCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface NotificationCategoriesContextType {
  categories: NotificationCategory[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<NotificationCategory[]>;
  clear: () => void;
  clearError: () => void;
}

const NotificationCategoriesContext = createContext<NotificationCategoriesContextType | undefined>(undefined);

export const NotificationCategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<NotificationCategory[]>>('/notification-categories');
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch notification categories');
      setCategories(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch notification categories';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setCategories([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: NotificationCategoriesContextType = {
    categories,
    loading,
    error,
    fetchAll,
    clear,
    clearError,
  };

  return (
    <NotificationCategoriesContext.Provider value={value}>
      {children}
    </NotificationCategoriesContext.Provider>
  );
};

export const useNotificationCategories = (): NotificationCategoriesContextType => {
  const ctx = useContext(NotificationCategoriesContext);
  if (!ctx) throw new Error('useNotificationCategories must be used within a NotificationCategoriesProvider');
  return ctx;
};

export default NotificationCategoriesContext;


