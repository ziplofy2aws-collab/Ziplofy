import { Link } from 'react-router-dom';
import { useStorefrontBlogs, useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import { blogArticlePath } from '../../runtime/shared/blogPaths';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function blockNodeId(templateId: string, sectionId: string, ...parts: string[]): string {
  return `template:${templateId}:${sectionId}:block:${parts.join(':block:')}`;
}

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

/** Blog listing template — shows posts for the active blog. */
export function MainBlog({
  sectionId = 'main_blog',
  templateId = 'blogs',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { text, fontHeading, fontBody } = useThemeColors();
  const { activeBlog, posts, loading, error } = useStorefrontBlogs();

  const base = secBase(templateId, sectionId);
  const titleOverride = cfgString(config, `${base}.blocks.title.settings.text`, '');
  const heading = titleOverride.trim() || activeBlog?.title || 'Blog';
  const sectionNodeId = `template:${templateId}:${sectionId}`;

  return (
    <EditorSection
      sectionId={sectionId}
      label="Blog"
      editorNodeId={sectionNodeId}
      style={{ padding: `32px ${layout.padX}px 48px`, fontFamily: fontBody, color: text }}
    >
      <div style={{ maxWidth, margin: '0 auto' }}>
        <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'title')} label="Title">
          <h1
            style={{
              fontFamily: fontHeading,
              fontSize: 36,
              margin: '0 0 8px',
              fontWeight: 600,
            }}
          >
            <EditorField fieldPath={`${base}.blocks.title.settings.text`} label="Title" as="span">
              {heading}
            </EditorField>
          </h1>
          {activeBlog?.metaDescription ? (
            <p style={{ margin: '0 0 28px', opacity: 0.65, fontSize: 15, lineHeight: 1.5 }}>
              {activeBlog.metaDescription}
            </p>
          ) : (
            <div style={{ marginBottom: 28 }} />
          )}
        </EditorBlock>

        {loading && !activeBlog ? (
          <p style={{ margin: 0, opacity: 0.6 }}>Loading blog…</p>
        ) : error && !activeBlog ? (
          <p style={{ margin: 0, opacity: 0.6 }}>{error}</p>
        ) : posts.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.6 }}>No published articles yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 28 }}>
            {posts.map((post) => (
              <article key={post._id} style={{ display: 'grid', gap: 12 }}>
                <Link
                  to={blogArticlePath(activeBlog?.urlHandle ?? '', post.urlHandle)}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {post.featuredImageUrl ? (
                    <div
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        aspectRatio: '16 / 9',
                        marginBottom: 12,
                        background: `center/cover url(${post.featuredImageUrl}) no-repeat`,
                      }}
                    />
                  ) : null}
                  <h2
                    style={{
                      fontFamily: fontHeading,
                      fontSize: 22,
                      margin: '0 0 6px',
                      fontWeight: 600,
                    }}
                  >
                    {post.title}
                  </h2>
                  <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
                    {post.updatedAt ? formatPostDate(post.updatedAt) : null}
                    {post.author ? ` · ${post.author}` : null}
                  </div>
                  {post.excerpt ? (
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: 0.8 }}>
                      {post.excerpt}
                    </p>
                  ) : null}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </EditorSection>
  );
}
