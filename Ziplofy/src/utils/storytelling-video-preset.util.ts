/** Shopify-style defaults for Storytelling Video sections. */

export function applyStorytellingVideoPreset(section: Record<string, unknown>): void {
  if (section.type !== 'storytelling-video') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'video';
  settings.videoSource = 'url';
  settings.videoUrl = '';
  settings.coverImageUrl = '';
  settings.caption =
    'Take a look behind the scenes of our latest product launch.';
  settings.linkLabel = 'Discover the collection';
  settings.linkUrl = '/collections';
  settings.direction = 'vertical';
  settings.layoutAlignment = 'left';
  settings.position = 'center';
  settings.layoutGap = 16;
  settings.sectionWidth = 'page';
  settings.height = 'auto';
  settings.colorScheme = 'scheme-1';
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.borderStyle = 'none';
  settings.cornerRadius = 0;
  settings.backgroundOverlay = false;
  settings.paddingTop = 32;
  settings.paddingBottom = 32;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
