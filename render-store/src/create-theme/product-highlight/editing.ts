import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  sectionLabel: 'Product highlight',
  sectionSettingsOrder: [
    { key: 'productId', label: 'Product', type: 'text' },
    { key: 'mediaPosition', label: 'Media position', type: 'text' },
    { key: 'backgroundColor', label: 'Background color', type: 'text' },
    { key: 'paddingTop', label: 'Top', type: 'number' },
    { key: 'paddingBottom', label: 'Bottom', type: 'number' },
  ],
  blocks: [
    { blockId: 'product_media', label: 'Product media', settingsOrder: [] },
    { blockId: 'product', label: 'Product', settingsOrder: [] },
    { blockId: 'title', label: 'Title', settingsOrder: [] },
    { blockId: 'price', label: 'Price', settingsOrder: [] },
    { blockId: 'image', label: 'Image', settingsOrder: [] },
    { blockId: 'swatches', label: 'Swatches', settingsOrder: [] },
  ],
};
