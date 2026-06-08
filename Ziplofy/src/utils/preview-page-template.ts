import {
  previewPageToTemplateId as registryPreviewPageToTemplateId,
  previewPageToRoute,
  PREVIEW_PAGE_ROUTES,
  type ThemePageIcon,
} from '../create-theme/utils/theme-page-registry';

export { previewPageToRoute, PREVIEW_PAGE_ROUTES, type ThemePageIcon };

export function previewPageToTemplateId(page: string): string {
  return registryPreviewPageToTemplateId(page);
}

/** @deprecated Prefer previewPageToTemplateId */
export function templateIdForPage(page: string): string {
  return previewPageToTemplateId(page);
}
