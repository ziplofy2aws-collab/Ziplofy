import { cfgNumber, cfgString } from '../../runtime/shared/config';

export type EditorialScheme = {
  background: string;
  color: string;
  muted: string;
  mediaPanel: string;
  contentPanel: string;
};

const SCHEMES: Record<string, EditorialScheme> = {
  'scheme-1': {
    background: '#ffffff',
    color: '#111827',
    muted: '#4b5563',
    mediaPanel: '#e5e7eb',
    contentPanel: '#e8f0f5',
  },
  'scheme-2': {
    background: '#f8fafc',
    color: '#0f172a',
    muted: '#64748b',
    mediaPanel: '#e2e8f0',
    contentPanel: '#f1f5f9',
  },
  'scheme-3': {
    background: '#fff7ed',
    color: '#431407',
    muted: '#9a3412',
    mediaPanel: '#ffedd5',
    contentPanel: '#fff7ed',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    muted: '#5b21b6',
    mediaPanel: '#ede9fe',
    contentPanel: '#f5f3ff',
  },
};

const MEDIA_WIDTH_COLUMNS: Record<string, [string, string]> = {
  small: ['2fr', '3fr'],
  medium: ['1fr', '1fr'],
  large: ['3fr', '2fr'],
};

const MEDIA_HEIGHT_PX: Record<string, number> = {
  small: 240,
  medium: 320,
  large: 400,
};

export type EditorialLayout = {
  scheme: EditorialScheme;
  sectionWidth: 'page' | 'full';
  mediaWidth: 'small' | 'medium' | 'large';
  mediaHeight: 'small' | 'medium' | 'large';
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readEditorialLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): EditorialLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-4');
  const mediaWidthRaw = cfgString(config, `${settingsBase}.mediaWidth`, 'medium');
  const mediaHeightRaw = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  const mediaWidth =
    mediaWidthRaw === 'small' || mediaWidthRaw === 'large' ? mediaWidthRaw : 'medium';
  const mediaHeight =
    mediaHeightRaw === 'small' || mediaHeightRaw === 'large' ? mediaHeightRaw : 'medium';

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-4'],
    sectionWidth:
      cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    mediaWidth,
    mediaHeight,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function editorialGridColumns(mediaWidth: EditorialLayout['mediaWidth']): string {
  const [media, content] = MEDIA_WIDTH_COLUMNS[mediaWidth] ?? MEDIA_WIDTH_COLUMNS.medium;
  return `${media} ${content}`;
}

export function editorialMinHeight(mediaHeight: EditorialLayout['mediaHeight']): number {
  return MEDIA_HEIGHT_PX[mediaHeight] ?? MEDIA_HEIGHT_PX.medium;
}

export function scopedEditorialCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
