import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { LayeredSlideshowFigureArt, LayeredSlideshowPeekArt } from '../lib/LayeredSlideshowArt';
import {
  readLayeredSlideshowLayout,
  readLayeredSlideshowSlides,
  scopedLayeredSlideshowCss,
  slideshowMinHeight,
} from '../lib/layeredSlideshowStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function LayeredSlideshowSection({
  sectionId = 'layered_slideshow',
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
    () => readLayeredSlideshowLayout(config, settingsBase),
    [config, settingsBase]
  );

  const slides = useMemo(
    () => readLayeredSlideshowSlides(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const slideCount = Math.max(1, slides.length);
  const index = ((activeIndex % slideCount) + slideCount) % slideCount;
  const slide = slides[index] ?? slides[0];
  const peekSlide = slides[(index + 1) % slideCount] ?? slide;

  const scopeClass = `ziplofy-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedLayeredSlideshowCss(sectionId, layoutStyle.customCss);
  const minHeight = slideshowMinHeight(layoutStyle.height);

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
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  const cardStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    minHeight,
    overflow: 'hidden',
    borderRadius: layoutStyle.cornerRadius,
    border: layoutStyle.borderThickness
      ? `${layoutStyle.borderThickness}px solid rgba(0,0,0,0.08)`
      : 'none',
    boxShadow: layoutStyle.dropShadow ? '0 8px 28px rgba(0,0,0,0.12)' : undefined,
    background: layoutStyle.scheme.background,
  };

  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  if (!slide) return null;

  return (
    <EditorSection nodeId={editorNodeId} label="Layered slideshow">
      {customCss ? <style>{customCss}</style> : null}
      <section data-ziplofy-section={sectionId} className={scopeClass} style={outerStyle}>
        <div style={innerStyle}>
          <div style={cardStyle}>
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                flex: '0 0 44%',
                maxWidth: '44%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 40px',
                boxSizing: 'border-box',
              }}
            >
              <EditorBlock nodeId={`${editorNodeId}:${slide.id}`} label="Slide">
                <EditorField
                  fieldPath={`${settingsBase.replace('.settings', '')}.blocks.${slide.id}.settings.title`}
                  label="Heading"
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: fontHeading,
                      fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {slide.title}
                  </h2>
                </EditorField>
                <EditorField
                  fieldPath={`${settingsBase.replace('.settings', '')}.blocks.${slide.id}.settings.body`}
                  label="Text"
                >
                  <p
                    style={{
                      margin: '16px 0 0',
                      fontSize: '1rem',
                      lineHeight: 1.55,
                      color: layoutStyle.scheme.muted,
                      maxWidth: 420,
                    }}
                  >
                    {slide.body}
                  </p>
                </EditorField>
                <EditorField
                  fieldPath={`${settingsBase.replace('.settings', '')}.blocks.${slide.id}.settings.buttonLabel`}
                  label="Button label"
                >
                  <Link
                    to={slide.buttonHref || '#'}
                    style={{
                      display: 'inline-flex',
                      marginTop: 28,
                      padding: '14px 28px',
                      borderRadius: 999,
                      background: '#111827',
                      color: '#fff',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {slide.buttonLabel}
                  </Link>
                </EditorField>
              </EditorBlock>
            </div>

            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingRight: '17%',
                paddingBottom: 24,
              }}
            >
              <div style={{ position: 'relative', width: '72%', maxWidth: 340, height: '78%', minHeight: 280 }}>
                <LayeredSlideshowFigureArt imageUrl={slide.imageUrl || undefined} />
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '17%',
                height: '100%',
                overflow: 'hidden',
                borderLeft: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '-4px 0 12px rgba(0,0,0,0.06)',
              }}
              aria-hidden
            >
              <LayeredSlideshowPeekArt variant={peekSlide.peekVariant} />
            </div>

            {slideCount > 1 ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
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
      </section>
    </EditorSection>
  );
}
