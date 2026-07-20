import { announcementBarElement } from './announcement-bar';
import { headerElement } from './header';
import { dividerElement } from './divider';
import { footerElement } from './footer';
import { policiesLinksElement } from './policies-links';
import {
  GENERATED_CREATE_THEME_ELEMENTS,
  GENERATED_SECTION_TYPE_TO_ELEMENT_ID,
} from './registry.generated';
import { CREATE_THEME_CATALOG_GROUPS } from './catalog-groups';
import type {
  CreateThemeCatalogGroup,
  CreateThemeCatalogListItem,
  CreateThemeElement,
} from './types';

/** Hand-tuned elements override generated stubs. */
const HANDCRAFTED_OVERRIDES: Record<string, CreateThemeElement> = {
  'announcement-bar': announcementBarElement,
  header: headerElement,
  divider: dividerElement,
  footer: footerElement,
  'policies-links': policiesLinksElement,
};

export const CREATE_THEME_ELEMENTS: Record<string, CreateThemeElement> = {
  ...GENERATED_CREATE_THEME_ELEMENTS,
  ...HANDCRAFTED_OVERRIDES,
};

export const SECTION_TYPE_TO_ELEMENT_ID: Record<string, string> = {
  ...GENERATED_SECTION_TYPE_TO_ELEMENT_ID,
  'footer-utilities': 'policies-links',
};

export { CREATE_THEME_CATALOG_GROUPS };

export function getCreateThemeElement(id: string): CreateThemeElement | undefined {
  return CREATE_THEME_ELEMENTS[id];
}

export function getElementForSectionType(sectionType: string): CreateThemeElement | undefined {
  const id = SECTION_TYPE_TO_ELEMENT_ID[sectionType];
  return id ? CREATE_THEME_ELEMENTS[id] : undefined;
}

export function listCreateThemeCatalogItems(group: CreateThemeCatalogGroup): CreateThemeCatalogListItem[] {
  const groupDef = CREATE_THEME_CATALOG_GROUPS[group];
  if (!groupDef) return [];

  const out: CreateThemeCatalogListItem[] = [];

  const push = (
    elementId: string,
    categoryId: string | null,
    categoryLabel: string | null,
    standalone: boolean
  ) => {
    const element = getCreateThemeElement(elementId);
    if (!element) {
      console.warn(`[create-theme] missing element folder: ${elementId}`);
      return;
    }
    out.push({ element, categoryId, categoryLabel, standalone });
  };

  for (const elementId of groupDef.standalone ?? []) {
    push(elementId, null, null, true);
  }

  for (const categoryId of groupDef.categoryOrder) {
    const category = groupDef.categories[categoryId];
    if (!category) continue;
    for (const elementId of category.itemIds) {
      push(elementId, categoryId, category.label, false);
    }
  }

  return out;
}

export function filterCreateThemeCatalogItems(
  items: CreateThemeCatalogListItem[],
  query: string
): CreateThemeCatalogListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(({ element }) => {
    const hay = [element.label, element.previewCaption ?? '', ...(element.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

export function createThemeGroupLabel(group: CreateThemeCatalogGroup): string {
  if (group === 'header') return 'Header';
  if (group === 'footer') return 'Footer';
  return 'Template';
}
