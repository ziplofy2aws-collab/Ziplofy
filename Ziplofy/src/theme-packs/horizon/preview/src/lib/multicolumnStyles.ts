import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type MulticolumnScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, MulticolumnScheme> = {
  'scheme-1': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#5b21b6' },
};

export type MulticolumnItemSettings = {
  direction: 'vertical' | 'horizontal';
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  layoutGap: number;
  width: string;
  customWidth: number;
  mobileWidth: string;
  mobileCustomWidth: number;
  height: string;
  customHeight: number;
  backgroundMedia: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  backgroundOverlay: boolean;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  link: string;
  linkOpenInNewTab: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type MulticolumnHeadingSettings = {
  width: string;
  maxWidth: string;
  alignment: string;
  preset: string;
  font: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textCase: string;
  wrap: string;
  color: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
  cornerRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type MulticolumnDescriptionSettings = {
  width: string;
  maxWidth: string;
  alignment: string;
  preset: string;
  font: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textCase: string;
  wrap: string;
  color: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
  cornerRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type MulticolumnItem = {
  id: string;
  heading: string;
  text: string;
  settings: MulticolumnItemSettings;
  headingSettings: MulticolumnHeadingSettings;
  descriptionSettings: MulticolumnDescriptionSettings;
};

function readHeadingSettings(settings: Record<string, unknown>): MulticolumnHeadingSettings {
  const str = (key: string, fallback: string) => {
    const v = settings[key];
    return typeof v === 'string' && v !== '' ? v : fallback;
  };
  const num = (key: string, fallback: number) => {
    const v = settings[key];
    return typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) || fallback : fallback;
  };
  return {
    width: str('headingWidth', 'fill'),
    maxWidth: str('headingMaxWidth', 'normal'),
    alignment: str('headingAlignment', 'center'),
    preset: str('headingTypographyPreset', 'heading-4'),
    font: str('headingFont', 'heading'),
    fontSize: str('headingFontSize', '20px'),
    lineHeight: str('headingLineHeight', 'normal'),
    letterSpacing: str('headingLetterSpacing', 'normal'),
    textCase: str('headingTextCase', 'default'),
    wrap: str('headingWrap', 'pretty'),
    color: typeof settings.headingColor === 'string' ? settings.headingColor : '',
    backgroundEnabled: settings.headingBackgroundEnabled === true,
    backgroundColor:
      typeof settings.headingBackgroundColor === 'string' ? settings.headingBackgroundColor : '',
    cornerRadius: num('headingCornerRadius', 0),
    paddingTop: num('headingPaddingTop', 0),
    paddingBottom: num('headingPaddingBottom', 0),
    paddingLeft: num('headingPaddingLeft', 0),
    paddingRight: num('headingPaddingRight', 0),
  };
}

function readDescriptionSettings(
  settings: Record<string, unknown>
): MulticolumnDescriptionSettings {
  const str = (key: string, fallback: string) => {
    const v = settings[key];
    return typeof v === 'string' && v !== '' ? v : fallback;
  };
  const num = (key: string, fallback: number) => {
    const v = settings[key];
    return typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) || fallback : fallback;
  };
  return {
    width: str('descWidth', 'fill'),
    maxWidth: str('descMaxWidth', 'normal'),
    alignment: str('descAlignment', 'center'),
    preset: str('descTypographyPreset', 'default'),
    font: str('descFont', 'body'),
    fontSize: str('descFontSize', 'default'),
    lineHeight: str('descLineHeight', 'normal'),
    letterSpacing: str('descLetterSpacing', 'normal'),
    textCase: str('descTextCase', 'default'),
    wrap: str('descWrap', 'pretty'),
    color: typeof settings.descColor === 'string' ? settings.descColor : '',
    backgroundEnabled: settings.descBackgroundEnabled === true,
    backgroundColor:
      typeof settings.descBackgroundColor === 'string' ? settings.descBackgroundColor : '',
    cornerRadius: num('descCornerRadius', 0),
    paddingTop: num('descPaddingTop', 0),
    paddingBottom: num('descPaddingBottom', 0),
    paddingLeft: num('descPaddingLeft', 0),
    paddingRight: num('descPaddingRight', 0),
  };
}

function readColumnSettings(settings: Record<string, unknown>): MulticolumnItemSettings {
  const str = (key: string, fallback: string) => {
    const v = settings[key];
    return typeof v === 'string' && v !== '' ? v : fallback;
  };
  const num = (key: string, fallback: number) => {
    const v = settings[key];
    return typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) || fallback : fallback;
  };
  const bool = (key: string, fallback: boolean) => {
    const v = settings[key];
    return typeof v === 'boolean' ? v : fallback;
  };
  const dir = str('direction', 'vertical');
  const align = str('layoutAlignment', 'left');
  return {
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment: align === 'center' || align === 'right' ? align : 'left',
    position: str('position', 'top'),
    layoutGap: num('layoutGap', 8),
    width: str('width', 'fill'),
    customWidth: num('customWidth', 100),
    mobileWidth: str('mobileWidth', 'fill'),
    mobileCustomWidth: num('mobileCustomWidth', 100),
    height: str('height', 'fit'),
    customHeight: num('customHeight', 100),
    backgroundMedia: str('backgroundMedia', 'none'),
    backgroundImageUrl: typeof settings.backgroundImageUrl === 'string' ? settings.backgroundImageUrl : '',
    backgroundColor: typeof settings.backgroundColor === 'string' ? settings.backgroundColor : '',
    backgroundOverlay: bool('backgroundOverlay', false),
    borderStyle: str('borderStyle', 'none'),
    borderThickness: num('borderThickness', 1),
    borderOpacity: num('borderOpacity', 100),
    borderColor: typeof settings.borderColor === 'string' ? settings.borderColor : 'default',
    cornerRadius: num('cornerRadius', 0),
    link: typeof settings.link === 'string' ? settings.link : '',
    linkOpenInNewTab: bool('linkOpenInNewTab', false),
    paddingTop: num('paddingTop', 10),
    paddingBottom: num('paddingBottom', 0),
    paddingLeft: num('paddingLeft', 0),
    paddingRight: num('paddingRight', 0),
  };
}

