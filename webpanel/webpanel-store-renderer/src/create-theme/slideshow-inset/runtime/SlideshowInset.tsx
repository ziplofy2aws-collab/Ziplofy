import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgString, cfgNumber } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { LayeredSlideshowSlideMedia } from '../../layered-slideshow/runtime/LayeredSlideshowArt';
import {
  readLayeredSlideshowSlides,
  scopedLayeredSlideshowCss,
  type LayeredSlideshowSlide,
} from '../../layered-slideshow/runtime/layeredSlideshowStyles';
import {
  readSlideshowSlideButtonStyle,
  readSlideshowSlideTextStyle,
  slideshowSlideTextStyleToCss,
} from '../../layered-slideshow/runtime/slideshowSlideContentStyles';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

type NavIcon = 'large-arrows' | 'arrows' | 'chevron' | 'none';
type NavBackground = 'none' | 'circle' | 'square';
type Pagination = 'dots' | 'counter' | 'none';

const SCHEMES: Record<string, { background: string; color: string; muted: string }> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#4b5563' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

const TRACK_TRANSITION = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';

function mediaFrameHeight(mediaHeight: string): number {
  if (mediaHeight === 'small') return 300;
  if (mediaHeight === 'large') return 460;
  return 360;
}

function readNavIcon(raw: string): NavIcon {
  if (raw === 'arrows' || raw === 'chevron' || raw === 'none' || raw === 'large-arrows') return raw;
  return 'large-arrows';
}

function readNavBackground(raw: string): NavBackground {
  if (raw === 'circle' || raw === 'square') return raw;
  return 'none';
}

function readPagination(raw: string): Pagination {
  if (raw === 'counter' || raw === 'none') return raw;
  return 'dots';
}

function NavGlyph({
  dir,
  shape,
  large,
}: {
  dir: 'left' | 'right';
  shape: 'arrows' | 'chevron';
  large: boolean;
}) {
  if (shape === 'chevron') {
    return (
      <span style={{ fontSize: large ? 28 : 22, lineHeight: 1, fontWeight: 500 }} aria-hidden>
        {dir === 'left' ? '‹' : '›'}
      </span>
    );
  }
  return (
    <svg width={large ? 26 : 22} height={large ? 26 : 22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === 'left' ? 'M19 12 H6 M11 6 L5 12 L11 18' : 'M5 12 H18 M13 6 L19 12 L13 18'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavButton({
  label,
  onClick,
  background,
  icon,
  side,
  color,
}: {
  label: string;
  onClick: () => void;
  background: NavBackground;
  icon: Exclude<NavIcon, 'none'>;
  side: 'left' | 'right';
  color: string;
}) {
  const large = icon === 'large-arrows';
  const shape: 'arrows' | 'chevron' = icon === 'chevron' ? 'chevron' : 'arrows';
  const dim = background === 'none' ? (large ? 48 : 36) : large ? 52 : 40;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: 16,
        zIndex: 5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        border: 'none',
        cursor: 'pointer',
        color,
        borderRadius: background === 'circle' ? '50%' : background === 'square' ? 8 : 0,
        background:
          background === 'circle' || background === 'square'
            ? 'rgba(255,255,255,0.95)'
            : 'transparent',
        boxShadow: background !== 'none' ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
      }}
    >
      <NavGlyph dir={side} shape={shape} large={large} />
    </button>
  );
}

