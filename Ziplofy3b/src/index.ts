// @ts-nocheck
// Load env first (uses .env.development or .env.production based on DOTENV_CONFIG_PATH)
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { connectDB } from './config/database.config';
import { errorMiddleware } from './middlewares/error.middleware';
import { socketAuthMiddleware } from './middlewares/socket-auth.middleware';
import amountOffProductsDiscountRouter from './routes/amount-off-products-discount.route';
import { assignedSupportDeveloperRouter } from './routes/assigned-support-developer.route';
import { authRouter } from './routes/auth.route';
import awsRouter from './routes/aws.route';
import { categoryRouter } from './routes/category.route';
import { clientThemeFilesRouter } from './routes/client-theme-files.route';
import { clientThemeRouter } from './routes/client-theme.route';
import { clientUserStatsRouter } from './routes/client-user-stats.route';
import { clientRouter } from './routes/client.route';
import { collectionEntryRouter } from './routes/collection-entry.route';
import { collectionsRouter } from './routes/collections.route';
import { storeMenuRouter } from './routes/store-menu.route';
import { customerAddressRouter } from './routes/customer-address.route';
import { customerTagsRouter } from './routes/customer-tags.route';
import { customerTimelineRouter } from './routes/customer-timeline.route';
import { customerRouter } from './routes/customer.route';
import { giftCardTimelineRouter } from './routes/gift-card-timeline.route';
import { giftCardRouter } from './routes/gift-card.route';
import { inventoryLevelRouter } from './routes/inventory-level.route';
import { locationRouter } from './routes/location.route';
import { orderRouter } from './routes/order.route';
import { packagingRouter } from './routes/packaging.route';
import { productTagsRouter } from './routes/product-tags.route';

