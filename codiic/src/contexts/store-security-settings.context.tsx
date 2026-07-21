import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type StoreSecuritySettings = {
  _id: string;
  storeId: string;
  requireCode: boolean;
  securityCode: string | null;
  codeGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

interface StoreSecuritySettingsContextType {
  settings: StoreSecuritySettings | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<StoreSecuritySettings>;
  update: (settingsId: string, payload: { requireCode: boolean }) => Promise<StoreSecuritySettings>;
  generateNewCode: (settingsId: string) => Promise<StoreSecuritySettings>;
  clear: () => void;
  clearError: () => void;
}

const StoreSecuritySettingsContext = createContext<StoreSecuritySettingsContextType | undefined>(undefined);

export const StoreSecuritySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSecuritySettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreSecuritySettings>>(`/store-security-settings/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch security settings');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch security settings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (settingsId: string, payload: { requireCode: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<ApiResponse<StoreSecuritySettings>>(`/store-security-settings/${settingsId}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update security settings');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update security settings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNewCode = useCallback(async (settingsId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreSecuritySettings>>(`/store-security-settings/${settingsId}/generateNewCode`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to generate new security code');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to generate new security code';
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

  const value = useMemo<StoreSecuritySettingsContextType>(() => ({
    settings,
    loading,
    error,
    fetchByStoreId,
    update,
    generateNewCode,
    clear,
    clearError,
  }), [settings, loading, error, fetchByStoreId, update, generateNewCode, clear, clearError]);

  return (
    <StoreSecuritySettingsContext.Provider value={value}>
      {children}
    </StoreSecuritySettingsContext.Provider>
  );
};

export const useStoreSecuritySettings = (): StoreSecuritySettingsContextType => {
  const ctx = useContext(StoreSecuritySettingsContext);
  if (!ctx) throw new Error('useStoreSecuritySettings must be used within a StoreSecuritySettingsProvider');
  return ctx;
};

export default StoreSecuritySettingsContext;

