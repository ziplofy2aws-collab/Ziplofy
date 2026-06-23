import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreCheckoutConfiguration {
  _id: string;
  storeId: string;
  checkoutConfig: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateStoreCheckoutConfigurationPayload {
  storeId: string;
  checkoutConfig?: Record<string, unknown>;
}

export interface UpdateStoreCheckoutConfigurationPayload {
  checkoutConfig: Record<string, unknown>;
}

interface StoreCheckoutConfigurationsContextType {
  configuration: StoreCheckoutConfiguration | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<StoreCheckoutConfiguration | null>;
  getById: (id: string) => Promise<StoreCheckoutConfiguration>;
  create: (payload: CreateStoreCheckoutConfigurationPayload) => Promise<StoreCheckoutConfiguration>;
  update: (
    id: string,
    payload: UpdateStoreCheckoutConfigurationPayload
  ) => Promise<StoreCheckoutConfiguration>;
  deleteConfiguration: (id: string) => Promise<void>;
  clear: () => void;
  clearError: () => void;
}

const StoreCheckoutConfigurationsContext = createContext<
  StoreCheckoutConfigurationsContextType | undefined
>(undefined);

export const StoreCheckoutConfigurationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [configuration, setConfiguration] = useState<StoreCheckoutConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreCheckoutConfiguration | null>>(
        `/store-checkout-configurations/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch checkout configuration');
      setConfiguration(data ?? null);
      return data ?? null;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to fetch checkout configuration';
      setError(msg);
      setConfiguration(null);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreCheckoutConfiguration>>(
        `/store-checkout-configurations/${id}`
      );
      const { success, data, message } = res.data;
      if (!success || !data) {
        throw new Error(message || 'Failed to fetch checkout configuration');
      }
      setConfiguration(data);
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to fetch checkout configuration';
      setError(msg);
      setConfiguration(null);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateStoreCheckoutConfigurationPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreCheckoutConfiguration>>(
        '/store-checkout-configurations',
        payload
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create checkout configuration');
      setConfiguration(data);
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to create checkout configuration';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, payload: UpdateStoreCheckoutConfigurationPayload) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.put<ApiResponse<StoreCheckoutConfiguration>>(
          `/store-checkout-configurations/${id}`,
          payload
        );
        const { success, data, message } = res.data;
        if (!success) throw new Error(message || 'Failed to update checkout configuration');
        setConfiguration(data);
        return data;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || err?.message || 'Failed to update checkout configuration';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteConfiguration = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(
        `/store-checkout-configurations/${id}`
      );
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete checkout configuration');
      setConfiguration((prev) => (prev?._id === id ? null : prev));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to delete checkout configuration';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setConfiguration(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StoreCheckoutConfigurationsContextType = {
    configuration,
    loading,
    error,
    getByStoreId,
    getById,
    create,
    update,
    deleteConfiguration,
    clear,
    clearError,
  };

  return (
    <StoreCheckoutConfigurationsContext.Provider value={value}>
      {children}
    </StoreCheckoutConfigurationsContext.Provider>
  );
};

export const useStoreCheckoutConfigurations = (): StoreCheckoutConfigurationsContextType => {
  const ctx = useContext(StoreCheckoutConfigurationsContext);
  if (!ctx) {
    throw new Error(
      'useStoreCheckoutConfigurations must be used within a StoreCheckoutConfigurationsProvider'
    );
  }
  return ctx;
};

export default StoreCheckoutConfigurationsContext;
