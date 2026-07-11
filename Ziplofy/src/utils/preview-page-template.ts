import {
  previewPageToTemplateId as registryPreviewPageToTemplateId,
  previewPageToRoute as registryPreviewPageToRoute,
  PREVIEW_PAGE_ROUTES,
  type ThemePageIcon,
} from '../create-theme/utils/theme-page-registry';

export { PREVIEW_PAGE_ROUTES, type ThemePageIcon };

/** Resolves editor preview page ids (incl. alternate templates) to config template keys. */
export function previewPageToTemplateId(page: string): string {
  return registryPreviewPageToTemplateId(page);
}

export function previewPageToRoute(page: string): string {
  return registryPreviewPageToRoute(page);
}

/** @deprecated Prefer previewPageToTemplateId */
export function templateIdForPage(page: string): string {
  return previewPageToTemplateId(page);
}
