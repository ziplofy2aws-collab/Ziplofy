import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { layoutBlockOrder, templateBlockOrder } from '../../runtime/shared/structureOrder';
import {
  resolveTextBlockTypographyStyle,
  type ThemeFonts,
} from '../../runtime/shared/themeTypographyRuntime';

export type CollectionLinksScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEME_FALLBACKS: Record<string, CollectionLinksScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

/** Soften a resolved CSS color for idle Collection Links: Text titles. */
function colorWithAlpha(color: string, alpha: number): string {
  const c = color.trim();
  const rgbMatch = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }
  let hex = c.startsWith('#') ? c.slice(1) : '';
  if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
  if (hex.length !== 6) return c;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (![r, g, b].every((n) => Number.isFinite(n))) return c;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type CollectionLinkData = {
  id: string;
  title: string;
  productCount: number;
  showCount: boolean;
  href: string;
  imageUrl: string;
};

export type CollectionLinksSpotlightLayout = {
  scheme: CollectionLinksScheme;
  layoutMode: 'spotlight' | 'text';
  sectionWidth: 'page' | 'full';
  alignment: 'left' | 'center' | 'right';
  imagePosition: 'left' | 'right';
  imageUrl: string;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readCollectionLinksSpotlightLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionLinksSpotlightLayout {
  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, 'collection-links-spotlight');
  const layoutMode =
    catalogVariant === 'collection-links-text'
      ? 'text'
      : catalogVariant === 'collection-links-spotlight'
        ? 'spotlight'
        : cfgString(config, `${settingsBase}.layoutMode`, 'spotlight') === 'text'
          ? 'text'
          : 'spotlight';
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const imagePosition = cfgString(config, `${settingsBase}.imagePosition`, 'right');

  const legacySchemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const legacy = SCHEME_FALLBACKS[legacySchemeKey] ?? SCHEME_FALLBACKS['scheme-1'];

  const bgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '').trim();
  const textRaw = cfgString(config, `${settingsBase}.textColor`, '').trim();
  const hasCustomText = Boolean(textRaw && textRaw !== 'default' && !textRaw.startsWith('scheme-'));
  const hasCustomBg = Boolean(bgRaw && bgRaw !== 'default' && !bgRaw.startsWith('scheme-'));
  const background = hasCustomBg
    ? resolveThemePaletteColorSetting(config, bgRaw, 0, legacy.background)
    : legacy.background;
  const color = hasCustomText
    ? resolveThemePaletteColorSetting(config, textRaw, 1, legacy.color)
    : legacy.color;
  // Idle text links must still reflect Text color (not a fixed scheme gray).
  const muted = hasCustomText ? colorWithAlpha(color, 0.5) : legacy.muted;

  return {
    scheme: {
      background,
      color,
      muted,
    },
    layoutMode,
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    alignment:
      alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left',
    imagePosition: imagePosition === 'left' ? 'left' : 'right',
    imageUrl: cfgString(config, `${settingsBase}.imageUrl`, ''),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readCollectionLinks(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): CollectionLinkData[] {
  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const blocksPath = `${sectionBase}.blocks`;
  const order =
    placement === 'template'
      ? templateBlockOrder(config, templateId, sectionId, [])
      : layoutBlockOrder(config, sectionId, []);
  const blocksMap = getThemeConfigValue(config, blocksPath) as
    | Record<string, { settings?: Record<string, unknown> }>
    | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);

  return ids.map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    const handle = String(settings.collectionHandle ?? '').trim();
    const hrefFromSettings = String(settings.href ?? '').trim();
    const href =
      hrefFromSettings ||
      (handle ? `/collection/${handle}` : '/collections/all');
    return {
      id,
      title: String(settings.title ?? 'Collection title'),
      productCount: Number(settings.productCount ?? 5),
      showCount: Boolean(settings.showCount),
      href,
      imageUrl: String(settings.imageUrl ?? '').trim(),
    };
  });
}

export function scopedCollectionLinksCss(sectionId: string, customCss: string): string {
  const scope = `[data-codiic-section="${sectionId}"]`;
  if (!customCss.trim()) return '';
  return customCss
    .trim()
    .split('\n')
    .map((line) => `${scope} ${line}`)
    .join('\n');
}

export function textAlignForAlignment(alignment: CollectionLinksSpotlightLayout['alignment']): string {
  if (alignment === 'center') return 'center';
  if (alignment === 'right') return 'right';
  return 'left';
}

/** Flex main-axis alignment for text-layout collection links (wraps by available width). */
export function textLinksFlexJustifyForAlignment(
  alignment: CollectionLinksSpotlightLayout['alignment']
): 'flex-start' | 'center' | 'flex-end' {
  if (alignment === 'center') return 'center';
  if (alignment === 'right') return 'flex-end';
  return 'flex-start';
}

export type CollectionLinkTitleStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: string;
  lineHeight: number;
  letterSpacing: string;
  textTransform: 'none' | 'uppercase';
  textWrap?: string;
};

