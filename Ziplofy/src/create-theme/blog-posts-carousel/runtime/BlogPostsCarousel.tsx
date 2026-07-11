import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  useThemeConfig,
  useStorefront,
  useStorefrontBlogs,
  type StorefrontBlogPost,
} from '@render-store/sdk';
import { BlogPostIllustration } from '../../blog-posts-grid/runtime/BlogPostIllustration';
import {
  mapBlogPostsToCards,
  readBlogPostCards,
  type BlogPostCardData,
} from '../../blog-posts-grid/runtime/blogPostCards';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import { blogListingPath, normalizeBlogPathHandle } from '../../runtime/shared/blogPaths';
import { readBlogPostsCarouselLayout, scopedBlogPostsCarouselCss } from './blogPostsCarouselStyles';

function BlogPostCardLink({ href, children }: { href: string; children: ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <Link to={href} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

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
  editable: boolean;
};

function BlogPostCarouselCard({
  card,
  blockNodeId,
  blockBase,
  scheme,
  cardStyle,
  editable,
}: CardProps) {
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

  const image = card.imageUrl ? (
    <img
      src={card.imageUrl}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <BlogPostIllustration variant={card.illustrationVariant} />
  );

  if (!editable) {
    return (
      <article
        data-blog-card
        data-codiic-node={blockNodeId}
        data-codiic-label={card.title || 'Blog post'}
        data-codiic-kind="block"
        style={cardStyle}
      >
        <BlogPostCardLink href={card.href}>
          <div style={imageBox}>{image}</div>
          <h3 style={titleStyle}>{card.title}</h3>
          <p style={metaStyle}>
            {card.date}
            {card.date && card.author ? ' | ' : ''}
            {card.author}
          </p>
          {card.excerpt ? (
            <ThemeEditorRichTextContent
              html={card.excerpt}
              style={{
                ...excerptStyle,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            />
          ) : null}
        </BlogPostCardLink>
      </article>
    );
  }

  return (
    <article
      data-blog-card
      data-codiic-node={blockNodeId}
      data-codiic-label={card.title || 'Blog post'}
      data-codiic-kind="block"
      style={cardStyle}
    >
      <div style={imageBox}>
        <EditorField fieldPath={`${blockBase}.imageUrl`} label="Image" as="span">
          {image}
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
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { fetchVisiblePostsByBlogUrlHandle } = useStorefrontBlogs();
  const trackRef = useRef<HTMLDivElement>(null);
  const [livePosts, setLivePosts] = useState<StorefrontBlogPost[]>([]);

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

  const placeholderCards = useMemo(
    () => readBlogPostCards(config, templateId, sectionId, placement, style.postCount),
    [config, templateId, sectionId, placement, style.postCount]
  );

  const storeId = storeFrontMeta?.storeId ?? '';
  const blogHandle = normalizeBlogPathHandle(style.blogHandle);
  const blogHref = blogHandle ? blogListingPath(blogHandle) : '';

  useEffect(() => {
    let cancelled = false;
    if (!storeId || !blogHandle) {
      setLivePosts([]);
      return;
    }
    fetchVisiblePostsByBlogUrlHandle(storeId, blogHandle, { page: 1, limit: 12 })
      .then((posts: StorefrontBlogPost[]) => {
        if (!cancelled) setLivePosts(Array.isArray(posts) ? posts : []);
      })
      .catch(() => {
        if (!cancelled) setLivePosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, blogHandle, fetchVisiblePostsByBlogUrlHandle]);

  const liveCards = useMemo(
    () => mapBlogPostsToCards(livePosts, style.postCount, blogHandle),
    [livePosts, style.postCount, blogHandle]
  );

  const usingLive = liveCards.length > 0;
  const cards = usingLive ? liveCards : placeholderCards;

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const scopeClass = `codiic-blog-posts-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
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
  const navShape: 'arrows' | 'chevron' = style.navIcon === 'chevron' ? 'chevron' : 'arrows';

  const shell: CSSProperties = {
    position: 'relative',
    background: style.sectionBackground,
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
          {usingLive && blogHref ? (
            <Link to={blogHref} style={{ color: 'inherit', textDecoration: 'none' }}>
              <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
                {style.heading}
              </EditorField>
            </Link>
          ) : (
            <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
              {style.heading}
            </EditorField>
          )}

          <div style={rowWrap}>
            {showNav ? (
              <NavButton
                label="Previous"
                onClick={() => scrollByPage(-1)}
                background={style.navIconBackground}
                shape={navShape}
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
                  editable={!usingLive}
                />
              ))}
            </div>

            {showNav ? (
              <NavButton
                label="Next"
                onClick={() => scrollByPage(1)}
                background={style.navIconBackground}
                shape={navShape}
              />
            ) : null}
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
