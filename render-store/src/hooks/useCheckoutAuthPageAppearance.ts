import { useEffect } from 'react';
import { resolveCheckoutAuthPageAppearance } from '@codiic/create-theme/checkout/runtime/checkout-auth-page.utils';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCheckoutConfiguration } from '@/contexts/storefront-checkout-configuration.context';

export function useCheckoutAuthPageAppearance() {
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
    loading: Boolean(storeId) && loading && !checkoutConfig,
    ...resolveCheckoutAuthPageAppearance(checkoutConfig),
  };
}
