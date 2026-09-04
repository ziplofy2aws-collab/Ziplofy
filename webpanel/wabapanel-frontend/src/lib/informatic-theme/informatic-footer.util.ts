import { getConfigPath, setConfigPath } from '@/lib/informatic-theme/load-static-pack';

export const INFORMATIC_FOOTER_SOCIAL_KEYS = [
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
] as const;

export type InformaticFooterSocialKey = (typeof INFORMATIC_FOOTER_SOCIAL_KEYS)[number];

export const INFORMATIC_FOOTER_SOCIAL_LABELS: Record<InformaticFooterSocialKey, string> = {
  facebook: 'Facebook',
  twitter: 'X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
};

const SOCIAL_BLOCK_SETTINGS_BASE = 'sections.footer.blocks.social.settings';

export function informaticFooterSocialPath(key: InformaticFooterSocialKey): string {
  return `${SOCIAL_BLOCK_SETTINGS_BASE}.${key}`;
}

/** Ensure footer includes a Social links block (required Informatic footer contract). */
export function ensureInformaticFooterSocialBlock(
  config: Record<string, unknown>
): Record<string, unknown> {
  let next = config;

  for (const key of INFORMATIC_FOOTER_SOCIAL_KEYS) {
    const blockPath = informaticFooterSocialPath(key);
    const blockVal = getConfigPath(next, blockPath);
    if (blockVal != null) continue;

    const legacy = getConfigPath(next, `settings.socialLinks.${key}`);
    next = setConfigPath(next, blockPath, legacy != null ? String(legacy) : '');
  }

  const blockOrderPath = 'sections.footer.block_order';
  const blockOrder = getConfigPath(next, blockOrderPath);
  if (Array.isArray(blockOrder)) {
    if (!blockOrder.includes('social')) {
      next = setConfigPath(next, blockOrderPath, [...blockOrder, 'social']);
    }
  } else {
    next = setConfigPath(next, blockOrderPath, ['brand', 'menu', 'legal', 'social']);
  }

  const socialBlockPath = 'sections.footer.blocks.social';
  if (getConfigPath(next, socialBlockPath) == null) {
    next = setConfigPath(next, socialBlockPath, {
      type: 'social',
      settings: Object.fromEntries(INFORMATIC_FOOTER_SOCIAL_KEYS.map((key) => [key, ''])),
    });
  }

  return next;
}
