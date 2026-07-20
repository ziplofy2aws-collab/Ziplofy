/** Admin navbar navigation + quick-action search catalog. */

export type AdminSearchGroup =
  | 'Pages'
  | 'Products'
  | 'Orders'
  | 'Customers'
  | 'Online store'
  | 'Content'
  | 'Marketing'
  | 'Analytics'
  | 'Settings'
  | 'Tags & vendors'
  | 'Actions';

export type AdminNavSearchItem = {
  id: string;
  title: string;
  path: string;
  group: AdminSearchGroup;
  /** Parent labels in the sidebar (e.g. `['Products']` → Products › Inventory). */
  navPath?: string[];
  description?: string;
  keywords?: string[];
};

/** Full trail shown in search results, e.g. "Products › Inventory". */
export function formatAdminNavBreadcrumb(item: AdminNavSearchItem): string {
  const parents = item.navPath ?? [];
  if (parents.length === 0) return item.title;
  const last = parents[parents.length - 1];
  if (last.toLowerCase() === item.title.toLowerCase()) {
    return parents.join(' › ');
  }
  return [...parents, item.title].join(' › ');
}

export const ADMIN_NAV_SEARCH_CATALOG: AdminNavSearchItem[] = [
  // Home
  {
    id: 'home',
    title: 'Home',
    path: '/',
    group: 'Pages',
    description: 'Dashboard overview',
    keywords: ['dashboard', 'home', 'overview'],
  },

  // Products
  {
    id: 'products',
    title: 'Products',
    path: '/products',
    group: 'Products',
    description: 'View and manage your catalog',
    keywords: ['catalog', 'sku', 'items'],
  },
  {
    id: 'products-new',
    title: 'Add product',
    path: '/products/new',
    group: 'Actions',
    navPath: ['Products'],
    description: 'Create a new product',
    keywords: ['new product', 'create product', 'add item'],
  },
  {
    id: 'collections',
    title: 'Collections',
    path: '/products/collections',
    group: 'Products',
    navPath: ['Products'],
    description: 'Group products into collections',
    keywords: ['category', 'collection list'],
  },
  {
    id: 'collections-new',
    title: 'Create collection',
    path: '/products/collections/new',
    group: 'Actions',
    navPath: ['Products', 'Collections'],
    description: 'Add a new collection',
    keywords: ['new collection', 'add collection'],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    path: '/products/inventory',
    group: 'Products',
    navPath: ['Products'],
    description: 'Stock levels and availability',
    keywords: ['stock', 'qty', 'quantity', 'warehouse'],
  },
  {
    id: 'purchase-orders',
    title: 'Purchase orders',
    path: '/products/purchase-orders',
    group: 'Products',
    navPath: ['Products'],
    description: 'Orders to suppliers',
    keywords: ['po', 'supplier', 'buying'],
  },
  {
    id: 'purchase-orders-new',
    title: 'Create purchase order',
    path: '/products/purchase-orders/new',
    group: 'Actions',
    navPath: ['Products', 'Purchase orders'],
    description: 'Start a new purchase order',
    keywords: ['new po', 'new purchase order'],
  },
  {
    id: 'transfers',
    title: 'Transfers',
    path: '/products/transfers',
    group: 'Products',
    navPath: ['Products'],
    description: 'Move inventory between locations',
    keywords: ['stock transfer', 'relocate'],
  },
  {
    id: 'transfers-new',
    title: 'Create transfer',
    path: '/products/transfers/new',
    group: 'Actions',
    navPath: ['Products', 'Transfers'],
    description: 'Start a new inventory transfer',
    keywords: ['new transfer'],
  },
  {
    id: 'gift-cards',
    title: 'Gift cards',
    path: '/products/gift-cards',
    group: 'Products',
    navPath: ['Products'],
    description: 'Issue and manage gift cards',
    keywords: ['voucher', 'giftcard'],
  },

  // Orders
  {
    id: 'orders',
    title: 'Orders',
    path: '/orders',
    group: 'Orders',
    description: 'All store orders',
    keywords: ['sales', 'checkout'],
  },
  {
    id: 'orders-create',
    title: 'Create order',
    path: '/orders/create',
    group: 'Actions',
    navPath: ['Orders'],
    description: 'Place a new order',
    keywords: ['new order', 'add order'],
  },
  {
    id: 'drafts',
    title: 'Draft orders',
    path: '/orders/drafts',
    group: 'Orders',
    navPath: ['Orders'],
    description: 'Unpaid or unfinished orders',
    keywords: ['drafts'],
  },
  {
    id: 'abandoned-carts',
    title: 'Abandoned carts',
    path: '/orders/abandoned-carts',
    group: 'Orders',
    navPath: ['Orders'],
    description: 'Checkout sessions left incomplete',
    keywords: ['cart recovery', 'abandoned'],
  },

  // Customers
  {
    id: 'customers',
    title: 'Customers',
    path: '/customers',
    group: 'Customers',
    description: 'Customer list',
    keywords: ['buyers', 'people'],
  },
  {
    id: 'customers-new',
    title: 'Add customer',
    path: '/customers/new',
    group: 'Actions',
    navPath: ['Customers'],
    description: 'Create a customer profile',
    keywords: ['new customer'],
  },
  {
    id: 'segments',
    title: 'Customer segments',
    path: '/customers/segments',
    group: 'Customers',
    navPath: ['Customers'],
    description: 'Groups of customers',
    keywords: ['segment'],
  },
  {
    id: 'companies',
    title: 'Companies',
    path: '/companies',
    group: 'Customers',
    navPath: ['Customers'],
    description: 'B2B company accounts',
    keywords: ['b2b', 'business'],
  },

  // Marketing & discounts
  {
    id: 'marketing',
    title: 'Marketing',
    path: '/marketing',
    group: 'Marketing',
    description: 'Campaigns and outreach',
    keywords: ['promo', 'ads'],
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    path: '/marketing/campaigns',
    group: 'Marketing',
    navPath: ['Marketing'],
    keywords: ['email campaign'],
  },
  {
    id: 'attribution',
    title: 'Attribution',
    path: '/marketing/attribution',
    group: 'Marketing',
    navPath: ['Marketing'],
  },
  {
    id: 'automations',
    title: 'Automations',
    path: '/marketing/automations',
    group: 'Marketing',
    navPath: ['Marketing'],
    keywords: ['flows', 'workflow'],
  },
  {
    id: 'discounts',
    title: 'Discounts',
    path: '/discounts',
    group: 'Marketing',
    description: 'Coupons and discount codes',
    keywords: ['coupon', 'promo code', 'sale'],
  },

  // Content
  {
    id: 'content',
    title: 'Content',
    path: '/content',
    group: 'Content',
    description: 'Store content hub',
  },
  {
    id: 'files',
    title: 'Files',
    path: '/content/files',
    group: 'Content',
    navPath: ['Content'],
    description: 'Media library',
    keywords: ['images', 'uploads', 'assets'],
  },
  {
    id: 'menus',
    title: 'Menus',
    path: '/content/menus',
    group: 'Content',
    navPath: ['Content'],
    description: 'Navigation menus',
    keywords: ['navigation', 'links'],
  },
  {
    id: 'blog-posts',
    title: 'Blog posts',
    path: '/content/articles',
    group: 'Content',
    navPath: ['Content'],
    description: 'Articles and posts',
    keywords: ['blog', 'articles'],
  },
  {
    id: 'contact-submissions',
    title: 'Contact submissions',
    path: '/content/contact-submissions',
    group: 'Content',
    navPath: ['Content'],
    description: 'Messages from your contact form',
    keywords: ['contact', 'contact form', 'inbox', 'inquiries', 'messages'],
  },
  {
    id: 'newsletter-subscriptions',
    title: 'Newsletter subscriptions',
    path: '/content/newsletter-subscriptions',
    group: 'Content',
    navPath: ['Content'],
    description: 'Newsletter subscriber emails',
    keywords: ['newsletter', 'subscribe', 'email list', 'mailing list', 'subscribers'],
  },
  {
    id: 'blogs',
    title: 'Blogs',
    path: '/content/blogs',
    group: 'Content',
    navPath: ['Content'],
    keywords: ['blog list'],
  },
  {
    id: 'url-redirects',
    title: 'URL redirects',
    path: '/content/url-redirects',
    group: 'Content',
    navPath: ['Content'],
    keywords: ['redirect', '301'],
  },

  // Markets & analytics
  {
    id: 'markets',
    title: 'Markets',
    path: '/markets',
    group: 'Pages',
    keywords: ['regions', 'countries'],
  },
  {
    id: 'catalogs',
    title: 'Catalogs',
    path: '/markets/catalogs',
    group: 'Pages',
    navPath: ['Markets'],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/analytics',
    group: 'Analytics',
    keywords: ['stats', 'metrics'],
  },
  {
    id: 'reports',
    title: 'Reports',
    path: '/analytics/reports',
    group: 'Analytics',
    navPath: ['Analytics'],
  },
  {
    id: 'live-view',
    title: 'Live view',
    path: '/analytics/live-view',
    group: 'Analytics',
    navPath: ['Analytics'],
    keywords: ['realtime', 'live'],
  },

  // Online store
  {
    id: 'online-store',
    title: 'Online store',
    path: '/online-store',
    group: 'Online store',
    description: 'Storefront overview',
    keywords: ['storefront', 'shop'],
  },
  {
    id: 'themes',
    title: 'Themes',
    path: '/online-store/themes',
    group: 'Online store',
    navPath: ['Online store'],
    description: 'Customize store appearance',
    keywords: ['theme library', 'design', 'editor'],
  },
  {
    id: 'create-theme',
    title: 'Create theme',
    path: '/themes/create',
    group: 'Actions',
    navPath: ['Online store', 'Themes'],
    description: 'Open the theme creator',
    keywords: ['theme editor', 'new theme'],
  },
  {
    id: 'pages',
    title: 'Pages',
    path: '/online-store/pages',
    group: 'Online store',
    navPath: ['Online store'],
    description: 'Static storefront pages',
    keywords: ['about', 'landing'],
  },
  {
    id: 'preference',
    title: 'Store preference',
    path: '/online-store/preference',
    group: 'Online store',
    navPath: ['Online store'],
    keywords: ['preferences', 'password'],
  },

  // Tags & vendors
  {
    id: 'tag-management',
    title: 'Tag management',
    path: '/tag-management',
    group: 'Tags & vendors',
    keywords: ['labels', 'tags'],
  },
  {
    id: 'customer-tags',
    title: 'Customer tags',
    path: '/tag-management/customer-tags',
    group: 'Tags & vendors',
    navPath: ['Tag management'],
  },
  {
    id: 'product-tags',
    title: 'Product tags',
    path: '/tag-management/product-tags',
    group: 'Tags & vendors',
    navPath: ['Tag management'],
  },
  {
    id: 'blog-tags',
    title: 'Blog tags',
    path: '/tag-management/blog-tags',
    group: 'Tags & vendors',
    navPath: ['Tag management'],
  },
  {
    id: 'product-types',
    title: 'Product types',
    path: '/tag-management/product-types',
    group: 'Tags & vendors',
    navPath: ['Tag management'],
  },
  {
    id: 'transfer-tags',
    title: 'Transfer tags',
    path: '/tag-management/transfer-tags',
    group: 'Tags & vendors',
    navPath: ['Tag management'],
  },
  {
    id: 'po-tags',
    title: 'Purchase order tags',
    path: '/tag-management/purchase-order-tags',
    group: 'Tags & vendors',
    navPath: ['Tag management'],
  },
  {
    id: 'vendors',
    title: 'Vendors',
    path: '/vendors',
    group: 'Tags & vendors',
    description: 'Product vendors / brands',
    keywords: ['brand', 'supplier'],
  },

  // Settings
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings/general',
    group: 'Settings',
    description: 'Store settings',
    keywords: ['preferences', 'config'],
  },
  {
    id: 'settings-general',
    title: 'General',
    path: '/settings/general',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-plan',
    title: 'Plan',
    path: '/settings/plan',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-billing',
    title: 'Billing',
    path: '/settings/billing',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-users',
    title: 'Users',
    path: '/settings/users',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['staff', 'team'],
  },
  {
    id: 'settings-roles',
    title: 'Roles',
    path: '/settings/users/roles',
    group: 'Settings',
    navPath: ['Settings', 'Users'],
    keywords: ['permissions'],
  },
  {
    id: 'settings-security',
    title: 'Security',
    path: '/settings/users/security',
    group: 'Settings',
    navPath: ['Settings', 'Users'],
  },
  {
    id: 'settings-payments',
    title: 'Payments',
    path: '/settings/payments',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['gateway', 'razorpay', 'stripe'],
  },
  {
    id: 'settings-checkout',
    title: 'Checkout',
    path: '/settings/checkout',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-customer-accounts',
    title: 'Customer accounts',
    path: '/settings/customer-accounts',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-shipping',
    title: 'Shipping and delivery',
    path: '/settings/shipping-and-delivery',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['shipping', 'delivery', 'rates'],
  },
  {
    id: 'settings-taxes',
    title: 'Taxes and duties',
    path: '/settings/taxes-and-duties',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['tax', 'gst'],
  },
  {
    id: 'settings-locations',
    title: 'Locations',
    path: '/settings/locations',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['warehouse'],
  },
  {
    id: 'settings-markets',
    title: 'Markets',
    path: '/settings/markets',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-domains',
    title: 'Domains',
    path: '/settings/domains',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['dns', 'domain'],
  },
  {
    id: 'settings-customer-events',
    title: 'Customer events',
    path: '/settings/customer-events',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-notifications',
    title: 'Notifications',
    path: '/settings/notifications',
    group: 'Settings',
    navPath: ['Settings'],
    keywords: ['email notifications'],
  },
  {
    id: 'settings-metafields',
    title: 'Metafields and metaobjects',
    path: '/settings/metafields-and-metaobjects',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-languages',
    title: 'Languages',
    path: '/settings/languages',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-privacy',
    title: 'Customer privacy',
    path: '/settings/customer-privacy',
    group: 'Settings',
    navPath: ['Settings'],
  },
  {
    id: 'settings-policies',
    title: 'Policies',
    path: '/settings/policies',
    group: 'Settings',
    navPath: ['Settings'],
  },
];

