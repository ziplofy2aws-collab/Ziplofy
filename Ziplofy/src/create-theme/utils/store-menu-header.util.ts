import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { setConfigAtPath } from '../../utils/theme-editor-config.utils';

export type HeaderMenuNavItem = { label: string; href: string };

const RAW_LINK_TYPE_LABELS = new Set([
  'specific-collection',
  'specific-product',
  'all-collections',
  'all-products',
  'homepage',
  'custom',
]);

export function menuItemsPathFromMenuFieldPath(menuFieldPath: string): string {
  return menuFieldPath.replace(/\.menu$/, '.items');
}

function resolveHeaderNavLabel(item: StoreMenuItem): string {
  const direct = item.label?.trim() ?? '';
  if (direct && !RAW_LINK_TYPE_LABELS.has(direct)) return direct;

  const collectionTitle = item.collection?.title?.trim();
  if (collectionTitle) return collectionTitle;

  const productTitle = item.product?.title?.trim();
  if (productTitle) return productTitle;

  switch (item.linkType) {
    case 'homepage':
      return 'Home page';
    case 'all-collections':
      return 'Collections';
    case 'all-products':
      return 'Products';
    case 'specific-collection':
      return collectionTitle || 'Collection';
    case 'specific-product':
      return productTitle || 'Product';
    case 'custom':
      return direct || item.link?.trim() || 'Link';
    default:
      return direct || 'Link';
  }
}

export function headerNavItemsFromStoreMenuItems(items: StoreMenuItem[]): HeaderMenuNavItem[] {
  return items
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((item) => ({
      label: resolveHeaderNavLabel(item),
      href: item.href?.trim() || '/',
    }))
    .filter((row) => row.label);
}

export function valuePathsForHeaderMenuItems(
  itemsPath: string,
  items: HeaderMenuNavItem[]
): Record<string, string> {
  const out: Record<string, string> = {};
  items.forEach((item, index) => {
    out[`${itemsPath}.${index}.label`] = item.label;
    out[`${itemsPath}.${index}.href`] = item.href;
  });
  return out;
}

/**
 * Drop stale `items.{n}.label|href` flat values beyond the applied menu length.
 * Without this, applyValuesToThemeConfig re-expands the items array from leftover
 * schema paths (e.g. items.2 / items.3) and phantom links reappear in the header.
 */
export function pruneStaleHeaderMenuItemValues(
  values: Record<string, string | boolean>,
  itemsPath: string,
  keepCount: number
): Record<string, string | boolean> {
  const prefix = `${itemsPath}.`;
  const next: Record<string, string | boolean> = { ...values };
  for (const key of Object.keys(next)) {
    if (!key.startsWith(prefix)) continue;
    const rest = key.slice(prefix.length);
    const match = rest.match(/^(\d+)\.(label|href)$/);
    if (!match) continue;
    if (Number(match[1]) >= keepCount) {
      delete next[key];
    }
  }
  return next;
}

function syncMenuNestedBlockOrder(
  config: Record<string, unknown>,
  menuFieldPath: string,
  itemCount: number
): void {
  // sections.header.blocks.menu.settings.menu → sections.header.blocks.menu
  const blockBase = menuFieldPath.replace(/\.settings\.menu$/, '');
  if (blockBase === menuFieldPath) return;
  const nestedIds = Array.from({ length: itemCount }, (_, index) =>
    index === 0
      ? 'link_shop'
      : index === 1
        ? 'link_collections'
        : index === 2
          ? 'link_about'
          : index === 3
            ? 'link_account'
            : `link_${index}`
  );
  setConfigAtPath(config, `${blockBase}.nested_block_order`, nestedIds);
}

export function applyStoreMenuSelectionToConfig(
  config: Record<string, unknown>,
  menuFieldPath: string,
  menu: Pick<StoreMenu, '_id' | 'menuName'>,
  items: StoreMenuItem[]
): {
  config: Record<string, unknown>;
  menuId: string;
  menuName: string;
  itemsPath: string;
  navItemCount: number;
  itemValuePaths: Record<string, string>;
} {
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const navItems = headerNavItemsFromStoreMenuItems(items);
  const itemsPath = menuItemsPathFromMenuFieldPath(menuFieldPath);

  setConfigAtPath(next, menuFieldPath, menu._id);
  setConfigAtPath(next, `${menuFieldPath.replace(/\.menu$/, '.menuName')}`, menu.menuName);
  setConfigAtPath(next, itemsPath, navItems);
  syncMenuNestedBlockOrder(next, menuFieldPath, navItems.length);

  return {
    config: next,
    menuId: menu._id,
    menuName: menu.menuName,
    itemsPath,
    navItemCount: navItems.length,
    itemValuePaths: {
      ...valuePathsForHeaderMenuItems(itemsPath, navItems),
      [menuFieldPath]: menu._id,
      [`${menuFieldPath.replace(/\.menu$/, '.menuName')}`]: menu.menuName,
    },
  };
}

export function storeMenuLabelFromValue(
  menuValue: string,
  menus: Pick<StoreMenu, '_id' | 'menuName'>[]
): string | undefined {
  const trimmed = menuValue.trim();
  if (!trimmed) return undefined;
  const match = menus.find((m) => m._id === trimmed);
  if (match) return match.menuName;
  return undefined;
}
