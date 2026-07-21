import { Link } from 'react-router-dom';
import { useStorefrontBlogs, useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import { blogListingPath } from '../../runtime/shared/blogPaths';

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
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

const PLACEHOLDER_POST = {
  title: 'Blog post title',
  author: 'Author',
  updatedAt: new Date().toISOString(),
  featuredImageUrl: '',
  content: '<p>Write your article content here. This preview updates when you select a published blog post.</p>',
  excerpt: 'An excerpt of your blog post content.',
};

/** Article detail template — Blog posts section with Image / Title / Details / Description. */
export function BlogPostMain({
  sectionId = 'blog_post_main',
  templateId = 'blog-posts',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { text, fontHeading, fontBody } = useThemeColors();
  const { activeBlog, activePost, loading } = useStorefrontBlogs();

  const base = secBase(templateId, sectionId);
  const sectionTitle = cfgString(config, `${base}.blocks.title.settings.text`, 'Blog posts');
  const showImage = cfgBool(config, `${base}.blocks.blog_post.blocks.image.settings.showImage`, true);
  const showTitle = cfgBool(config, `${base}.blocks.blog_post.blocks.title.settings.showTitle`, true);
  const showAuthor = cfgBool(
    config,
    `${base}.blocks.blog_post.blocks.details.settings.showAuthor`,
    true
  );
  const showDate = cfgBool(config, `${base}.blocks.blog_post.blocks.details.settings.showDate`, true);
  const showDescription = cfgBool(
    config,
    `${base}.blocks.blog_post.blocks.description.settings.showDescription`,
    true
  );

  const post = activePost ?? (loading ? null : PLACEHOLDER_POST);
  const sectionNodeId = `template:${templateId}:${sectionId}`;

  return (
    <EditorSection
      sectionId={sectionId}
      label="Blog posts"
      editorNodeId={sectionNodeId}
      style={{ padding: `32px ${layout.padX}px 48px`, fontFamily: fontBody, color: text }}
    >
      <div style={{ maxWidth, margin: '0 auto' }}>
        <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'title')} label="Title">
          <p
            style={{
              margin: '0 0 24px',
              fontSize: 13,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              opacity: 0.55,
            }}
          >
            <EditorField fieldPath={`${base}.blocks.title.settings.text`} label="Title" as="span">
              {sectionTitle}
            </EditorField>
          </p>
        </EditorBlock>

        <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'blog_post')} label="Blog post">
          {loading && !activePost ? (
            <p style={{ margin: 0, opacity: 0.6 }}>Loading article…</p>
          ) : (
            <>
              {activeBlog && activePost ? (
                <nav
                  aria-label="Breadcrumb"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                    marginBottom: 20,
                    fontSize: 13,
                    opacity: 0.7,
                  }}
                >
                  <Link to={blogListingPath(activeBlog.urlHandle)} style={{ color: 'inherit' }}>
                    {activeBlog.title}
                  </Link>
                  <span>/</span>
                  <span>{activePost.title}</span>
                </nav>
              ) : null}

              {showImage ? (
                <EditorBlock
                  nodeId={blockNodeId(templateId, sectionId, 'blog_post', 'image')}
                  label="Image"
                >
                  <div
                    style={{
                      marginBottom: 28,
                      borderRadius: 12,
                      overflow: 'hidden',
                      aspectRatio: '16 / 9',
                      background: post?.featuredImageUrl
                        ? `center/cover url(${post.featuredImageUrl}) no-repeat`
                        : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    }}
                  >
                    {post?.featuredImageUrl ? (
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : null}
                  </div>
                </EditorBlock>
              ) : null}

              {showTitle ? (
                <EditorBlock
                  nodeId={blockNodeId(templateId, sectionId, 'blog_post', 'title')}
                  label="Title"
                >
                  <h1
                    style={{
                      fontFamily: fontHeading,
                      fontSize: 36,
                      lineHeight: 1.15,
                      margin: '0 0 12px',
                      fontWeight: 600,
                    }}
                  >
                    {post?.title ?? 'Blog post title'}
                  </h1>
                </EditorBlock>
              ) : null}

              {showAuthor || showDate ? (
                <EditorBlock
                  nodeId={blockNodeId(templateId, sectionId, 'blog_post', 'details')}
                  label="Details"
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 24,
                      fontSize: 14,
                      opacity: 0.65,
                    }}
                  >
                    {showAuthor && post?.author ? <span>By {post.author}</span> : null}
                    {showDate && post?.updatedAt ? (
                      <span>{formatPostDate(post.updatedAt)}</span>
                    ) : null}
                  </div>
                </EditorBlock>
              ) : null}

              {showDescription ? (
                <EditorBlock
                  nodeId={blockNodeId(templateId, sectionId, 'blog_post', 'description')}
                  label="Description"
                >
                  {post && 'content' in post && post.content ? (
                    <ThemeEditorRichTextContent html={post.content} />
                  ) : post?.excerpt ? (
                    <p style={{ fontSize: 16, lineHeight: 1.8, margin: 0 }}>{post.excerpt}</p>
                  ) : (
                    <p style={{ fontSize: 16, lineHeight: 1.8, margin: 0, opacity: 0.6 }}>
                      Article description will appear here.
                    </p>
                  )}
                </EditorBlock>
              ) : null}
            </>
          )}
        </EditorBlock>
      </div>
    </EditorSection>
  );
}
