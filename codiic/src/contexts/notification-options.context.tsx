import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface NotificationOption {
  _id: string;
  notificationCategoryId: string;
  optionName: string;
  optionDesc?: string;
  toggle: boolean;
  toggleValue: string;
  emailSupported: boolean;
  smsSupported: boolean;
  segment?: string;
  emailBody?: string;
  emailSubject?: string;
  smsData?: string;
  availableVariables?: string[];
  key: string; // CustomerNotifications enum value as string
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface NotificationOptionsContextType {
  options: NotificationOption[];
  loading: boolean;
  error: string | null;
  fetchByCategoryId: (categoryId: string) => Promise<NotificationOption[]>;
  clear: () => void;
  clearError: () => void;
}

const NotificationOptionsContext = createContext<NotificationOptionsContextType | undefined>(undefined);

export const NotificationOptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<NotificationOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCategoryId = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<NotificationOption[]>>('/notification-options', {
        params: { categoryId },
      });
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch notification options');
      setOptions(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch notification options';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setOptions([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: NotificationOptionsContextType = {
    options,
    loading,
    error,
    fetchByCategoryId,
    clear,
    clearError,
  };

  return (
    <NotificationOptionsContext.Provider value={value}>{children}</NotificationOptionsContext.Provider>
  );
};

export const useNotificationOptions = (): NotificationOptionsContextType => {
  const ctx = useContext(NotificationOptionsContext);
  if (!ctx) throw new Error('useNotificationOptions must be used within a NotificationOptionsProvider');
  return ctx;
};

export default NotificationOptionsContext;

