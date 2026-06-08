import { cfgBool, cfgNumber, cfgString } from './config';

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
  direction: 'row' | 'column';
  alignItems: string;
  justifyContent: string;
  textAlign: 'left' | 'center' | 'right';
  gap: number;
  media1Url: string;
  media2Url: string;
  mobileImageUrl: string;
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
  const textAlign =
    layoutAlignment === 'left' ? 'left' : layoutAlignment === 'right' ? 'right' : 'center';

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

  const position = cfgString(config, `${settingsBase}.position`, 'bottom');
  const alignItems =
    position === 'top'
      ? 'flex-start'
      : position === 'bottom'
        ? 'flex-end'
        : position === 'space-between'
          ? 'space-between'
          : 'center';
  const justifyContent =
    textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

  const direction = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const flexDirection = direction === 'horizontal' ? 'row' : 'column';

  return {
    scheme,
    minHeight,
    maxWidth: sectionWidth === 'full' ? '100%' : 1200,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 100),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 72),
    paddingX: 24,
    direction: flexDirection,
    alignItems,
    justifyContent,
    textAlign,
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 24),
    media1Url: cfgString(config, `${settingsBase}.media1ImageUrl`, ''),
    media2Url: cfgString(config, `${settingsBase}.media2ImageUrl`, ''),
    mobileImageUrl: cfgString(config, `${settingsBase}.mobileImageUrl`, ''),
    mobileStackMedia: cfgBool(config, `${settingsBase}.mobileStackMedia`, false),
    mobileDifferentMedia: cfgBool(config, `${settingsBase}.mobileDifferentMedia`, false),
    mediaOverlay: cfgBool(config, `${settingsBase}.mediaOverlay`, true),
    overlayColor: cfgString(config, `${settingsBase}.overlayColor`, '#12121266'),
    overlayStyle: cfgString(config, `${settingsBase}.overlayStyle`, 'solid') === 'gradient'
      ? 'gradient'
      : 'solid',
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

export function splitShowcaseResponsiveCss(sectionId: string, verticalOnMobile: boolean): string {
  if (!verticalOnMobile) return '';
  const sel = `[data-ziplofy-section="${sectionId}"] .split-showcase-grid`;
  const tile = `[data-ziplofy-section="${sectionId}"] .split-showcase-tile`;
  return `@media (max-width: 749px) { ${sel} { flex-direction: column !important; } ${tile} { flex: 1 1 auto !important; width: 100% !important; min-height: 320px; } }`;
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

export function heroDualMediaResponsiveCss(sectionId: string, stackOnMobile: boolean): string {
  if (!stackOnMobile) return '';
  const root = `[data-ziplofy-section="${sectionId}"] .hero-dual-media-backdrop`;
  const tile = `[data-ziplofy-section="${sectionId}"] .hero-dual-media-tile`;
  return `@media (max-width: 749px) { ${root} { flex-direction: column !important; } ${tile} { flex: 1 1 50% !important; width: 100% !important; max-width: 100% !important; min-height: 50%; } }`;
}
