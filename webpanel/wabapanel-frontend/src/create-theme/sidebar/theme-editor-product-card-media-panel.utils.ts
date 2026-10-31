import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

const PANEL_GROUPS = new Set(['General', 'Borders', 'Padding']);

export const PRODUCT_CARD_MEDIA_PANEL_GROUP_ORDER = ['General', 'Borders', 'Padding'] as const;

const MEDIA_PANEL_KEYS = new Set([
  'mediaAspectRatio',
  'mediaBorderStyle',
  'mediaCornerRadius',
  'mediaPaddingTop',
  'mediaPaddingBottom',
  'mediaPaddingLeft',
  'mediaPaddingRight',
]);

export function isProductCardMediaNestedNodeId(nodeId: string): boolean {
  return /:block:product_card:nested:media$/.test(nodeId);
}

export function productCardMediaDefaultSettings(): Record<string, string | number | boolean> {
  return {
    mediaAspectRatio: 'auto',
    mediaBorderStyle: 'none',
    mediaCornerRadius: 0,
    mediaPaddingTop: 0,
    mediaPaddingBottom: 0,
    mediaPaddingLeft: 0,
    mediaPaddingRight: 0,
  };
}

export const PRODUCT_CARD_MEDIA_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(productCardMediaDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    mediaAspectRatio: 0,
    mediaBorderStyle: 10,
    mediaCornerRadius: 11,
    mediaPaddingTop: 20,
    mediaPaddingBottom: 21,
    mediaPaddingLeft: 22,
    mediaPaddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isProductCardMediaPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!MEDIA_PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.product_card\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortProductCardMediaPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Borders: 1, Padding: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareProductCardMediaSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardMediaPanelFields((node.fields ?? []).filter(isProductCardMediaPanelField));
  return { ...node, label: 'Media', kind: 'block', fields };
}

export function groupProductCardMediaPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const grouped = new Map<string, EditorFieldDef[]>();
  for (const field of sortProductCardMediaPanelFields(fields)) {
    const group = field.group ?? 'General';
    const list = grouped.get(group) ?? [];
    list.push(field);
    grouped.set(group, list);
  }
  return grouped;
}

export function isProductCardMediaPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => f.path.endsWith('mediaAspectRatio') || f.path.endsWith('mediaBorderStyle'));
}

export function productCardMediaSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(
    /^template:([^:]+):((?:featured_collection|recommended_products|main_collection|search_results)(?:_\d+)?):block:product_card/
  );
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardMediaSettingsBaseFromPrefix(prefix: string): string | null {
  const match = prefix.match(/^template:([^:]+):((?:featured_collection|recommended_products|main_collection|search_results)(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardMediaFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('mediaAspectRatio'),
      type: 'select',
      label: 'Aspect ratio',
      group: 'General',
      widget: 'select',
      sidebar: false,
      description: 'Adjusted in some layouts',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: '1/1', label: 'Square (1:1)' },
        { value: '4/5', label: 'Portrait (4:5)' },
        { value: '3/4', label: 'Portrait (3:4)' },
        { value: '16/9', label: 'Landscape (16:9)' },
        { value: '2/3', label: 'Portrait (2:3)' },
      ],
    },
    {
      path: s('mediaBorderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('mediaCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('mediaPaddingTop'),
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
      path: s('mediaPaddingBottom'),
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
      path: s('mediaPaddingLeft'),
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
      path: s('mediaPaddingRight'),
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

function productCardMediaSchemaFields(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  for (const sectionId of ['featured_collection', 'recommended_products'] as const) {
    const sec = tpl?.sections?.find((s) => s.id === sectionId);
    const productCard = sec?.blocks?.find((b) => b.id === 'product_card');
    const mediaBlock = productCard?.blocks?.find((b) => b.id === 'media');
    const fields = mediaBlock?.settingsFields?.filter((f) => {
      const key = f.path.split('.').pop() ?? '';
      return MEDIA_PANEL_KEYS.has(key);
    });
    if (fields?.length) return fields;
  }
  return [];
}

export function productCardMediaFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const canon = productCardMediaSchemaFields(editorSchema);
  const settingsBase = nodeId ? productCardMediaSettingsBaseFromNodeId(nodeId) : null;
  if (settingsBase) {
    if (canon.length) {
      return canon.map((field) => {
        const key = field.path.split('.').pop() ?? '';
        return { ...field, path: `${settingsBase}.${key}` };
      });
    }
    return productCardMediaFieldDefs(settingsBase);
  }
  return canon;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendValuesForProductCardMediaBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = productCardMediaFieldDefsFromSchema(editorSchema, nodeId);
  const next = { ...values };
  let changed = false;

  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      changed = true;
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = PRODUCT_CARD_MEDIA_DEFAULTS[key];
    if (fallback !== undefined) {
      next[field.path] = fallback;
      changed = true;
    }
  }

  return changed ? next : values;
}
