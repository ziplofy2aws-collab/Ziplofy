import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { LayeredSlideshowSlideMedia } from './LayeredSlideshowArt';
import {
  readLayeredSlideshowLayout,
  readLayeredSlideshowSlides,
  scopedLayeredSlideshowCss,
  slideshowMinHeight,
  type LayeredSlideshowSlide,
} from './layeredSlideshowStyles';
import {
  readSlideshowSlideButtonStyle,
  readSlideshowSlideTextStyle,
  slideshowSlideTextStyleToCss,
} from './slideshowSlideContentStyles';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

/** Visible strip width for stacked (behind) cards. */
const PEEK_PX = 52;
const PEEK_GAP_PX = 10;
const TRANSITION = 'left 480ms cubic-bezier(0.22, 1, 0.36, 1), width 480ms cubic-bezier(0.22, 1, 0.36, 1)';

type CardSlot = {
  index: number;
  role: 'active' | 'left' | 'right';
  /** Stack depth from active (1 = nearest peek). */
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
    // Furthest previous is leftmost; nearest previous sits closest to the active card.
    const fromLeft = leftCount - slot.depth;
    return {
      left: fromLeft * (PEEK_PX + PEEK_GAP_PX),
      width: PEEK_PX,
      zIndex: 40 + slot.depth,
    };
  }

  // Right stack: nearest next is leftmost of the right peeks (closest to active).
  const fromRight = rightCount - slot.depth + 1;
  return {
    left: `calc(100% - ${fromRight * PEEK_PX + (fromRight - 1) * PEEK_GAP_PX}px)`,
    width: PEEK_PX,
    zIndex: 40 + slot.depth,
  };
}

