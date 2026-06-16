import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../contexts/store.context';
import { applyAdminSeoToDocument } from './document-head.util';
import { resolveAdminSeo } from './resolve-admin-seo';

/**
 * Platform-owned admin SEO runtime. Sets document title and meta tags per admin route.
 */
export function AdminSeoManager() {
  const { pathname } = useLocation();
  const { stores, activeStoreId } = useStore();
  const activeStoreName = useMemo(
    () => stores.find((store) => store._id === activeStoreId)?.storeName ?? null,
    [stores, activeStoreId]
  );

  const seo = useMemo(
    () => resolveAdminSeo(pathname, activeStoreName),
    [pathname, activeStoreName]
  );

  useEffect(() => {
    applyAdminSeoToDocument(seo);
  }, [seo]);

  return null;
}
