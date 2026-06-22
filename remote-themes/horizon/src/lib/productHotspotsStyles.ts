import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type ProductHotspotsScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, ProductHotspotsScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type ProductHotspotData = {
  id: string;
  positionX: number;
  positionY: number;
  productTitle: string;
  price: string;
};

export type ProductHotspotsLayout = {
  scheme: ProductHotspotsScheme;
  heading: string;
  imageUrl: string;
  mediaOverlay: boolean;
  sectionWidth: 'page' | 'full';
  sectionHeight: 'auto' | 'small' | 'medium' | 'large';
  hotspotColor: string;
  innerColor: string;
  popoverGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readProductHotspotsLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ProductHotspotsLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const sectionHeight = cfgString(config, `${settingsBase}.sectionHeight`, 'auto');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`),
    imageUrl: cfgString(config, `${settingsBase}.imageUrl`, ''),
    mediaOverlay: Boolean(getThemeConfigValue(config, `${settingsBase}.mediaOverlay`)),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    sectionHeight:
      sectionHeight === 'small' || sectionHeight === 'medium' || sectionHeight === 'large'
        ? sectionHeight
        : 'auto',
    hotspotColor: cfgString(config, `${settingsBase}.hotspotColor`, '#FFFFFF57'),
    innerColor: cfgString(config, `${settingsBase}.innerColor`, '#FFFFFF'),
    popoverGap: cfgNumber(config, `${settingsBase}.popoverGap`, 8),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function sceneMinHeight(height: ProductHotspotsLayout['sectionHeight']): string | undefined {
  if (height === 'small') return '320px';
  if (height === 'medium') return '420px';
  if (height === 'large') return '520px';
  return undefined;
}

export function readProductHotspots(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): ProductHotspotData[] {
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
      positionX: Number(settings.positionX ?? 50),
      positionY: Number(settings.positionY ?? 50),
      productTitle: String(settings.productTitle ?? ''),
      price: String(settings.price ?? ''),
    };
  });
}

export function scopedProductHotspotsCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-product-hotspots-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
