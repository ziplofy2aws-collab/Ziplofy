import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type BlogPostsEditorialScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, BlogPostsEditorialScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type BlogPostsEditorialLayout = {
  scheme: BlogPostsEditorialScheme;
  heading: string;
  postCount: number;
  carouselOnMobile: boolean;
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readBlogPostsEditorialLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): BlogPostsEditorialLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`, 'Blog posts'),
    postCount: cfgNumber(config, `${settingsBase}.postCount`, 3),
    carouselOnMobile: cfgBool(config, `${settingsBase}.carouselOnMobile`, false),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 64),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

/** Stagger the first editorial pair — left card sits lower than the right. */
export function editorialPairCardOffset(index: number): number {
  return index === 0 ? 56 : 0;
}

export function scopedBlogPostsEditorialCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-blog-posts-editorial-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
