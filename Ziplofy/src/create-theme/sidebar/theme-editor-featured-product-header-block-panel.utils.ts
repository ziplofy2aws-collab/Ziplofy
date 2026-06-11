import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Block link',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

const HEADER_FIELD_KEYS = new Set([
  'direction',
  'alignment',
  'position',
  'layoutGap',
  'width',
  'customWidth',
  'mobileWidth',
  'mobileCustomWidth',
  'height',
  'customHeight',
  'inheritColorScheme',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'cornerRadius',
  'backgroundOverlay',
  'linkUrl',
  'openLinkInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

export function isFeaturedProductHeaderBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:header$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:header$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.header`;
}

export function pickFeaturedProductHeaderField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function resolvePercentSliderField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: string,
  label: string,
  group: string
): EditorFieldDef | null {
  const existing = pickFeaturedProductHeaderField(fields, key);
  if (existing) {
    return {
      ...existing,
      label,
      type: 'number',
      widget: 'slider',
      min: existing.min ?? 1,
      max: existing.max ?? 100,
      step: existing.step ?? 1,
      unit: existing.unit ?? '%',
      group,
    };
  }
  if (!anchor) return null;
  const base = anchor.path.replace(/\.(width|mobileWidth|height)$/, '');
  return {
    path: `${base}.${key}`,
    label,
    type: 'number',
    group,
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  };
}

export function resolveFeaturedProductHeaderCustomWidthField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: 'customWidth' | 'mobileCustomWidth'
): EditorFieldDef | null {
  return resolvePercentSliderField(fields, anchor, key, 'Custom width', 'Size');
}

export function resolveFeaturedProductHeaderCustomHeightField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined
): EditorFieldDef | null {
  return resolvePercentSliderField(fields, anchor, 'customHeight', 'Custom height', 'Size');
}

export function featuredProductHeaderDefaultSettings(): Record<string, string | number | boolean> {
  return {
    direction: 'vertical',
    alignment: 'left',
    position: 'center',
    layoutGap: 12,
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    inheritColorScheme: false,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundImagePosition: 'cover',
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    cornerRadius: 0,
    backgroundOverlay: false,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function featuredProductHeaderFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('direction'),
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select',
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
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
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
      options: [...FIT_FILL_CUSTOM],
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
      path: s('backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: false,
    },
    {
      path: s('linkUrl'),
      type: 'text',
      label: 'Link',
      group: 'Block link',
      widget: 'link',
      sidebar: false,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('openLinkInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Block link',
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

export function featuredProductHeaderCustomSizeFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  const slider = (path: string, label: string): EditorFieldDef => ({
    path,
    type: 'number',
    label,
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: false,
  });
  return [
    slider(s('customWidth'), 'Custom width'),
    slider(s('mobileCustomWidth'), 'Custom width'),
    slider(s('customHeight'), 'Custom height'),
  ];
}

export function featuredProductHeaderFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductHeaderFieldDefs(base) : [];
}

export function featuredProductHeaderFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:header$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const header = details?.blocks?.find((b) => b.id === 'header');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = header?.settingsFields ?? [];
  if (schemaFields.length) {
    const remapped = schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
    const hasCustom = remapped.some((f) => f.path.endsWith('.customWidth'));
    if (!hasCustom && blocksBase) {
      return [...remapped, ...featuredProductHeaderCustomSizeFieldDefs(blocksBase)];
    }
    return remapped;
  }
  return blocksBase
    ? [
        ...featuredProductHeaderFieldDefsFromNodeId(nodeId),
        ...featuredProductHeaderCustomSizeFieldDefs(blocksBase),
      ]
    : featuredProductHeaderFieldDefsFromNodeId(nodeId);
}

export const FEATURED_PRODUCT_HEADER_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(featuredProductHeaderDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    direction: 0,
    alignment: 1,
    position: 2,
    layoutGap: 3,
    width: 10,
    mobileWidth: 11,
    height: 12,
    inheritColorScheme: 20,
    backgroundMedia: 21,
    backgroundImageUrl: 22,
    backgroundImagePosition: 23,
    borderStyle: 24,
    borderThickness: 25,
    borderOpacity: 26,
    cornerRadius: 27,
    backgroundOverlay: 28,
    linkUrl: 30,
    openLinkInNewTab: 31,
    paddingTop: 40,
    paddingBottom: 41,
    paddingLeft: 42,
    paddingRight: 43,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductHeaderPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!HEADER_FIELD_KEYS.has(key)) return false;
  const isFeaturedProductPath = /\.blocks\.details\.blocks\.header\.settings\./.test(field.path);
  const isCollectionListHeaderPath = /\.settings\.headerGroup\./.test(field.path);
  if (!isFeaturedProductPath && !isCollectionListHeaderPath) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductHeaderPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductHeaderPanelField);
}

export function groupFeaturedProductHeaderPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductHeaderPanelField)) {
    const group = field.group ?? 'Layout';
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

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendFeaturedProductHeaderBlockValues(
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
    const fallback = FEATURED_PRODUCT_HEADER_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductHeaderSettingsNode(node: SidebarNode): SidebarNode {
  const panelFields = [...(node.fields ?? [])]
    .filter(isFeaturedProductHeaderPanelField)
    .sort((a, b) => {
      const ga = FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER.indexOf(
        (a.group ?? 'Layout') as (typeof FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER)[number]
      );
      const gb = FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER.indexOf(
        (b.group ?? 'Layout') as (typeof FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER)[number]
      );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  const widthField = panelFields.find((f) => f.path.endsWith('.width'));
  const blocksBase = widthField?.path.replace(/\.settings\.width$/, '') ?? null;
  const customDefs = blocksBase ? featuredProductHeaderCustomSizeFieldDefs(blocksBase) : [];
  const paths = new Set(panelFields.map((f) => f.path));
  const fields = [...panelFields, ...customDefs.filter((f) => !paths.has(f.path))];
  return { ...node, label: 'Header', kind: 'block', fields };
}
