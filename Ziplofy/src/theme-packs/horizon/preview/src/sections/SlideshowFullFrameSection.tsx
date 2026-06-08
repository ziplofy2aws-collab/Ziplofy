import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { SlideshowFullFrameLandscapeArt } from '../lib/SlideshowFullFrameArt';
import {
  readSlideshowFullFrameLayout,
  readSlideshowFullFrameSlides,
  scopedSlideshowFullFrameCss,
  slideshowFullFrameMediaHeight,
} from '../lib/slideshowFullFrameStyles';
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
  const dim = background === 'none' ? (isLarge ? 48 : 36) : isLarge ? 52 : 40;
  const fontSize = shape === 'chevron' ? (isLarge ? 28 : 20) : isLarge ? 28 : 22;

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
        boxShadow: background !== 'none' ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
        color: '#fff',
        fontSize,
        lineHeight: 1,
        textShadow: background === 'none' ? '0 1px 3px rgba(0,0,0,0.35)' : undefined,
      }}
    >
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function SlideshowFullFrameSection({
  sectionId = 'slideshow_full_frame',
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
    () => readSlideshowFullFrameLayout(config, settingsBase),
    [config, settingsBase]
  );

  const slides = useMemo(
    () => readSlideshowFullFrameSlides(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const slideCount = Math.max(1, slides.length);
  const index = ((activeIndex % slideCount) + slideCount) % slideCount;
  const slide = slides[index] ?? slides[0];

  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + slideCount) % slideCount), [slideCount]);
  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % slideCount), [slideCount]);
  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  useEffect(() => {
    if (!layoutStyle.autoRotate || slideCount < 2) return;
    const id = window.setInterval(() => setActiveIndex((i) => (i + 1) % slideCount), 5000);
    return () => window.clearInterval(id);
  }, [layoutStyle.autoRotate, slideCount]);

  const scopeClass = `ziplofy-slideshow-full-frame-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedSlideshowFullFrameCss(sectionId, layoutStyle.customCss);
  const mediaHeight = slideshowFullFrameMediaHeight(layoutStyle.mediaHeight);
  const onMedia = layoutStyle.contentPosition === 'on-media';
  const showNav = layoutStyle.navigationIcon !== 'none' && slideCount > 1;
  const navShape =
    layoutStyle.navigationIcon === 'chevron' ? 'chevron' : 'arrows';
  const navSize =
    layoutStyle.navigationIcon === 'large-arrows' ? 'large-arrows' : layoutStyle.navigationIcon;

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: onMedia ? layoutStyle.scheme.background : '#fff',
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%' }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  const frameStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: mediaHeight,
    overflow: 'hidden',
    borderRadius: layoutStyle.sectionWidth === 'page' ? 12 : 0,
    background: layoutStyle.scheme.background,
  };

  const textColor = onMedia ? '#fff' : layoutStyle.scheme.color;
  const mutedColor = onMedia ? 'rgba(255,255,255,0.92)' : layoutStyle.scheme.muted;

  if (!slide) return null;

  const blocksBase = settingsBase.replace('.settings', '');

  return (
    <EditorSection nodeId={editorNodeId} label="Slideshow: Full frame">
      {customCss ? <style>{customCss}</style> : null}
      <section data-ziplofy-section={sectionId} className={scopeClass} style={outerStyle}>
        <div style={innerStyle}>
          <div style={frameStyle}>
            <SlideshowFullFrameLandscapeArt imageUrl={slide.imageUrl || undefined} />

            {onMedia ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '48px 80px',
                  boxSizing: 'border-box',
                  zIndex: 2,
                }}
              >
                <EditorBlock nodeId={`${editorNodeId}:${slide.id}`} label="Slide">
                  <EditorField fieldPath={`${blocksBase}.blocks.${slide.id}.settings.title`} label="Heading">
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: fontHeading,
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: textColor,
                        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      {slide.title}
                    </h2>
                  </EditorField>
                  <EditorField path={`${blocksBase}.blocks.${slide.id}.settings.body`} label="Text">
                    <p
                      style={{
                        margin: '16px auto 0',
                        maxWidth: 520,
                        fontSize: '1.0625rem',
                        lineHeight: 1.55,
                        color: mutedColor,
                      }}
                    >
                      {slide.body}
                    </p>
                  </EditorField>
                  <EditorField
                    fieldPath={`${blocksBase}.blocks.${slide.id}.settings.buttonLabel`}
                    label="Button label"
                  >
                    <Link
                      to={slide.buttonHref || '#'}
                      style={{
                        display: 'inline-flex',
                        marginTop: 28,
                        padding: '14px 32px',
                        borderRadius: 999,
                        background: '#fff',
                        color: '#111827',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      }}
                    >
                      {slide.buttonLabel}
                    </Link>
                  </EditorField>
                </EditorBlock>
              </div>
            ) : null}

            {showNav ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 4,
                  }}
                >
                  <NavButton
                    label="Previous"
                    onClick={goPrev}
                    background={layoutStyle.navigationIconBackground}
                    size={navSize}
                    shape={navShape}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 4,
                  }}
                >
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

            {layoutStyle.pagination === 'dots' && slideCount > 1 ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
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

            {layoutStyle.pagination === 'counter' && slideCount > 1 ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 24,
                  zIndex: 4,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: onMedia ? '#fff' : layoutStyle.scheme.color,
                }}
              >
                {index + 1} / {slideCount}
              </div>
            ) : null}
          </div>

          {!onMedia ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: layoutStyle.scheme.color }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '2rem', fontWeight: 700 }}>
                {slide.title}
              </h2>
              <p style={{ margin: '12px auto 0', maxWidth: 520, color: layoutStyle.scheme.muted }}>
                {slide.body}
              </p>
              <Link
                to={slide.buttonHref || '#'}
                style={{
                  display: 'inline-flex',
                  marginTop: 20,
                  padding: '12px 28px',
                  borderRadius: 999,
                  background: '#111827',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                {slide.buttonLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </EditorSection>
  );
}
