import type { CreateThemeEditing } from '../types';

/** Sidebar order: Collections → Layout → Padding → Custom CSS (matches grouped settings panel). */
export const editing: CreateThemeEditing = {
  sectionLabel: 'Collection links: Text',
  sectionSettingsOrder: [
    { key: 'collectionsPicker', label: 'Collections', type: 'text' },
    { key: 'layoutMode', label: 'Layout', type: 'select' },
    { key: 'sectionWidth', label: 'Width', type: 'select' },
    { key: 'alignment', label: 'Alignment', type: 'select' },
    { key: 'colorScheme', label: 'Color scheme', type: 'select' },
    { key: 'paddingTop', label: 'Top', type: 'number' },
    { key: 'paddingBottom', label: 'Bottom', type: 'number' },
    { key: 'customCss', label: 'Custom CSS', type: 'textarea' },
  ],
  blocks: [
    {
      blockId: 'collection_link',
      label: 'Collection link',
      settingsOrder: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'productCount', label: 'Product count', type: 'number' },
        { key: 'collectionHandle', label: 'Collection', type: 'text' },
      ],
    },
  ],
};
