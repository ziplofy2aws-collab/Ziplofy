import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';
import { StorefrontProductPreviewLoader } from './StorefrontProductPreviewLoader';

function resolveProductJsonTemplateId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === 'product') return 'product';
  if (normalized.startsWith('product.')) return normalized;
  return 'product';
}

type ProductTemplateRouteProps = {
  /** Editor preview override (e.g. `product.sale`) — wins over the product's assignment. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Product details route: loads the product, then renders the assigned theme template
 * (`default` → `product`, or `product.{slug}` when present in theme config).
 */
export function ProductTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = ['product_main'],
}: ProductTemplateRouteProps) {
  const params = useParams<{ id?: string; urlHandle?: string }>();
  const routeParam = params.urlHandle ?? params.id;
  const { themeConfig } = useStorefront();
  const { productDetail, products, productDetailLoading } = useStorefrontProducts();

  const assignedTemplateId = useMemo(() => {
    if (activeTemplateId && (activeTemplateId === 'product' || activeTemplateId.startsWith('product.'))) {
      return activeTemplateId;
    }

    const product =
      productDetail ??
      (routeParam && routeParam !== 'preview'
        ? null
        : products[0] ?? null);

    const requested = resolveProductJsonTemplateId(
      (product as { themeTemplate?: string } | null)?.themeTemplate
    );
    const templates = (themeConfig?.templates ?? {}) as Record<string, unknown>;
    if (requested !== 'product' && templates[requested]) return requested;
    return 'product';
  }, [activeTemplateId, productDetail, products, routeParam, themeConfig]);

  const waitingForProduct =
    Boolean(routeParam) &&
    routeParam !== 'preview' &&
    !productDetail &&
    productDetailLoading;

  return (
    <>
      <StorefrontProductPreviewLoader />
      {waitingForProduct ? null : (
        <CustomThemeTemplatePage
          templateId={assignedTemplateId}
          fallbackSectionIds={fallbackSectionIds}
        />
      )}
    </>
  );
}
