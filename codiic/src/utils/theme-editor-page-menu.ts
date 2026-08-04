import type { EditorSchemaDoc } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import type { ThemePreviewPage } from '../components/themes/ThemeLivePreviewFrame';

export type ThemePageIcon =
  | 'home'
  | 'product'
  | 'collection'
  | 'page'
  | 'blog'
  | 'cart'
  | 'gift'
  | 'checkout'
  | 'search'
  | 'lock'
  | 'user'
  | 'orders'
  | 'login';

export type ThemeEditorPageMenuItem = {
  menuId: string;
  previewPage: ThemePreviewPage;
  label: string;
  icon: ThemePageIcon;
  isGroup?: boolean;
  parentId?: string;
  hasSubmenu?: boolean;
};

const DEFAULT_LABELS: Record<string, string> = {
  index: 'Home page',
  product: 'Product page',
  search: 'Search',
  collections_list: 'Collections list',
  all_products: 'All products',
  collection: 'Collection',
  all_blogs: 'All blogs',
  blogs: 'Blog',
  blog_posts: 'Blog post',
  pages: 'Pages',
  '404': '404 page',
  cart: 'Cart',
  login: 'Login',
  signup: 'Sign up',
  forgot_password: 'Forgot password',
  profile: 'Profile',
  orders: 'Orders',
  order_details: 'Order details',
  preferences: 'Preferences',
};

/** Preferred order when manifest does not specify sequence. */
const PAGE_ORDER: string[] = [
  'index',
  'product',
  'search',
  'collections_list',
  'all_products',
  '404',
  'collection',
  'all_blogs',
  'blogs',
  'blog_posts',
  'pages',
  'cart',
  'login',
  'signup',
  'forgot_password',
  'profile',
  'orders',
  'order_details',
];

function formatLabel(id: string): string {
  return DEFAULT_LABELS[id] ?? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function iconForTemplate(id: string): ThemePageIcon {
  if (id === 'index') return 'home';
  if (id === 'product') return 'product';
  if (id === 'cart') return 'cart';
  if (id === 'login' || id === 'signup' || id === 'forgot_password') return 'login';
  if (id === 'profile' || id === 'preferences') return 'user';
  if (id === 'orders' || id === 'order_details') return 'orders';
  if (id.includes('collection')) return 'collection';
  if (id.includes('blog')) return 'blog';
  return 'page';
}

function sortPageIds(ids: string[]): string[] {
  const set = new Set(ids);
  const ordered: string[] = [];
  for (const id of PAGE_ORDER) {
    if (set.has(id)) {
      ordered.push(id);
      set.delete(id);
    }
  }
  for (const id of set) ordered.push(id);
  return ordered;
}

/**
 * Page menu driven by theme manifest + schema — only pages the theme declares are listed.
 */
export function buildThemeEditorPageMenu(
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null
): ThemeEditorPageMenuItem[] {
  const schemaTemplates = editorSchema?.templates ?? [];
  const schemaIds = new Set(schemaTemplates.map((t) => t.id));
  const manifestIds = Array.isArray(manifest?.templates)
    ? (manifest.templates as unknown[]).map(String).filter(Boolean)
    : [];

  const rawIds =
    manifestIds.length > 0
      ? manifestIds.filter((id) => schemaIds.has(id))
      : schemaTemplates.map((t) => t.id);

  const pageIds = sortPageIds([...new Set(rawIds.length ? rawIds : ['index'])]);

  // Always offer Pages so merchants can preview Online Store custom pages.
  if (!pageIds.includes('pages')) {
    const insertAt = pageIds.findIndex((id) => id === 'cart');
    if (insertAt >= 0) pageIds.splice(insertAt, 0, 'pages');
    else pageIds.push('pages');
  }

  const labelFor = (id: string) =>
    id === 'pages'
      ? 'Pages'
      : (schemaTemplates.find((t) => t.id === id)?.label ?? formatLabel(id));

  return pageIds.map((id) => ({
    menuId: `page:${id}`,
    previewPage: id,
    label: labelFor(id),
    icon: iconForTemplate(id),
  }));
}

export function previewPageToTemplateId(page: ThemePreviewPage): string {
  return page;
}

export function findPageMenuItemByPreview(
  items: ThemeEditorPageMenuItem[],
  previewPage: ThemePreviewPage
): ThemeEditorPageMenuItem | undefined {
  return items.find((i) => !i.isGroup && i.previewPage === previewPage);
}

export function filterPageMenuItems(
  items: ThemeEditorPageMenuItem[],
  query: string,
  _expandedGroups: Set<string>
): ThemeEditorPageMenuItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.filter((item) => !item.isGroup);
  return items.filter((item) => !item.isGroup && item.label.toLowerCase().includes(q));
}
