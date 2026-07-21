import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import type { SectionRuntimeProps } from '../../runtime/types';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import { VideoStorytellingShirtsIllustration } from './VideoStorytellingArt';
import {
  alignItemsForPosition,
  justifyContentForAlignment,
  readStorytellingVideoLayout,
  resolveStorytellingVideoBorderCss,
  scopedStorytellingVideoCss,
  storytellingVideoMinHeight,
} from './storytellingVideoStyles';

const CAPTION_MAX_WIDTH: Record<string, string> = {
  narrow: '320px',
  normal: '520px',
  wide: '720px',
};

const TYPO_PRESET: Record<string, CSSProperties> = {
  default: { fontSize: 15, fontWeight: 400, lineHeight: 1.45 },
  'heading-1': { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  'heading-2': { fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
};

function clampPercent(n: number): number {
  return Math.min(100, Math.max(1, Number.isFinite(n) ? n : 100));
}

function resolveOptionalPaletteColor(
  config: Record<string, unknown> | null,
  raw: string,
  defaultIndex: number,
  fallback: string
): string | undefined {
  if (!raw || raw === 'default') return undefined;
  return resolveThemePaletteColorSetting(config, raw, defaultIndex, fallback);
}

function captionGroupJustify(alignment: string): CSSProperties['justifyContent'] {
  if (
    alignment === 'flex-start' ||
    alignment === 'center' ||
    alignment === 'flex-end' ||
    alignment === 'space-between' ||
    alignment === 'space-around' ||
    alignment === 'space-evenly'
  ) {
    return alignment;
  }
  if (alignment === 'left' || alignment === 'start') return 'flex-start';
  if (alignment === 'right' || alignment === 'end') return 'flex-end';
  return 'space-between';
}
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

/** Pull a usable URL from a bare link or pasted `<iframe src="...">` snippet. */
function normalizeVideoInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const iframeSrc = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrc?.[1]) return iframeSrc[1].trim();
  return trimmed;
}

