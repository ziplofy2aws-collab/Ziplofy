/** Catalog theme settings groups — only wired global options. */

export type ThemeSettingsCatalogItem = {
  id: string;
  label: string;
};

export const THEME_SETTINGS_CATALOG: ThemeSettingsCatalogItem[] = [
  { id: 'logo-favicon', label: 'Logo and favicon' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
];
