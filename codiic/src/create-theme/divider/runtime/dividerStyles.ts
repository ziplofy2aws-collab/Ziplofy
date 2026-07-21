import { cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { footerSectionWidth, scopedFooterCss } from './footerStyles';

/** Default divider line color when "Color" is left at Default. */
const DEFAULT_DIVIDER_LINE = '#d1d5db';

export type DividerStyle = {
  /** Section background; 'transparent' when "Background color" is Default. */
  background: string;
  /** Divider line color. */
  lineColor: string;
  widthMode: 'page' | 'full';
  thickness: number;
  lengthPercent: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readDividerStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): DividerStyle {
  const bgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '').trim();
  const colorRaw = cfgString(config, `${settingsBase}.color`, '').trim();
  return {
    background: bgRaw
      ? resolveThemePaletteColorSetting(config, bgRaw, 0, 'transparent')
      : 'transparent',
    lineColor: colorRaw
      ? resolveThemePaletteColorSetting(config, colorRaw, 1, DEFAULT_DIVIDER_LINE)
      : DEFAULT_DIVIDER_LINE,
    widthMode: footerSectionWidth(config, settingsBase),
    thickness: Math.max(0, cfgNumber(config, `${settingsBase}.thickness`, 1)),
    lengthPercent: Math.min(100, Math.max(10, cfgNumber(config, `${settingsBase}.length`, 100))),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 16),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 16),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedDividerCss(sectionId: string, css: string): string {
  return scopedFooterCss(sectionId, css);
}
