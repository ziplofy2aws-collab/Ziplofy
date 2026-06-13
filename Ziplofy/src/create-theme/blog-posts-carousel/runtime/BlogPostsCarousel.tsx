import { useMemo, useRef, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { BlogPostIllustration } from '../../blog-posts-grid/runtime/BlogPostIllustration';
import { readBlogPostCards, type BlogPostCardData } from '../../blog-posts-grid/runtime/blogPostCards';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { readBlogPostsCarouselLayout, scopedBlogPostsCarouselCss } from './blogPostsCarouselStyles';

function NavButton({
  label,
  onClick,
  background,
  shape,
}: {
  label: string;
  onClick: () => void;
  background: 'none' | 'circle' | 'square';
  shape: 'arrows' | 'chevron';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: background === 'none' ? 32 : 36,
        height: background === 'none' ? 32 : 36,
        border: 'none',
        cursor: 'pointer',
        background:
          background === 'circle' || background === 'square'
            ? 'rgba(255,255,255,0.95)'
            : 'transparent',
        borderRadius: background === 'circle' ? '50%' : background === 'square' ? 6 : 0,
        boxShadow: background !== 'none' ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
        color: '#111827',
        fontSize: shape === 'chevron' ? 18 : 20,
        lineHeight: 1,
      }}
    >
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

type CardProps = {
  card: BlogPostCardData;
  blockNodeId: string;
  blockBase: string;
  scheme: { color: string; muted: string };
  cardStyle: CSSProperties;
};

function BlogPostCarouselCard({ card, blockNodeId, blockBase, scheme, cardStyle }: CardProps) {
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

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: scheme.color,
  };

  const metaStyle: CSSProperties = {
    margin: '4px 0 0',
    fontSize: '0.8125rem',
    color: scheme.muted,
  };

  const excerptStyle: CSSProperties = {
    margin: '8px 0 0',
    fontSize: '0.875rem',
    lineHeight: 1.45,
    color: scheme.color,
  };

  return (
    <article
      data-blog-card
      data-ziplofy-node={blockNodeId}
      data-ziplofy-label={card.title || 'Blog post'}
      data-ziplofy-kind="block"
      style={cardStyle}
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

export function BlogPostsCarousel({
  sectionId = 'blog_posts_carousel',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();
  const trackRef = useRef<HTMLDivElement>(null);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const blocksBase = settingsBase.replace(/\.settings$/, '');

  const style = useMemo(
    () => readBlogPostsCarouselLayout(config, settingsBase),
    [config, settingsBase]
  );

  const cards = useMemo(
    () => readBlogPostCards(config, templateId, sectionId, placement, style.postCount),
    [config, templateId, sectionId, placement, style.postCount]
  );

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-blog-posts-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const cardBasis =
    style.columns > 0
      ? `calc((100% - ${(style.columns - 1) * style.horizontalGap}px) / ${style.columns})`
      : '280px';

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  };

  const showNav = style.navIcon !== 'none' && cards.length > style.columns;

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
    marginBottom: style.layoutGap,
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  };

  const rowWrap: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const track: CSSProperties = {
    display: 'flex',
    gap: style.horizontalGap,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    flex: 1,
    paddingBottom: 4,
  };

  const cardStyle: CSSProperties = {
    flex: `0 0 ${cardBasis}`,
    minWidth: 0,
    scrollSnapAlign: 'start',
  };

  const blockNodeIdFor = (cardId: string) =>
    placement === 'template'
      ? `template:${templateId}:${sectionId}:block:${cardId}`
      : `layout:${sectionId}:block:${cardId}`;

  const blockBaseFor = (cardId: string) => `${blocksBase}.blocks.${cardId}.settings`;

  const scopedCss = scopedBlogPostsCarouselCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Blog posts: Carousel"
      style={shell}
    >
      <div
        className={scopeClass}
        data-section-type="blog-posts-carousel"
        data-mobile-cards={style.mobileCardSize}
      >
        <style>
          {`
            .${scopeClass} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${scopeClass}[data-mobile-cards="1"] [data-blog-card] {
                flex: 0 0 calc(100% - 8px);
              }
              .${scopeClass}[data-mobile-cards="2"] [data-blog-card] {
                flex: 0 0 calc(50% - ${style.horizontalGap / 2}px);
              }
            }
            ${scopedCss}
          `}
        </style>
        <div style={stage}>
          <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
            {style.heading}
          </EditorField>

          <div style={rowWrap}>
            {showNav ? (
              <NavButton
                label="Previous"
                onClick={() => scrollByPage(-1)}
                background={style.navIconBackground}
                shape={style.navIcon}
              />
            ) : null}

            <div ref={trackRef} data-carousel-track style={track}>
              {cards.map((card) => (
                <BlogPostCarouselCard
                  key={card.id}
                  card={card}
                  blockNodeId={blockNodeIdFor(card.id)}
                  blockBase={blockBaseFor(card.id)}
                  scheme={style.scheme}
                  cardStyle={cardStyle}
                />
              ))}
            </div>

            {showNav ? (
              <NavButton
                label="Next"
                onClick={() => scrollByPage(1)}
                background={style.navIconBackground}
                shape={style.navIcon}
              />
            ) : null}
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
