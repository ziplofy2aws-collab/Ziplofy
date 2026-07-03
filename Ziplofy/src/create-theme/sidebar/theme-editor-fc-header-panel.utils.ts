import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';

export const FC_HEADER_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const HEADER_PANEL_GROUPS = new Set<string>(FC_HEADER_PANEL_GROUP_ORDER);

const TITLE_PANEL_KEYS = new Set([
  'title',
  'titleWidth',
  'titleMaxWidth',
  'titleTypographyPreset',
  'titleFont',
  'titleFontSize',
  'titleLineHeight',
  'titleLetterSpacing',
  'titleTextCase',
  'titleWrap',
  'titleColor',
  'titleBackgroundEnabled',
  'titleBackgroundColor',
  'titleCornerRadius',
  'titlePaddingTop',
  'titlePaddingBottom',
  'titlePaddingLeft',
  'titlePaddingRight',
]);

const VIEW_ALL_PANEL_KEYS = new Set([
  'viewAllLabel',
  'viewAllHref',
  'viewAllOpenInNewTab',
  'viewAllStyle',
  'viewAllLinkTextColor',
  'viewAllCustomBackgroundColor',
  'viewAllCustomTextColor',
  'viewAllCustomBorderColor',
  'viewAllDesktopWidth',
  'viewAllDesktopCustomWidth',
  'viewAllMobileWidth',
  'viewAllMobileCustomWidth',
]);

const FIELD_SORT: Record<string, number> = {
  subtitle: 0,
  direction: 10,
  verticalOnMobile: 11,
  layoutAlignment: 12,
  position: 13,
  alignTextBaseline: 14,
  layoutGap: 15,
  width: 20,
  customWidth: 21,
  mobileWidth: 22,
  mobileCustomWidth: 23,
  height: 24,
  customHeight: 25,
  backgroundMedia: 30,
  backgroundImageUrl: 31,
  backgroundImagePosition: 32,
  backgroundColor: 33,
  borderStyle: 40,
  borderThickness: 41,
  borderOpacity: 42,
  borderColor: 43,
  cornerRadius: 44,
  paddingTop: 50,
  paddingBottom: 51,
  paddingLeft: 52,
  paddingRight: 53,
};

export function featuredCollectionHeaderDefaultSettings(): Record<string, string | number | boolean> {
  return {
    direction: 'horizontal',
    verticalOnMobile: false,
    layoutAlignment: 'space-between',
    position: 'bottom',
    alignTextBaseline: true,
    layoutGap: 12,
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundImagePosition: 'cover',
    backgroundColor: 'default',
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    borderColor: 'default',
    cornerRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function isFeaturedCollectionHeaderBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:featured_collection(?:_\d+)?:block:collection_header$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFeaturedCollectionHeaderPanelField(field: EditorFieldDef): boolean {
  if (!/\.blocks\.collection_header\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (TITLE_PANEL_KEYS.has(key)) return false;
  if (VIEW_ALL_PANEL_KEYS.has(key)) return false;
  if (key === 'subtitle' || key === 'inheritColorScheme') return false;
  if (!field.group || !HEADER_PANEL_GROUPS.has(field.group)) {
    if (key === 'borderStyle' || key === 'cornerRadius') return true;
    if (key === 'borderThickness' || key === 'borderOpacity' || key === 'borderColor') return true;
    if (key === 'customWidth' || key === 'mobileCustomWidth' || key === 'customHeight') return true;
    if (key === 'backgroundColor') return true;
    return false;
  }
  return true;
}

export function isFeaturedCollectionHeaderPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedCollectionHeaderPanelField);
}

export function pickFeaturedCollectionHeaderField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export const FC_HEADER_PERCENT_SLIDER_BOUNDS = { min: 1, max: 100, step: 1 } as const;

/** Settings base path for collection header block (`…collection_header.settings`). */
export function featuredCollectionHeaderSettingsBase(fields: EditorFieldDef[]): string {
  const anchor =
    pickFeaturedCollectionHeaderField(fields, 'width') ??
    pickFeaturedCollectionHeaderField(fields, 'height') ??
    pickFeaturedCollectionHeaderField(fields, 'direction') ??
    fields.find((f) => /\.blocks\.collection_header\.settings\./.test(f.path));
  if (!anchor) return '';
  return anchor.path.replace(/\.[^.]+$/, '');
}

function buildFeaturedCollectionHeaderPercentField(
  settingsBase: string,
  key: 'customWidth' | 'mobileCustomWidth' | 'customHeight',
  label: string
): EditorFieldDef | null {
  if (!settingsBase) return null;
  return {
    path: `${settingsBase}.${key}`,
    label,
    type: 'number',
    group: 'Size',
    widget: 'slider',
    sidebar: false,
    unit: '%',
    min: FC_HEADER_PERCENT_SLIDER_BOUNDS.min,
    max: FC_HEADER_PERCENT_SLIDER_BOUNDS.max,
    step: FC_HEADER_PERCENT_SLIDER_BOUNDS.step,
  };
}

export function resolveFeaturedCollectionHeaderCustomWidthField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: 'customWidth' | 'mobileCustomWidth'
): EditorFieldDef | null {
  const settingsBase =
    featuredCollectionHeaderSettingsBase(fields) ||
    anchor?.path.replace(/\.(width|mobileWidth)$/, '') ||
    '';
  return buildFeaturedCollectionHeaderPercentField(settingsBase, key, 'Custom width');
}

