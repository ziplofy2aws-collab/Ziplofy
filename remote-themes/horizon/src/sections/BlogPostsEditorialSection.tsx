import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { BlogPostIllustration } from '../lib/BlogPostIllustration';
import { readBlogPostCards } from '../lib/blogPostsCarouselStyles';
import {
  readBlogPostsEditorialLayout,
  scopedBlogPostsEditorialCss,
} from '../lib/blogPostsEditorialStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

type CardProps = {
  card: ReturnType<typeof readBlogPostCards>[number];
  featured?: boolean;
  editorNodeId: string;
  blockBase: string;
  scheme: { color: string; muted: string };
  fontBody: string;
};

function BlogPostCardView({
  card,
  featured = false,
  editorNodeId,
  blockBase,
  scheme,
  fontBody,
}: CardProps) {
  const imageBox: CSSProperties = {
    aspectRatio: featured ? '16 / 9' : '4 / 3',
    borderRadius: 8,
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: featured ? 16 : 12,
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontBody,
    fontSize: featured ? '1.125rem' : '1rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: scheme.color,
  };

  const metaStyle: CSSProperties = {
    margin: '4px 0 0',
    fontFamily: fontBody,
    fontSize: '0.8125rem',
    color: scheme.muted,
  };

  const excerptStyle: CSSProperties = {
    margin: '8px 0 0',
    fontFamily: fontBody,
    fontSize: '0.875rem',
    lineHeight: 1.45,
    color: scheme.color,
  };

  return (
    <article data-blog-card data-featured={featured ? 'true' : 'false'}>
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
      <h3 style={titleStyle}>
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.title`} label="Title">
          {card.title}
        </EditorField>
      </h3>
      <p style={metaStyle}>
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.date`} label="Date">
          {card.date}
        </EditorField>
        {' | '}
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.author`} label="Author">
          {card.author}
        </EditorField>
      </p>
      <p style={excerptStyle}>
        <EditorField nodeId={`${editorNodeId}:block:${card.id}`} fieldPath={`${blockBase}.excerpt`} label="Excerpt">
          {card.excerpt}
        </EditorField>
      </p>
    </article>
  );
}

export function BlogPostsEditorialSection({
  sectionId = 'blog_posts_editorial',
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

  const style = useMemo(
    () => readBlogPostsEditorialLayout(config, settingsBase),
    [config, settingsBase]
  );

  const cards = useMemo(
    () => readBlogPostCards(config, templateId, sectionId, placement, style.postCount),
    [config, templateId, sectionId, placement, style.postCount]
  );

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-blog-posts-editorial-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const gap = style.layoutGap;

  const gridPair = cards.length >= 2 ? cards.slice(0, 2) : cards.length === 1 ? [] : [];
  const featured = cards.length >= 3 ? cards[2] : cards.length === 1 ? cards[0] : null;
  const remainder = cards.length > 3 ? cards.slice(3) : [];

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

  const headingStyle: CSSProperties = {
    margin: 0,
    marginBottom: gap,
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  };

  const pairGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap,
    marginBottom: featured || remainder.length ? gap : 0,
  };

  const remainderGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap,
    marginTop: featured ? gap : 0,
  };

  const mobileTrack: CSSProperties = {
    display: 'flex',
    gap: 16,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const mobileCard: CSSProperties = {
    flex: '0 0 min(85%, 320px)',
    scrollSnapAlign: 'start',
  };

  const blockBaseFor = (cardId: string) =>
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.${cardId}.settings`
      : `sections.${sectionId}.blocks.${cardId}.settings`;

  const desktopLayout = (
    <>
      {gridPair.length > 0 ? (
        <div style={pairGrid}>
          {gridPair.map((card) => (
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
      ) : null}
      {featured ? (
        <BlogPostCardView
          card={featured}
          featured
          editorNodeId={editorNodeId}
          blockBase={blockBaseFor(featured.id)}
          scheme={style.scheme}
          fontBody={fontBody}
        />
      ) : null}
      {remainder.length > 0 ? (
        <div style={remainderGrid}>
          {remainder.map((card) => (
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
      ) : null}
    </>
  );

  return (
    <EditorSection nodeId={editorNodeId} label="Blog posts: Editorial">
      <section
        className={scopeClass}
        style={shell}
        data-section-type="blog-posts-editorial"
        data-carousel-mobile={style.carouselOnMobile ? 'true' : 'false'}
      >
        <style>
          {`
            .${scopeClass} [data-mobile-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${scopeClass}[data-carousel-mobile="true"] [data-desktop-layout] { display: none !important; }
              .${scopeClass}[data-carousel-mobile="true"] [data-mobile-layout] { display: block !important; }
              .${scopeClass}[data-carousel-mobile="false"] [data-mobile-layout] { display: none !important; }
              .${scopeClass}[data-carousel-mobile="false"] [data-desktop-layout] {
                display: block !important;
              }
              .${scopeClass}[data-carousel-mobile="false"] [data-desktop-layout] > div:first-child {
                grid-template-columns: 1fr !important;
              }
            }
            @media (min-width: 750px) {
              .${scopeClass} [data-mobile-layout] { display: none !important; }
            }
            ${scopedBlogPostsEditorialCss(sectionId, style.customCss)}
          `}
        </style>
        <div style={stage}>
          <h2 style={headingStyle}>
            <EditorField nodeId={editorNodeId} fieldPath={`${settingsBase}.heading`} label="Heading">
              {style.heading}
            </EditorField>
          </h2>

          <div data-desktop-layout>{desktopLayout}</div>

          <div data-mobile-layout style={{ display: 'none' }}>
            <div data-mobile-track style={mobileTrack}>
              {cards.map((card) => (
                <div key={card.id} style={mobileCard}>
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