export function readCollectionLinkTitleStyle(
  config: Record<string, unknown> | null,
  blockSettingsBase: string,
  isTextLayout: boolean,
  themeFonts?: { fontHeading: string; fontBody: string }
): CollectionLinkTitleStyle {
  const fonts: ThemeFonts = {
    fontBody: themeFonts?.fontBody ?? 'inherit',
    fontHeading: themeFonts?.fontHeading ?? 'inherit',
  };

  const presetRaw = cfgString(config, `${blockSettingsBase}.typographyPreset`, '');
  // Prefer modern typographyPreset whenever present; only fall back to legacy titleFont*.
  if (!presetRaw) {
    const legacyFont = cfgString(config, `${blockSettingsBase}.titleFont`, '');
    if (legacyFont) {
      const weightKey = cfgString(config, `${blockSettingsBase}.titleWeight`, 'default');
      const lineHeightKey = cfgString(config, `${blockSettingsBase}.titleLineHeight`, 'normal');
      const letterSpacingKey = cfgString(config, `${blockSettingsBase}.titleLetterSpacing`, 'normal');
      const caseKey = cfgString(config, `${blockSettingsBase}.titleCase`, 'default');
      const fontSizes: Record<string, number> = {
        body: isTextLayout ? 28 : 18,
        subheading: isTextLayout ? 32 : 20,
        heading: isTextLayout ? 40 : 24,
        accent: isTextLayout ? 30 : 22,
      };
      const weights: Record<string, number> = {
        default: 500,
        '300': 300,
        '400': 400,
        '500': 500,
        '600': 600,
        '700': 700,
      };
      const lineHeights: Record<string, number> = { normal: 1.25, tight: 1.1, loose: 1.4 };
      const letterSpacings: Record<string, string> = {
        normal: '0',
        tight: '-0.02em',
        wide: '0.04em',
      };
      return {
        fontFamily:
          legacyFont === 'heading'
            ? fonts.fontHeading
            : legacyFont === 'accent'
              ? fonts.fontBody
              : fonts.fontBody,
        fontSize: fontSizes[legacyFont] ?? (isTextLayout ? 32 : 22),
        fontWeight: weights[weightKey] ?? 500,
        lineHeight: lineHeights[lineHeightKey] ?? 1.25,
        letterSpacing: letterSpacings[letterSpacingKey] ?? '0',
        textTransform: caseKey === 'uppercase' ? 'uppercase' : 'none',
      };
    }
  }

  const typo = resolveTextBlockTypographyStyle(
    config,
    blockSettingsBase,
    presetRaw || (isTextLayout ? 'heading-3' : 'heading-5'),
    fonts
  );

  return {
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    fontStyle: typo.fontStyle as string | undefined,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
    textTransform: typo.textTransform === 'uppercase' ? 'uppercase' : 'none',
    textWrap: typo.textWrap as string | undefined,
  };
}

export type CollectionLinkImageStyle = {
  maxHeight: number;
  width: number;
  aspectRatio: string;
  borderRadius: number;
  objectFit: 'cover';
};

export function blockSettingsBaseForCollectionLink(
  linkId: string,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): string {
  return placement === 'template'
    ? `templates.${templateId}.sections.${sectionId}.blocks.${linkId}.settings`
    : `sections.${sectionId}.blocks.${linkId}.settings`;
}

export type CollectionLinkSpotlightMedia = {
  linkId: string;
  imageUrl: string;
  imageStyle: CollectionLinkImageStyle;
  imageFieldPath: string;
};

export function readCollectionLinkSpotlightMedia(
  config: Record<string, unknown> | null,
  link: CollectionLinkData | undefined,
  layoutImageUrl: string,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): CollectionLinkSpotlightMedia | null {
  if (!link) return null;
  const blockBase = blockSettingsBaseForCollectionLink(link.id, templateId, sectionId, placement);
  const imageUrl = link.imageUrl || layoutImageUrl;
  if (!imageUrl) return null;
  return {
    linkId: link.id,
    imageUrl,
    imageStyle: readCollectionLinkImageStyle(config, blockBase),
    imageFieldPath: `${blockBase}.imageUrl`,
  };
}

export function readCollectionLinkImageStyle(
  config: Record<string, unknown> | null,
  blockSettingsBase: string
): CollectionLinkImageStyle {
  const heightKey = cfgString(config, `${blockSettingsBase}.imageHeight`, 'large');
  const ratioKey = cfgString(config, `${blockSettingsBase}.imageRatio`, 'square');
  const borderRadius = cfgNumber(config, `${blockSettingsBase}.imageCornerRadius`, 0);

  const heights: Record<string, number> = { small: 280, medium: 400, large: 520 };
  const ratios: Record<string, string> = {
    square: '1 / 1',
    portrait: '4 / 5',
    landscape: '16 / 9',
  };
  const ratioParts: Record<string, [number, number]> = {
    square: [1, 1],
    portrait: [4, 5],
    landscape: [16, 9],
  };
  const maxHeight = heights[heightKey] ?? 520;
  const [rw, rh] = ratioParts[ratioKey] ?? [1, 1];
  const width = Math.round(maxHeight * (rw / rh));

  return {
    maxHeight,
    width,
    aspectRatio: ratios[ratioKey] ?? '1 / 1',
    borderRadius,
    objectFit: 'cover',
  };
}
