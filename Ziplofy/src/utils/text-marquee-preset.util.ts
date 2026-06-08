/** Shopify-style defaults for Text marquee sections. */

export function applyTextMarqueePreset(section: Record<string, unknown>): void {
  if (section.type !== 'text-marquee') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'text-marquee';
  settings.text =
    settings.text ??
    'We make things that work better and last longer.';
  settings.motionDirection = settings.motionDirection ?? 'forward';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 24;
  settings.paddingBottom = settings.paddingBottom ?? 24;
  settings.layoutGap = settings.layoutGap ?? 24;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;
}
