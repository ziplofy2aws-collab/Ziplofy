/**
 * Single source of truth: editor page id → template JSON key → storefront URL(s).
 * Used by codiic create-theme and render-store preview / custom-theme routes.
 */

import {
  blogPostsTemplateIdFromPreviewPage,
  blogsTemplateIdFromPreviewPage,
  isBlogPostsTemplatePreviewPage,
  isBlogsTemplatePreviewPage,
} from './blog-templates.util';
import {
  collectionTemplateIdFromPreviewPage,
  isCollectionTemplatePreviewPage,
} from './collection-templates.util';
import {
  productTemplateIdFromPreviewPage,
  isProductTemplatePreviewPage,
} from './product-templates.util';

export type ThemePageIcon =
  | 'home'
  | 'product'
  | 'collection'
  | 'page'
  | 'blog'
  | 'cart'
  | 'gift'
  | 'checkout'
  | 'search'
  | 'lock'
  | 'user'
  | 'orders'
  | 'login';

export type ThemePageRouteSpec = {
  /** react-router path */
  path: string;
  templateId: string;
  fallbackSectionIds?: string[];
  /** Load collection + products (from route :urlHandle or fixed handle below) */
  withCollectionLoader?: boolean;
  /** Fixed collection urlHandle, e.g. "all" for /collections/all (all products) */
  loadCollectionUrlHandle?: string;
  /** Load product detail for `/product/:urlHandle` (preview uses first catalog product when id is `preview`) */
  withProductLoader?: boolean;
  /** Load blog + visible posts for `/blogs/:blogHandle` */
  withBlogLoader?: boolean;
  /** Load visible blog post for `/blogs/:blogHandle/:articleHandle` */
  withBlogPostLoader?: boolean;
};

export type ThemePageRegistryEntry = {
  pageId: string;
  templateId: string;
  label: string;
  icon: ThemePageIcon;
  /** URL the theme editor preview iframe opens for this page */
  previewPath: string;
  routes: ThemePageRouteSpec[];
};

