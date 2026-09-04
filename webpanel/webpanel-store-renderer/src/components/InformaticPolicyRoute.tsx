import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { axiosi } from '@/config/axios.config';
import {
  InformaticStorePolicyProvider,
  type InformaticStorePolicyApiType,
  type InformaticStorePolicyData,
} from '@informatic-theme/sdk-shim';
import { useStorefront } from '@/contexts/store.context';

type StorefrontPolicyResponse = {
  success: boolean;
  message?: string;
  data?: InformaticStorePolicyData | null;
};

/**
 * Loads a store policy by type and provides it to Informatic policy page templates.
 */
export function InformaticPolicyRoute({
  policyType,
  children,
}: {
  policyType: InformaticStorePolicyApiType;
  children: ReactNode;
}) {
  const { storeFrontMeta, storeFrontChecked } = useStorefront();
  const [policy, setPolicy] = useState<InformaticStorePolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeId = storeFrontMeta?.storeId ?? null;

  useEffect(() => {
    if (!storeFrontChecked || !storeId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void axiosi
      .get<StorefrontPolicyResponse>(`/storefront/${storeId}/policies/${encodeURIComponent(policyType)}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && data.data?.content?.trim()) {
          setPolicy(data.data);
          setError(null);
        } else {
          setPolicy(null);
          setError(data.message || 'No policy published yet');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPolicy(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load policy';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [policyType, storeFrontChecked, storeId]);

  const value = useMemo(
    () => ({
      storeId,
      policyType,
      policy,
      loading,
      error,
    }),
    [storeId, policyType, policy, loading, error]
  );

  return <InformaticStorePolicyProvider value={value}>{children}</InformaticStorePolicyProvider>;
}