const GROUP_ORDER: AdminSearchGroup[] = [
  'Actions',
  'Products',
  'Orders',
  'Customers',
  'Online store',
  'Content',
  'Marketing',
  'Analytics',
  'Tags & vendors',
  'Settings',
  'Pages',
];

function scoreItem(item: AdminNavSearchItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const title = item.title.toLowerCase();
  const desc = (item.description ?? '').toLowerCase();
  const path = item.path.toLowerCase();
  const crumb = formatAdminNavBreadcrumb(item).toLowerCase();
  const keys = (item.keywords ?? []).map((k) => k.toLowerCase());
  const parents = (item.navPath ?? []).join(' ').toLowerCase();

  if (title === q) return 100;
  if (title.startsWith(q)) return 90;
  if (title.includes(q)) return 75;
  if (keys.some((k) => k === q || k.startsWith(q))) return 70;
  if (keys.some((k) => k.includes(q))) return 55;
  if (crumb.includes(q) || parents.includes(q)) return 48;
  if (desc.includes(q)) return 40;
  if (path.includes(q.replace(/\s+/g, '-'))) return 35;
  if (path.includes(q.replace(/\s+/g, '/'))) return 30;
  // multi-token: all tokens must match somewhere (e.g. "products inventory")
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const hay = `${title} ${desc} ${keys.join(' ')} ${path} ${crumb} ${parents}`;
    if (tokens.every((t) => hay.includes(t))) return 50;
  }
  return 0;
}

export function searchAdminNavCatalog(
  query: string,
  limit = 12
): AdminNavSearchItem[] {
  const q = query.trim();
  if (!q) {
    // Suggested shortcuts when focused with empty query
    return ADMIN_NAV_SEARCH_CATALOG.filter((i) =>
      ['products', 'products-new', 'collections', 'inventory', 'orders', 'themes', 'customers'].includes(
        i.id
      )
    );
  }

  return ADMIN_NAV_SEARCH_CATALOG.map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((x) => x.item);
}

export function groupAdminNavResults(
  items: AdminNavSearchItem[]
): { group: AdminSearchGroup; items: AdminNavSearchItem[] }[] {
  const map = new Map<AdminSearchGroup, AdminNavSearchItem[]>();
  for (const item of items) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((group) => ({
    group,
    items: map.get(group)!,
  }));
}
