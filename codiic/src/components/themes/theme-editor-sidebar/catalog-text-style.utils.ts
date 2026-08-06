import type { EditorFieldDef } from './theme-editor-sidebar.types';
import { isCatalogImageStyleCompanionPath } from './catalog-image-style.utils';

/** Keep in sync with `catalog-button-style.utils` (avoid circular import). */
const CATALOG_BUTTON_STYLE_COMPANION_SUFFIXES = [
  'Background',
  'Text',
  'Border',
  'BorderThickness',
  'CornerRadius',
  'Font',
  'TextCase',
] as const;

/** Companion suffixes for catalog `styled-text` fields (remote themes). */
export const CATALOG_TEXT_STYLE_SUFFIXES = [
  'FontSize',
  'TextColor',
  'BackgroundColor',
  'TextCase',
  'LetterSpacing',
] as const;

export type CatalogTextStyleSuffix = (typeof CATALOG_TEXT_STYLE_SUFFIXES)[number];

export function catalogTextStyleCompanionKey(textKey: string, suffix: CatalogTextStyleSuffix): string {
  return `${textKey}${suffix}`;
}

/** Last segment of a config path, e.g. `…settings.heading` → `heading`. */
export function fieldPathLeaf(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 1] || '';
}

export function fieldPathParent(path: string): string {
  const i = path.lastIndexOf('.');
  return i >= 0 ? path.slice(0, i) : '';
}

export function isCatalogTextStyleCompanionPath(path: string): boolean {
  const leaf = fieldPathLeaf(path);
  return CATALOG_TEXT_STYLE_SUFFIXES.some((suffix) => leaf.endsWith(suffix) && leaf.length > suffix.length);
}

/** Hide create-theme-style chrome that catalog remote themes should not expose. */
export const CATALOG_HIDDEN_SETTINGS_GROUPS = new Set([
  'Padding',
  'Layout',
  'Section layout',
  'Cards layout',
  'Size',
  'Custom CSS',
  'Theme settings',
  'Theme Settings',
]);

/** Layout / spacing / CSS leaves catalog themes must not expose (regardless of group). */
export const CATALOG_HIDDEN_FIELD_LEAVES = new Set([
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'customCss',
  'direction',
  'layoutAlignment',
  'layoutGap',
  'position',
  'mediaPosition',
  'textPosition',
  'contentPosition',
  'verticalOnMobile',
  'alignTextBaseline',
  'sectionWidth',
  'sectionLayout',
  'cardsLayoutType',
  'layoutType',
  'layoutMode',
]);

export function catalogTextStyleCompanionPaths(textFieldPath: string): Record<CatalogTextStyleSuffix, string> {
  const parent = fieldPathParent(textFieldPath);
  const key = fieldPathLeaf(textFieldPath);
  const out = {} as Record<CatalogTextStyleSuffix, string>;
  for (const suffix of CATALOG_TEXT_STYLE_SUFFIXES) {
    out[suffix] = parent ? `${parent}.${key}${suffix}` : `${key}${suffix}`;
  }
  return out;
}

/**
 * Infer editor field type for catalog styled-text companions (not declared in schema).
 * Use `text` for numeric companions so empty string can mean “cleared / Auto”.
 */
export function resolveCatalogTextStyleCompanionType(path: string): string | undefined {
  if (!isCatalogTextStyleCompanionPath(path)) return undefined;
  const leaf = fieldPathLeaf(path);
  if (leaf.endsWith('BackgroundEnabled')) return 'boolean';
  return 'text';
}

/** Schema field entries for every companion of a `styled-text` content path. */
export function catalogStyledTextCompanionFieldPaths(
  textFieldPath: string
): Array<{ path: string; type: string; label: string }> {
  const companions = catalogTextStyleCompanionPaths(textFieldPath);
  return CATALOG_TEXT_STYLE_SUFFIXES.map((suffix) => {
    const path = companions[suffix];
    return {
      path,
      type: resolveCatalogTextStyleCompanionType(path) ?? 'text',
      label: path,
    };
  });
}

export function filterCatalogSettingsFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return fields.filter((field) => {
    if (field.group && CATALOG_HIDDEN_SETTINGS_GROUPS.has(field.group)) return false;
    if (isCatalogTextStyleCompanionPath(field.path)) return false;
    if (isCatalogImageStyleCompanionPath(field.path)) return false;
    {
      const leaf = fieldPathLeaf(field.path);
      if (
        CATALOG_BUTTON_STYLE_COMPANION_SUFFIXES.some(
          (suffix) => leaf.endsWith(suffix) && leaf.length > suffix.length
        )
      ) {
        return false;
      }
    }
    const leaf = fieldPathLeaf(field.path);
    if (CATALOG_HIDDEN_FIELD_LEAVES.has(leaf)) return false;
    if (field.widget === 'accordion' && leaf.toLowerCase().includes('css')) return false;
    return true;
  });
}
