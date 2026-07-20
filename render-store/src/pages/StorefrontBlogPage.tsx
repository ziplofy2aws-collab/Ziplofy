import { Link } from 'react-router-dom';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { normalizeStorefrontPathHandle } from '@/utils/storefront-path-handle.util';

function formatPostDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function blogArticleHref(blogHandle: string, postHandle: string): string {
  const blog = normalizeStorefrontPathHandle(blogHandle);
  const post = normalizeStorefrontPathHandle(postHandle);
  if (!blog) return '/blogs';
  if (!post) return `/blogs/${blog}`;
  return `/blogs/${blog}/${post}`;
}

export function StorefrontBlogPage() {
  const { activeBlog, posts, loading, error } = useStorefrontBlogs();

  if (loading && !activeBlog) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <p style={{ margin: 0, color: '#6b7280' }}>Loading blog…</p>
        </div>
      </div>
    );
  }

  if (error || !activeBlog) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <h1 className="blog-title">Blog not found</h1>
          <p className="blog-subtitle">{error || 'This blog could not be found or is unavailable.'}</p>
        </div>
      </div>
    );
  }

  const blogHandle = activeBlog.urlHandle;

  return (
    <div className="blog-page">
      <div className="blog-inner">
        <header className="blog-header">
          <h1 className="blog-title">{activeBlog.title}</h1>
          {activeBlog.metaDescription ? (
            <p className="blog-subtitle">{activeBlog.metaDescription}</p>
          ) : null}
        </header>

        {posts.length === 0 ? (
          <p className="blog-subtitle" style={{ margin: 0 }}>
            No published articles yet.
          </p>
        ) : (
          <div className="blog-grid blog-view-list">
            {posts.map((post) => (
              <article key={post._id} className="blog-card">
                <Link
                  to={blogArticleHref(blogHandle, post.urlHandle)}
                  className="blog-card-link"
                >
                  {post.featuredImageUrl ? (
                    <div className="blog-card-image">
                      <img src={post.featuredImageUrl} alt={post.title} loading="lazy" />
                    </div>
                  ) : null}
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      {post.updatedAt ? (
                        <span className="blog-card-date">{formatPostDate(post.updatedAt)}</span>
                      ) : null}
                      {post.author ? <span>{post.author}</span> : null}
                    </div>
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.excerpt ? <p className="blog-card-excerpt">{post.excerpt}</p> : null}
                    <span className="blog-read-more-btn">Read more</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