export function resolveFeaturedCollectionHeaderCustomHeightField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined
): EditorFieldDef | null {
  const settingsBase =
    featuredCollectionHeaderSettingsBase(fields) ||
    anchor?.path.replace(/\.height$/, '') ||
    '';
  return buildFeaturedCollectionHeaderPercentField(settingsBase, 'customHeight', 'Custom height');
}

export function featuredCollectionHeaderPercentValue(
  values: Record<string, string | boolean>,
  field: EditorFieldDef,
  settingsBase?: string
): number {
  const { min, max } = FC_HEADER_PERCENT_SLIDER_BOUNDS;
  const key = field.path.split('.').pop() ?? '';
  const base = settingsBase || field.path.replace(/\.[^.]+$/, '');
  const candidatePaths = [field.path, `${base}.${key}`];
  let raw: string | boolean | number | undefined;
  for (const path of candidatePaths) {
    const v = values[path];
    if (v !== undefined && v !== '') {
      raw = v;
      break;
    }
  }
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 100;
  return Math.min(max, Math.max(min, n));
}

export function clampFeaturedCollectionHeaderPercent(raw: string | number): number {
  const { min, max } = FC_HEADER_PERCENT_SLIDER_BOUNDS;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 100;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function resolveFeaturedCollectionHeaderColorField(
  fields: EditorFieldDef[],
  settingsBase: string,
  key: 'backgroundColor' | 'borderColor',
  label: string
): EditorFieldDef {
  const fromSchema = pickFeaturedCollectionHeaderField(fields, key);
  if (fromSchema) return { ...fromSchema, label: fromSchema.label ?? label };
  return {
    path: `${settingsBase}.${key}`,
    type: 'text',
    label,
    group: key === 'borderColor' ? 'Borders' : 'Appearance',
    widget: 'color',
    sidebar: false,
  };
}

export function resolveFeaturedCollectionHeaderBorderSliderField(
  fields: EditorFieldDef[],
  settingsBase: string,
  key: 'borderThickness' | 'borderOpacity',
  label: string,
  unit: string,
  min: number,
  max: number
): EditorFieldDef {
  const fromSchema = pickFeaturedCollectionHeaderField(fields, key);
  if (fromSchema) return { ...fromSchema, label: fromSchema.label ?? label };
  return {
    path: `${settingsBase}.${key}`,
    type: 'number',
    label,
    group: 'Borders',
    widget: 'slider',
    min,
    max,
    step: 1,
    unit,
    sidebar: false,
  };
}

export function resolveFeaturedCollectionHeaderImageField(
  fields: EditorFieldDef[],
  settingsBase: string
): EditorFieldDef {
  const fromSchema = pickFeaturedCollectionHeaderField(fields, 'backgroundImageUrl');
  if (fromSchema) {
    return { ...fromSchema, label: 'Image', widget: 'image' as const };
  }
  return {
    path: `${settingsBase}.backgroundImageUrl`,
    type: 'text',
    label: 'Image',
    group: 'Appearance',
    widget: 'image',
    sidebar: false,
    placeholder: 'https://…',
  };
}

export function resolveFeaturedCollectionHeaderImagePositionField(
  fields: EditorFieldDef[],
  settingsBase: string
): EditorFieldDef {
  const fromSchema = pickFeaturedCollectionHeaderField(fields, 'backgroundImagePosition');
  if (fromSchema) return fromSchema;
  return {
    path: `${settingsBase}.backgroundImagePosition`,
    type: 'select',
    label: 'Image position',
    group: 'Appearance',
    widget: 'segmented',
    sidebar: false,
    options: [
      { value: 'cover', label: 'Cover' },
      { value: 'fit', label: 'Fit' },
    ],
  };
}

export function groupFeaturedCollectionHeaderPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const groups = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    let group = field.group ?? 'Layout';
    if (key === 'borderStyle' || key === 'cornerRadius') group = 'Borders';
    if (key === 'borderThickness' || key === 'borderOpacity' || key === 'borderColor') group = 'Borders';
    if (key === 'customWidth' || key === 'mobileCustomWidth' || key === 'customHeight') group = 'Size';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(field);
  }
  for (const [group, list] of groups) {
    list.sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path));
    groups.set(group, list);
  }
  return groups;
}

export function sortFeaturedCollectionHeaderPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const keyA = a.path.split('.').pop() ?? '';
    const keyB = b.path.split('.').pop() ?? '';
    const groupA =
      keyA === 'borderStyle' || keyA === 'cornerRadius' ? 'Borders' : (a.group ?? 'Layout');
    const groupB =
      keyB === 'borderStyle' || keyB === 'cornerRadius' ? 'Borders' : (b.group ?? 'Layout');
    const ga = groupRank[groupA] ?? 9;
    const gb = groupRank[groupB] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareFeaturedCollectionHeaderSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortFeaturedCollectionHeaderPanelFields(
    (node.fields ?? []).filter(isFeaturedCollectionHeaderPanelField)
  );
  return { ...node, label: 'Header', kind: 'block', fields };
}

function canonicalFcHeaderFieldsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const header = sec?.blocks?.find((b) => b.id === 'collection_header');
  return (header?.settingsFields ?? []).filter(isFeaturedCollectionHeaderPanelField);
}

export function fcHeaderFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const match = nodeId?.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
  const canon = canonicalFcHeaderFieldsFromSchema(editorSchema);
  if (!match || !canon.length) return canon;
  const [, templateId, sectionInstanceId] = match;
  return canon.map((field) => ({
    ...field,
    path: remapTemplateSchemaPath(field.path, templateId!, sectionInstanceId!),
  }));
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendValuesForFeaturedCollectionHeaderBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = fcHeaderFieldDefsFromSchema(editorSchema, nodeId);
  const match = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
  const settingsBase = match
    ? `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`
    : '';
  const next = { ...values };
  let changed = false;
  const defaults = featuredCollectionHeaderDefaultSettings();

  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      changed = true;
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = defaults[key];
    if (fallback !== undefined && settingsBase) {
      next[field.path] = typeof fallback === 'boolean' ? fallback : String(fallback);
      changed = true;
    }
  }

  if (settingsBase) {
    for (const [key, fallback] of Object.entries(defaults)) {
      const path = `${settingsBase}.${key}`;
      if (next[path] !== undefined) continue;
      const fromConfig = getNested(config, path.split('.'));
      if (fromConfig !== undefined && fromConfig !== null && fromConfig !== '') {
        next[path] = typeof fallback === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      } else {
        next[path] = typeof fallback === 'boolean' ? fallback : String(fallback);
      }
      changed = true;
    }

    for (const key of ['customWidth', 'mobileCustomWidth', 'customHeight'] as const) {
      const path = `${settingsBase}.${key}`;
      const raw = next[path];
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n) || n < 1) {
        next[path] = String(defaults[key] ?? 100);
        changed = true;
      }
    }
  }

  if (!changed) return values;
  return next;
}

export {
  isFeaturedCollectionHeaderNestedNodeId,
  isViewAllButtonNestedNodeId,
  prepareFeaturedCollectionHeaderNestedNode,
  prepareViewAllButtonSettingsNode,
} from './theme-editor-fc-view-all-button-panel.utils';
