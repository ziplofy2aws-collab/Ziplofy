import type { Product } from '../../contexts/product.context';
import { productPath } from '../../utils/storefront-paths';
import { isProductTemplatePreviewPage } from './product-templates.util';

/** Default storefront path for product template editor preview. */
export const PRODUCT_PREVIEW_ROUTE_PLACEHOLDER = '/product/preview';

export function productPreviewRouteFromHandle(
  urlHandle: string | null | undefined
): string {
  const handle = urlHandle?.trim();
  if (!handle) return PRODUCT_PREVIEW_ROUTE_PLACEHOLDER;
  return productPath(handle);
}

export function pickDefaultPreviewProduct<
  T extends Pick<Product, 'urlHandle' | 'title' | 'status' | 'onlineStorePublishing'>,
>(products: T[]): T | null {
  if (!products.length) return null;
  return (
    products.find(
      (product) =>
        product.urlHandle?.trim() &&
        product.status === 'active' &&
        product.onlineStorePublishing
    ) ??
    products.find((product) => Boolean(product.urlHandle?.trim())) ??
    products[0] ??
    null
  );
}

export function resolveProductTemplatePreviewRoute(
  previewPage: string,
  previewProductHandle: string | null | undefined
): string | undefined {
  if (!isProductTemplatePreviewPage(previewPage)) return undefined;
  return productPreviewRouteFromHandle(previewProductHandle);
}
