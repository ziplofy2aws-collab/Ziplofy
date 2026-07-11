import { ensureCollectionTemplateRegistry, isCollectionTemplatePreviewPage } from './collection-templates.util';
import { ensureProductTemplateRegistry, isProductTemplatePreviewPage } from './product-templates.util';
import {
  ensureBlogPostsTemplateRegistry,
  ensureBlogsTemplateRegistry,
  isBlogPostsTemplatePreviewPage,
  isBlogsTemplatePreviewPage,
} from './blog-templates.util';

export function ensureAllAlternateTemplateRegistries(config: Record<string, unknown>): void {
  ensureProductTemplateRegistry(config);
  ensureCollectionTemplateRegistry(config);
  ensureBlogsTemplateRegistry(config);
  ensureBlogPostsTemplateRegistry(config);
}

export function isAlternateTemplatePreviewPage(page: string): boolean {
  return (
    isProductTemplatePreviewPage(page) ||
    isCollectionTemplatePreviewPage(page) ||
    isBlogsTemplatePreviewPage(page) ||
    isBlogPostsTemplatePreviewPage(page)
  );
}

export function alternateTemplateSavedToastLabel(page: string): string {
  if (isProductTemplatePreviewPage(page)) return 'Product template saved';
  if (isCollectionTemplatePreviewPage(page)) return 'Collection template saved';
  if (isBlogsTemplatePreviewPage(page)) return 'Blog template saved';
  if (isBlogPostsTemplatePreviewPage(page)) return 'Blog post template saved';
  return 'Template saved';
}

export function alternateTemplateCreatedToastMessage(page: string): string {
  if (isProductTemplatePreviewPage(page)) {
    return 'Product template created — click Save to keep it after you leave';
  }
  if (isCollectionTemplatePreviewPage(page)) {
    return 'Collection template created — click Save to keep it after you leave';
  }
  if (isBlogsTemplatePreviewPage(page)) {
    return 'Blog template created — click Save to keep it after you leave';
  }
  if (isBlogPostsTemplatePreviewPage(page)) {
    return 'Blog post template created — click Save to keep it after you leave';
  }
  return 'Template created — click Save to keep it after you leave';
}
