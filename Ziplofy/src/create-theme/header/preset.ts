/** Apply storefront-style defaults when a header section is inserted. */
export function applyHeaderPreset(section: Record<string, unknown>): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.customerAccountMenu = settings.customerAccountMenu ?? 'customer-account';
  settings.searchIcon = settings.searchIcon ?? true;
  settings.searchPosition = settings.searchPosition ?? 'right';
  settings.searchRow = settings.searchRow ?? 'top';
  settings.menuStyle = settings.menuStyle ?? 'icons';
  settings.countryRegionEnabled = false;
  settings.languageSelectorEnabled = false;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.headerHeight = settings.headerHeight ?? 'standard';
  settings.stickyMode = settings.stickyMode ?? 'always';
  settings.borderThickness = settings.borderThickness ?? 1;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, { settings?: Record<string, unknown> }>;
  const logo = blocks.logo?.settings ?? {};
  logo.text = logo.text ?? 'My Store';
  logo.tagline = '';
  logo.position = logo.position ?? 'left';
  logo.hideLogoOnHomePage = logo.hideLogoOnHomePage ?? false;
  logo.paddingTop = logo.paddingTop ?? 0;
  logo.paddingBottom = logo.paddingBottom ?? 0;
  if (blocks.logo) blocks.logo.settings = logo;

  const menu = blocks.menu?.settings ?? {};
  menu.position = menu.position ?? 'left';
  menu.row = '';
  menu.position = menu.position ?? 'left';
  menu.menu = menu.menu ?? 'main-menu';
  menu.topLevelSize = menu.topLevelSize ?? '14px';
  menu.font = menu.font ?? 'body';
  menu.textCase = menu.textCase ?? 'default';
  menu.items = menu.items ?? [
    { label: 'Home', href: '/' },
    { label: 'Catalog', href: '/products' },
    { label: 'Contact', href: '/#contact' },
  ];
  if (blocks.menu) blocks.menu.settings = menu;

  section.blocks = blocks;
  if (!Array.isArray(section.block_order)) {
    section.block_order = ['logo', 'menu'];
  }
}
