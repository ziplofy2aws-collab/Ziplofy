import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { useStorefrontAuth } from './contexts/storefront-auth.context';
import { CheckoutAuthRequiredRoute } from './components/auth/CheckoutAuthRequiredRoute';
import { CheckoutOrdersPage } from './pages/checkout-profile/CheckoutOrdersPage';
import { CheckoutOrderStatusPage } from './pages/checkout-profile/CheckoutOrderStatusPage';
import { CheckoutProfilePage } from './pages/checkout-profile/CheckoutProfilePage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { CheckoutThankYouPage } from './pages/checkout/CheckoutThankYouPage';
import { CheckoutPaymentConfirmationPage } from './pages/checkout/CheckoutPaymentConfirmationPage';
import { StorefrontBlogContentShell } from './components/StorefrontBlogContentShell.tsx';
import { StorefrontBlogByUrlHandleLoader } from './components/StorefrontBlogByUrlHandleLoader.tsx';
import { StorefrontBlogPostByUrlHandleLoader } from './components/StorefrontBlogPostByUrlHandleLoader.tsx';
import { StorefrontCollectionByUrlHandleLoader } from './components/StorefrontCollectionByUrlHandleLoader.tsx';
import { StorefrontCollectionsListLoader } from './components/StorefrontCollectionsListLoader.tsx';
import {
  LegacyCollectionRedirect,
  LegacyProductRedirect,
} from './components/StorefrontLegacyRedirects.tsx';
import { StorefrontProductSeoLoader } from './components/StorefrontProductSeoLoader.tsx';
import { StorefrontBlogPage } from './pages/StorefrontBlogPage.tsx';
import { StorefrontBlogPostPage } from './pages/StorefrontBlogPostPage.tsx';
import { StorefrontSeoManager } from './seo/StorefrontSeoManager.tsx';
import { StorefrontNotFoundPage } from './components/StorefrontNotFoundPage';
import { useStorefront } from './contexts/store.context';
import { shouldUseComposerRuntime } from './utils/themeComposer';
import { useLoadedThemeContract } from './themes/RemoteThemeProvider.tsx';

const StorefrontHomeRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.HomePage;
  return <Page />;
};

const StorefrontProductRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.ProductPage;
  return <Page />;
};

const StorefrontAuthRoute = () => {
  const location = useLocation();
  const theme = useLoadedThemeContract();
  const { user, initializing } = useStorefrontAuth();
  const Page = location.pathname.includes('/signup') ? theme.SignupPage : theme.LoginPage;

  if (initializing) return null;
  if (user) return <Navigate to="/" replace />;

  return <Page />;
};

const StorefrontForgotRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.ForgotPasswordPage ?? theme.LoginPage;
  return <Page />;
};

const StorefrontProfileRoute = () => (
  <CheckoutAuthRequiredRoute>
    <CheckoutProfilePage />
  </CheckoutAuthRequiredRoute>
);

const StorefrontOrdersRoute = () => (
  <CheckoutAuthRequiredRoute>
    <CheckoutOrdersPage />
  </CheckoutAuthRequiredRoute>
);

const StorefrontOrderStatusRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.OrderDetailsPage;
  if (Page) {
    return (
      <CheckoutAuthRequiredRoute>
        <Page />
      </CheckoutAuthRequiredRoute>
    );
  }
  return (
    <CheckoutAuthRequiredRoute>
      <CheckoutOrderStatusPage />
    </CheckoutAuthRequiredRoute>
  );
};

const StorefrontPreferencesRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.PreferencesPage;
  return <Page />;
};

const StorefrontCartRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.CartPage;
  return <Page />;
};

const StorefrontSearchRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.SearchPage ?? theme.HomePage;
  return <Page />;
};

const StorefrontCollectionsListRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.CollectionsListPage ?? theme.HomePage;
  return (
    <>
      <StorefrontCollectionsListLoader />
      <Page />
    </>
  );
};

const StorefrontAllProductsRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.AllProductsPage ?? theme.HomePage;
  return (
    <>
      <StorefrontCollectionByUrlHandleLoader urlHandleOverride="all" />
      <Page />
    </>
  );
};

