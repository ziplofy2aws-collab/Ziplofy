import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface OnlineStorePreferences {
  _id: string;
  storeId: string;
  passwordProtectionEnabled: boolean;
  hasStorefrontPassword: boolean;
  messageToYourVisitors?: string;
  b2bCustomersOnly: boolean;
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;
  countryRedirectionEnabled: boolean;
  languageRedirectionEnabled: boolean;
  spamContactFormsEnabled: boolean;
  spamAuthPagesEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface UpdateOnlineStorePreferencesPayload {
  passwordProtectionEnabled?: boolean;
  storefrontPassword?: string;
  messageToYourVisitors?: string;
  b2bCustomersOnly?: boolean;
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;
  countryRedirectionEnabled?: boolean;
  languageRedirectionEnabled?: boolean;
  spamContactFormsEnabled?: boolean;
  spamAuthPagesEnabled?: boolean;
}

interface OnlineStorePreferencesContextType {
  preferences: OnlineStorePreferences | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<OnlineStorePreferences | null>;
  update: (id: string, payload: UpdateOnlineStorePreferencesPayload) => Promise<OnlineStorePreferences>;
  clear: () => void;
  clearError: () => void;
}

const OnlineStorePreferencesContext = createContext<OnlineStorePreferencesContextType | undefined>(
  undefined
);

export const OnlineStorePreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<OnlineStorePreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<OnlineStorePreferences>>(
        `/online-store-preferences/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch online store preferences');
      setPreferences(data);
      return data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to fetch online store preferences';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateOnlineStorePreferencesPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<OnlineStorePreferences>>(
        `/online-store-preferences/${id}`,
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update online store preferences');
      setPreferences(data);
      return data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to update online store preferences';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPreferences(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: OnlineStorePreferencesContextType = {
    preferences,
    loading,
    error,
    getByStoreId,
    update,
    clear,
    clearError,
  };

  return (
    <OnlineStorePreferencesContext.Provider value={value}>
      {children}
    </OnlineStorePreferencesContext.Provider>
  );
};

export const useOnlineStorePreferences = (): OnlineStorePreferencesContextType => {
  const ctx = useContext(OnlineStorePreferencesContext);
  if (!ctx) {
    throw new Error('useOnlineStorePreferences must be used within an OnlineStorePreferencesProvider');
  }
  return ctx;
};

export default OnlineStorePreferencesContext;
