import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER = ['General', 'Carousel', 'Padding'] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER);

const MEDIA_FIELD_KEYS = new Set([
  'aspectRatio',
  'constrainToScreenHeight',
  'mediaFit',
  'cornerRadius',
  'extendMediaToScreenEdge',
  'enableZoom',
  'videoLooping',
  'hideUnselectedVariantMedia',
  'carouselIcons',
  'carouselPagination',
  'carouselMobilePagination',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

export function isFeaturedProductMediaBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product_media$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:product_media$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.product_media`;
}

export function featuredProductMediaFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('aspectRatio'),
      type: 'select',
      label: 'Aspect ratio',
      group: 'General',
      widget: 'select',
      sidebar: false,
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
      path: s('constrainToScreenHeight'),
      type: 'boolean',
      label: 'Constrain to screen height',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('mediaFit'),
      type: 'select',
      label: 'Media fit',
      group: 'General',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
      ],
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('extendMediaToScreenEdge'),
      type: 'boolean',
      label: 'Extend media to screen edge',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('enableZoom'),
      type: 'boolean',
      label: 'Enable zoom',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('videoLooping'),
      type: 'boolean',
      label: 'Video looping',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('hideUnselectedVariantMedia'),
      type: 'boolean',
      label: 'Hide unselected variant media',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('carouselIcons'),
      type: 'select',
      label: 'Icons',
      group: 'Carousel',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevrons', label: 'Chevrons' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('carouselPagination'),
      type: 'select',
      label: 'Pagination',
      group: 'Carousel',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'counter', label: 'Counter' },
        { value: 'dots', label: 'Dots' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('carouselMobilePagination'),
      type: 'select',
      label: 'Mobile pagination',
      group: 'Carousel',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'dots', label: 'Dots' },
        { value: 'counter', label: 'Counter' },
        { value: 'none', label: 'None' },
      ],
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

export function featuredProductMediaFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductMediaFieldDefs(base) : [];
}

export function featuredProductMediaFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:product_media$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const block = sec?.blocks?.find((b) => b.id === 'product_media');
  const schemaFields = block?.settingsFields ?? [];
  if (schemaFields.length) {
    return schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
  }
  return featuredProductMediaFieldDefsFromNodeId(nodeId);
}

export const FEATURED_PRODUCT_MEDIA_DEFAULTS: Record<string, string | boolean> = {
  aspectRatio: 'auto',
  constrainToScreenHeight: true,
  mediaFit: 'contain',
  cornerRadius: '0',
  extendMediaToScreenEdge: false,
  enableZoom: true,
  videoLooping: false,
  hideUnselectedVariantMedia: true,
  carouselIcons: 'arrows',
  carouselPagination: 'counter',
  carouselMobilePagination: 'dots',
  paddingTop: '0',
  paddingBottom: '0',
  paddingLeft: '0',
  paddingRight: '0',
};

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed form values for Product media block fields (config + catalog defaults). */
export function extendFeaturedProductMediaBlockValues(
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
    const fallback = FEATURED_PRODUCT_MEDIA_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    aspectRatio: 0,
    constrainToScreenHeight: 1,
    mediaFit: 2,
    cornerRadius: 3,
    extendMediaToScreenEdge: 4,
    enableZoom: 5,
    videoLooping: 6,
    hideUnselectedVariantMedia: 7,
    carouselIcons: 10,
    carouselPagination: 11,
    carouselMobilePagination: 12,
    paddingTop: 20,
    paddingBottom: 21,
    paddingLeft: 22,
    paddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductMediaPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!MEDIA_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.product_media\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductMediaPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductMediaPanelField);
}

export function groupFeaturedProductMediaPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductMediaPanelField)) {
    const group = field.group ?? 'General';
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

export function prepareFeaturedProductMediaSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductMediaPanelField)
    .sort((a, b) => {
      const ga =
        FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER.indexOf(
          (a.group ?? 'General') as (typeof FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER)[number]
        );
      const gb =
        FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER.indexOf(
          (b.group ?? 'General') as (typeof FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER)[number]
        );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  return { ...node, label: 'Product media', kind: 'block', fields };
}
