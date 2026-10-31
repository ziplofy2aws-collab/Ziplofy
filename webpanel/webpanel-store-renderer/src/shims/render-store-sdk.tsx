/**
 * @render-store/sdk implementation for webpanel-store-renderer.
 * Backs ported create-theme section runtimes with webpanel storefront data.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { axiosi } from '@/config/axios.config';
import { useStorefront as useRendererStorefront } from '@/contexts/store.context';

/* ---------------- Theme config ---------------- */

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
  let cur: unknown = config;
  for (const part of path.split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return fallback as T;
    cur = (cur as Record<string, unknown>)[part];
  }
  return (cur === undefined ? fallback : cur) as T;
}

/* ---------------- Editor preview ---------------- */

const PREVIEW_FLAG = '__codiicThemeEditorPreview';

export function markThemeEditorPreview(): void {
  (window as unknown as Record<string, unknown>)[PREVIEW_FLAG] = true;
}

export function isThemeEditorPreview(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as unknown as Record<string, unknown>)[PREVIEW_FLAG]);
}

export function useThemeEditorPreview(): boolean {
  return isThemeEditorPreview();
}

/* ---------------- Preview device ---------------- */

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

/* ---------------- Storefront ---------------- */

function getStorefrontSafe() {
  try {
    return useRendererStorefront();
  } catch {
    return null;
  }
}

export function useStorefront() {
  const ctx = getStorefrontSafe();
  return useMemo(
    () => ({
      storeFrontMeta: ctx?.storeFrontMeta ?? null,
      storefront: ctx ?? null,
    }),
    [ctx]
  );
}

/**
 * Permissive storefront bag — the ported section runtimes destructure many
 * codiic-only members that don't exist on webpanel. An index signature keeps
 * the types honest (everything returns empty/no-op at runtime).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStorefrontBag = Record<string, any>;

export type StorefrontCartItem = AnyStorefrontBag;
export type StorefrontProduct = AnyStorefrontBag;
export type StorefrontCollection = AnyStorefrontBag;
export type StorefrontCart = AnyStorefrontBag;
export type StorefrontCollectionItem = AnyStorefrontBag;
export type StorefrontProductItem = AnyStorefrontBag;

/* ---------------- Auth / cart (no webpanel equivalents) ---------------- */

export type StorefrontUser = {
  _id?: string;
  name?: string;
  email?: string;
} & AnyStorefrontBag;

export type GuestCartItem = {
  _id?: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  price?: number;
} & AnyStorefrontBag;

export function useStorefrontAuth(): AnyStorefrontBag {
  return useMemo(
    () => ({
      user: null as StorefrontUser | null,
      loading: false,
      login: async () => ({ success: false }),
      checkAuth: async () => null as StorefrontUser | null,
      logout: async () => undefined,
    }),
    []
  );
}

export function useStorefrontCart(): AnyStorefrontBag {
  return useMemo(
    () => ({
      cart: null,
      items: [] as GuestCartItem[],
      loading: false,
      getAllItems: () => [] as GuestCartItem[],
      getCartByCustomerId: async () => null,
      createCartEntry: async () => ({ success: false }),
      updateCartEntry: async () => ({ success: false }),
      removeCartEntry: async () => ({ success: false }),
      deleteCartEntry: async () => ({ success: false }),
    }),
    []
  );
}

/* ---------------- Products / collections / search ----------------
 * Tour & Travel stores have no product catalog — the travel package
 * entity is the product-equivalent. The same live-query pattern as codiic
 * applies: nothing is baked into the theme; every fetch hits
 * GET /api/storefront/:storeId/travel-packages, so a newly added
 * package (status: active) shows on the installed theme immediately.
 */

export type StorefrontProductVariant = {
  _id?: string;
  title?: string;
  price?: number;
  sku?: string;
} & AnyStorefrontBag;

