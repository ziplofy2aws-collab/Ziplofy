import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { layoutBlockOrder, templateBlockOrder } from '../../runtime/shared/structureOrder';

export type LayeredSlideshowScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, LayeredSlideshowScheme> = {
  'scheme-1': { background: '#f3efe6', color: '#111827', muted: '#4b5563' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type LayeredSlideshowSlide = {
  id: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  peekVariant: 'figure' | 'landscape';
  direction: 'vertical' | 'horizontal';
  alignment: 'left' | 'center' | 'right';
  position: 'top' | 'center' | 'bottom';
  gap: number;
  backgroundColor: string;
  mediaOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type LayeredSlideshowLayout = {
  scheme: LayeredSlideshowScheme;
  sectionWidth: 'page' | 'full';
  height: 'small' | 'medium' | 'large';
  cornerRadius: number;
  borderThickness: number;
  dropShadow: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

const DEFAULT_BODY =
  "Introducing our latest products, made especially for the season. Shop your favorites before they're gone!";

export function readLayeredSlideshowLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): LayeredSlideshowLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const height = cfgString(config, `${settingsBase}.height`, 'medium');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    height: height === 'small' || height === 'large' ? height : 'medium',
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    dropShadow: cfgBool(config, `${settingsBase}.dropShadow`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function slideshowMinHeight(height: LayeredSlideshowLayout['height']): number {
  if (height === 'small') return 360;
  if (height === 'large') return 560;
  return 460;
}

function readSlideSetting(
  settings: Record<string, unknown>,
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  fallback = ''
): string {
  const fromPath = getThemeConfigValue(config, `${settingsBase}.${key}`);
  if (fromPath != null) return String(fromPath).trim();
  const raw = settings[key];
  if (raw == null) return fallback;
  return String(raw).trim();
}

export function readLayeredSlideshowSlides(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): LayeredSlideshowSlide[] {
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
    | Record<string, { enabled?: boolean; settings?: Record<string, unknown> }>
    | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);

  return ids
    .filter((id) => {
      const block = blocksMap[id];
      return Boolean(block) && block?.enabled !== false;
    })
    .map((id, idx) => {
      const settings = blocksMap[id]?.settings ?? {};
      const settingsBase = `${blocksPath}.${id}.settings`;
      const peek = readSlideSetting(
        settings,
        config,
        settingsBase,
        'peekVariant',
        idx % 2 === 0 ? 'figure' : 'landscape'
      );
      const direction = readSlideSetting(settings, config, settingsBase, 'direction', 'vertical');
      const alignment = readSlideSetting(settings, config, settingsBase, 'alignment', 'left');
      const position = readSlideSetting(settings, config, settingsBase, 'position', 'top');
      const imageUrl = readSlideSetting(settings, config, settingsBase, 'imageUrl', '');
      return {
        id,
        title: readSlideSetting(settings, config, settingsBase, 'title', ''),
        body: readSlideSetting(settings, config, settingsBase, 'body', DEFAULT_BODY),
        buttonLabel: readSlideSetting(settings, config, settingsBase, 'buttonLabel', ''),
        buttonHref: readSlideSetting(settings, config, settingsBase, 'buttonHref', ''),
        imageUrl,
        peekVariant: peek === 'landscape' ? 'landscape' : 'figure',
        direction: direction === 'horizontal' ? 'horizontal' : 'vertical',
        alignment:
          alignment === 'center' || alignment === 'right' ? alignment : 'left',
        position:
          position === 'center' || position === 'bottom' ? position : 'top',
        gap: cfgNumber(config, `${settingsBase}.gap`, Number(settings.gap ?? 12) || 12),
        backgroundColor: readSlideSetting(settings, config, settingsBase, 'backgroundColor', ''),
        mediaOverlay: cfgBool(
          config,
          `${settingsBase}.mediaOverlay`,
          settings.mediaOverlay === true || settings.mediaOverlay === 'true'
        ),
        paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, Number(settings.paddingTop ?? 40) || 40),
        paddingBottom: cfgNumber(
          config,
          `${settingsBase}.paddingBottom`,
          Number(settings.paddingBottom ?? 40) || 40
        ),
        paddingLeft: cfgNumber(
          config,
          `${settingsBase}.paddingLeft`,
          Number(settings.paddingLeft ?? 36) || 36
        ),
        paddingRight: cfgNumber(
          config,
          `${settingsBase}.paddingRight`,
          Number(settings.paddingRight ?? 36) || 36
        ),
      };
    });
}

export function scopedLayeredSlideshowCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