function SlideCardContent({
  slide,
  config,
  schemeColor,
  schemeMuted,
  schemeBackground,
  fontHeading,
  fontBody,
  blocksBase,
  editorNodeId,
  resolveBackground,
}: {
  slide: LayeredSlideshowSlide;
  config: Record<string, unknown> | null;
  schemeColor: string;
  schemeMuted: string;
  schemeBackground: string;
  fontHeading: string;
  fontBody: string;
  blocksBase: string;
  editorNodeId: string;
  resolveBackground: (raw: string) => string | undefined;
}) {
  const alignItems =
    slide.alignment === 'center'
      ? 'center'
      : slide.alignment === 'right'
        ? 'flex-end'
        : 'flex-start';
  const justifyContent =
    slide.position === 'center'
      ? 'center'
      : slide.position === 'bottom'
        ? 'flex-end'
        : 'flex-start';
  const isHorizontal = slide.direction === 'horizontal';
  const slideBg = resolveBackground(slide.backgroundColor);
  const settingsBase = `${blocksBase}.${slide.id}.settings`;
  const themeFonts = { fontHeading, fontBody };
  const colors = {
    text: schemeMuted,
    heading: schemeColor,
    muted: schemeMuted,
    link: schemeColor,
  };
  const headingStyle = readSlideshowSlideTextStyle(
    config,
    settingsBase,
    'heading',
    themeFonts,
    colors,
    slide.alignment
  );
  const bodyStyle = readSlideshowSlideTextStyle(
    config,
    settingsBase,
    'body',
    themeFonts,
    colors,
    slide.alignment
  );
  const button = readSlideshowSlideButtonStyle(config, settingsBase, {
    color: schemeColor,
    muted: schemeMuted,
  }, { label: slide.buttonLabel, href: slide.buttonHref });
  const liveImageUrl =
    cfgString(config, `${settingsBase}.imageUrl`, '').trim() || (slide.imageUrl || '').trim();

  return (
    <>
      {/* Slide background sits behind media so a solid color never covers the image. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            slideBg && slideBg !== schemeBackground ? slideBg : schemeBackground,
        }}
      />
      <LayeredSlideshowSlideMedia
        imageUrl={liveImageUrl || undefined}
        peekVariant={slide.peekVariant}
      />
      {slide.mediaOverlay ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: 'rgba(0,0,0,0.28)',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems,
          justifyContent,
          gap: slide.gap,
          padding: `${slide.paddingTop}px ${slide.paddingRight}px ${slide.paddingBottom}px ${slide.paddingLeft}px`,
          boxSizing: 'border-box',
          background: 'transparent',
          pointerEvents: 'none',
        }}
      >
        <EditorBlock nodeId={`${editorNodeId}:block:${slide.id}`} label="Slide">
          <div
            style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'row' : 'column',
              alignItems,
              gap: slide.gap,
              maxWidth: isHorizontal ? '100%' : '52%',
              width: isHorizontal ? '100%' : undefined,
              boxSizing: 'border-box',
              pointerEvents: 'auto',
            }}
          >
            {slide.title.trim() ? (
              <EditorField
                fieldPath={`${blocksBase}.${slide.id}.settings.title`}
                label="Heading"
                as="h2"
                style={slideshowSlideTextStyleToCss(headingStyle)}
              >
                <ThemeEditorRichTextContent html={slide.title} />
              </EditorField>
            ) : null}
            {slide.body.trim() ? (
              <EditorField
                fieldPath={`${blocksBase}.${slide.id}.settings.body`}
                label="Text"
                as="p"
                style={slideshowSlideTextStyleToCss(bodyStyle)}
              >
                <ThemeEditorRichTextContent html={slide.body} />
              </EditorField>
            ) : null}
            {button.label.trim() ? (
              <EditorField
                fieldPath={`${blocksBase}.${slide.id}.settings.buttonLabel`}
                label="Button label"
                as="span"
                style={{ display: 'inline-flex' }}
              >
                <Link
                  to={button.href || '#'}
                  target={button.openInNewTab ? '_blank' : undefined}
                  rel={button.openInNewTab ? 'noopener noreferrer' : undefined}
                  style={button.style}
                  onClick={(e) => e.stopPropagation()}
                >
                  {button.label}
                </Link>
              </EditorField>
            ) : null}
          </div>
        </EditorBlock>
      </div>
    </>
  );
}

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

  const scopeClass = `codiic-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedLayeredSlideshowCss(sectionId, layoutStyle.customCss);
  const minHeight = slideshowMinHeight(layoutStyle.height);
  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground = backgroundColorRaw
    ? resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, layoutStyle.scheme.background)
    : layoutStyle.scheme.background;

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
    background: sectionBackground,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 24, paddingRight: 24 }
      : { maxWidth: maxWidth || layout.maxWidth, margin: '0 auto', paddingLeft: 24, paddingRight: 24 };

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
    background: sectionBackground,
  };

  return (
    <>
      {customCss ? <style>{customCss}</style> : null}
      <style>{`
        .${scopeClass} .codiic-layered-card {
          transition: ${TRANSITION};
          will-change: left, width;
        }
        .${scopeClass} .codiic-layered-card[data-role="left"] .codiic-layered-card-inner,
        .${scopeClass} .codiic-layered-card[data-role="right"] .codiic-layered-card-inner {
          pointer-events: none;
        }
        .${scopeClass} .codiic-layered-card[data-role="left"]:hover,
        .${scopeClass} .codiic-layered-card[data-role="right"]:hover {
          filter: brightness(0.97);
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
                      className="codiic-layered-card-inner"
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        /* Peek strips show the outer edge of the real slide art. */
                        left: slot.role === 'right' ? 'auto' : 0,
                        right: slot.role === 'left' ? 'auto' : 0,
                        width: isActive ? '100%' : activeWidthExpr,
                        minWidth: isActive ? undefined : 280,
                      }}
                    >
                      {isActive ? (
                        <SlideCardContent
                          slide={slide}
                          config={config}
                          schemeColor={layoutStyle.scheme.color}
                          schemeMuted={layoutStyle.scheme.muted}
                          schemeBackground={layoutStyle.scheme.background}
                          fontHeading={fontHeading}
                          fontBody={fontBody}
                          blocksBase={blocksBase}
                          editorNodeId={editorNodeId}
                          resolveBackground={(raw) =>
                            raw.trim()
                              ? resolveThemePaletteColorSetting(
                                  config,
                                  raw,
                                  0,
                                  layoutStyle.scheme.background
                                )
                              : undefined
                          }
                        />
                      ) : (
                        <LayeredSlideshowSlideMedia
                          imageUrl={slide.imageUrl || undefined}
                          peekVariant={slide.peekVariant}
                        />
                      )}
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