type TravelPackageProduct = {
  _id: string;
  title: string;
  urlHandle: string;
  price: number;
  compareAtPrice: number | null;
  currency?: string;
  imageUrls: string[];
  image?: string;
  description?: string;
  vendor?: string;
  category?: string;
  durationText?: string;
  startsAt?: string | null;
  data?: Record<string, unknown>;
};

async function fetchTravelPackages(storeId: string, q?: string): Promise<TravelPackageProduct[]> {
  const res = await axiosi.get<{ success: boolean; data?: { products?: TravelPackageProduct[] } }>(
    `/storefront/${storeId}/travel-packages`,
    { params: q ? { q, limit: 48 } : { limit: 48 } }
  );
  return res.data?.data?.products ?? [];
}

async function fetchTravelPackage(storeId: string, id: string): Promise<TravelPackageProduct | null> {
  try {
    const res = await axiosi.get<{ success: boolean; data?: { product?: TravelPackageProduct } }>(
      `/storefront/${storeId}/travel-packages/${id}`
    );
    return res.data?.data?.product ?? null;
  } catch {
    return null;
  }
}

const categorySlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export type TravelPackageEnquiryResult = { ok: boolean; message: string };

/** Storefront "Book now" — creates an enquiries record in the travel workspace. */
export async function submitTravelPackageEnquiry(
  storeId: string,
  packageUrlHandle: string,
  payload: { name: string; email: string; phone?: string; travellers?: number; message?: string }
): Promise<TravelPackageEnquiryResult> {
  try {
    const res = await axiosi.post<{
      success: boolean;
      message?: string;
      data?: { enquiryRef?: string };
    }>(`/storefront/${storeId}/travel-packages/${packageUrlHandle}/enquiries`, payload);
    const enquiryRef = res.data?.data?.enquiryRef;
    return {
      ok: Boolean(res.data?.success),
      message: res.data?.success
        ? enquiryRef ? `Enquiry ${enquiryRef} received` : 'Enquiry received'
        : res.data?.message || 'Could not send enquiry',
    };
  } catch (e) {
    return {
      ok: false,
      message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Could not send enquiry',
    };
  }
}

export function useStorefrontProducts(): AnyStorefrontBag {
  const ctx = getStorefrontSafe();
  const storeId = ctx?.storeFrontMeta?.storeId as string | undefined;
  const [products, setProducts] = useState<TravelPackageProduct[]>([]);
  const [productDetail, setProductDetail] = useState<TravelPackageProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByStoreId = useCallback(
    async (args?: { storeId?: string; page?: number; limit?: number }) => {
      const sid = args?.storeId || storeId;
      if (!sid) return [] as TravelPackageProduct[];
      setLoading(true);
      setError(null);
      try {
        const list = await fetchTravelPackages(sid);
        setProducts(list);
        return list;
      } catch (e) {
        setError((e as Error)?.message ?? 'Failed to load packages');
        return [] as TravelPackageProduct[];
      } finally {
        setLoading(false);
      }
    },
    [storeId]
  );

  const fetchProductById = useCallback(
    async (id: string) => {
      if (!storeId || !id) return null;
      const p = await fetchTravelPackage(storeId, id);
      setProductDetail(p);
      return p;
    },
    [storeId]
  );

  const fetchProductForRoute = useCallback(
    async (sid: string, routeParam: string) => {
      const id = routeParam || '';
      const p = sid ? await fetchTravelPackage(sid, id) : null;
      setProductDetail(p);
      return p;
    },
    []
  );

  return useMemo(
    () => ({
      products,
      productDetail,
      loading,
      error,
      fetchProductsByStoreId,
      fetchProductById,
      fetchProductForRoute,
      fetchProductByHandle: fetchProductById,
    }),
    [products, productDetail, loading, error, fetchProductsByStoreId, fetchProductById, fetchProductForRoute]
  );
}

