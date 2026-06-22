import { useMemo, useRef, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { TealFoldedShirtIllustration } from '../lib/TealFoldedShirtIllustration';
import {
  readCarouselSlides,
  readStorytellingCarouselLayout,
  scopedStorytellingCarouselCss,
} from '../lib/storytellingCarouselStyles';
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

export function StorytellingCarouselSection({
  sectionId = 'storytelling_carousel',
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

  return (
    <EditorSection nodeId={editorNodeId} label="Carousel">
      <section
        className={scopeClass}
        style={shell}
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
            ${scopedStorytellingCarouselCss(sectionId, style.customCss)}
          `}
        </style>
        <div style={stage}>
          <h2
            style={{
              margin: 0,
              marginBottom: 24,
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <EditorField nodeId={editorNodeId} fieldPath={`${settingsBase}.heading`} label="Heading">
              {style.heading}
            </EditorField>
          </h2>

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
                const blockBase =
                  placement === 'template'
                    ? `templates.${templateId}.sections.${sectionId}.blocks.${slide.id}.settings`
                    : `sections.${sectionId}.blocks.${slide.id}.settings`;

                return (
                  <article key={slide.id} data-carousel-slide style={slideStyle}>
                    <div
                      style={{
                        aspectRatio: '4 / 3',
                        borderRadius: 8,
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        marginBottom: 12,
                      }}
                    >
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <TealFoldedShirtIllustration />
                      )}
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: style.scheme.color,
                      }}
                    >
                      <EditorField
                        nodeId={`${editorNodeId}:block:${slide.id}`}
                        fieldPath={`${blockBase}.title`}
                        label="Title"
                      >
                        {slide.title}
                      </EditorField>
                    </h3>
                    <p
                      style={{
                        margin: '6px 0 0',
                        fontSize: '0.875rem',
                        lineHeight: 1.45,
                        color: style.scheme.muted,
                      }}
                    >
                      <EditorField
                        nodeId={`${editorNodeId}:block:${slide.id}`}
                        fieldPath={`${blockBase}.description`}
                        label="Description"
                      >
                        {slide.description}
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
