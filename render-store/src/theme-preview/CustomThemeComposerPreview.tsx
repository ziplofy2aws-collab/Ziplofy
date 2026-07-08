import { useEffect, useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { previewPageToTemplateId } from '@codiic/create-theme/utils/theme-page-registry';
import { postToParent } from './previewBridge';
import { previewPageToRoute, type ThemePreviewPage } from './previewBridge';
import { renderThemePageRoutes, renderCheckoutAuthRoutes, renderCheckoutProfileRoutes, renderCheckoutPageRoutes } from './ThemePageRouteElements';

type Props = {
  page: ThemePreviewPage;
  pageRevision: number;
  previewRoute?: string;
};

export function CustomThemeComposerPreview({ page, pageRevision, previewRoute }: Props) {
  useEffect(() => {
    postToParent({ source: 'codiic-theme-preview', type: 'codiic_PREVIEW_LOADED' });
  }, [page, pageRevision, previewRoute]);

  const routeKey = `${page}-${previewRoute ?? ''}-${pageRevision}`;
  const initialEntry = useMemo(
    () => previewRoute ?? previewPageToRoute(page),
    [page, previewRoute]
  );
  const fallbackTemplateId = previewPageToTemplateId(page);

  return (
    <MemoryRouter key={routeKey} initialEntries={[initialEntry]}>
      <Routes>
        {renderCheckoutAuthRoutes()}
        {renderCheckoutProfileRoutes()}
        {renderCheckoutPageRoutes()}
        {renderThemePageRoutes({ excludeCheckoutAuth: true, excludeCheckoutProfile: true })}
        <Route
          path="*"
          element={<CustomThemeTemplatePage templateId={fallbackTemplateId} />}
        />
      </Routes>
    </MemoryRouter>
  );
}
