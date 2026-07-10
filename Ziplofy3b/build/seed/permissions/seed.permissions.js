"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../../config/database.config");
const permission_definition_model_1 = require("../../models/permission/permission-definition.model");
dotenv_1.default.config();
const defs = [
    // Home
    { key: 'home', name: 'Home', resource: 'home', parentKey: null, isLeaf: false, order: 1 },
    { key: 'home.view', name: 'Home', resource: 'home', parentKey: 'home', isLeaf: true, order: 10 },
    // Orders (group)
    { key: 'orders', name: 'Orders', resource: 'orders', parentKey: null, isLeaf: false, order: 2 },
    // Orders -> basic
    { key: 'orders.view', name: 'View', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 10 },
    { key: 'orders.manage_order_information', name: 'Manage order information', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 20 },
    // Orders -> Edit
    { key: 'orders.edit', name: 'Edit orders', resource: 'orders', parentKey: 'orders', isLeaf: false, order: 30 },
    { key: 'orders.edit.apply_discounts', name: 'Apply discounts', resource: 'orders', parentKey: 'orders.edit', isLeaf: true, order: 31 },
    { key: 'orders.set_payment_terms', name: 'Set payment terms', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 40 },
    { key: 'orders.charge_credit_card', name: 'Charge credit card', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 50 },
    { key: 'orders.charge_vaulted_payment_method', name: 'Charge vaulted payment method', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 60 },
    { key: 'orders.record_payments', name: 'Record payments', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 70 },
    { key: 'orders.capture_payments', name: 'Capture payments', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 80 },
    // Orders -> Fulfill
    { key: 'orders.fulfill_ship', name: 'Fulfill and ship', resource: 'orders', parentKey: 'orders', isLeaf: false, order: 90 },
    { key: 'orders.fulfill_ship.buy_shipping_labels', name: 'Buy shipping labels', resource: 'orders', parentKey: 'orders.fulfill_ship', isLeaf: true, order: 91 },
    { key: 'orders.cancel', name: 'Cancel', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 100 },
    { key: 'orders.export', name: 'Export', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 110 },
    { key: 'orders.delete', name: 'Delete', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 120 },
    // Returns and refunds (sub-group under Orders)
    { key: 'orders.returns_refunds', name: 'Returns and refunds', resource: 'orders', parentKey: 'orders', isLeaf: false, order: 130 },
    { key: 'orders.returns_refunds.return', name: 'Return', resource: 'orders', parentKey: 'orders.returns_refunds', isLeaf: true, order: 131 },
    { key: 'orders.returns_refunds.refund_to_original_payment', name: 'Refund to original payment', resource: 'orders', parentKey: 'orders.returns_refunds', isLeaf: false, order: 132 },
    { key: 'orders.returns_refunds.refund_to_original_payment.over_refund_to_store_credit', name: 'Over-refund orders previously refunded to store credit', resource: 'orders', parentKey: 'orders.returns_refunds.refund_to_original_payment', isLeaf: true, order: 133 },
    { key: 'orders.returns_refunds.refund_to_store_credit', name: 'Refund to store credit', resource: 'orders', parentKey: 'orders.returns_refunds', isLeaf: true, order: 134 },
    // Abandoned checkouts
    { key: 'orders.abandoned_checkouts', name: 'Abandoned checkouts', resource: 'orders', parentKey: 'orders', isLeaf: false, order: 140 },
    { key: 'orders.abandoned_checkouts.manage', name: 'Manage', resource: 'orders', parentKey: 'orders.abandoned_checkouts', isLeaf: true, order: 141 },
    // Drafts
    { key: 'drafts', name: 'Drafts', resource: 'drafts', parentKey: null, isLeaf: false, order: 3 },
    { key: 'drafts.view', name: 'View', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 10 },
    { key: 'drafts.create_edit', name: 'Create and edit', resource: 'drafts', parentKey: 'drafts', isLeaf: false, order: 20 },
    { key: 'drafts.create_edit.apply_discounts', name: 'Apply discounts', resource: 'drafts', parentKey: 'drafts.create_edit', isLeaf: true, order: 21 },
    { key: 'drafts.set_payment_terms', name: 'Set payment terms', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 30 },
    { key: 'drafts.charge_credit_card', name: 'Charge credit card', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 40 },
    { key: 'drafts.charge_vaulted_payment_method', name: 'Charge vaulted payment method', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 50 },
    { key: 'drafts.mark_as_paid_record_payments', name: 'Mark as paid and record payments', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 60 },
    { key: 'drafts.export', name: 'Export', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 70 },
    { key: 'drafts.delete', name: 'Delete', resource: 'drafts', parentKey: 'drafts', isLeaf: true, order: 80 },
    // Products
    { key: 'products', name: 'Products', resource: 'products', parentKey: null, isLeaf: false, order: 4 },
    { key: 'products.view', name: 'View', resource: 'products', parentKey: 'products', isLeaf: false, order: 10 },
    { key: 'products.view.view_cost', name: 'View cost', resource: 'products', parentKey: 'products.view', isLeaf: true, order: 11 },
    { key: 'products.create_edit', name: 'Create and edit', resource: 'products', parentKey: 'products', isLeaf: false, order: 20 },
    { key: 'products.create_edit.edit_cost', name: 'Edit cost', resource: 'products', parentKey: 'products.create_edit', isLeaf: true, order: 21 },
    { key: 'products.create_edit.edit_price', name: 'Edit price', resource: 'products', parentKey: 'products.create_edit', isLeaf: true, order: 22 },
    { key: 'products.export', name: 'Export', resource: 'products', parentKey: 'products', isLeaf: true, order: 30 },
    { key: 'products.delete', name: 'Delete', resource: 'products', parentKey: 'products', isLeaf: true, order: 40 },
    { key: 'products.inventory', name: 'Inventory', resource: 'products', parentKey: 'products', isLeaf: false, order: 50 },
    { key: 'products.inventory.manage_inventory', name: 'Manage inventory (excluding transfers)', resource: 'products', parentKey: 'products.inventory', isLeaf: true, order: 51 },
    { key: 'products.inventory.view_transfers', name: 'View transfers', resource: 'products', parentKey: 'products.inventory', isLeaf: false, order: 52 },
    { key: 'products.inventory.view_transfers.manage_transfers', name: 'Manage transfers', resource: 'products', parentKey: 'products.inventory.view_transfers', isLeaf: true, order: 53 },
    { key: 'products.inventory.view_transfers.manage_shipments', name: 'Manage shipments', resource: 'products', parentKey: 'products.inventory.view_transfers', isLeaf: true, order: 54 },
    // Gift cards
    { key: 'gift_cards', name: 'Gift cards', resource: 'gift_cards', parentKey: null, isLeaf: false, order: 5 },
    { key: 'gift_cards.view', name: 'View', resource: 'gift_cards', parentKey: 'gift_cards', isLeaf: true, order: 10 },
    { key: 'gift_cards.create_edit', name: 'Create and edit', resource: 'gift_cards', parentKey: 'gift_cards', isLeaf: true, order: 20 },
    { key: 'gift_cards.export', name: 'Export', resource: 'gift_cards', parentKey: 'gift_cards', isLeaf: true, order: 30 },
    { key: 'gift_cards.deactivate', name: 'Deactivate', resource: 'gift_cards', parentKey: 'gift_cards', isLeaf: true, order: 40 },
    // Customers
    { key: 'customers', name: 'Customers', resource: 'customers', parentKey: null, isLeaf: false, order: 6 },
    { key: 'customers.view', name: 'View', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 10 },
    { key: 'customers.create_edit', name: 'Create and edit', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 20 },
    { key: 'customers.erase_personal_data', name: 'Erase personal data', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 30 },
    { key: 'customers.request_data', name: 'Request data', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 40 },
    { key: 'customers.export', name: 'Export', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 50 },
    { key: 'customers.merge', name: 'Merge', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 60 },
    { key: 'customers.view_store_credit_transactions', name: 'View store credit transactions', resource: 'customers', parentKey: 'customers', isLeaf: false, order: 70 },
    { key: 'customers.view_store_credit_transactions.edit_store_credit', name: 'Edit store credit', resource: 'customers', parentKey: 'customers.view_store_credit_transactions', isLeaf: true, order: 71 },
    { key: 'customers.delete', name: 'Delete', resource: 'customers', parentKey: 'customers', isLeaf: true, order: 80 },
    // Marketing
    { key: 'marketing', name: 'Marketing', resource: 'marketing', parentKey: null, isLeaf: false, order: 7 },
    { key: 'marketing.activities_full_access', name: 'View, create, and delete marketing activities and automations', resource: 'marketing', parentKey: 'marketing', isLeaf: true, order: 10 },
    { key: 'marketing.campaigns', name: 'Campaigns', resource: 'marketing', parentKey: 'marketing', isLeaf: false, order: 20 },
    { key: 'marketing.campaigns.view', name: 'View', resource: 'marketing', parentKey: 'marketing.campaigns', isLeaf: true, order: 21 },
    { key: 'marketing.campaigns.create_edit', name: 'Create and edit', resource: 'marketing', parentKey: 'marketing.campaigns', isLeaf: true, order: 22 },
    { key: 'marketing.campaigns.delete', name: 'Delete', resource: 'marketing', parentKey: 'marketing.campaigns', isLeaf: true, order: 23 },
    // Discounts
    { key: 'discounts', name: 'Discounts', resource: 'discounts', parentKey: null, isLeaf: false, order: 8 },
    { key: 'discounts.full_access', name: 'View, create, and delete', resource: 'discounts', parentKey: 'discounts', isLeaf: true, order: 10 },
    // Content
    { key: 'content', name: 'Content', resource: 'content', parentKey: null, isLeaf: false, order: 9 },
    { key: 'content.menus', name: 'Menus', resource: 'content', parentKey: 'content', isLeaf: true, order: 5 },
    { key: 'content.metaobject_definitions', name: 'Metaobject definitions', resource: 'content', parentKey: 'content', isLeaf: false, order: 10 },
    { key: 'content.metaobject_definitions.view', name: 'View', resource: 'content', parentKey: 'content.metaobject_definitions', isLeaf: true, order: 11 },
    { key: 'content.metaobject_definitions.create_edit', name: 'Create and edit', resource: 'content', parentKey: 'content.metaobject_definitions', isLeaf: true, order: 12 },
    { key: 'content.metaobject_definitions.delete', name: 'Delete', resource: 'content', parentKey: 'content.metaobject_definitions', isLeaf: true, order: 13 },
    { key: 'content.entries', name: 'Entries', resource: 'content', parentKey: 'content', isLeaf: false, order: 20 },
    { key: 'content.entries.view', name: 'View', resource: 'content', parentKey: 'content.entries', isLeaf: true, order: 21 },
    { key: 'content.entries.create_edit', name: 'Create and edit', resource: 'content', parentKey: 'content.entries', isLeaf: true, order: 22 },
    { key: 'content.entries.delete', name: 'Delete', resource: 'content', parentKey: 'content.entries', isLeaf: true, order: 23 },
    { key: 'content.files', name: 'Files', resource: 'content', parentKey: 'content', isLeaf: false, order: 30 },
    { key: 'content.files.view', name: 'View', resource: 'content', parentKey: 'content.files', isLeaf: true, order: 31 },
    { key: 'content.files.create', name: 'Create', resource: 'content', parentKey: 'content.files', isLeaf: true, order: 32 },
    { key: 'content.files.edit', name: 'Edit', resource: 'content', parentKey: 'content.files', isLeaf: true, order: 33 },
    { key: 'content.files.delete', name: 'Delete', resource: 'content', parentKey: 'content.files', isLeaf: true, order: 34 },
    // Markets
    { key: 'markets', name: 'Markets', resource: 'markets', parentKey: null, isLeaf: false, order: 10 },
    { key: 'markets.view', name: 'View', resource: 'markets', parentKey: 'markets', isLeaf: true, order: 10 },
    { key: 'markets.create_edit', name: 'Create and edit', resource: 'markets', parentKey: 'markets', isLeaf: true, order: 20 },
    { key: 'markets.delete', name: 'Delete', resource: 'markets', parentKey: 'markets', isLeaf: true, order: 30 },
    { key: 'markets.catalogs', name: 'Catalogs', resource: 'markets', parentKey: 'markets', isLeaf: false, order: 40 },
    { key: 'markets.catalogs.view', name: 'View', resource: 'markets', parentKey: 'markets.catalogs', isLeaf: true, order: 41 },
    { key: 'markets.catalogs.create_edit', name: 'Create and edit', resource: 'markets', parentKey: 'markets.catalogs', isLeaf: true, order: 42 },
    { key: 'markets.catalogs.delete', name: 'Delete', resource: 'markets', parentKey: 'markets.catalogs', isLeaf: true, order: 43 },
    // Checkout and customer accounts
    { key: 'checkout_customer_accounts', name: 'Checkout and customer accounts', resource: 'checkout', parentKey: null, isLeaf: false, order: 11 },
    { key: 'checkout_customer_accounts.view_edit', name: 'View and edit', resource: 'checkout', parentKey: 'checkout_customer_accounts', isLeaf: false, order: 10 },
    { key: 'checkout_customer_accounts.view_edit.manage_store_credit_visibility', name: 'Manage store credit visibility', resource: 'checkout', parentKey: 'checkout_customer_accounts.view_edit', isLeaf: true, order: 11 },
    // Quick sale
    { key: 'quick_sale', name: 'Quick sale', resource: 'pos', parentKey: null, isLeaf: false, order: 12 },
    { key: 'quick_sale.use_on_mobile', name: 'Use Quick sale on Ziplofy mobile', resource: 'pos', parentKey: 'quick_sale', isLeaf: true, order: 10 },
    // Finance
    { key: 'finance', name: 'Finance', resource: 'finance', parentKey: null, isLeaf: false, order: 13 },
    { key: 'finance.view_billing_receive_emails', name: 'View billing and receive billing emails', resource: 'finance', parentKey: 'finance', isLeaf: true, order: 10 },
    { key: 'finance.edit_billing_methods_pay_invoices', name: 'Edit billing payment methods and pay invoices', resource: 'finance', parentKey: 'finance', isLeaf: true, order: 20 },
    { key: 'finance.manage_plan', name: 'Manage plan', resource: 'finance', parentKey: 'finance', isLeaf: true, order: 30 },
    { key: 'finance.manage_app_billing', name: 'Manage app billing', resource: 'finance', parentKey: 'finance', isLeaf: true, order: 40 },
    { key: 'finance.view_ziplofy_payments_payouts', name: 'View Ziplofy Payments payouts', resource: 'finance', parentKey: 'finance', isLeaf: true, order: 50 },
    { key: 'finance.manage_other_payment_settings', name: 'Manage other payment settings', resource: 'finance', parentKey: 'finance', isLeaf: true, order: 60 },
    // Analytics
    { key: 'analytics', name: 'Analytics', resource: 'analytics', parentKey: null, isLeaf: false, order: 14 },
    { key: 'analytics.reports', name: 'Reports', resource: 'analytics', parentKey: 'analytics', isLeaf: true, order: 10 },
    { key: 'analytics.dashboards', name: 'Dashboards', resource: 'analytics', parentKey: 'analytics', isLeaf: true, order: 20 },
    // Online store
    { key: 'online_store', name: 'Online store', resource: 'online_store', parentKey: null, isLeaf: false, order: 15 },
    { key: 'online_store.themes', name: 'Themes', resource: 'online_store', parentKey: 'online_store', isLeaf: false, order: 10 },
    { key: 'online_store.themes.edit_code', name: 'Edit code (Including generating theme blocks)', resource: 'online_store', parentKey: 'online_store.themes', isLeaf: true, order: 11 },
    { key: 'online_store.blog_posts_pages', name: 'Blog posts and pages', resource: 'online_store', parentKey: 'online_store', isLeaf: true, order: 20 },
    // App development
    { key: 'app_development', name: 'App development', resource: 'apps', parentKey: null, isLeaf: false, order: 16 },
    { key: 'app_development.view_apps_by_staff_collaborators', name: 'View apps developed by staff and collaborators', resource: 'apps', parentKey: 'app_development', isLeaf: true, order: 10 },
    { key: 'app_development.develop', name: 'Develop', resource: 'apps', parentKey: 'app_development', isLeaf: true, order: 20 },
    { key: 'app_development.enable_development', name: 'Enable development', resource: 'apps', parentKey: 'app_development', isLeaf: true, order: 30 },
    // Store settings
    { key: 'store_settings', name: 'Store settings', resource: 'settings', parentKey: null, isLeaf: false, order: 17 },
    { key: 'store_settings.manage_settings', name: 'Manage settings', resource: 'settings', parentKey: 'store_settings', isLeaf: true, order: 10 },
    { key: 'store_settings.shipping_and_delivery', name: 'Shipping and delivery', resource: 'settings', parentKey: 'store_settings', isLeaf: true, order: 20 },
    { key: 'store_settings.taxes_and_duties', name: 'Taxes and duties', resource: 'settings', parentKey: 'store_settings', isLeaf: true, order: 30 },
    { key: 'store_settings.locations', name: 'Locations', resource: 'settings', parentKey: 'store_settings', isLeaf: true, order: 40 },
    { key: 'store_settings.domains', name: 'Domains', resource: 'settings', parentKey: 'store_settings', isLeaf: false, order: 50 },
    { key: 'store_settings.domains.transfer_domain', name: 'Transfer domain to another Ziplofy store', resource: 'settings', parentKey: 'store_settings.domains', isLeaf: true, order: 51 },
    { key: 'store_settings.view_customer_events', name: 'View customer events', resource: 'settings', parentKey: 'store_settings', isLeaf: false, order: 60 },
    { key: 'store_settings.view_customer_events.manage_add_custom_pixels', name: 'Manage and add custom pixels', resource: 'settings', parentKey: 'store_settings.view_customer_events', isLeaf: true, order: 61 },
    { key: 'store_settings.store_policies', name: 'Store policies', resource: 'settings', parentKey: 'store_settings', isLeaf: true, order: 70 },
    // Purchase orders
    { key: 'purchase_orders', name: 'Purchase orders', resource: 'purchase_orders', parentKey: null, isLeaf: false, order: 18 },
    { key: 'purchase_orders.view', name: 'View', resource: 'purchase_orders', parentKey: 'purchase_orders', isLeaf: true, order: 10 },
    { key: 'purchase_orders.create_edit', name: 'Create and edit', resource: 'purchase_orders', parentKey: 'purchase_orders', isLeaf: true, order: 20 },
    { key: 'purchase_orders.export', name: 'Export', resource: 'purchase_orders', parentKey: 'purchase_orders', isLeaf: true, order: 30 },
    { key: 'purchase_orders.delete', name: 'Delete', resource: 'purchase_orders', parentKey: 'purchase_orders', isLeaf: true, order: 40 },
    // Vendors
    { key: 'vendors', name: 'Vendors', resource: 'vendors', parentKey: null, isLeaf: false, order: 19 },
    { key: 'vendors.view', name: 'View', resource: 'vendors', parentKey: 'vendors', isLeaf: true, order: 10 },
    { key: 'vendors.create_edit', name: 'Create and edit', resource: 'vendors', parentKey: 'vendors', isLeaf: true, order: 20 },
    { key: 'vendors.delete', name: 'Delete', resource: 'vendors', parentKey: 'vendors', isLeaf: true, order: 30 },
    // Tag management
    { key: 'tag_management', name: 'Tag management', resource: 'tags', parentKey: null, isLeaf: false, order: 20 },
    { key: 'tag_management.view', name: 'View', resource: 'tags', parentKey: 'tag_management', isLeaf: true, order: 10 },
    { key: 'tag_management.create_edit', name: 'Create and edit', resource: 'tags', parentKey: 'tag_management', isLeaf: true, order: 20 },
    { key: 'tag_management.delete', name: 'Delete', resource: 'tags', parentKey: 'tag_management', isLeaf: true, order: 30 },
    // Theme gallery
    { key: 'themes', name: 'Themes', resource: 'themes', parentKey: null, isLeaf: false, order: 21 },
    { key: 'themes.view', name: 'View themes', resource: 'themes', parentKey: 'themes', isLeaf: true, order: 10 },
    { key: 'themes.install', name: 'Install themes', resource: 'themes', parentKey: 'themes', isLeaf: true, order: 20 },
    { key: 'themes.customize', name: 'Customize themes', resource: 'themes', parentKey: 'themes', isLeaf: true, order: 30 },
    // Staff users
    { key: 'users', name: 'Users', resource: 'users', parentKey: null, isLeaf: false, order: 22 },
    { key: 'users.view', name: 'View staff', resource: 'users', parentKey: 'users', isLeaf: true, order: 10 },
    { key: 'users.create_edit', name: 'Create and edit staff', resource: 'users', parentKey: 'users', isLeaf: true, order: 20 },
    { key: 'users.delete', name: 'Delete staff', resource: 'users', parentKey: 'users', isLeaf: true, order: 30 },
    // Roles & permissions
    { key: 'roles', name: 'Roles', resource: 'roles', parentKey: null, isLeaf: false, order: 23 },
    { key: 'roles.view', name: 'View roles', resource: 'roles', parentKey: 'roles', isLeaf: true, order: 10 },
    { key: 'roles.create_edit', name: 'Create and edit roles', resource: 'roles', parentKey: 'roles', isLeaf: true, order: 20 },
    { key: 'roles.delete', name: 'Delete roles', resource: 'roles', parentKey: 'roles', isLeaf: true, order: 30 },
    // Marketing extensions
    { key: 'marketing.automations', name: 'Automations', resource: 'marketing', parentKey: 'marketing', isLeaf: false, order: 30 },
    { key: 'marketing.automations.view', name: 'View', resource: 'marketing', parentKey: 'marketing.automations', isLeaf: true, order: 31 },
    { key: 'marketing.automations.create_edit', name: 'Create and edit', resource: 'marketing', parentKey: 'marketing.automations', isLeaf: true, order: 32 },
    { key: 'marketing.automations.delete', name: 'Delete', resource: 'marketing', parentKey: 'marketing.automations', isLeaf: true, order: 33 },
    { key: 'marketing.attribution', name: 'Attribution', resource: 'marketing', parentKey: 'marketing', isLeaf: false, order: 40 },
    { key: 'marketing.attribution.view', name: 'View', resource: 'marketing', parentKey: 'marketing.attribution', isLeaf: true, order: 41 },
    // Analytics live view
    { key: 'analytics.live_view', name: 'Live view', resource: 'analytics', parentKey: 'analytics', isLeaf: true, order: 30 },
    // Online store extensions
    { key: 'online_store.pages', name: 'Pages', resource: 'online_store', parentKey: 'online_store', isLeaf: false, order: 30 },
    { key: 'online_store.pages.view', name: 'View', resource: 'online_store', parentKey: 'online_store.pages', isLeaf: true, order: 31 },
    { key: 'online_store.pages.create_edit', name: 'Create and edit', resource: 'online_store', parentKey: 'online_store.pages', isLeaf: true, order: 32 },
    { key: 'online_store.pages.delete', name: 'Delete', resource: 'online_store', parentKey: 'online_store.pages', isLeaf: true, order: 33 },
    { key: 'online_store.preference', name: 'Store preference', resource: 'online_store', parentKey: 'online_store', isLeaf: true, order: 40 },
    // Settings — plan & billing
    { key: 'settings_plan', name: 'Plan', resource: 'settings', parentKey: null, isLeaf: false, order: 24 },
    { key: 'settings_plan.view', name: 'View plan', resource: 'settings', parentKey: 'settings_plan', isLeaf: true, order: 10 },
    { key: 'settings_plan.manage', name: 'Manage plan', resource: 'settings', parentKey: 'settings_plan', isLeaf: true, order: 20 },
    { key: 'settings_billing', name: 'Billing', resource: 'settings', parentKey: null, isLeaf: false, order: 25 },
    { key: 'settings_billing.view', name: 'View billing', resource: 'settings', parentKey: 'settings_billing', isLeaf: true, order: 10 },
    { key: 'settings_billing.manage', name: 'Manage billing', resource: 'settings', parentKey: 'settings_billing', isLeaf: true, order: 20 },
    { key: 'settings_payments', name: 'Payments', resource: 'settings', parentKey: null, isLeaf: false, order: 26 },
    { key: 'settings_payments.view', name: 'View payment settings', resource: 'settings', parentKey: 'settings_payments', isLeaf: true, order: 10 },
    { key: 'settings_payments.manage', name: 'Manage payment settings', resource: 'settings', parentKey: 'settings_payments', isLeaf: true, order: 20 },
    { key: 'settings_checkout', name: 'Checkout', resource: 'settings', parentKey: null, isLeaf: false, order: 27 },
    { key: 'settings_checkout.view', name: 'View checkout settings', resource: 'settings', parentKey: 'settings_checkout', isLeaf: true, order: 10 },
    { key: 'settings_checkout.manage', name: 'Manage checkout settings', resource: 'settings', parentKey: 'settings_checkout', isLeaf: true, order: 20 },
    { key: 'settings_customer_accounts', name: 'Customer accounts', resource: 'settings', parentKey: null, isLeaf: false, order: 28 },
    { key: 'settings_customer_accounts.view', name: 'View customer account settings', resource: 'settings', parentKey: 'settings_customer_accounts', isLeaf: true, order: 10 },
    { key: 'settings_customer_accounts.manage', name: 'Manage customer account settings', resource: 'settings', parentKey: 'settings_customer_accounts', isLeaf: true, order: 20 },
    { key: 'settings_notifications', name: 'Notifications', resource: 'settings', parentKey: null, isLeaf: false, order: 29 },
    { key: 'settings_notifications.view', name: 'View notifications', resource: 'settings', parentKey: 'settings_notifications', isLeaf: true, order: 10 },
    { key: 'settings_notifications.manage', name: 'Manage notifications', resource: 'settings', parentKey: 'settings_notifications', isLeaf: true, order: 20 },
    { key: 'settings_metafields', name: 'Metafields and metaobjects', resource: 'settings', parentKey: null, isLeaf: false, order: 30 },
    { key: 'settings_metafields.view', name: 'View', resource: 'settings', parentKey: 'settings_metafields', isLeaf: true, order: 10 },
    { key: 'settings_metafields.manage', name: 'Manage', resource: 'settings', parentKey: 'settings_metafields', isLeaf: true, order: 20 },
    { key: 'settings_languages', name: 'Languages', resource: 'settings', parentKey: null, isLeaf: false, order: 31 },
    { key: 'settings_languages.view', name: 'View languages', resource: 'settings', parentKey: 'settings_languages', isLeaf: true, order: 10 },
    { key: 'settings_languages.manage', name: 'Manage languages', resource: 'settings', parentKey: 'settings_languages', isLeaf: true, order: 20 },
    { key: 'settings_customer_privacy', name: 'Customer privacy', resource: 'settings', parentKey: null, isLeaf: false, order: 32 },
    { key: 'settings_customer_privacy.view', name: 'View privacy settings', resource: 'settings', parentKey: 'settings_customer_privacy', isLeaf: true, order: 10 },
    { key: 'settings_customer_privacy.manage', name: 'Manage privacy settings', resource: 'settings', parentKey: 'settings_customer_privacy', isLeaf: true, order: 20 },
    { key: 'settings_policies', name: 'Policies', resource: 'settings', parentKey: null, isLeaf: false, order: 33 },
    { key: 'settings_policies.view', name: 'View policies', resource: 'settings', parentKey: 'settings_policies', isLeaf: true, order: 10 },
    { key: 'settings_policies.manage', name: 'Manage policies', resource: 'settings', parentKey: 'settings_policies', isLeaf: true, order: 20 },
    { key: 'settings_security', name: 'Security', resource: 'settings', parentKey: null, isLeaf: false, order: 34 },
    { key: 'settings_security.view', name: 'View security settings', resource: 'settings', parentKey: 'settings_security', isLeaf: true, order: 10 },
    { key: 'settings_security.manage', name: 'Manage security settings', resource: 'settings', parentKey: 'settings_security', isLeaf: true, order: 20 },
    // Collections (under Products)
    { key: 'collections', name: 'Collections', resource: 'products', parentKey: 'products', isLeaf: false, order: 55 },
    { key: 'collections.view', name: 'View', resource: 'products', parentKey: 'collections', isLeaf: true, order: 10 },
    { key: 'collections.create_edit', name: 'Create and edit', resource: 'products', parentKey: 'collections', isLeaf: true, order: 20 },
    { key: 'collections.delete', name: 'Delete', resource: 'products', parentKey: 'collections', isLeaf: true, order: 30 },
    // Customer segments (under Customers)
    { key: 'customer_segments', name: 'Customer segments', resource: 'customers', parentKey: 'customers', isLeaf: false, order: 90 },
    { key: 'customer_segments.view', name: 'View', resource: 'customers', parentKey: 'customer_segments', isLeaf: true, order: 10 },
    { key: 'customer_segments.create_edit', name: 'Create and edit', resource: 'customers', parentKey: 'customer_segments', isLeaf: true, order: 20 },
    { key: 'customer_segments.delete', name: 'Delete', resource: 'customers', parentKey: 'customer_segments', isLeaf: true, order: 30 },
    // General settings (Settings > General)
    { key: 'settings_general', name: 'General settings', resource: 'settings', parentKey: null, isLeaf: false, order: 0 },
    { key: 'settings_general.view', name: 'View general settings', resource: 'settings', parentKey: 'settings_general', isLeaf: true, order: 10 },
    { key: 'settings_general.manage', name: 'Manage general settings', resource: 'settings', parentKey: 'settings_general', isLeaf: true, order: 20 },
    { key: 'settings_general.branding', name: 'Manage branding', resource: 'settings', parentKey: 'settings_general', isLeaf: true, order: 30 },
    { key: 'settings_general.activity', name: 'View store activity log', resource: 'settings', parentKey: 'settings_general', isLeaf: true, order: 40 },
    { key: 'settings_general.metafields', name: 'Manage shop metafields', resource: 'settings', parentKey: 'settings_general', isLeaf: true, order: 50 },
    // Content extensions
    { key: 'content.blog_posts', name: 'Blog posts', resource: 'content', parentKey: 'content', isLeaf: false, order: 40 },
    { key: 'content.blog_posts.view', name: 'View', resource: 'content', parentKey: 'content.blog_posts', isLeaf: true, order: 41 },
    { key: 'content.blog_posts.create_edit', name: 'Create and edit', resource: 'content', parentKey: 'content.blog_posts', isLeaf: true, order: 42 },
    { key: 'content.blog_posts.delete', name: 'Delete', resource: 'content', parentKey: 'content.blog_posts', isLeaf: true, order: 43 },
    { key: 'content.url_redirects', name: 'URL redirects', resource: 'content', parentKey: 'content', isLeaf: false, order: 50 },
    { key: 'content.url_redirects.view', name: 'View', resource: 'content', parentKey: 'content.url_redirects', isLeaf: true, order: 51 },
    { key: 'content.url_redirects.create_edit', name: 'Create and edit', resource: 'content', parentKey: 'content.url_redirects', isLeaf: true, order: 52 },
    { key: 'content.url_redirects.delete', name: 'Delete', resource: 'content', parentKey: 'content.url_redirects', isLeaf: true, order: 53 },
    // Orders extensions
    { key: 'orders.create', name: 'Create orders', resource: 'orders', parentKey: 'orders', isLeaf: true, order: 15 },
    // Transfers & shipments
    { key: 'transfers', name: 'Transfers', resource: 'products', parentKey: null, isLeaf: false, order: 35 },
    { key: 'transfers.view', name: 'View transfers', resource: 'products', parentKey: 'transfers', isLeaf: true, order: 10 },
    { key: 'transfers.create_edit', name: 'Create and edit transfers', resource: 'products', parentKey: 'transfers', isLeaf: true, order: 20 },
    { key: 'transfers.delete', name: 'Delete transfers', resource: 'products', parentKey: 'transfers', isLeaf: true, order: 30 },
    { key: 'shipments', name: 'Shipments', resource: 'products', parentKey: 'transfers', isLeaf: false, order: 40 },
    { key: 'shipments.view', name: 'View shipments', resource: 'products', parentKey: 'shipments', isLeaf: true, order: 41 },
    { key: 'shipments.create_edit', name: 'Create and edit shipments', resource: 'products', parentKey: 'shipments', isLeaf: true, order: 42 },
    { key: 'shipments.receive', name: 'Receive shipments', resource: 'products', parentKey: 'shipments', isLeaf: true, order: 43 },
    // Tag management extensions
    { key: 'tag_management.product_types', name: 'Product types', resource: 'tags', parentKey: 'tag_management', isLeaf: false, order: 40 },
    { key: 'tag_management.product_types.view', name: 'View', resource: 'tags', parentKey: 'tag_management.product_types', isLeaf: true, order: 41 },
    { key: 'tag_management.product_types.create_edit', name: 'Create and edit', resource: 'tags', parentKey: 'tag_management.product_types', isLeaf: true, order: 42 },
    { key: 'tag_management.product_types.delete', name: 'Delete', resource: 'tags', parentKey: 'tag_management.product_types', isLeaf: true, order: 43 },
    { key: 'tag_management.transfer_tags', name: 'Transfer tags', resource: 'tags', parentKey: 'tag_management', isLeaf: false, order: 50 },
    { key: 'tag_management.transfer_tags.view', name: 'View', resource: 'tags', parentKey: 'tag_management.transfer_tags', isLeaf: true, order: 51 },
    { key: 'tag_management.transfer_tags.create_edit', name: 'Create and edit', resource: 'tags', parentKey: 'tag_management.transfer_tags', isLeaf: true, order: 52 },
    { key: 'tag_management.transfer_tags.delete', name: 'Delete', resource: 'tags', parentKey: 'tag_management.transfer_tags', isLeaf: true, order: 53 },
    { key: 'tag_management.purchase_order_tags', name: 'Purchase order tags', resource: 'tags', parentKey: 'tag_management', isLeaf: false, order: 60 },
    { key: 'tag_management.purchase_order_tags.view', name: 'View', resource: 'tags', parentKey: 'tag_management.purchase_order_tags', isLeaf: true, order: 61 },
    { key: 'tag_management.purchase_order_tags.create_edit', name: 'Create and edit', resource: 'tags', parentKey: 'tag_management.purchase_order_tags', isLeaf: true, order: 62 },
    { key: 'tag_management.purchase_order_tags.delete', name: 'Delete', resource: 'tags', parentKey: 'tag_management.purchase_order_tags', isLeaf: true, order: 63 },
    // Online store extensions
    { key: 'online_store.theme_editor', name: 'Theme editor', resource: 'online_store', parentKey: 'online_store', isLeaf: true, order: 50 },
    { key: 'online_store.navigation', name: 'Navigation menus', resource: 'online_store', parentKey: 'online_store', isLeaf: true, order: 60 },
    // Apps & sales channels
    { key: 'apps', name: 'Apps', resource: 'apps', parentKey: null, isLeaf: false, order: 36 },
    { key: 'apps.view', name: 'View apps', resource: 'apps', parentKey: 'apps', isLeaf: true, order: 10 },
    { key: 'apps.install', name: 'Install apps', resource: 'apps', parentKey: 'apps', isLeaf: true, order: 20 },
    { key: 'apps.manage', name: 'Manage apps', resource: 'apps', parentKey: 'apps', isLeaf: true, order: 30 },
    { key: 'sales_channels', name: 'Sales channels', resource: 'sales_channels', parentKey: null, isLeaf: false, order: 37 },
    { key: 'sales_channels.view', name: 'View sales channels', resource: 'sales_channels', parentKey: 'sales_channels', isLeaf: true, order: 10 },
    { key: 'sales_channels.manage', name: 'Manage sales channels', resource: 'sales_channels', parentKey: 'sales_channels', isLeaf: true, order: 20 },
];
async function seedPermissions() {
    try {
        await (0, database_config_1.connectDB)();
        for (const def of defs) {
            await permission_definition_model_1.PermissionDefinition.updateOne({ key: def.key }, {
                $set: {
                    name: def.name,
                    resource: def.resource ?? '',
                    parentKey: def.parentKey ?? null,
                    implies: def.implies ?? [],
                    isLeaf: def.isLeaf ?? true,
                    order: def.order ?? 0,
                },
            }, { upsert: true });
        }
        // Optional: set implies based on grouping (example: selecting group implies children)
        // We keep it explicit for now; can be updated later if needed.
        // eslint-disable-next-line no-console
        console.log(`Permissions seeded successfully (${defs.length} definitions)`);
        process.exit(0);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error seeding permissions:', err);
        process.exit(1);
    }
}
seedPermissions();
