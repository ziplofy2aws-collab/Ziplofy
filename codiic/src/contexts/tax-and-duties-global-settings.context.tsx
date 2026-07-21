import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Tax and Duties Global Settings interface matching backend model
export interface TaxAndDutiesGlobalSettings {
  _id: string;
  storeId: string | {
    _id: string;
    storeName: string;
  };
  includeSalesTaxInProductPriceAndShippingRate: boolean;
  chargeSalesTaxOnShipping: boolean;
  chargeVATOnDigitalGoods: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface UpdateTaxAndDutiesGlobalSettingsPayload {
  includeSalesTaxInProductPriceAndShippingRate?: boolean;
  chargeSalesTaxOnShipping?: boolean;
  chargeVATOnDigitalGoods?: boolean;
}

interface TaxAndDutiesGlobalSettingsContextType {
  settings: TaxAndDutiesGlobalSettings | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<TaxAndDutiesGlobalSettings | null>;
  update: (id: string, payload: UpdateTaxAndDutiesGlobalSettingsPayload) => Promise<TaxAndDutiesGlobalSettings>;
  clear: () => void;
  clearError: () => void;
}

const TaxAndDutiesGlobalSettingsContext = createContext<TaxAndDutiesGlobalSettingsContextType | undefined>(undefined);

export const TaxAndDutiesGlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TaxAndDutiesGlobalSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<TaxAndDutiesGlobalSettings | null>>(
        `/tax-and-duties-global-settings/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch tax and duties global settings');
      setSettings(data || null);
      return data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tax and duties global settings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdateTaxAndDutiesGlobalSettingsPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<TaxAndDutiesGlobalSettings>>(
        `/tax-and-duties-global-settings/${id}`,
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update tax and duties global settings');
      setSettings(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update tax and duties global settings';
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

  const value: TaxAndDutiesGlobalSettingsContextType = {
    settings,
    loading,
    error,
    getByStoreId,
    update,
    clear,
    clearError,
  };

  return (
    <TaxAndDutiesGlobalSettingsContext.Provider value={value}>
      {children}
    </TaxAndDutiesGlobalSettingsContext.Provider>
  );
};

export const useTaxAndDutiesGlobalSettings = (): TaxAndDutiesGlobalSettingsContextType => {
  const ctx = useContext(TaxAndDutiesGlobalSettingsContext);
  if (!ctx) throw new Error('useTaxAndDutiesGlobalSettings must be used within a TaxAndDutiesGlobalSettingsProvider');
  return ctx;
};

export default TaxAndDutiesGlobalSettingsContext;

