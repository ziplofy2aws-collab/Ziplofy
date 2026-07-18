import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { resolveProductTemplateIdFromThemeConfig } from '@codiic/create-theme/utils/product-templates.util';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';
import { StorefrontProductPreviewLoader } from './StorefrontProductPreviewLoader';

type ProductTemplateRouteProps = {
  /** Editor preview override (e.g. `product.sale`) — wins over theme JSON assignments. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Product details route. Template selection is a local lookup in the already-loaded
 * theme JSON; product data continues loading through the normal product API.
 */
export function ProductTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = ['product_main'],
}: ProductTemplateRouteProps) {
  const params = useParams<{ id?: string; urlHandle?: string }>();
  const routeParam = params.urlHandle ?? params.id;
  const { themeConfig } = useStorefront();
  const { productDetail, productDetailLoading } = useStorefrontProducts();

  const assignedTemplateId = useMemo(() => {
    if (activeTemplateId && (activeTemplateId === 'product' || activeTemplateId.startsWith('product.'))) {
      return activeTemplateId;
    }

    return resolveProductTemplateIdFromThemeConfig(themeConfig, routeParam);
  }, [activeTemplateId, routeParam, themeConfig]);

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
