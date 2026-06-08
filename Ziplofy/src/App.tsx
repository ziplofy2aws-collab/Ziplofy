// src/App.tsx
import React, { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";

// Import axios config early to ensure interceptors are set up before any requests
import "./config/axios.config";

import AdminStandardLayout from "./components/layout/AdminStandardLayout";
import Sidebar from "./components/Sidebar";
import { AmountOffProductsDiscountProvider } from "./contexts/amount-off-products-discount.context";
import { CustomerTagsProvider } from "./contexts/customer-tags.context";
import { CustomerTimelineProvider } from "./contexts/customer-timeline.context";
import { CustomerProvider } from "./contexts/customer.context";
import { ProductTagsProvider } from "./contexts/product-tags.context";
import { SocketProvider } from "./contexts/socket.context";
import { StoreProvider } from "./contexts/store.context";
import { UserProvider } from "./contexts/user.context";
import { AwsUploadProvider } from "./contexts/aws-upload.context";
import { StoreCloudStorageProvider } from "./contexts/store-cloud-storage.context";
import Navbar from "./pages/Navbar";
import { CategoryProvider } from "./contexts/category.context";
import { NotificationOverridesProvider } from "./contexts/notification-overrides.context";
import { PermissionsProvider } from "./contexts/permissions.context";
import { PurchaseOrderProvider } from "./contexts/purchase-order.context";
import { StoreRolesProvider } from "./contexts/store-roles.context";
import { StoreSecuritySettingsProvider } from "./contexts/store-security-settings.context";
import { CreateThemePoweredByLoader } from "./create-theme/chrome/CreateThemePoweredByLoader";

// Lazy-loaded page components (code splitting)
const BasicElementor = lazy(() => import("./pages/themes/BasicElementor"));
const CustomThemeBuilder = lazy(() => import("./pages/themes/CustomThemeBuilder"));
const ThemeCodeEditor = lazy(() => import("./pages/themes/ThemeCodeEditor"));
const ThemeCodeEditorFullScreen = lazy(() => import("./pages/themes/ThemeCodeEditorFullScreen"));
const ThemeEditor = lazy(() => import("./pages/themes/ThemeEditor"));
const StoreThemeConfigEditor = lazy(() => import("./pages/themes/StoreThemeConfigEditor"));
const ThemeLayoutEditor = lazy(() => import("./pages/themes/ThemeLayoutEditor"));
const CreateThemePage = lazy(() => import("./create-theme/CreateThemePage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const CreateOrderPage = lazy(() => import("./pages/CreateOrderPage"));
const CustomerDetailsPage = lazy(() => import("./pages/CustomerDetailsPage"));
const CustomerSegmentDetailsPage = lazy(() => import("./pages/CustomerSegmentDetailsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const CustomersSegmentsPage = lazy(() => import("./pages/CustomersSegmentsPage"));
const DiscountsPage = lazy(() => import("./pages/DiscountsPage"));
const GiftCardDetailPage = lazy(() => import("./pages/GiftCardDetailPage"));
const GiftCardsPage = lazy(() => import("./pages/GiftCardsPage"));
const MarketingAttributionPage = lazy(() => import("./pages/MarketingAttributionPage"));
const MarketingAutomationsPage = lazy(() => import("./pages/MarketingAutomationsPage"));
const MarketingCampaignsPage = lazy(() => import("./pages/MarketingCampaignsPage"));
const MarketingPage = lazy(() => import("./pages/MarketingPage"));
const NewCustomerPage = lazy(() => import("./pages/NewCustomerPage"));
const NewGiftCardPage = lazy(() => import("./pages/NewGiftCardPage"));
const NewProductPage = lazy(() => import("./pages/NewProductPage"));
const NewTransferPage = lazy(() => import("./pages/NewTransferPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProductCollectionCreatePage = lazy(() => import("./pages/ProductCollectionCreatePage"));
const ProductCollectionDetailsPage = lazy(() => import("./pages/ProductCollectionDetailsPage"));
const ProductCollectionsPage = lazy(() => import("./pages/ProductCollectionsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const ProductVariantDetailsPage = lazy(() => import("./pages/ProductVariantDetailsPage"));
const ProductsInventoryPage = lazy(() => import("./pages/ProductsInventoryPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const PurchaseOrderDetailsPage = lazy(() => import("./pages/PurchaseOrderDetailsPage"));
const PurchaseOrderNewPage = lazy(() => import("./pages/PurchaseOrderNewPage"));
const PurchaseOrderReceivePage = lazy(() => import("./pages/PurchaseOrderReceivePage"));
const PurchaseOrdersListPage = lazy(() => import("./pages/PurchaseOrdersListPage"));
const ShipmentNewPage = lazy(() => import("./pages/ShipmentNewPage"));
const ShipmentReceivePage = lazy(() => import("./pages/ShipmentReceivePage"));
const TagManagement = lazy(() => import("./pages/TagManagement"));
const TransferDetailsPage = lazy(() => import("./pages/TransferDetailsPage"));
const TransfersPage = lazy(() => import("./pages/TransfersPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const AmountOffOrderDetailsPage = lazy(() => import("./pages/discounts/AmountOffOrderDetailsPage"));
const AmountOffOrderPage = lazy(() => import("./pages/discounts/AmountOffOrderPage"));
const AmountOffProductsPage = lazy(() => import("./pages/discounts/AmountOffProductsPage"));
const BuyXGetYDetailsPage = lazy(() => import("./pages/discounts/BuyXGetYDetailsPage"));
const BuyXGetYPage = lazy(() => import("./pages/discounts/BuyXGetYPage"));
const DiscountDetailsPage = lazy(() => import("./pages/discounts/DiscountDetailsPage"));
const FreeShippingDetailsPage = lazy(() => import("./pages/discounts/FreeShippingDetailsPage"));
const FreeShippingPage = lazy(() => import("./pages/discounts/FreeShippingPage"));
const AutomationCreatePage = lazy(() => import("./pages/marketing/AutomationCreatePage"));
const AutomationDetailsPage = lazy(() => import("./pages/marketing/AutomationDetailsPage"));
const AutomationNewPage = lazy(() => import("./pages/marketing/AutomationNewPage"));
const AutomationTemplatesPage = lazy(() => import("./pages/marketing/AutomationTemplatesPage"));
const BillingChargesPage = lazy(() => import("./pages/settings/BillingChargesPage"));
const BillingProfilePage = lazy(() => import("./pages/settings/BillingProfilePage"));
const BillingSettingsPage = lazy(() => import("./pages/settings/BillingSettingsPage"));
const BillingUpcomingPage = lazy(() => import("./pages/settings/BillingUpcomingPage"));
const BrandSettingsPage = lazy(() => import("./pages/settings/BrandSettingsPage"));
const CheckoutSettingsPage = lazy(() => import("./pages/settings/CheckoutSettingsPage"));
const CreateReturnRules = lazy(() => import("./pages/settings/CreateReturnRules"));
const CustomerAccountsAuthenticationPage = lazy(() => import("./pages/settings/CustomerAccountsAuthenticationPage"));
const CustomerAccountsFacebookPage = lazy(() => import("./pages/settings/CustomerAccountsFacebookPage"));
const CustomerAccountsGooglePage = lazy(() => import("./pages/settings/CustomerAccountsGooglePage"));
const CustomerAccountsPage = lazy(() => import("./pages/settings/CustomerAccountsPage"));
const CustomerNotificationsPage = lazy(() => import("./pages/settings/CustomerNotificationsPage"));
const CustomerPrivacyPage = lazy(() => import("./pages/settings/CustomerPrivacyPage"));
const DataSharingOptOutPage = lazy(() => import("./pages/settings/DataSharingOptOutPage"));
const DomainsPage = lazy(() => import("./pages/settings/DomainsPage"));
const EditNotificationOptionPage = lazy(() => import("./pages/settings/EditNotificationOptionPage"));
const GeneralSettingsPage = lazy(() => import("./pages/settings/GeneralSettingsPage"));
const IndiaTaxDetailsPage = lazy(() => import("./pages/settings/IndiaTaxDetailsPage"));
const LocalDeliveriesPage = lazy(() => import("./pages/settings/LocalDeliveriesPage"));
const LocalDeliveryLocationDetailPage = lazy(() => import("./pages/settings/LocalDeliveryLocationDetailPage"));
const LocationDetailsPage = lazy(() => import("./pages/settings/LocationDetailsPage"));
const LocationsSettings = lazy(() => import("./pages/settings/LocationsSettings"));
const ManageReturnRules = lazy(() => import("./pages/settings/ManageReturnRules"));
const NewLocationForm = lazy(() => import("./pages/settings/NewLocationForm"));
const NewRolePage = lazy(() => import("./pages/settings/NewRolePage"));
const NotificationOptionDetailPage = lazy(() => import("./pages/settings/NotificationOptionDetailPage"));
const NotificationsPage = lazy(() => import("./pages/settings/NotificationsPage"));
const PaymentsSettingsPage = lazy(() => import("./pages/settings/PaymentsSettingsPage"));
const PaymentTransactionDetailsPage = lazy(() => import("./pages/settings/PaymentTransactionDetailsPage"));
const PlanSelectPage = lazy(() => import("./pages/settings/PlanSelectPage"));
const PlanSettingsPage = lazy(() => import("./pages/settings/PlanSettingsPage"));
const PlanSubscriptionsPage = lazy(() => import("./pages/settings/PlanSubscriptionsPage"));
const PoliciesSettings = lazy(() => import("./pages/settings/PoliciesSettings"));
const RoleDetailsPage = lazy(() => import("./pages/settings/RoleDetailsPage"));
const RolesPage = lazy(() => import("./pages/settings/RolesPage"));
const SettingsIndex = lazy(() => import("./pages/settings/SettingsIndex"));
const SettingsLayout = lazy(() => import("./pages/settings/SettingsLayout"));
const SettingsPlaceholder = lazy(() => import("./pages/settings/SettingsPlaceholder"));
const ShippingSettings = lazy(() => import("./pages/settings/ShippingSettings"));
const ShopMetafieldsPage = lazy(() => import("./pages/settings/ShopMetafieldsPage"));
const StoreActivityLogPage = lazy(() => import("./pages/settings/StoreActivityLogPage"));
const TaxesAndDutiesPage = lazy(() => import("./pages/settings/TaxesAndDutiesPage"));
const UsersPage = lazy(() => import("./pages/settings/UsersPage"));
const UsersSecurityPage = lazy(() => import("./pages/settings/UsersSecurityPage"));
const CustomerTagsPage = lazy(() => import("./pages/tag-management/CustomerTagsPage"));
const ProductTagsPage = lazy(() => import("./pages/tag-management/ProductTagsPage"));
const ProductTypesPage = lazy(() => import("./pages/tag-management/ProductTypesPage"));
const PurchaseOrderTagsPage = lazy(() => import("./pages/tag-management/PurchaseOrderTagsPage"));
const TransferTagsPage = lazy(() => import("./pages/tag-management/TransferTagsPage"));
const BlogPostCreatePage = lazy(() => import("./pages/BlogPostCreatePage").then(m => ({ default: m.BlogPostCreatePage })));
const ContentBlogPostsPage = lazy(() => import("./pages/ContentBlogPostsPage").then(m => ({ default: m.ContentBlogPostsPage })));
const ContentFilesPage = lazy(() => import("./pages/ContentFilesPage").then(m => ({ default: m.ContentFilesPage })));
const ContentMenusPage = lazy(() => import("./pages/ContentMenusPage").then(m => ({ default: m.ContentMenusPage })));
const ContentMenuCreatePage = lazy(() =>
  import("./pages/ContentMenuCreatePage").then(m => ({ default: m.ContentMenuCreatePage }))
);
const ContentMenuEditPage = lazy(() =>
  import("./pages/ContentMenuEditPage").then(m => ({ default: m.ContentMenuEditPage }))
);
const ContentUrlRedirectsPage = lazy(() =>
  import("./pages/ContentUrlRedirectsPage").then(m => ({ default: m.ContentUrlRedirectsPage }))
);
const ContentMetaObjectsPage = lazy(() => import("./pages/ContentMetaObjectsPage").then(m => ({ default: m.ContentMetaObjectsPage })));
const LanguageSettingsPage = lazy(() => import("./pages/LanguageSettingsPage").then(m => ({ default: m.LanguageSettingsPage })));
const MarketSettingsPage = lazy(() => import("./pages/MarketSettingsPage").then(m => ({ default: m.MarketSettingsPage })));
const MetafeildsAndMetaObjectsSettingsPage = lazy(() => import("./pages/MetafeildsAndMetaObjectsSettingsPage").then(m => ({ default: m.MetafeildsAndMetaObjectsSettingsPage })));
const OnlineStorePage = lazy(() => import("./pages/OnlineStorePage"));
const OnlineStorePagesPage = lazy(() => import("./pages/OnlineStorePagesPage"));
const OnlineStorePreferencePage = lazy(() => import("./pages/OnlineStorePreferencePage"));
const MarketDetailsPage = lazy(() => import("./pages/markets/MarketDetailsPage"));
const MarketsCatalogDetailsPage = lazy(() => import("./pages/markets/MarketsCatalogDetailsPage"));
const MarketsCatalogsNewPage = lazy(() => import("./pages/markets/MarketsCatalogsNewPage"));
const MarketsCatalogsPage = lazy(() => import("./pages/markets/MarketsCatalogsPage"));
const MarketsNewPage = lazy(() => import("./pages/markets/MarketsNewPage"));
const MarketsPage = lazy(() => import("./pages/markets/MarketsPage"));
const AbandonedCartsPage = lazy(() => import("./pages/orders/AbandonedCartPage"));
const AbandonedCartDetailsPage = lazy(() => import("./pages/orders/AbondonedCartDetailsPage"));
const DraftsPage = lazy(() => import("./pages/orders/DraftsPage"));
const CustomerEventPixelDetailsPage = lazy(() => import("./pages/settings/CustomerEventPixelDetailsPage"));
const CustomerEventsPage = lazy(() => import("./pages/settings/CustomerEventsPage"));
const ShippingProfileCreatePage = lazy(() => import("./pages/settings/ShippingProfileCreatePage"));
const ShippingProfileDetailsPage = lazy(() => import("./pages/settings/ShippingProfileDetailsPage"));
const WebhooksNotificationsPage = lazy(() => import("./pages/settings/WebhooksNotificationsPage"));
const AllThemes = lazy(() => import("./pages/themes/AllThemes"));
const HomePage = lazy(() => import("./components/HomePage"));

import { CustomerSegmentsEntryProvider } from "./contexts/CustomerSegmentsEntry.context";
import { AbandonedCartProvider } from "./contexts/abandoned-cart.context";
import { ActionProvider } from "./contexts/action.context";
import { AdminOrderProvider } from "./contexts/admin-order.context";
import { AmountOffOrderDiscountProvider } from "./contexts/amount-off-order-discount.context";
import { AutomationFlowProvider } from "./contexts/automation-flow.context";
import { BuyXGetYDiscountProvider } from "./contexts/buy-x-get-y-discount.context";
import { CatalogMarketProvider } from "./contexts/catalog-market.context";
import { CatalogProductProvider } from "./contexts/catalog-product.context";
import { CatalogProvider } from "./contexts/catalog.context";
import { CheckoutSettingsProvider } from "./contexts/checkout-settings.context";
import { CollectionEntriesProvider } from "./contexts/collection-entries.context";
import { CollectionProvider } from "./contexts/collection.context";
import { StoreMenuProvider } from "./contexts/store-menu.context";
import { CountryTaxOverrideProvider } from "./contexts/country-tax-override.context";
import { CountryTaxProvider } from "./contexts/country-tax.context";
import { CountryProvider } from "./contexts/country.context";
import { CurrencyProvider } from "./contexts/currency.context";
import { CustomThemesProvider } from "./contexts/custom-themes.context";
import { CustomerAccountSettingsProvider } from "./contexts/customer-account-settings.context";
import { CustomerAddressProvider } from "./contexts/customer-address.context";
import { CustomerSegmentProvider } from "./contexts/customer-segment.context";
import { FinalSaleItemProvider } from "./contexts/final-sale-item.context";
import { FreeShippingDiscountProvider } from "./contexts/free-shipping-discount.context";
import { GeneralSettingsProvider } from "./contexts/general-settings.context";
import { GiftCardTimelineProvider } from "./contexts/gift-card-timeline.context";
import { GiftCardsProvider } from "./contexts/gift-cards.context";
import { InstalledThemesProvider } from "./contexts/installed-themes.context";
import { InventoryLevelsProvider } from "./contexts/inventory-level.contexts";
import { LocalDeliveryLocationEntriesProvider } from "./contexts/local-delivery-location-entries.context";
import { LocalDeliverySettingsProvider } from "./contexts/local-delivery-settings.context";
import { LocationsProvider } from "./contexts/location.context";
import { MarketIncludesProvider } from "./contexts/market-includes.context";
import { MarketProvider } from "./contexts/market.context";
import { NotificationCategoriesProvider } from "./contexts/notification-categories.context";
import { NotificationOptionsProvider } from "./contexts/notification-options.context";
import { PackagingProvider } from "./contexts/packaging.context";
import { PaymentProvider } from "./contexts/payment.context";
import { PixelProvider } from "./contexts/pixel.context";
import { ProductOverrideEntryProvider } from "./contexts/product-override-entry.context";
import { ProductOverrideProvider } from "./contexts/product-override.context";
import { ProductTypeProvider } from "./contexts/product-type.context";
import { ProductVariantProvider } from "./contexts/product-variant.context";
import { ProductProvider } from "./contexts/product.context";
import { PurchaseOrderEntryProvider } from "./contexts/purchase-order-entry.context";
import { PurchaseOrderTagsProvider } from "./contexts/purchase-order-tags.context";
import { ReturnRulesProvider } from "./contexts/return-rules.context";
import { ShipmentProvider } from "./contexts/shipment.context";
import { ShippingOverrideProvider } from "./contexts/shipping-override.context";
import { ShippingProfileLocationSettingsProvider } from "./contexts/shipping-profile-location-settings.context";
import { ShippingProfileProductVariantsProvider } from "./contexts/shipping-profile-product-variants.context";
import { ShippingProfileProvider } from "./contexts/shipping-profile.context";
import { ShippingZoneRateProvider } from "./contexts/shipping-zone-rate.context";
import { ShippingZoneProvider } from "./contexts/shipping-zone.context";
import { StateProvider } from "./contexts/state.context";
import { StoreBannerProvider } from "./contexts/store-banner.context";
import { StoreCustomThemesProvider } from "./contexts/store-custom-themes.context";
import { StoreBrandingProvider } from "./contexts/store-branding.context";
import { StoreContactInfoProvider } from "./contexts/store-contact-info.context";
import { StoreNotificationEmailProvider } from "./contexts/store-notification-email.context";
import { StorePrivacyPolicyProvider } from "./contexts/store-privacy-policy.context";
import { StoreReturnRefundPolicyProvider } from "./contexts/store-return-refund-policy.context";
import { StoreShippingPolicyProvider } from "./contexts/store-shipping-policy.context";
import { StoreTermsPolicyProvider } from "./contexts/store-terms-policy.context";
import { StoreBillingAddressProvider } from "./contexts/storeBillingAddress.context";
import { StoreSubdomainProvider } from "./contexts/storeSubdomain.context";
import { TaxAndDutiesGlobalSettingsProvider } from "./contexts/tax-and-duties-global-settings.context";
import { TaxRateDefaultProvider } from "./contexts/tax-rate-default.context";
import { TaxRateOverrideProvider } from "./contexts/tax-rate-override.context";
import { ThemesProvider } from "./contexts/themes.context";
import { TransferEntriesProvider } from "./contexts/transfer-entries.context";
import { TransferTagsProvider } from "./contexts/transfer-tags.context";
import { TransferProvider } from "./contexts/transfer.context";
import { TriggerProvider } from "./contexts/trigger.context";
import { VendorProvider } from "./contexts/vendor.context";

/** Products children */

/** Customers child */

/** Marketing children */

const NAVBAR_HEIGHT = 48; // keep consistent with Sidebar offset (h-12 = 48px)
const SIDEBAR_WIDTH = 240; // keep consistent with Sidebar width

const PageLoader: React.FC = () => (
  <div className="flex min-h-[280px] w-full items-center justify-center px-4 py-16">
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200/80 bg-white px-12 py-10 shadow-sm">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
        aria-hidden
      />
      <p className="text-sm font-medium text-gray-600">Loading page…</p>
    </div>
  </div>
);

// This component is rendered INSIDE <Router>, so hooks like useLocation are safe here
const AdminApp: React.FC = () => {
  const location = useLocation();
  const isCodeFullScreen = location.pathname.startsWith('/themes/code-fullscreen/');
  const isBuilderFullScreen = location.pathname.startsWith('/themes/builder');
  const isBasicElementor = location.pathname.startsWith('/themes/basic-elementor');
  const isThemeCreator = location.pathname.startsWith('/themes/create');
  const isThemeSchemaEditor =
    location.pathname === '/themes/dev-editor' ||
    /^\/themes\/[^/]+\/editor$/.test(location.pathname);
  const isFullScreen =
    isCodeFullScreen ||
    isBuilderFullScreen ||
    isBasicElementor ||
    isThemeSchemaEditor ||
    isThemeCreator;
  const isSettings = location.pathname.startsWith('/settings');
  const showNavbar = !isFullScreen;
  const showSidebar = !isFullScreen && !isSettings && !isThemeCreator;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {showNavbar && <Navbar />}

      <div style={{ display: "flex", flexGrow: 1, overflow: "hidden", position: "relative" }}>
        {showSidebar && <Sidebar />}

        <main
          className={[
            "flex-1 overflow-y-auto overflow-x-hidden antialiased text-gray-900 transition-[margin-left] duration-300 ease-out",
            isFullScreen ? "bg-transparent p-0" : "bg-page-background-color p-4 sm:p-6 lg:p-8",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            marginTop: showNavbar ? `${NAVBAR_HEIGHT}px` : 0,
            marginLeft: showSidebar ? `${SIDEBAR_WIDTH}px` : 0,
            width: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH}px)` : "100%",
            height: showNavbar ? `calc(100vh - ${NAVBAR_HEIGHT}px)` : "100vh",
          }}
        >
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AdminStandardLayout />}>
            {/* Top-level */}
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/create" element={<CreateOrderPage />} />
            <Route path="/orders/abandoned-carts" element={<AbandonedCartsPage />} />
            <Route path="/orders/abandoned-carts/customer/:customerId" element={<AbandonedCartDetailsPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/products/:id/variants/:variantId" element={<ProductVariantDetailsPage />} />
            <Route path="/products/new" element={<NewProductPage />} />
            <Route path="/products/inventory" element={<ProductsInventoryPage />} />
            <Route path="/products/purchase-orders" element={<PurchaseOrdersListPage />} />
            <Route path="/products/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
            <Route path="/products/purchase-orders/:id/receive" element={<PurchaseOrderReceivePage />} />
            <Route path="/products/purchase-orders/new" element={<PurchaseOrderNewPage />} />
            <Route path="/products/collections" element={<ProductCollectionsPage />} />
            <Route path="/products/collections/:id" element={<ProductCollectionDetailsPage />} />
            <Route path="/products/collections/new" element={<ProductCollectionCreatePage />} />
            <Route path="/products/gift-cards" element={<GiftCardsPage />} />
            <Route path="/products/gift-cards/new" element={<NewGiftCardPage />} />
            <Route path="/products/gift-cards/:giftCardId" element={<GiftCardDetailPage />} />
            <Route path="/products/transfers" element={<TransfersPage />} />
            <Route path="/products/transfers/:id" element={<TransferDetailsPage />} />
            <Route path="/products/transfers/new" element={<NewTransferPage />} />
            <Route path="/products/transfers/:id/shipment/new" element={<ShipmentNewPage />} />
            <Route path="/products/transfers/:id/shipment/:shipmentId/receive" element={<ShipmentReceivePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/segments" element={<CustomersSegmentsPage />} />
            <Route path="/customers/segments/:id" element={<CustomerSegmentDetailsPage />} />
            <Route path="/customers/new" element={<NewCustomerPage />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/marketing/campaigns" element={<MarketingCampaignsPage />} />
            <Route path="/marketing/attribution" element={<MarketingAttributionPage />} />
            <Route path="/marketing/automations" element={<MarketingAutomationsPage />} />
            <Route path="/marketing/automations/templates" element={<AutomationTemplatesPage />} />
            <Route path="/marketing/automations/new" element={<AutomationNewPage />} />
            <Route path="/marketing/automations/create" element={<AutomationCreatePage />} />
            <Route path="/marketing/automations/:id" element={<AutomationDetailsPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/discounts/amount-off-products/:id" element={<DiscountDetailsPage />} />
            <Route path="/discounts/:id" element={<DiscountDetailsPage />} />
            <Route path="/discounts/pyxgety/:id" element={<BuyXGetYDetailsPage />} />
            <Route path="/discounts/amount-off-order/:id" element={<AmountOffOrderDetailsPage />} />
            <Route path="/discounts/free-shipping/:id" element={<FreeShippingDetailsPage />} />
            <Route path="/discounts/new/amount-off-products" element={<AmountOffProductsPage />} />
            <Route path="/discounts/new/buy-x-get-y" element={<BuyXGetYPage />} />
            <Route path="/discounts/new/amount-off-order" element={<AmountOffOrderPage />} />
            <Route path="/discounts/new/free-shipping" element={<FreeShippingPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/content/blog-posts" element={<ContentBlogPostsPage />} />
            <Route path="/content/blog-posts/new" element={<BlogPostCreatePage />} />
            <Route path="/content/files" element={<ContentFilesPage />} />
            <Route path="/content/menus" element={<ContentMenusPage />} />
            <Route path="/content/menus/new" element={<ContentMenuCreatePage />} />
            <Route path="/content/menus/:menuId" element={<ContentMenuEditPage />} />
            <Route path="/content/url-redirects" element={<ContentUrlRedirectsPage />} />
            <Route path="/content/metaobjects" element={<ContentMetaObjectsPage />} />
            <Route path="/online-store" element={<OnlineStorePage />} />
            <Route path="/online-store/themes" element={<AllThemes />} />
            <Route path="/online-store/pages" element={<OnlineStorePagesPage />} />
            <Route path="/online-store/preference" element={<OnlineStorePreferencePage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/markets/new" element={<MarketsNewPage />} />
            <Route path="/markets/catalogs" element={<MarketsCatalogsPage />} />
            <Route path="/markets/catalogs/new" element={<MarketsCatalogsNewPage />} />
            <Route path="/markets/catalogs/:id" element={<MarketsCatalogDetailsPage />} />
            <Route path="/markets/:id" element={<MarketDetailsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/tag-management" element={<TagManagement />} />
            <Route path="/tag-management/customer-tags" element={<CustomerTagsPage />} />
            <Route path="/tag-management/product-tags" element={<ProductTagsPage />} />
            <Route path="/tag-management/product-types" element={<ProductTypesPage />} />
            <Route path="/tag-management/transfer-tags" element={<TransferTagsPage />} />
            <Route path="/tag-management/purchase-order-tags" element={<PurchaseOrderTagsPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<SettingsIndex />} />
              <Route path="general" element={<GeneralSettingsPage />} />
              <Route path="general/metafields" element={<ShopMetafieldsPage />} />
              <Route path="general/activity" element={<StoreActivityLogPage />} />
              <Route path="general/branding" element={<BrandSettingsPage />} />
              <Route path="plan" element={<PlanSettingsPage />} />
              <Route path="plan/subscriptions" element={<PlanSubscriptionsPage />} />
              <Route path="subscribe/select-plan" element={<PlanSelectPage />} />
              <Route path="billing" element={<BillingSettingsPage />} />
              <Route path="billing/charges" element={<BillingChargesPage />} />
              <Route path="billing/upcoming" element={<BillingUpcomingPage />} />
              <Route path="billing/profile" element={<BillingProfilePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/roles" element={<RolesPage />} />
              <Route path="users/roles/:roleId" element={<RoleDetailsPage />} />
              <Route path="users/roles/new" element={<NewRolePage />} />
              <Route path="users/security" element={<UsersSecurityPage />} />
              <Route path="payments/transactions/:transactionId" element={<PaymentTransactionDetailsPage />} />
              <Route path="payments/transactions" element={<TransactionsPage />} />
              <Route path="payments" element={<PaymentsSettingsPage />} />
              <Route path="checkout" element={<CheckoutSettingsPage />} />
              <Route path="customer-accounts" element={<CustomerAccountsPage />} />
              <Route path="customer-accounts/authentication" element={<CustomerAccountsAuthenticationPage />} />
              <Route path="customer-accounts/authentication/google" element={<CustomerAccountsGooglePage />} />
              <Route path="customer-accounts/authentication/facebook" element={<CustomerAccountsFacebookPage />} />
              <Route path="shipping-and-delivery" element={<ShippingSettings />} />
              <Route path="shipping-and-delivery/local_deliveries/:localDeliveryId" element={<LocalDeliveriesPage />} />
              <Route path="shipping-and-delivery/local_deliveries/:localDeliveryId/locations/:locationId" element={<LocalDeliveryLocationDetailPage />} />
              <Route path="shipping-and-delivery/profiles/create" element={<ShippingProfileCreatePage />} />
              <Route path="shipping-and-delivery/profiles/:profileId" element={<ShippingProfileDetailsPage />} />
              <Route path="taxes-and-duties" element={<TaxesAndDutiesPage />} />
              <Route path="taxes-and-duties/:countryId" element={<IndiaTaxDetailsPage />} />
              <Route path="locations" element={<LocationsSettings />} />
              <Route path="locations/new" element={<NewLocationForm />} />
              <Route path="locations/:locationId" element={<LocationDetailsPage />} />
              <Route path="markets" element={<MarketSettingsPage />} />
              <Route path="apps-and-sales-channels" element={<SettingsPlaceholder title="Apps and Sales Channels" />} />
              <Route path="domains" element={<DomainsPage />} />
              <Route path="customer-events" element={<CustomerEventsPage />} />
              <Route path="customer-events/:pixelId" element={<CustomerEventPixelDetailsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="notifications/:categoryId/:categorySlug" element={<CustomerNotificationsPage />} />
              <Route path="notifications/:categoryId/:categorySlug/:optionId" element={<NotificationOptionDetailPage />} />
              <Route path="notifications/:categoryId/:categorySlug/:optionId/edit" element={<EditNotificationOptionPage />} />
              <Route path="notifications/webhooks" element={<WebhooksNotificationsPage />} />
              <Route path="metafields-and-metaobjects" element={<MetafeildsAndMetaObjectsSettingsPage />} />
              <Route path="languages" element={<LanguageSettingsPage />} />
              <Route path="customer-privacy" element={<CustomerPrivacyPage />} />
              <Route path="customer-privacy/dns" element={<DataSharingOptOutPage />} />
              <Route path="policies" element={<PoliciesSettings />} />
              <Route path="policies/manage-return-rules" element={<ManageReturnRules />} />
              <Route path="policies/manage-return-rules/new" element={<CreateReturnRules />} />
            </Route>

            {/* Orders subsections */}
            <Route path="/orders/drafts" element={<DraftsPage />} />
            

            {/* Themes Subsection */}
            <Route path="/themes/all-themes" element={<AllThemes />} />
            <Route
              path="/themes/create"
              element={
                <Suspense
                  fallback={
                    <div className="fixed inset-0 z-[1310] flex items-center justify-center bg-white">
                      <CreateThemePoweredByLoader />
                    </div>
                  }
                >
                  <CreateThemePage />
                </Suspense>
              }
            />
            <Route path="/themes/builder" element={<CustomThemeBuilder />} />
            <Route path="/themes/basic-elementor" element={<BasicElementor />} />
            <Route path="/themes/edit/:themeId" element={<ThemeEditor />} />
            <Route path="/themes/dev-editor" element={<StoreThemeConfigEditor />} />
            <Route path="/themes/:themeId/editor" element={<StoreThemeConfigEditor />} />
            <Route path="/themes/layout/:themeId" element={<ThemeLayoutEditor />} />
            <Route path="/themes/code/:themeId" element={<ThemeCodeEditor />} />
            <Route path="/themes/code-fullscreen/:themeId" element={<ThemeCodeEditorFullScreen />} />
            </Route>
          </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <InstalledThemesProvider>
      <AmountOffProductsDiscountProvider>
      <CategoryProvider>
      <PackagingProvider>
      <AwsUploadProvider>
      <StoreCloudStorageProvider>
      <CustomerTimelineProvider>
      <CustomerAddressProvider>
      <StoreProvider>
        <ThemesProvider>
          <CustomThemesProvider>
          <StoreCustomThemesProvider>
        <VendorProvider>
        <CollectionProvider>
        <StoreMenuProvider>
        <CustomerTagsProvider>
        <ProductTagsProvider>
        <CustomerProvider>
        <SocketProvider>
        <ProductProvider>
        <ProductVariantProvider>
        <CollectionEntriesProvider>
        <ProductTypeProvider>
        <GiftCardsProvider>
        <GiftCardTimelineProvider>
        <LocationsProvider>
        <LocalDeliverySettingsProvider>
        <LocalDeliveryLocationEntriesProvider>
        <InventoryLevelsProvider>
        <TransferTagsProvider>
        <TransferProvider>
        <TransferEntriesProvider>
        <ShipmentProvider>
        <PurchaseOrderTagsProvider>
        <PurchaseOrderProvider>
        <PurchaseOrderEntryProvider>
        <CustomerSegmentProvider>
        <CustomerSegmentsEntryProvider>
        <BuyXGetYDiscountProvider>
        <AmountOffOrderDiscountProvider>
        <FreeShippingDiscountProvider>
        <StoreSubdomainProvider>
        <AbandonedCartProvider>
        <StoreBillingAddressProvider>
        <StoreBrandingProvider>
        <StoreBannerProvider>
        <PaymentProvider>
        <GeneralSettingsProvider>
        <CustomerAccountSettingsProvider>
        <ReturnRulesProvider>
        <FinalSaleItemProvider>
        <StoreContactInfoProvider>
        <StoreNotificationEmailProvider>
        <StoreShippingPolicyProvider>
        <StoreTermsPolicyProvider>
        <StorePrivacyPolicyProvider>
        <StoreReturnRefundPolicyProvider>
        <CatalogProvider>
        <CurrencyProvider>
        <CatalogProductProvider>
        <CatalogMarketProvider>
        <MarketProvider>
        <MarketIncludesProvider>
        <CountryProvider>
        <StateProvider>
        <ShippingZoneProvider>
          <ShippingZoneRateProvider>
        <TriggerProvider>
        <ActionProvider>
        <AutomationFlowProvider>
        <PixelProvider>
        <AdminOrderProvider>
        <NotificationCategoriesProvider>
        <NotificationOptionsProvider>
        <NotificationOverridesProvider>
        <PermissionsProvider>
        <StoreRolesProvider>
        <StoreSecuritySettingsProvider>
        <CheckoutSettingsProvider>
        <ShippingProfileProvider>
        <ShippingProfileLocationSettingsProvider>
        <ShippingProfileProductVariantsProvider>
        <TaxRateDefaultProvider>
        <CountryTaxProvider>
        <TaxRateOverrideProvider>
        <ShippingOverrideProvider>
        <ProductOverrideProvider>
        <ProductOverrideEntryProvider>
        <CountryTaxOverrideProvider>
        <TaxAndDutiesGlobalSettingsProvider>
          <Router>
          <Toaster
            position="top-center"
            gutter={12}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#374151",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
              },
              success: {
                iconTheme: {
                  primary: "#191919",
                  secondary: "#fff",
                },
              },
            }}
          />
          <AdminApp />
        </Router>
        </TaxAndDutiesGlobalSettingsProvider>
        </CountryTaxOverrideProvider>
        </ProductOverrideEntryProvider>
        </ProductOverrideProvider>
        </ShippingOverrideProvider>
        </TaxRateOverrideProvider>
        </CountryTaxProvider>
        </TaxRateDefaultProvider>
        </ShippingProfileProductVariantsProvider>
        </ShippingProfileLocationSettingsProvider>
        </ShippingProfileProvider>
        </CheckoutSettingsProvider>
        </StoreSecuritySettingsProvider>
        </StoreRolesProvider>
        </PermissionsProvider>
        </NotificationOverridesProvider>
        </NotificationOptionsProvider>
        </NotificationCategoriesProvider>
        </AdminOrderProvider>
        </PixelProvider>
        </AutomationFlowProvider>
        </ActionProvider>
        </TriggerProvider>
          </ShippingZoneRateProvider>
        </ShippingZoneProvider>
        </StateProvider>
        </CountryProvider>
        </MarketIncludesProvider>
        </MarketProvider>
        </CatalogMarketProvider>
        </CatalogProductProvider>
        </CurrencyProvider>
        </CatalogProvider>
        </StoreReturnRefundPolicyProvider>
        </StorePrivacyPolicyProvider>
        </StoreTermsPolicyProvider>
        </StoreShippingPolicyProvider>
        </StoreNotificationEmailProvider>
        </StoreContactInfoProvider>
        </FinalSaleItemProvider>
        </ReturnRulesProvider>
        </CustomerAccountSettingsProvider>
        </GeneralSettingsProvider>
        </PaymentProvider>
        </StoreBannerProvider>
        </StoreBrandingProvider>
        </StoreBillingAddressProvider>
        </AbandonedCartProvider>
        </StoreSubdomainProvider>
        </FreeShippingDiscountProvider>
        </AmountOffOrderDiscountProvider>
        </BuyXGetYDiscountProvider>
        </CustomerSegmentsEntryProvider>
        </CustomerSegmentProvider>
        </PurchaseOrderEntryProvider>
        </PurchaseOrderProvider>
        </PurchaseOrderTagsProvider>
        </ShipmentProvider>
        </TransferEntriesProvider>
        </TransferProvider>
        </TransferTagsProvider>
        </InventoryLevelsProvider>
        </LocalDeliveryLocationEntriesProvider>
        </LocalDeliverySettingsProvider>
        </LocationsProvider>
        </GiftCardTimelineProvider>
        </GiftCardsProvider>
        </ProductTypeProvider>
        </CollectionEntriesProvider>
      </ProductVariantProvider>
      </ProductProvider>
        </SocketProvider>
        </CustomerProvider>
        </ProductTagsProvider>
        </CustomerTagsProvider>
        </StoreMenuProvider>
        </CollectionProvider>
        </VendorProvider>
        </StoreCustomThemesProvider>
        </CustomThemesProvider>
        </ThemesProvider>
      </StoreProvider>
      
      </CustomerAddressProvider>
      </CustomerTimelineProvider>
      </StoreCloudStorageProvider>
      </AwsUploadProvider>
      </PackagingProvider>
      </CategoryProvider>
      </AmountOffProductsDiscountProvider>
      </InstalledThemesProvider>
    </UserProvider>
  );
};

export default App;
