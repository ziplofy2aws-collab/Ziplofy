import { useEffect } from 'react';
import { resolveCheckoutProfilePageAppearance } from '@ziplofy/create-theme/checkout/runtime/checkout-profile-page.utils';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCheckoutConfiguration } from '@/contexts/storefront-checkout-configuration.context';

export function useCheckoutProfilePageAppearance() {
  const { storeFrontMeta } = useStorefront();
  const storeId = storeFrontMeta?.storeId ?? null;
  const { configuration, fetchByStoreId, loading } = useStorefrontCheckoutConfiguration();

  useEffect(() => {
    if (!storeId) return;
    void fetchByStoreId(storeId);
  }, [storeId, fetchByStoreId]);

  const checkoutConfig =
    configuration?.storeId === storeId ? configuration.checkoutConfig : null;

  return {
    storeId,
    storeName: storeFrontMeta?.name ?? 'My Store',
    storeUrl: typeof window !== 'undefined' ? window.location.origin : null,
    loading: Boolean(storeId) && loading && !checkoutConfig,
    ...resolveCheckoutProfilePageAppearance(checkoutConfig),
  };
}
