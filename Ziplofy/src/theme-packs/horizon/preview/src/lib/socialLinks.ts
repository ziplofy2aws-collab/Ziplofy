import { cfgString } from './config';

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

export function activeSocialLinks(
  config: Record<string, unknown> | null,
  settingsBase: string
): Array<SocialPlatform & { url: string }> {
  const legacy: Record<string, string | undefined> = {
    instagramUrl: 'instagram',
    facebookUrl: 'facebook',
  };
  return SOCIAL_PLATFORMS.map((p) => ({
    ...p,
    url: socialUrl(config, settingsBase, p.settingKey, legacy[p.settingKey]),
  })).filter((p) => p.url.length > 0);
}
