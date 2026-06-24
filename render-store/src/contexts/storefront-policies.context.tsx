import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type StorefrontPolicyType =
  | 'return-refund'
  | 'privacy'
  | 'terms'
  | 'shipping'
  | 'contact';

export interface StorefrontPolicyContent {
  content: string;
  updatedAt: string;
}

export interface StorefrontWrittenPolicies {
  returnRefund: StorefrontPolicyContent | null;
  privacy: StorefrontPolicyContent | null;
  terms: StorefrontPolicyContent | null;
  shipping: StorefrontPolicyContent | null;
  contact: StorefrontPolicyContent | null;
}

interface FetchWrittenPoliciesApiResponse {
  success: boolean;
  data: StorefrontWrittenPolicies;
  message?: string;
}

interface FetchPolicyByTypeApiResponse {
  success: boolean;
  data: StorefrontPolicyContent | null;
  message?: string;
}

const POLICY_TYPE_TO_KEY: Record<StorefrontPolicyType, keyof StorefrontWrittenPolicies> = {
  'return-refund': 'returnRefund',
  privacy: 'privacy',
  terms: 'terms',
  shipping: 'shipping',
  contact: 'contact',
};

const EMPTY_POLICIES = (): StorefrontWrittenPolicies => ({
  returnRefund: null,
  privacy: null,
  terms: null,
  shipping: null,
  contact: null,
});

interface StorefrontPoliciesContextType {
  policies: StorefrontWrittenPolicies | null;
  loadedStoreId: string | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<StorefrontWrittenPolicies>;
  fetchPolicyByType: (storeId: string, policyType: StorefrontPolicyType) => Promise<StorefrontPolicyContent | null>;
  getPolicyByType: (policyType: StorefrontPolicyType) => StorefrontPolicyContent | null;
  clear: () => void;
}

const StorefrontPoliciesContext = createContext<StorefrontPoliciesContextType | undefined>(undefined);

export const StorefrontPoliciesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policies, setPolicies] = useState<StorefrontWrittenPolicies | null>(null);
  const [loadedStoreId, setLoadedStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Map<string, Promise<StorefrontWrittenPolicies>>>(new Map());

  const clear = useCallback(() => {
    setPolicies(null);
    setLoadedStoreId(null);
    setError(null);
    setLoading(false);
    inflightRef.current.clear();
  }, []);

  const fetchByStoreId = useCallback(async (storeId: string): Promise<StorefrontWrittenPolicies> => {
    if (loadedStoreId === storeId && policies) {
      return policies;
    }

    const existing = inflightRef.current.get(storeId);
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      try {
        setLoading(true);
        setError(null);
        if (loadedStoreId !== storeId) {
          setPolicies(null);
        }
        const res = await axiosi.get<FetchWrittenPoliciesApiResponse>(`/storefront/policies/store/${storeId}`);
        const { success, data, message } = res.data;
        if (!success || !data) {
          throw new Error(message || 'Failed to fetch store policies');
        }
        setPolicies(data);
        setLoadedStoreId(storeId);
        return data;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to fetch store policies';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
        inflightRef.current.delete(storeId);
      }
    })();

    inflightRef.current.set(storeId, promise);
    return promise;
  }, [loadedStoreId, policies]);

  const fetchPolicyByType = useCallback(
    async (storeId: string, policyType: StorefrontPolicyType): Promise<StorefrontPolicyContent | null> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<FetchPolicyByTypeApiResponse>(
          `/storefront/policies/store/${storeId}/type/${policyType}`
        );
        const { success, data, message } = res.data;
        if (!success) {
          throw new Error(message || 'Failed to fetch store policy');
        }
        setPolicies((prev) => {
          const key = POLICY_TYPE_TO_KEY[policyType];
          const next: StorefrontWrittenPolicies = prev ? { ...prev } : EMPTY_POLICIES();
          next[key] = data;
          return next;
        });
        setLoadedStoreId(storeId);
        return data;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to fetch store policy';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPolicyByType = useCallback(
    (policyType: StorefrontPolicyType): StorefrontPolicyContent | null => {
      if (!policies) return null;
      return policies[POLICY_TYPE_TO_KEY[policyType]];
    },
    [policies]
  );

  const value = useMemo<StorefrontPoliciesContextType>(
    () => ({
      policies,
      loadedStoreId,
      loading,
      error,
      fetchByStoreId,
      fetchPolicyByType,
      getPolicyByType,
      clear,
    }),
    [policies, loadedStoreId, loading, error, fetchByStoreId, fetchPolicyByType, getPolicyByType, clear]
  );

  return <StorefrontPoliciesContext.Provider value={value}>{children}</StorefrontPoliciesContext.Provider>;
};

export const useStorefrontPolicies = (): StorefrontPoliciesContextType => {
  const ctx = useContext(StorefrontPoliciesContext);
  if (!ctx) {
    throw new Error('useStorefrontPolicies must be used within a StorefrontPoliciesProvider');
  }
  return ctx;
};

export default StorefrontPoliciesContext;
