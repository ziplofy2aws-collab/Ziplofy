import { useEffect, useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CustomThemeTemplatePage } from '../create-theme/runtime';
import { postToParent, previewPageToRoute, type ThemePreviewPage } from './previewBridge';
import { renderThemePageRoutes, previewPageToTemplateId } from './ThemePageRouteElements';

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
  const activeTemplateId = previewPageToTemplateId(page);

  return (
    <MemoryRouter key={routeKey} initialEntries={[initialEntry]}>
      <Routes>
        {renderThemePageRoutes(activeTemplateId)}
        <Route
          path="*"
          element={<CustomThemeTemplatePage templateId={activeTemplateId} />}
        />
      </Routes>
    </MemoryRouter>
  );
}
