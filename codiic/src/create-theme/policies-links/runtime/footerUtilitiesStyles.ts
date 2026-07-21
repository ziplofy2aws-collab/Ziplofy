import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type FooterUtilitiesScheme = {
  background: string;
  color: string;
  muted: string;
  border: string;
};

const COLOR_SCHEMES: Record<string, FooterUtilitiesScheme> = {
  'scheme-1': { background: '#f3f4f6', color: '#111827', muted: '#6b7280', border: '#e5e7eb' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', muted: '#64748b', border: '#e2e8f0' },
  'scheme-3': { background: '#fff7ed', color: '#431407', muted: '#9a3412', border: '#fed7aa' },
  'scheme-4': { background: '#f5f3ff', color: '#4c1d95', muted: '#6d28d9', border: '#ddd6fe' },
};

export function footerUtilitiesColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: FooterUtilitiesScheme
): FooterUtilitiesScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return COLOR_SCHEMES[key] ?? fallback;
}

export function footerUtilitiesSectionWidth(
  config: Record<string, unknown> | null,
  settingsBase: string
): 'page' | 'full' {
  return cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page';
}

export function footerUtilitiesGap(config: Record<string, unknown> | null, settingsBase: string): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.gap`, 24));
}

export function footerUtilitiesDividerPx(
  config: Record<string, unknown> | null,
  settingsBase: string
): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.dividerThickness`, 0));
}

export function footerUtilitiesPadding(config: Record<string, unknown> | null, settingsBase: string) {
  return {
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 20),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
  };
}

export function footerUtilitiesShowPaymentIcons(
  config: Record<string, unknown> | null,
  settingsBase: string
): boolean {
  return cfgBool(config, `${settingsBase}.paymentIcons`, false);
}

export function scopedFooterUtilitiesCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  const sel = `[data-codiic-section="${sectionId}"]`;
  return trimmed.replace(/:root/g, sel).replace(/&/g, sel);
}

export function readFooterBlockTypography(
  config: Record<string, unknown> | null,
  settingsBase: string
): { fontSize: string; textTransform: 'none' | 'uppercase' } {
  const textCase = cfgString(config, `${settingsBase}.textCase`, 'default');
  return {
    fontSize: cfgString(config, `${settingsBase}.fontSize`, '12px'),
    textTransform: textCase === 'uppercase' ? 'uppercase' : 'none',
  };
}

export type CopyrightStyle = {
  fontSize: string;
  textTransform: 'none' | 'uppercase';
  showPoweredBy: boolean;
  poweredByLabel: string;
  storeLabel: string;
};

export function readCopyrightStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): CopyrightStyle {
  const rawText = cfgString(config, `${settingsBase}.text`, '');
  const storeLabel = rawText
    .replace(/^©\s*\d{4}\s*/i, '')
    .replace(/\s*\.\s*All rights reserved\.?$/i, '')
    .trim();
  const typography = readFooterBlockTypography(config, settingsBase);

  return {
    ...typography,
    showPoweredBy: cfgBool(config, `${settingsBase}.showPoweredBy`, false),
    poweredByLabel: cfgString(config, `${settingsBase}.poweredByLabel`),
    storeLabel,
  };
}

export function formatCopyrightLine(style: CopyrightStyle, year = new Date().getFullYear()): string {
  const base = style.storeLabel ? `© ${year} ${style.storeLabel}` : `© ${year}`;
  if (!style.showPoweredBy || !style.poweredByLabel.trim()) return base;
  return `${base}, ${style.poweredByLabel.trim()}`;
}

export type SocialPlatform = {
  id: string;
  label: string;
  settingKey: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'facebook', label: 'Facebook', settingKey: 'facebookUrl' },
  { id: 'instagram', label: 'Instagram', settingKey: 'instagramUrl' },
  { id: 'youtube', label: 'YouTube', settingKey: 'youtubeUrl' },
  { id: 'tiktok', label: 'TikTok', settingKey: 'tiktokUrl' },
  { id: 'twitter', label: 'X (Twitter)', settingKey: 'twitterUrl' },
  { id: 'threads', label: 'Threads', settingKey: 'threadsUrl' },
  { id: 'linkedin', label: 'LinkedIn', settingKey: 'linkedinUrl' },
  { id: 'bluesky', label: 'Bluesky', settingKey: 'blueskyUrl' },
  { id: 'snapchat', label: 'Snapchat', settingKey: 'snapchatUrl' },
  { id: 'pinterest', label: 'Pinterest', settingKey: 'pinterestUrl' },
  { id: 'tumblr', label: 'Tumblr', settingKey: 'tumblrUrl' },
  { id: 'vimeo', label: 'Vimeo', settingKey: 'vimeoUrl' },
  { id: 'custom', label: 'Custom link', settingKey: 'customUrl' },
];

export function socialUrl(
  config: Record<string, unknown> | null,
  settingsBase: string,
  settingKey: string,
  legacyKey?: string
): string {
  const primary = cfgString(config, `${settingsBase}.${settingKey}`, '').trim();
  if (primary) return primary;
  if (legacyKey) return cfgString(config, `${settingsBase}.${legacyKey}`, '').trim();
  return '';
}
