import { setConfigPath } from '@/lib/informatic-theme/load-static-pack';
import type { StoreMenu, StoreMenuItem } from '@/lib/store-menu';

export type HeaderMenuNavItem = { label: string; href: string };

const RAW_LINK_TYPE_LABELS = new Set([
  'homepage',
  'search',
  'all-blogs',
  'specific-page',
  'specific-blog',
  'specific-blog-post',
  'lead-gen-form',
  'custom',
]);

export function menuItemsPathFromMenuFieldPath(menuFieldPath: string): string {
  return menuFieldPath.replace(/\.menu$/, '.items');
}

function resolveHeaderNavLabel(item: StoreMenuItem): string {
  const direct = item.label?.trim() ?? '';
  if (direct && !RAW_LINK_TYPE_LABELS.has(direct)) return direct;

  if (item.page?.title?.trim()) return item.page.title.trim();
  if (item.blog?.title?.trim()) return item.blog.title.trim();
  if (item.blogPost?.title?.trim()) return item.blogPost.title.trim();
  if (item.form?.name?.trim()) return item.form.name.trim();

  switch (item.linkType) {
    case 'homepage':
      return 'Home page';
    case 'search':
      return 'Search';
    case 'all-blogs':
      return 'Blog';
    case 'specific-page':
      return item.page?.title?.trim() || 'Page';
    case 'specific-blog':
      return item.blog?.title?.trim() || 'Blog';
    case 'specific-blog-post':
      return item.blogPost?.title?.trim() || 'Article';
    case 'lead-gen-form':
      return item.form?.name?.trim() || 'Form';
    case 'custom':
      return direct || item.link?.trim() || item.href?.trim() || 'Link';
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
      href: item.href?.trim() || item.link?.trim() || '/',
    }))
    .filter((row) => row.label);
}

export function applyStoreMenuSelectionToConfig(
  config: Record<string, unknown>,
  menuFieldPath: string,
  menu: Pick<StoreMenu, '_id' | 'menuName'>,
  items: StoreMenuItem[]
): Record<string, unknown> {
  const navItems = headerNavItemsFromStoreMenuItems(items);
  const itemsPath = menuItemsPathFromMenuFieldPath(menuFieldPath);
  const menuId = String(menu._id);
  const menuName = String(menu.menuName ?? '');

  let next = structuredClone(config) as Record<string, unknown>;
  next = setConfigPath(next, menuFieldPath, menuId);
  next = setConfigPath(next, menuFieldPath.replace(/\.menu$/, '.menuName'), menuName);
  next = setConfigPath(next, itemsPath, navItems);
  return next;
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

export function isStoreMenuFieldPath(path: string): boolean {
  return /\.settings\.menu$/.test(path);
}
