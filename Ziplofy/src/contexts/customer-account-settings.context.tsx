import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Authentication provider interfaces
export interface GoogleAuthProvider {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  authorizedJavaScriptOrigins?: string[];
  authorizedRedirectURIs?: string[];
  deauthorizeCallbackURIs?: string[];
  connectedAt?: string;
  lastUpdatedAt?: string;
}

export interface FacebookAuthProvider {
  enabled: boolean;
  appId?: string;
  appSecret?: string;
  domains?: string[];
  redirectURLs?: string[];
  deauthorizeCallbackURLs?: string[];
  connectedAt?: string;
  lastUpdatedAt?: string;
}

export interface ShopAuthProvider {
  enabled: boolean;
  lastUpdatedAt?: string;
}

// Main customer account settings interface
export interface CustomerAccountSettings {
  _id: string;
  storeId: string;
  showSignInLinks: boolean;
  accountVersion: 'recommended' | 'legacy';
  selfServeReturns: boolean;
  storeCredit: boolean;
  shopAuth: ShopAuthProvider;
  googleAuth: GoogleAuthProvider;
  facebookAuth: FacebookAuthProvider;
  customAccountUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Update payload interface (all fields optional for partial updates)
export interface UpdateCustomerAccountSettingsPayload {
  showSignInLinks?: boolean;
  accountVersion?: 'recommended' | 'legacy';
  selfServeReturns?: boolean;
  storeCredit?: boolean;
  customAccountUrl?: string | null;
  shopAuth?: {
    enabled?: boolean;
  };
  googleAuth?: {
    enabled?: boolean;
    clientId?: string;
    clientSecret?: string;
    authorizedJavaScriptOrigins?: string[];
    authorizedRedirectURIs?: string[];
    deauthorizeCallbackURIs?: string[];
  };
  facebookAuth?: {
    enabled?: boolean;
    appId?: string;
    appSecret?: string;
    domains?: string[];
    redirectURLs?: string[];
    deauthorizeCallbackURLs?: string[];
  };
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    store?: {
      id: string;
      name: string;
    };
  };
};

interface CustomerAccountSettingsContextType {
  settings: CustomerAccountSettings | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<CustomerAccountSettings>;
  update: (settingsId: string, payload: UpdateCustomerAccountSettingsPayload) => Promise<CustomerAccountSettings>;
  clear: () => void;
  clearError: () => void;
}

const CustomerAccountSettingsContext = createContext<CustomerAccountSettingsContextType | undefined>(undefined);

export const CustomerAccountSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CustomerAccountSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<CustomerAccountSettings>>(
        `/customer-account-settings/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch customer account settings');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch customer account settings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (settingsId: string, payload: UpdateCustomerAccountSettingsPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<CustomerAccountSettings>>(
        `/customer-account-settings/${settingsId}`,
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update customer account settings');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update customer account settings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSettings(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<CustomerAccountSettingsContextType>(
    () => ({
      settings,
      loading,
      error,
      fetchByStoreId,
      update,
      clear,
      clearError,
    }),
    [settings, loading, error, fetchByStoreId, update, clear, clearError]
  );

  return (
    <CustomerAccountSettingsContext.Provider value={value}>{children}</CustomerAccountSettingsContext.Provider>
  );
};

export const useCustomerAccountSettings = (): CustomerAccountSettingsContextType => {
  const ctx = useContext(CustomerAccountSettingsContext);
  if (!ctx) throw new Error('useCustomerAccountSettings must be used within a CustomerAccountSettingsProvider');
  return ctx;
};

export default CustomerAccountSettingsContext;

