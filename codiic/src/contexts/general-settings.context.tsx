import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface GeneralSettings {
  _id: string;
  storeId: string;
  backupRegion: string;
  unitSystem: 'metric' | 'imperial';
  weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  timeZone: string;
  orderIdPrefix: string;
  orderIdSuffix: string;
  fulfillmentOption: 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill';
  notifyCustomers: boolean;
  fulfillHighRiskOrders: boolean;
  autoArchive: boolean;
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  legalBusinessName?: string;
  billingCountry?: string;
  billingAddress?: string;
  billingApartment?: string;
  billingCity?: string;
  billingState?: string;
  billingPinCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface UpdateGeneralSettingsPayload {
  backupRegion?: string;
  unitSystem?: 'metric' | 'imperial';
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  timeZone?: string;
  orderIdPrefix?: string;
  orderIdSuffix?: string;
  fulfillmentOption?: 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill';
  notifyCustomers?: boolean;
  fulfillHighRiskOrders?: boolean;
  autoArchive?: boolean;
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  legalBusinessName?: string;
  billingCountry?: string;
  billingAddress?: string;
  billingApartment?: string;
  billingCity?: string;
  billingState?: string;
  billingPinCode?: string;
  storeId: string;
}

interface GeneralSettingsContextType {
  settings: GeneralSettings | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<GeneralSettings | null>;
  update: (id: string, payload: UpdateGeneralSettingsPayload) => Promise<GeneralSettings>;
  clear: () => void;
  clearError: () => void;
}

const GeneralSettingsContext = createContext<GeneralSettingsContextType | undefined>(undefined);

export const GeneralSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<GeneralSettings | null>>(`/general-settings/store/${storeId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch general settings');
      setSettings(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch general settings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateGeneralSettingsPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<GeneralSettings>>(`/general-settings/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update general settings');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update general settings';
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

  const value: GeneralSettingsContextType = {
    settings,
    loading,
    error,
    getByStoreId,
    update,
    clear,
    clearError,
  };

  return (
    <GeneralSettingsContext.Provider value={value}>{children}</GeneralSettingsContext.Provider>
  );
};

export const useGeneralSettings = (): GeneralSettingsContextType => {
  const ctx = useContext(GeneralSettingsContext);
  if (!ctx) throw new Error('useGeneralSettings must be used within a GeneralSettingsProvider');
  return ctx;
};

export default GeneralSettingsContext;


