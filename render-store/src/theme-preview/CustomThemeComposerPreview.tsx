import { useEffect, useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@ziplofy/create-theme/runtime';
import { previewPageToTemplateId } from '@ziplofy/create-theme/utils/theme-page-registry';
import { postToParent } from './previewBridge';
import { previewPageToRoute, type ThemePreviewPage } from './previewBridge';
import { renderThemePageRoutes } from './ThemePageRouteElements';

type Props = {
  page: ThemePreviewPage;
  pageRevision: number;
};

export function CustomThemeComposerPreview({ page, pageRevision }: Props) {
  useEffect(() => {
    postToParent({ source: 'ziplofy-theme-preview', type: 'ZIPLOFY_PREVIEW_LOADED' });
  }, [page, pageRevision]);

  const routeKey = `${page}-${pageRevision}`;
  const initialEntry = useMemo(() => previewPageToRoute(page), [page]);
  const fallbackTemplateId = previewPageToTemplateId(page);

  return (
    <MemoryRouter key={routeKey} initialEntries={[initialEntry]}>
      <Routes>
        {renderThemePageRoutes()}
        <Route
          path="*"
          element={<CustomThemeTemplatePage templateId={fallbackTemplateId} />}
        />
      </Routes>
    </MemoryRouter>
  );
}
