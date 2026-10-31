import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { layoutBlueprintKey, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

/** Shopify Horizon logo section settings order. */
export const STORYTELLING_LOGO_PANEL_GROUP_ORDER = [
  'Content',
  'Typography',
  'Size',
  'Layout',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_LOGO_PANEL_GROUP_ORDER);

const EXCLUDED_LOGO_FIELD_KEYS = new Set(['defaultLogoUrl', 'customCss', 'colorScheme']);

const FIELD_SORT: Record<string, number> = {
  logoText: 0,
  logoFont: 1,
  sizeUnit: 10,
  pixelHeight: 11,
  percentWidth: 12,
  customMobileSize: 13,
  mobileSizeUnit: 14,
  mobilePixelHeight: 15,
  mobilePercentWidth: 16,
  sectionWidth: 20,
  layoutAlignment: 21,
  backgroundColor: 25,
  textColor: 26,
  paddingTop: 30,
  paddingBottom: 31,
};

/** Logo text / Appearance colors are panel-synthesized when the pack schema lacks them. */
function storytellingLogoContentFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: `${settingsBase}.logoText`,
      type: 'text',
      label: 'Logo text',
      group: 'Content',
      sidebar: true,
      placeholder: 'My Store',
    },
  ];
}

function storytellingLogoAppearanceFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: `${settingsBase}.backgroundColor`,
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: `${settingsBase}.textColor`,
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
  ];
}

function appendMissingLogoFields(
  fields: EditorFieldDef[],
  defs: EditorFieldDef[]
): EditorFieldDef[] {
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const missing = defs.filter((f) => !keys.has(f.path.split('.').pop() ?? ''));
  return missing.length ? [...fields, ...missing] : fields;
}

/** Append Content + Appearance fields when the schema-derived list lacks them. */
export function ensureStorytellingLogoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const anchor = fields.find((f) => /\.sections\.[^.]+\.settings\./.test(f.path));
  if (!anchor) return fields;
  const settingsBase = anchor.path.replace(/\.settings\..*$/, '.settings');
  let next = appendMissingLogoFields(fields, storytellingLogoContentFieldDefs(settingsBase));
  // Remap an existing logoText (often ungrouped from the pack) into Content.
  next = next.map((f) =>
    f.path.endsWith('.logoText') && f.group !== 'Content' ? { ...f, group: 'Content' } : f
  );
  return appendMissingLogoFields(next, storytellingLogoAppearanceFieldDefs(settingsBase));
}

/** @deprecated Use ensureStorytellingLogoPanelFields */
export function ensureStorytellingLogoAppearanceFields(
  fields: EditorFieldDef[]
): EditorFieldDef[] {
  return ensureStorytellingLogoPanelFields(fields);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isStorytellingLogoSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'storytelling-logo' || catalogVariant === 'logo';
}

export function storytellingLogoSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (templateMatch) {
    const secId = templateMatch[2]!;
    if (templateBlueprintKey(secId) !== 'storytelling_logo') return null;
    return `templates.${templateMatch[1]}.sections.${secId}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+)$/);
  if (layoutMatch) {
    const secId = layoutMatch[1]!;
    if (layoutBlueprintKey(secId) !== 'storytelling_logo') return null;
    return `sections.${secId}.settings`;
  }
  return null;
}

export function isStorytellingLogoSectionNodeId(nodeId: string): boolean {
  return storytellingLogoSettingsBaseFromNodeId(nodeId) !== null;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed Content + Appearance values from the merged config. */
export function extendStorytellingLogoAppearanceValues(
  values: Record<string, string | boolean>,
  settingsBase: string,
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  let next = values;
  const defs = [
    ...storytellingLogoContentFieldDefs(settingsBase),
    ...storytellingLogoAppearanceFieldDefs(settingsBase),
  ];
  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (next === values) next = { ...values };
    if (raw !== undefined && raw !== null) {
      next[field.path] = String(raw);
    } else if (field.path.endsWith('.logoText')) {
      next[field.path] = 'My Store';
    }
  }
  return next;
}

export function isStorytellingLogoPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (EXCLUDED_LOGO_FIELD_KEYS.has(key)) return false;
  if (field.group === 'Theme Settings' || field.group === 'Custom CSS') return false;
  // Content fields (logo text) — allow even when pack omits a group.
  if (key === 'logoText') return /\.sections\.[^.]+\.settings\./.test(field.path);
  if (!field.group || !PANEL_GROUPS.has(field.group)) {
    // Keep Layout fields even if group wasn't in the old order set.
    if (field.group === 'Layout') return /\.sections\.[^.]+\.settings\./.test(field.path);
    return false;
  }
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortStorytellingLogoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Content: 0,
    Typography: 1,
    Size: 2,
    Layout: 3,
    Appearance: 4,
    Padding: 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupStorytellingLogoPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const withPanelFields = ensureStorytellingLogoPanelFields(fields);
  for (const field of withPanelFields.filter(isStorytellingLogoPanelField)) {
    const key = field.path.split('.').pop() ?? '';
    const group =
      key === 'logoText'
        ? 'Content'
        : field.group && PANEL_GROUPS.has(field.group)
          ? field.group
          : 'Size';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isStorytellingLogoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('imageUrl') || keys.has('direction') || keys.has('layoutGap')) return false;
  if (keys.has('logoFont') || keys.has('sizeUnit')) return true;
  return keys.has('logoText') && keys.has('sectionWidth');
}

export function prepareStorytellingLogoSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortStorytellingLogoPanelFields(
    ensureStorytellingLogoPanelFields(
      filterSidebarSectionPanelFields(node.fields ?? [], isStorytellingLogoPanelField)
    )
  );
  return { ...node, label: 'Logo', kind: 'section', fields };
}
