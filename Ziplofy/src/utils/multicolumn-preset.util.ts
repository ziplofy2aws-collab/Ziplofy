/** Shopify-style defaults for Multicolumn sections. */

const DEFAULT_COLUMNS: { heading: string; text: string }[] = [
  {
    heading: 'Intentional design',
    text: 'We create with intention. Our products solve real problems with clean design and honest materials.',
  },
  {
    heading: 'Quality first',
    text: 'We obsess over the details and strive to deliver the best products at the best prices, every time.',
  },
  {
    heading: 'Customer care',
    text: "We're always on your side: keeping our loyal customers happy is our top priority and number one goal.",
  },
];

export function applyMulticolumnPreset(section: Record<string, unknown>): void {
  if (section.type !== 'multicolumn') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'multicolumn';
  settings.direction = settings.direction ?? 'horizontal';
  settings.verticalOnMobile = settings.verticalOnMobile ?? true;
  settings.layoutAlignment = settings.layoutAlignment ?? 'left';
  settings.position = settings.position ?? 'top';
  settings.layoutGap = settings.layoutGap ?? 16;
  settings.columns = settings.columns ?? 3;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'auto';
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

  const blocks: Record<string, Record<string, unknown>> = {};
  const block_order: string[] = [];
  DEFAULT_COLUMNS.forEach((item, i) => {
    const id = `column_${i + 1}`;
    blocks[id] = {
      type: 'multicolumn-item',
      settings: { heading: item.heading, text: item.text },
    };
    block_order.push(id);
  });
  section.blocks = blocks;
  section.block_order = block_order;
}
