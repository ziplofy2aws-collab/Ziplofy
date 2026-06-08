import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import type { ThemePreviewPage } from '../chrome/CreateThemeLivePreview';

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
  dividerBefore?: boolean;
  hasSubmenu?: boolean;
  children?: ThemeEditorPageMenuItem[];
};

type MenuSeed = {
  previewPage: ThemePreviewPage;
  label: string;
  icon: ThemePageIcon;
  dividerBefore?: boolean;
  hasSubmenu?: boolean;
  children?: MenuSeed[];
};

import {
  allRegistryPageIds,
  registryLabel,
  THEME_PAGE_MENU_SEEDS,
} from './theme-page-registry';
import { previewPageToTemplateId } from '../../utils/preview-page-template';

export { previewPageToTemplateId };

/** Shopify-style online store page list — kept in sync via theme-page-registry. */
const SHOPIFY_PAGE_MENU: MenuSeed[] = THEME_PAGE_MENU_SEEDS as MenuSeed[];

function formatLabel(id: string): string {
  return registryLabel(id);
}

function iconForTemplate(id: string): ThemePageIcon {
  if (id === 'index') return 'home';
  if (id === 'product' || id === 'products') return 'product';
  if (id.includes('collection')) return 'collection';
  if (id.includes('blog')) return 'blog';
  if (id === 'cart') return 'cart';
  if (id === 'gift-card') return 'gift';
  if (id === 'checkout') return 'checkout';
  if (id === 'search') return 'search';
  if (id === 'password') return 'lock';
  if (id === 'login' || id === 'signup' || id === 'forgot_password') return 'login';
  if (id === 'profile' || id === 'preferences') return 'user';
  if (id === 'orders') return 'orders';
  return 'page';
}

function availableTemplateIds(
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null
): Set<string> {
  const schemaTemplates = editorSchema?.templates ?? [];
  const schemaIds = new Set(schemaTemplates.map((t) => t.id));
  const manifestIds = Array.isArray(manifest?.templates)
    ? (manifest.templates as unknown[]).map(String).filter(Boolean)
    : [];
  const rawIds =
    manifestIds.length > 0
      ? manifestIds.filter((id) => schemaIds.has(id))
      : schemaTemplates.map((t) => t.id);
  return new Set(rawIds.length ? rawIds : ['index']);
}

function templateForPreviewPage(page: ThemePreviewPage): string {
  return previewPageToTemplateId(page);
}

const SHOPIFY_PREVIEW_PAGES = allRegistryPageIds();

function pageAllowed(page: ThemePreviewPage, available: Set<string>): boolean {
  if (SHOPIFY_PREVIEW_PAGES.has(page)) return true;
  return available.has(templateForPreviewPage(page));
}

function seedToItem(seed: MenuSeed, available: Set<string>): ThemeEditorPageMenuItem | null {
  const children = seed.children
    ?.map((c) => seedToItem(c, available))
    .filter((c): c is ThemeEditorPageMenuItem => Boolean(c));

  const selfOk = pageAllowed(seed.previewPage, available);
  const hasVisibleChildren = Boolean(children?.length);

  if (!selfOk && !hasVisibleChildren) return null;
  if (!selfOk && hasVisibleChildren) {
    return {
      menuId: `page:${seed.previewPage}`,
      previewPage: children![0]!.previewPage,
      label: seed.label,
      icon: seed.icon,
      dividerBefore: seed.dividerBefore,
      hasSubmenu: true,
      children,
    };
  }

  return {
    menuId: `page:${seed.previewPage}`,
    previewPage: seed.previewPage,
    label: seed.label,
    icon: seed.icon,
    dividerBefore: seed.dividerBefore,
    hasSubmenu: seed.hasSubmenu && hasVisibleChildren,
    children: hasVisibleChildren ? children : undefined,
  };
}

