import { isPageTemplatePreviewPage } from './page-templates.util';
import { pagePath } from '../../utils/storefront-paths';
import type { StorePage } from '../../contexts/store-page.context';

/** Default storefront path for page template editor preview. */
export const PAGE_PREVIEW_ROUTE_PLACEHOLDER = '/pages/preview';

export function pagePreviewRouteFromHandle(urlHandle: string | null | undefined): string {
  const handle = urlHandle?.trim();
  if (!handle) return `${PAGE_PREVIEW_ROUTE_PLACEHOLDER}?preview=1`;
  return `${pagePath(handle)}?preview=1`;
}

export function pickDefaultPreviewPage(
  pages: Pick<StorePage, 'urlHandle' | 'title' | 'visibility'>[]
): Pick<StorePage, 'urlHandle' | 'title' | 'visibility'> | null {
  if (!pages.length) return null;
  const visible = pages.find((p) => p.visibility === 'visible' && Boolean(p.urlHandle?.trim()));
  if (visible) return visible;
  return pages.find((p) => Boolean(p.urlHandle?.trim())) ?? pages[0] ?? null;
}

export function resolvePageTemplatePreviewRoute(
  previewPage: string,
  previewPageHandle: string | null | undefined
): string | undefined {
  if (!isPageTemplatePreviewPage(previewPage)) return undefined;
  return pagePreviewRouteFromHandle(previewPageHandle);
}
