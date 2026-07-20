import catalogJson from './section-element-catalog.json';
import type { SectionCatalogElement, SectionElementCatalog } from './section-element-catalog.types';

export const sectionElementCatalog = catalogJson as SectionElementCatalog;

export function getSectionElementCatalog(): SectionElementCatalog {
  return sectionElementCatalog;
}

export function getCatalogElementById(id: string): SectionCatalogElement | undefined {
  return sectionElementCatalog.elements.find((e) => e.id === id);
}

export function getEditingForCatalogElement(catalogId: string) {
  const el = getCatalogElementById(catalogId);
  if (!el) return null;
  return el.editing ?? sectionElementCatalog.sectionTypes[el.sectionType] ?? null;
}

export function listAddSectionElements(group?: 'header' | 'template' | 'footer'): SectionCatalogElement[] {
  const items = sectionElementCatalog.elements.filter((e) => e.availableInAddSection);
  if (!group) return items;
  return items.filter((e) => e.catalogGroup === group);
}

export function listSectionTypes(): string[] {
  return Object.keys(sectionElementCatalog.sectionTypes);
}
