import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { BlogPostIllustration } from './BlogPostIllustration';
import { readBlogPostCards, type BlogPostCardData } from './blogPostCards';
import { readBlogPostsGridLayout, scopedBlogPostsGridCss } from './blogPostsGridStyles';

type CardProps = {
  card: BlogPostCardData;
  blockNodeId: string;
  blockBase: string;
  scheme: { color: string; muted: string };
  fontBody: string;
};

function BlogPostCardView({ card, blockNodeId, blockBase, scheme, fontBody }: CardProps) {
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
    fontFamily: fontBody,
    fontSize: '1rem',
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
      data-ziplofy-node={blockNodeId}
      data-ziplofy-label={card.title || 'Blog post'}
      data-ziplofy-kind="block"
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

export function BlogPostsGrid({
  sectionId = 'blog_posts_grid',
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

  const headingStyle: CSSProperties = {
    margin: 0,
    marginBottom: style.layoutGap,
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  };

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

  const blockNodeIdFor = (cardId: string) =>
    placement === 'template'
      ? `template:${templateId}:${sectionId}:block:${cardId}`
      : `layout:${sectionId}:block:${cardId}`;

  const blockBaseFor = (cardId: string) => `${blocksBase}.blocks.${cardId}.settings`;

  const scopedCss = scopedBlogPostsGridCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Blog posts: Grid"
      style={shell}
    >
      <div
        className={scopeClass}
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
            ${scopedCss}
          `}
        </style>
        <div style={stage}>
          <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
            {style.heading}
          </EditorField>

          <div data-grid-desktop>
            {cards.map((card) => (
              <BlogPostCardView
                key={card.id}
                card={card}
                blockNodeId={blockNodeIdFor(card.id)}
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
                    blockNodeId={blockNodeIdFor(card.id)}
                    blockBase={blockBaseFor(card.id)}
                    scheme={style.scheme}
                    fontBody={fontBody}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
