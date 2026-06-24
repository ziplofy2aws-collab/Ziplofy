import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { StorefrontSeoManager } from '../seo/StorefrontSeoManager.tsx';
import {
  renderCheckoutAuthRoutes,
  renderThemePageRoutes,
} from '../theme-preview/ThemePageRouteElements.tsx';

export function CustomThemeRoutes() {
  return (
    <Router>
      <StorefrontSeoManager />
      <Routes>
        {renderCheckoutAuthRoutes()}
        {renderThemePageRoutes({ excludeCheckoutAuth: true })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
