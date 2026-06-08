import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function sizeCss(mode: string, percent: number): string {
  if (mode === 'fill') return '100%';
  if (mode === 'custom') return `${clampPercent(percent)}%`;
  return 'auto';
}

export type FeaturedProductHeaderBlockStyle = {
  shell: Record<string, string | number | undefined>;
  content: Record<string, string | number | undefined>;
  bgLayer: Record<string, string | number | undefined> | null;
  overlayLayer: Record<string, string | number | undefined> | null;
  mobileWidthCss: string;
  linkUrl: string;
  openInNewTab: boolean;
};

export function readFeaturedProductHeaderBlockStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): FeaturedProductHeaderBlockStyle {
  const direction = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const position = cfgString(config, `${settingsBase}.position`, 'center');
  const gap = cfgNumber(config, `${settingsBase}.layoutGap`, 12);

  const widthMode = cfgString(config, `${settingsBase}.width`, 'fill');
  const mobileWidthMode = cfgString(config, `${settingsBase}.mobileWidth`, 'fill');
  const heightMode = cfgString(config, `${settingsBase}.height`, 'fit');
  const customWidth = cfgNumber(config, `${settingsBase}.customWidth`, 100);
  const mobileCustomWidth = cfgNumber(config, `${settingsBase}.mobileCustomWidth`, 100);
  const customHeight = cfgNumber(config, `${settingsBase}.customHeight`, 100);

  const desktopWidth = sizeCss(widthMode, customWidth);
  const mobileWidth = sizeCss(mobileWidthMode, mobileCustomWidth);
  const height =
    heightMode === 'fill' ? '100%' : heightMode === 'custom' ? `${clampPercent(customHeight)}%` : 'auto';

  const alignItems =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
  const justifyContent =
    position === 'bottom' ? 'flex-end' : position === 'center' ? 'center' : 'flex-start';

  const borderStyle = cfgString(config, `${settingsBase}.borderStyle`, 'none');
  const borderThickness = cfgNumber(config, `${settingsBase}.borderThickness`, 1);
  const borderOpacity = cfgNumber(config, `${settingsBase}.borderOpacity`, 100);
  const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 0);
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.paddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.paddingRight`, 0);

  const bgMedia = cfgString(config, `${settingsBase}.backgroundMedia`, 'none');
  const bgImageUrl = cfgString(config, `${settingsBase}.backgroundImageUrl`, '');
  const bgImagePosition = cfgString(config, `${settingsBase}.backgroundImagePosition`, 'cover');
  const showBgImage = bgMedia === 'image' && Boolean(bgImageUrl.trim());
  const showOverlay = cfgBool(config, `${settingsBase}.backgroundOverlay`, false) && showBgImage;

  const linkUrl = cfgString(config, `${settingsBase}.linkUrl`, '');
  const openInNewTab = cfgBool(config, `${settingsBase}.openLinkInNewTab`, false);

  const shell: Record<string, string | number | undefined> = {
    position: 'relative',
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    alignItems: direction === 'horizontal' ? justifyContent : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : justifyContent,
    gap,
    width: desktopWidth,
    height,
    boxSizing: 'border-box',
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    borderRadius: borderStyle === 'solid' ? cornerRadius : cornerRadius > 0 ? cornerRadius : undefined,
    border:
      borderStyle === 'solid'
        ? `${borderThickness}px solid rgba(0,0,0,${Math.min(100, Math.max(0, borderOpacity)) / 100})`
        : undefined,
    overflow: (borderStyle === 'solid' || showBgImage) && cornerRadius > 0 ? 'hidden' : undefined,
  };

  const content: Record<string, string | number | undefined> = {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    alignItems: direction === 'horizontal' ? justifyContent : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : justifyContent,
    gap,
    width: '100%',
  };

  const bgLayer = showBgImage
    ? {
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: bgImagePosition === 'fit' ? 'contain' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
        pointerEvents: 'none',
      }
    : null;

  const overlayLayer =
    showOverlay && bgLayer
      ? {
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 1,
          pointerEvents: 'none',
        }
      : null;

  return {
    shell,
    content,
    bgLayer,
    overlayLayer,
    mobileWidthCss:
      desktopWidth !== mobileWidth
        ? `@media (max-width: 749px) { [data-fp-header] { width: ${mobileWidth} !important; } }`
        : '',
    linkUrl,
    openInNewTab,
  };
}
