import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { StorefrontCollectionByUrlHandleLoader } from './components/StorefrontCollectionByUrlHandleLoader.tsx';
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
  const Page = location.pathname.includes('/signup') ? theme.SignupPage : theme.LoginPage;
  return <Page />;
};

const StorefrontForgotRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.ForgotPasswordPage ?? theme.LoginPage;
  return <Page />;
};

const StorefrontProfileRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.ProfilePage;
  return <Page />;
};

const StorefrontOrdersRoute = () => {
  const theme = useLoadedThemeContract();
  const Page = theme.OrdersPage;
  return <Page />;
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

export const StorefrontRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<StorefrontHomeRoute />} />
      <Route path="/products" element={<StorefrontHomeRoute />} />
      <Route path="/products/:id" element={<StorefrontProductRoute />} />
      <Route path="/collection" element={<StorefrontHomeRoute />} />
      <Route path="/collections/all" element={<StorefrontHomeRoute />} />
      <Route path="/collections" element={<StorefrontHomeRoute />} />
      <Route
        path="/collections/:urlHandle"
        element={
          <>
            <StorefrontCollectionByUrlHandleLoader />
            <StorefrontHomeRoute />
          </>
        }
      />
      <Route path="/auth/login" element={<StorefrontAuthRoute />} />
      <Route path="/auth/signup" element={<StorefrontAuthRoute />} />
      <Route path="/auth/forgot" element={<StorefrontForgotRoute />} />
      <Route path="/profile" element={<StorefrontProfileRoute />} />
      <Route path="/my-orders" element={<StorefrontOrdersRoute />} />
      <Route path="/preferences" element={<StorefrontPreferencesRoute />} />
      <Route path="/cart" element={<StorefrontCartRoute />} />
      <Route path="/search" element={<StorefrontHomeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);
