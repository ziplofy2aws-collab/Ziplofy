import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import {
  LayeredSlideshowBackdrop,
  LayeredSlideshowFigure,
  LayeredSlideshowPeek,
} from './LayeredSlideshowArt';
import {
  readLayeredSlideshowLayout,
  readLayeredSlideshowSlides,
  scopedLayeredSlideshowCss,
  slideshowMinHeight,
} from './layeredSlideshowStyles';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

export function LayeredSlideshow({
  sectionId,
  placement = 'template',
  templateId = 'index',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const { maxWidth } = useThemeLayout();
  const [activeIndex, setActiveIndex] = useState(0);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;
  const sectionBase = settingsBase.replace(/\.settings$/, '');
  const blocksBase = `${sectionBase}.blocks`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const layoutStyle = useMemo(
    () => readLayeredSlideshowLayout(config, settingsBase),
    [config, settingsBase]
  );
  const slides = useMemo(
    () => readLayeredSlideshowSlides(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scopeClass = `ziplofy-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedLayeredSlideshowCss(sectionId, layoutStyle.customCss);
  const minHeight = slideshowMinHeight(layoutStyle.height);

  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  if (!slides.length) return null;

  const slideCount = slides.length;
  const index = ((activeIndex % slideCount) + slideCount) % slideCount;
  const slide = slides[index];
  const peekSlide = slides[(index + 1) % slideCount] ?? slide;
  const peekWidth = '11%';

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 24, paddingRight: 24 }
      : { maxWidth: maxWidth || layout.maxWidth, margin: '0 auto', paddingLeft: 24, paddingRight: 24 };

  const cardStyle: CSSProperties = {
    position: 'relative',
    minHeight,
    overflow: 'hidden',
    borderRadius: layoutStyle.cornerRadius,
    border: layoutStyle.borderThickness
      ? `${layoutStyle.borderThickness}px solid rgba(0,0,0,0.08)`
      : 'none',
    boxShadow: layoutStyle.dropShadow ? '0 8px 28px rgba(0,0,0,0.12)' : undefined,
    background: layoutStyle.scheme.background,
  };

  return (
    <>
      {customCss ? <style>{customCss}</style> : null}
      <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Layered slideshow">
        <div className={scopeClass} style={outerStyle}>
          <div style={innerStyle}>
            <div style={cardStyle}>
              {/* scenic backdrop */}
              <LayeredSlideshowBackdrop />

              {/* foreground figure, centred in the area left of the peek strip */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: peekWidth,
                  bottom: 0,
                  top: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: '42%', maxWidth: 320, height: '94%', minHeight: 240 }}>
                  <LayeredSlideshowFigure imageUrl={slide.imageUrl || undefined} />
                </div>
              </div>

              {/* text overlay, top-left */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  maxWidth: '50%',
                  padding: '44px 40px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <EditorBlock nodeId={`${editorNodeId}:block:${slide.id}`} label="Slide">
                  {slide.title.trim() ? (
                    <EditorField
                      fieldPath={`${blocksBase}.${slide.id}.settings.title`}
                      label="Heading"
                      as="h2"
                      style={{
                        margin: 0,
                        fontFamily: fontHeading,
                        fontSize: 'clamp(1.875rem, 3.4vw, 2.75rem)',
                        fontWeight: 700,
                        lineHeight: 1.08,
                        letterSpacing: '-0.02em',
                        color: layoutStyle.scheme.color,
                      }}
                    >
                      {slide.title}
                    </EditorField>
                  ) : null}
                  {slide.body.trim() ? (
                    <EditorField
                      fieldPath={`${blocksBase}.${slide.id}.settings.body`}
                      label="Text"
                      as="p"
                      style={{
                        margin: '12px 0 0',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        color: layoutStyle.scheme.muted,
                        maxWidth: 360,
                      }}
                    >
                      {slide.body}
                    </EditorField>
                  ) : null}
                  {slide.buttonLabel.trim() ? (
                    <EditorField
                      fieldPath={`${blocksBase}.${slide.id}.settings.buttonLabel`}
                      label="Button label"
                      as="span"
                      style={{ display: 'inline-flex', marginTop: 24 }}
                    >
                      <Link
                        to={slide.buttonHref || '#'}
                        style={{
                          display: 'inline-flex',
                          padding: '12px 26px',
                          borderRadius: 999,
                          background: '#111827',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        {slide.buttonLabel}
                      </Link>
                    </EditorField>
                  ) : null}
                </EditorBlock>
              </div>

              {/* right-edge peek of the next slide */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: peekWidth,
                  height: '100%',
                  overflow: 'hidden',
                  borderLeft: '1px solid rgba(255,255,255,0.45)',
                  boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
                  zIndex: 4,
                }}
                aria-hidden
              >
                <LayeredSlideshowPeek variant={peekSlide.peekVariant} />
              </div>

              {/* pagination dots */}
              {slideCount > 1 ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 8,
                    zIndex: 5,
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
                        background: i === index ? '#111827' : 'rgba(17,24,39,0.35)',
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </EditorSection>
    </>
  );
}
