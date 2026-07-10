/** Presets + helpers for Hero: Marquee, Large logo, and Split showcase. */

import { HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE } from './hero-bottom-aligned.util';

export const HERO_MARQUEE_TEXT =
  'Explore our latest products. Explore our latest products.';

export const LARGE_LOGO_BODY =
  'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.';

export const SPLIT_SHOWCASE_IMAGE_LEFT =
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1600&q=85';

export const SPLIT_SHOWCASE_IMAGE_RIGHT =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85';

export type HeroCatalogVariant =
  | 'hero'
  | 'hero-bottom-aligned'
  | 'hero-marquee'
  | 'large-logo'
  | 'split-showcase'
  | string;

export function readCatalogVariant(
  config: Record<string, unknown> | null,
  settingsBase: string
): string {
  if (!config) return '';
  const parts = `${settingsBase}.catalogVariant`.split('.');
  let cur: unknown = config;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : '';
}

export function heroSectionSidebarLabel(catalogVariant: string, fallback = 'Hero'): string {
  switch (catalogVariant) {
    case 'hero-bottom-aligned':
      return 'Hero: Bottom aligned';
    case 'hero-marquee':
      return 'Hero: Marquee';
    case 'large-logo':
      return 'Large logo';
    case 'split-showcase':
      return 'Split showcase';
    default:
      return fallback;
  }
}

export function applyHeroMarqueePreset(section: Record<string, unknown>, blocksPath: string): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'hero-marquee';
  settings.marqueeText = HERO_MARQUEE_TEXT;
  settings.subtitle = HERO_MARQUEE_TEXT;
  settings.media1Type = 'image';
  settings.media1ImageUrl =
    typeof settings.media1ImageUrl === 'string' && settings.media1ImageUrl.trim()
      ? settings.media1ImageUrl
      : HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE;
  settings.direction = 'vertical';
  settings.layoutAlignment = 'center';
  settings.position = 'space-between';
  settings.layoutGap = 32;
  settings.sectionWidth = 'page';
  settings.height = 'large';
  settings.paddingTop = 0;
  settings.paddingBottom = 40;
  settings.mediaOverlay = true;
  settings.overlayStyle = 'gradient';
  settings.overlayGradientDirection = 'up';
  settings.overlayColor = settings.overlayColor ?? '#00000026';
  settings.colorScheme = settings.colorScheme ?? 'scheme-5';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  if (!blocks.primary_button) {
    blocks.primary_button = {
      type: 'button',
      settings: { label: 'Shop now', href: '/products', openInNewTab: false, buttonStyle: 'primary' },
      settings_field_order: [
        `${blocksPath}.primary_button.settings.label`,
        `${blocksPath}.primary_button.settings.href`,
      ],
    };
  } else if (blocks.primary_button.settings && typeof blocks.primary_button.settings === 'object') {
    (blocks.primary_button.settings as Record<string, unknown>).label = 'Shop now';
  }
  section.blocks = blocks;
  section.block_order = ['primary_button'];
}

export function applyLargeLogoPreset(section: Record<string, unknown>, blocksPath: string): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'large-logo';
  settings.title = 'My Store';
  settings.subtitle = LARGE_LOGO_BODY;
  settings.media1Type = 'image';
  settings.media1ImageUrl = '';
  settings.media2ImageUrl = '';
  settings.direction = 'vertical';
  settings.layoutAlignment = 'left';
  settings.position = 'space-between';
  settings.layoutGap = 16;
  settings.sectionWidth = 'page';
  settings.height = 'medium';
  settings.paddingTop = 40;
  settings.paddingBottom = 40;
  settings.mediaOverlay = false;
  settings.colorScheme = settings.colorScheme ?? 'scheme-3';
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.borderStyle = 'none';
  settings.cornerRadius = 0;
  settings.defaultLogoUrl = '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  blocks.text_2 = {
    type: 'text',
    settings: { text: LARGE_LOGO_BODY },
    settings_field_order: [`${blocksPath}.text_2.settings.text`],
  };
  section.blocks = blocks;
  section.block_order = ['text_2'];
}

export function applySplitShowcasePreset(section: Record<string, unknown>, blocksPath: string): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'split-showcase';
  settings.title = 'New arrivals';
  settings.splitRightTitle = 'Bestsellers';
  settings.media1Type = 'image';
  settings.media1ImageUrl = SPLIT_SHOWCASE_IMAGE_LEFT;
  settings.media2Type = 'image';
  settings.media2ImageUrl = SPLIT_SHOWCASE_IMAGE_RIGHT;
  settings.direction = 'horizontal';
  settings.verticalOnMobile = true;
  settings.layoutAlignment = 'left';
  settings.position = 'center';
  settings.layoutGap = 0;
  settings.sectionWidth = 'full';
  settings.height = 'large';
  settings.paddingTop = 0;
  settings.paddingBottom = 0;
  settings.mediaOverlay = false;
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.borderStyle = 'none';
  settings.cornerRadius = 0;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  blocks.heading = blocks.heading ?? { type: 'heading', settings: {} };
  blocks.text_right = {
    type: 'text',
    settings: { text: 'Bestsellers' },
    settings_field_order: [`${blocksPath}.text_right.settings.text`],
  };
  blocks.primary_button = {
    type: 'button',
    settings: { label: 'Shop now', href: '/products', openInNewTab: false, buttonStyle: 'primary' },
    settings_field_order: [
      `${blocksPath}.primary_button.settings.label`,
      `${blocksPath}.primary_button.settings.href`,
    ],
  };
  blocks.secondary_button = {
    type: 'button',
    settings: { label: 'Shop now', href: '/products', openInNewTab: false, buttonStyle: 'secondary' },
    settings_field_order: [
      `${blocksPath}.secondary_button.settings.label`,
      `${blocksPath}.secondary_button.settings.href`,
    ],
  };
  section.blocks = blocks;
  section.block_order = ['heading', 'text_right', 'primary_button', 'secondary_button'];
}

export function applyHeroBannerVariantPreset(
  section: Record<string, unknown>,
  catalogId: string,
  blocksBase: string
): boolean {
  if (catalogId === 'hero-marquee') {
    applyHeroMarqueePreset(section, blocksBase);
    return true;
  }
  if (catalogId === 'large-logo') {
    applyLargeLogoPreset(section, blocksBase);
    return true;
  }
  if (catalogId === 'split-showcase') {
    applySplitShowcasePreset(section, blocksBase);
    return true;
  }
  return false;
}

/** Default block_order when config omits it (Shopify-style). */
export function defaultHeroBlockOrder(catalogVariant: string): string[] {
  switch (catalogVariant) {
    case 'hero-marquee':
      return ['primary_button'];
    case 'large-logo':
      return ['text_2'];
    case 'split-showcase':
      return ['heading', 'text_right', 'primary_button', 'secondary_button'];
    case 'hero-bottom-aligned':
      return ['content_group'];
    default:
      return ['heading', 'primary_button'];
  }
}
