import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../utils/theme-editor-insert-section';

const BLOCK_PANEL_GROUPS = new Set(['Content', 'Typography', 'Appearance']);

const BLOCK_FIELD_SORT: Record<string, number> = {
  text: 0,
  link: 1,
  font: 10,
  fontSize: 11,
  fontWeight: 12,
  letterSpacing: 13,
  textCase: 14,
  textColor: 20,
};

const BLOCK_SETTING_KEYS = new Set([
  'text',
  'link',
  'font',
  'fontSize',
  'fontWeight',
  'letterSpacing',
  'textCase',
  'textColor',
]);

function blockSettingKey(path: string): string {
  return path.split('.').pop() ?? '';
}

export function isAnnouncementBlockPanelField(field: EditorFieldDef): boolean {
  if (!/\.blocks\.[^.]+\.settings\./.test(field.path)) return false;
  return BLOCK_SETTING_KEYS.has(blockSettingKey(field.path));
}

export function isAnnouncementBlockPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.length > 0 && fields.every(isAnnouncementBlockPanelField);
}

export function pickAnnouncementBlockField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => blockSettingKey(f.path) === key);
}

export function isAnnouncementBlockNodeId(nodeId: string): boolean {
  return /^layout:(announcement_bar(?:_\d+)?):block:[^:]+$/.test(nodeId);
}

export function isAnnouncementBlockFieldNodeId(nodeId: string): boolean {
  return (
    nodeId.startsWith('field:') &&
    /\.sections\.announcement_bar(?:_\d+)?\.blocks\.[^.]+\.settings\./.test(nodeId)
  );
}

export function instanceIdFromAnnouncementBlockNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(announcement_bar(?:_\d+)?):block:[^:]+$/);
  return m ? m[1] : null;
}

export function blockInstanceIdFromAnnouncementBlockNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:announcement_bar(?:_\d+)?:block:([^:]+)$/);
  return m ? m[1] : null;
}

/** Map instance id (`announcement_2`) → catalog/schema block type (`announcement`). */
export function announcementSchemaBlockTypeId(blockInstanceId: string): string {
  return /^announcement(_\d+)?$/.test(blockInstanceId) ? 'announcement' : blockInstanceId;
}

export function instanceIdFromAnnouncementFieldNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^field:sections\.(announcement_bar(?:_\d+)?)\.blocks\.[^.]+\./);
  return m ? m[1] : null;
}

export function blockInstanceIdFromAnnouncementFieldNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^field:sections\.announcement_bar(?:_\d+)?\.blocks\.([^.]+)\./);
  return m ? m[1] : null;
}

/** Map preview/sidebar selection to the Announcement block row id. */
export function announcementBlockNodeIdFromSelection(nodeId: string): string | null {
  if (isAnnouncementBlockNodeId(nodeId)) return nodeId;
  const instanceId = instanceIdFromAnnouncementFieldNodeId(nodeId);
  const blockId = blockInstanceIdFromAnnouncementFieldNodeId(nodeId);
  return instanceId && blockId ? `layout:${instanceId}:block:${blockId}` : null;
}

export function announcementBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string,
  blockInstanceId = 'announcement'
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'announcement');
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields.map((f) => {
    const path = remapLayoutSchemaPath(f.path, instanceId).replace(
      /\.blocks\.announcement\./,
      `.blocks.${blockInstanceId}.`
    );
    return { ...f, path };
  });
}

export function sortAnnouncementBlockPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { Content: 0, Typography: 1, Appearance: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    const ka = BLOCK_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50;
    const kb = BLOCK_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50;
    return ka - kb;
  });
}

export function prepareAnnouncementBlockSettingsNode(node: SidebarNode): SidebarNode {
  const filtered = sortAnnouncementBlockPanelFields(
    (node.fields ?? []).filter((f) => !f.group || BLOCK_PANEL_GROUPS.has(f.group))
  ).map((field) => {
    const key = blockSettingKey(field.path);
    const fallback = ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS[key];
    if ((!field.options || field.options.length === 0) && fallback) {
      return { ...field, options: fallback };
    }
    return field;
  });
  const instanceId =
    instanceIdFromAnnouncementBlockNodeId(node.id) ??
    node.id.replace(/^layout:/, '').split(':')[0] ??
    'announcement_bar';
  const blockInstanceId = blockInstanceIdFromAnnouncementBlockNodeId(node.id) ?? 'announcement';
  const fields =
    filtered.length > 0
      ? filtered
      : sortAnnouncementBlockPanelFields(defaultAnnouncementBlockFields(instanceId, blockInstanceId));
  return {
    ...node,
    label: 'Announcement',
    kind: 'block',
    fields,
  };
}

const ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS: Record<string, { value: string; label: string }[]> = {
  font: [
    { value: 'body', label: 'Body' },
    { value: 'subheading', label: 'Subheading' },
    { value: 'heading', label: 'Heading' },
    { value: 'accent', label: 'Accent' },
  ],
  fontSize: [
    { value: 'default', label: 'Default' },
    { value: '10px', label: '10px' },
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
  ],
  fontWeight: [
    { value: 'default', label: 'Default' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
  ],
  letterSpacing: [
    { value: 'tight', label: 'Tight' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Wide' },
  ],
  textCase: [
    { value: 'default', label: 'Default' },
    { value: 'uppercase', label: 'Uppercase' },
  ],
};

function defaultAnnouncementBlockFields(instanceId: string, blockInstanceId: string): EditorFieldDef[] {
  return [
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.text`,
      type: 'textarea',
      label: 'Text',
      group: 'Content',
      widget: 'richtext',
    },
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.link`,
      type: 'text',
      label: 'Link',
      group: 'Content',
      widget: 'link',
      placeholder: 'Paste a link or search',
    },
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.font`,
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      options: ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS.font,
    },
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.fontSize`,
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      options: ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS.fontSize,
    },
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.fontWeight`,
      type: 'select',
      label: 'Weight',
      group: 'Typography',
      widget: 'select',
      options: ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS.fontWeight,
    },
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.letterSpacing`,
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'select',
      options: ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS.letterSpacing,
    },
    {
      path: `sections.${instanceId}.blocks.${blockInstanceId}.settings.textCase`,
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      options: ANNOUNCEMENT_BLOCK_FALLBACK_OPTIONS.textCase,
    },
  ];
}

/** Resolve the announcement block sidebar node from a block or field selection. */
export function findAnnouncementBlockInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isAnnouncementBlockNodeId(nodeId)) {
    return findNodeById(tree, nodeId);
  }
  if (!isAnnouncementBlockFieldNodeId(nodeId)) return null;
  const instanceId = instanceIdFromAnnouncementFieldNodeId(nodeId);
  const blockId = blockInstanceIdFromAnnouncementFieldNodeId(nodeId);
  if (!instanceId || !blockId) return null;
  return findNodeById(tree, `layout:${instanceId}:block:${blockId}`);
}

function findNodeById(nodes: SidebarNode[], id: string): SidebarNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Collect remapped block settings from field children for the settings sheet. */
export function announcementBlockFieldsFromNode(node: SidebarNode): EditorFieldDef[] {
  if (node.fields?.length) return node.fields;
  return (node.children ?? []).flatMap((c) => c.fields ?? []);
}
