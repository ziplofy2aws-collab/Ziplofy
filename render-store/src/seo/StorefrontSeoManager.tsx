import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';
import { useStorefrontPages } from '@/contexts/storefront-pages.context';
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
  const { activeBlog, activePost } = useStorefrontBlogs();
  const { activePage } = useStorefrontPages();
  const seo = useMemo(() => {
    if (!storeFrontMeta) return null;

    return resolveStorefrontSeo({
      pathname,
      origin: window.location.origin,
      store: {
        name: storeFrontMeta.name,
        description: storeFrontMeta.description,
        storeId: storeFrontMeta.storeId,
        seoHomePageTitle: storeFrontMeta.seoHomePageTitle,
        seoMetaDescription: storeFrontMeta.seoMetaDescription,
        seoSocialImageUrl: storeFrontMeta.seoSocialImageUrl,
      },
      product: productDetail,
      collection: activeCollection,
      blog: activeBlog,
      blogPost: activePost,
      page: activePage,
    });
  }, [
    pathname,
    storeFrontMeta,
    productDetail,
    activeCollection,
    activeBlog,
    activePost,
    activePage,
  ]);

  useEffect(() => {
    if (!seo) return;
    applyStorefrontSeoToDocument(seo);
  }, [seo]);

  return null;
}
