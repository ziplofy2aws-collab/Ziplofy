import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgString, cfgNumber } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
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
  'scheme-1': { background: '#ddd6c8', color: '#ffffff', muted: 'rgba(255,255,255,0.92)' },
  'scheme-2': { background: '#1e3a5f', color: '#ffffff', muted: 'rgba(255,255,255,0.9)' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

function frameHeight(mediaHeight: string): number | string {
  if (mediaHeight === 'small') return 420;
  if (mediaHeight === 'large') return 640;
  if (mediaHeight === 'full') return '100vh';
  return 520;
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
        boxShadow: background !== 'none' ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
        textShadow: background === 'none' ? '0 1px 3px rgba(0,0,0,0.35)' : undefined,
      }}
    >
      <NavGlyph dir={side} shape={shape} large={large} />
    </button>
  );
}

export function SlideshowFullFrame({
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
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'full');
  const contentPosition = cfgString(config, `${settingsBase}.contentPosition`, 'on-media');
  const navigationIcon = readNavIcon(cfgString(config, `${settingsBase}.navigationIcon`, 'large-arrows'));
  const navigationIconBackground = readNavBackground(
    cfgString(config, `${settingsBase}.navigationIconBackground`, 'none')
  );
  const navigationIconColorRaw = cfgString(config, `${settingsBase}.navigationIconColor`, '');
  const pagination = readPagination(cfgString(config, `${settingsBase}.pagination`, 'dots'));
  const autoRotate = cfgBool(config, `${settingsBase}.autoRotate`, false);
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 0);
  const customCss = scopedLayeredSlideshowCss(
    sectionId,
    cfgString(config, `${settingsBase}.customCss`, '')
  );

  const scopeClass = `codiic-slideshow-full-frame-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const minHeight = frameHeight(mediaHeight);
  const onMedia = contentPosition !== 'below-media';
  const isPageWidth = sectionWidth === 'page';

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

  useEffect(() => {
    if (!autoRotate || slideCount < 2) return;
    const id = window.setInterval(() => setActiveIndex((p) => p + 1), 5000);
    return () => window.clearInterval(id);
  }, [autoRotate, slideCount]);

  if (!slideCount) return null;

  const textOnMedia = onMedia;
  const headingFallback = textOnMedia ? '#ffffff' : scheme.color;
  const bodyFallback = textOnMedia ? 'rgba(255,255,255,0.92)' : scheme.muted;
  const navColor = navigationIconColorRaw.trim()
    ? resolveThemePaletteColorSetting(
        config,
        navigationIconColorRaw,
        0,
        navigationIconBackground !== 'none' ? '#111827' : textOnMedia ? '#ffffff' : scheme.color
      )
    : navigationIconBackground !== 'none'
      ? '#111827'
      : textOnMedia
        ? '#ffffff'
        : scheme.color;

  const outerStyle: CSSProperties = {
    paddingTop,
    paddingBottom,
    background: onMedia ? sectionBackground : '#fff',
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties = isPageWidth
    ? {
        maxWidth: maxWidth || layout.maxWidth,
        margin: '0 auto',
        paddingLeft: 24,
        paddingRight: 24,
      }
    : { maxWidth: '100%' };

  const frameStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: onMedia ? minHeight : undefined,
    minHeight: onMedia ? minHeight : undefined,
    overflow: 'hidden',
    borderRadius: isPageWidth ? 12 : 0,
    background: sectionBackground,
    color: scheme.color,
    fontFamily: fontBody,
  };

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

    const media = (
      <LayeredSlideshowSlideMedia
        imageUrl={liveImageUrl || undefined}
        peekVariant={slide.peekVariant}
        figureWidth="56%"
        figureMaxWidth={520}
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
            maxWidth: onMedia ? (isHorizontal ? '100%' : 'min(720px, 92%)') : '100%',
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
      const slideBg = slide.backgroundColor
        ? resolveThemePaletteColorSetting(config, slide.backgroundColor, 0, '')
        : undefined;
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
          background: sectionBackground,
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: minHeight, minHeight, overflow: 'hidden' }}>
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
            paddingTop: slide.paddingTop,
            paddingBottom: slide.paddingBottom,
            paddingLeft: slide.paddingLeft,
            paddingRight: slide.paddingRight,
            boxSizing: 'border-box',
            background: slide.backgroundColor
              ? resolveThemePaletteColorSetting(config, slide.backgroundColor, 0, '#fff')
              : '#fff',
            color: scheme.color,
          }}
        >
          {content}
        </div>
      </div>
    );
  };

  const showNav = navigationIcon !== 'none' && slideCount > 1;

  return (
    <>
      {customCss ? <style>{customCss}</style> : null}
      <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Slideshow: Full frame">
        <div className={scopeClass} style={outerStyle}>
          <div style={innerStyle}>
            <div style={frameStyle} role="region" aria-roledescription="carousel" aria-label="Slideshow">
              <div
                style={{
                  display: 'flex',
                  height: onMedia ? '100%' : undefined,
                  width: '100%',
                  transform: `translateX(-${index * 100}%)`,
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {slides.map(renderSlideContent)}
              </div>

              {showNav ? (
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
              ) : null}

              {pagination === 'dots' && slideCount > 1 ? (
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
                        background:
                          i === index
                            ? textOnMedia
                              ? '#fff'
                              : '#111827'
                            : textOnMedia
                              ? 'rgba(255,255,255,0.45)'
                              : 'rgba(17,24,39,0.35)',
                      }}
                    />
                  ))}
                </div>
              ) : null}

              {pagination === 'counter' && slideCount > 1 ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: textOnMedia ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)',
                    color: textOnMedia ? '#fff' : '#111827',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  {index + 1} / {slideCount}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </EditorSection>
    </>
  );
}
