import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@ziplofy/create-theme/runtime';
import { CustomThemePageShell } from '@ziplofy/create-theme/runtime';
import { listThemePageRouteSpecs } from '@ziplofy/create-theme/utils/theme-page-registry';
import { StorefrontBlogByUrlHandleLoader } from '../components/StorefrontBlogByUrlHandleLoader.tsx';
import { StorefrontBlogPostByUrlHandleLoader } from '../components/StorefrontBlogPostByUrlHandleLoader.tsx';
import { StorefrontCollectionByUrlHandleLoader } from '../components/StorefrontCollectionByUrlHandleLoader.tsx';
import { StorefrontProductPreviewLoader } from '../components/StorefrontProductPreviewLoader.tsx';
import { StorefrontBlogPage } from '../pages/StorefrontBlogPage.tsx';
import { StorefrontBlogPostPage } from '../pages/StorefrontBlogPostPage.tsx';

const ROUTE_SPECS = listThemePageRouteSpecs();

/** Direct <Route> children for <Routes> — cannot wrap in a custom component (react-router v6). */
export function renderThemePageRoutes(): ReactElement[] {
  return ROUTE_SPECS.map((spec) => {
    const page = (
      <CustomThemeTemplatePage
        templateId={spec.templateId}
        fallbackSectionIds={spec.fallbackSectionIds}
      />
    );
    let element = page;
    if (spec.withBlogLoader) {
      element = (
        <CustomThemePageShell>
          <StorefrontBlogByUrlHandleLoader />
          <StorefrontBlogPage />
        </CustomThemePageShell>
      );
    } else if (spec.withBlogPostLoader) {
      element = (
        <CustomThemePageShell>
          <StorefrontBlogPostByUrlHandleLoader />
          <StorefrontBlogPostPage />
        </CustomThemePageShell>
      );
    }
    if (spec.withCollectionLoader) {
      element = (
        <>
          <StorefrontCollectionByUrlHandleLoader urlHandleOverride={spec.loadCollectionUrlHandle} />
          {page}
        </>
      );
    }
    if (spec.withProductLoader) {
      element = (
        <>
          <StorefrontProductPreviewLoader />
          {element}
        </>
      );
    }
    return <Route key={spec.path} path={spec.path} element={element} />;
  });
}
