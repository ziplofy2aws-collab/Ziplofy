import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface ShippingZoneShippingProfileRef {
  _id: string;
  profileName: string;
}

export interface ShippingZoneCountry {
  countryId: string;
  countryName: string;
  countryIso2: string;
  countryFlag: string;
  selectedStatesCount: number;
  totalStatesCount: number;
  stateIds: string[];
}

export interface ShippingZone {
  _id: string;
  zoneName: string;
  shippingProfileId: string | ShippingZoneShippingProfileRef;
  countries?: ShippingZoneCountry[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total?: number;
    shippingProfile?: {
      id: string;
      name: string;
    };
    countriesCount?: number;
    statesCount?: number;
  };
}

export interface CreateShippingZoneCountryEntry {
  countryId: string;
  stateIds?: string[];
}

export interface CreateShippingZonePayload {
  zoneName: string;
  shippingProfileId: string;
  countries: CreateShippingZoneCountryEntry[];
}

export interface UpdateShippingZonePayload {
  zoneName?: string;
  countries?: CreateShippingZoneCountryEntry[];
}

interface ShippingZoneContextValue {
  shippingZones: ShippingZone[];
  loading: boolean;
  error: string | null;
  total: number;
  createShippingZone: (payload: CreateShippingZonePayload) => Promise<ShippingZone>;
  getShippingZonesByShippingProfileId: (shippingProfileId: string) => Promise<ShippingZone[]>;
  updateShippingZone: (id: string, payload: UpdateShippingZonePayload) => Promise<ShippingZone>;
  deleteShippingZone: (id: string) => Promise<void>;
  clearShippingZones: () => void;
}

const ShippingZoneContext = createContext<ShippingZoneContextValue | undefined>(undefined);

export const ShippingZoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createShippingZone = useCallback(async (payload: CreateShippingZonePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<ShippingZone>>('/shipping-zones', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create shipping zone');
      setShippingZones((prev) => [data, ...prev]);
      setTotal((prev) => prev + 1);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create shipping zone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getShippingZonesByShippingProfileId = useCallback(async (shippingProfileId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ShippingZone[]>>(`/shipping-zones/profile/${shippingProfileId}`);
      const { success, data, message, meta } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch shipping zones');
      const items = data || [];
      setShippingZones(items);
      if (meta?.total != null) {
        setTotal(meta.total);
      } else {
        setTotal(items.length);
      }
      return items;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch shipping zones';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShippingZone = useCallback(async (id: string, payload: UpdateShippingZonePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<ShippingZone>>(`/shipping-zones/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update shipping zone');
      setShippingZones((prev) => prev.map((zone) => (zone._id === id ? data : zone)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update shipping zone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteShippingZone = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ _id: string }>>(`/shipping-zones/${id}`);
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete shipping zone');
      setShippingZones((prev) => prev.filter((zone) => zone._id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete shipping zone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearShippingZones = useCallback(() => {
    setShippingZones([]);
    setTotal(0);
  }, []);

  const value = useMemo<ShippingZoneContextValue>(
    () => ({
      shippingZones,
      loading,
      error,
      total,
      createShippingZone,
      getShippingZonesByShippingProfileId,
      updateShippingZone,
      deleteShippingZone,
      clearShippingZones,
    }),
    [
      shippingZones,
      loading,
      error,
      total,
      createShippingZone,
      getShippingZonesByShippingProfileId,
      updateShippingZone,
      deleteShippingZone,
      clearShippingZones,
    ]
  );

  return <ShippingZoneContext.Provider value={value}>{children}</ShippingZoneContext.Provider>;
};

export const useShippingZones = (): ShippingZoneContextValue => {
  const ctx = useContext(ShippingZoneContext);
  if (!ctx) throw new Error('useShippingZones must be used within a ShippingZoneProvider');
  return ctx;
};

export default ShippingZoneContext;

