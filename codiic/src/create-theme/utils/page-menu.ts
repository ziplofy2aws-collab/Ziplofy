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
  openInNewTab?: boolean;
  children?: ThemeEditorPageMenuItem[];
};

type MenuSeed = {
  previewPage: ThemePreviewPage;
  label: string;
  icon: ThemePageIcon;
  dividerBefore?: boolean;
  hasSubmenu?: boolean;
  openInNewTab?: boolean;
  children?: MenuSeed[];
};

import {
  allRegistryPageIds,
  THEME_PAGE_MENU_SEEDS,
} from './theme-page-registry';
import {
  isProductTemplatePreviewPage,
  productTemplateDisplayName,
} from './product-templates.util';
import {
  collectionTemplateDisplayName,
  isCollectionTemplatePreviewPage,
} from './collection-templates.util';
import {
  blogPostsTemplateDisplayName,
  blogsTemplateDisplayName,
  isBlogPostsTemplatePreviewPage,
  isBlogsTemplatePreviewPage,
} from './blog-templates.util';
import {
  isPageTemplatePreviewPage,
  pageTemplateDisplayName,
} from './page-templates.util';
import { previewPageToTemplateId } from '../../utils/preview-page-template';

export { previewPageToTemplateId };

/** Shopify-style online store page list — kept in sync via theme-page-registry. */
const SHOPIFY_PAGE_MENU: MenuSeed[] = THEME_PAGE_MENU_SEEDS as MenuSeed[];

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
      openInNewTab: seed.openInNewTab,
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
    openInNewTab: seed.openInNewTab,
    children: hasVisibleChildren ? children : undefined,
  };
}

export function buildThemeEditorPageMenu(
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null
): ThemeEditorPageMenuItem[] {
  const available = availableTemplateIds(manifest, editorSchema);
  return SHOPIFY_PAGE_MENU.map((seed) => seedToItem(seed, available)).filter(
    (item): item is ThemeEditorPageMenuItem => Boolean(item)
  );
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

export function findPageMenuItemByPreviewWithConfig(
  items: ThemeEditorPageMenuItem[],
  previewPage: ThemePreviewPage,
  config: Record<string, unknown> | null
): ThemeEditorPageMenuItem | undefined {
  if (isProductTemplatePreviewPage(previewPage)) {
    const label = productTemplateDisplayName(config, previewPage);
    if (label) {
      return {
        menuId: `page:${previewPage}`,
        previewPage,
        label,
        icon: 'product',
      };
    }
  }
  if (isCollectionTemplatePreviewPage(previewPage)) {
    const label = collectionTemplateDisplayName(config, previewPage);
    if (label) {
      return {
        menuId: `page:${previewPage}`,
        previewPage,
        label,
        icon: 'collection',
      };
    }
  }
  if (isBlogsTemplatePreviewPage(previewPage)) {
    const label = blogsTemplateDisplayName(config, previewPage);
    if (label) {
      return {
        menuId: `page:${previewPage}`,
        previewPage,
        label,
        icon: 'blog',
      };
    }
  }
  if (isBlogPostsTemplatePreviewPage(previewPage)) {
    const label = blogPostsTemplateDisplayName(config, previewPage);
    if (label) {
      return {
        menuId: `page:${previewPage}`,
        previewPage,
        label,
        icon: 'blog',
      };
    }
  }
  if (isPageTemplatePreviewPage(previewPage)) {
    const label = pageTemplateDisplayName(config, previewPage);
    if (label) {
      return {
        menuId: `page:${previewPage}`,
        previewPage,
        label,
        icon: 'page',
      };
    }
  }
  return findPageMenuItemByPreview(items, previewPage);
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
