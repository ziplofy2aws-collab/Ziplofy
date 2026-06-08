import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
}

export interface ShippingProfileLocationSetting {
  _id: string;
  shippingProfileId: string;
  locationId: string;
  location?: any;
  createNewRates: boolean;
  removeRates: boolean;
  storeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateShippingProfileLocationSettingPayload {
  createNewRates: boolean;
  removeRates: boolean;
}

interface ShippingProfileLocationSettingsContextValue {
  settingsByProfileId: Record<string, ShippingProfileLocationSetting[]>;
  loading: boolean;
  error: string | null;
  fetchByProfileId: (profileId: string) => Promise<ShippingProfileLocationSetting[]>;
  updateLocationSetting: (
    profileId: string,
    locationId: string,
    payload: UpdateShippingProfileLocationSettingPayload
  ) => Promise<ShippingProfileLocationSetting>;
  clear: () => void;
}

const ShippingProfileLocationSettingsContext = createContext<ShippingProfileLocationSettingsContextValue | undefined>(
  undefined
);

export const ShippingProfileLocationSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settingsByProfileId, setSettingsByProfileId] = useState<Record<string, ShippingProfileLocationSetting[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByProfileId = useCallback(
    async (profileId: string): Promise<ShippingProfileLocationSetting[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosi.get<ApiResponse<ShippingProfileLocationSetting[]>>(
          `/shipping-profile-location-settings/${profileId}`
        );
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch location settings');
        }
        const data = response.data.data || [];
        setSettingsByProfileId((prev) => ({
          ...prev,
          [profileId]: data,
        }));
        return data;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch location settings';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateLocationSetting = useCallback(
    async (
      profileId: string,
      locationId: string,
      payload: UpdateShippingProfileLocationSettingPayload
    ): Promise<ShippingProfileLocationSetting> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosi.put<ApiResponse<ShippingProfileLocationSetting>>(
          `/shipping-profile-location-settings/${profileId}/location/${locationId}`,
          payload
        );
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update location setting');
        }
        const updatedSetting = response.data.data;
        setSettingsByProfileId((prev) => {
          const current = prev[profileId] || [];
          const next = current.map((setting) =>
            setting._id === updatedSetting._id ? { ...setting, ...updatedSetting } : setting
          );
          return {
            ...prev,
            [profileId]: next,
          };
        });
        return updatedSetting;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to update location setting';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setSettingsByProfileId({});
    setError(null);
  }, []);

  const value = useMemo<ShippingProfileLocationSettingsContextValue>(
    () => ({
      settingsByProfileId,
      loading,
      error,
      fetchByProfileId,
      updateLocationSetting,
      clear,
    }),
    [settingsByProfileId, loading, error, fetchByProfileId, updateLocationSetting, clear]
  );

  return (
    <ShippingProfileLocationSettingsContext.Provider value={value}>
      {children}
    </ShippingProfileLocationSettingsContext.Provider>
  );
};

export const useShippingProfileLocationSettings = (): ShippingProfileLocationSettingsContextValue => {
  const context = useContext(ShippingProfileLocationSettingsContext);
  if (context === undefined) {
    throw new Error('useShippingProfileLocationSettings must be used within a ShippingProfileLocationSettingsProvider');
  }
  return context;
};

