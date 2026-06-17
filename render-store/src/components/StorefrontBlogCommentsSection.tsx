import { useState, type FormEvent } from 'react';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { useStorefrontBlogComments } from '@/hooks/useStorefrontBlogComments';

function formatCommentDate(iso: string): string {
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

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function StorefrontBlogCommentsSection() {
  const { storeFrontMeta } = useStorefront();
  const { activePost } = useStorefrontBlogs();
  const storeId = storeFrontMeta?.storeId;
  const articleId = activePost?._id;

  const { comments, commentsEnabled, commentsMode, loading, submitting, submitComment } =
    useStorefrontBlogComments(storeId, articleId);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!commentsEnabled || !activePost) {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    await submitComment({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    setMessage('');
  };

  return (
    <section className="blog-comments-section" aria-label="Comments">
      <div className="blog-comments-header">
        <h2 className="blog-comments-title">
          {loading ? 'Loading comments…' : `${comments.length} Comment${comments.length === 1 ? '' : 's'}`}
        </h2>
      </div>

      {comments.length > 0 ? (
        <div className="blog-comments-list">
          {comments.map((comment) => (
            <article key={comment._id} className="blog-comment-item">
              <div className="blog-comment-avatar" aria-hidden>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    color: '#374151',
                    fontWeight: 600,
                  }}
                >
                  {initialsFromName(comment.name)}
                </span>
              </div>
              <div className="blog-comment-body">
                <div className="blog-comment-header">
                  <span className="blog-comment-name">{comment.name}</span>
                  <span className="blog-comment-date">{formatCommentDate(comment.createdAt)}</span>
                </div>
                <p className="blog-comment-text">{comment.message}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="blog-add-comment">
        <h3 className="blog-add-comment-title">Leave a comment</h3>
        {commentsMode === 'moderated' ? (
          <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280' }}>
            Comments are moderated. Yours will appear after approval.
          </p>
        ) : null}
        <form className="blog-add-comment-form" onSubmit={handleSubmit}>
          <div className="blog-add-comment-row">
            <div className="blog-add-comment-field">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="blog-add-comment-field">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
          </div>
          <div className="blog-add-comment-field">
            <textarea
              placeholder="Write your comment…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={5000}
              rows={5}
            />
          </div>
          <div className="blog-add-comment-actions">
            <button type="submit" className="blog-add-comment-btn" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
