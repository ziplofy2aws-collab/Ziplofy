/** Shopify-style defaults for Image with text sections. */

import { imageWithTextContentGroupDefaultSettings } from '../create-theme/sidebar/theme-editor-image-with-text-group-panel.utils';
import { imageWithTextImageDefaultSettings } from '../create-theme/sidebar/theme-editor-image-with-text-image-panel.utils';

export const IMAGE_WITH_TEXT_SECTION_BLOCK_ORDER = ['image', 'group'] as const;
export const IMAGE_WITH_TEXT_GROUP_NESTED_ORDER = ['heading', 'text', 'button'] as const;

export function imageWithTextSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...IMAGE_WITH_TEXT_SECTION_BLOCK_ORDER],
    blocks: {
      image: {
        type: 'image-with-text-image',
        settings: {},
      },
      group: {
        type: 'image-with-text-group',
        block_order: [...IMAGE_WITH_TEXT_GROUP_NESTED_ORDER],
        nested_block_order: [...IMAGE_WITH_TEXT_GROUP_NESTED_ORDER],
        blocks: {},
      },
    },
  };
}

export function applyImageWithTextPreset(section: Record<string, unknown>): void {
  if (section.type !== 'image-with-text') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'image-with-text';
  for (const [key, value] of Object.entries(imageWithTextImageDefaultSettings())) {
    settings[key] = settings[key] ?? value;
  }
  settings.heading = settings.heading ?? 'Our signature product';
  settings.headingWidth = settings.headingWidth ?? 'fit';
  settings.headingMaxWidth = settings.headingMaxWidth ?? 'normal';
  settings.headingTypographyPreset = settings.headingTypographyPreset ?? 'heading-3';
  settings.headingColor = settings.headingColor ?? '';
  settings.headingBackgroundEnabled = settings.headingBackgroundEnabled ?? false;
  settings.headingPaddingTop = settings.headingPaddingTop ?? 0;
  settings.headingPaddingBottom = settings.headingPaddingBottom ?? 0;
  settings.headingPaddingLeft = settings.headingPaddingLeft ?? 0;
  settings.headingPaddingRight = settings.headingPaddingRight ?? 0;
  settings.description =
    settings.description ??
    'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.';
  settings.descriptionWidth = settings.descriptionWidth ?? 'fit';
  settings.descriptionMaxWidth = settings.descriptionMaxWidth ?? 'narrow';
  settings.descriptionTypographyPreset = settings.descriptionTypographyPreset ?? 'default';
  settings.descriptionColor = settings.descriptionColor ?? '';
  settings.descriptionBackgroundEnabled = settings.descriptionBackgroundEnabled ?? false;
  settings.descriptionPaddingTop = settings.descriptionPaddingTop ?? 0;
  settings.descriptionPaddingBottom = settings.descriptionPaddingBottom ?? 0;
  settings.descriptionPaddingLeft = settings.descriptionPaddingLeft ?? 0;
  settings.descriptionPaddingRight = settings.descriptionPaddingRight ?? 0;
  settings.buttonLabel = settings.buttonLabel ?? 'Shop now';
  settings.buttonUrl = settings.buttonUrl ?? '/products';
  settings.buttonOpenInNewTab = settings.buttonOpenInNewTab ?? false;
  settings.buttonStyle = settings.buttonStyle ?? 'primary';
  settings.buttonLinkTextColor = settings.buttonLinkTextColor ?? '';
  settings.buttonCustomBackground = settings.buttonCustomBackground ?? '#111827';
  settings.buttonCustomText = settings.buttonCustomText ?? '#ffffff';
  settings.buttonDesktopWidth = settings.buttonDesktopWidth ?? 'fit';
  settings.buttonDesktopCustomWidth = settings.buttonDesktopCustomWidth ?? 100;
  settings.buttonMobileWidth = settings.buttonMobileWidth ?? 'fit';
  settings.buttonMobileCustomWidth = settings.buttonMobileCustomWidth ?? 100;
  settings.direction = settings.direction ?? 'horizontal';
  settings.verticalOnMobile = settings.verticalOnMobile ?? false;
  settings.layoutAlignment = settings.layoutAlignment ?? 'left';
  settings.position = settings.position ?? 'center';
  settings.layoutGap = settings.layoutGap ?? 32;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'auto';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.backgroundColor = settings.backgroundColor ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 40;
  settings.paddingBottom = settings.paddingBottom ?? 40;
  settings.customCss = settings.customCss ?? '';
  const contentGroup = (settings.contentGroup ?? {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(imageWithTextContentGroupDefaultSettings())) {
    contentGroup[key] = contentGroup[key] ?? value;
  }
  settings.contentGroup = contentGroup;
  section.settings = settings;

  const presetBlocks = imageWithTextSectionBlocks();
  const blockOrder = (section.block_order as string[] | undefined) ?? [];
  section.block_order =
    blockOrder.length > 0 ? blockOrder : [...presetBlocks.block_order];
  const blocks = (section.blocks ?? {}) as Record<string, unknown>;
  for (const [blockId, blockDef] of Object.entries(presetBlocks.blocks)) {
    blocks[blockId] = blocks[blockId] ?? blockDef;
  }
  section.blocks = blocks;
}
