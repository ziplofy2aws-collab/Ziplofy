import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type CollectionLinksScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, CollectionLinksScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type CollectionLinkData = {
  id: string;
  title: string;
  productCount: number;
  href: string;
};

export type CollectionLinksSpotlightLayout = {
  scheme: CollectionLinksScheme;
  layoutMode: 'spotlight' | 'text';
  sectionWidth: 'page' | 'full';
  alignment: 'left' | 'center' | 'right';
  imagePosition: 'left' | 'right';
  imageUrl: string;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readCollectionLinksSpotlightLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionLinksSpotlightLayout {
  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, 'collection-links-spotlight');
  const layoutMode =
    catalogVariant === 'collection-links-text'
      ? 'text'
      : catalogVariant === 'collection-links-spotlight'
        ? 'spotlight'
        : cfgString(config, `${settingsBase}.layoutMode`, 'spotlight') === 'text'
          ? 'text'
          : 'spotlight';
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const imagePosition = cfgString(config, `${settingsBase}.imagePosition`, 'right');

  const legacySchemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const legacy = SCHEMES[legacySchemeKey] ?? SCHEMES['scheme-1'];
  const bgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '').trim();
  const textRaw = cfgString(config, `${settingsBase}.textColor`, '').trim();
  const hasCustomText = Boolean(textRaw && textRaw !== 'default' && !textRaw.startsWith('scheme-'));
  const hasCustomBg = Boolean(bgRaw && bgRaw !== 'default' && !bgRaw.startsWith('scheme-'));
  const background = hasCustomBg ? bgRaw : legacy.background;
  const color = hasCustomText ? textRaw : legacy.color;
  let muted = legacy.muted;
  if (hasCustomText) {
    const hex = color.startsWith('#') ? color.slice(1) : '';
    const full = hex.length === 3 ? hex.split('').map((ch) => ch + ch).join('') : hex;
    if (full.length === 6) {
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      if ([r, g, b].every((n) => Number.isFinite(n))) muted = `rgba(${r}, ${g}, ${b}, 0.5)`;
    }
  }

  return {
    scheme: { background, color, muted },
    layoutMode,
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    alignment:
      alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left',
    imagePosition: imagePosition === 'left' ? 'left' : 'right',
    imageUrl: cfgString(config, `${settingsBase}.imageUrl`, ''),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readCollectionLinks(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): CollectionLinkData[] {
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
    return {
      id,
      title: String(settings.title ?? ''),
      productCount: Number(settings.productCount ?? 5),
      href: String(settings.href ?? ''),
    };
  });
}

export function scopedCollectionLinksSpotlightCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-collection-links-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function textAlignForAlignment(alignment: CollectionLinksSpotlightLayout['alignment']): string {
  if (alignment === 'center') return 'center';
  if (alignment === 'right') return 'right';
  return 'left';
}

export function textLinksFlexJustifyForAlignment(
  alignment: CollectionLinksSpotlightLayout['alignment']
): 'flex-start' | 'center' | 'flex-end' {
  if (alignment === 'center') return 'center';
  if (alignment === 'right') return 'flex-end';
  return 'flex-start';
}
