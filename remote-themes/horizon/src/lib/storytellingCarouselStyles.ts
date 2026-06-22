import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type StorytellingCarouselScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, StorytellingCarouselScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type CarouselSlideData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type StorytellingCarouselLayout = {
  scheme: StorytellingCarouselScheme;
  heading: string;
  columns: number;
  mobileColumns: 1 | 2;
  sectionWidth: 'page' | 'full';
  horizontalGap: number;
  navIcon: 'arrows' | 'chevron' | 'none';
  navIconBackground: 'none' | 'circle' | 'square';
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readStorytellingCarouselLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): StorytellingCarouselLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const navIcon = cfgString(config, `${settingsBase}.navIcon`, 'arrows');
  const navBg = cfgString(config, `${settingsBase}.navIconBackground`, 'none');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const mobile = cfgString(config, `${settingsBase}.mobileColumns`, '1');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`),
    columns: cfgNumber(config, `${settingsBase}.columns`, 3),
    mobileColumns: mobile === '2' ? 2 : 1,
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    horizontalGap: cfgNumber(config, `${settingsBase}.horizontalGap`, 12),
    navIcon: navIcon === 'chevron' ? 'chevron' : navIcon === 'none' ? 'none' : 'arrows',
    navIconBackground:
      navBg === 'circle' ? 'circle' : navBg === 'square' ? 'square' : 'none',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readCarouselSlides(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): CarouselSlideData[] {
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
  const defaultDesc = 'Made with care and unconditionally loved by our customers.';

  return ids.map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    return {
      id,
      title: String(settings.title ?? ''),
      description: String(settings.description ?? defaultDesc),
      imageUrl: String(settings.imageUrl ?? ''),
    };
  });
}

export function scopedStorytellingCarouselCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-storytelling-carousel-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
