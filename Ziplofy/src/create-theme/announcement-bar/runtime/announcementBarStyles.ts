import { cfgNumber, cfgString } from '../../runtime/shared/config';

export type AnnouncementScheme = {
  background: string;
  color: string;
  linkColor: string;
};

const COLOR_SCHEMES: Record<string, AnnouncementScheme> = {
  'scheme-1': { background: '#111827', color: '#f9fafb', linkColor: '#93c5fd' },
  'scheme-2': { background: '#1e3a5f', color: '#eff6ff', linkColor: '#bfdbfe' },
  'scheme-3': { background: '#431407', color: '#fff7ed', linkColor: '#fdba74' },
  'scheme-4': { background: '#4c1d95', color: '#f5f3ff', linkColor: '#ddd6fe' },
};

export function announcementColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: AnnouncementScheme
): AnnouncementScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-4');
  return COLOR_SCHEMES[key] ?? fallback;
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
