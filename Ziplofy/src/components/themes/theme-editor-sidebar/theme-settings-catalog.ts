/** Shopify-style theme settings groups (display-only catalog). */

export type ThemeSettingsCatalogItem = {
  id: string;
  label: string;
  /** Muted row with info icon instead of chevron (e.g. Theme style). */
  infoOnly?: boolean;
};

export const THEME_SETTINGS_CATALOG: ThemeSettingsCatalogItem[] = [
  { id: 'logo-favicon', label: 'Logo and favicon' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'page-layout', label: 'Page layout' },
  { id: 'animations', label: 'Animations' },
  { id: 'badges', label: 'Badges' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cart', label: 'Cart' },
  { id: 'drawers', label: 'Drawers' },
  { id: 'icons', label: 'Icons' },
  { id: 'input-fields', label: 'Input fields' },
  { id: 'popovers-modals', label: 'Popovers and modals' },
  { id: 'prices', label: 'Prices' },
  { id: 'product-cards', label: 'Product cards' },
  { id: 'search', label: 'Search' },
  { id: 'swatches', label: 'Swatches' },
  { id: 'variant-pickers', label: 'Variant pickers' },
  { id: 'custom-css', label: 'Custom CSS' },
  { id: 'theme-style', label: 'Theme style', infoOnly: true },
];