import { productTypeRouter } from './routes/product-type.route';
import { productVariantRouter } from './routes/product-variant.route';
import { productRouter } from './routes/product.route';
import { purchaseOrderEntryRouter } from './routes/purchase-order-entry.route';
import { purchaseOrderTagRouter } from './routes/purchase-order-tag.route';
import { purchaseOrderRouter } from './routes/purchase-order.route';
import { requirementFormRouter } from './routes/requirement-form.route';
import { roleRouter } from './routes/role.route';
import { shipmentRouter } from './routes/shipment.route';
import storeBillingAddressRouter from './routes/store-billing-address.route';
import { storeRouter } from './routes/store.route';
import { superAdminRouter } from './routes/super-admin.route';
import { supportDeveloperRouter } from './routes/support-developer.route';
import { tagsRouter } from './routes/tags.route';
import { themeRouter } from './routes/theme.route';
import { storeThemeConfigRouter } from './routes/store-theme-config.route';
import { transferEntryRouter } from './routes/transfer-entry.route';
import { transferTagsRouter } from './routes/transfer-tags.route';
import { transferTimelineRouter } from './routes/transfer-timeline.route';
import { transferRouter } from './routes/transfer.route';
import { userRouter } from './routes/user.route';
import { vendorRouter } from './routes/vendor.route';
import { registerSocketHandlers } from './socket';
import './utils/env.utils';
import { env, loadedEnvFile, validateEnv } from './utils/env.utils';
// Ensure Mongoose registers dependent models used via refs (e.g., Supplier)
import { getAllThemesPublic } from './controllers/theme.controller';
import { getStoreTheme } from './controllers/storefront-theme-pack.controller';
import './models/supplier/supplier.model';
import actionRouter from './routes/action.route';
import { activityLogRouter } from './routes/activity-log.route';
import { amountOffOrderDiscountRouter } from './routes/amount-off-order-discount.route';
import { buyXGetYDiscountRouter } from './routes/buy-x-get-y-discount.route';
import { cartRouter } from './routes/cart.route';
import catalogMarketRouter from './routes/catalog-market.route';
import catalogProductVariantRouter from './routes/catalog-product-variant.route';
import catalogProductRouter from './routes/catalog-product.route';
import catalogRouter from './routes/catalog.route';
import { countryTaxOverrideRouter } from './routes/country-tax-override.route';
import { countryTaxRouter } from './routes/country-tax.route';
import countryRouter from './routes/country.route';
import currencyRouter from './routes/currency.route';
import { customThemeRouter } from './routes/custom-theme.route';
import { customerSegmentEntryRouter } from './routes/customer-segment-entry.route';
import { customerSegmentRouter } from './routes/customer-segment.route';
import finalSaleItemRouter from './routes/final-sale-item.route';
import { freeShippingDiscountRouter } from './routes/free-shipping-discount.route';
import generalSettingsRouter from './routes/general-settings.route';
import { installedThemesRouter } from './routes/installed-themes.route';
import { loginLogRouter } from './routes/login-log.route';
import marketIncludesRouter from './routes/market-includes.route';
import marketRouter from './routes/market.route';
import notificationCategoryRouter from './routes/notification-category.route';
import notificationOptionRouter from './routes/notification-option.route';
import notificationOverrideRouter from './routes/notification-override.route';
import permissionRouter from './routes/permission.route';
import pixelRouter from './routes/pixel.route';
import { productOffersRouter } from './routes/product-offers.route';
import { productOverrideEntryRouter } from './routes/product-override-entry.route';
import { productOverrideRouter } from './routes/product-override.route';
import returnRulesRouter from './routes/return-rules.route';
import { shippingOverrideRouter } from './routes/shipping-override.route';
import shippingProfileLocationSettingsRouter from './routes/shipping-profile-location-settings.route';
import shippingProfileProductVariantsEntryRouter from './routes/shipping-profile-product-variants-entry.route';
import shippingProfileRouter from './routes/shipping-profile.route';
import shippingZoneRateRouter from './routes/shipping-zone-rate.route';
import shippingZoneRouter from './routes/shipping-zone.route';
import stateRouter from './routes/state.route';
import storeBannerRouter from './routes/store-banner.route';
import storeCustomThemeRouter from './routes/store-custom-theme.route';
import storeCloudStorageRouter from './routes/store-cloud-storage.route';
import paymentRouter from './routes/payment.route';
import storeBrandingRouter from './routes/store-branding.route';
import storeContactInfoRouter from './routes/store-contact-info.route';
import { storeNotificationEmailRouter } from './routes/store-notification-email.route';
import storePrivacyPolicyRouter from './routes/store-privacy-policy.route';
import storeReturnRefundPolicyRouter from './routes/store-return-refund-policy.route';
import storeRoleRouter from './routes/store-role.route';
import storeSecuritySettingsRouter from './routes/store-security-settings.route';
import storeShippingPolicyRouter from './routes/store-shipping-policy.route';
import { storeSubdomainRouter } from './routes/store-subdomian.route';
import storeTermsPolicyRouter from './routes/store-terms-policy.route';
import { storefrontAuthRouter } from './routes/storefront-auth.route';
import { storefrontRouter } from './routes/storefront.route';
import { storefrontSitemapRouter } from './routes/storefront/storefront-sitemap.route';
import { getStorefrontSitemap } from './controllers/storefront-sitemap.controller';
import { storefrontAmountOffOrderRouter } from './routes/storefront/amount-off-order.route';
import { storefrontAmountOffProductRouter } from './routes/storefront/amount-off-product.route';
import { storefrontBuyXGetYRouter } from './routes/storefront/buy-x-get-y.route';
import { storefrontFreeShippingRouter } from './routes/storefront/free-shipping.route';
import { storefrontOrderRouter } from './routes/storefront/order.route';
import { storeFrontCollectionRouter } from './routes/storefront/storefront-collection.route';
import { storefrontCustomerRouter } from './routes/storefront/storefront-customer.route';
import { taxAndDutiesGlobalSettingsRouter } from './routes/tax-and-duties-global-settings.route';
import { taxRateDefaultRouter } from './routes/tax-rate-default.route';
import { taxRateOverrideRouter } from './routes/tax-rate-override.route';
import triggerRouter from './routes/trigger.route';

import automationFlowRouter from './routes/automation-flow.route';
import checkoutSettingsRoute from './routes/checkout-settings.route';
import customerAccountSettingsRouter from './routes/customer-account-settings.route';
import localDeliveryLocationEntryRouter from './routes/local-delivery-location-entry.route';
import localDeliverySettingsRouter from './routes/local-delivery-settings.route';
// import { closeEmailQueue } from './services/bull-mq/queues/email.queue';
// import { startEmailWorker } from './services/bull-mq/workers/email.worker';