/** Prefer remote theme 404, then composer template 404, else minimal fallback. */
const StorefrontCatchAllRoute = () => {
  const theme = useLoadedThemeContract();
  if (theme.NotFoundPage) {
    const Page = theme.NotFoundPage;
    return <Page />;
  }

  const { isStoreCustomTheme, themeConfig, remoteThemeJsUrl } = useStorefront();
  const useComposer = shouldUseComposerRuntime({
    isStoreCustomTheme,
    themeConfig,
    remoteThemeJsUrl,
  });
  if (useComposer && themeConfig) {
    return <StorefrontNotFoundPage />;
  }
  return (
    <div style={{ padding: 48, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>Page not found</h1>
      <p style={{ margin: '0 0 20px', color: '#555' }}>
        The page you requested could not be found.
      </p>
      <a href="/" style={{ color: '#005bd3' }}>
        Continue shopping
      </a>
    </div>
  );
};


const StorefrontBlogListRoute = () => {
  const theme = useLoadedThemeContract();
  if (theme.BlogPage) {
    const Page = theme.BlogPage;
    return (
      <>
        <StorefrontBlogByUrlHandleLoader />
        <Page />
      </>
    );
  }
  return (
    <StorefrontBlogContentShell>
      <StorefrontBlogByUrlHandleLoader />
      <StorefrontBlogPage />
    </StorefrontBlogContentShell>
  );
};

const StorefrontAllBlogsRoute = () => {
  const theme = useLoadedThemeContract();
  if (theme.AllBlogsPage) {
    const Page = theme.AllBlogsPage;
    return <Page />;
  }
  if (theme.BlogPage) {
    const Page = theme.BlogPage;
    return <Page />;
  }
  return (
    <StorefrontBlogContentShell>
      <StorefrontBlogPage />
    </StorefrontBlogContentShell>
  );
};


const StorefrontBlogPostRoute = () => {
  const theme = useLoadedThemeContract();
  if (theme.BlogPostPage) {
    const Page = theme.BlogPostPage;
    return (
      <>
        <StorefrontBlogPostByUrlHandleLoader />
        <Page />
      </>
    );
  }
  return (
    <StorefrontBlogContentShell>
      <StorefrontBlogPostByUrlHandleLoader />
      <StorefrontBlogPostPage />
    </StorefrontBlogContentShell>
  );
};


const StorefrontCollectionDetailRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.CollectionPage ?? theme.HomePage;
  return (
    <>
      <StorefrontCollectionByUrlHandleLoader />
      <Page />
    </>
  );
};

export const StorefrontRoutes = () => (
  <Router>
    <StorefrontSeoManager />
    <Routes>
      <Route path="/" element={<StorefrontHomeRoute />} />

      {/* Catalog: all products */}
      <Route path="/collections/all" element={<StorefrontAllProductsRoute />} />

      {/* Catalog: all collections index */}
      <Route path="/collections" element={<StorefrontCollectionsListRoute />} />

      {/* Catalog: single collection */}
      <Route path="/collection/:urlHandle" element={<StorefrontCollectionDetailRoute />} />

      {/* Catalog: single product */}
      <Route
        path="/product/:urlHandle"
        element={
          <>
            <StorefrontProductSeoLoader />
            <StorefrontProductRoute />
          </>
        }
      />

      <Route path="/cart" element={<StorefrontCartRoute />} />

      {/* Legacy redirects */}
      <Route path="/products" element={<Navigate to="/collections/all" replace />} />
      <Route path="/products/:id" element={<LegacyProductRedirect />} />
      <Route path="/collection" element={<Navigate to="/collections" replace />} />
      <Route path="/collections/:urlHandle" element={<LegacyCollectionRedirect />} />

      <Route path="/auth/login" element={<StorefrontAuthRoute />} />
      <Route path="/auth/signup" element={<StorefrontAuthRoute />} />
      <Route path="/auth/forgot" element={<StorefrontForgotRoute />} />
      <Route path="/profile" element={<StorefrontProfileRoute />} />
      <Route path="/my-orders" element={<StorefrontOrdersRoute />} />
      <Route path="/my-orders/:orderId" element={<StorefrontOrderStatusRoute />} />
      <Route path="/preferences" element={<StorefrontPreferencesRoute />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/thank-you" element={<CheckoutThankYouPage />} />
      <Route path="/checkout/payment-confirmation" element={<CheckoutPaymentConfirmationPage />} />
      <Route path="/search" element={<StorefrontSearchRoute />} />
      <Route path="/blogs/all" element={<StorefrontAllBlogsRoute />} />
      <Route path="/blogs/:blogHandle/:articleHandle" element={<StorefrontBlogPostRoute />} />
      <Route path="/blogs/:blogHandle" element={<StorefrontBlogListRoute />} />
      <Route path="/404" element={<StorefrontCatchAllRoute />} />
      <Route path="*" element={<StorefrontCatchAllRoute />} />
    </Routes>
  </Router>
);
