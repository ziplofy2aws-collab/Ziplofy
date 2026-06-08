import dotenv from 'dotenv';
import { connectDB } from '../../config/database.config';
import { PermissionDefinition } from '../../models/permission/permission-definition.model';

dotenv.config();

type Def = {
  key: string;
  name: string;
  resource?: string;
  parentKey?: string | null;
  implies?: string[];
  isLeaf?: boolean;
  order?: number;
};

const defs: Def[] = [
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
];

async function seedPermissions() {
  try {
    await connectDB();

    for (const def of defs) {
      await PermissionDefinition.updateOne(
        { key: def.key },
        {
          $set: {
            name: def.name,
            resource: def.resource ?? '',
            parentKey: def.parentKey ?? null,
            implies: def.implies ?? [],
            isLeaf: def.isLeaf ?? true,
            order: def.order ?? 0,
          },
        },
        { upsert: true }
      );
    }

    // Optional: set implies based on grouping (example: selecting group implies children)
    // We keep it explicit for now; can be updated later if needed.

    // eslint-disable-next-line no-console
    console.log('Permissions seeded successfully');
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error seeding permissions:', err);
    process.exit(1);
  }
}

seedPermissions();


