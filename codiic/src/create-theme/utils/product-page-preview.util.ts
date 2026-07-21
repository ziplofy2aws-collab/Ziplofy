import type { Product } from '../../contexts/product.context';
import { productPath } from '../../utils/storefront-paths';
import { isProductTemplatePreviewPage } from './product-templates.util';

/** Default storefront path for product template editor preview. */
export const PRODUCT_PREVIEW_ROUTE_PLACEHOLDER = '/product/preview';

/** Storefront public APIs only serve active products — drafts 404 in preview. */
export function isProductPreviewable(
  product: Pick<Product, 'urlHandle' | 'status' | 'onlineStorePublishing' | 'isDeleted'>
): boolean {
  return (
    !product.isDeleted &&
    product.status === 'active' &&
    product.onlineStorePublishing !== false &&
    Boolean(product.urlHandle?.trim())
  );
}

export function productPreviewRouteFromHandle(
  urlHandle: string | null | undefined
): string {
  const handle = urlHandle?.trim();
  if (!handle) return PRODUCT_PREVIEW_ROUTE_PLACEHOLDER;
  return productPath(handle);
}

export function pickDefaultPreviewProduct<
  T extends Pick<Product, 'urlHandle' | 'title' | 'status' | 'onlineStorePublishing' | 'isDeleted'>,
>(products: T[]): T | null {
  if (!products.length) return null;
  // Never fall back to drafts — preview canvas cannot load them.
  return products.find((product) => isProductPreviewable(product)) ?? null;
}

export function resolveProductTemplatePreviewRoute(
  previewPage: string,
  previewProductHandle: string | null | undefined
): string | undefined {
  if (!isProductTemplatePreviewPage(previewPage)) return undefined;
  return productPreviewRouteFromHandle(previewProductHandle);
}
