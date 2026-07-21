import type { CreateThemeBlockEditing } from '../types';

/** Header menu block panel sequence (position/row are header-level, not this panel). */
export const editing: CreateThemeBlockEditing = {
  blockId: 'menu',
  label: 'Menu',
  settingsOrder: [
    { key: 'menu', label: 'Menu', type: 'select' },
    { key: 'colorScheme', label: 'Color scheme', type: 'select' },
    { key: 'topLevelSize', label: 'Top level size', type: 'select' },
    { key: 'submenuSize', label: 'Submenu size', type: 'select' },
    { key: 'font', label: 'Font', type: 'select' },
    { key: 'textCase', label: 'Case', type: 'select' },
    { key: 'submenuMediaType', label: 'Media type', type: 'select' },
    { key: 'submenuImageRatio', label: 'Image ratio', type: 'select' },
    { key: 'submenuImageCornerRadius', label: 'Image corner radius', type: 'number' },
    { key: 'mobileNavigationBar', label: 'Navigation bar', type: 'boolean' },
    { key: 'mobileAccordion', label: 'Accordion', type: 'boolean' },
    { key: 'mobileDividers', label: 'Dividers', type: 'boolean' },
  ],
};
