import { useEffect } from 'react';
import { resolveCheckoutPageAppearance } from '@codiic/create-theme/checkout/runtime/checkout-page.utils';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCheckoutConfiguration } from '@/contexts/storefront-checkout-configuration.context';
import { useStorefrontPaymentMethods } from '@/contexts/storefront-payment-methods.context';
import { useStorefrontCheckoutCustomerInformation } from '@/contexts/storefront-checkout-customer-information.context';

export function useCheckoutPageAppearance() {
  const { storeFrontMeta } = useStorefront();
  const storeId = storeFrontMeta?.storeId ?? null;
  const { configuration, fetchByStoreId, loading } = useStorefrontCheckoutConfiguration();
  const {
    paymentMethods,
    fetchByStoreId: fetchPaymentMethods,
  } = useStorefrontPaymentMethods();
  const {
    customerInformation,
    fetchByStoreId: fetchCustomerInformation,
  } = useStorefrontCheckoutCustomerInformation();

  useEffect(() => {
    if (!storeId) return;
    void fetchByStoreId(storeId);
    void fetchPaymentMethods(storeId);
    void fetchCustomerInformation(storeId);
  }, [storeId, fetchByStoreId, fetchPaymentMethods, fetchCustomerInformation]);

  const checkoutConfig =
    configuration?.storeId === storeId ? configuration.checkoutConfig : null;

  return {
    storeId,
    storeName: storeFrontMeta?.name ?? 'My Store',
    storeUrl: typeof window !== 'undefined' ? window.location.origin : null,
    loading: Boolean(storeId) && loading && !checkoutConfig,
    paymentMethods: storeId ? paymentMethods : [],
    customerInformation: storeId ? customerInformation : undefined,
    ...resolveCheckoutPageAppearance(checkoutConfig),
  };
}
