import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchCheckoutPolicyByType,
  fetchCheckoutWrittenPolicies,
  peekCheckoutWrittenPolicies,
} from './checkout-policies-cache';

export type CheckoutStorePolicyType = 'return-refund' | 'privacy' | 'terms' | 'shipping' | 'contact';

export interface CheckoutStorePolicyContent {
  content: string;
  updatedAt: string;
}

export interface CheckoutStoreWrittenPolicies {
  returnRefund: CheckoutStorePolicyContent | null;
  privacy: CheckoutStorePolicyContent | null;
  terms: CheckoutStorePolicyContent | null;
  shipping: CheckoutStorePolicyContent | null;
  contact: CheckoutStorePolicyContent | null;
}

const POLICY_KEY: Record<CheckoutStorePolicyType, keyof CheckoutStoreWrittenPolicies> = {
  'return-refund': 'returnRefund',
  privacy: 'privacy',
  terms: 'terms',
  shipping: 'shipping',
  contact: 'contact',
};

export function useCheckoutStorePolicies(storeId: string | null | undefined) {
  const [policies, setPolicies] = useState<CheckoutStoreWrittenPolicies | null>(() =>
    storeId ? peekCheckoutWrittenPolicies(storeId) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeStoreIdRef = useRef(storeId);

  useEffect(() => {
    if (activeStoreIdRef.current === storeId) return;
    activeStoreIdRef.current = storeId;
    setPolicies(storeId ? peekCheckoutWrittenPolicies(storeId) : null);
    setError(null);
    setLoading(false);
  }, [storeId]);

  const ensurePolicies = useCallback(async (): Promise<CheckoutStoreWrittenPolicies | null> => {
    if (!storeId) return null;

    const cached = peekCheckoutWrittenPolicies(storeId);
    if (cached) {
      setPolicies(cached);
      return cached;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchCheckoutWrittenPolicies(storeId);
      setPolicies(data);
      return data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to load policies';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const ensurePolicyByType = useCallback(
    async (type: CheckoutStorePolicyType): Promise<CheckoutStorePolicyContent | null> => {
      if (!storeId) return null;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchCheckoutPolicyByType(storeId, type);
        setPolicies(peekCheckoutWrittenPolicies(storeId));
        return data;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load policy';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [storeId]
  );

  const getPolicyContent = useCallback(
    (type: CheckoutStorePolicyType, data: CheckoutStoreWrittenPolicies | null = policies): string | null => {
      if (!data) return null;
      return data[POLICY_KEY[type]]?.content ?? null;
    },
    [policies]
  );

  return {
    policies,
    loading,
    error,
    ensurePolicies,
    ensurePolicyByType,
    getPolicyContent,
    clearError: () => setError(null),
  };
}
