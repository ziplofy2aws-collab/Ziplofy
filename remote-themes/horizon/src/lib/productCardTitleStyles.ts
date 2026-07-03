import { cfgBool, cfgNumber, cfgString } from './config';

function readPalette(config: Record<string, unknown> | null): string[] {
  const palette = (config?.settings as Record<string, unknown> | undefined)?.colors as
    | Record<string, unknown>
    | undefined;
  const raw = palette?.palette;
  if (Array.isArray(raw) && raw.length >= 2) {
    return raw.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
  }
  return ['#ffffff', '#111827'];
}

function resolveTitleColor(
  config: Record<string, unknown> | null,
  colorKey: string,
  fallback: string
): string {
  if (colorKey === '' || colorKey === 'default') return fallback;
  if (colorKey.startsWith('#')) return colorKey;
  if (colorKey === 'palette' || /^palette:\d+$/.test(colorKey)) {
    const palette = readPalette(config);
    const match = /^palette:(\d+)$/.exec(colorKey);
    const index = match ? Number(match[1]) : 1;
    return palette[index] ?? fallback;
  }
  return fallback;
}

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  default: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  'heading-1': { fontSize: 28, fontWeight: 700, lineHeight: 1.15 },
  'heading-2': { fontSize: 24, fontWeight: 600, lineHeight: 1.2 },
  'heading-3': { fontSize: 20, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
};

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '280px',
  normal: '100%',
  wide: '100%',
  none: undefined,
};

export type ProductCardTitleStyle = {
  width: string;
  maxWidth: string | undefined;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  color: string;
  background: string | undefined;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderRadius: number;
  marginBottom: number;
};

export function readProductCardTitleStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fontHeading: string,
  color: string
): ProductCardTitleStyle {
  const preset = cfgString(config, `${settingsBase}.productTitleTypographyPreset`, 'default');
  const typo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS.default;
  const widthMode = cfgString(config, `${settingsBase}.productTitleWidth`, 'fill');
  const maxKey = cfgString(config, `${settingsBase}.productTitleMaxWidth`);
  const align = cfgString(config, `${settingsBase}.productTitleAlignment`, 'left');
  const bgOn = cfgBool(config, `${settingsBase}.productTitleBackgroundEnabled`, false);
  const colorKey = cfgString(config, `${settingsBase}.productTitleColor`, '');
  const resolvedColor = resolveTitleColor(config, colorKey, color);
  const textAlign =
    align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal,
    textAlign,
    fontFamily: fontHeading,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    color: resolvedColor,
    background: bgOn ? 'rgba(0,0,0,0.04)' : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.productTitlePaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.productTitlePaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.productTitlePaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.productTitlePaddingRight`, 0),
    borderRadius: bgOn ? 6 : 0,
    marginBottom: 0,
  };
}
