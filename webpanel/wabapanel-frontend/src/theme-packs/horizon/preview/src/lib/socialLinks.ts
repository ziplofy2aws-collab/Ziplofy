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

function parsePlatformOrder(raw: string): string[] {
  if (!raw.trim()) return [];
  const known = new Set(SOCIAL_PLATFORMS.map((p) => p.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (!id || !known.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function orderedSocialPlatforms(
  config: Record<string, unknown> | null,
  settingsBase: string
): SocialPlatform[] {
  const explicit = parsePlatformOrder(cfgString(config, `${settingsBase}.platformOrder`, ''));
  if (explicit.length) {
    return explicit
      .map((id) => SOCIAL_PLATFORMS.find((p) => p.id === id))
      .filter((p): p is SocialPlatform => Boolean(p));
  }

  return SOCIAL_PLATFORMS.filter((platform) =>
    Boolean(
      socialUrl(
        config,
        settingsBase,
        platform.settingKey,
        platform.id === 'instagram' || platform.id === 'facebook' ? platform.id : undefined
      )
    )
  );
}

export function activeSocialLinks(
  config: Record<string, unknown> | null,
  settingsBase: string
): Array<SocialPlatform & { url: string }> {
  return orderedSocialPlatforms(config, settingsBase)
    .map((platform) => ({
      ...platform,
      url: socialUrl(
        config,
        settingsBase,
        platform.settingKey,
        platform.id === 'instagram' || platform.id === 'facebook' ? platform.id : undefined
      ),
    }))
    .filter((platform) => platform.url.length > 0);
}
