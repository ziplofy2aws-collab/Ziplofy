import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  sectionLabel: 'Announcement bar',
  sectionSettingsOrder: [
    { key: 'timeToNext', label: 'Time to next announcement', type: 'number' },
    { key: 'sectionWidth', label: 'Section width', type: 'select' },
    { key: 'colorScheme', label: 'Color scheme', type: 'select' },
    { key: 'dividerThickness', label: 'Divider thickness', type: 'number' },
    { key: 'paddingTop', label: 'Top', type: 'number' },
    { key: 'paddingBottom', label: 'Bottom', type: 'number' },
    { key: 'customCss', label: 'Custom CSS', type: 'textarea' },
  ],
  blocks: [
    {
      blockId: 'announcement',
      label: 'Announcement',
      settingsOrder: [{ key: 'text', label: 'Text' }],
    },
  ],
};
