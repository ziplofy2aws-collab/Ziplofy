import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgString, cfgNumber } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors } from '../../runtime/shared/tokens';
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

const SCHEMES: Record<string, { background: string; color: string; muted: string }> = {
  'scheme-1': { background: '#f3efe6', color: '#111827', muted: '#374151' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#4b5563' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#4b5563' },
};

function frameHeight(mediaHeight: string): number | string {
  if (mediaHeight === 'small') return 460;
  if (mediaHeight === 'large') return 680;
  if (mediaHeight === 'full') return '100vh';
  return 560;
}

const ALIGN_MAP: Record<
  string,
  { items: CSSProperties['alignItems']; text: CSSProperties['textAlign'] }
> = {
  left: { items: 'flex-start', text: 'left' },
  center: { items: 'center', text: 'center' },
  right: { items: 'flex-end', text: 'right' },
};

const POSITION_MAP: Record<string, CSSProperties['justifyContent']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === 'left' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SlideshowFullFrame({
  sectionId,
  placement = 'template',
  templateId = 'index',
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
  const pagination = cfgString(config, `${settingsBase}.pagination`, 'dots');
  const navBackground = cfgString(config, `${settingsBase}.navigationIconBackground`, 'none');
  const autoRotate = cfgBool(config, `${settingsBase}.autoRotate`, false);
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 0);
  const customCss = scopedLayeredSlideshowCss(sectionId, cfgString(config, `${settingsBase}.customCss`, ''));

  const scopeClass = `codiic-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const minHeight = frameHeight(mediaHeight);

  const slideCount = slides.length;
  const index = slideCount ? ((activeIndex % slideCount) + slideCount) % slideCount : 0;

  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  const readSlideSettings = (id: string) => {
    const base = `${blocksBase}.${id}.settings`;
    const alignment = cfgString(config, `${base}.alignment`, 'center');
    const align = ALIGN_MAP[alignment] ?? ALIGN_MAP.center;
    const position = cfgString(config, `${base}.position`, 'center');
    const bgRaw = cfgString(config, `${base}.backgroundColor`, '');
    return {
      align,
      justify: POSITION_MAP[position] ?? 'center',
      gap: cfgNumber(config, `${base}.gap`, 12),
      paddingTop: cfgNumber(config, `${base}.paddingTop`, 48),
      paddingBottom: cfgNumber(config, `${base}.paddingBottom`, 48),
      paddingLeft: cfgNumber(config, `${base}.paddingLeft`, 48),
      paddingRight: cfgNumber(config, `${base}.paddingRight`, 48),
      background: bgRaw ? resolveThemePaletteColorSetting(config, bgRaw, 0, '') : undefined,
      mediaOverlay: cfgBool(config, `${base}.mediaOverlay`, false),
    };
  };

  const autoRef = useRef(autoRotate && slideCount > 1);
  autoRef.current = autoRotate && slideCount > 1;
  useEffect(() => {
    if (!autoRef.current) return;
    const id = window.setInterval(() => setActiveIndex((p) => p + 1), 5000);
    return () => window.clearInterval(id);
  }, [slideCount]);

  if (!slideCount) return null;

  const navButtonStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    border: 'none',
    cursor: 'pointer',
    color: scheme.color,
    borderRadius: '50%',
    background: navBackground === 'none' ? 'transparent' : 'rgba(255,255,255,0.85)',
    boxShadow: navBackground !== 'none' ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
  };

  const renderSlide = (slide: LayeredSlideshowSlide, i: number) => {
    const s = readSlideSettings(slide.id);
    const slideSettingsBase = `${blocksBase}.${slide.id}.settings`;
    const themeFonts = { fontHeading, fontBody };
    const colors = {
      text: scheme.muted,
      heading: scheme.color,
      muted: scheme.muted,
      link: scheme.color,
    };
    const fallbackAlign =
      s.align.text === 'center' || s.align.text === 'right' ? s.align.text : 'left';
    const headingStyle = readSlideshowSlideTextStyle(
      config,
      slideSettingsBase,
      'heading',
      themeFonts,
      colors,
      fallbackAlign
    );
    const bodyStyle = readSlideshowSlideTextStyle(
      config,
      slideSettingsBase,
      'body',
      themeFonts,
      colors,
      fallbackAlign
    );
    const button = readSlideshowSlideButtonStyle(
      config,
      slideSettingsBase,
      { color: scheme.color, muted: scheme.muted },
      { label: slide.buttonLabel, href: slide.buttonHref }
    );
    return (
    <div
      key={slide.id}
      style={{
        position: 'relative',
        flex: '0 0 100%',
        height: '100%',
        overflow: 'hidden',
        background: s.background || undefined,
      }}
    >
      <LayeredSlideshowSlideMedia
        imageUrl={
          cfgString(config, `${blocksBase}.${slide.id}.settings.imageUrl`, '').trim() ||
          slide.imageUrl ||
          undefined
        }
        peekVariant={i % 2 === 0 ? 'figure' : 'landscape'}
        figureWidth="56%"
        figureMaxWidth={520}
      />
      {s.mediaOverlay ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(0,0,0,0.35)' }} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: s.align.items,
          justifyContent: s.justify,
          textAlign: s.align.text,
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          paddingLeft: s.paddingLeft,
          paddingRight: s.paddingRight,
          background: 'transparent',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        <EditorBlock nodeId={`${editorNodeId}:block:${slide.id}`} label="Slide">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: s.align.items,
              gap: s.gap,
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
                >
                  {button.label}
                </Link>
              </EditorField>
            ) : null}
          </div>
        </EditorBlock>
      </div>
    </div>
    );
  };

  return (
    <>
      {customCss ? <style>{customCss}</style> : null}
      <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Slideshow: Full frame">
        <div
          className={scopeClass}
          style={{ paddingTop, paddingBottom, background: sectionBackground, boxSizing: 'border-box' }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: minHeight,
              minHeight,
              overflow: 'hidden',
              background: sectionBackground,
              color: scheme.color,
              fontFamily: fontBody,
            }}
          >
            <div
              style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                transform: `translateX(-${index * 100}%)`,
                transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {slides.map(renderSlide)}
            </div>

            {slideCount > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => goTo((index - 1 + slideCount) % slideCount)}
                  style={{ ...navButtonStyle, left: 20 }}
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => goTo((index + 1) % slideCount)}
                  style={{ ...navButtonStyle, right: 20 }}
                >
                  <Chevron dir="right" />
                </button>
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
                      background: i === index ? '#111827' : 'rgba(17,24,39,0.35)',
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </EditorSection>
    </>
  );
}
