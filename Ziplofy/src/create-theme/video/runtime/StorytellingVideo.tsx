import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { VideoStorytellingShirtsIllustration } from './VideoStorytellingArt';
import {
  alignItemsForPosition,
  justifyContentForAlignment,
  readStorytellingVideoLayout,
  scopedStorytellingVideoCss,
  storytellingVideoMinHeight,
} from './storytellingVideoStyles';

const linkStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const captionStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.45,
  color: 'inherit',
  maxWidth: 'min(100%, 520px)',
};

function PlayButton() {
  return (
    <span
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          marginLeft: 4,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: '16px solid #111827',
        }}
      />
    </span>
  );
}

export function StorytellingVideo({
  sectionId = 'storytelling_video',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(
    () => readStorytellingVideoLayout(config, settingsBase),
    [config, settingsBase]
  );

  const videoSource = cfgString(config, `${settingsBase}.videoSource`, 'url');
  const videoUrl = cfgString(config, `${settingsBase}.videoUrl`, '');
  const coverImageUrl = cfgString(config, `${settingsBase}.coverImageUrl`, '');
  const caption = cfgString(
    config,
    `${settingsBase}.caption`,
    'Take a look behind the scenes of our latest product launch.'
  );
  const linkLabel = cfgString(config, `${settingsBase}.linkLabel`, 'Discover the collection');
  const linkUrl = cfgString(config, `${settingsBase}.linkUrl`, '/collections');

  const scheme = style.scheme;
  const minHeight = storytellingVideoMinHeight(style.height);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const mediaOnRight = style.videoOnRight;
  const isHorizontal = style.direction === 'horizontal';
  const scopeClass = `ziplofy-storytelling-video-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

  const shell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    overflow: 'hidden',
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
  };

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight: minHeight ?? (isHorizontal ? 360 : 400),
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: style.layoutGap,
    alignItems: isHorizontal ? alignItemsForPosition(style.position) : 'stretch',
    justifyContent: isHorizontal
      ? justifyContentForAlignment(style.layoutAlignment)
      : 'flex-start',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const mediaShell: CSSProperties = {
    position: 'relative',
    flex: isHorizontal ? '1 1 66%' : '1 1 auto',
    minHeight: isHorizontal ? undefined : Math.max((minHeight ?? 400) - 88, 260),
    width: isHorizontal ? undefined : '100%',
    order: isHorizontal && !mediaOnRight ? 0 : isHorizontal ? 1 : 0,
  };

  const mediaPanel: CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: isHorizontal ? '100%' : '66%',
    ...(mediaOnRight || isHorizontal ? { right: 0 } : { left: 0 }),
    background: scheme.mediaPanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    clipPath:
      mediaOnRight || isHorizontal
        ? 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)'
        : 'polygon(0 0, 100% 0, 86% 100%, 0 100%)',
  };

  const playAnchor: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    ...(mediaOnRight || isHorizontal ? { left: '12%' } : { right: '12%' }),
  };

  const footer: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 24,
    paddingTop: isHorizontal ? 0 : 24,
    paddingBottom: 4,
    width: '100%',
    flex: isHorizontal ? '0 0 auto' : undefined,
    alignSelf: isHorizontal ? alignItemsForPosition(style.position) : undefined,
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 3,
    order: isHorizontal && !mediaOnRight ? 1 : isHorizontal ? 0 : 1,
    maxWidth: isHorizontal ? '34%' : '100%',
  };

  const mediaContent =
    coverImageUrl && videoSource !== 'uploaded' ? (
      <img
        src={coverImageUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    ) : videoUrl ? (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${scheme.mediaPanel} 0%, #d8d8d8 100%)`,
        }}
      />
    ) : (
      <VideoStorytellingShirtsIllustration />
    );

  const scopedCss = scopedStorytellingVideoCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Video"
      className={scopeClass}
      style={shell}
    >
      {style.backgroundOverlay ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.12)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ) : null}
      {scopedCss ? <style>{scopedCss}</style> : null}
      <div style={stage} data-section-type="storytelling-video">
        <div style={mediaShell}>
          <EditorField
            fieldPath={`${settingsBase}.coverImageUrl`}
            label="Cover image"
            as="div"
            style={mediaPanel}
          >
            {mediaContent}
            <div style={playAnchor}>
              <PlayButton />
            </div>
          </EditorField>
        </div>
        <div style={footer}>
          <EditorField fieldPath={`${settingsBase}.caption`} label="Caption" as="p" style={captionStyle}>
            {caption}
          </EditorField>
          <EditorField fieldPath={`${settingsBase}.linkLabel`} label="Link" as="span">
            {linkUrl ? (
              <Link to={linkUrl} style={linkStyle}>
                {linkLabel}
              </Link>
            ) : (
              <span style={linkStyle}>{linkLabel}</span>
            )}
          </EditorField>
        </div>
      </div>
    </EditorSection>
  );
}
