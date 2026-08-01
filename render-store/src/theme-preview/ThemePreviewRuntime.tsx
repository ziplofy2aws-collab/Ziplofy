import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { CheckoutThankYouPage } from '@/pages/checkout/CheckoutThankYouPage';
import { CheckoutPaymentConfirmationPage } from '@/pages/checkout/CheckoutPaymentConfirmationPage';
import { CheckoutOrderStatusPage } from '@/pages/checkout-profile/CheckoutOrderStatusPage';
import type { ThemeContract } from '@/themes/contract';
import { loadRemoteTheme } from '@/themes/loadRemoteTheme';
import { rewriteRemoteThemeImports } from '@/themes/rewriteRemoteThemeImports';
import { getStorefrontAssetOrigin } from '@/config/storefrontAssetOrigin';
import { postToParent } from './previewBridge';
import { previewPageToRoute, type ThemePreviewPage } from './previewBridge';

type ThemePreviewRuntimeProps = {
  jsUrl: string;
  cssUrl?: string | null;
  page: ThemePreviewPage;
  previewRoute?: string;
  /** Bumped only when preview page changes — config updates use context + window event. */
  pageRevision: number;
};

/** Theme bundles are static files on the preview host — never on the API origin. */
function isThemeStaticAssetPath(path: string): boolean {
  return (
    path.startsWith('/remote-themes/') ||
    path.startsWith('/static-editor-theme/') ||
    path.startsWith('/remote-theme-runtime/')
  );
}

function resolveAssetUrl(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (isThemeStaticAssetPath(path)) {
    return `${getStorefrontAssetOrigin()}${path}`;
  }
  const viteApi = import.meta.env.VITE_API_URL;
  const base = typeof viteApi === 'string' && viteApi.trim() !== '' ? viteApi.replace(/\/$/, '') : '';
  if (base) return `${base}${path}`;
  return `${window.location.origin}${path}`;
}

export function ThemePreviewRuntime({ jsUrl, cssUrl, page, previewRoute, pageRevision }: ThemePreviewRuntimeProps) {
  const [contract, setContract] = useState<ThemeContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const loadTheme = useCallback(async () => {
    setLoading(true);
    setError(null);
    revokeBlob();
    try {
      const url = resolveAssetUrl(jsUrl);
      const isCrossOrigin =
        typeof window !== 'undefined' &&
        (() => {
          try {
            return new URL(url, window.location.href).origin !== window.location.origin;
          } catch {
            return true;
          }
        })();
      const res = await fetch(url, {
        credentials: isCrossOrigin ? 'omit' : 'include',
        mode: 'cors',
      });
      if (!res.ok) throw new Error(`Failed to fetch theme.js (${res.status})`);
      const raw = await res.text();
      const body = rewriteRemoteThemeImports(raw, getStorefrontAssetOrigin());
      const blob = new Blob([body], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      const next = await loadRemoteTheme(blobUrl);
      setContract(next);
      postToParent({ source: 'codiic-theme-preview', type: 'codiic_PREVIEW_LOADED' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      postToParent({ source: 'codiic-theme-preview', type: 'codiic_PREVIEW_ERROR', payload: { message: msg } });
    } finally {
      setLoading(false);
    }
  }, [jsUrl]);

  useEffect(() => {
    void loadTheme();
    return () => revokeBlob();
  }, [loadTheme]);

  const cssHref = useMemo(() => (cssUrl ? resolveAssetUrl(cssUrl) : ''), [cssUrl]);

  useEffect(() => {
    const linkId = 'codiic-preview-theme-css';
    document.getElementById(linkId)?.remove();
    if (!contract || !cssHref) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
    return () => link.remove();
  }, [contract, cssHref]);

  const routeKey = `${page}-${previewRoute ?? ''}-${pageRevision}`;
  const initialEntry = useMemo(
    () => previewRoute ?? previewPageToRoute(page),
    [page, previewRoute]
  );

  if (loading && !contract) {
    return (
      <div style={{ padding: 32, textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#666' }}>
        Loading theme preview…
      </div>
    );
  }

  if (!contract) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ color: '#b91c1c', marginTop: 0 }}>Preview failed</p>
        <pre style={{ fontSize: 12, background: '#fef2f2', padding: 12, overflow: 'auto' }}>{error}</pre>
        <button type="button" onClick={() => void loadTheme()} style={{ marginTop: 8 }}>
          Retry
        </button>
      </div>
    );
  }

  const Home = contract.HomePage;
  const Product = contract.ProductPage;
  const Cart = contract.CartPage;
  const Login = contract.LoginPage;
  const Signup = contract.SignupPage;
  const Forgot = contract.ForgotPasswordPage ?? contract.LoginPage;
  const Profile = contract.ProfilePage;
  const Orders = contract.OrdersPage;
  const Preferences = contract.PreferencesPage;
  const Search = contract.SearchPage ?? Home;
  const CollectionsList = contract.CollectionsListPage ?? Home;
  const AllProducts = contract.AllProductsPage ?? Home;
  const CollectionDetail = contract.CollectionPage ?? Home;
  const NotFound = contract.NotFoundPage;
  const AllBlogs = contract.AllBlogsPage;
  const Blog = contract.BlogPage;
  const BlogPost = contract.BlogPostPage;

  return (
    <MemoryRouter key={routeKey} initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections/all" element={<AllProducts />} />
        <Route path="/collections" element={<CollectionsList />} />
        <Route path="/collection/:urlHandle" element={<CollectionDetail />} />
        <Route path="/collections/:urlHandle" element={<CollectionDetail />} />
        <Route path="/product/:urlHandle" element={<Product />} />
        <Route path="/product/preview" element={<Product />} />
        <Route path="/collection/preview" element={<CollectionDetail />} />
        <Route path="/products" element={<Home />} />
        <Route path="/products/:id" element={<Product />} />
        <Route path="/collections/preview" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot" element={<Forgot />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<Orders />} />
        <Route path="/my-orders/:orderId" element={<CheckoutOrderStatusPage />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/thank-you" element={<CheckoutThankYouPage />} />
        <Route path="/checkout/payment-confirmation" element={<CheckoutPaymentConfirmationPage />} />
        <Route path="/blogs/all" element={AllBlogs ? <AllBlogs /> : Blog ? <Blog /> : <Home />} />
        <Route
          path="/blogs/:blogHandle"
          element={Blog ? <Blog /> : <Home />}
        />
        <Route
          path="/blogs/:blogHandle/:articleHandle"
          element={BlogPost ? <BlogPost /> : <Home />}
        />
        <Route
          path="/search"
          element={
            contract.SearchPage ? (
              <Search />
            ) : (
              <CustomThemeTemplatePage templateId="search" fallbackSectionIds={['search', 'search_results']} />
            )
          }
        />
        <Route
          path="/password"
          element={
            <CustomThemeTemplatePage
              templateId="password"
              fallbackSectionIds={['password_main', 'email_signup']}
            />
          }
        />
        <Route
          path="/404"
          element={
            NotFound ? (
              <NotFound />
            ) : (
              <CustomThemeTemplatePage
                templateId="404"
                fallbackSectionIds={['not_found_main', 'featured_collection']}
              />
            )
          }
        />
        <Route
          path="*"
          element={
            NotFound ? (
              <NotFound />
            ) : (
              <CustomThemeTemplatePage
                templateId="404"
                fallbackSectionIds={['not_found_main', 'featured_collection']}
              />
            )
          }
        />
      </Routes>
    </MemoryRouter>
  );
}
