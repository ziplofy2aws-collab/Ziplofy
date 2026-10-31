import type { EditorFieldDef } from './theme-editor-sidebar.types';
import { fieldPathLeaf, fieldPathParent } from './catalog-text-style.utils';

/** Companion suffixes for catalog `image` fields (Editable elements.md). */
export const CATALOG_IMAGE_STYLE_SUFFIXES = [
  'CornerRadius',
  'OverlayColor',
  'OverlayOpacity',
  'GradientEnabled',
  'GradientFrom',
  'GradientTo',
  'GradientDirection',
] as const;

export type CatalogImageStyleSuffix = (typeof CATALOG_IMAGE_STYLE_SUFFIXES)[number];

/**
 * Base key for image companions.
 * `mediaImageUrl` → `media`; `tileAImageUrl` → `tileA`; bare `hero` → `hero`.
 */
export function catalogImageBaseKey(imageFieldPath: string): string {
  const leaf = fieldPathLeaf(imageFieldPath);
  if (leaf.endsWith('ImageUrl') && leaf.length > 'ImageUrl'.length) {
    return leaf.slice(0, -'ImageUrl'.length);
  }
  return leaf;
}

export function catalogImageStyleCompanionPaths(
  imageFieldPath: string
): Record<CatalogImageStyleSuffix, string> {
  const parent = fieldPathParent(imageFieldPath);
  const base = catalogImageBaseKey(imageFieldPath);
  const out = {} as Record<CatalogImageStyleSuffix, string>;
  for (const suffix of CATALOG_IMAGE_STYLE_SUFFIXES) {
    out[suffix] = parent ? `${parent}.${base}${suffix}` : `${base}${suffix}`;
  }
  return out;
}

export function isCatalogImageStyleCompanionPath(path: string): boolean {
  const leaf = fieldPathLeaf(path);
  return CATALOG_IMAGE_STYLE_SUFFIXES.some(
    (suffix) => leaf.endsWith(suffix) && leaf.length > suffix.length
  );
}

export function resolveCatalogImageStyleCompanionType(path: string): string | undefined {
  if (!isCatalogImageStyleCompanionPath(path)) return undefined;
  const leaf = fieldPathLeaf(path);
  if (leaf.endsWith('GradientEnabled')) return 'boolean';
  if (leaf.endsWith('CornerRadius') || leaf.endsWith('OverlayOpacity')) return 'text';
  return 'text';
}

export function catalogImageStyleCompanionFieldPaths(
  imageFieldPath: string
): Array<{ path: string; type: string; label: string }> {
  const companions = catalogImageStyleCompanionPaths(imageFieldPath);
  return CATALOG_IMAGE_STYLE_SUFFIXES.map((suffix) => {
    const path = companions[suffix];
    return {
      path,
      type: resolveCatalogImageStyleCompanionType(path) ?? 'text',
      label: path,
    };
  });
}

/** Whether a schema field is a catalog image slot (widget or ImageUrl leaf). */
export function isCatalogImageWidgetField(field: Pick<EditorFieldDef, 'path' | 'widget'>): boolean {
  if (field.widget === 'image') return true;
  const leaf = fieldPathLeaf(field.path);
  return leaf.endsWith('ImageUrl') || leaf === 'imageUrl' || leaf.endsWith('LogoUrl');
}
