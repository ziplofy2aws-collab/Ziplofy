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
  settings.height =
    settings.height === 'medium' || settings.height === 'large' ? settings.height : 'small';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.borderThickness = settings.borderThickness ?? 1;
  settings.borderOpacity = settings.borderOpacity ?? 100;
  settings.borderColor = settings.borderColor ?? 'default';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 64;
  settings.paddingBottom = settings.paddingBottom ?? 64;
  settings.customCss = settings.customCss ?? '';
  settings.quoteWidth = settings.quoteWidth ?? 'fill';
  settings.quoteMaxWidth = settings.quoteMaxWidth ?? 'wide';
  settings.quoteAlignment = settings.quoteAlignment ?? '';
  settings.quoteTypographyPreset = settings.quoteTypographyPreset ?? 'default';
  settings.quoteFont = settings.quoteFont ?? 'heading';
  settings.quoteFontSize = settings.quoteFontSize ?? '32px';
  settings.quoteLineHeight = settings.quoteLineHeight ?? 'normal';
  settings.quoteLetterSpacing = settings.quoteLetterSpacing ?? 'normal';
  settings.quoteTextCase = settings.quoteTextCase ?? 'default';
  settings.quoteWrap = settings.quoteWrap ?? 'pretty';
  settings.quoteColor = settings.quoteColor ?? '';
  settings.quoteBackgroundEnabled = settings.quoteBackgroundEnabled ?? false;
  settings.quoteBackgroundColor = settings.quoteBackgroundColor ?? '#f3f4f6';
  settings.quotePaddingTop = settings.quotePaddingTop ?? 0;
  settings.quotePaddingBottom = settings.quotePaddingBottom ?? 0;
  settings.quotePaddingLeft = settings.quotePaddingLeft ?? 0;
  settings.quotePaddingRight = settings.quotePaddingRight ?? 0;
  section.settings = settings;
}
