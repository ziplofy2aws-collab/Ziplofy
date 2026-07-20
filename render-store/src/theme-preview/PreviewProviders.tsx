import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AmountOffOrderProvider } from '@/contexts/amount-off-order.context';
import { AmountOffProductProvider } from '@/contexts/amount-off-product.context';
import { CustomerAddressProvider } from '@/contexts/customer-address-storefront.context';
import { StorefrontCountryProvider } from '@/contexts/storefront-country.context';
import { StorefrontProductVariantProvider } from '@/contexts/product-variant.context';
import { StorefrontAuthProvider } from '@/contexts/storefront-auth.context';
import { StorefrontCartProvider } from '@/contexts/storefront-cart.context';
import { StorefrontBlogsProvider } from '@/contexts/storefront-blogs.context';
import { StorefrontPoliciesProvider } from '@/contexts/storefront-policies.context';
import { StorefrontCheckoutConfigurationProvider } from '@/contexts/storefront-checkout-configuration.context';
import { StorefrontPaymentMethodsProvider } from '@/contexts/storefront-payment-methods.context';
import { StorefrontCheckoutCustomerInformationProvider } from '@/contexts/storefront-checkout-customer-information.context';
import { StorefrontCollectionsProvider } from '@/contexts/storefront-collections.context';
import { StorefrontSearchProvider } from '@/contexts/storefront-search.context';
import { BuyXGetYProvider } from '@/contexts/buy-x-get-y.context';
import { FreeShippingProvider } from '@/contexts/storefront-free-shipping.context';
import { StorefrontOrderProvider } from '@/contexts/storefront-order.context';
import { PaymentProvider } from '@/contexts/payment.context';
import { ProductOffersProvider } from '@/contexts/product-offers.context';
import { StorefrontCollectionByUrlHandleLoader } from '@/components/StorefrontCollectionByUrlHandleLoader';
import { PreviewCollectionsLoader } from './PreviewCollectionsLoader';
import { PreviewStorefrontProvider } from './PreviewStorefrontProvider';
import { PreviewDeviceProvider, type PreviewDevice } from '@/contexts/preview-device.context';

type PreviewProvidersProps = {
  storeId: string;
  storeName?: string;
  themeConfig: Record<string, unknown> | null;
  jsUrl?: string | null;
  cssUrl?: string | null;
  previewDevice?: PreviewDevice;
  children: ReactNode;
};

/** Same provider stack as production storefront, with preview-specific store bootstrap. */
export function PreviewProviders({
  storeId,
  storeName,
  themeConfig,
  jsUrl,
  cssUrl,
  previewDevice = 'desktop',
  children,
}: PreviewProvidersProps) {
  return (
    <PreviewDeviceProvider device={previewDevice}>
      <PreviewStorefrontProvider
      storeId={storeId}
      storeName={storeName}
      themeConfig={themeConfig}
      jsUrl={jsUrl}
      cssUrl={cssUrl}
    >
      <Toaster position="bottom-right" />
      <StorefrontAuthProvider>
        <PaymentProvider>
          <StorefrontProductVariantProvider>
            <StorefrontCartProvider>
              <StorefrontOrderProvider>
                <CustomerAddressProvider>
                  <StorefrontCountryProvider>
                    <StorefrontCollectionsProvider>
                      <StorefrontBlogsProvider>
                      <StorefrontPoliciesProvider>
                      <StorefrontCheckoutConfigurationProvider>
                      <StorefrontPaymentMethodsProvider>
                      <StorefrontCheckoutCustomerInformationProvider>
                      <PreviewCollectionsLoader storeId={storeId} />
                      <StorefrontCollectionByUrlHandleLoader />
                      <StorefrontSearchProvider>
                        <AmountOffOrderProvider>
                          <AmountOffProductProvider>
                            <BuyXGetYProvider>
                              <FreeShippingProvider>
                                <ProductOffersProvider>{children}</ProductOffersProvider>
                              </FreeShippingProvider>
                            </BuyXGetYProvider>
                          </AmountOffProductProvider>
                        </AmountOffOrderProvider>
                      </StorefrontSearchProvider>
                      </StorefrontCheckoutCustomerInformationProvider>
                      </StorefrontPaymentMethodsProvider>
                      </StorefrontCheckoutConfigurationProvider>
                      </StorefrontPoliciesProvider>
                      </StorefrontBlogsProvider>
                    </StorefrontCollectionsProvider>
                  </StorefrontCountryProvider>
                </CustomerAddressProvider>
              </StorefrontOrderProvider>
            </StorefrontCartProvider>
          </StorefrontProductVariantProvider>
        </PaymentProvider>
      </StorefrontAuthProvider>
      </PreviewStorefrontProvider>
    </PreviewDeviceProvider>
  );
}
