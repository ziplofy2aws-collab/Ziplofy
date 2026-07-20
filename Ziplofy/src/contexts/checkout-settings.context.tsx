import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type CheckoutContactMethod = 'phone_or_email' | 'email';
export type CheckoutEmailRegionMode = 'codiic_recommended' | 'custom';

export function normalizeCheckoutEmailRegionMode(
  mode?: string | null
): CheckoutEmailRegionMode {
  if (mode === 'custom') return 'custom';
  return 'codiic_recommended';
}
export type CheckoutFullNameOption = 'last_name' | 'first_last';
export type CheckoutFieldRequirementOption = 'dont_include' | 'optional' | 'required';

export interface CheckoutCustomerInformation {
  fullNameOption: CheckoutFullNameOption;
  companyNameOption: CheckoutFieldRequirementOption;
  addressLine2Option: CheckoutFieldRequirementOption;
  shippingPhoneOption: CheckoutFieldRequirementOption;
}

export const DEFAULT_CHECKOUT_CUSTOMER_INFORMATION: CheckoutCustomerInformation = {
  fullNameOption: 'last_name',
  companyNameOption: 'dont_include',
  addressLine2Option: 'optional',
  shippingPhoneOption: 'dont_include',
};

export interface CheckoutSettings {
  _id: string;
  storeId: string;
  contactMethod: CheckoutContactMethod;
  orderTracking: {
    enabled: boolean;
  };
  requireSignIn: boolean;
  marketing: {
    email: {
      enabled: boolean;
      regionMode: CheckoutEmailRegionMode;
    };
    sms: {
      enabled: boolean;
    };
  };
  tipping: {
    enabled: boolean;
    presets: number[];
    hideUntilSelected: boolean;
  };
  checkoutLanguage: string;
  addressCollection: {
    useShippingAsBilling: boolean;
  };
  addToCartLimit: {
    enabled: boolean;
    limit: number | null;
    useRecommended: boolean;
  };
  customerInformation: CheckoutCustomerInformation;
  emailSelectedRegionIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface CheckoutSettingsContextValue {
  settings: CheckoutSettings | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<CheckoutSettings>;
  update: (settingsId: string, payload: Partial<CheckoutSettings> & { emailSelectedRegionIds?: string[] }) => Promise<CheckoutSettings>;
}

const CheckoutSettingsContext = createContext<CheckoutSettingsContextValue | undefined>(undefined);

export const CheckoutSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByStoreId = useCallback(
    async (storeId: string) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosi.get(`/checkout-settings/store/${storeId}`);
        const fetched: CheckoutSettings = data.data;
        setSettings(fetched);
        return fetched;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load checkout settings';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const update = useCallback(
    async (
      settingsId: string,
      payload: Partial<CheckoutSettings> & { emailSelectedRegionIds?: string[] }
    ) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosi.put(`/checkout-settings/${settingsId}`, payload);
        const updated: CheckoutSettings = data.data;
        setSettings(updated);
        return updated;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to update checkout settings';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value: CheckoutSettingsContextValue = {
    settings,
    loading,
    error,
    fetchByStoreId,
    update,
  };

  return <CheckoutSettingsContext.Provider value={value}>{children}</CheckoutSettingsContext.Provider>;
};

export const useCheckoutSettings = (): CheckoutSettingsContextValue => {
  const ctx = useContext(CheckoutSettingsContext);
  if (!ctx) throw new Error('useCheckoutSettings must be used within CheckoutSettingsProvider');
  return ctx;
};