export function SlideshowInset({
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

  const slides = useMemo(
    () => readLayeredSlideshowSlides(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const scheme = SCHEMES[schemeKey] ?? SCHEMES['scheme-1'];
  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground = backgroundColorRaw
    ? resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, scheme.background)
    : scheme.background;
  const mediaHeight = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  const contentPosition = cfgString(config, `${settingsBase}.contentPosition`, 'below-media');
  const sectionGap = cfgNumber(config, `${settingsBase}.gap`, 18);
  const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 20);
  const navigationIcon = readNavIcon(
    cfgString(config, `${settingsBase}.navigationIcon`, 'large-arrows')
  );
  const navigationIconBackground = readNavBackground(
    cfgString(config, `${settingsBase}.navigationIconBackground`, 'none')
  );
  const navigationIconColorRaw = cfgString(config, `${settingsBase}.navigationIconColor`, '');
  const pagination = readPagination(cfgString(config, `${settingsBase}.pagination`, 'none'));
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 0);
  const fullWidthOnMobile = cfgBool(config, `${settingsBase}.fullWidthOnMobile`, false);
  const customCss = scopedLayeredSlideshowCss(
    sectionId,
    cfgString(config, `${settingsBase}.customCss`, '')
  );

  const scopeClass = `codiic-slideshow-inset-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const frameH = mediaFrameHeight(mediaHeight);
  const onMedia = contentPosition === 'on-media';

  const slideCount = slides.length;
  const index = slideCount ? ((activeIndex % slideCount) + slideCount) % slideCount : 0;

  const goTo = useCallback((i: number) => setActiveIndex(i), []);
  const goPrev = useCallback(
    () => setActiveIndex((p) => (slideCount ? (p - 1 + slideCount) % slideCount : 0)),
    [slideCount]
  );
  const goNext = useCallback(
    () => setActiveIndex((p) => (slideCount ? (p + 1) % slideCount : 0)),
    [slideCount]
  );

  if (!slideCount) return null;

  const headingFallback = onMedia ? '#ffffff' : scheme.color;
  const bodyFallback = onMedia ? 'rgba(255,255,255,0.92)' : scheme.muted;
  const navColor = navigationIconColorRaw.trim()
    ? resolveThemePaletteColorSetting(
        config,
        navigationIconColorRaw,
        0,
        navigationIconBackground !== 'none' ? '#111827' : onMedia ? '#ffffff' : scheme.color
      )
    : navigationIconBackground !== 'none'
      ? '#111827'
      : onMedia
        ? '#ffffff'
        : scheme.color;

  const trackTransform = `translateX(-${index * 100}%)`;
  const showNav = navigationIcon !== 'none' && slideCount > 1;

  const renderSlideContent = (slide: LayeredSlideshowSlide): ReactNode => {
    const slideSettingsBase = `${blocksBase}.${slide.id}.settings`;
    const themeFonts = { fontHeading, fontBody };
    const colors = {
      text: bodyFallback,
      heading: headingFallback,
      muted: bodyFallback,
      link: headingFallback,
    };
    const headingStyle = readSlideshowSlideTextStyle(
      config,
      slideSettingsBase,
      'heading',
      themeFonts,
      colors,
      slide.alignment
    );
    const bodyStyle = readSlideshowSlideTextStyle(
      config,
      slideSettingsBase,
      'body',
      themeFonts,
      colors,
      slide.alignment
    );
    const button = readSlideshowSlideButtonStyle(
      config,
      slideSettingsBase,
      { color: headingFallback, muted: bodyFallback },
      { label: slide.buttonLabel, href: slide.buttonHref }
    );
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
    const liveImageUrl =
      cfgString(config, `${slideSettingsBase}.imageUrl`, '').trim() ||
      (slide.imageUrl || '').trim();
    const slideBg = slide.backgroundColor
      ? resolveThemePaletteColorSetting(config, slide.backgroundColor, 0, '')
      : undefined;

    const media = (
      <LayeredSlideshowSlideMedia
        imageUrl={liveImageUrl || undefined}
        peekVariant={slide.peekVariant}
        figureWidth="52%"
        figureMaxWidth={460}
      />
    );

    const content = (
      <EditorBlock nodeId={`${editorNodeId}:block:${slide.id}`} label="Slide">
        <div
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            alignItems,
            gap: slide.gap,
            maxWidth: onMedia ? (isHorizontal ? '100%' : 'min(640px, 92%)') : '100%',
            width: isHorizontal ? '100%' : undefined,
            boxSizing: 'border-box',
            pointerEvents: 'auto',
            textAlign: slide.alignment,
          }}
        >
          {slide.title.trim() ? (
            <EditorField
              fieldPath={`${slideSettingsBase}.title`}
              label="Heading"
              as="h2"
              style={slideshowSlideTextStyleToCss(headingStyle)}
            >
              <ThemeEditorRichTextContent html={slide.title} />
            </EditorField>
          ) : null}
          {slide.body.trim() ? (
            <EditorField
              fieldPath={`${slideSettingsBase}.body`}
              label="Text"
              as="p"
              style={slideshowSlideTextStyleToCss(bodyStyle)}
            >
              <ThemeEditorRichTextContent html={slide.body} />
            </EditorField>
          ) : null}
          {button.label.trim() ? (
            <EditorField
              fieldPath={`${slideSettingsBase}.buttonLabel`}
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
    );

    if (onMedia) {
      return (
        <div
          key={slide.id}
          style={{
            position: 'relative',
            flex: '0 0 100%',
            height: '100%',
            overflow: 'hidden',
            background: slideBg || undefined,
          }}
        >
          {media}
          {slide.mediaOverlay ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: 'rgba(0,0,0,0.35)',
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
              paddingTop: slide.paddingTop,
              paddingBottom: slide.paddingBottom,
              paddingLeft: slide.paddingLeft,
              paddingRight: slide.paddingRight,
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            {content}
          </div>
        </div>
      );
    }

    return (
      <div
        key={slide.id}
        style={{
          position: 'relative',
          flex: '0 0 100%',
          display: 'flex',
          flexDirection: 'column',
          background: slideBg || undefined,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: frameH,
            overflow: 'hidden',
            borderRadius: cornerRadius,
            background: '#f3efe6',
          }}
        >
          {media}
          {slide.mediaOverlay ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: 'rgba(0,0,0,0.28)',
                pointerEvents: 'none',
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            alignItems,
            justifyContent,
            gap: slide.gap,
            marginTop: sectionGap,
            paddingTop: slide.paddingTop,
            paddingBottom: slide.paddingBottom,
            paddingLeft: slide.paddingLeft,
            paddingRight: slide.paddingRight,
            boxSizing: 'border-box',
            color: scheme.color,
            fontFamily: fontBody,
            textAlign: slide.alignment,
          }}
        >
          {content}
        </div>
      </div>
    );
  };

  const paginationEl =
    pagination !== 'none' && slideCount > 1 ? (
      pagination === 'counter' ? (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            padding: '6px 12px',
            borderRadius: 999,
            background: onMedia ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)',
            color: onMedia ? '#fff' : '#111827',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {index + 1} / {slideCount}
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
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
                background:
                  i === index
                    ? onMedia
                      ? '#fff'
                      : '#111827'
                    : onMedia
                      ? 'rgba(255,255,255,0.45)'
                      : 'rgba(17,24,39,0.4)',
              }}
            />
          ))}
        </div>
      )
    ) : null;

  const navEl = showNav ? (
    <>
      <NavButton
        label="Previous slide"
        onClick={goPrev}
        background={navigationIconBackground}
        icon={navigationIcon}
        side="left"
        color={navColor}
      />
      <NavButton
        label="Next slide"
        onClick={goNext}
        background={navigationIconBackground}
        icon={navigationIcon}
        side="right"
        color={navColor}
      />
    </>
  ) : null;

  const innerStyle: CSSProperties = {
    maxWidth: maxWidth || layout.maxWidth,
    margin: '0 auto',
    paddingLeft: fullWidthOnMobile ? 0 : 24,
    paddingRight: 24,
  };

  return (
    <>
      {customCss ? <style>{customCss}</style> : null}
      <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Slideshow: Inset">
        <div
          className={scopeClass}
          style={{
            paddingTop,
            paddingBottom,
            background: sectionBackground,
            boxSizing: 'border-box',
            color: scheme.color,
            fontFamily: fontBody,
          }}
        >
          <div style={innerStyle}>
            {onMedia ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: frameH,
                  overflow: 'hidden',
                  borderRadius: cornerRadius,
                  background: '#f3efe6',
                }}
                role="region"
                aria-roledescription="carousel"
                aria-label="Slideshow"
              >
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    transform: trackTransform,
                    transition: TRACK_TRANSITION,
                  }}
                >
                  {slides.map(renderSlideContent)}
                </div>
                {navEl}
                {paginationEl}
              </div>
            ) : (
              <div role="region" aria-roledescription="carousel" aria-label="Slideshow">
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      transform: trackTransform,
                      transition: TRACK_TRANSITION,
                      alignItems: 'flex-start',
                    }}
                  >
                    {slides.map(renderSlideContent)}
                  </div>
                  {/* Nav overlays the media band of the active slide */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: frameH,
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
                      {navEl}
                      {paginationEl}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </EditorSection>
    </>
  );
}
