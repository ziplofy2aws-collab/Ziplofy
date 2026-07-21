import type { CreateThemeEditing } from '../types';

/** Settings panel field order when Footer or its blocks are selected. */
export const editing: CreateThemeEditing = {
  sectionLabel: 'Footer',
  sectionSettingsOrder: [
    { key: 'sectionWidth', label: 'Section width' },
    { key: 'gap', label: 'Gap' },
    { key: 'colorScheme', label: 'Color scheme' },
    { key: 'paddingTop', label: 'Padding top', type: 'number' },
    { key: 'paddingBottom', label: 'Padding bottom', type: 'number' },
  ],
  blocks: [
    {
      blockId: 'newsletter',
      label: 'Email signup',
      settingsOrder: [
        { key: 'title', label: 'Heading' },
        { key: 'subtitle', label: 'Subtext', type: 'textarea' },
        { key: 'placeholder', label: 'Email placeholder' },
        { key: 'buttonLabel', label: 'Button label' },
      ],
    },
  ],
};