function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0] ?? '';
      return /^[\w-]{6,}$/.test(id) ? id : null;
    }
    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const fromQuery = u.searchParams.get('v');
      if (fromQuery && /^[\w-]{6,}$/.test(fromQuery)) return fromQuery;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'live' || p === 'v');
      if (embedIdx >= 0) {
        const id = parts[embedIdx + 1] ?? '';
        // Strip extras like embed/ID?si=... already handled by search; pathname id only.
        const clean = id.split('&')[0] ?? '';
        return /^[\w-]{6,}$/.test(clean) ? clean : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeEmbedUrl(raw: string): string | null {
  const url = normalizeVideoInput(raw);
  if (!url) return null;
  const id = youtubeVideoId(url);
  if (id) return `https://www.youtube.com/embed/${id}`;
  // Already an embed URL we couldn't parse further — use as-is if it looks valid.
  try {
    const u = new URL(url);
    if (
      (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) &&
      u.pathname.includes('/embed/')
    ) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoEmbedUrl(raw: string): string | null {
  const url = normalizeVideoInput(raw);
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'player.vimeo.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      const videoIdx = parts.indexOf('video');
      const id = videoIdx >= 0 ? parts[videoIdx + 1] : parts[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (!host.includes('vimeo.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    // /123456789 or /video/123456789 or /channels/.../123456789
    const id = [...parts].reverse().find((p) => /^\d+$/.test(p));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  } catch {
    return null;
  }
}

export function StorytellingVideo({
  sectionId = 'storytelling_video',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
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

  const videoUrl = cfgString(config, `${settingsBase}.videoUrl`, '');
  const coverImageUrl = cfgString(config, `${settingsBase}.coverImageUrl`, '');
  const videoAutoplay = cfgBool(config, `${settingsBase}.videoAutoplay`, false);
  const videoLoop = cfgBool(config, `${settingsBase}.videoLoop`, true);
  const videoWidth = Math.max(1, Math.min(100, cfgNumber(config, `${settingsBase}.videoWidth`, 100)));
  const videoCornerRadius = cfgNumber(config, `${settingsBase}.videoCornerRadius`, 0);
  const videoBorderStyle = cfgString(config, `${settingsBase}.videoBorderStyle`, 'none');
  const videoBorderThickness = cfgNumber(config, `${settingsBase}.videoBorderThickness`, 1);
  const videoBorderOpacity = cfgNumber(config, `${settingsBase}.videoBorderOpacity`, 100);
  const videoBorderColor = cfgString(config, `${settingsBase}.videoBorderColor`, '');
  const videoPaddingTop = cfgNumber(config, `${settingsBase}.videoPaddingTop`, 0);
  const videoPaddingBottom = cfgNumber(config, `${settingsBase}.videoPaddingBottom`, 0);
  const videoPaddingLeft = cfgNumber(config, `${settingsBase}.videoPaddingLeft`, 0);
  const videoPaddingRight = cfgNumber(config, `${settingsBase}.videoPaddingRight`, 0);

  const captionGroupBase = `${settingsBase}.captionGroup`;
  const captionGroupDirection = cfgString(config, `${captionGroupBase}.direction`, 'horizontal');
  const captionGroupVerticalOnMobile = cfgBool(
    config,
    `${captionGroupBase}.verticalOnMobile`,
    false
  );
  const captionGroupAlignment = cfgString(
    config,
    `${captionGroupBase}.layoutAlignment`,
    'space-between'
  );
  const captionGroupPosition = cfgString(config, `${captionGroupBase}.position`, 'bottom');
  const captionGroupAlignBaseline = cfgBool(
    config,
    `${captionGroupBase}.alignTextBaseline`,
    false
  );
  const captionGroupGap = cfgNumber(config, `${captionGroupBase}.layoutGap`, 12);
  const captionGroupWidth = cfgString(config, `${captionGroupBase}.width`, 'fill');
  const captionGroupCustomWidth = clampPercent(
    cfgNumber(config, `${captionGroupBase}.customWidth`, 100)
  );
  const captionGroupHeight = cfgString(config, `${captionGroupBase}.height`, 'fit');
  const captionGroupCustomHeight = clampPercent(
    cfgNumber(config, `${captionGroupBase}.customHeight`, 100)
  );
  const captionGroupBgMedia = cfgString(config, `${captionGroupBase}.backgroundMedia`, 'none');
  const captionGroupBgImage = cfgString(config, `${captionGroupBase}.backgroundImageUrl`, '');
  const captionGroupBgImagePosition = cfgString(
    config,
    `${captionGroupBase}.backgroundImagePosition`,
    'cover'
  );
  const captionGroupBgColorRaw = cfgString(config, `${captionGroupBase}.backgroundColor`, '');
  const captionGroupOverlay = cfgBool(config, `${captionGroupBase}.backgroundOverlay`, false);
  const captionBorderStyle = cfgString(config, `${captionGroupBase}.borderStyle`, 'none');
  const captionBorderThickness = cfgNumber(config, `${captionGroupBase}.borderThickness`, 1);
  const captionBorderOpacity = cfgNumber(config, `${captionGroupBase}.borderOpacity`, 100);
  const captionBorderColorRaw = cfgString(config, `${captionGroupBase}.borderColor`, '');
  const captionCornerRadius = cfgNumber(config, `${captionGroupBase}.cornerRadius`, 0);
  const captionGroupPaddingTop = cfgNumber(config, `${captionGroupBase}.paddingTop`, 0);
  const captionGroupPaddingBottom = cfgNumber(config, `${captionGroupBase}.paddingBottom`, 0);
  const captionGroupPaddingLeft = cfgNumber(config, `${captionGroupBase}.paddingLeft`, 0);
  const captionGroupPaddingRight = cfgNumber(config, `${captionGroupBase}.paddingRight`, 0);
  const captionGroupLinkUrl = cfgString(config, `${captionGroupBase}.linkUrl`, '');
  const captionGroupOpenInNewTab = cfgBool(config, `${captionGroupBase}.openLinkInNewTab`, false);

  const caption = cfgString(
    config,
    `${settingsBase}.caption`,
    'Take a look behind the scenes of our latest product launch.'
  );
  const captionWidth = cfgString(config, `${settingsBase}.captionWidth`, 'fit');
  const captionMaxWidth = cfgString(config, `${settingsBase}.captionMaxWidth`, 'normal');
  const captionTypographyPreset = cfgString(
    config,
    `${settingsBase}.captionTypographyPreset`,
    'default'
  );
  const captionColorRaw = cfgString(config, `${settingsBase}.captionColor`, '');
  const captionBackgroundEnabled = cfgBool(
    config,
    `${settingsBase}.captionBackgroundEnabled`,
    false
  );
  const captionBackgroundColorRaw = cfgString(
    config,
    `${settingsBase}.captionBackgroundColor`,
    ''
  );
  const captionPaddingTop = cfgNumber(config, `${settingsBase}.captionPaddingTop`, 0);
  const captionPaddingBottom = cfgNumber(config, `${settingsBase}.captionPaddingBottom`, 0);
  const captionPaddingLeft = cfgNumber(config, `${settingsBase}.captionPaddingLeft`, 0);
  const captionPaddingRight = cfgNumber(config, `${settingsBase}.captionPaddingRight`, 0);

  const linkLabel = cfgString(config, `${settingsBase}.linkLabel`, 'Discover the collection');
  const linkUrl = cfgString(config, `${settingsBase}.linkUrl`, '/collections');
  const linkOpenInNewTab = cfgBool(config, `${settingsBase}.linkOpenInNewTab`, false);
  const buttonStyle = cfgString(config, `${settingsBase}.buttonStyle`, 'link');
  const buttonLinkTextColorRaw = cfgString(config, `${settingsBase}.buttonLinkTextColor`, '');
  const buttonCustomBackgroundRaw = cfgString(
    config,
    `${settingsBase}.buttonCustomBackground`,
    '#111827'
  );
  const buttonCustomTextRaw = cfgString(config, `${settingsBase}.buttonCustomText`, '#ffffff');
  const buttonDesktopWidth = cfgString(config, `${settingsBase}.buttonDesktopWidth`, 'fit');
  const buttonDesktopCustomWidth = clampPercent(
    cfgNumber(config, `${settingsBase}.buttonDesktopCustomWidth`, 100)
  );
  const buttonMobileWidth = cfgString(config, `${settingsBase}.buttonMobileWidth`, 'fit');
  const buttonMobileCustomWidth = clampPercent(
    cfgNumber(config, `${settingsBase}.buttonMobileCustomWidth`, 100)
  );

  const scheme = style.scheme;
  const captionColor =
    resolveOptionalPaletteColor(config, captionColorRaw, 1, scheme.color) ?? scheme.color;
  const captionBackgroundColor = captionBackgroundEnabled
    ? resolveOptionalPaletteColor(
        config,
        captionBackgroundColorRaw,
        0,
        `${scheme.muted}14`
      ) ?? `${scheme.muted}14`
    : undefined;
  const buttonLinkTextColor =
    resolveOptionalPaletteColor(config, buttonLinkTextColorRaw, 1, scheme.color) ?? undefined;
  const buttonCustomBackground =
    resolveOptionalPaletteColor(config, buttonCustomBackgroundRaw, 0, '#111827') ?? '#111827';
  const buttonCustomText =
    resolveOptionalPaletteColor(config, buttonCustomTextRaw, 1, '#ffffff') ?? '#ffffff';
  const captionBorderColorResolved =
    resolveOptionalPaletteColor(config, captionBorderColorRaw, 1, scheme.muted) ?? '';
  const captionGroupBgColor =
    captionGroupBgMedia === 'color'
      ? resolveOptionalPaletteColor(config, captionGroupBgColorRaw, 0, scheme.background)
      : undefined;
  const sectionBorderColorResolved =
    resolveOptionalPaletteColor(config, style.borderColor, 1, scheme.muted) ?? '';
  const videoBorderColorResolved =
    resolveOptionalPaletteColor(config, videoBorderColor, 1, scheme.muted) ?? '';
  const minHeight = storytellingVideoMinHeight(style.height);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const mediaOnRight = style.videoOnRight;
  const isHorizontal = style.direction === 'horizontal';
  const scopeClass = `codiic-storytelling-video-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

  const shell: CSSProperties = {
    position: 'relative',
    background:
      style.backgroundMedia === 'color' && cfgString(config, `${settingsBase}.backgroundColor`, '')
        ? cfgString(config, `${settingsBase}.backgroundColor`, scheme.background)
        : scheme.background,
    backgroundImage:
      style.backgroundMedia === 'image' && style.backgroundImageUrl
        ? `url(${style.backgroundImageUrl})`
        : undefined,
    backgroundSize: style.backgroundMedia === 'image' ? 'cover' : undefined,
    backgroundPosition: style.backgroundMedia === 'image' ? 'center' : undefined,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    overflow: 'hidden',
    border: resolveStorytellingVideoBorderCss(
      style.borderStyle,
      style.borderThickness,
      style.borderOpacity,
      sectionBorderColorResolved,
      scheme.muted
    ),
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
  };

  const horizontalMediaHeight = minHeight ?? 360;

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight: horizontalMediaHeight,
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: style.layoutGap,
    alignItems: isHorizontal ? 'stretch' : 'stretch',
    justifyContent: isHorizontal
      ? justifyContentForAlignment(style.layoutAlignment)
      : 'flex-start',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const mediaShell: CSSProperties = {
    position: 'relative',
    flex: isHorizontal ? '1 1 66%' : '1 1 auto',
    minWidth: isHorizontal ? 0 : undefined,
    minHeight: isHorizontal
      ? horizontalMediaHeight
      : Math.max((minHeight ?? 400) - 88, 260),
    width: isHorizontal ? undefined : '100%',
    order: isHorizontal && !mediaOnRight ? 0 : isHorizontal ? 1 : 0,
    paddingTop: videoPaddingTop,
    paddingBottom: videoPaddingBottom,
    paddingLeft: videoPaddingLeft,
    paddingRight: videoPaddingRight,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'stretch',
  };

  const mediaPanel: CSSProperties = {
    position: 'relative',
    width: isHorizontal ? '100%' : `${videoWidth}%`,
    maxWidth: '100%',
    marginLeft: !isHorizontal && videoWidth < 100 ? 'auto' : undefined,
    marginRight: !isHorizontal && videoWidth < 100 ? 'auto' : undefined,
    minHeight: isHorizontal ? horizontalMediaHeight : 260,
    height: isHorizontal ? '100%' : undefined,
    aspectRatio: isHorizontal ? undefined : '16 / 9',
    background: scheme.mediaPanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: videoCornerRadius > 0 ? videoCornerRadius : undefined,
    border: resolveStorytellingVideoBorderCss(
      videoBorderStyle,
      videoBorderThickness,
      videoBorderOpacity,
      videoBorderColorResolved,
      scheme.muted
    ),
    // Diagonal clip hides borders; drop it when a solid border is active.
    clipPath:
      videoBorderStyle === 'solid'
        ? undefined
        : isHorizontal
          ? mediaOnRight
            ? 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)'
            : 'polygon(0 0, 100% 0, 86% 100%, 0 100%)'
          : undefined,
    flex: isHorizontal ? '1 1 auto' : undefined,
  };

  const playAnchor: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
  };

  const captionGroupIsRow = captionGroupDirection !== 'vertical';
  const captionGroupWidthCss =
    captionGroupWidth === 'custom'
      ? `${captionGroupCustomWidth}%`
      : captionGroupWidth === 'fit'
        ? 'fit-content'
        : '100%';
  const captionGroupHeightCss =
    captionGroupHeight === 'custom' ? `${captionGroupCustomHeight}%` : undefined;
  const useCaptionGroupImage =
    captionGroupBgMedia === 'image' && Boolean(captionGroupBgImage.trim());

  const footer: CSSProperties = {
    display: 'flex',
    flexDirection: captionGroupIsRow ? 'row' : 'column',
    alignItems: captionGroupAlignBaseline
      ? 'baseline'
      : captionGroupIsRow
        ? 'flex-end'
        : 'stretch',
    justifyContent: captionGroupJustify(captionGroupAlignment),
    gap: captionGroupGap,
    flexWrap: captionGroupIsRow ? 'wrap' : 'nowrap',
    paddingTop: isHorizontal ? captionGroupPaddingTop : 24 + captionGroupPaddingTop,
    paddingBottom: 4 + captionGroupPaddingBottom,
    paddingLeft: captionGroupPaddingLeft || undefined,
    paddingRight: captionGroupPaddingRight || undefined,
    width: isHorizontal
      ? captionGroupWidth === 'fill'
        ? '100%'
        : captionGroupWidthCss
      : captionGroupWidthCss,
    flex: isHorizontal
      ? captionGroupWidth === 'fill'
        ? '0 0 34%'
        : captionGroupWidth === 'custom'
          ? `0 0 ${captionGroupCustomWidth}%`
          : '0 0 auto'
      : undefined,
    alignSelf: isHorizontal
      ? alignItemsForPosition(captionGroupPosition || style.position)
      : undefined,
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 3,
    order: isHorizontal && !mediaOnRight ? 1 : isHorizontal ? 0 : 1,
    maxWidth: isHorizontal
      ? captionGroupWidth === 'custom'
        ? `${captionGroupCustomWidth}%`
        : captionGroupWidth === 'fit'
          ? '34%'
          : '34%'
      : '100%',
    minWidth: isHorizontal ? 180 : undefined,
    minHeight: captionGroupHeightCss,
    height: captionGroupHeightCss,
    border: resolveStorytellingVideoBorderCss(
      captionBorderStyle,
      captionBorderThickness,
      captionBorderOpacity,
      captionBorderColorResolved,
      scheme.muted
    ),
    borderRadius: captionCornerRadius > 0 ? captionCornerRadius : undefined,
    background: !useCaptionGroupImage ? captionGroupBgColor : undefined,
    backgroundImage: useCaptionGroupImage
      ? captionGroupOverlay
        ? `linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.28)), url(${captionGroupBgImage.trim()})`
        : `url(${captionGroupBgImage.trim()})`
      : undefined,
    backgroundSize: useCaptionGroupImage
      ? captionGroupBgImagePosition === 'contain'
        ? 'contain'
        : 'cover'
      : undefined,
    backgroundPosition: useCaptionGroupImage ? 'center' : undefined,
    backgroundRepeat: useCaptionGroupImage ? 'no-repeat' : undefined,
    textDecoration: 'none',
    color: 'inherit',
  };

  const captionStyle: CSSProperties = {
    margin: 0,
    ...(TYPO_PRESET[captionTypographyPreset] ?? TYPO_PRESET.default),
    color: captionColor,
    maxWidth: captionWidth === 'fill' ? '100%' : CAPTION_MAX_WIDTH[captionMaxWidth] ?? '520px',
    width: captionWidth === 'fill' ? '100%' : undefined,
    flex: captionWidth === 'fill' ? '1 1 auto' : undefined,
    background: captionBackgroundColor,
    paddingTop: captionPaddingTop,
    paddingBottom: captionPaddingBottom,
    paddingLeft: captionPaddingLeft,
    paddingRight: captionPaddingRight,
    borderRadius: captionBackgroundEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };

  const desktopBtnWidth =
    buttonDesktopWidth === 'custom' ? `${buttonDesktopCustomWidth}%` : 'fit-content';
  const mobileBtnWidth =
    buttonMobileWidth === 'custom' ? `${buttonMobileCustomWidth}%` : 'fit-content';

  const linkStyle: CSSProperties = (() => {
    const widthStyle: CSSProperties = {
      width: desktopBtnWidth,
      maxWidth: '100%',
      boxSizing: 'border-box',
    };
    if (buttonStyle === 'primary') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        color: '#ffffff',
        background: scheme.color,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        padding: '10px 18px',
        borderRadius: 8,
        ...widthStyle,
      };
    }
    if (buttonStyle === 'secondary') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        color: scheme.color,
        background: 'transparent',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        padding: '10px 18px',
        borderRadius: 8,
        border: `1px solid ${scheme.muted}66`,
        ...widthStyle,
      };
    }
    if (buttonStyle === 'custom') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        color: buttonCustomText,
        background: buttonCustomBackground,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        padding: '10px 18px',
        borderRadius: 8,
        ...widthStyle,
      };
    }
    return {
      display: 'inline-flex',
      fontSize: 15,
      fontWeight: 500,
      color: buttonLinkTextColor || captionColor,
      textDecoration: 'underline',
      textUnderlineOffset: 3,
      whiteSpace: 'nowrap',
      ...widthStyle,
    };
  })();

  const yt = youtubeEmbedUrl(videoUrl);
  const vimeo = vimeoEmbedUrl(videoUrl);
  const embedSrc = yt || vimeo;
  const embedSrcWithParams = (() => {
    if (!embedSrc) return '';
    const params: string[] = [];
    if (videoAutoplay) {
      params.push('autoplay=1', 'mute=1');
    }
    if (videoLoop && yt) {
      params.push('loop=1');
      const id = youtubeVideoId(normalizeVideoInput(videoUrl));
      if (id) params.push(`playlist=${id}`);
    }
    if (!params.length) return embedSrc;
    return `${embedSrc}${embedSrc.includes('?') ? '&' : '?'}${params.join('&')}`;
  })();

  const mediaContent = embedSrcWithParams ? (
    <iframe
      title="Video"
      src={embedSrcWithParams}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      style={{ width: '100%', height: '100%', border: 0, display: 'block', minHeight: 260 }}
    />
  ) : coverImageUrl ? (
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
        minHeight: 260,
        background: `linear-gradient(135deg, ${scheme.mediaPanel} 0%, #d8d8d8 100%)`,
      }}
    />
  ) : (
    <VideoStorytellingShirtsIllustration />
  );

  const showPlayOverlay = !embedSrc && Boolean(coverImageUrl || videoUrl);

  const captionScope = `.${scopeClass} .codiic-storytelling-video-caption`;
  const buttonScope = `.${scopeClass} .codiic-storytelling-video-caption-button`;
  const responsiveCss = [
    `@media (max-width: 749px) { ${buttonScope} { width: ${mobileBtnWidth} !important; } }`,
    captionGroupVerticalOnMobile
      ? `@media (max-width: 749px) { ${captionScope} { flex-direction: column !important; align-items: stretch !important; } }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const scopedCss = [scopedStorytellingVideoCss(sectionId, style.customCss), responsiveCss]
    .filter(Boolean)
    .join('\n');

  const linkNode =
    linkUrl && linkOpenInNewTab ? (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="codiic-storytelling-video-caption-button"
        style={linkStyle}
      >
        {linkLabel}
      </a>
    ) : linkUrl ? (
      <Link to={linkUrl} className="codiic-storytelling-video-caption-button" style={linkStyle}>
        {linkLabel}
      </Link>
    ) : (
      <span className="codiic-storytelling-video-caption-button" style={linkStyle}>
        {linkLabel}
      </span>
    );

  const captionInner = (
    <>
      <EditorField fieldPath={`${settingsBase}.caption`} label="Caption" as="div" style={captionStyle}>
        <ThemeEditorRichTextContent html={caption} />
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.linkLabel`} label="Link" as="span">
        {linkNode}
      </EditorField>
    </>
  );

  const captionBlock =
    captionGroupLinkUrl && captionGroupOpenInNewTab ? (
      <a
        href={captionGroupLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="codiic-storytelling-video-caption"
        style={footer}
      >
        {captionInner}
      </a>
    ) : captionGroupLinkUrl ? (
      <Link to={captionGroupLinkUrl} className="codiic-storytelling-video-caption" style={footer}>
        {captionInner}
      </Link>
    ) : (
      <div className="codiic-storytelling-video-caption" style={footer}>
        {captionInner}
      </div>
    );

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
            {showPlayOverlay ? (
              <div style={playAnchor}>
                <PlayButton />
              </div>
            ) : null}
          </EditorField>
        </div>
        {captionBlock}
      </div>
    </EditorSection>
  );
}
