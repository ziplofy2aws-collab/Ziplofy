import { useCallback, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type {
  ConnectProviderPayload,
  PaymentProvider,
  PaymentProvidersResponse,
  StorePaymentProvider,
  StorePaymentProvidersResponse,
} from '../types/payment-provider';

export function usePaymentProviders() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [storeProviders, setStoreProviders] = useState<StorePaymentProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async (search = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'all') params.category = category;

      const res = await axiosi.get<PaymentProvidersResponse>('/payment-providers', { params });
      const data = res.data?.data ?? [];
      setProviders(Array.isArray(data) ? data : []);
      return data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load payment providers';
      setError(message);
      setProviders([]);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStoreProviders = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<StorePaymentProvidersResponse>('/payment-providers/store', {
        params: { storeId },
      });
      const data = res.data?.data ?? [];
      setStoreProviders(Array.isArray(data) ? data : []);
      return data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load connected providers';
      setError(message);
      setStoreProviders([]);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectProvider = useCallback(
    async (storeId: string, providerKey: string, payload?: ConnectProviderPayload) => {
      const res = await axiosi.post('/payment-providers/connect', {
        storeId,
        providerKey,
        ...payload,
      });
      return res.data?.data;
    },
    []
  );

  const disconnectProvider = useCallback(async (connectionId: string) => {
    await axiosi.delete(`/payment-providers/store/${connectionId}`);
  }, []);

  return {
    providers,
    storeProviders,
    loading,
    error,
    fetchProviders,
    fetchStoreProviders,
    connectProvider,
    disconnectProvider,
  };
}