function appendManifestOnlyPages(
  items: ThemeEditorPageMenuItem[],
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null,
  available: Set<string>
): ThemeEditorPageMenuItem[] {
  const listed = new Set<string>();
  const walk = (list: ThemeEditorPageMenuItem[]) => {
    for (const item of list) {
      listed.add(item.previewPage);
      item.children?.forEach((c) => listed.add(c.previewPage));
    }
  };
  walk(items);

  const schemaTemplates = editorSchema?.templates ?? [];
  const extras: ThemeEditorPageMenuItem[] = [];
  for (const id of available) {
    if (listed.has(id)) continue;
    if (SHOPIFY_PAGE_MENU.some((s) => s.previewPage === id)) continue;
    extras.push({
      menuId: `page:${id}`,
      previewPage: id,
      label: schemaTemplates.find((t) => t.id === id)?.label ?? formatLabel(id),
      icon: iconForTemplate(id),
      dividerBefore: extras.length === 0 && items.length > 0,
    });
    listed.add(id);
  }
  return extras.length ? [...items, ...extras] : items;
}

export function buildThemeEditorPageMenu(
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null
): ThemeEditorPageMenuItem[] {
  const available = availableTemplateIds(manifest, editorSchema);
  const items = SHOPIFY_PAGE_MENU.map((seed) => seedToItem(seed, available)).filter(
    (item): item is ThemeEditorPageMenuItem => Boolean(item)
  );
  return appendManifestOnlyPages(items, manifest, editorSchema, available);
}

export function flattenPageMenuItems(items: ThemeEditorPageMenuItem[]): ThemeEditorPageMenuItem[] {
  const out: ThemeEditorPageMenuItem[] = [];
  const walk = (list: ThemeEditorPageMenuItem[]) => {
    for (const item of list) {
      out.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return out;
}

export function findPageMenuItemByPreview(
  items: ThemeEditorPageMenuItem[],
  previewPage: ThemePreviewPage
): ThemeEditorPageMenuItem | undefined {
  return flattenPageMenuItems(items).find((i) => i.previewPage === previewPage);
}

export type VisiblePageMenuRow =
  | { type: 'divider'; key: string }
  | {
      type: 'item';
      item: ThemeEditorPageMenuItem;
      depth: number;
      showChevron: boolean;
    };

export function buildVisiblePageMenuRows(
  items: ThemeEditorPageMenuItem[],
  query: string,
  expandedMenus: Set<string>
): VisiblePageMenuRow[] {
  const q = query.trim().toLowerCase();
  const rows: VisiblePageMenuRow[] = [];

  const itemMatches = (item: ThemeEditorPageMenuItem) =>
    !q || item.label.toLowerCase().includes(q);

  const walk = (list: ThemeEditorPageMenuItem[], depth: number) => {
    for (const item of list) {
      const childMatches =
        item.children?.filter((c) => itemMatches(c)) ??
        ([] as ThemeEditorPageMenuItem[]);
      const selfMatches = itemMatches(item);
      const expanded = expandedMenus.has(item.menuId);
      const showChildren =
        item.children?.length &&
        (expanded || (q.length > 0 && childMatches.length > 0));

      if (q) {
        if (selfMatches) {
          rows.push({
            type: 'item',
            item,
            depth,
            showChevron: Boolean(item.children?.length),
          });
        }
        if (showChildren) {
          for (const child of childMatches) {
            rows.push({ type: 'item', item: child, depth: depth + 1, showChevron: false });
          }
        }
        continue;
      }

      if (item.dividerBefore && rows.length > 0) {
        rows.push({ type: 'divider', key: `div-${item.menuId}` });
      }

      rows.push({
        type: 'item',
        item,
        depth,
        showChevron: Boolean(item.hasSubmenu && item.children?.length),
      });

      if (showChildren && item.children) {
        for (const child of item.children) {
          rows.push({ type: 'item', item: child, depth: depth + 1, showChevron: false });
        }
      }
    }
  };

  walk(items, 0);
  return rows;
}

/** @deprecated Use buildVisiblePageMenuRows */
export function filterPageMenuItems(
  items: ThemeEditorPageMenuItem[],
  query: string,
  expandedGroups: Set<string>
): ThemeEditorPageMenuItem[] {
  return flattenPageMenuItems(items).filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.label.toLowerCase().includes(q);
  });
}
