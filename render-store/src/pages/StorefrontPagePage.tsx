import { useSearchParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontPages } from '@/contexts/storefront-pages.context';

/** Renders a custom Online Store page title + rich-text content. */
export function StorefrontPagePage() {
  const [searchParams] = useSearchParams();
  const { storeFrontChecked, storeFrontMeta } = useStorefront();
  const { activePage, loading, error } = useStorefrontPages();
  const isPreview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  if (!storeFrontChecked || !storeFrontMeta?.storeId || (loading && !activePage)) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-inner">
          <p style={{ margin: 0, color: '#6b7280' }}>Loading page…</p>
        </div>
      </div>
    );
  }

  if (error || !activePage) {
    const notFound =
      !error || error.includes('404') || error.toLowerCase().includes('not found');
    const message = notFound
      ? isPreview
        ? 'This page could not be found. Check that the URL handle is correct.'
        : 'This page could not be found or is not published. Set visibility to Visible in Online Store → Pages.'
      : error || 'This page could not be found or is not visible on the storefront.';

    return (
      <div className="blog-detail-page">
        <div className="blog-detail-inner">
          <h1 style={{ fontSize: 24, marginTop: 0 }}>Page not found</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-inner">
        {isPreview && activePage.visibility === 'hidden' ? (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 8,
              background: '#eff6ff',
              color: '#1e40af',
              fontSize: 14,
            }}
          >
            Preview mode — this page is hidden and only visible through this preview link.
          </div>
        ) : null}

        <h1 className="blog-detail-title">{activePage.title}</h1>

        {activePage.content?.trim() ? (
          <div className="blog-detail-content">
            <div
              className="blog-detail-body storefront-page-content"
              dangerouslySetInnerHTML={{ __html: activePage.content }}
            />
          </div>
        ) : (
          <p style={{ margin: 0, color: '#6b7280', fontSize: 16, lineHeight: 1.7 }}>
            This page has no content yet.
          </p>
        )}
      </div>
    </div>
  );
}
