/** Shopify-style defaults for Icons with text sections. */

const DEFAULT_TEXT_STYLE_SETTINGS = {
  headingWidth: 'fill',
  headingMaxWidth: 'normal',
  headingAlignment: 'center',
  headingTypographyPreset: 'heading-4',
  headingFont: 'heading',
  headingFontSize: '20px',
  headingLineHeight: 'normal',
  headingLetterSpacing: 'normal',
  headingTextCase: 'default',
  headingWrap: 'pretty',
  headingColor: '',
  headingBackgroundEnabled: false,
  headingBackgroundColor: '',
  headingCornerRadius: 0,
  headingPaddingTop: 0,
  headingPaddingBottom: 0,
  headingPaddingLeft: 0,
  headingPaddingRight: 0,
  descWidth: 'fill',
  descMaxWidth: 'normal',
  descAlignment: 'center',
  descTypographyPreset: 'default',
  descFont: 'body',
  descFontSize: 'default',
  descLineHeight: 'normal',
  descLetterSpacing: 'normal',
  descTextCase: 'default',
  descWrap: 'pretty',
  descColor: '',
  descBackgroundEnabled: false,
  descBackgroundColor: '',
  descCornerRadius: 0,
  descPaddingTop: 0,
  descPaddingBottom: 0,
  descPaddingLeft: 0,
  descPaddingRight: 0,
} as const;

const DEFAULT_ITEMS: { icon: string; heading: string; text: string }[] = [
  {
    icon: 'eye',
    heading: 'Intentional design',
    text: 'Everything we do starts with why',
  },
  {
    icon: 'heart',
    heading: 'Made with care',
    text: 'We believe in building better',
  },
  {
    icon: 'person',
    heading: 'A team with a goal',
    text: 'Real people making great products',
  },
];

export function applyIconsWithTextPreset(section: Record<string, unknown>): void {
  if (section.type !== 'icons-with-text') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'icons-with-text';
  settings.direction = settings.direction ?? 'horizontal';
  settings.verticalOnMobile = settings.verticalOnMobile ?? false;
  settings.layoutAlignment = settings.layoutAlignment ?? 'center';
  settings.position = settings.position ?? 'center';
  settings.layoutGap = settings.layoutGap ?? 32;
  settings.columns = settings.columns ?? 3;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'auto';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.backgroundColor = settings.backgroundColor ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.borderThickness = settings.borderThickness ?? 1;
  settings.borderOpacity = settings.borderOpacity ?? 100;
  settings.borderColor = settings.borderColor ?? 'default';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks: Record<string, Record<string, unknown>> = {};
  const block_order: string[] = [];
  DEFAULT_ITEMS.forEach((item, i) => {
    const id = `icon_${i + 1}`;
    blocks[id] = {
      type: 'icon-with-text-item',
      settings: { icon: item.icon, heading: item.heading, text: item.text, ...DEFAULT_TEXT_STYLE_SETTINGS },
    };
    block_order.push(id);
  });
  section.blocks = blocks;
  section.block_order = block_order;
}
