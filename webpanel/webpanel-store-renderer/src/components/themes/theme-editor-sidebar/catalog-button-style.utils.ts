import type { EditorFieldDef } from './theme-editor-sidebar.types';
import { fieldPathLeaf, fieldPathParent } from './catalog-text-style.utils';

/** Companion suffixes for catalog `button` fields (Editable elements.md). */
export const CATALOG_BUTTON_STYLE_SUFFIXES = [
  'Background',
  'Text',
  'Border',
  'BorderThickness',
  'CornerRadius',
  'Font',
  'TextCase',
] as const;

export type CatalogButtonStyleSuffix = (typeof CATALOG_BUTTON_STYLE_SUFFIXES)[number];

export function catalogButtonStyleCompanionPaths(
  buttonFieldPath: string
): Record<CatalogButtonStyleSuffix, string> {
  const parent = fieldPathParent(buttonFieldPath);
  const key = fieldPathLeaf(buttonFieldPath);
  const out = {} as Record<CatalogButtonStyleSuffix, string>;
  for (const suffix of CATALOG_BUTTON_STYLE_SUFFIXES) {
    out[suffix] = parent ? `${parent}.${key}${suffix}` : `${key}${suffix}`;
  }
  return out;
}

export function isCatalogButtonStyleCompanionPath(path: string): boolean {
  const leaf = fieldPathLeaf(path);
  return CATALOG_BUTTON_STYLE_SUFFIXES.some(
    (suffix) => leaf.endsWith(suffix) && leaf.length > suffix.length
  );
}

export function resolveCatalogButtonStyleCompanionType(path: string): string | undefined {
  if (!isCatalogButtonStyleCompanionPath(path)) return undefined;
  return 'text';
}

export function catalogButtonStyleCompanionFieldPaths(
  buttonFieldPath: string
): Array<{ path: string; type: string; label: string }> {
  const companions = catalogButtonStyleCompanionPaths(buttonFieldPath);
  return CATALOG_BUTTON_STYLE_SUFFIXES.map((suffix) => {
    const path = companions[suffix];
    return {
      path,
      type: resolveCatalogButtonStyleCompanionType(path) ?? 'text',
      label: path,
    };
  });
}

export function isCatalogButtonWidgetField(field: Pick<EditorFieldDef, 'path' | 'widget'>): boolean {
  return field.widget === 'button';
}
