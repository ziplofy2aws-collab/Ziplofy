import {
  previewPageToTemplateId as registryPreviewPageToTemplateId,
  previewPageToRoute,
  PREVIEW_PAGE_ROUTES,
  type ThemePageIcon,
} from '../create-theme/utils/theme-page-registry';
import {
  collectionTemplateIdFromPreviewPage,
} from '../create-theme/utils/collection-templates.util';
import {
  productTemplateIdFromPreviewPage,
} from '../create-theme/utils/product-templates.util';

export { previewPageToRoute, PREVIEW_PAGE_ROUTES, type ThemePageIcon };

export function previewPageToTemplateId(page: string): string {
  const productTemplateId = productTemplateIdFromPreviewPage(page);
  if (productTemplateId) return productTemplateId;
  const collectionTemplateId = collectionTemplateIdFromPreviewPage(page);
  if (collectionTemplateId) return collectionTemplateId;
  return registryPreviewPageToTemplateId(page);
}

/** @deprecated Prefer previewPageToTemplateId */
export function templateIdForPage(page: string): string {
  return previewPageToTemplateId(page);
}
