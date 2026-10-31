import { storytellingVideoCaptionDefaultSettings } from '../create-theme/sidebar/theme-editor-storytelling-video-caption-panel.utils';
import { storytellingVideoMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-storytelling-video-media-panel.utils';

/** Shopify-style defaults for Storytelling Video sections. */

export const STORYTELLING_VIDEO_SECTION_BLOCK_ORDER = ['video', 'caption'] as const;
export const STORYTELLING_VIDEO_CAPTION_NESTED_ORDER = ['caption_text', 'caption_button'] as const;

export function storytellingVideoSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...STORYTELLING_VIDEO_SECTION_BLOCK_ORDER],
    blocks: {
      video: {
        type: 'storytelling-video-media',
        settings: {},
      },
      caption: {
        type: 'storytelling-video-caption',
        block_order: [...STORYTELLING_VIDEO_CAPTION_NESTED_ORDER],
        nested_block_order: [...STORYTELLING_VIDEO_CAPTION_NESTED_ORDER],
        blocks: {},
      },
    },
  };
}

export function applyStorytellingVideoPreset(section: Record<string, unknown>): void {
  if (section.type !== 'storytelling-video') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'video';
  for (const [key, value] of Object.entries(storytellingVideoMediaDefaultSettings())) {
    settings[key] = settings[key] ?? value;
  }
  settings.caption =
    settings.caption ?? 'Take a look behind the scenes of our latest product launch.';
  settings.captionWidth = settings.captionWidth ?? 'fit';
  settings.captionMaxWidth = settings.captionMaxWidth ?? 'normal';
  settings.captionTypographyPreset = settings.captionTypographyPreset ?? 'default';
  settings.captionColor = settings.captionColor ?? '';
  settings.captionBackgroundEnabled = settings.captionBackgroundEnabled ?? false;
  settings.captionPaddingTop = settings.captionPaddingTop ?? 0;
  settings.captionPaddingBottom = settings.captionPaddingBottom ?? 0;
  settings.captionPaddingLeft = settings.captionPaddingLeft ?? 0;
  settings.captionPaddingRight = settings.captionPaddingRight ?? 0;
  settings.linkLabel = settings.linkLabel ?? 'Discover the collection';
  settings.linkUrl = settings.linkUrl ?? '/collections';
  settings.linkOpenInNewTab = settings.linkOpenInNewTab ?? false;
  settings.buttonStyle = settings.buttonStyle ?? 'link';
  settings.buttonLinkTextColor = settings.buttonLinkTextColor ?? '';
  settings.buttonCustomBackground = settings.buttonCustomBackground ?? '#111827';
  settings.buttonCustomText = settings.buttonCustomText ?? '#ffffff';
  settings.buttonDesktopWidth = settings.buttonDesktopWidth ?? 'fit';
  settings.buttonDesktopCustomWidth = settings.buttonDesktopCustomWidth ?? 100;
  settings.buttonMobileWidth = settings.buttonMobileWidth ?? 'fit';
  settings.buttonMobileCustomWidth = settings.buttonMobileCustomWidth ?? 100;
  settings.direction = settings.direction ?? 'vertical';
  settings.layoutAlignment = settings.layoutAlignment ?? 'left';
  settings.position = settings.position ?? 'center';
  settings.layoutGap = settings.layoutGap ?? 16;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'auto';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.backgroundColor = settings.backgroundColor ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 32;
  settings.paddingBottom = settings.paddingBottom ?? 32;
  settings.customCss = settings.customCss ?? '';
  const captionGroup = (settings.captionGroup ?? {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(storytellingVideoCaptionDefaultSettings())) {
    captionGroup[key] = captionGroup[key] ?? value;
  }
  settings.captionGroup = captionGroup;
  section.settings = settings;

  const preset = storytellingVideoSectionBlocks();
  section.block_order = preset.block_order;
  section.blocks = JSON.parse(JSON.stringify(preset.blocks)) as Record<string, unknown>;
}

/** Ensure Video sections use Add block → Video → Caption (Text / Button) hierarchy. */
export function ensureStorytellingVideoSectionBlocks(config: Record<string, unknown>): boolean {
  let changed = false;

  const migrateSection = (sec: Record<string, unknown>) => {
    if (sec.type !== 'storytelling-video') return;
    const settings = (sec.settings ?? {}) as { catalogVariant?: string };
    if (settings.catalogVariant !== 'video' && settings.catalogVariant !== undefined) return;
    const before = JSON.stringify(sec);
    applyStorytellingVideoPreset(sec);
    if (JSON.stringify(sec) !== before) changed = true;
  };

  for (const sec of Object.values(
    (config.sections ?? {}) as Record<string, Record<string, unknown>>
  )) {
    migrateSection(sec);
  }

  const templates = config.templates as
    | Record<string, { sections?: Record<string, Record<string, unknown>> }>
    | undefined;
  for (const tpl of Object.values(templates ?? {})) {
    for (const sec of Object.values(tpl?.sections ?? {})) {
      migrateSection(sec);
    }
  }

  return changed;
}
