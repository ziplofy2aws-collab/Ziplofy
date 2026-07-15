import type { CreateThemeEditing } from '../types';

/** Sidebar order: Collections → Layout → Appearance → Padding (layout mode is fixed to text). */
export const editing: CreateThemeEditing = {
  sectionLabel: 'Collection links: Text',
  sectionSettingsOrder: [
    { key: 'collectionsPicker', label: 'Collections', type: 'text' },
    { key: 'sectionWidth', label: 'Width', type: 'select' },
    { key: 'alignment', label: 'Alignment', type: 'select' },
    { key: 'backgroundColor', label: 'Background color', type: 'color' },
    { key: 'textColor', label: 'Text color', type: 'color' },
    { key: 'paddingTop', label: 'Top', type: 'number' },
    { key: 'paddingBottom', label: 'Bottom', type: 'number' },
  ],
  blocks: [
    {
      blockId: 'collection_link',
      label: 'Collection link',
      settingsOrder: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'typographyPreset', label: 'Preset', type: 'select' },
        { key: 'font', label: 'Font', type: 'select' },
        { key: 'fontSize', label: 'Size', type: 'select' },
        { key: 'lineHeight', label: 'Line height', type: 'select' },
        { key: 'letterSpacing', label: 'Letter spacing', type: 'select' },
        { key: 'textCase', label: 'Case', type: 'select' },
        { key: 'wrap', label: 'Wrap', type: 'select' },
        { key: 'imageUrl', label: 'Image', type: 'text' },
        { key: 'imageHeight', label: 'Height', type: 'select' },
        { key: 'imageRatio', label: 'Ratio', type: 'select' },
        { key: 'imageCornerRadius', label: 'Corner radius', type: 'number' },
        { key: 'productCount', label: 'Product count', type: 'number' },
        { key: 'collectionHandle', label: 'Collection', type: 'text' },
        { key: 'showCount', label: 'Show product count', type: 'boolean' },
      ],
    },
  ],
};
