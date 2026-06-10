import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type HeroScheme = {
  background: string;
  color: string;
  muted: string;
};

const COLOR_SCHEMES: Record<string, HeroScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', muted: '#64748b' },
  'scheme-3': { background: '#fff7ed', color: '#431407', muted: '#9a3412' },
  'scheme-4': { background: '#f5f3ff', color: '#4c1d95', muted: '#6d28d9' },
  'scheme-5': { background: '#ecfdf5', color: '#064e3b', muted: '#047857' },
  'scheme-6': { background: '#1f2937', color: '#f9fafb', muted: '#9ca3af' },
  'scheme-large-logo': { background: '#f0f1ed', color: '#111827', muted: '#6b7280' },
};

const HEIGHT_PX: Record<string, number> = {
  small: 400,
  medium: 520,
  large: 680,
  full: 900,
};

export type HeroStyle = {
  scheme: HeroScheme;
  minHeight: number | string;
  maxWidth: string | number;
  paddingTop: number;
  paddingBottom: number;
  paddingX: number;
  /** Block flow inside the content area (heading, buttons, etc.). */
  contentDirection: 'row' | 'column';
  /** @deprecated Use contentDirection — kept for callers still reading `direction`. */
  direction: 'row' | 'column';
  /** Vertical placement of the content group in the hero (top / center / bottom). */
  sectionJustify: string;
  /** Outer flex main-axis when blocks are grouped (not space-between). */
  sectionOuterJustify: string;
  /** Main-axis distribution inside the content column. */
  contentColumnJustify: string;
  /** When true the content column fills hero height (space-between blocks). */
  contentColumnFill: boolean;
  /** Main-axis distribution when content blocks flow horizontally. */
  contentJustify: string;
  /** Cross-axis alignment for content blocks. */
  contentAlign: string;
  alignItems: string;
  justifyContent: string;
  alignTextBaseline: boolean;
  verticalOnMobile: boolean;
  textAlign: 'left' | 'center' | 'right';
  position: 'top' | 'center' | 'bottom' | 'space-between';
  gap: number;
  media1Url: string;
  media2Url: string;
  mobileImageUrl: string;
  mobileMedia1Url: string;
  mobileMedia2Url: string;
  mobileStackMedia: boolean;
  mobileDifferentMedia: boolean;
  mediaOverlay: boolean;
  overlayColor: string;
  overlayStyle: 'solid' | 'gradient';
  overlayGradientDirection: 'up' | 'down';
  blurredReflection: boolean;
  sectionLink: string;
  sectionLinkNewTab: boolean;
  customCss: string;
};

