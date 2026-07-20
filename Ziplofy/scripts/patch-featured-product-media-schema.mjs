import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATHS = [
  path.join(__dirname, '../src/theme-packs/horizon/theme.schema.json'),
  path.join(__dirname, '../src/theme-packs/horizon/preview/theme.schema.json'),
];

const PRODUCT_MEDIA_SETTINGS_FIELDS = (blocksPath) => [
  {
    path: `${blocksPath}.settings.aspectRatio`,
    type: 'select',
    label: 'Aspect ratio',
    group: 'General',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'auto', label: 'Auto' },
      { value: '1/1', label: 'Square (1:1)' },
      { value: '4/5', label: 'Portrait (4:5)' },
      { value: '3/4', label: 'Portrait (3:4)' },
      { value: '16/9', label: 'Landscape (16:9)' },
      { value: '2/3', label: 'Portrait (2:3)' },
    ],
  },
  {
    path: `${blocksPath}.settings.constrainToScreenHeight`,
    type: 'boolean',
    label: 'Constrain to screen height',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.mediaFit`,
    type: 'select',
    label: 'Media fit',
    group: 'General',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'cover', label: 'Cover' },
      { value: 'contain', label: 'Contain' },
    ],
  },
  {
    path: `${blocksPath}.settings.cornerRadius`,
    type: 'number',
    label: 'Corner radius',
    group: 'General',
    widget: 'slider',
    min: 0,
    max: 40,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.extendMediaToScreenEdge`,
    type: 'boolean',
    label: 'Extend media to screen edge',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.enableZoom`,
    type: 'boolean',
    label: 'Enable zoom',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.videoLooping`,
    type: 'boolean',
    label: 'Video looping',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.hideUnselectedVariantMedia`,
    type: 'boolean',
    label: 'Hide unselected variant media',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.carouselIcons`,
    type: 'select',
    label: 'Icons',
    group: 'Carousel',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'arrows', label: 'Arrows' },
      { value: 'chevrons', label: 'Chevrons' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    path: `${blocksPath}.settings.carouselPagination`,
    type: 'select',
    label: 'Pagination',
    group: 'Carousel',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'counter', label: 'Counter' },
      { value: 'dots', label: 'Dots' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    path: `${blocksPath}.settings.carouselMobilePagination`,
    type: 'select',
    label: 'Mobile pagination',
    group: 'Carousel',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'dots', label: 'Dots' },
      { value: 'counter', label: 'Counter' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    path: `${blocksPath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
];

const FIT_FILL = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
];

const PRODUCT_DETAILS_SETTINGS_FIELDS = (blocksPath) => [
  {
    path: `${blocksPath}.settings.width`,
    type: 'select',
    label: 'Width',
    group: 'Size',
    widget: 'segmented',
    sidebar: false,
    options: FIT_FILL_CUSTOM,
  },
  {
    path: `${blocksPath}.settings.customWidth`,
    type: 'number',
    label: 'Custom width',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.mobileWidth`,
    type: 'select',
    label: 'Mobile width',
    group: 'Size',
    widget: 'segmented',
    sidebar: false,
    options: FIT_FILL_CUSTOM,
  },
  {
    path: `${blocksPath}.settings.mobileCustomWidth`,
    type: 'number',
    label: 'Custom width',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.height`,
    type: 'select',
    label: 'Height',
    group: 'Size',
    widget: 'segmented',
    sidebar: false,
    options: FIT_FILL,
  },
  {
    path: `${blocksPath}.settings.position`,
    type: 'select',
    label: 'Position',
    group: 'Layout',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'top', label: 'Top' },
      { value: 'center', label: 'Center' },
      { value: 'bottom', label: 'Bottom' },
    ],
  },
  {
    path: `${blocksPath}.settings.layoutGap`,
    type: 'number',
    label: 'Gap',
    group: 'Layout',
    widget: 'slider',
    min: 0,
    max: 120,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.stickyOnDesktop`,
    type: 'boolean',
    label: 'Sticky on desktop',
    group: 'Layout',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.inheritColorScheme`,
    type: 'boolean',
    label: 'Inherit color scheme',
    group: 'Appearance',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.backgroundMedia`,
    type: 'select',
    label: 'Background media',
    group: 'Appearance',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'none', label: 'None' },
      { value: 'image', label: 'Image' },
    ],
  },
  {
    path: `${blocksPath}.settings.backgroundImageUrl`,
    type: 'text',
    label: 'Image',
    group: 'Appearance',
    widget: 'image',
    sidebar: false,
    placeholder: 'https://…',
  },
  {
    path: `${blocksPath}.settings.backgroundImagePosition`,
    type: 'select',
    label: 'Image position',
    group: 'Appearance',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'cover', label: 'Cover' },
      { value: 'fit', label: 'Fit' },
    ],
  },
  {
    path: `${blocksPath}.settings.borderStyle`,
    type: 'select',
    label: 'Borders',
    group: 'Appearance',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'none', label: 'None' },
      { value: 'solid', label: 'Solid' },
    ],
  },
  {
    path: `${blocksPath}.settings.borderThickness`,
    type: 'number',
    label: 'Border thickness',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 10,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.borderOpacity`,
    type: 'number',
    label: 'Border opacity',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.cornerRadius`,
    type: 'number',
    label: 'Corner radius',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${blocksPath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

const HEADER_TITLE_SETTINGS_FIELDS = (titlePath) => [
  {
    path: `${titlePath}.settings.width`,
    type: 'select',
    label: 'Width',
    group: 'Layout',
    widget: 'segmented',
    sidebar: false,
    options: FIT_FILL,
  },
  {
    path: `${titlePath}.settings.maxWidth`,
    type: 'select',
    label: 'Max width',
    group: 'Layout',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'normal', label: 'Normal' },
      { value: 'wide', label: 'Wide' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    path: `${titlePath}.settings.typographyPreset`,
    type: 'select',
    label: 'Preset',
    group: 'Typography',
    widget: 'select',
    sidebar: false,
    description: 'Edit presets in theme settings',
    options: [
      { value: 'default', label: 'Default' },
      { value: 'heading-1', label: 'Heading 1' },
      { value: 'heading-2', label: 'Heading 2' },
      { value: 'heading-3', label: 'Heading 3' },
      { value: 'heading-4', label: 'Heading 4' },
      { value: 'body', label: 'Body' },
    ],
  },
  {
    path: `${titlePath}.settings.backgroundEnabled`,
    type: 'boolean',
    label: 'Background',
    group: 'Appearance',
    sidebar: false,
  },
  {
    path: `${titlePath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${titlePath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${titlePath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${titlePath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

function upsertBlock(blocks, id, label, settingsFields) {
  const existing = blocks.find((b) => b.id === id);
  if (existing) {
    existing.settingsFields = settingsFields;
    return existing;
  }
  const block = { id, label, settingsFields };
  blocks.push(block);
  return block;
}

const HEADER_PRICE_SETTINGS_FIELDS = (pricePath) => [
  {
    path: `${pricePath}.settings.showSalePriceFirst`,
    type: 'boolean',
    label: 'Show sale price first',
    group: 'General',
    sidebar: false,
    description: 'Edit price formatting in theme settings',
  },
  {
    path: `${pricePath}.settings.installments`,
    type: 'boolean',
    label: 'Installments',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${pricePath}.settings.taxInformation`,
    type: 'boolean',
    label: 'Tax information',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${pricePath}.settings.typographyPreset`,
    type: 'select',
    label: 'Preset',
    group: 'Typography',
    widget: 'select',
    sidebar: false,
    description: 'Edit presets in theme settings',
    options: [
      { value: 'default', label: 'Default' },
      { value: 'heading-6', label: 'Heading 6' },
      { value: 'heading-5', label: 'Heading 5' },
      { value: 'heading-4', label: 'Heading 4' },
      { value: 'body', label: 'Body' },
    ],
  },
  {
    path: `${pricePath}.settings.width`,
    type: 'select',
    label: 'Width',
    group: 'Typography',
    widget: 'segmented',
    sidebar: false,
    options: FIT_FILL,
  },
  {
    path: `${pricePath}.settings.alignment`,
    type: 'select',
    label: 'Alignment',
    group: 'Typography',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
  },
  {
    path: `${pricePath}.settings.color`,
    type: 'select',
    label: 'Color',
    group: 'Typography',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'text', label: 'Text' },
      { value: 'heading', label: 'Heading' },
      { value: 'accent', label: 'Accent' },
      { value: 'muted', label: 'Muted' },
    ],
  },
  {
    path: `${pricePath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${pricePath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${pricePath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${pricePath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

const HEADER_BLOCK_SETTINGS_FIELDS = (headerPath) => [
  {
    path: `${headerPath}.settings.direction`,
    type: 'select',
    label: 'Direction',
    group: 'Layout',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'vertical', label: 'Vertical' },
      { value: 'horizontal', label: 'Horizontal' },
    ],
  },
  {
    path: `${headerPath}.settings.alignment`,
    type: 'select',
    label: 'Alignment',
    group: 'Layout',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
  },
  {
    path: `${headerPath}.settings.position`,
    type: 'select',
    label: 'Position',
    group: 'Layout',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'top', label: 'Top' },
      { value: 'center', label: 'Center' },
      { value: 'bottom', label: 'Bottom' },
    ],
  },
  {
    path: `${headerPath}.settings.layoutGap`,
    type: 'number',
    label: 'Gap',
    group: 'Layout',
    widget: 'slider',
    min: 0,
    max: 48,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.width`,
    type: 'select',
    label: 'Width',
    group: 'Size',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'fit', label: 'Fit' },
      { value: 'fill', label: 'Fill' },
      { value: 'custom', label: 'Custom' },
    ],
  },
  {
    path: `${headerPath}.settings.customWidth`,
    type: 'number',
    label: 'Custom width',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.mobileWidth`,
    type: 'select',
    label: 'Mobile width',
    group: 'Size',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'fit', label: 'Fit' },
      { value: 'fill', label: 'Fill' },
      { value: 'custom', label: 'Custom' },
    ],
  },
  {
    path: `${headerPath}.settings.mobileCustomWidth`,
    type: 'number',
    label: 'Custom width',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.height`,
    type: 'select',
    label: 'Height',
    group: 'Size',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'fit', label: 'Fit' },
      { value: 'fill', label: 'Fill' },
      { value: 'custom', label: 'Custom' },
    ],
  },
  {
    path: `${headerPath}.settings.customHeight`,
    type: 'number',
    label: 'Custom height',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.inheritColorScheme`,
    type: 'boolean',
    label: 'Inherit color scheme',
    group: 'Appearance',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.backgroundMedia`,
    type: 'select',
    label: 'Background media',
    group: 'Appearance',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'none', label: 'None' },
      { value: 'image', label: 'Image' },
    ],
  },
  {
    path: `${headerPath}.settings.backgroundImageUrl`,
    type: 'text',
    label: 'Image',
    group: 'Appearance',
    widget: 'image',
    sidebar: false,
    placeholder: 'https://…',
  },
  {
    path: `${headerPath}.settings.backgroundImagePosition`,
    type: 'select',
    label: 'Image position',
    group: 'Appearance',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'cover', label: 'Cover' },
      { value: 'fit', label: 'Fit' },
    ],
  },
  {
    path: `${headerPath}.settings.borderStyle`,
    type: 'select',
    label: 'Borders',
    group: 'Appearance',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'none', label: 'None' },
      { value: 'solid', label: 'Solid' },
    ],
  },
  {
    path: `${headerPath}.settings.borderThickness`,
    type: 'number',
    label: 'Border thickness',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 10,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.borderOpacity`,
    type: 'number',
    label: 'Border opacity',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.cornerRadius`,
    type: 'number',
    label: 'Corner radius',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.backgroundOverlay`,
    type: 'boolean',
    label: 'Background overlay',
    group: 'Appearance',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.linkUrl`,
    type: 'text',
    label: 'Link',
    group: 'Block link',
    widget: 'link',
    sidebar: false,
    placeholder: 'Paste a link or search',
  },
  {
    path: `${headerPath}.settings.openLinkInNewTab`,
    type: 'boolean',
    label: 'Open link in new tab',
    group: 'Block link',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${headerPath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

const BUY_BUTTONS_SETTINGS_FIELDS = (buyButtonsPath) => [
  {
    path: `${buyButtonsPath}.settings.alwaysStackButtons`,
    type: 'boolean',
    label: 'Always stack buttons',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${buyButtonsPath}.settings.showPickupAvailability`,
    type: 'boolean',
    label: 'Show pickup availability',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${buyButtonsPath}.settings.giftCardForm`,
    type: 'boolean',
    label: 'Gift card form',
    group: 'General',
    sidebar: false,
    description:
      "Customers can send gift cards to a recipient's email with a personal message.",
  },
  {
    path: `${buyButtonsPath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${buyButtonsPath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${buyButtonsPath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${buyButtonsPath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

const ADD_TO_CART_SETTINGS_FIELDS = (addToCartPath) => [
  {
    path: `${addToCartPath}.settings.style`,
    type: 'select',
    label: 'Style',
    group: 'Appearance',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'primary', label: 'Primary' },
      { value: 'secondary', label: 'Secondary' },
    ],
  },
];

const VARIANT_PICKER_SETTINGS_FIELDS = (variantPickerPath) => [
  {
    path: `${variantPickerPath}.settings.style`,
    type: 'select',
    label: 'Style',
    group: 'General',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'buttons', label: 'Buttons' },
      { value: 'dropdown', label: 'Dropdown' },
    ],
  },
  {
    path: `${variantPickerPath}.settings.swatches`,
    type: 'boolean',
    label: 'Swatches',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${variantPickerPath}.settings.alignment`,
    type: 'select',
    label: 'Alignment',
    group: 'General',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
  },
  {
    path: `${variantPickerPath}.settings.paddingTop`,
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${variantPickerPath}.settings.paddingBottom`,
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${variantPickerPath}.settings.paddingLeft`,
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: `${variantPickerPath}.settings.paddingRight`,
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
];

const REVIEW_STARS_SETTINGS_FIELDS = (reviewStarsPath) => [
  {
    path: `${reviewStarsPath}.settings.style`,
    type: 'select',
    label: 'Style',
    group: 'General',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'shaded', label: 'Shaded' },
      { value: 'default', label: 'Default' },
    ],
  },
  {
    path: `${reviewStarsPath}.settings.reviewCount`,
    type: 'boolean',
    label: 'Review count',
    group: 'General',
    sidebar: false,
  },
  {
    path: `${reviewStarsPath}.settings.color`,
    type: 'select',
    label: 'Color',
    group: 'General',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'text', label: 'Text' },
      { value: 'link', label: 'Link' },
    ],
  },
  {
    path: `${reviewStarsPath}.settings.typographyPreset`,
    type: 'select',
    label: 'Preset',
    group: 'Typography',
    widget: 'select',
    sidebar: false,
    options: [
      { value: 'paragraph', label: 'Paragraph' },
      { value: 'default', label: 'Default' },
      { value: 'body', label: 'Body' },
      { value: 'heading-6', label: 'Heading 6' },
      { value: 'heading-5', label: 'Heading 5' },
    ],
  },
  {
    path: `${reviewStarsPath}.settings.width`,
    type: 'select',
    label: 'Width',
    group: 'Typography',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'fit', label: 'Fit' },
      { value: 'fill', label: 'Fill' },
    ],
  },
  {
    path: `${reviewStarsPath}.settings.alignment`,
    type: 'select',
    label: 'Alignment',
    group: 'Typography',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
  },
];

function upsertDetailsReviewStarsBlock(detailsBlock, sectionPath) {
  detailsBlock.blocks = detailsBlock.blocks ?? [];
  const reviewStarsPath = `${sectionPath}.blocks.details.blocks.review_stars`;
  const fields = REVIEW_STARS_SETTINGS_FIELDS(reviewStarsPath);
  let block = detailsBlock.blocks.find((b) => b.id === 'review_stars');
  if (!block) {
    block = { id: 'review_stars', label: 'Review stars', settingsFields: fields };
    detailsBlock.blocks.push(block);
  } else {
    block.label = 'Review stars';
    block.settingsFields = fields;
  }
}

function upsertDetailsVariantPickerBlock(detailsBlock, sectionPath) {
  detailsBlock.blocks = detailsBlock.blocks ?? [];
  const variantPickerPath = `${sectionPath}.blocks.details.blocks.variant_picker`;
  const fields = VARIANT_PICKER_SETTINGS_FIELDS(variantPickerPath);
  let block = detailsBlock.blocks.find((b) => b.id === 'variant_picker');
  if (!block) {
    block = { id: 'variant_picker', label: 'Variant picker', settingsFields: fields };
    detailsBlock.blocks.push(block);
  } else {
    block.label = 'Variant picker';
    block.settingsFields = fields;
  }
}

const BUY_BUTTONS_NESTED_BLOCKS = [
  { id: 'quantity', label: 'Quantity' },
  { id: 'add_to_cart', label: 'Add to cart' },
  { id: 'accelerated_checkout', label: 'Accelerated checkout' },
];

function upsertDetailsNestedBuyButtonsBlock(detailsBlock, sectionPath) {
  detailsBlock.blocks = detailsBlock.blocks ?? [];
  const buyButtonsPath = `${sectionPath}.blocks.details.blocks.buy_buttons`;
  const buyButtonsFields = BUY_BUTTONS_SETTINGS_FIELDS(buyButtonsPath);
  let buyButtons = detailsBlock.blocks.find((b) => b.id === 'buy_buttons');
  if (!buyButtons) {
    buyButtons = { id: 'buy_buttons', label: 'Buy buttons', settingsFields: buyButtonsFields, blocks: [] };
    detailsBlock.blocks.push(buyButtons);
  } else {
    buyButtons.settingsFields = buyButtonsFields;
    buyButtons.blocks = buyButtons.blocks ?? [];
  }

  for (const nested of BUY_BUTTONS_NESTED_BLOCKS) {
    const nestedPath = `${buyButtonsPath}.blocks.${nested.id}`;
    const settingsFields =
      nested.id === 'add_to_cart' ? ADD_TO_CART_SETTINGS_FIELDS(nestedPath) : [];
    let block = buyButtons.blocks.find((b) => b.id === nested.id);
    if (!block) {
      block = { id: nested.id, label: nested.label, settingsFields };
      buyButtons.blocks.push(block);
    } else {
      block.label = nested.label;
      block.settingsFields = settingsFields;
    }
  }
}

function upsertDetailsNestedHeaderBlocks(detailsBlock, sectionPath) {
  detailsBlock.blocks = detailsBlock.blocks ?? [];
  let header = detailsBlock.blocks.find((b) => b.id === 'header');
  if (!header) {
    header = { id: 'header', label: 'Header', blocks: [] };
    detailsBlock.blocks.push(header);
  }
  header.blocks = header.blocks ?? [];
  const headerPath = `${sectionPath}.blocks.details.blocks.header`;
  header.settingsFields = HEADER_BLOCK_SETTINGS_FIELDS(headerPath);

  const titlePath = `${sectionPath}.blocks.details.blocks.header.blocks.title`;
  const titleFields = HEADER_TITLE_SETTINGS_FIELDS(titlePath);
  let title = header.blocks.find((b) => b.id === 'title');
  if (!title) {
    title = { id: 'title', label: 'Title', settingsFields: titleFields };
    header.blocks.push(title);
  } else {
    title.settingsFields = titleFields;
  }

  const pricePath = `${sectionPath}.blocks.details.blocks.header.blocks.price`;
  const priceFields = HEADER_PRICE_SETTINGS_FIELDS(pricePath);
  let price = header.blocks.find((b) => b.id === 'price');
  if (!price) {
    price = { id: 'price', label: 'Price', settingsFields: priceFields };
    header.blocks.push(price);
  } else {
    price.settingsFields = priceFields;
  }
}

function patchSchema(schemaPath) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  const blueprint = schema.sections?.product_highlight;
  if (blueprint) {
    blueprint.blocks = blueprint.blocks ?? [];
    upsertBlock(
      blueprint.blocks,
      'product_media',
      'Product media',
      PRODUCT_MEDIA_SETTINGS_FIELDS('sections.product_highlight.blocks.product_media')
    );
    const detailsBlueprint = upsertBlock(
      blueprint.blocks,
      'details',
      'Details',
      PRODUCT_DETAILS_SETTINGS_FIELDS('sections.product_highlight.blocks.details')
    );
    upsertDetailsNestedHeaderBlocks(detailsBlueprint, 'sections.product_highlight');
    upsertDetailsReviewStarsBlock(detailsBlueprint, 'sections.product_highlight');
    upsertDetailsVariantPickerBlock(detailsBlueprint, 'sections.product_highlight');
    upsertDetailsNestedBuyButtonsBlock(detailsBlueprint, 'sections.product_highlight');
  }

  const tpl = schema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'product_highlight');
  if (sec) {
    sec.hasBlocks = true;
    sec.blocks = sec.blocks ?? [];
    upsertBlock(
      sec.blocks,
      'product_media',
      'Product media',
      PRODUCT_MEDIA_SETTINGS_FIELDS(
        'templates.index.sections.product_highlight.blocks.product_media'
      )
    );
    const detailsTpl = upsertBlock(
      sec.blocks,
      'details',
      'Details',
      PRODUCT_DETAILS_SETTINGS_FIELDS('templates.index.sections.product_highlight.blocks.details')
    );
    upsertDetailsNestedHeaderBlocks(detailsTpl, 'templates.index.sections.product_highlight');
    upsertDetailsReviewStarsBlock(detailsTpl, 'templates.index.sections.product_highlight');
    upsertDetailsVariantPickerBlock(detailsTpl, 'templates.index.sections.product_highlight');
    upsertDetailsNestedBuyButtonsBlock(detailsTpl, 'templates.index.sections.product_highlight');
  }

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n', 'utf8');
  console.log('Patched', schemaPath);
}

for (const p of SCHEMA_PATHS) {
  patchSchema(p);
}
