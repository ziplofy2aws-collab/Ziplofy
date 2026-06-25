import { cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteSchemes } from '../../settings/theme-color-palette.settings';

export type AnnouncementScheme = {
  background: string;
  color: string;
  linkColor: string;
};

export function announcementColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: AnnouncementScheme
): AnnouncementScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-4');
  const schemes = resolveThemePaletteSchemes(config);
  const scheme = schemes[key];
  if (!scheme) return fallback;
  return {
    background: scheme.background,
    color: scheme.color,
    linkColor: scheme.color,
  };
}

export function announcementSectionWidth(config: Record<string, unknown> | null, settingsBase: string): 'page' | 'full' {
  const w = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  return w === 'full' ? 'full' : 'page';
}

export function announcementPadding(config: Record<string, unknown> | null, settingsBase: string) {
  return {
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 15),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 15),
  };
}

export function announcementDividerPx(config: Record<string, unknown> | null, settingsBase: string): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.dividerThickness`, 0));
}

export function announcementRotateSec(config: Record<string, unknown> | null, settingsBase: string): number {
  const sec = cfgNumber(config, `${settingsBase}.timeToNext`, 5);
  if (!Number.isFinite(sec) || sec <= 0) return 0;
  return sec;
}

/** Scope custom CSS to this announcement section instance. */
export function scopedAnnouncementCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  const sel = `[data-ziplofy-section="${sectionId}"]`;
  return trimmed.replace(/:root/g, sel).replace(/&/g, sel);
}