export function readHeroStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: HeroScheme
): HeroStyle {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-6');
  const scheme = COLOR_SCHEMES[schemeKey] ?? fallback;

  const legacyAlign = cfgString(config, `${settingsBase}.textAlign`, '');
  const layoutAlignment = cfgString(
    config,
    `${settingsBase}.layoutAlignment`,
    legacyAlign || 'center'
  );
  const textAlign: HeroStyle['textAlign'] =
    layoutAlignment === 'left'
      ? 'left'
      : layoutAlignment === 'right'
        ? 'right'
        : 'center';

  const fullWidthLegacy = cfgBool(config, `${settingsBase}.fullWidth`, false);
  const sectionWidth = cfgString(
    config,
    `${settingsBase}.sectionWidth`,
    fullWidthLegacy ? 'full' : 'page'
  );

  const heightKey = cfgString(config, `${settingsBase}.height`, '');
  const legacyMin = cfgNumber(config, `${settingsBase}.minHeight`, 0);
  const customHeight = cfgNumber(config, `${settingsBase}.customHeight`, HEIGHT_PX.medium);
  const minHeight: HeroStyle['minHeight'] =
    heightKey === 'auto'
      ? 'auto'
      : heightKey === 'full'
        ? '100vh'
        : heightKey === 'custom'
          ? customHeight
          : HEIGHT_PX[heightKey] ?? (legacyMin > 0 ? legacyMin : HEIGHT_PX.medium);

  const positionRaw = cfgString(config, `${settingsBase}.position`, 'center');
  const position: HeroStyle['position'] =
    positionRaw === 'top'
      ? 'top'
      : positionRaw === 'bottom'
        ? 'bottom'
        : positionRaw === 'space-between'
          ? 'space-between'
          : 'center';

  const sectionJustify =
    position === 'top'
      ? 'flex-start'
      : position === 'bottom'
        ? 'flex-end'
        : position === 'space-between'
          ? 'space-between'
          : 'center';

  const directionRaw = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const contentDirection: HeroStyle['contentDirection'] =
    directionRaw === 'horizontal' ? 'row' : 'column';

  const contentJustify =
    contentDirection === 'row'
      ? layoutAlignment === 'space-between'
        ? 'space-between'
        : layoutAlignment === 'left'
          ? 'flex-start'
          : layoutAlignment === 'right'
            ? 'flex-end'
            : 'center'
      : 'flex-start';

  const contentAlign =
    contentDirection === 'row'
      ? position === 'top'
        ? 'flex-start'
        : position === 'bottom'
          ? 'flex-end'
          : 'center'
      : layoutAlignment === 'left'
        ? 'flex-start'
        : layoutAlignment === 'right'
          ? 'flex-end'
          : 'center';

  const isHorizontal = contentDirection === 'row';
  const spreadVerticalBlocks =
    contentDirection === 'column' && position === 'space-between';
  /** Horizontal: position uses align-items inside a full-height row wrapper. */
  const contentColumnFill = spreadVerticalBlocks || isHorizontal;
  const sectionOuterJustify =
    spreadVerticalBlocks || isHorizontal ? 'flex-start' : sectionJustify;
  const contentColumnJustify =
    contentDirection === 'column'
      ? spreadVerticalBlocks
        ? 'space-between'
        : 'flex-start'
      : contentJustify;

  return {
    scheme,
    minHeight,
    maxWidth: sectionWidth === 'full' ? '100%' : 1200,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 56),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 56),
    paddingX: 24,
    contentDirection,
    direction: contentDirection,
    sectionJustify,
    sectionOuterJustify,
    contentColumnJustify,
    contentColumnFill,
    contentJustify,
    contentAlign,
    alignItems: sectionJustify,
    justifyContent: contentJustify,
    position,
    alignTextBaseline: cfgBool(config, `${settingsBase}.alignTextBaseline`, false),
    verticalOnMobile: cfgBool(config, `${settingsBase}.verticalOnMobile`, false),
    textAlign,
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    media1Url: cfgString(config, `${settingsBase}.media1ImageUrl`, ''),
    media2Url: cfgString(config, `${settingsBase}.media2ImageUrl`, ''),
    mobileImageUrl: cfgString(config, `${settingsBase}.mobileImageUrl`, ''),
    mobileMedia1Url:
      cfgString(config, `${settingsBase}.mobileMedia1ImageUrl`, '') ||
      cfgString(config, `${settingsBase}.mobileImageUrl`, ''),
    mobileMedia2Url: cfgString(config, `${settingsBase}.mobileMedia2ImageUrl`, ''),
    mobileStackMedia: cfgBool(config, `${settingsBase}.mobileStackMedia`, false),
    mobileDifferentMedia: cfgBool(config, `${settingsBase}.mobileDifferentMedia`, false),
    mediaOverlay: cfgBool(config, `${settingsBase}.mediaOverlay`, true),
    overlayColor: cfgString(config, `${settingsBase}.overlayColor`, '#12121266'),
    overlayStyle:
      cfgString(config, `${settingsBase}.overlayStyle`, 'solid') === 'gradient' ? 'gradient' : 'solid',
    overlayGradientDirection:
      cfgString(config, `${settingsBase}.overlayGradientDirection`, 'up') === 'down' ? 'down' : 'up',
    blurredReflection: cfgBool(config, `${settingsBase}.blurredReflection`, false),
    sectionLink: cfgString(config, `${settingsBase}.sectionLink`, ''),
    sectionLinkNewTab: cfgBool(config, `${settingsBase}.sectionLinkNewTab`, false),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedHeroCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed
    .split('\n')
    .map((line) => `[data-ziplofy-section="${sectionId}"] ${line}`)
    .join('\n');
}

export function heroResponsiveCss(
  sectionId: string,
  stackMedia: boolean,
  differentMobile: boolean
): string {
  if (!stackMedia && !differentMobile) return '';
  const sel = `[data-ziplofy-section="${sectionId}"] .hero-media-grid`;
  let css = '';
  if (stackMedia) {
    css += `@media (max-width: 749px) { ${sel} { flex-direction: column !important; } }`;
  }
  if (differentMobile) {
    css += `@media (max-width: 749px) { ${sel} .hero-media-1 { display: none; } ${sel} .hero-media-2 { display: none; } ${sel} .hero-media-mobile { display: block !important; flex: 1; min-height: 200px; } }`;
  }
  return css;
}

/** Stack horizontal content blocks vertically on small screens when enabled. */
export function heroContentVerticalOnMobileCss(
  sectionId: string,
  verticalOnMobile: boolean,
  isHorizontal: boolean
): string {
  if (!isHorizontal || !verticalOnMobile) return '';
  const sel = `[data-ziplofy-section="${sectionId}"] .hero-content-blocks`;
  return `@media (max-width: 749px) { ${sel} { flex-direction: column !important; align-items: stretch !important; } }`;
}

/** Stack dual hero media vertically on small screens when enabled in settings. */
export function heroDualMediaResponsiveCss(sectionId: string, stackOnMobile: boolean): string {
  if (!stackOnMobile) return '';
  const root = `[data-ziplofy-section="${sectionId}"] .hero-dual-media-backdrop`;
  const tile = `[data-ziplofy-section="${sectionId}"] .hero-dual-media-tile`;
  return `@media (max-width: 749px) { ${root} { flex-direction: column !important; } ${tile} { flex: 1 1 50% !important; width: 100% !important; max-width: 100% !important; min-height: 50%; } }`;
}
