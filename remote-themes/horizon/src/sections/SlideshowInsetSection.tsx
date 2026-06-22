import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { SlideshowFullFrameLandscapeArt } from '../lib/SlideshowFullFrameArt';
import { LayeredSlideshowPeekArt } from '../lib/LayeredSlideshowArt';
import {
  readSlideshowInsetLayout,
  readSlideshowInsetSlides,
  scopedSlideshowInsetCss,
  slideshowInsetMediaHeight,
} from '../lib/slideshowInsetStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
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
  size,
  shape,
}: {
  label: string;
  onClick: () => void;
  background: 'none' | 'circle' | 'square';
  size: 'large-arrows' | 'arrows' | 'chevron';
  shape: 'arrows' | 'chevron';
}) {
  const isLarge = size === 'large-arrows';
  const dim = background === 'none' ? (isLarge ? 44 : 36) : isLarge ? 48 : 40;
  const fontSize = shape === 'chevron' ? (isLarge ? 24 : 18) : isLarge ? 24 : 20;

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
        width: dim,
        height: dim,
        border: 'none',
        cursor: 'pointer',
        background:
          background === 'circle' || background === 'square'
            ? 'rgba(255,255,255,0.95)'
            : 'transparent',
        borderRadius: background === 'circle' ? '50%' : background === 'square' ? 8 : 0,
        boxShadow: background !== 'none' ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
        color: '#111827',
        fontSize,
        lineHeight: 1,
      }}
    >
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function SlideshowInsetSection({
  sectionId = 'slideshow_inset',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const [activeIndex, setActiveIndex] = useState(0);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const layoutStyle = useMemo(
    () => readSlideshowInsetLayout(config, settingsBase),
    [config, settingsBase]
  );

  const slides = useMemo(
    () => readSlideshowInsetSlides(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const slideCount = Math.max(1, slides.length);
  const index = ((activeIndex % slideCount) + slideCount) % slideCount;
  const slide = slides[index] ?? slides[0];
  const peekSlide = slides[(index + 1) % slideCount] ?? slide;

  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + slideCount) % slideCount), [slideCount]);
  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % slideCount), [slideCount]);
  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  const scopeClass = `ziplofy-slideshow-inset-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedSlideshowInsetCss(sectionId, layoutStyle.customCss);
  const mediaHeight = slideshowInsetMediaHeight(layoutStyle.mediaHeight);
  const belowMedia = layoutStyle.contentPosition === 'below-media';
  const showNav = layoutStyle.navigationIcon !== 'none' && slideCount > 1;
  const navShape = layoutStyle.navigationIcon === 'chevron' ? 'chevron' : 'arrows';
  const navSize =
    layoutStyle.navigationIcon === 'large-arrows'
      ? 'large-arrows'
      : layoutStyle.navigationIcon === 'chevron'
        ? 'chevron'
        : 'arrows';

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties = {
    maxWidth: layout.contentMaxWidth,
    margin: '0 auto',
    paddingLeft: layoutStyle.fullWidthOnMobile ? 0 : 24,
    paddingRight: layoutStyle.fullWidthOnMobile ? 0 : 24,
  };

  const cardStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: belowMedia ? 24 : 0,
  };

  const mediaWrapStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    gap: layoutStyle.gap,
    overflow: 'hidden',
    paddingLeft: 24,
    paddingRight: 24,
  };

  const mainMediaStyle: CSSProperties = {
    position: 'relative',
    flex: '1 1 auto',
    minWidth: 0,
    height: mediaHeight,
    borderRadius: layoutStyle.cornerRadius,
    overflow: 'hidden',
    background: '#ddd6c8',
  };

  const hintStyle: CSSProperties = {
    flex: `0 0 ${Math.max(48, layoutStyle.gap + 32)}px`,
    width: Math.max(48, layoutStyle.gap + 32),
    height: mediaHeight,
    borderRadius: layoutStyle.cornerRadius,
    overflow: 'hidden',
    opacity: 0.95,
  };

  if (!slide) return null;

  const blocksBase = settingsBase.replace('.settings', '');

  const contentBlock = (
    <EditorBlock nodeId={`${editorNodeId}:${slide.id}`} label="Slide">
      <EditorField fieldPath={`${blocksBase}.blocks.${slide.id}.settings.title`} label="Heading">
        <h2
          style={{
            margin: 0,
            fontFamily: fontHeading,
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: belowMedia ? layoutStyle.scheme.color : '#fff',
            textAlign: 'center',
          }}
        >
          {slide.title}
        </h2>
      </EditorField>
      <EditorField fieldPath={`${blocksBase}.blocks.${slide.id}.settings.body`} label="Text">
        <p
          style={{
            margin: '12px auto 0',
            maxWidth: 520,
            fontSize: '1rem',
            lineHeight: 1.55,
            color: belowMedia ? layoutStyle.scheme.muted : 'rgba(255,255,255,0.92)',
            textAlign: 'center',
          }}
        >
          {slide.body}
        </p>
      </EditorField>
      <EditorField fieldPath={`${blocksBase}.blocks.${slide.id}.settings.buttonLabel`} label="Button label">
        <Link
          to={slide.buttonHref || '#'}
          style={{
            display: 'inline-flex',
            marginTop: 20,
            padding: '14px 28px',
            borderRadius: 999,
            background: belowMedia ? '#111827' : '#fff',
            color: belowMedia ? '#fff' : '#111827',
            fontSize: '0.9375rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {slide.buttonLabel}
        </Link>
      </EditorField>
    </EditorBlock>
  );

  return (
    <EditorSection nodeId={editorNodeId} label="Slideshow: Inset">
      {customCss ? <style>{customCss}</style> : null}
      <section data-ziplofy-section={sectionId} className={scopeClass} style={outerStyle}>
        <div style={innerStyle}>
          <div style={cardStyle}>
            <div style={mediaWrapStyle}>
              <div style={mainMediaStyle}>
                <SlideshowFullFrameLandscapeArt imageUrl={slide.imageUrl || undefined} />

                {!belowMedia ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '32px 64px',
                      boxSizing: 'border-box',
                      zIndex: 2,
                    }}
                  >
                    {contentBlock}
                  </div>
                ) : null}

                {showNav ? (
                  <>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}>
                      <NavButton
                        label="Previous"
                        onClick={goPrev}
                        background={layoutStyle.navigationIconBackground}
                        size={navSize}
                        shape={navShape}
                      />
                    </div>
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}>
                      <NavButton
                        label="Next"
                        onClick={goNext}
                        background={layoutStyle.navigationIconBackground}
                        size={navSize}
                        shape={navShape}
                      />
                    </div>
                  </>
                ) : null}

                {layoutStyle.pagination === 'dots' && slideCount > 1 && !belowMedia ? (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 8,
                      zIndex: 4,
                    }}
                  >
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => goTo(i)}
                        style={{
                          width: 8,
                          height: 8,
                          padding: 0,
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          background: i === index ? '#fff' : 'rgba(255,255,255,0.45)',
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {slideCount > 1 ? (
                <div style={hintStyle} aria-hidden>
                  <LayeredSlideshowPeekArt variant={peekSlide.peekVariant} />
                </div>
              ) : null}
            </div>

            {belowMedia ? (
              <div style={{ textAlign: 'center', padding: '0 24px 8px' }}>{contentBlock}</div>
            ) : null}

            {layoutStyle.pagination === 'dots' && slideCount > 1 && belowMedia ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingBottom: 8 }}>
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    style={{
                      width: 8,
                      height: 8,
                      padding: 0,
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      background: i === index ? '#111827' : 'rgba(17,24,39,0.25)',
                    }}
                  />
                ))}
              </div>
            ) : null}

            {layoutStyle.pagination === 'counter' && slideCount > 1 ? (
              <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                {index + 1} / {slideCount}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </EditorSection>
  );
}
