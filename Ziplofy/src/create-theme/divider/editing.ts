import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  sectionLabel: 'Divider',
  sectionSettingsOrder: [
    { key: 'colorScheme', label: 'Color scheme', type: 'select' },
    { key: 'sectionWidth', label: 'Width', type: 'select' },
    { key: 'thickness', label: 'Thickness', type: 'number' },
    { key: 'length', label: 'Length', type: 'number' },
    { key: 'paddingTop', label: 'Top', type: 'number' },
    { key: 'paddingBottom', label: 'Bottom', type: 'number' },
    { key: 'customCss', label: 'Custom CSS', type: 'textarea' },
  ],
  blocks: [],
};
