'use client';

/** Webpanel adapter for codiic `useStoreSubdomain` — subdomain lives on the store doc. */

import { useCallback, useMemo, useState } from 'react';
import { storesApi } from '@/lib/api';
import { buildStorefrontUrl } from '@/lib/storefront-url';

export type StoreSubdomain = {
  _id?: string;
  storeId?: string;
  subdomain: string;
  customDomain?: string | null;
  /** Resolved storefront origin (e.g. http://besthealth.localhost:3003). */
  url?: string | null;
};

export function useStoreSubdomain() {
  const [storeSubdomain, setStoreSubdomain] = useState<StoreSubdomain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await storesApi.get(storeId);
      const store = res.data?.data as
        | { subdomain?: { subdomain?: string; customDomain?: string | null } | null }
        | undefined;
      const sub = store?.subdomain ?? null;
      const value: StoreSubdomain | null = sub?.subdomain
        ? {
            storeId,
            subdomain: sub.subdomain,
            customDomain: sub.customDomain ?? null,
            url: buildStorefrontUrl(sub.subdomain, sub.customDomain),
          }
        : null;
      setStoreSubdomain(value);
      return value;
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to load subdomain');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      storeSubdomain,
      loading,
      error,
      getByStoreId,
      validateSubdomain: async () => ({ available: true }),
    }),
    [storeSubdomain, loading, error, getByStoreId]
  );
}
