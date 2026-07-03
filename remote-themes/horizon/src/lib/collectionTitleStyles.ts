import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from './config';

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  'heading-1': { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  'heading-2': { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
};

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '480px',
  normal: '640px',
  wide: '960px',
  none: undefined,
};

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
  colors: { text: string; heading: string; accent: string }
): string {
  if (colorKey.startsWith('#')) return colorKey;
  if (colorKey === 'palette' || /^palette:\d+$/.test(colorKey)) {
    const palette = readPalette(config);
    const match = /^palette:(\d+)$/.exec(colorKey);
    const index = match ? Number(match[1]) : 1;
    return palette[index] ?? colors.text;
  }
  if (colorKey === 'heading') return colors.heading;
  if (colorKey === 'accent') return colors.accent;
  return colors.text;
}

export type CollectionTitleStyle = {
  flex: string | undefined;
  width: string;
  maxWidth: string | undefined;
  textAlign: CSSProperties['textAlign'];
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
};

export function readCollectionTitleStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fonts: { heading: string; body: string },
  colors: { text: string; heading: string; accent: string; background: string }
): CollectionTitleStyle {
  const preset = cfgString(config, `${settingsBase}.titleTypographyPreset`, 'heading-4');
  const typo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS['heading-4'];
  const widthMode = cfgString(config, `${settingsBase}.titleWidth`, 'fit');
  const isFill = widthMode === 'fill';
  const maxKey = cfgString(config, `${settingsBase}.titleMaxWidth`, 'normal');
  const maxWidth = MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal;
  const alignRaw = cfgString(config, `${settingsBase}.titleAlignment`, 'left');
  const textAlign: CSSProperties['textAlign'] =
    alignRaw === 'right' ? 'right' : alignRaw === 'center' ? 'center' : 'left';
  const colorKey = cfgString(config, `${settingsBase}.titleColor`, 'text');
  const color = resolveTitleColor(config, colorKey, colors);
  const bgOn = cfgBool(config, `${settingsBase}.titleBackgroundEnabled`, false);
  const bgColor = cfgString(config, `${settingsBase}.titleBackgroundColor`, '#00000026');
  const cornerRadius = cfgNumber(config, `${settingsBase}.titleCornerRadius`, 0);

  return {
    flex: isFill ? '1 1 auto' : '0 0 auto',
    width: isFill ? 'auto' : 'fit-content',
    maxWidth,
    textAlign: isFill ? textAlign : undefined,
    fontFamily: fonts.heading,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    color,
    background: bgOn ? bgColor : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.titlePaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.titlePaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.titlePaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.titlePaddingRight`, 0),
    borderRadius: bgOn ? cornerRadius : 0,
  };
}
