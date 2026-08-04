/**
 * Ecommerce SDK for custom / remote theme runtimes.
 * Import via `@render-store/sdk` (or the built remote `sdk.js` surface).
 */

// —— Core store / theme ——
export { useStorefront } from '@/contexts/store.context';
export { useThemeConfig, getThemeConfigValue } from '@/contexts/theme-config.context';
export type { ThemeConfig } from '@/contexts/theme-config.context';
export { usePreviewDevice, type PreviewDevice } from '@/contexts/preview-device.context';
export { isThemeEditorPreview } from '@/utils/theme-editor-preview';
export { useThemeEditorPreview } from '@/hooks/useThemeEditorPreview';
export {
  shouldShowRemoteThemePackDemoAssets,
  isRemoteThemePackDemoMediaUrl,
  remoteThemeMediaPlaceholderUrl,
  resolveRemoteThemeMediaUrl,
} from '@/utils/remote-theme-media';
export {
  usePreviewHighlightNodeId,
  layoutBlockIdFromHighlightNodeId,
} from '@/hooks/usePreviewHighlightNodeId';

// —— Auth / access ——
export { useStorefrontAuth } from '@/contexts/storefront-auth.context';
export type {
  StorefrontUser,
  SignupPayload,
  LoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateStorefrontUserPayload,
} from '@/contexts/storefront-auth.context';
export {
  useStorefrontAccess,
  useOptionalStorefrontAccess,
} from '@/contexts/store-access.context';

// —— Catalog ——
export { useStorefrontProducts } from '@/contexts/product.context';
export type {
  StorefrontProductItem,
  StorefrontProductDetailItem,
} from '@/contexts/product.context';
export { useStorefrontProductVariants } from '@/contexts/product-variant.context';
export type { StorefrontProductVariant } from '@/contexts/product-variant.context';
export { useStorefrontCollections } from '@/contexts/storefront-collections.context';
export type { StorefrontCollection } from '@/contexts/storefront-collections.context';
export { useStorefrontSearch } from '@/contexts/storefront-search.context';
export type {
  StorefrontSearchPagination,
  SearchStorefrontProductsArgs,
} from '@/contexts/storefront-search.context';
export { useProductOffers } from '@/contexts/product-offers.context';
export type {
  FreeShippingProductOffer,
  AmountOffOrderProductOffer,
  AmountOffProductsProductOffer,
  BuyXGetYProductOffer,
  FreeShippingOfferMethod,
  FreeShippingOfferEligibility,
  FreeShippingOfferMinimumPurchase,
  AmountOffOrderOfferMethod,
  AmountOffOrderOfferValueType,
  AmountOffOrderOfferEligibility,
  AmountOffOrderOfferMinimumPurchase,
  AmountOffProductsOfferMethod,
  AmountOffProductsOfferValueType,
  AmountOffProductsOfferEligibility,
  AmountOffProductsOfferMinimumPurchase,
  AmountOffProductsAppliesTo,
  BuyXGetYOfferMethod,
  BuyXGetYCustomerBuys,
  BuyXGetYAnyItemsFrom,
  BuyXGetYCustomerGetsFrom,
  BuyXGetYDiscountedValue,
  BuyXGetYOfferEligibility,
} from '@/contexts/product-offers.context';
export {
  dedupeFreeShipping,
  dedupeAmountOffOrder,
  dedupeAmountOffProducts,
  dedupeBuyXGetY,
  freeShippingSecondaryLine,
  amountOffOrderSecondaryLine,
  amountOffProductSecondaryLine,
  buyXGetYSecondaryLine,
} from '@/utils/product-offer-display';

