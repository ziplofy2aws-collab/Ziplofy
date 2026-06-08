/** Shopify-style defaults for Rich text sections. */

export function applyRichTextPreset(section: Record<string, unknown>): void {
  if (section.type !== 'rich-text') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'rich-text';
  settings.heading = settings.heading ?? 'New arrivals';
  settings.text =
    settings.text ??
    'We make things that work better and last longer. Our products solve real problems with clean design and honest materials.';
  settings.buttonLabel = settings.buttonLabel ?? 'Shop now';
  settings.buttonUrl = settings.buttonUrl ?? '/collections';
  settings.direction = settings.direction ?? 'vertical';
  settings.layoutAlignment = settings.layoutAlignment ?? 'center';
  settings.position = settings.position ?? 'center';
  settings.layoutGap = settings.layoutGap ?? 25;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'small';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;
}