export type MulticolumnLayout = {
  scheme: MulticolumnScheme;
  direction: 'vertical' | 'horizontal';
  verticalOnMobile: boolean;
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  columns: number;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  backgroundMedia: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function justifyItemsForAlignment(alignment: string): 'start' | 'center' | 'end' {
  if (alignment === 'right') return 'end';
  if (alignment === 'center') return 'center';
  return 'start';
}

export function alignContentForPosition(position: string): 'start' | 'center' | 'end' {
  if (position === 'top') return 'start';
  if (position === 'bottom') return 'end';
  return 'center';
}

export function readMulticolumnLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): MulticolumnLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const dir = cfgString(config, `${settingsBase}.direction`, 'horizontal');
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const cols = cfgNumber(config, `${settingsBase}.columns`, 3);
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'vertical' ? 'vertical' : 'horizontal',
    verticalOnMobile: cfgBool(config, `${settingsBase}.verticalOnMobile`, true),
    layoutAlignment: align === 'left' || align === 'right' ? align : 'center',
    position: cfgString(config, `${settingsBase}.position`, 'top'),
    columns: Math.min(4, Math.max(2, cols)),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height: cfgString(config, `${settingsBase}.height`, 'auto'),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    backgroundColor: cfgString(config, `${settingsBase}.backgroundColor`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${settingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${settingsBase}.borderColor`, 'default'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readMulticolumnItems(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): MulticolumnItem[] {
  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const blocksPath = `${sectionBase}.blocks`;
  const order =
    placement === 'template'
      ? templateBlockOrder(config, templateId, sectionId, [])
      : layoutBlockOrder(config, sectionId, []);
  const blocksMap = getThemeConfigValue(config, blocksPath) as Record<string, Record<string, unknown>> | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);
  return ids
    .map((id) => {
      const block = blocksMap[id];
      if (!block) return null;
      const settings = (block.settings ?? {}) as Record<string, unknown>;
      const heading = String(settings.heading ?? settings.title ?? '').trim();
      if (!heading) return null;
      return {
        id,
        heading,
        text: String(settings.text ?? ''),
        settings: readColumnSettings(settings),
        headingSettings: readHeadingSettings(settings),
        descriptionSettings: readDescriptionSettings(settings),
      };
    })
    .filter((x): x is MulticolumnItem => x != null);
}

export function scopedMulticolumnCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-multicolumn-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, '');
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Build CSS border from Style / Thickness / Opacity / Color (Shopify-style). */
export function resolveMulticolumnBorderCss(
  borderStyle: string,
  thickness: number,
  opacity: number,
  borderColorHex: string,
  schemeBorder: string
): string | undefined {
  if (borderStyle !== 'solid' || thickness <= 0) return undefined;
  const base = borderColorHex?.startsWith('#') ? borderColorHex : schemeBorder;
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  if (!rgb) return `${thickness}px solid ${schemeBorder}`;
  return `${thickness}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function multicolumnMobileStackCss(sectionId: string): string {
  const scope = `.codiic-multicolumn-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  return `@media (max-width: 749px) { ${scope} { grid-template-columns: 1fr !important; } }`;
}
