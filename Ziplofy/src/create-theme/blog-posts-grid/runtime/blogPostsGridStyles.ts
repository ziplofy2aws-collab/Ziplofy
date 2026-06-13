import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type BlogPostsGridScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, BlogPostsGridScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type BlogPostsGridLayout = {
  scheme: BlogPostsGridScheme;
  heading: string;
  postCount: number;
  columns: number;
  mobileColumns: 1 | 2;
  horizontalGap: number;
  verticalGap: number;
  carouselOnMobile: boolean;
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readBlogPostsGridLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): BlogPostsGridLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const mobile = cfgString(config, `${settingsBase}.mobileColumns`, '2');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`, 'Blog posts'),
    postCount: cfgNumber(config, `${settingsBase}.postCount`, 3),
    columns: cfgNumber(config, `${settingsBase}.columns`, 3),
    mobileColumns: mobile === '1' ? 1 : 2,
    horizontalGap: cfgNumber(config, `${settingsBase}.horizontalGap`, 8),
    verticalGap: cfgNumber(config, `${settingsBase}.verticalGap`, 8),
    carouselOnMobile: cfgBool(config, `${settingsBase}.carouselOnMobile`, false),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedBlogPostsGridCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-blog-posts-grid-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
