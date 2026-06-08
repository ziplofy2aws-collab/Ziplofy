import { useMemo, useRef, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { BlogPostIllustration } from '../lib/BlogPostIllustration';
import {
  readBlogPostCards,
  readBlogPostsCarouselLayout,
  scopedBlogPostsCarouselCss,
} from '../lib/blogPostsCarouselStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

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
  const btnStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: background === 'none' ? 32 : 36,
    height: background === 'none' ? 32 : 36,
    border: 'none',
    cursor: 'pointer',
    background:
      background === 'circle'
        ? 'rgba(255,255,255,0.95)'
        : background === 'square'
          ? 'rgba(255,255,255,0.95)'
          : 'transparent',
    borderRadius: background === 'circle' ? '50%' : background === 'square' ? 6 : 0,
    boxShadow:
      background !== 'none' ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
    color: '#111827',
    fontSize: shape === 'chevron' ? 18 : 20,
    lineHeight: 1,
  };

  return (
    <button type="button" aria-label={label} onClick={onClick} style={btnStyle}>
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function BlogPostsCarouselSection({
  sectionId = 'blog_posts_carousel',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();
  const trackRef = useRef<HTMLDivElement>(null);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

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
    const amount = el.clientWidth * 0.85 * dir;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

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
  };

  const metaStyle: CSSProperties = {
    margin: '4px 0 0',
    fontSize: '0.8125rem',
    color: style.scheme.muted,
  };

  const excerptStyle: CSSProperties = {
    margin: '8px 0 0',
    fontSize: '0.875rem',
    lineHeight: 1.45,
    color: style.scheme.color,
  };

  const showNav = style.navIcon !== 'none' && cards.length > style.columns;

  return (
    <EditorSection nodeId={editorNodeId} label="Blog posts: Carousel">
      <section
        className={scopeClass}
        style={shell}
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
            ${scopedBlogPostsCarouselCss(sectionId, style.customCss)}
          `}
        </style>
        <div style={stage}>
          <h2 style={headingStyle}>
            <EditorField
              nodeId={editorNodeId}
              fieldPath={`${settingsBase}.heading`}
              label="Heading"
            >
              {style.heading}
            </EditorField>
          </h2>

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
              {cards.map((card) => {
                const blockBase =
                  placement === 'template'
                    ? `templates.${templateId}.sections.${sectionId}.blocks.${card.id}.settings`
                    : `sections.${sectionId}.blocks.${card.id}.settings`;

                return (
                  <article key={card.id} data-blog-card style={cardStyle}>
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
                      <EditorField
                        nodeId={`${editorNodeId}:block:${card.id}`}
                        fieldPath={`${blockBase}.title`}
                        label="Title"
                      >
                        {card.title}
                      </EditorField>
                    </h3>
                    <p style={metaStyle}>
                      <EditorField
                        nodeId={`${editorNodeId}:block:${card.id}`}
                        fieldPath={`${blockBase}.date`}
                        label="Date"
                      >
                        {card.date}
                      </EditorField>
                      {' | '}
                      <EditorField
                        nodeId={`${editorNodeId}:block:${card.id}`}
                        fieldPath={`${blockBase}.author`}
                        label="Author"
                      >
                        {card.author}
                      </EditorField>
                    </p>
                    <p style={excerptStyle}>
                      <EditorField
                        nodeId={`${editorNodeId}:block:${card.id}`}
                        fieldPath={`${blockBase}.excerpt`}
                        label="Excerpt"
                      >
                        {card.excerpt}
                      </EditorField>
                    </p>
                  </article>
                );
              })}
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
      </section>
    </EditorSection>
  );
}
