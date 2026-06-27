import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgString, cfgNumber } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { LayeredSlideshowSlideMedia } from '../../layered-slideshow/runtime/LayeredSlideshowArt';
import {
  readLayeredSlideshowSlides,
  scopedLayeredSlideshowCss,
  type LayeredSlideshowSlide,
} from '../../layered-slideshow/runtime/layeredSlideshowStyles';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

const SCHEMES: Record<string, { background: string; color: string; muted: string }> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#4b5563' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

function mediaFrameHeight(mediaHeight: string): number {
  if (mediaHeight === 'small') return 300;
  if (mediaHeight === 'large') return 460;
  return 360;
}

const TRACK_TRANSITION = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';

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
  const mediaHeight = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  const navBackground = cfgString(config, `${settingsBase}.navigationIconBackground`, 'none');
  const pagination = cfgString(config, `${settingsBase}.pagination`, 'none');
  const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 20);
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 0);
  const fullWidthOnMobile = cfgBool(config, `${settingsBase}.fullWidthOnMobile`, false);
  const customCss = scopedLayeredSlideshowCss(sectionId, cfgString(config, `${settingsBase}.customCss`, ''));

  const scopeClass = `ziplofy-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const frameH = mediaFrameHeight(mediaHeight);

  const slideCount = slides.length;
  const index = slideCount ? ((activeIndex % slideCount) + slideCount) % slideCount : 0;

  const goTo = useCallback((i: number) => setActiveIndex(i), []);

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
    color: '#111827',
    borderRadius: '50%',
    background: navBackground === 'none' ? 'transparent' : 'rgba(255,255,255,0.85)',
    boxShadow: navBackground !== 'none' ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
  };

  const trackTransform = `translateX(-${index * 100}%)`;

  const mediaCard = (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        height: frameH,
        overflow: 'hidden',
        borderRadius: cornerRadius,
        background: '#f3efe6',
      }}
    >
      <div
        style={{ display: 'flex', height: '100%', width: '100%', transform: trackTransform, transition: TRACK_TRANSITION }}
      >
        {slides.map((s, i) => (
          <div key={s.id} style={{ position: 'relative', flex: '0 0 100%', height: '100%', overflow: 'hidden' }}>
            <LayeredSlideshowSlideMedia
              imageUrl={s.imageUrl || undefined}
              peekVariant={i % 2 === 0 ? 'figure' : 'landscape'}
              figureWidth="52%"
              figureMaxWidth={460}
            />
          </div>
        ))}
      </div>

      {slideCount > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo((index - 1 + slideCount) % slideCount)}
            style={{ ...navButtonStyle, left: 16 }}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo((index + 1) % slideCount)}
            style={{ ...navButtonStyle, right: 16 }}
          >
            <Chevron dir="right" />
          </button>
        </>
      ) : null}

      {pagination === 'dots' && slideCount > 1 ? (
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
                background: i === index ? '#111827' : 'rgba(17,24,39,0.4)',
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  const renderContent = (slide: LayeredSlideshowSlide) => (
    <EditorBlock nodeId={`${editorNodeId}:block:${slide.id}`} label="Slide">
      {slide.title.trim() ? (
        <EditorField
          fieldPath={`${blocksBase}.${slide.id}.settings.title`}
          label="Heading"
          as="h2"
          style={{
            margin: 0,
            fontFamily: fontHeading,
            fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: scheme.color,
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
            margin: '12px auto 0',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            color: scheme.muted,
            maxWidth: 420,
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
          style={{ display: 'inline-flex', marginTop: 20 }}
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
  );

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
          style={{ paddingTop, paddingBottom, background: scheme.background, boxSizing: 'border-box' }}
        >
          <div style={innerStyle}>
            {mediaCard}

            {/* content carousel, slides in sync with the media */}
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  transform: trackTransform,
                  transition: TRACK_TRANSITION,
                  alignItems: 'flex-start',
                }}
              >
                {slides.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      flex: '0 0 100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '28px 24px 8px',
                      boxSizing: 'border-box',
                      color: scheme.color,
                      fontFamily: fontBody,
                    }}
                  >
                    {renderContent(s)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EditorSection>
    </>
  );
}