// Validate environment variables
validateEnv();

// Connect to database
connectDB();

// Map to store userId to socketId mapping
export const userIdToSocketIdMap: Map<string, string> = new Map();

const app = express();
const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.allowedOrigins,
    credentials: true,
  }
});

// Export io instance to make it globally accessible
export { io };

const PORT = Number(env.PORT);

// Middleware
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route middlewares
app.use("/api/stores", storeRouter);
app.use("/api/auth", authRouter);
app.use("/api/aws", awsRouter);
app.use("/api/user", userRouter);
app.use("/api/themes", themeRouter);
app.use("/api/store-theme-config", storeThemeConfigRouter);
app.use("/api/clients", clientRouter);
app.use("/api/client-user-stats", clientUserStatsRouter);
app.use("/api/roles", roleRouter);
app.use("/api/requirement-forms", requirementFormRouter);
app.use("/api/support-developer", supportDeveloperRouter);
app.use("/api/super-admin", superAdminRouter);
app.use("/api/assigned-support-developer", assignedSupportDeveloperRouter);
app.use("/api/customers", customerRouter);
app.use("/api/customer-timeline", customerTimelineRouter);
app.use("/api/orders", orderRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/store-billing-address", storeBillingAddressRouter);
app.use("/api/customer-address", customerAddressRouter);
app.use("/api/customer-tags", customerTagsRouter);
app.use("/api/product-tags", productTagsRouter);
app.use("/api/transfer-tags", transferTagsRouter);
app.use("/api/product-types", productTypeRouter);
app.use("/api/products", productRouter);
app.use("/api/product-variants", productVariantRouter);
app.use("/api/purchase-orders", purchaseOrderRouter);
app.use("/api/purchase-order-entries", purchaseOrderEntryRouter);
app.use("/api/purchase-order-tags", purchaseOrderTagRouter);
app.use("/api/transfers", transferRouter);
app.use("/api/transfer-entries", transferEntryRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/store-menus", storeMenuRouter);
app.use("/api/storefront/collections", storeFrontCollectionRouter);
app.use("/api/collection-entries", collectionEntryRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/packaging", packagingRouter);
app.use("/api/gift-cards", giftCardRouter);
app.use("/api/gift-card-timeline", giftCardTimelineRouter);
app.use("/api/inventory-levels", inventoryLevelRouter);
app.use("/api/locations", locationRouter);
app.use("/api/shipments", shipmentRouter);
app.use("/api/transfer-timelines", transferTimelineRouter);
app.use("/api/customer-segments", customerSegmentRouter); 
app.use("/api/customer-segment-entries", customerSegmentEntryRouter);
app.use("/api/amount-off-products-discounts", amountOffProductsDiscountRouter);
app.use("/api/buy-x-get-y-discounts", buyXGetYDiscountRouter);
app.use("/api/amount-off-order-discounts", amountOffOrderDiscountRouter);
app.use("/api/free-shipping-discounts", freeShippingDiscountRouter);
app.use("/api/product-offers", productOffersRouter);
app.use("/api/installed-themes", installedThemesRouter);
app.use("/api/store-subdomain", storeSubdomainRouter);
app.use("/api/storefront/auth", storefrontAuthRouter);
app.use("/api/storefront/cart", cartRouter);
app.use("/api/storefront/discounts/amount-off-order", storefrontAmountOffOrderRouter);
app.use("/api/storefront/discounts/amount-off-product", storefrontAmountOffProductRouter);
app.use("/api/storefront/discounts/free-shipping", storefrontFreeShippingRouter);
app.use("/api/storefront/discounts/buy-x-get-y", storefrontBuyXGetYRouter);
app.use("/api/storefront/customer", storefrontCustomerRouter);
app.use("/api/storefront/orders", storefrontOrderRouter);
app.use("/api/return-rules", returnRulesRouter);
app.use("/api/final-sale-items", finalSaleItemRouter);
app.use("/api/store-contact-info", storeContactInfoRouter);
app.use("/api/store-notification-email", storeNotificationEmailRouter);
app.use("/api/store-shipping-policy", storeShippingPolicyRouter);
app.use("/api/store-terms-policy", storeTermsPolicyRouter);
app.use("/api/store-return-refund-policy", storeReturnRefundPolicyRouter);
app.use("/api/store-branding", storeBrandingRouter);
app.use("/api/store-banners", storeBannerRouter);
app.use("/api/store-custom-themes", storeCustomThemeRouter);
app.use("/api/store/cloud-storage", storeCloudStorageRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/local-delivery-settings", localDeliverySettingsRouter);
app.use("/api/local-delivery-location-entries", localDeliveryLocationEntryRouter);
app.use("/api/general-settings", generalSettingsRouter);
app.use("/api/pixels", pixelRouter);
app.use("/api/notification-categories", notificationCategoryRouter);
app.use("/api/notification-options", notificationOptionRouter);
app.use("/api/notification-overrides", notificationOverrideRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/store-roles", storeRoleRouter);
app.use("/api/store-security-settings", storeSecuritySettingsRouter);
app.use("/api/markets", marketRouter);
app.use("/api/store-privacy-policy", storePrivacyPolicyRouter);
app.use("/api/catalogs", catalogRouter);
app.use("/api/currencies", currencyRouter);
app.use("/api/catalog-products", catalogProductRouter);
app.use("/api/catalog-product-variants", catalogProductVariantRouter);
app.use("/api/catalog-markets", catalogMarketRouter);
app.use("/api/market-includes", marketIncludesRouter);
app.use("/api/countries", countryRouter);
app.use("/api/states", stateRouter);
app.use("/api/tax-rates", taxRateOverrideRouter);
app.use("/api/shipping-overrides", shippingOverrideRouter);
app.use("/api/product-overrides", productOverrideRouter);
app.use("/api/product-override-entries", productOverrideEntryRouter);
app.use("/api/tax-defaults", taxRateDefaultRouter);
app.use("/api/country-taxes", countryTaxRouter);
app.use("/api/country-tax-overrides", countryTaxOverrideRouter);
app.use("/api/tax-and-duties-global-settings", taxAndDutiesGlobalSettingsRouter);
app.use("/api/shipping-zones", shippingZoneRouter);
app.use("/api/shipping-zone-rates", shippingZoneRateRouter);
app.use("/api/shipping-profiles", shippingProfileRouter);
app.use("/api/shipping-profile-product-variants", shippingProfileProductVariantsEntryRouter);
app.use("/api/shipping-profile-location-settings", shippingProfileLocationSettingsRouter);
app.use("/api/triggers", triggerRouter);
app.use("/api/actions", actionRouter);
app.use("/api/automation-flows", automationFlowRouter);
app.use("/api/login-logs", loginLogRouter);
app.use("/api/activity-logs", activityLogRouter);
app.use("/api/client", clientThemeRouter);
app.use("/api/client/theme-files", clientThemeFilesRouter);
// app.use("/api/theme-install", themeInstallRouter);
app.use('/api/checkout-settings', checkoutSettingsRoute);
app.use('/api/customer-account-settings', customerAccountSettingsRouter);
app.use("/api/custom-themes", customThemeRouter);
app.use("/api/all-themes", getAllThemesPublic);
app.use("/api/storefront", storefrontSitemapRouter);
app.use("/api/storefront", storefrontRouter);
app.get('/sitemap.xml', getStorefrontSitemap);
// Routes
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Ziplofy3b Server is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok  - ci cd updated',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/get-store-theme', getStoreTheme);


io.use(socketAuthMiddleware);

// Socket.IO connection handling
registerSocketHandlers(io);

// Error handling middleware (must be after all routes)
app.use(errorMiddleware);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${env.NODE_ENV} mode (using ${loadedEnvFile})`);
});

// Start BullMQ workers (temporarily disabled while Redis is off)
// const emailWorker = startEmailWorker();

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    // await emailWorker.close();
    // await closeEmailQueue();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    // Force exit if not closed within timeout
    setTimeout(() => process.exit(1), 10_000).unref();
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
};

['SIGTERM', 'SIGINT'].forEach(sig => {
  process.on(sig as NodeJS.Signals, () => shutdown(sig));
});
