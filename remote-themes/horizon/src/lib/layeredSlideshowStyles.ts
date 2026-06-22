import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

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
    dropShadow: Boolean(getThemeConfigValue(config, `${settingsBase}.dropShadow`)),
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
    | Record<string, { settings?: Record<string, unknown> }>
    | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);

  return ids.map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    const peek = String(settings.peekVariant ?? 'figure');
    return {
      id,
      title: String(settings.title ?? ''),
      body: String(
        settings.body ??
          'Introducing our latest products, made especially for the season. Shop your favorites before they\'re gone!'
      ),
      buttonLabel: String(settings.buttonLabel ?? ''),
      buttonHref: String(settings.buttonHref ?? ''),
      imageUrl: String(settings.imageUrl ?? ''),
      peekVariant: peek === 'landscape' ? 'landscape' : 'figure',
    };
  });
}

export function scopedLayeredSlideshowCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-layered-slideshow-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
