import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { StorefrontSeoManager } from '../seo/StorefrontSeoManager.tsx';
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
        {renderThemePageRoutes({ excludeCheckoutAuth: true, excludeCheckoutProfile: true })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