// —— Content ——
export { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
export type {
  StorefrontBlog,
  StorefrontBlogPost,
} from '@/contexts/storefront-blogs.context';
export { useStorefrontPages } from '@/contexts/storefront-pages.context';
export type { StorefrontPage } from '@/contexts/storefront-pages.context';
export {
  useStorefrontBlogComments,
  type StorefrontBlogComment,
} from '@/hooks/useStorefrontBlogComments';
export { useStorefrontPolicies } from '@/contexts/storefront-policies.context';
export type {
  StorefrontWrittenPolicies,
  StorefrontPolicyContent,
  StorefrontPolicyType,
} from '@/contexts/storefront-policies.context';
export { StorefrontPolicyLinks } from '@/components/policies/StorefrontPolicyLinks';
export { StorefrontPolicyModal } from '@/components/policies/StorefrontPolicyModal';
export { useStorefrontContactForm } from '@/contexts/storefront-contact-form.context';
export type {
  CreateContactFormSubmissionPayload,
  ContactFormSubmissionResult,
} from '@/contexts/storefront-contact-form.context';
export { useStorefrontNewsletter } from '@/contexts/storefront-newsletter.context';
export type {
  CreateNewsletterSubscriptionPayload,
  NewsletterSubscriptionResult,
} from '@/contexts/storefront-newsletter.context';

// —— Cart / checkout ——
export { useStorefrontCart } from '@/contexts/storefront-cart.context';
export type {
  StorefrontCartItem,
  GuestCartItem,
} from '@/contexts/storefront-cart.context';
export { useStorefrontOrder } from '@/contexts/storefront-order.context';
export type {
  StorefrontOrder,
  CreateOrderPayload,
  OrderItem,
  Customer,
  CustomerAddress as OrderCustomerAddress,
} from '@/contexts/storefront-order.context';
export { useStorefrontCheckoutConfiguration } from '@/contexts/storefront-checkout-configuration.context';
export type { StorefrontCheckoutConfiguration } from '@/contexts/storefront-checkout-configuration.context';
export { useStorefrontCheckoutCustomerInformation } from '@/contexts/storefront-checkout-customer-information.context';
export { useStorefrontPaymentMethods } from '@/contexts/storefront-payment-methods.context';
export { usePayment } from '@/contexts/payment.context';
export type { PaymentConfirmPayload } from '@/contexts/payment.context';
export type {
  CheckoutCustomerInformation,
  CheckoutPaymentMethodOption,
  CheckoutPaymentMethod,
  CheckoutFieldRequirementOption,
  CheckoutFullNameOption,
} from '@codiic/create-theme/checkout/checkout-form.types';
export { DEFAULT_CHECKOUT_CUSTOMER_INFORMATION } from '@codiic/create-theme/checkout/checkout-form.types';

// —— Account ——
export { useCustomerAddresses } from '@/contexts/customer-address-storefront.context';
export type {
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from '@/contexts/customer-address-storefront.context';
export { useStorefrontCountries } from '@/contexts/storefront-country.context';
export type {
  Country,
  GetCountriesParams,
} from '@/contexts/storefront-country.context';

// —— Discounts (cart-level eligibility / validation) ——
export { useAmountOffOrder } from '@/contexts/amount-off-order.context';
export type {
  AmountOffOrderCartItem,
  AmountOffOrderDiscount,
} from '@/contexts/amount-off-order.context';
export { useAmountOffProduct } from '@/contexts/amount-off-product.context';
export type {
  AmountOffProductCartItem,
  AmountOffProductDiscount,
} from '@/contexts/amount-off-product.context';
export { useBuyXGetY } from '@/contexts/buy-x-get-y.context';
export type {
  BuyXGetYCartItem,
  BuyXGetYGetsItem,
  BuyXGetYDiscount,
} from '@/contexts/buy-x-get-y.context';
export { useFreeShipping } from '@/contexts/storefront-free-shipping.context';
export type {
  FreeShippingDiscount,
  CartItem as FreeShippingCartItem,
  ShippingAddress as FreeShippingShippingAddress,
  CheckEligibleFreeShippingRequest,
  ValidateFreeShippingCodeRequest,
  FreeShippingContextType,
} from '@/contexts/storefront-free-shipping.context';

// —— Money / paths ——
export { formatINR, formatMoney } from '@/utils/currency';
export {
  STOREFRONT_PATHS,
  productPath,
  collectionPath,
  blogPath,
  blogArticlePath,
  isAllProductsPath,
  isAllCollectionsPath,
  isCollectionProductsPath,
  isCollectionsListPath,
} from '@/utils/storefront-paths';
