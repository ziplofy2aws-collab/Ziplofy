import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontPages } from '@/contexts/storefront-pages.context';
import { normalizeStorefrontPathHandle } from '@/utils/storefront-path-handle.util';

/**
 * When the route is `/pages/:urlHandle`, loads the visible store page
 * (or any page when `?preview=1`).
 */
export function StorefrontPageByUrlHandleLoader() {
  const { urlHandle } = useParams<{ urlHandle: string }>();
  const [searchParams] = useSearchParams();
  const { storeFrontMeta } = useStorefront();
  const { getPageByUrlHandle, listPagesByStoreId, clearActivePage } = useStorefrontPages();

  const storeId = storeFrontMeta?.storeId;
  const isPreview =
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  useEffect(() => {
    const handle = normalizeStorefrontPathHandle(urlHandle ?? '');

    if (!storeId) {
      clearActivePage();
      return;
    }

    void (async () => {
      try {
        let resolved = handle && handle !== 'preview' ? handle : '';
        if (!resolved) {
          const pages = await listPagesByStoreId(storeId, { preview: isPreview });
          resolved = normalizeStorefrontPathHandle(pages[0]?.urlHandle ?? '');
        }
        if (!resolved) {
          clearActivePage();
          return;
        }
        await getPageByUrlHandle(storeId, resolved, { preview: isPreview });
      } catch {
        /* errors surfaced via context.error */
      }
    })();

    return () => {
      clearActivePage();
    };
  }, [
    storeId,
    urlHandle,
    isPreview,
    getPageByUrlHandle,
    listPagesByStoreId,
    clearActivePage,
  ]);

  return null;
}
