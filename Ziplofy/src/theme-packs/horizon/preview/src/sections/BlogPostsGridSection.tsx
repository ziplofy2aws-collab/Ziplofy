import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { BlogPostIllustration } from '../lib/BlogPostIllustration';
import { readBlogPostCards } from '../lib/blogPostsCarouselStyles';
import { readBlogPostsGridLayout, scopedBlogPostsGridCss } from '../lib/blogPostsGridStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

type CardProps = {
  card: ReturnType<typeof readBlogPostCards>[number];
  editorNodeId: string;
  blockBase: string;
  scheme: { color: string; muted: string };
  fontBody: string;
};

function BlogPostCardView({ card, editorNodeId, blockBase, scheme, fontBody }: CardProps) {
  const imageBox: CSSProperties = {
    aspectRatio: '4 / 3',
    borderRadius: 8,
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  };

  return (
    <article data-blog-card>
      <div style={imageBox}>
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <BlogPostIllustration variant={card.illustrationVariant} />
        )}
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: fontBody,
          fontSize: '1rem',
          fontWeight: 700,
          lineHeight: 1.3,
          color: scheme.color,
        }}
      >
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.title`} label="Title">
          {card.title}
        </EditorField>
      </h3>
      <p style={{ margin: '4px 0 0', fontFamily: fontBody, fontSize: '0.8125rem', color: scheme.muted }}>
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.date`} label="Date">
          {card.date}
        </EditorField>
        {' | '}
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.author`} label="Author">
          {card.author}
        </EditorField>
      </p>
      <p
        style={{
          margin: '8px 0 0',
          fontFamily: fontBody,
          fontSize: '0.875rem',
          lineHeight: 1.45,
          color: scheme.color,
        }}
      >
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.excerpt`} label="Excerpt">
          {card.excerpt}
        </EditorField>
      </p>
    </article>
  );
}

export function BlogPostsGridSection({
  sectionId = 'blog_posts_grid',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readBlogPostsGridLayout(config, settingsBase), [config, settingsBase]);

  const cards = useMemo(
    () => readBlogPostCards(config, templateId, sectionId, placement, style.postCount),
    [config, templateId, sectionId, placement, style.postCount]
  );

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-blog-posts-grid-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const cols = Math.max(1, Math.min(4, style.columns));

  const shell: CSSProperties = {
    position: 'relative',
    background: style.scheme.background,
    color: style.scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    fontFamily: fontBody,
  };

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
  };

  const blockBaseFor = (cardId: string) =>
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.${cardId}.settings`
      : `sections.${sectionId}.blocks.${cardId}.settings`;

  const mobileTrack: CSSProperties = {
    display: 'flex',
    gap: style.horizontalGap,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const mobileCardWidth =
    style.mobileColumns === 2
      ? `calc(50% - ${style.horizontalGap / 2}px)`
      : `calc(100% - ${style.horizontalGap}px)`;

  return (
    <EditorSection nodeId={editorNodeId} label="Blog posts: Grid">
      <section
        className={scopeClass}
        style={shell}
        data-section-type="blog-posts-grid"
        data-carousel-mobile={style.carouselOnMobile ? 'true' : 'false'}
        data-mobile-columns={style.mobileColumns}
      >
        <style>
          {`
            .${scopeClass} [data-grid-desktop] {
              display: grid;
              grid-template-columns: repeat(${cols}, minmax(0, 1fr));
              column-gap: ${style.horizontalGap}px;
              row-gap: ${style.verticalGap}px;
            }
            .${scopeClass} [data-mobile-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${scopeClass}[data-carousel-mobile="true"] [data-grid-desktop] { display: none !important; }
              .${scopeClass}[data-carousel-mobile="true"] [data-mobile-layout] { display: block !important; }
              .${scopeClass}[data-carousel-mobile="false"] [data-grid-desktop] {
                grid-template-columns: repeat(${style.mobileColumns}, minmax(0, 1fr)) !important;
              }
              .${scopeClass}[data-carousel-mobile="false"] [data-mobile-layout] { display: none !important; }
            }
            @media (min-width: 750px) {
              .${scopeClass} [data-mobile-layout] { display: none !important; }
            }
            ${scopedBlogPostsGridCss(sectionId, style.customCss)}
          `}
        </style>
        <div style={stage}>
          <h2
            style={{
              margin: 0,
              marginBottom: style.layoutGap,
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <EditorField nodeId={editorNodeId} fieldPath={`${settingsBase}.heading`} label="Heading">
              {style.heading}
            </EditorField>
          </h2>

          <div data-grid-desktop>
            {cards.map((card) => (
              <BlogPostCardView
                key={card.id}
                card={card}
                editorNodeId={editorNodeId}
                blockBase={blockBaseFor(card.id)}
                scheme={style.scheme}
                fontBody={fontBody}
              />
            ))}
          </div>

          <div data-mobile-layout style={{ display: 'none' }}>
            <div data-mobile-track style={mobileTrack}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  style={{ flex: `0 0 ${mobileCardWidth}`, minWidth: 0, scrollSnapAlign: 'start' }}
                >
                  <BlogPostCardView
                    card={card}
                    editorNodeId={editorNodeId}
                    blockBase={blockBaseFor(card.id)}
                    scheme={style.scheme}
                    fontBody={fontBody}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </EditorSection>
  );
}
