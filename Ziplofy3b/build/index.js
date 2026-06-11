"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.userIdToSocketIdMap = void 0;
// @ts-nocheck
// Load env first (uses .env.development or .env.production based on DOTENV_CONFIG_PATH)
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const database_config_1 = require("./config/database.config");
const error_middleware_1 = require("./middlewares/error.middleware");
const socket_auth_middleware_1 = require("./middlewares/socket-auth.middleware");
const amount_off_products_discount_route_1 = __importDefault(require("./routes/amount-off-products-discount.route"));
const assigned_support_developer_route_1 = require("./routes/assigned-support-developer.route");
const auth_route_1 = require("./routes/auth.route");
const aws_route_1 = __importDefault(require("./routes/aws.route"));
const category_route_1 = require("./routes/category.route");
const client_theme_files_route_1 = require("./routes/client-theme-files.route");
const client_theme_route_1 = require("./routes/client-theme.route");
const client_user_stats_route_1 = require("./routes/client-user-stats.route");
const client_route_1 = require("./routes/client.route");
const collection_entry_route_1 = require("./routes/collection-entry.route");
const collections_route_1 = require("./routes/collections.route");
const store_menu_route_1 = require("./routes/store-menu.route");
const customer_address_route_1 = require("./routes/customer-address.route");
const customer_tags_route_1 = require("./routes/customer-tags.route");
const customer_timeline_route_1 = require("./routes/customer-timeline.route");
const customer_route_1 = require("./routes/customer.route");
const gift_card_timeline_route_1 = require("./routes/gift-card-timeline.route");
const gift_card_route_1 = require("./routes/gift-card.route");
const inventory_level_route_1 = require("./routes/inventory-level.route");
const location_route_1 = require("./routes/location.route");
const order_route_1 = require("./routes/order.route");
const packaging_route_1 = require("./routes/packaging.route");
const product_tags_route_1 = require("./routes/product-tags.route");
const product_type_route_1 = require("./routes/product-type.route");
const product_variant_route_1 = require("./routes/product-variant.route");
const product_route_1 = require("./routes/product.route");
const purchase_order_entry_route_1 = require("./routes/purchase-order-entry.route");
const purchase_order_tag_route_1 = require("./routes/purchase-order-tag.route");
const purchase_order_route_1 = require("./routes/purchase-order.route");
const requirement_form_route_1 = require("./routes/requirement-form.route");
const role_route_1 = require("./routes/role.route");
const shipment_route_1 = require("./routes/shipment.route");
const store_billing_address_route_1 = __importDefault(require("./routes/store-billing-address.route"));
const store_route_1 = require("./routes/store.route");
const super_admin_route_1 = require("./routes/super-admin.route");
const support_developer_route_1 = require("./routes/support-developer.route");
const tags_route_1 = require("./routes/tags.route");
const theme_route_1 = require("./routes/theme.route");
const store_theme_config_route_1 = require("./routes/store-theme-config.route");
const transfer_entry_route_1 = require("./routes/transfer-entry.route");
const transfer_tags_route_1 = require("./routes/transfer-tags.route");
const transfer_timeline_route_1 = require("./routes/transfer-timeline.route");
const transfer_route_1 = require("./routes/transfer.route");
const user_route_1 = require("./routes/user.route");
const vendor_route_1 = require("./routes/vendor.route");
const socket_1 = require("./socket");
require("./utils/env.utils");
const env_utils_1 = require("./utils/env.utils");
// Ensure Mongoose registers dependent models used via refs (e.g., Supplier)
const theme_controller_1 = require("./controllers/theme.controller");
const storefront_theme_pack_controller_1 = require("./controllers/storefront-theme-pack.controller");
require("./models/supplier/supplier.model");
const action_route_1 = __importDefault(require("./routes/action.route"));
const activity_log_route_1 = require("./routes/activity-log.route");
const amount_off_order_discount_route_1 = require("./routes/amount-off-order-discount.route");
const buy_x_get_y_discount_route_1 = require("./routes/buy-x-get-y-discount.route");
const cart_route_1 = require("./routes/cart.route");
const catalog_market_route_1 = __importDefault(require("./routes/catalog-market.route"));
const catalog_product_variant_route_1 = __importDefault(require("./routes/catalog-product-variant.route"));
const catalog_product_route_1 = __importDefault(require("./routes/catalog-product.route"));
const catalog_route_1 = __importDefault(require("./routes/catalog.route"));
const country_tax_override_route_1 = require("./routes/country-tax-override.route");
const country_tax_route_1 = require("./routes/country-tax.route");
const country_route_1 = __importDefault(require("./routes/country.route"));
const currency_route_1 = __importDefault(require("./routes/currency.route"));
const custom_theme_route_1 = require("./routes/custom-theme.route");
const customer_segment_entry_route_1 = require("./routes/customer-segment-entry.route");
const customer_segment_route_1 = require("./routes/customer-segment.route");
const final_sale_item_route_1 = __importDefault(require("./routes/final-sale-item.route"));
const free_shipping_discount_route_1 = require("./routes/free-shipping-discount.route");
const general_settings_route_1 = __importDefault(require("./routes/general-settings.route"));
const installed_themes_route_1 = require("./routes/installed-themes.route");
const login_log_route_1 = require("./routes/login-log.route");
const market_includes_route_1 = __importDefault(require("./routes/market-includes.route"));
const market_route_1 = __importDefault(require("./routes/market.route"));
const notification_category_route_1 = __importDefault(require("./routes/notification-category.route"));
const notification_option_route_1 = __importDefault(require("./routes/notification-option.route"));
const notification_override_route_1 = __importDefault(require("./routes/notification-override.route"));
const permission_route_1 = __importDefault(require("./routes/permission.route"));
const pixel_route_1 = __importDefault(require("./routes/pixel.route"));
const product_offers_route_1 = require("./routes/product-offers.route");
const product_override_entry_route_1 = require("./routes/product-override-entry.route");
const product_override_route_1 = require("./routes/product-override.route");
const return_rules_route_1 = __importDefault(require("./routes/return-rules.route"));
const shipping_override_route_1 = require("./routes/shipping-override.route");
const shipping_profile_location_settings_route_1 = __importDefault(require("./routes/shipping-profile-location-settings.route"));
const shipping_profile_product_variants_entry_route_1 = __importDefault(require("./routes/shipping-profile-product-variants-entry.route"));
const shipping_profile_route_1 = __importDefault(require("./routes/shipping-profile.route"));
const shipping_zone_rate_route_1 = __importDefault(require("./routes/shipping-zone-rate.route"));
const shipping_zone_route_1 = __importDefault(require("./routes/shipping-zone.route"));
const state_route_1 = __importDefault(require("./routes/state.route"));
const store_banner_route_1 = __importDefault(require("./routes/store-banner.route"));
const store_custom_theme_route_1 = __importDefault(require("./routes/store-custom-theme.route"));
const store_cloud_storage_route_1 = __importDefault(require("./routes/store-cloud-storage.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const store_branding_route_1 = __importDefault(require("./routes/store-branding.route"));
const store_contact_info_route_1 = __importDefault(require("./routes/store-contact-info.route"));
const store_notification_email_route_1 = require("./routes/store-notification-email.route");
const store_privacy_policy_route_1 = __importDefault(require("./routes/store-privacy-policy.route"));
const store_return_refund_policy_route_1 = __importDefault(require("./routes/store-return-refund-policy.route"));
const store_role_route_1 = __importDefault(require("./routes/store-role.route"));
const store_security_settings_route_1 = __importDefault(require("./routes/store-security-settings.route"));
const store_shipping_policy_route_1 = __importDefault(require("./routes/store-shipping-policy.route"));
const store_subdomian_route_1 = require("./routes/store-subdomian.route");
const store_terms_policy_route_1 = __importDefault(require("./routes/store-terms-policy.route"));
const storefront_auth_route_1 = require("./routes/storefront-auth.route");
const storefront_route_1 = require("./routes/storefront.route");
const storefront_sitemap_route_1 = require("./routes/storefront/storefront-sitemap.route");
const storefront_sitemap_controller_1 = require("./controllers/storefront-sitemap.controller");
const amount_off_order_route_1 = require("./routes/storefront/amount-off-order.route");
const amount_off_product_route_1 = require("./routes/storefront/amount-off-product.route");
const buy_x_get_y_route_1 = require("./routes/storefront/buy-x-get-y.route");
const free_shipping_route_1 = require("./routes/storefront/free-shipping.route");
const order_route_2 = require("./routes/storefront/order.route");
const storefront_collection_route_1 = require("./routes/storefront/storefront-collection.route");
const storefront_customer_route_1 = require("./routes/storefront/storefront-customer.route");
const tax_and_duties_global_settings_route_1 = require("./routes/tax-and-duties-global-settings.route");
const tax_rate_default_route_1 = require("./routes/tax-rate-default.route");
const tax_rate_override_route_1 = require("./routes/tax-rate-override.route");
const trigger_route_1 = __importDefault(require("./routes/trigger.route"));
const automation_flow_route_1 = __importDefault(require("./routes/automation-flow.route"));
const checkout_settings_route_1 = __importDefault(require("./routes/checkout-settings.route"));
const customer_account_settings_route_1 = __importDefault(require("./routes/customer-account-settings.route"));
const local_delivery_location_entry_route_1 = __importDefault(require("./routes/local-delivery-location-entry.route"));
const local_delivery_settings_route_1 = __importDefault(require("./routes/local-delivery-settings.route"));
// import { closeEmailQueue } from './services/bull-mq/queues/email.queue';
// import { startEmailWorker } from './services/bull-mq/workers/email.worker';
// Validate environment variables
(0, env_utils_1.validateEnv)();
// Connect to database
(0, database_config_1.connectDB)();
// Map to store userId to socketId mapping
exports.userIdToSocketIdMap = new Map();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: config_1.config.allowedOrigins,
        credentials: true,
    }
});
exports.io = io;
const PORT = Number(env_utils_1.env.PORT);
// Middleware
app.use((0, cors_1.default)({
    origin: config_1.config.allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// route middlewares
app.use("/api/stores", store_route_1.storeRouter);
app.use("/api/auth", auth_route_1.authRouter);
app.use("/api/aws", aws_route_1.default);
app.use("/api/user", user_route_1.userRouter);
app.use("/api/themes", theme_route_1.themeRouter);
app.use("/api/store-theme-config", store_theme_config_route_1.storeThemeConfigRouter);
app.use("/api/clients", client_route_1.clientRouter);
app.use("/api/client-user-stats", client_user_stats_route_1.clientUserStatsRouter);
app.use("/api/roles", role_route_1.roleRouter);
app.use("/api/requirement-forms", requirement_form_route_1.requirementFormRouter);
app.use("/api/support-developer", support_developer_route_1.supportDeveloperRouter);
app.use("/api/super-admin", super_admin_route_1.superAdminRouter);
app.use("/api/assigned-support-developer", assigned_support_developer_route_1.assignedSupportDeveloperRouter);
app.use("/api/customers", customer_route_1.customerRouter);
app.use("/api/customer-timeline", customer_timeline_route_1.customerTimelineRouter);
app.use("/api/orders", order_route_1.orderRouter);
app.use("/api/tags", tags_route_1.tagsRouter);
app.use("/api/vendors", vendor_route_1.vendorRouter);
app.use("/api/store-billing-address", store_billing_address_route_1.default);
app.use("/api/customer-address", customer_address_route_1.customerAddressRouter);
app.use("/api/customer-tags", customer_tags_route_1.customerTagsRouter);
app.use("/api/product-tags", product_tags_route_1.productTagsRouter);
app.use("/api/transfer-tags", transfer_tags_route_1.transferTagsRouter);
app.use("/api/product-types", product_type_route_1.productTypeRouter);
app.use("/api/products", product_route_1.productRouter);
app.use("/api/product-variants", product_variant_route_1.productVariantRouter);
app.use("/api/purchase-orders", purchase_order_route_1.purchaseOrderRouter);
app.use("/api/purchase-order-entries", purchase_order_entry_route_1.purchaseOrderEntryRouter);
app.use("/api/purchase-order-tags", purchase_order_tag_route_1.purchaseOrderTagRouter);
app.use("/api/transfers", transfer_route_1.transferRouter);
app.use("/api/transfer-entries", transfer_entry_route_1.transferEntryRouter);
app.use("/api/collections", collections_route_1.collectionsRouter);
app.use("/api/store-menus", store_menu_route_1.storeMenuRouter);
app.use("/api/storefront/collections", storefront_collection_route_1.storeFrontCollectionRouter);
app.use("/api/collection-entries", collection_entry_route_1.collectionEntryRouter);
app.use("/api/categories", category_route_1.categoryRouter);
app.use("/api/packaging", packaging_route_1.packagingRouter);
app.use("/api/gift-cards", gift_card_route_1.giftCardRouter);
app.use("/api/gift-card-timeline", gift_card_timeline_route_1.giftCardTimelineRouter);
app.use("/api/inventory-levels", inventory_level_route_1.inventoryLevelRouter);
app.use("/api/locations", location_route_1.locationRouter);
app.use("/api/shipments", shipment_route_1.shipmentRouter);
app.use("/api/transfer-timelines", transfer_timeline_route_1.transferTimelineRouter);
app.use("/api/customer-segments", customer_segment_route_1.customerSegmentRouter);
app.use("/api/customer-segment-entries", customer_segment_entry_route_1.customerSegmentEntryRouter);
app.use("/api/amount-off-products-discounts", amount_off_products_discount_route_1.default);
app.use("/api/buy-x-get-y-discounts", buy_x_get_y_discount_route_1.buyXGetYDiscountRouter);
app.use("/api/amount-off-order-discounts", amount_off_order_discount_route_1.amountOffOrderDiscountRouter);
app.use("/api/free-shipping-discounts", free_shipping_discount_route_1.freeShippingDiscountRouter);
app.use("/api/product-offers", product_offers_route_1.productOffersRouter);
app.use("/api/installed-themes", installed_themes_route_1.installedThemesRouter);
app.use("/api/store-subdomain", store_subdomian_route_1.storeSubdomainRouter);
app.use("/api/storefront/auth", storefront_auth_route_1.storefrontAuthRouter);
app.use("/api/storefront/cart", cart_route_1.cartRouter);
app.use("/api/storefront/discounts/amount-off-order", amount_off_order_route_1.storefrontAmountOffOrderRouter);
app.use("/api/storefront/discounts/amount-off-product", amount_off_product_route_1.storefrontAmountOffProductRouter);
app.use("/api/storefront/discounts/free-shipping", free_shipping_route_1.storefrontFreeShippingRouter);
app.use("/api/storefront/discounts/buy-x-get-y", buy_x_get_y_route_1.storefrontBuyXGetYRouter);
app.use("/api/storefront/customer", storefront_customer_route_1.storefrontCustomerRouter);
app.use("/api/storefront/orders", order_route_2.storefrontOrderRouter);
app.use("/api/return-rules", return_rules_route_1.default);
app.use("/api/final-sale-items", final_sale_item_route_1.default);
app.use("/api/store-contact-info", store_contact_info_route_1.default);
app.use("/api/store-notification-email", store_notification_email_route_1.storeNotificationEmailRouter);
app.use("/api/store-shipping-policy", store_shipping_policy_route_1.default);
app.use("/api/store-terms-policy", store_terms_policy_route_1.default);
app.use("/api/store-return-refund-policy", store_return_refund_policy_route_1.default);
app.use("/api/store-branding", store_branding_route_1.default);
app.use("/api/store-banners", store_banner_route_1.default);
app.use("/api/store-custom-themes", store_custom_theme_route_1.default);
app.use("/api/store/cloud-storage", store_cloud_storage_route_1.default);
app.use("/api/payments", payment_route_1.default);
app.use("/api/local-delivery-settings", local_delivery_settings_route_1.default);
app.use("/api/local-delivery-location-entries", local_delivery_location_entry_route_1.default);
app.use("/api/general-settings", general_settings_route_1.default);
app.use("/api/pixels", pixel_route_1.default);
app.use("/api/notification-categories", notification_category_route_1.default);
app.use("/api/notification-options", notification_option_route_1.default);
app.use("/api/notification-overrides", notification_override_route_1.default);
app.use("/api/permissions", permission_route_1.default);
app.use("/api/store-roles", store_role_route_1.default);
app.use("/api/store-security-settings", store_security_settings_route_1.default);
app.use("/api/markets", market_route_1.default);
app.use("/api/store-privacy-policy", store_privacy_policy_route_1.default);
app.use("/api/catalogs", catalog_route_1.default);
app.use("/api/currencies", currency_route_1.default);
app.use("/api/catalog-products", catalog_product_route_1.default);
app.use("/api/catalog-product-variants", catalog_product_variant_route_1.default);
app.use("/api/catalog-markets", catalog_market_route_1.default);
app.use("/api/market-includes", market_includes_route_1.default);
app.use("/api/countries", country_route_1.default);
app.use("/api/states", state_route_1.default);
app.use("/api/tax-rates", tax_rate_override_route_1.taxRateOverrideRouter);
app.use("/api/shipping-overrides", shipping_override_route_1.shippingOverrideRouter);
app.use("/api/product-overrides", product_override_route_1.productOverrideRouter);
app.use("/api/product-override-entries", product_override_entry_route_1.productOverrideEntryRouter);
app.use("/api/tax-defaults", tax_rate_default_route_1.taxRateDefaultRouter);
app.use("/api/country-taxes", country_tax_route_1.countryTaxRouter);
app.use("/api/country-tax-overrides", country_tax_override_route_1.countryTaxOverrideRouter);
app.use("/api/tax-and-duties-global-settings", tax_and_duties_global_settings_route_1.taxAndDutiesGlobalSettingsRouter);
app.use("/api/shipping-zones", shipping_zone_route_1.default);
app.use("/api/shipping-zone-rates", shipping_zone_rate_route_1.default);
app.use("/api/shipping-profiles", shipping_profile_route_1.default);
app.use("/api/shipping-profile-product-variants", shipping_profile_product_variants_entry_route_1.default);
app.use("/api/shipping-profile-location-settings", shipping_profile_location_settings_route_1.default);
app.use("/api/triggers", trigger_route_1.default);
app.use("/api/actions", action_route_1.default);
app.use("/api/automation-flows", automation_flow_route_1.default);
app.use("/api/login-logs", login_log_route_1.loginLogRouter);
app.use("/api/activity-logs", activity_log_route_1.activityLogRouter);
app.use("/api/client", client_theme_route_1.clientThemeRouter);
app.use("/api/client/theme-files", client_theme_files_route_1.clientThemeFilesRouter);
// app.use("/api/theme-install", themeInstallRouter);
app.use('/api/checkout-settings', checkout_settings_route_1.default);
app.use('/api/customer-account-settings', customer_account_settings_route_1.default);
app.use("/api/custom-themes", custom_theme_route_1.customThemeRouter);
app.use("/api/all-themes", theme_controller_1.getAllThemesPublic);
app.use("/api/storefront", storefront_sitemap_route_1.storefrontSitemapRouter);
app.use("/api/storefront", storefront_route_1.storefrontRouter);
app.get('/sitemap.xml', storefront_sitemap_controller_1.getStorefrontSitemap);
// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Ziplofy3b Server is running!',
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok  - ci cd updated',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.get('/api/get-store-theme', storefront_theme_pack_controller_1.getStoreTheme);
io.use(socket_auth_middleware_1.socketAuthMiddleware);
// Socket.IO connection handling
(0, socket_1.registerSocketHandlers)(io);
// Error handling middleware (must be after all routes)
app.use(error_middleware_1.errorMiddleware);
// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} in ${env_utils_1.env.NODE_ENV} mode (using ${env_utils_1.loadedEnvFile})`);
});
// Start BullMQ workers (temporarily disabled while Redis is off)
// const emailWorker = startEmailWorker();
// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    try {
        // await emailWorker.close();
        // await closeEmailQueue();
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
        // Force exit if not closed within timeout
        setTimeout(() => process.exit(1), 10000).unref();
    }
    catch (err) {
        console.error('Error during shutdown', err);
        process.exit(1);
    }
};
['SIGTERM', 'SIGINT'].forEach(sig => {
    process.on(sig, () => shutdown(sig));
});
