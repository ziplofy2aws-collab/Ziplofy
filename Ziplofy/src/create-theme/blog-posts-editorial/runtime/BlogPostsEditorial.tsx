import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { BlogPostIllustration } from '../../blog-posts-grid/runtime/BlogPostIllustration';
import { readBlogPostCards, type BlogPostCardData } from '../../blog-posts-grid/runtime/blogPostCards';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import {
  editorialPairCardOffset,
  readBlogPostsEditorialLayout,
  scopedBlogPostsEditorialCss,
} from './blogPostsEditorialStyles';

type CardProps = {
  card: BlogPostCardData;
  featured?: boolean;
  blockNodeId: string;
  blockBase: string;
  scheme: { color: string; muted: string };
  fontBody: string;
  style?: CSSProperties;
};

function BlogPostCardView({
  card,
  featured = false,
  blockNodeId,
  blockBase,
  scheme,
  fontBody,
  style: articleStyle,
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
    <article
      data-blog-card
      data-featured={featured ? 'true' : 'false'}
      data-ziplofy-node={blockNodeId}
      data-ziplofy-label={card.title || 'Blog post'}
      data-ziplofy-kind="block"
      style={articleStyle}
    >
      <div style={imageBox}>
        <EditorField fieldPath={`${blockBase}.imageUrl`} label="Image" as="span">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <BlogPostIllustration variant={card.illustrationVariant} />
          )}
        </EditorField>
      </div>
      <EditorField fieldPath={`${blockBase}.title`} label="Title" as="h3" style={titleStyle}>
        {card.title}
      </EditorField>
      <p style={metaStyle}>
        <EditorField fieldPath={`${blockBase}.date`} label="Date" as="span">
          {card.date}
        </EditorField>
        {' | '}
        <EditorField fieldPath={`${blockBase}.author`} label="Author" as="span">
          {card.author}
        </EditorField>
      </p>
      <EditorField fieldPath={`${blockBase}.excerpt`} label="Excerpt" as="p" style={excerptStyle}>
        {card.excerpt}
      </EditorField>
    </article>
  );
}

export function BlogPostsEditorial({
  sectionId = 'blog_posts_editorial',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const blocksBase = settingsBase.replace(/\.settings$/, '');

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

  const blockNodeIdFor = (cardId: string) =>
    placement === 'template'
      ? `template:${templateId}:${sectionId}:block:${cardId}`
      : `layout:${sectionId}:block:${cardId}`;

  const blockBaseFor = (cardId: string) => `${blocksBase}.blocks.${cardId}.settings`;

  const cardProps = (card: BlogPostCardData, featuredCard = false) => ({
    card,
    featured: featuredCard,
    blockNodeId: blockNodeIdFor(card.id),
    blockBase: blockBaseFor(card.id),
    scheme: style.scheme,
    fontBody,
  });

  const scopedCss = scopedBlogPostsEditorialCss(sectionId, style.customCss);

  const desktopLayout = (
    <>
      {gridPair.length > 0 ? (
        <div style={pairGrid}>
          {gridPair.map((card, index) => (
            <BlogPostCardView
              key={card.id}
              {...cardProps(card)}
              style={{ marginTop: editorialPairCardOffset(index) }}
            />
          ))}
        </div>
      ) : null}
      {featured ? <BlogPostCardView {...cardProps(featured, true)} /> : null}
      {remainder.length > 0 ? (
        <div style={remainderGrid}>
          {remainder.map((card) => (
            <BlogPostCardView key={card.id} {...cardProps(card)} />
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Blog posts: Editorial"
      style={shell}
    >
      <div
        className={scopeClass}
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
              .${scopeClass}[data-carousel-mobile="false"] [data-desktop-layout] [data-blog-card] {
                margin-top: 0 !important;
              }
            }
            @media (min-width: 750px) {
              .${scopeClass} [data-mobile-layout] { display: none !important; }
            }
            ${scopedCss}
          `}
        </style>
        <div style={stage}>
          <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
            {style.heading}
          </EditorField>

          <div data-desktop-layout>{desktopLayout}</div>

          <div data-mobile-layout style={{ display: 'none' }}>
            <div data-mobile-track style={mobileTrack}>
              {cards.map((card) => (
                <div key={card.id} style={mobileCard}>
                  <BlogPostCardView {...cardProps(card)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
