import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { CustomThemeTemplatePage } from '../create-theme/runtime';
import {
  listThemePageRouteSpecs,
  previewPageToTemplateId,
} from '../create-theme/utils/theme-page-registry';

const ROUTE_SPECS = listThemePageRouteSpecs();

function resolveRouteTemplateId(specTemplateId: string, activeTemplateId?: string): string {
  if (!activeTemplateId || activeTemplateId === specTemplateId) return specTemplateId;
  if (activeTemplateId.startsWith(`${specTemplateId}.`)) return activeTemplateId;
  return specTemplateId;
}

/**
 * All theme template routes rendered through the composer.
 * Webpanel storefronts have no product/collection loaders — entity-driven
 * sections render their empty/fallback states.
 */
export function renderThemePageRoutes(activeTemplateId?: string): ReactElement[] {
  return ROUTE_SPECS.map((spec) => (
    <Route
      key={spec.path}
      path={spec.path}
      element={
        <CustomThemeTemplatePage
          templateId={resolveRouteTemplateId(spec.templateId, activeTemplateId)}
          fallbackSectionIds={spec.fallbackSectionIds}
        />
      }
    />
  ));
}

export { previewPageToTemplateId };
