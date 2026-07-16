import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { StorefrontSeoManager } from '../seo/StorefrontSeoManager.tsx';
import { StorefrontNotFoundPage } from '../components/StorefrontNotFoundPage';
import {
  renderCheckoutAuthRoutes,
  renderCheckoutProfileRoutes,
  renderCheckoutPageRoutes,
  renderThemePageRoutes,
} from '../theme-preview/ThemePageRouteElements.tsx';

export function CustomThemeRoutes() {
  return (
    <Router>
      <StorefrontSeoManager />
      <Routes>
        {renderCheckoutAuthRoutes()}
        {renderCheckoutProfileRoutes()}
        {renderCheckoutPageRoutes()}
        {renderThemePageRoutes({
          excludeCheckoutAuth: true,
          excludeCheckoutProfile: true,
          excludePaths: ['/404'],
        })}
        {/* Explicit + catch-all so unknown URLs show the theme 404 (not home). */}
        <Route path="/404" element={<StorefrontNotFoundPage />} />
        <Route path="*" element={<StorefrontNotFoundPage />} />
      </Routes>
    </Router>
  );
}
