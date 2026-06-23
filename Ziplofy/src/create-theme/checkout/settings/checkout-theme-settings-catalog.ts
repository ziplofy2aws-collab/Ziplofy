/** Shopify-style checkout profile settings groups (display catalog). */

export type CheckoutThemeSettingsCatalogItem = {
  id: string;
  label: string;
};

export const CHECKOUT_THEME_SETTINGS_CATALOG: CheckoutThemeSettingsCatalogItem[] = [
  { id: 'logo', label: 'Logo' },
  { id: 'color-palette', label: 'Color palette' },
  { id: 'main', label: 'Main' },
  { id: 'header', label: 'Header' },
  { id: 'order-summary', label: 'Order Summary' },
  { id: 'accent-and-buttons', label: 'Accent and buttons' },
  { id: 'input-fields', label: 'Input fields' },
  { id: 'typography', label: 'Typography' },
];
