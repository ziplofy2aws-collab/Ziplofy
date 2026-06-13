import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { StorefrontSeoManager } from '../seo/StorefrontSeoManager.tsx';
import { renderThemePageRoutes } from '../theme-preview/ThemePageRouteElements.tsx';

export function CustomThemeRoutes() {
  return (
    <Router>
      <StorefrontSeoManager />
      <Routes>
        {renderThemePageRoutes()}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
