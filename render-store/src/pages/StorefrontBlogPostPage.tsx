import { Link, useSearchParams } from 'react-router-dom';
import { StorefrontBlogCommentsSection } from '@/components/StorefrontBlogCommentsSection';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';

function formatPostDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function StorefrontBlogPostPage() {
  const [searchParams] = useSearchParams();
  const { storeFrontChecked, storeFrontMeta } = useStorefront();
  const { activeBlog, activePost, loading, error } = useStorefrontBlogs();
  const isPreview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  if (!storeFrontChecked || !storeFrontMeta?.storeId || (loading && !activePost)) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-inner">
          <p style={{ margin: 0, color: '#6b7280' }}>Loading article…</p>
        </div>
      </div>
    );
  }

  if (error || !activePost || !activeBlog) {
    const notFound =
      !error ||
      error.includes('404') ||
      error.toLowerCase().includes('not found');
    const message = notFound
      ? isPreview
        ? 'This article could not be found. Check that the blog and article URL handles are correct.'
        : 'This article could not be found or is not published. Set visibility to Visible in admin, or open the article using the View button (preview link).'
      : error || 'This article could not be found or is not visible on the storefront.';

    return (
      <div className="blog-detail-page">
        <div className="blog-detail-inner">
          <h1 style={{ fontSize: 24, marginTop: 0 }}>Article not found</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-inner">
        {isPreview && activePost.visibility === 'hidden' ? (
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
            Preview mode — this article is hidden and only visible to you through this preview link.
          </div>
        ) : null}
        <nav className="blog-detail-breadcrumb" aria-label="Breadcrumb">
          <Link to={`/blogs/${activeBlog.urlHandle}`}>{activeBlog.title}</Link>
          <span className="blog-detail-breadcrumb-sep">/</span>
          <span className="blog-detail-breadcrumb-current">{activePost.title}</span>
        </nav>

        {activePost.featuredImageUrl ? (
          <div className="blog-detail-hero">
            <div className="blog-detail-hero-image">
              <img src={activePost.featuredImageUrl} alt={activePost.title} />
            </div>
          </div>
        ) : null}

        <h1 className="blog-detail-title">{activePost.title}</h1>
        <div className="blog-detail-meta">
          {activePost.author ? (
            <span className="blog-detail-meta-item">By {activePost.author}</span>
          ) : null}
          {activePost.updatedAt ? (
            <span className="blog-detail-meta-item">{formatPostDate(activePost.updatedAt)}</span>
          ) : null}
        </div>

        {activePost.content ? (
          <div className="blog-detail-content">
            <div
              className="blog-detail-body storefront-blog-content"
              dangerouslySetInnerHTML={{ __html: activePost.content }}
            />
          </div>
        ) : activePost.excerpt ? (
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#555' }}>{activePost.excerpt}</p>
        ) : null}

        <StorefrontBlogCommentsSection />
      </div>
    </div>
  );
}
