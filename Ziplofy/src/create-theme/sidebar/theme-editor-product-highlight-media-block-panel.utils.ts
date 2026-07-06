import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export function isProductHighlightMediaBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product_media$/.test(nodeId);
}

export function isProductHighlightProductBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:product_media$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.product_media`;
}

export function productHighlightMediaDefaultSettings(): Record<string, string | number | boolean> {
  return {
    mediaType: 'image',
    imageUrl: '',
    videoUrl: '',
    link: '',
    imagePosition: 'cover',
  };
}

export function productHighlightMediaFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('mediaType'),
      type: 'select',
      label: 'Type',
      group: 'General',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
    },
    {
      path: s('imageUrl'),
      type: 'text',
      label: 'Image',
      group: 'General',
      widget: 'image',
      sidebar: false,
    },
    {
      path: s('videoUrl'),
      type: 'text',
      label: 'Video URL',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('link'),
      type: 'text',
      label: 'Link',
      group: 'General',
      widget: 'link',
      sidebar: false,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('imagePosition'),
      type: 'select',
      label: 'Image position',
      group: 'General',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
      ],
    },
  ];
}

export function productHighlightMediaFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  return productHighlightMediaFieldDefs(base);
}

export function productHighlightMediaFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:product_media$/);
  if (!m) return productHighlightMediaFieldDefsFromNodeId(nodeId);
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const block = sec?.blocks?.find((b) => b.id === 'product_media');
  const schemaFields = block?.settingsFields ?? [];
  if (schemaFields.length) {
    const fromSchema = schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
    if (fromSchema.some((f) => f.path.endsWith('.mediaType') || f.path.endsWith('.imagePosition'))) {
      return fromSchema;
    }
  }
  return productHighlightMediaFieldDefsFromNodeId(nodeId);
}

const MEDIA_PANEL_KEYS = new Set(['mediaType', 'imageUrl', 'videoUrl', 'link', 'imagePosition']);

export function isProductHighlightMediaPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return MEDIA_PANEL_KEYS.has(key) && /\.blocks\.product_media\.settings\./.test(field.path);
}

export function isProductHighlightMediaPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => isProductHighlightMediaPanelField(f));
}

export function filterProductHighlightMediaPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return fields.filter(isProductHighlightMediaPanelField);
}

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendProductHighlightMediaBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const defaults = productHighlightMediaDefaultSettings();
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
    const fallback = defaults[key];
    if (fallback === undefined) continue;
    next[field.path] = typeof fallback === 'boolean' ? fallback : String(fallback);
  }
  return next;
}

export function prepareProductHighlightMediaSettingsNode(node: SidebarNode): SidebarNode {
  return {
    ...node,
    label: 'Product media',
    kind: 'block',
    fields: filterProductHighlightMediaPanelFields(node.fields ?? []),
  };
}

export function prepareProductHighlightProductSettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Product', kind: 'block', fields: [] };
}

export function isProductHighlightMediaContext(
  config: Record<string, unknown> | null,
  nodeId: string
): boolean {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:product_media$/);
  if (!m) return false;
  const catalogVariant = getNested(config, [
    'templates',
    m[1],
    'sections',
    m[2],
    'settings',
    'catalogVariant',
  ]);
  return catalogVariant === 'product-highlight';
}
