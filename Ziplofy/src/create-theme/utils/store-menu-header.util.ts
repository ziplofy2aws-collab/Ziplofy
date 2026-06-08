import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { setConfigAtPath } from '../../utils/theme-editor-config.utils';

export type HeaderMenuNavItem = { label: string; href: string };

export function menuItemsPathFromMenuFieldPath(menuFieldPath: string): string {
  return menuFieldPath.replace(/\.menu$/, '.items');
}

export function headerNavItemsFromStoreMenuItems(items: StoreMenuItem[]): HeaderMenuNavItem[] {
  return items
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((item) => ({
      label: item.label?.trim() || 'Link',
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

export function applyStoreMenuSelectionToConfig(
  config: Record<string, unknown>,
  menuFieldPath: string,
  menu: Pick<StoreMenu, '_id' | 'menuName'>,
  items: StoreMenuItem[]
): {
  config: Record<string, unknown>;
  menuId: string;
  menuName: string;
  itemValuePaths: Record<string, string>;
} {
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const navItems = headerNavItemsFromStoreMenuItems(items);
  const itemsPath = menuItemsPathFromMenuFieldPath(menuFieldPath);

  setConfigAtPath(next, menuFieldPath, menu._id);
  setConfigAtPath(next, `${menuFieldPath.replace(/\.menu$/, '.menuName')}`, menu.menuName);
  setConfigAtPath(next, itemsPath, navItems);

  return {
    config: next,
    menuId: menu._id,
    menuName: menu.menuName,
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