/** Flat registry — one row per editable page type in the editor. */
export const THEME_PAGE_REGISTRY: ThemePageRegistryEntry[] = [
  {
    pageId: 'index',
    templateId: 'index',
    label: 'Home page',
    icon: 'home',
    previewPath: '/',
    routes: [{ path: '/', templateId: 'index' }],
  },
  {
    pageId: 'products',
    templateId: 'products',
    label: 'All products',
    icon: 'product',
    /** Shopify-style "All" collection — every product in the store */
    previewPath: '/collections/all',
    routes: [
      {
        path: '/collections/all',
        templateId: 'products',
        withCollectionLoader: true,
        loadCollectionUrlHandle: 'all',
      },
    ],
  },
  {
    pageId: 'product',
    templateId: 'product',
    label: 'Default product',
    icon: 'product',
    previewPath: '/product/preview',
    routes: [
      {
        path: '/product/:urlHandle',
        templateId: 'product',
        fallbackSectionIds: ['product_main'],
        withProductLoader: true,
      },
      {
        path: '/products/:id',
        templateId: 'product',
        fallbackSectionIds: ['product_main'],
        withProductLoader: true,
      },
    ],
  },
  {
    pageId: 'collections-list',
    templateId: 'collections-list',
    label: 'Collections list',
    icon: 'collection',
    /** Live store: {subdomain}/collections — all collections for the store */
    previewPath: '/collections',
    routes: [{ path: '/collections', templateId: 'collections-list' }],
  },
  {
    pageId: 'collection',
    templateId: 'collection',
    label: 'Default collection',
    icon: 'collection',
    previewPath: '/collection/preview',
    routes: [
      {
        path: '/collection/preview',
        templateId: 'collection',
        withCollectionLoader: true,
        loadCollectionUrlHandle: 'preview',
      },
      {
        path: '/collection/:urlHandle',
        templateId: 'collection',
        withCollectionLoader: true,
      },
      {
        path: '/collections/preview',
        templateId: 'collection',
        withCollectionLoader: true,
        loadCollectionUrlHandle: 'preview',
      },
      {
        path: '/collections/:urlHandle',
        templateId: 'collection',
        withCollectionLoader: true,
      },
    ],
  },
  {
    pageId: 'collections',
    templateId: 'collections',
    label: 'Collections',
    icon: 'collection',
    previewPath: '/collection/preview',
    routes: [],
  },
  {
    pageId: 'gift-card',
    templateId: 'gift-card',
    label: 'Gift card',
    icon: 'gift',
    previewPath: '/',
    routes: [],
  },
  {
    pageId: 'cart',
    templateId: 'cart',
    label: 'Cart',
    icon: 'cart',
    previewPath: '/cart',
    routes: [{ path: '/cart', templateId: 'cart', fallbackSectionIds: ['cart_main'] }],
  },
  {
    pageId: 'checkout',
    templateId: 'login',
    label: 'Checkout and customer accounts',
    icon: 'checkout',
    previewPath: '/auth/login',
    routes: [],
  },
  {
    pageId: 'pages',
    templateId: 'pages',
    label: 'Pages',
    icon: 'page',
    previewPath: '/',
    routes: [],
  },
  {
    pageId: 'blogs',
    templateId: 'blogs',
    label: 'Default blog',
    icon: 'blog',
    previewPath: '/blogs/preview',
    routes: [
      {
        path: '/blogs/:blogHandle',
        templateId: 'blogs',
        withBlogLoader: true,
        fallbackSectionIds: ['main_blog'],
      },
    ],
  },
  {
    pageId: 'blog-posts',
    templateId: 'blog-posts',
    label: 'Default blog post',
    icon: 'blog',
    previewPath: '/blogs/preview/preview',
    routes: [
      {
        path: '/blogs/:blogHandle/:articleHandle',
        templateId: 'blog-posts',
        withBlogPostLoader: true,
        fallbackSectionIds: ['blog_post_main'],
      },
    ],
  },
  {
    pageId: 'search',
    templateId: 'search',
    label: 'Search',
    icon: 'search',
    previewPath: '/search',
    routes: [{ path: '/search', templateId: 'search' }],
  },
  {
    pageId: 'password',
    templateId: 'password',
    label: 'Password',
    icon: 'lock',
    /** Store password-protection gate — not account forgot-password */
    previewPath: '/password',
    routes: [
      {
        path: '/password',
        templateId: 'password',
        fallbackSectionIds: ['password_main', 'email_signup'],
      },
    ],
  },
  {
    pageId: '404',
    templateId: '404',
    label: '404 page',
    icon: 'page',
    previewPath: '/404',
    routes: [{ path: '/404', templateId: '404' }],
  },
  {
    pageId: 'login',
    templateId: 'login',
    label: 'Login',
    icon: 'login',
    previewPath: '/auth/login',
    routes: [{ path: '/auth/login', templateId: 'login', fallbackSectionIds: ['login_main'] }],
  },
  {
    pageId: 'signup',
    templateId: 'signup',
    label: 'Sign up',
    icon: 'login',
    previewPath: '/auth/signup',
    routes: [{ path: '/auth/signup', templateId: 'signup' }],
  },
  {
    pageId: 'forgot_password',
    templateId: 'forgot_password',
    label: 'Forgot password',
    icon: 'lock',
    previewPath: '/auth/forgot',
    routes: [{ path: '/auth/forgot', templateId: 'forgot_password' }],
  },
  {
    pageId: 'profile',
    templateId: 'profile',
    label: 'Profile',
    icon: 'user',
    previewPath: '/profile',
    routes: [{ path: '/profile', templateId: 'profile' }],
  },
  {
    pageId: 'orders',
    templateId: 'orders',
    label: 'Orders',
    icon: 'orders',
    previewPath: '/my-orders',
    routes: [{ path: '/my-orders', templateId: 'orders' }],
  },
  {
    pageId: 'preferences',
    templateId: 'preferences',
    label: 'Preferences',
    icon: 'user',
    previewPath: '/preferences',
    routes: [{ path: '/preferences', templateId: 'preferences' }],
  },
];

const PAGE_BY_ID = new Map(THEME_PAGE_REGISTRY.map((e) => [e.pageId, e]));

/** Manifest-backed templates reuse pack keys; everything else uses its own template bucket. */
const MANIFEST_TEMPLATE_IDS = new Set([
  'index',
  'product',
  'cart',
  'login',
  'signup',
  'forgot_password',
  'profile',
  'orders',
  'preferences',
]);

/** Store password gate — no global header/footer chrome. */
export function isPasswordTemplateId(templateId: string): boolean {
  return templateId === 'password' || templateId.startsWith('password.');
}

export function isPasswordPreviewPage(page: string): boolean {
  return page === 'password' || isPasswordTemplateId(previewPageToTemplateId(page));
}

export function previewPageToTemplateId(page: string): string {
  const productTemplateId = productTemplateIdFromPreviewPage(page);
  if (productTemplateId) return productTemplateId;
  const collectionTemplateId = collectionTemplateIdFromPreviewPage(page);
  if (collectionTemplateId) return collectionTemplateId;
  const blogsTemplateId = blogsTemplateIdFromPreviewPage(page);
  if (blogsTemplateId) return blogsTemplateId;
  const blogPostsTemplateId = blogPostsTemplateIdFromPreviewPage(page);
  if (blogPostsTemplateId) return blogPostsTemplateId;

  const entry = PAGE_BY_ID.get(page || 'index');
  if (entry) return entry.templateId;
  const p = page || 'index';
  if (MANIFEST_TEMPLATE_IDS.has(p)) return p;
  if (p === 'checkout') return 'login';
  if (p === 'password') return 'password';
  return p;
}

