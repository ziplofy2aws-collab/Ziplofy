import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';
import { applyStorefrontSeoToDocument } from './document-head.util';
import { resolveStorefrontSeo } from './resolve-storefront-seo';

/**
 * Platform-owned SEO runtime. Themes do not need to set document title or meta tags.
 */
export function StorefrontSeoManager() {
  const { pathname } = useLocation();
  const { storeFrontMeta } = useStorefront();
  const { productDetail } = useStorefrontProducts();
  const { activeCollection } = useStorefrontCollections();
  const seo = useMemo(() => {
    if (!storeFrontMeta) return null;

    return resolveStorefrontSeo({
      pathname,
      origin: window.location.origin,
      store: {
        name: storeFrontMeta.name,
        description: storeFrontMeta.description,
        storeId: storeFrontMeta.storeId,
      },
      product: productDetail,
      collection: activeCollection,
    });
  }, [pathname, storeFrontMeta, productDetail, activeCollection]);

  useEffect(() => {
    if (!seo) return;
    applyStorefrontSeoToDocument(seo);
  }, [seo]);

  return null;
}
