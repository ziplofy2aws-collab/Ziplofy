import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { LayeredSlideshowFigureArt, LayeredSlideshowPeekArt } from '../lib/LayeredSlideshowArt';
import {
  readLayeredSlideshowLayout,
  readLayeredSlideshowSlides,
  scopedLayeredSlideshowCss,
  slideshowMinHeight,
  type LayeredSlideshowSlide,
} from '../lib/layeredSlideshowStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

const PEEK_PX = 52;
const PEEK_GAP_PX = 10;
const TRANSITION = 'left 480ms cubic-bezier(0.22, 1, 0.36, 1), width 480ms cubic-bezier(0.22, 1, 0.36, 1)';

type CardSlot = {
  index: number;
  role: 'active' | 'left' | 'right';
  depth: number;
};

function buildSlots(active: number, count: number): CardSlot[] {
  const slots: CardSlot[] = [{ index: active, role: 'active', depth: 0 }];
  for (let i = 0; i < active; i++) {
    slots.push({ index: i, role: 'left', depth: active - i });
  }
  for (let i = active + 1; i < count; i++) {
    slots.push({ index: i, role: 'right', depth: i - active });
  }
  return slots;
}

function slotGeometry(
  slot: CardSlot,
  leftCount: number,
  rightCount: number
): { left: number | string; width: number | string; zIndex: number } {
  const leftInset = leftCount > 0 ? leftCount * PEEK_PX + (leftCount - 1) * PEEK_GAP_PX : 0;
  const rightInset = rightCount > 0 ? rightCount * PEEK_PX + (rightCount - 1) * PEEK_GAP_PX : 0;

  if (slot.role === 'active') {
    return {
      left: leftInset,
      width: `calc(100% - ${leftInset + rightInset}px)`,
      zIndex: 100,
    };
  }
  if (slot.role === 'left') {
    const fromLeft = leftCount - slot.depth;
    return {
      left: fromLeft * (PEEK_PX + PEEK_GAP_PX),
      width: PEEK_PX,
      zIndex: 40 + slot.depth,
    };
  }
  const fromRight = rightCount - slot.depth + 1;
  return {
    left: `calc(100% - ${fromRight * PEEK_PX + (fromRight - 1) * PEEK_GAP_PX}px)`,
    width: PEEK_PX,
    zIndex: 40 + slot.depth,
  };
}

function SlideMedia({ slide }: { slide: LayeredSlideshowSlide }) {
  if (slide.imageUrl) {
    return (
      <img
        src={slide.imageUrl}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center bottom',
        }}
      />
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <LayeredSlideshowPeekArt variant={slide.peekVariant} />
      {slide.peekVariant === 'figure' ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: '42%',
            maxWidth: 320,
            height: '94%',
            pointerEvents: 'none',
          }}
        >
          <LayeredSlideshowFigureArt />
        </div>
      ) : null}
    </div>
  );
}

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

  const scopeClass = `codiic-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedLayeredSlideshowCss(sectionId, layoutStyle.customCss);
  const minHeight = slideshowMinHeight(layoutStyle.height);
  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  if (!slides.length) return null;

  const slideCount = slides.length;
  const index = ((activeIndex % slideCount) + slideCount) % slideCount;
  const leftCount = index;
  const rightCount = slideCount - index - 1;
  const slots = buildSlots(index, slideCount);

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

  const deckStyle: CSSProperties = {
    position: 'relative',
    minHeight,
    height: minHeight,
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
      <style>{`
        .${scopeClass} .codiic-layered-card {
          transition: ${TRANSITION};
          will-change: left, width;
        }
      `}</style>
      <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Layered slideshow">
        <div className={scopeClass} style={outerStyle}>
          <div style={innerStyle}>
            <div style={deckStyle} role="region" aria-roledescription="carousel" aria-label="Layered slideshow">
              {slots.map((slot) => {
                const slide = slides[slot.index]!;
                const geo = slotGeometry(slot, leftCount, rightCount);
                const isActive = slot.role === 'active';
                const leftInset =
                  leftCount > 0 ? leftCount * PEEK_PX + (leftCount - 1) * PEEK_GAP_PX : 0;
                const rightInset =
                  rightCount > 0 ? rightCount * PEEK_PX + (rightCount - 1) * PEEK_GAP_PX : 0;
                const activeWidthExpr = `calc(100% - ${leftInset + rightInset}px)`;

                const card: ReactNode = (
                  <div
                    key={slide.id}
                    className="codiic-layered-card"
                    data-role={slot.role}
                    role={isActive ? 'group' : 'button'}
                    tabIndex={isActive ? undefined : 0}
                    aria-label={
                      isActive
                        ? `Current slide: ${slide.title || `Slide ${slot.index + 1}`}`
                        : `Show slide: ${slide.title || `Slide ${slot.index + 1}`}`
                    }
                    aria-current={isActive ? 'true' : undefined}
                    onClick={isActive ? undefined : () => goTo(slot.index)}
                    onKeyDown={
                      isActive
                        ? undefined
                        : (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              goTo(slot.index);
                            }
                          }
                    }
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: geo.left,
                      width: geo.width,
                      zIndex: geo.zIndex,
                      overflow: 'hidden',
                      borderRadius: Math.max(0, layoutStyle.cornerRadius - 1),
                      border: '1px solid rgba(255,255,255,0.55)',
                      boxShadow:
                        slot.role === 'right'
                          ? '-4px 0 14px rgba(0,0,0,0.1)'
                          : slot.role === 'left'
                            ? '4px 0 14px rgba(0,0,0,0.1)'
                            : '0 2px 10px rgba(0,0,0,0.06)',
                      cursor: isActive ? 'default' : 'pointer',
                      background: layoutStyle.scheme.background,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: slot.role === 'right' ? 'auto' : 0,
                        right: slot.role === 'left' ? 'auto' : 0,
                        width: isActive ? '100%' : activeWidthExpr,
                        minWidth: isActive ? undefined : 280,
                      }}
                    >
                      <SlideMedia slide={slide} />
                      {isActive ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 3,
                            maxWidth: '52%',
                            padding: '40px 36px',
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
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {slide.buttonLabel}
                                </Link>
                              </EditorField>
                            ) : null}
                          </EditorBlock>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );

                return card;
              })}

              {slideCount > 1 ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 8,
                    zIndex: 120,
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