export function previewPageToRoute(page: string): string {
  if (isProductTemplatePreviewPage(page)) return '/product/preview';
  if (isCollectionTemplatePreviewPage(page)) return '/collection/preview';
  if (isBlogsTemplatePreviewPage(page)) return '/blogs/preview';
  if (isBlogPostsTemplatePreviewPage(page)) return '/blogs/preview/preview';
  return PAGE_BY_ID.get(page || 'index')?.previewPath ?? '/';
}

export const PREVIEW_PAGE_ROUTES: Record<string, string> = Object.fromEntries(
  THEME_PAGE_REGISTRY.map((e) => [e.pageId, e.previewPath])
);

/** All storefront/preview routes, most specific paths first (register before param routes). */
export function listThemePageRouteSpecs(): ThemePageRouteSpec[] {
  const seen = new Set<string>();
  const specs: ThemePageRouteSpec[] = [];
  for (const entry of THEME_PAGE_REGISTRY) {
    for (const route of entry.routes) {
      if (seen.has(route.path)) continue;
      seen.add(route.path);
      specs.push(route);
    }
  }
  return specs.sort((a, b) => {
    const aParam = a.path.includes(':');
    const bParam = b.path.includes(':');
    if (aParam !== bParam) return aParam ? 1 : -1;
    return b.path.length - a.path.length;
  });
}

export type ThemePageMenuSeed = {
  previewPage: string;
  label: string;
  icon: ThemePageIcon;
  dividerBefore?: boolean;
  hasSubmenu?: boolean;
  /** Opens checkout editor in a new tab — not a selectable preview page. */
  openInNewTab?: boolean;
  children?: ThemePageMenuSeed[];
};

/** Shopify-style page picker tree (labels/icons aligned with registry). */
export const THEME_PAGE_MENU_SEEDS: ThemePageMenuSeed[] = [
  { previewPage: 'index', label: 'Home page', icon: 'home' },
  {
    previewPage: 'products',
    label: 'Products',
    icon: 'product',
    hasSubmenu: true,
    children: [{ previewPage: 'product', label: 'Default product', icon: 'product' }],
  },
  {
    previewPage: 'collections',
    label: 'Collections',
    icon: 'collection',
    hasSubmenu: true,
    children: [
      { previewPage: 'collection', label: 'Default collection', icon: 'collection' },
      { previewPage: 'collections-list', label: 'Collections list', icon: 'collection' },
    ],
  },
  { previewPage: 'collections-list', label: 'Collections list', icon: 'collection' },
  { previewPage: 'gift-card', label: 'Gift card', icon: 'gift' },
  { previewPage: 'cart', label: 'Cart', icon: 'cart', dividerBefore: true },
  {
    previewPage: 'checkout',
    label: 'Checkout and customer accounts',
    icon: 'checkout',
    openInNewTab: true,
  },
  { previewPage: 'pages', label: 'Pages', icon: 'page', dividerBefore: true },
  {
    previewPage: 'blogs',
    label: 'Blogs',
    icon: 'blog',
    hasSubmenu: true,
    children: [{ previewPage: 'blogs', label: 'Default blog', icon: 'blog' }],
  },
  {
    previewPage: 'blog-posts',
    label: 'Blog posts',
    icon: 'blog',
    hasSubmenu: true,
    children: [{ previewPage: 'blog-posts', label: 'Default blog post', icon: 'blog' }],
  },
  { previewPage: 'search', label: 'Search', icon: 'search', dividerBefore: true },
  { previewPage: 'password', label: 'Password', icon: 'lock' },
  { previewPage: '404', label: '404 page', icon: 'page' },
];

export function allRegistryPageIds(): Set<string> {
  return new Set(THEME_PAGE_REGISTRY.map((e) => e.pageId));
}

export function registryLabel(pageId: string): string {
  return PAGE_BY_ID.get(pageId)?.label ?? pageId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Ensure every editor page type has an empty template bucket in saved theme JSON. */
export function ensureRegistryTemplatesInConfig(config: Record<string, unknown>): void {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<
    string,
    { name?: string; sections?: Record<string, unknown>; section_order?: string[] }
  >;
  for (const entry of THEME_PAGE_REGISTRY) {
    if (!templates[entry.templateId]) {
      templates[entry.templateId] = {
        name: entry.label,
        sections: {},
        section_order: [],
      };
    } else {
      const tpl = templates[entry.templateId];
      if (!tpl.sections || typeof tpl.sections !== 'object') tpl.sections = {};
      if (!Array.isArray(tpl.section_order)) tpl.section_order = [];
    }
  }
}