export function useStorefrontCollections(): AnyStorefrontBag {
  const ctx = getStorefrontSafe();
  const storeId = ctx?.storeFrontMeta?.storeId as string | undefined;
  const [products, setProducts] = useState<TravelPackageProduct[]>([]);
  const [collections, setCollections] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  // Package categories double as pseudo-collections so collection pickers work
  const fetchCollectionsByStoreId = useCallback(
    async (sid?: string) => {
      const id = sid || storeId;
      if (!id) return [] as Array<Record<string, unknown>>;
      const list = await fetchTravelPackages(id);
      const seen = new Map<string, Record<string, unknown>>();
      for (const p of list) {
        const cat = String(p.category || '').trim();
        if (!cat) continue;
        const handle = categorySlug(cat);
        if (!seen.has(handle)) {
          seen.set(handle, {
            _id: handle,
            title: cat.replace(/_/g, ' '),
            urlHandle: handle,
            handle,
            image: p.image || p.imageUrls?.[0] || '',
          });
        }
      }
      const cols = [...seen.values()];
      setCollections(cols);
      return cols;
    },
    [storeId]
  );

  const fetchProductsInCollectionByUrlHandle = useCallback(
    async (sid: string, handle: string, _opts?: { page?: number; limit?: number }) => {
      if (!sid) return [] as TravelPackageProduct[];
      setLoading(true);
      try {
        const list = await fetchTravelPackages(sid);
        const h = String(handle || '').toLowerCase();
        // 'all' is the Shopify-style virtual collection — every package
        if (h === 'all' || h === 'products') {
          setProducts(list);
          return list;
        }
        const filtered = list.filter((p) => {
          const cat = String(p.category || '').toLowerCase();
          const dest = String(p.data?.destination || p.vendor || '').toLowerCase();
          const tags = (Array.isArray(p.data?.tags) ? p.data.tags : [])
            .map((t) => String(t).toLowerCase());
          return (
            categorySlug(cat) === h ||
            cat === h ||
            dest.includes(h) ||
            tags.some((t) => t === h || t.replace(/\s+/g, '-') === h)
          );
        });
        setProducts(filtered);
        return filtered;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return useMemo(
    () => ({
      collections,
      products,
      loading,
      fetchCollections: fetchCollectionsByStoreId,
      fetchCollectionsByStoreId,
      collectionDetail: null,
      fetchCollectionByHandle: async () => null,
      fetchProductsInCollectionByUrlHandle,
    }),
    [collections, products, loading, fetchCollectionsByStoreId, fetchProductsInCollectionByUrlHandle]
  );
}

export function useStorefrontSearch(): AnyStorefrontBag {
  const [products, setProducts] = useState<TravelPackageProduct[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(
    async (args: { storeId: string; q: string; page?: number; limit?: number }) => {
      const { storeId, q } = args || {};
      if (!storeId) return [] as TravelPackageProduct[];
      setLoading(true);
      setError(null);
      try {
        const list = await fetchTravelPackages(storeId, String(q || '').trim() || undefined);
        setProducts(list);
        return list;
      } catch (e) {
        setError((e as Error)?.message ?? 'Search failed');
        return [] as TravelPackageProduct[];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return useMemo(
    () => ({
      products,
      searchValue,
      setSearchValue,
      searchProducts,
      loading,
      error,
    }),
    [products, searchValue, searchProducts, loading, error]
  );
}

/* ---------------- Blogs — real webpanel storefront data ---------------- */

export type StorefrontBlogPost = {
  _id: string;
  blogId?: string;
  blogTitle?: string;
  title: string;
  excerpt?: string;
  content?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
  author?: string;
  publishedAt?: string;
  createdAt?: string;
} & AnyStorefrontBag;

export type StorefrontBlog = {
  _id: string;
  title: string;
  urlHandle?: string;
} & AnyStorefrontBag;

export function useStorefrontBlogs(
  blogHandle?: string | null,
  postHandle?: string | null
): AnyStorefrontBag {
  const { storeFrontMeta } = useRendererStorefront();
  const storeId = storeFrontMeta?.storeId;
  const [posts, setPosts] = useState<StorefrontBlogPost[]>([]);
  const [blogs, setBlogs] = useState<StorefrontBlog[]>([]);
  const [post, setPost] = useState<StorefrontBlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const handle = blogHandle ?? undefined;
    const url = postHandle
      ? `/storefront/${storeId}/blogs/${postHandle}`
      : handle
        ? `/storefront/${storeId}/blogs?blog=${handle}`
        : `/storefront/${storeId}/blogs`;

    axiosi
      .get<{ success: boolean; data?: unknown; blogs?: unknown }>(url)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data as
          | StorefrontBlogPost
          | StorefrontBlogPost[]
          | { posts?: StorefrontBlogPost[]; blogs?: StorefrontBlog[] }
          | undefined;
        if (postHandle) {
          const single = (data as { post?: StorefrontBlogPost })?.post ?? (data as StorefrontBlogPost) ?? null;
          setPost(single);
        } else {
          const arr = Array.isArray(data)
            ? data
            : Array.isArray((data as { posts?: StorefrontBlogPost[] })?.posts)
              ? (data as { posts: StorefrontBlogPost[] }).posts
              : [];
          setPosts(arr);
          const blogList = (res.data?.blogs ?? (data as { blogs?: StorefrontBlog[] })?.blogs) as
            | StorefrontBlog[]
            | undefined;
          if (Array.isArray(blogList)) setBlogs(blogList);
        }
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error)?.message ?? 'Failed to load blogs');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, blogHandle, postHandle]);

  return useMemo(
    () => ({
      posts,
      post,
      blogs,
      blog: blogs.find((b) => b.urlHandle === blogHandle) ?? blogs[0] ?? null,
      loading,
      error,
      fetchPosts: async () => posts,
      fetchBlogs: async () => blogs,
    }),
    [posts, post, blogs, blogHandle, loading, error]
  );
}

/* ---------------- Pages & policies ---------------- */

export type StorefrontPage = {
  _id: string;
  title: string;
  urlHandle?: string;
} & AnyStorefrontBag;

export function useStorefrontPages(): AnyStorefrontBag {
  const { storeFrontMeta } = useRendererStorefront();
  const storeId = storeFrontMeta?.storeId;
  const [pages, setPages] = useState<StorefrontPage[]>([]);

  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    axiosi
      .get<{ success: boolean; data?: StorefrontPage[] }>(`/storefront/${storeId}/pages`)
      .then((res) => {
        if (!cancelled && Array.isArray(res.data?.data)) setPages(res.data.data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return useMemo(
    () => ({
      pages,
      loading: false,
      fetchPages: async () => pages,
      getPageByHandle: (handle: string) => pages.find((p) => p.urlHandle === handle) ?? null,
    }),
    [pages]
  );
}

export function useStorefrontPolicies(): AnyStorefrontBag {
  const { storeFrontMeta } = useRendererStorefront();
  const storeId = storeFrontMeta?.storeId;
  const [policies, setPolicies] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    axiosi
      .get<{ success: boolean; data?: Array<Record<string, unknown>> }>(
        `/storefront/${storeId}/policies`
      )
      .then((res) => {
        if (!cancelled && Array.isArray(res.data?.data)) setPolicies(res.data.data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return useMemo(
    () => ({
      policies,
      loading: false,
      fetchPolicies: async () => policies,
    }),
    [policies]
  );
}

/** Footer policy links — renders only when policies exist. */
export function StorefrontPolicyLinks({
  storeId: _storeId,
  device: _device,
  linkStyle,
  className,
}: {
  storeId?: string;
  device?: string;
  linkStyle?: CSSProperties;
  className?: string;
} = {}) {
  const { policies } = useStorefrontPolicies();
  const items = (policies ?? []).filter(
    (p: Record<string, unknown>) => p && (p.title || p.policyType)
  ) as Array<Record<string, unknown>>;
  if (!items.length) return null;
  return (
    <>
      {items.map((p) => (
        <a
          key={String(p._id ?? p.policyType ?? Math.random())}
          href={`/policies/${String(p.urlHandle ?? p.policyType ?? '')}`}
          className={className}
          style={{ color: 'inherit', textDecoration: 'none', ...linkStyle }}
        >
          {String(p.title ?? 'Policy')}
        </a>
      ))}
    </>
  );
}

/* ---------------- Preview highlight ---------------- */

export function usePreviewHighlightNodeId() {
  return null;
}

/* ---------------- Formatting / paths ---------------- */

export function formatMoney(amount: number | string | null | undefined, currency = 'INR'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}

export function formatINR(amountInPaisa: number): string {
  return formatMoney(amountInPaisa / 100, 'INR');
}

export function blogPath(blogHandle?: string | null): string {
  return blogHandle ? `/blogs/${blogHandle}` : '/blogs';
}

export function blogArticlePath(blogHandle?: string | null, postHandle?: string | null): string {
  if (blogHandle && postHandle) return `/blogs/${blogHandle}/${postHandle}`;
  if (postHandle) return `/blogs/${postHandle}`;
  return '/blogs';
}

export const STOREFRONT_PATHS = {
  home: '/',
  allProducts: '/collections/all',
  allCollections: '/collections',
  allBlogs: '/blogs/all',
  cart: '/cart',
  search: '/search',
} as const;

export function productPath(urlHandleOrId: string): string {
  const handle = urlHandleOrId?.trim();
  return handle ? `/product/${encodeURIComponent(handle)}` : STOREFRONT_PATHS.allProducts;
}

export function collectionPath(urlHandle: string): string {
  const handle = urlHandle?.trim().toLowerCase();
  if (!handle || handle === 'all') return STOREFRONT_PATHS.allProducts;
  return `/collection/${encodeURIComponent(handle)}`;
}

/* ---------------- Editor highlight helpers ---------------- */

/** Parse `layout:{sectionId}:block:{blockId}` from a highlight node id. */
export function layoutBlockIdFromHighlightNodeId(
  highlightNodeId: string | null,
  sectionId: string
): string | null {
  if (!highlightNodeId) return null;
  const prefix = `layout:${sectionId}:block:`;
  if (!highlightNodeId.startsWith(prefix)) return null;
  return highlightNodeId.slice(prefix.length) || null;
}

/* ---------------- Contact / lead-gen / newsletter ---------------- */

export type ContactFormPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export type ContactFormSubmitResult = { ok: boolean; message: string };

export type ContactFormContextValue = {
  submit: (payload: ContactFormPayload) => Promise<ContactFormSubmitResult>;
  submitting: boolean;
};

const ContactFormCtx = createContext<ContactFormContextValue>({
  submit: async () => ({ ok: false, message: 'Contact form unavailable' }),
  submitting: false,
});

export function StorefrontContactFormProvider({
  value,
  children,
}: {
  value: ContactFormContextValue;
  children: ReactNode;
}) {
  return <ContactFormCtx.Provider value={value}>{children}</ContactFormCtx.Provider>;
}

export function useStorefrontContactForm() {
  const ctx = useContext(ContactFormCtx);
  return useMemo(
    () => ({
      submitting: ctx.submitting,
      submitContactForm: ctx.submit,
      error: null as string | null,
      clearError: () => undefined,
    }),
    [ctx]
  );
}

export type LeadGenFormDefinition = {
  _id: string;
  name?: string;
  title?: string;
  fields?: Array<{ key: string; label: string; type: string; required?: boolean }>;
} & AnyStorefrontBag;

export type LeadGenFormContextValue = {
  loadForm: (formId: string) => Promise<LeadGenFormDefinition | null>;
  submit?: (formId: string, values: Record<string, unknown>) => Promise<ContactFormSubmitResult>;
  submitForm?: (formId: string, values: Record<string, string | string[]>) => Promise<ContactFormSubmitResult>;
  submitting: boolean;
};

const LeadGenFormCtx = createContext<LeadGenFormContextValue>({
  loadForm: async () => null,
  submit: async () => ({ ok: false, message: 'Form unavailable' }),
  submitForm: async () => ({ ok: false, message: 'Form unavailable' }),
  submitting: false,
});

export function StorefrontLeadGenFormProvider({
  value,
  children,
}: {
  value: LeadGenFormContextValue;
  children: ReactNode;
}) {
  return <LeadGenFormCtx.Provider value={value}>{children}</LeadGenFormCtx.Provider>;
}

export function useStorefrontLeadGenForm() {
  return useContext(LeadGenFormCtx);
}

export function useStorefrontNewsletter(): AnyStorefrontBag {
  return useMemo(
    () => ({
      submitting: false,
      subscribeToNewsletter: async (_email: string) => ({ ok: true, message: 'Subscribed' }),
    }),
    []
  );
}

/* ---------------- Offers / discounts (none in webpanel) ---------------- */

export function useAmountOffOrder(): AnyStorefrontBag {
  return useMemo(() => ({ offers: [], eligibleDiscounts: [], loading: false }), []);
}
export function useAmountOffProduct(): AnyStorefrontBag {
  return useMemo(() => ({ offers: [], eligibleDiscounts: [], loading: false }), []);
}
export function useBuyXGetY(): AnyStorefrontBag {
  return useMemo(() => ({ offers: [], eligibleDiscounts: [], loading: false }), []);
}
export function useFreeShipping(): AnyStorefrontBag {
  return useMemo(() => ({ offers: [], eligibleDiscounts: [], loading: false }), []);
}
export function useProductOffers(): AnyStorefrontBag {
  return useMemo(
    () => ({
      offers: [],
      freeShippingOffers: [],
      amountOffOrderOffers: [],
      amountOffProductsOffers: [],
      buyXGetYOffers: [],
      loading: false,
      fetchOffersForProduct: async () => [],
      fetchFreeShippingOffersForProduct: async () => [],
      fetchAmountOffOrderOffersForProduct: async () => [],
      fetchAmountOffProductsOffersForProduct: async () => [],
      fetchBuyXGetYOffersForProduct: async () => [],
    }),
    []
  );
}

export function dedupeAmountOffOrder(rows: unknown, ..._rest: unknown[]): any[] {
  return Array.isArray(rows) ? rows : [];
}
export function dedupeAmountOffProducts(rows: unknown, ..._rest: unknown[]): any[] {
  return Array.isArray(rows) ? rows : [];
}
export function dedupeBuyXGetY(rows: unknown, ..._rest: unknown[]): any[] {
  return Array.isArray(rows) ? rows : [];
}
export function dedupeFreeShipping(rows: unknown, ..._rest: unknown[]): any[] {
  return Array.isArray(rows) ? rows : [];
}
export const amountOffOrderSecondaryLine = (_offer?: unknown, ..._rest: unknown[]): string => '';
export const amountOffProductSecondaryLine = (_offer?: unknown, ..._rest: unknown[]): string => '';
export const buyXGetYSecondaryLine = (_offer?: unknown, ..._rest: unknown[]): string => '';
export const freeShippingSecondaryLine = (_offer?: unknown, ..._rest: unknown[]): string => '';

/* ---------------- Blog comments / variants / access ---------------- */

export function useStorefrontBlogComments(..._args: unknown[]): AnyStorefrontBag {
  return useMemo(
    () => ({
      comments: [] as Array<Record<string, unknown>>,
      loading: false,
      submitting: false,
      submitComment: async () => ({ ok: false, message: 'Comments unavailable' }),
      fetchComments: async () => [] as Array<Record<string, unknown>>,
    }),
    []
  );
}

export function useStorefrontProductVariants(..._args: unknown[]): AnyStorefrontBag {
  return useMemo(
    () => ({
      variants: [] as Array<Record<string, unknown>>,
      loading: false,
      getVariantsByProductId: (_id?: string | null) => [] as Array<Record<string, unknown>>,
      fetchVariants: async () => [] as Array<Record<string, unknown>>,
      fetchVariantsByProductId: async () => [] as Array<Record<string, unknown>>,
    }),
    []
  );
}

export function useOptionalStorefrontAccess(): AnyStorefrontBag | null {
  return null;
}
