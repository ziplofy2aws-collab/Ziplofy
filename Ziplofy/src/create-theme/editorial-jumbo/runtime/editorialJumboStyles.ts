import { cfgNumber, cfgString } from '../../runtime/shared/config';

export type EditorialJumboScheme = {
  background: string;
  color: string;
  textPanel: string;
  mediaPanel: string;
};

const SCHEMES: Record<string, EditorialJumboScheme> = {
  'scheme-1': {
    background: '#ffffff',
    color: '#111827',
    textPanel: '#f6f6f7',
    mediaPanel: '#ececec',
  },
  'scheme-2': {
    background: '#f8fafc',
    color: '#0f172a',
    textPanel: '#f1f5f9',
    mediaPanel: '#e2e8f0',
  },
  'scheme-3': {
    background: '#fff7ed',
    color: '#431407',
    textPanel: '#fff7ed',
    mediaPanel: '#ffedd5',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    textPanel: '#fafafa',
    mediaPanel: '#ececec',
  },
};

const MEDIA_WIDTH_COLUMNS: Record<string, [string, string]> = {
  small: ['2fr', '3fr'],
  medium: ['12fr', '13fr'],
  large: ['2fr', '3fr'],
};

const MEDIA_HEIGHT_PX: Record<string, number> = {
  small: 200,
  medium: 280,
  large: 360,
};

export type EditorialJumboLayout = {
  scheme: EditorialJumboScheme;
  sectionWidth: 'page' | 'full';
  mediaWidth: 'small' | 'medium' | 'large';
  mediaHeight: 'small' | 'medium' | 'large';
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

function readMediaWidth(
  config: Record<string, unknown> | null,
  settingsBase: string
): EditorialJumboLayout['mediaWidth'] {
  const raw = cfgString(config, `${settingsBase}.mediaWidth`, '');
  if (raw === 'small' || raw === 'large') return raw;
  if (raw === 'medium') return 'medium';
  const legacy = cfgString(config, `${settingsBase}.textWidth`, 'medium');
  return legacy === 'small' || legacy === 'large' ? legacy : 'medium';
}

export function readEditorialJumboLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): EditorialJumboLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-4');
  const mediaHeightRaw = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  const mediaHeight =
    mediaHeightRaw === 'small' || mediaHeightRaw === 'large' ? mediaHeightRaw : 'medium';

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-4'],
    sectionWidth:
      cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    mediaWidth: readMediaWidth(config, settingsBase),
    mediaHeight,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function jumboGridColumns(mediaWidth: EditorialJumboLayout['mediaWidth']): string {
  const [media, text] = MEDIA_WIDTH_COLUMNS[mediaWidth] ?? MEDIA_WIDTH_COLUMNS.medium;
  return `${media} ${text}`;
}

export function jumboMinHeight(mediaHeight: EditorialJumboLayout['mediaHeight']): number {
  return MEDIA_HEIGHT_PX[mediaHeight] ?? MEDIA_HEIGHT_PX.medium;
}

export function scopedEditorialJumboCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
