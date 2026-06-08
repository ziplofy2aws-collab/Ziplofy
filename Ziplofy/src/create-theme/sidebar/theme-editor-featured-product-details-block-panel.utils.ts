import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER = [
  'Size',
  'Layout',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

const FIT_FILL = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

const DETAILS_FIELD_KEYS = new Set([
  'width',
  'mobileWidth',
  'height',
  'layoutGap',
  'position',
  'stickyOnDesktop',
  'inheritColorScheme',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

export function pickFeaturedProductDetailsField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

/** Percent slider for Width / Mobile width when mode is Custom. */
export function resolveFeaturedProductDetailsCustomWidthField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: 'customWidth' | 'mobileCustomWidth'
): EditorFieldDef | null {
  const existing = pickFeaturedProductDetailsField(fields, key);
  if (existing) {
    return {
      ...existing,
      label: 'Custom width',
      type: 'number',
      widget: 'slider',
      min: existing.min ?? 1,
      max: existing.max ?? 100,
      step: existing.step ?? 1,
      unit: existing.unit ?? '%',
      group: 'Size',
    };
  }
  if (!anchor) return null;
  const base = anchor.path.replace(/\.(width|mobileWidth)$/, '');
  return {
    path: `${base}.${key}`,
    label: 'Custom width',
    type: 'number',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  };
}

export function isFeaturedProductDetailsBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details`;
}

export function featuredProductDetailsDefaultSettings(): Record<string, string | number | boolean> {
  return {
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    layoutGap: 31,
    position: 'top',
    stickyOnDesktop: false,
    inheritColorScheme: true,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundImagePosition: 'cover',
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    cornerRadius: 0,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function featuredProductDetailsFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('mobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('layoutGap'),
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('stickyOnDesktop'),
      type: 'boolean',
      label: 'Sticky on desktop',
      group: 'Layout',
      sidebar: false,
    },
    {
      path: s('inheritColorScheme'),
      type: 'boolean',
      label: 'Inherit color scheme',
      group: 'Appearance',
      sidebar: false,
    },
    {
      path: s('backgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: s('backgroundImageUrl'),
      type: 'text',
      label: 'Image',
      group: 'Appearance',
      widget: 'image',
      sidebar: false,
      placeholder: 'https://…',
    },
    {
      path: s('backgroundImagePosition'),
      type: 'select',
      label: 'Image position',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'fit', label: 'Fit' },
      ],
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Borders',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('borderThickness'),
      type: 'number',
      label: 'Border thickness',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('borderOpacity'),
      type: 'number',
      label: 'Border opacity',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
  ];
}

export function featuredProductDetailsFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductDetailsFieldDefs(base) : [];
}

export function featuredProductDetailsFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const block = sec?.blocks?.find((b) => b.id === 'details');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = block?.settingsFields ?? [];
  if (schemaFields.length) {
    const remapped = schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
    const hasCustom = remapped.some((f) => f.path.endsWith('.customWidth'));
    if (!hasCustom && blocksBase) {
      return [...remapped, ...featuredProductDetailsCustomWidthFieldDefs(blocksBase)];
    }
    return remapped;
  }
  return blocksBase
    ? [
        ...featuredProductDetailsFieldDefsFromNodeId(nodeId),
        ...featuredProductDetailsCustomWidthFieldDefs(blocksBase),
      ]
    : featuredProductDetailsFieldDefsFromNodeId(nodeId);
}

export const FEATURED_PRODUCT_DETAILS_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(featuredProductDetailsDefaultSettings()).map(([k, v]) => [k, typeof v === 'boolean' ? v : String(v)])
) as Record<string, string | boolean>;

/** Schema + seed paths for custom width sliders (resolved in the Size panel UI). */
export function featuredProductDetailsCustomWidthFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  const slider = (path: string): EditorFieldDef => ({
    path,
    type: 'number',
    label: 'Custom width',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  });
  return [slider(s('customWidth')), slider(s('mobileCustomWidth'))];
}

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendFeaturedProductDetailsBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] =
        field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = FEATURED_PRODUCT_DETAILS_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    width: 0,
    mobileWidth: 1,
    height: 2,
    position: 9,
    layoutGap: 10,
    stickyOnDesktop: 11,
    inheritColorScheme: 20,
    backgroundMedia: 21,
    backgroundImageUrl: 22,
    backgroundImagePosition: 23,
    borderStyle: 24,
    borderThickness: 25,
    borderOpacity: 26,
    cornerRadius: 27,
    paddingTop: 30,
    paddingBottom: 31,
    paddingLeft: 32,
    paddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductDetailsPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!DETAILS_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductDetailsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductDetailsPanelField);
}

export function groupFeaturedProductDetailsPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductDetailsPanelField)) {
    const group = field.group ?? 'Size';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

export function prepareFeaturedProductDetailsSettingsNode(node: SidebarNode): SidebarNode {
  const panelFields = [...(node.fields ?? [])]
    .filter(isFeaturedProductDetailsPanelField)
    .sort((a, b) => {
      const ga =
        FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER.indexOf(
          (a.group ?? 'Size') as (typeof FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER)[number]
        );
      const gb =
        FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER.indexOf(
          (b.group ?? 'Size') as (typeof FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER)[number]
        );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  const widthField = panelFields.find((f) => f.path.endsWith('.width'));
  const blocksBase = widthField?.path.replace(/\.settings\.width$/, '') ?? null;
  const customDefs = blocksBase ? featuredProductDetailsCustomWidthFieldDefs(blocksBase) : [];
  const paths = new Set(panelFields.map((f) => f.path));
  const fields = [...panelFields, ...customDefs.filter((f) => !paths.has(f.path))];
  return { ...node, label: 'Details', kind: 'block', fields };
}
