import { useMemo, useRef, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { TealFoldedShirtIllustration } from '../../editorial/runtime/EditorialArt';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import {
  readCarouselSlides,
  readStorytellingCarouselLayout,
  scopedStorytellingCarouselCss,
} from './storytellingCarouselStyles';

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

export function StorytellingCarousel({
  sectionId = 'storytelling_carousel',
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
    () => readStorytellingCarouselLayout(config, settingsBase),
    [config, settingsBase]
  );

  const slides = useMemo(
    () => readCarouselSlides(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-storytelling-carousel-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const cols = Math.max(1, Math.min(4, style.columns));
  const cardBasis = `calc((100% - ${(cols - 1) * style.horizontalGap}px) / ${cols})`;

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  };

  const showNav = style.navIcon !== 'none' && slides.length > cols;

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

  const track: CSSProperties = {
    display: 'flex',
    gap: style.horizontalGap,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    flex: 1,
  };

  const slideStyle: CSSProperties = {
    flex: `0 0 ${cardBasis}`,
    minWidth: 0,
    scrollSnapAlign: 'start',
  };

  const headingStyle: CSSProperties = {
    margin: 0,
    marginBottom: 24,
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: style.scheme.color,
  };

  const descriptionStyle: CSSProperties = {
    margin: '6px 0 0',
    fontSize: '0.875rem',
    lineHeight: 1.45,
    color: style.scheme.muted,
  };

  const mediaStyle: CSSProperties = {
    aspectRatio: '4 / 3',
    borderRadius: 8,
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  };

  const scopedCss = scopedStorytellingCarouselCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Carousel"
      style={shell}
    >
      <div
        className={scopeClass}
        data-section-type="storytelling-carousel"
        data-mobile-columns={style.mobileColumns}
      >
        <style>
          {`
            .${scopeClass} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${scopeClass}[data-mobile-columns="1"] [data-carousel-slide] {
                flex: 0 0 calc(100% - 8px);
              }
              .${scopeClass}[data-mobile-columns="2"] [data-carousel-slide] {
                flex: 0 0 calc(50% - ${style.horizontalGap / 2}px);
              }
            }
            ${scopedCss}
          `}
        </style>
        <div style={stage}>
        <EditorField
          fieldPath={`${settingsBase}.heading`}
          label="Heading"
          as="h2"
          style={headingStyle}
        >
          {style.heading}
        </EditorField>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showNav ? (
            <NavButton
              label="Previous"
              onClick={() => scrollByPage(-1)}
              background={style.navIconBackground}
              shape={style.navIcon}
            />
          ) : null}

          <div ref={trackRef} data-carousel-track style={track}>
            {slides.map((slide) => {
              const blockNodeId =
                placement === 'template'
                  ? `template:${templateId}:${sectionId}:block:${slide.id}`
                  : `layout:${sectionId}:block:${slide.id}`;

              return (
                <article
                  key={slide.id}
                  data-carousel-slide
                  data-ziplofy-node={blockNodeId}
                  data-ziplofy-label={slide.title || 'Carousel slide'}
                  data-ziplofy-kind="block"
                  style={slideStyle}
                >
                  <div style={mediaStyle}>
                    <EditorField
                      fieldPath={`${blocksBase}.blocks.${slide.id}.settings.imageUrl`}
                      label="Image"
                      as="span"
                    >
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <TealFoldedShirtIllustration />
                      )}
                    </EditorField>
                  </div>
                  <EditorField
                    fieldPath={`${blocksBase}.blocks.${slide.id}.settings.title`}
                    label="Title"
                    as="h3"
                    style={titleStyle}
                  >
                    {slide.title}
                  </EditorField>
                  <EditorField
                    fieldPath={`${blocksBase}.blocks.${slide.id}.settings.description`}
                    label="Description"
                    as="p"
                    style={descriptionStyle}
                  >
                    {slide.description}
                  </EditorField>
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
      </div>
    </EditorSection>
  );
}
