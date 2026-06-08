import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type BlogPostsCarouselScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, BlogPostsCarouselScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type BlogPostCardData = {
  id: string;
  illustrationVariant: 'thread' | 'sewing' | 'boxes';
  title: string;
  date: string;
  author: string;
  excerpt: string;
  imageUrl: string;
};

export type BlogPostsCarouselLayout = {
  scheme: BlogPostsCarouselScheme;
  heading: string;
  postCount: number;
  columns: number;
  mobileCardSize: 1 | 2;
  horizontalGap: number;
  navIcon: 'arrows' | 'chevron' | 'none';
  navIconBackground: 'none' | 'circle' | 'square';
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readBlogPostsCarouselLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): BlogPostsCarouselLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const navIcon = cfgString(config, `${settingsBase}.navIcon`, 'arrows');
  const navBg = cfgString(config, `${settingsBase}.navIconBackground`, 'circle');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const mobile = cfgString(config, `${settingsBase}.mobileCardSize`, '1');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`),
    postCount: cfgNumber(config, `${settingsBase}.postCount`, 5),
    columns: cfgNumber(config, `${settingsBase}.columns`, 3),
    mobileCardSize: mobile === '2' ? 2 : 1,
    horizontalGap: cfgNumber(config, `${settingsBase}.horizontalGap`, 8),
    navIcon: navIcon === 'chevron' ? 'chevron' : navIcon === 'none' ? 'none' : 'arrows',
    navIconBackground:
      navBg === 'square' ? 'square' : navBg === 'none' ? 'none' : 'circle',
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

function parseVariant(raw: string): 'thread' | 'sewing' | 'boxes' {
  if (raw === 'thread' || raw === 'boxes') return raw;
  return 'sewing';
}

export function readBlogPostCards(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template',
  postCount: number
): BlogPostCardData[] {
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
  const limit = Math.max(1, Math.min(12, postCount));

  return ids.slice(0, limit).map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    return {
      id,
      illustrationVariant: parseVariant(String(settings.illustrationVariant ?? 'sewing')),
      title: String(settings.title ?? ''),
      date: String(settings.date ?? ''),
      author: String(settings.author ?? ''),
      excerpt: String(settings.excerpt ?? ""),
      imageUrl: String(settings.imageUrl ?? ''),
    };
  });
}

export function scopedBlogPostsCarouselCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-blog-posts-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
