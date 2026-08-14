import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { CodiicLoggedInToastHost } from './components/auth/CodiicLoggedInToastHost';
import { AmountOffOrderProvider } from './contexts/amount-off-order.context';
import { AmountOffProductProvider } from './contexts/amount-off-product.context';
import { CustomerAddressProvider } from './contexts/customer-address-storefront.context';
import { StorefrontCountryProvider } from './contexts/storefront-country.context';
import { StorefrontProductVariantProvider } from './contexts/product-variant.context';
import { StorefrontProvider } from './contexts/store.context';
import { StorefrontAccessProvider } from './contexts/store-access.context';
import { StorefrontAuthProvider } from './contexts/storefront-auth.context';
import { StorefrontCartProvider } from './contexts/storefront-cart.context';
import { StorefrontBlogsProvider } from './contexts/storefront-blogs.context';
import { StorefrontPagesProvider } from './contexts/storefront-pages.context';
import { StorefrontPoliciesProvider } from './contexts/storefront-policies.context';
import { StorefrontCheckoutConfigurationProvider } from './contexts/storefront-checkout-configuration.context';
import { StorefrontPaymentMethodsProvider } from './contexts/storefront-payment-methods.context';
import { StorefrontCheckoutCustomerInformationProvider } from './contexts/storefront-checkout-customer-information.context';
import { StorefrontCollectionsProvider } from './contexts/storefront-collections.context';
import { StorefrontSearchProvider } from './contexts/storefront-search.context';
import { BuyXGetYProvider } from './contexts/buy-x-get-y.context';
import { FreeShippingProvider } from './contexts/storefront-free-shipping.context';
import { StorefrontOrderProvider } from './contexts/storefront-order.context';
import { StorefrontContactFormProvider } from './contexts/storefront-contact-form.context';
import { StorefrontNewsletterProvider } from './contexts/storefront-newsletter.context';
import { PaymentProvider } from './contexts/payment.context';
import { ProductOffersProvider } from './contexts/product-offers.context';
import { StorefrontLiveSessionPresence } from './components/StorefrontLiveSessionPresence';

type StorefrontProvidersProps = {
  children: ReactNode;
};

export const StorefrontProviders = ({ children }: StorefrontProvidersProps) => (
  <StorefrontProvider>
    <StorefrontAccessProvider>
      <Toaster position="bottom-right" />
      <StorefrontAuthProvider>
        <CodiicLoggedInToastHost />
      <PaymentProvider>
        <StorefrontProductVariantProvider>
          <StorefrontCartProvider>
            <StorefrontLiveSessionPresence />
            <StorefrontOrderProvider>
              <StorefrontContactFormProvider>
              <StorefrontNewsletterProvider>
              <CustomerAddressProvider>
                <StorefrontCountryProvider>
                  <StorefrontCollectionsProvider>
                    <StorefrontBlogsProvider>
                    <StorefrontPagesProvider>
                    <StorefrontPoliciesProvider>
                    <StorefrontCheckoutConfigurationProvider>
                    <StorefrontPaymentMethodsProvider>
                    <StorefrontCheckoutCustomerInformationProvider>
                    <StorefrontSearchProvider>
                      <AmountOffOrderProvider>
                        <AmountOffProductProvider>
                          <BuyXGetYProvider>
                            <FreeShippingProvider>
                              <ProductOffersProvider>
                                {children}
                              </ProductOffersProvider>
                            </FreeShippingProvider>
                          </BuyXGetYProvider>
                        </AmountOffProductProvider>
                      </AmountOffOrderProvider>
                    </StorefrontSearchProvider>
                    </StorefrontCheckoutCustomerInformationProvider>
                    </StorefrontPaymentMethodsProvider>
                    </StorefrontCheckoutConfigurationProvider>
                    </StorefrontPoliciesProvider>
                    </StorefrontPagesProvider>
                    </StorefrontBlogsProvider>
                  </StorefrontCollectionsProvider>
                </StorefrontCountryProvider>
              </CustomerAddressProvider>
              </StorefrontNewsletterProvider>
              </StorefrontContactFormProvider>
            </StorefrontOrderProvider>
          </StorefrontCartProvider>
        </StorefrontProductVariantProvider>
      </PaymentProvider>
    </StorefrontAuthProvider>
    </StorefrontAccessProvider>
  </StorefrontProvider>
);
