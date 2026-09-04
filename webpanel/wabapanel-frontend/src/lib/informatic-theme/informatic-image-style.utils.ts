/** Image style companion paths for Informatic theme editor (Editable elements.md). */

export const INFORMATIC_IMAGE_STYLE_SUFFIXES = [
  'CornerRadius',
  'OverlayColor',
  'OverlayOpacity',
  'GradientEnabled',
  'GradientFrom',
  'GradientTo',
  'GradientDirection',
] as const;

export type InformaticImageStyleSuffix = (typeof INFORMATIC_IMAGE_STYLE_SUFFIXES)[number];

export function fieldPathLeaf(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 1] || '';
}

export function fieldPathParent(path: string): string {
  const i = path.lastIndexOf('.');
  return i >= 0 ? path.slice(0, i) : '';
}

/**
 * Base key for image companions.
 * `mediaImageUrl` → `media`; `tileAImageUrl` → `tileA`; bare `hero` → `hero`.
 */
export function informaticImageBaseKey(imageFieldPath: string): string {
  const leaf = fieldPathLeaf(imageFieldPath);
  if (leaf.endsWith('ImageUrl') && leaf.length > 'ImageUrl'.length) {
    return leaf.slice(0, -'ImageUrl'.length);
  }
  if (leaf.endsWith('LogoUrl') && leaf.length > 'LogoUrl'.length) {
    return leaf.slice(0, -'LogoUrl'.length);
  }
  return leaf;
}

export function informaticImageStyleCompanionPaths(
  imageFieldPath: string
): Record<InformaticImageStyleSuffix, string> {
  const parent = fieldPathParent(imageFieldPath);
  const base = informaticImageBaseKey(imageFieldPath);
  const out = {} as Record<InformaticImageStyleSuffix, string>;
  for (const suffix of INFORMATIC_IMAGE_STYLE_SUFFIXES) {
    out[suffix] = parent ? `${parent}.${base}${suffix}` : `${base}${suffix}`;
  }
  return out;
}

export function isInformaticImageStyleCompanionPath(path: string): boolean {
  const leaf = fieldPathLeaf(path);
  return INFORMATIC_IMAGE_STYLE_SUFFIXES.some(
    (suffix) => leaf.endsWith(suffix) && leaf.length > suffix.length
  );
}

export function isInformaticImageWidgetField(field: { path: string; widget?: string }): boolean {
  if (field.widget === 'image') return true;
  const leaf = fieldPathLeaf(field.path);
  return (
    leaf.endsWith('ImageUrl') ||
    leaf === 'imageUrl' ||
    leaf.endsWith('LogoUrl') ||
    leaf.endsWith('logoUrl')
  );
}
