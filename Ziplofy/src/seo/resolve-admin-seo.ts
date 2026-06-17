import { joinTitle } from './seo-text.util';
import type { AdminSeoPayload } from './seo.types';

const BRAND = 'Ziplofy';

type RouteRule = {
  test: (pathname: string) => boolean;
  title: string | ((pathname: string) => string);
  description?: string;
  robots?: string;
};

const ROUTE_RULES: RouteRule[] = [
  { test: (p) => p === '/', title: 'Home' },
  { test: (p) => p === '/orders', title: 'Orders' },
  { test: (p) => p === '/orders/create', title: 'Create order' },
  { test: (p) => p === '/orders/drafts', title: 'Draft orders' },
  { test: (p) => p.startsWith('/orders/abandoned-carts'), title: 'Abandoned carts' },
  { test: (p) => p.startsWith('/orders/'), title: 'Order details' },
  { test: (p) => p === '/products', title: 'Products' },
  { test: (p) => p === '/products/new', title: 'Add product' },
  { test: (p) => p === '/products/inventory', title: 'Inventory' },
  { test: (p) => p === '/products/collections', title: 'Collections' },
  { test: (p) => p === '/products/collections/new', title: 'Create collection' },
  { test: (p) => p.startsWith('/products/collections/'), title: 'Collection details' },
  { test: (p) => p === '/products/gift-cards/products/new', title: 'Add gift card product' },
  { test: (p) => p === '/products/gift-cards/new', title: 'Create gift card' },
  { test: (p) => p === '/products/gift-cards', title: 'Gift cards' },
  { test: (p) => p.startsWith('/products/gift-cards/'), title: 'Gift card details' },
  { test: (p) => p.startsWith('/products/'), title: 'Product details' },
  { test: (p) => p === '/customers', title: 'Customers' },
  { test: (p) => p === '/customers/segments', title: 'Customer segments' },
  { test: (p) => p === '/companies', title: 'Companies' },
  { test: (p) => p === '/companies/new', title: 'New company' },
  { test: (p) => /^\/company\/[^/]+$/.test(p), title: 'Company' },
  { test: (p) => p.startsWith('/customers/'), title: 'Customer details' },
  { test: (p) => p === '/marketing', title: 'Marketing' },
  { test: (p) => p.startsWith('/marketing/'), title: 'Marketing' },
  { test: (p) => p === '/discounts', title: 'Discounts' },
  { test: (p) => p.startsWith('/discounts/'), title: 'Discount details' },
  { test: (p) => p === '/content', title: 'Content' },
  { test: (p) => p.startsWith('/content/'), title: 'Content' },
  { test: (p) => p === '/online-store/preference', title: 'Online store preferences' },
  { test: (p) => p.startsWith('/online-store/'), title: 'Online store' },
  { test: (p) => p === '/analytics', title: 'Analytics' },
  { test: (p) => p.startsWith('/analytics/'), title: 'Analytics' },
  { test: (p) => p.startsWith('/settings/'), title: 'Settings' },
  { test: (p) => p === '/settings', title: 'Settings' },
  { test: (p) => p.startsWith('/themes/create'), title: 'Theme creator', robots: 'noindex, nofollow' },
  { test: (p) => p.startsWith('/themes/'), title: 'Themes', robots: 'noindex, nofollow' },
  { test: (p) => p.startsWith('/markets/'), title: 'Markets' },
  { test: (p) => p === '/markets', title: 'Markets' },
  { test: (p) => p.startsWith('/tag-management/'), title: 'Tag management' },
  { test: (p) => p === '/tag-management', title: 'Tag management' },
  { test: (p) => p === '/vendors', title: 'Vendors' },
];

export function resolveAdminSeo(pathname: string, storeName?: string | null): AdminSeoPayload {
  const matched = ROUTE_RULES.find((rule) => rule.test(pathname));
  const pageTitle =
    typeof matched?.title === 'function' ? matched.title(pathname) : matched?.title ?? 'Admin';
  const title = storeName?.trim()
    ? joinTitle([pageTitle, storeName, BRAND])
    : joinTitle([pageTitle, BRAND]);

  return {
    title,
    description: matched?.description ?? `Manage ${pageTitle.toLowerCase()} in your Ziplofy store admin.`,
    robots: matched?.robots,
  };
}
