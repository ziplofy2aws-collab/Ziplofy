import { ensureCollectionTemplateRegistry, isCollectionTemplatePreviewPage } from './collection-templates.util';
import { ensureProductTemplateRegistry, isProductTemplatePreviewPage } from './product-templates.util';

export function ensureAllAlternateTemplateRegistries(config: Record<string, unknown>): void {
  ensureProductTemplateRegistry(config);
  ensureCollectionTemplateRegistry(config);
}

export function isAlternateTemplatePreviewPage(page: string): boolean {
  return isProductTemplatePreviewPage(page) || isCollectionTemplatePreviewPage(page);
}

export function alternateTemplateSavedToastLabel(page: string): string {
  if (isProductTemplatePreviewPage(page)) return 'Product template saved';
  if (isCollectionTemplatePreviewPage(page)) return 'Collection template saved';
  return 'Template saved';
}

export function alternateTemplateCreatedToastMessage(page: string): string {
  if (isProductTemplatePreviewPage(page)) {
    return 'Product template created — click Save to keep it after you leave';
  }
  if (isCollectionTemplatePreviewPage(page)) {
    return 'Collection template created — click Save to keep it after you leave';
  }
  return 'Template created — click Save to keep it after you leave';
}
