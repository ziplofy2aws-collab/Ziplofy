import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface ShippingZoneRateStoreRef {
  _id: string;
  storeName: string;
}

export interface ShippingZoneRateShippingZoneRef {
  _id: string;
  zoneName: string;
}

export interface ShippingZoneRate {
  _id: string;
  shippingZoneId: string | ShippingZoneRateShippingZoneRef;
  storeId: string | ShippingZoneRateStoreRef;
  rateType: 'flat' | 'carrier';
  shippingRate: string;
  customRateName: string;
  customDeliveryDescription?: string;
  price: number;
  conditionalPricingEnabled: boolean;
  conditionalPricingBasis?: 'weight' | 'price';
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total?: number;
    shippingZone?: {
      id: string;
      name: string;
    };
    store?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateShippingZoneRatePayload {
  shippingZoneId: string;
  rateType?: 'flat' | 'carrier';
  shippingRate?: string;
  customRateName: string;
  customDeliveryDescription?: string;
  price: number | string;
  conditionalPricingEnabled?: boolean;
  conditionalPricingBasis?: 'weight' | 'price';
  minWeight?: number | string;
  maxWeight?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

export interface UpdateShippingZoneRatePayload {
  rateType?: 'flat' | 'carrier';
  shippingRate?: string;
  customRateName?: string;
  customDeliveryDescription?: string;
  price?: number | string;
  conditionalPricingEnabled?: boolean;
  conditionalPricingBasis?: 'weight' | 'price';
  minWeight?: number | string;
  maxWeight?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

interface ShippingZoneRateContextValue {
  shippingZoneRates: ShippingZoneRate[];
  loading: boolean;
  error: string | null;
  total: number;
  createShippingZoneRate: (payload: CreateShippingZoneRatePayload) => Promise<ShippingZoneRate>;
  getShippingZoneRatesByZoneId: (shippingZoneId: string) => Promise<ShippingZoneRate[]>;
  updateShippingZoneRate: (id: string, payload: UpdateShippingZoneRatePayload) => Promise<ShippingZoneRate>;
  deleteShippingZoneRate: (id: string) => Promise<void>;
  clearShippingZoneRates: () => void;
}

const ShippingZoneRateContext = createContext<ShippingZoneRateContextValue | undefined>(undefined);

export const ShippingZoneRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingZoneRates, setShippingZoneRates] = useState<ShippingZoneRate[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createShippingZoneRate = useCallback(async (payload: CreateShippingZoneRatePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<ShippingZoneRate>>('/shipping-zone-rates', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create shipping zone rate');
      setShippingZoneRates((prev) => [data, ...prev]);
      setTotal((prev) => prev + 1);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create shipping zone rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getShippingZoneRatesByZoneId = useCallback(async (shippingZoneId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ShippingZoneRate[]>>(`/shipping-zone-rates/zone/${shippingZoneId}`);
      const { success, data, message, meta } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch shipping zone rates');
      const items = data || [];
      setShippingZoneRates(items);
      if (meta?.total != null) {
        setTotal(meta.total);
      } else {
        setTotal(items.length);
      }
      return items;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch shipping zone rates';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShippingZoneRate = useCallback(async (id: string, payload: UpdateShippingZoneRatePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<ShippingZoneRate>>(`/shipping-zone-rates/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update shipping zone rate');
      setShippingZoneRates((prev) => prev.map((rate) => (rate._id === id ? data : rate)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update shipping zone rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteShippingZoneRate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<ShippingZoneRate>>(`/shipping-zone-rates/${id}`);
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete shipping zone rate');
      setShippingZoneRates((prev) => prev.filter((rate) => rate._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete shipping zone rate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearShippingZoneRates = useCallback(() => {
    setShippingZoneRates([]);
    setTotal(0);
  }, []);

  const value = useMemo<ShippingZoneRateContextValue>(
    () => ({
      shippingZoneRates,
      loading,
      error,
      total,
      createShippingZoneRate,
      getShippingZoneRatesByZoneId,
      updateShippingZoneRate,
      deleteShippingZoneRate,
      clearShippingZoneRates,
    }),
    [
      shippingZoneRates,
      loading,
      error,
      total,
      createShippingZoneRate,
      getShippingZoneRatesByZoneId,
      updateShippingZoneRate,
      deleteShippingZoneRate,
      clearShippingZoneRates,
    ]
  );

  return <ShippingZoneRateContext.Provider value={value}>{children}</ShippingZoneRateContext.Provider>;
};

export const useShippingZoneRates = (): ShippingZoneRateContextValue => {
  const ctx = useContext(ShippingZoneRateContext);
  if (!ctx) throw new Error('useShippingZoneRates must be used within a ShippingZoneRateProvider');
  return ctx;
};

export default ShippingZoneRateContext;

