'use client';

/**
 * @render-store/sdk compatibility shim for the ported create-theme builder.
 *
 * The real sdk lives in render-store (the codiic ecommerce storefront) and is
 * backed by codiic-server APIs. In webpanel we provide compatible signatures
 * backed by webpanel state so ported section runtimes/panels compile and render
 * in the editor. Data-backed hooks return empty/stub results where webpanel
 * stores have no equivalent resource (products, collections, search).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/* Theme config                                                        */
/* ------------------------------------------------------------------ */

export type ThemeConfig = Record<string, unknown>;

const ThemeConfigContext = createContext<ThemeConfig>({});

export function ThemeConfigProvider({
  config,
  children,
}: {
  config: ThemeConfig;
  children: ReactNode;
}) {
  return (
    <ThemeConfigContext.Provider value={config ?? {}}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig(): ThemeConfig {
  return useContext(ThemeConfigContext);
}

export function getThemeConfigValue<T = unknown>(
  config: ThemeConfig | null | undefined,
  path: string,
  fallback?: T
): T {
  if (!config || !path) return fallback as T;
  const parts = path.split('.');
  let cur: unknown = config;
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') {
      return fallback as T;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return (cur === undefined ? fallback : cur) as T;
}

/* ------------------------------------------------------------------ */
/* Storefront                                                          */
/* ------------------------------------------------------------------ */

export type StorefrontStore = {
  _id: string;
  storeName?: string;
  storeDescription?: string;
  subdomain?: { subdomain?: string; customDomain?: string | null } | null;
  appliedCustomThemeId?: string | null;
  appliedTheme?: string | null;
};

type StorefrontValue = {
  store: StorefrontStore | null;
  storeFrontMeta: Record<string, unknown> | null;
  storefrontOrigin: string | null;
};

const StorefrontContext = createContext<StorefrontValue>({
  store: null,
  storeFrontMeta: null,
  storefrontOrigin: null,
});

export function StorefrontProvider({
  value,
  children,
}: {
  value: Partial<StorefrontValue>;
  children: ReactNode;
}) {
  const merged = useMemo<StorefrontValue>(
    () => ({
      store: value.store ?? null,
      storeFrontMeta: value.storeFrontMeta ?? null,
      storefrontOrigin: value.storefrontOrigin ?? null,
    }),
    [value.store, value.storeFrontMeta, value.storefrontOrigin]
  );
  return (
    <StorefrontContext.Provider value={merged}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront(): StorefrontValue {
  return useContext(StorefrontContext);
}

/* ------------------------------------------------------------------ */
/* Preview device                                                      */
/* ------------------------------------------------------------------ */

export type PreviewDevice = 'desktop' | 'mobile';

const PreviewDeviceContext = createContext<PreviewDevice>('desktop');

export function PreviewDeviceProvider({
  device,
  children,
}: {
  device: PreviewDevice;
  children: ReactNode;
}) {
  return (
    <PreviewDeviceContext.Provider value={device}>
      {children}
    </PreviewDeviceContext.Provider>
  );
}

export function usePreviewDevice(): PreviewDevice {
  return useContext(PreviewDeviceContext);
}

/* ------------------------------------------------------------------ */
/* Editor preview                                                      */
/* ------------------------------------------------------------------ */

export function isThemeEditorPreview(): boolean {
  return false;
}

export function useThemeEditorPreview() {
  return useMemo(
    () => ({
      isEditorPreview: false,
      config: null as ThemeConfig | null,
      page: null as string | null,
    }),
    []
  );
}

/* ------------------------------------------------------------------ */
/* Storefront auth                                                     */
/* ------------------------------------------------------------------ */

export type StorefrontUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export function useStorefrontAuth() {
  const [loading] = useState(false);
  return useMemo(
    () => ({
      user: null as StorefrontUser | null,
      loading,
      login: async () => ({ success: false }),
      logout: async () => undefined,
      checkAuth: async () => null as StorefrontUser | null,
      register: async () => ({ success: false }),
    }),
    [loading]
  );
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export type GuestCartItem = {
  productId?: string;
  variantId?: string;
  quantity?: number;
  price?: number;
  title?: string;
};

export function useStorefrontCart() {
  return useMemo(
    () => ({
      cart: null as { items?: GuestCartItem[] } | null,
      items: [] as GuestCartItem[],
      loading: false,
      getAllItems: () => [] as GuestCartItem[],
      getCartByCustomerId: async () => null,
      createCartEntry: async () => ({ success: false }),
      updateCartEntry: async () => ({ success: false }),
      removeCartEntry: async () => ({ success: false }),
      clearCart: async () => undefined,
    }),
    []
  );
}

/* ------------------------------------------------------------------ */
/* Products / collections / search / blogs                             */
/* ------------------------------------------------------------------ */

export type StorefrontProductVariant = {
  _id?: string;
  title?: string;
  price?: number;
  sku?: string;
  optionValues?: Record<string, string>;
};

export type StorefrontProduct = Record<string, unknown>;

export function useStorefrontProducts() {
  const emptyFetch = useCallback(async () => [] as StorefrontProduct[], []);
  return useMemo(
    () => ({
      products: [] as StorefrontProduct[],
      productDetail: null as StorefrontProduct | null,
      loading: false,
      error: null as string | null,
      fetchProductsByStoreId: emptyFetch,
      fetchProductById: async () => null,
      fetchProductForRoute: async () => null,
      clearProductDetail: () => undefined,
    }),
    [emptyFetch]
  );
}

export type StorefrontCollection = {
  _id?: string;
  title?: string;
  urlHandle?: string;
  description?: string;
};

export function useStorefrontCollections() {
  return useMemo(
    () => ({
      collections: [] as StorefrontCollection[],
      loading: false,
      error: null as string | null,
      fetchCollections: async () => [] as StorefrontCollection[],
    }),
    []
  );
}

export function useStorefrontSearch() {
  return useMemo(
    () => ({
      products: [] as StorefrontProduct[],
      searchValue: '',
      setSearchValue: (_v: string) => undefined,
      searchProducts: async () => [] as StorefrontProduct[],
      loading: false,
      error: null as string | null,
    }),
    []
  );
}

export type StorefrontBlogPost = {
  _id?: string;
  title?: string;
  excerpt?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
};

export function useStorefrontBlogs() {
  return useMemo(
    () => ({
      blogs: [] as Array<Record<string, unknown>>,
      posts: [] as StorefrontBlogPost[],
      activeBlog: null as Record<string, unknown> | null,
      activePost: null as StorefrontBlogPost | null,
      loading: false,
      error: null as string | null,
      fetchBlogs: async () => [],
      fetchPosts: async () => [] as StorefrontBlogPost[],
    }),
    []
  );
}

/* ------------------------------------------------------------------ */
/* Pages / policies                                                    */
/* ------------------------------------------------------------------ */

export type StorefrontPage = {
  _id?: string;
  title?: string;
  urlHandle?: string;
};

export function useStorefrontPages() {
  return useMemo(
    () => ({
      pages: [] as StorefrontPage[],
      loading: false,
      fetchPages: async () => [] as StorefrontPage[],
    }),
    []
  );
}

export function useStorefrontPolicies() {
  return useMemo(
    () => ({
      policies: [] as Array<Record<string, unknown>>,
      loading: false,
    }),
    []
  );
}

export function StorefrontPolicyLinks() {
  return null;
}

/* ------------------------------------------------------------------ */
/* Product offers                                                      */
/* ------------------------------------------------------------------ */

export function useProductOffers() {
  return useMemo(
    () => ({
      offers: [] as Array<Record<string, unknown>>,
      loading: false,
    }),
    []
  );
}

/* ------------------------------------------------------------------ */
/* Media / highlight                                                   */
/* ------------------------------------------------------------------ */

export function usePreviewHighlightNodeId() {
  return null as string | null;
}

export function resolveRemoteThemeMediaUrl(url: string | null | undefined): string | null {
  return url ?? null;
}

/* ------------------------------------------------------------------ */
/* Money + paths                                                       */
/* ------------------------------------------------------------------ */

export function formatMoney(
  amount: number | string | null | undefined,
  currency = 'INR'
): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
}

/** @deprecated prefer formatMoney */
export function formatINR(amountInPaisa: number): string {
  return formatMoney(amountInPaisa, 'INR');
}

export function blogPath(blogHandle?: string | null): string {
  return blogHandle ? `/blogs/${blogHandle}` : '/blogs';
}

export function blogArticlePath(
  blogHandle?: string | null,
  postHandle?: string | null
): string {
  if (blogHandle && postHandle) return `/blogs/${blogHandle}/${postHandle}`;
  if (postHandle) return `/blogs/${postHandle}`;
  return '/blogs';
}

/* ------------------------------------------------------------------ */
/* Contact + lead-gen form providers (informatic editor compatibility) */
/* ------------------------------------------------------------------ */

export type ContactFormPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

type ContactFormValue = {
  submit: (
    payload: ContactFormPayload
  ) => Promise<{ ok: boolean; message?: string }>;
  submitting: boolean;
};

const ContactFormContext = createContext<ContactFormValue>({
  submit: async () => ({ ok: true }),
  submitting: false,
});

export function StorefrontContactFormProvider({
  value,
  children,
}: {
  value: ContactFormValue;
  children: ReactNode;
}) {
  return (
    <ContactFormContext.Provider value={value}>
      {children}
    </ContactFormContext.Provider>
  );
}

export function useStorefrontContactForm(): ContactFormValue {
  return useContext(ContactFormContext);
}

export type LeadGenFormField = {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  options?: string[];
};

export type LeadGenFormDefinition = {
  _id?: string;
  name?: string;
  title?: string;
  fields?: LeadGenFormField[];
  submitLabel?: string;
};

type LeadGenFormValue = {
  loadForm: (formId: string) => Promise<LeadGenFormDefinition | null>;
  submitForm: (
    formId: string,
    values: Record<string, string | string[]>
  ) => Promise<{ ok: boolean; message?: string }>;
  submitting: boolean;
};

const LeadGenFormContext = createContext<LeadGenFormValue>({
  loadForm: async () => null,
  submitForm: async () => ({ ok: true }),
  submitting: false,
});

export function StorefrontLeadGenFormProvider({
  value,
  children,
}: {
  value: LeadGenFormValue;
  children: ReactNode;
}) {
  return (
    <LeadGenFormContext.Provider value={value}>
      {children}
    </LeadGenFormContext.Provider>
  );
}

export function useStorefrontLeadGenForm(): LeadGenFormValue {
  return useContext(LeadGenFormContext);
}
