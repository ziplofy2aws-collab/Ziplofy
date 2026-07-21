import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  sectionLabel: 'Policies and links',
  sectionSettingsOrder: [
    { key: 'sectionWidth', label: 'Section width' },
    { key: 'colorScheme', label: 'Color scheme' },
  ],
  blocks: [
    {
      blockId: 'copyright',
      label: 'Copyright',
      settingsOrder: [
        { key: 'text', label: 'Copyright text' },
        { key: 'showPoweredBy', label: 'Show powered by', type: 'boolean' },
      ],
    },
    {
      blockId: 'policy_links',
      label: 'Policy links',
      settingsOrder: [
        { key: 'privacyLabel', label: 'Privacy label' },
        { key: 'privacyHref', label: 'Privacy URL' },
        { key: 'termsLabel', label: 'Terms label' },
        { key: 'termsHref', label: 'Terms URL' },
      ],
    },
  ],
};
