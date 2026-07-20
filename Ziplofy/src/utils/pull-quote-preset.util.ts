/** Shopify-style defaults for Pull quote sections. */

export function applyPullQuotePreset(section: Record<string, unknown>): void {
  if (section.type !== 'pull-quote') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'pull-quote';
  settings.quote =
    settings.quote ??
    'At the heart of every product lies a unique story, driven by our passion for quality and innovation. Each item enhances your everyday life and sparks joy.';
  settings.linkLabel = settings.linkLabel ?? 'Shop now';
  settings.linkUrl = settings.linkUrl ?? '/collections';
  settings.direction = settings.direction ?? 'vertical';
  settings.layoutAlignment = settings.layoutAlignment ?? 'center';
  settings.position = settings.position ?? 'center';
  settings.layoutGap = settings.layoutGap ?? 16;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'auto';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 64;
  settings.paddingBottom = settings.paddingBottom ?? 64;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;
}
