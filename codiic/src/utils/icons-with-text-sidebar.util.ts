import type { EditorFieldDef, EditorSchemaDoc, SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import {
  iconWithTextBlockFieldDefs,
  iconsWithTextNestedHeadingFieldDefs,
  iconsWithTextNestedTextFieldDefs,
  isIconsWithTextGroupNodeId,
  isIconsWithTextNestedHeadingNodeId,
  isIconsWithTextNestedIconNodeId,
  isIconsWithTextNestedTextGroupNodeId,
  isIconsWithTextNestedTextNodeId,
  prepareIconsWithTextGroupSettingsNode,
  prepareIconsWithTextNestedHeadingSettingsNode,
  prepareIconsWithTextNestedIconSettingsNode,
  prepareIconsWithTextNestedTextGroupSettingsNode,
  prepareIconsWithTextNestedTextSettingsNode,
} from '../create-theme/sidebar/theme-editor-icons-with-text-panel.utils';

/** Mirror of create-theme-structure-order.listKeyBlockChildren (avoids a circular import). */
function listKeyBlockChildren(blockPrefix: string): string {
  return `fields:${blockPrefix}`;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function previewFromValues(
  values: Record<string, string | boolean>,
  path: string
): string | undefined {
  const raw = values[path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 24 ? `${text.slice(0, 24)}…` : text;
}

function reorderSidebarChildren(
  children: SidebarNode[],
  listKey: string,
  itemOrder: Record<string, string[]>
): SidebarNode[] {
  const order = itemOrder[listKey];
  if (!order?.length) return children;
  const byId = new Map(children.map((c) => [c.id, c]));
  const out: SidebarNode[] = [];
  for (const id of order) {
    const node = byId.get(id);
    if (node) out.push(node);
  }
  for (const c of children) {
    if (!order.includes(c.id)) out.push(c);
  }
  return out;
}

function readTemplateBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): string[] {
  if (!config) return [];
  const order = getNested(config, ['templates', tplId, 'sections', secId, 'block_order']);
  if (!Array.isArray(order)) return [];
  const blocks = getNested(config, ['templates', tplId, 'sections', secId, 'blocks']) as
    | Record<string, unknown>
    | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

function readLayoutBlockOrder(
  config: Record<string, unknown> | null,
  secId: string
): string[] {
  if (!config) return [];
  const order = getNested(config, ['sections', secId, 'block_order']);
  if (!Array.isArray(order)) return [];
  const blocks = getNested(config, ['sections', secId, 'blocks']) as
    | Record<string, unknown>
    | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

/** Shopify-style hierarchy: Group → Icon + Group → Text + Text. */
export function mapIconsWithTextBlockNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): SidebarNode[] {
  const blockOrder =
    tplId != null
      ? readTemplateBlockOrder(config, tplId, secId)
      : readLayoutBlockOrder(config, secId);

  const blockNodes: SidebarNode[] = blockOrder.map((blockId) => {
    const blockPrefix = `${prefix}:block:${blockId}`;
    const headingPath = `${blocksBase}.blocks.${blockId}.settings.heading`;
    const textPath = `${blocksBase}.blocks.${blockId}.settings.text`;
    const fields = iconWithTextBlockFieldDefs(blocksBase, blockId);
    const iconField = fields.find((field) => field.path.endsWith('.icon'));
    const headingDefs = iconsWithTextNestedHeadingFieldDefs(blocksBase, blockId);
    const textDefs = iconsWithTextNestedTextFieldDefs(blocksBase, blockId);
    const headingPreview = previewFromValues(values, headingPath);
    const textPreview = previewFromValues(values, textPath);

    const textGroupId = `${blockPrefix}:nested:group`;
    const textGroupChildren = reorderSidebarChildren(
      [
        {
          id: `${textGroupId}:inner-add-block`,
          label: 'Add block',
          kind: 'add-block' as const,
        },
        {
          id: `${textGroupId}:nested:heading`,
          label: 'Text',
          kind: 'block' as const,
          icon: 'text' as SidebarIcon,
          fields: headingDefs,
          preview: headingPreview,
        },
        {
          id: `${textGroupId}:nested:text`,
          label: 'Text',
          kind: 'block' as const,
          icon: 'text' as SidebarIcon,
          fields: textDefs,
          preview: textPreview,
        },
      ],
      listKeyBlockChildren(textGroupId),
      itemOrder
    );

    const groupChildren = reorderSidebarChildren(
      [
        {
          id: `${blockPrefix}:inner-add-block`,
          label: 'Add block',
          kind: 'add-block' as const,
        },
        ...(iconField
          ? [
              {
                id: `${blockPrefix}:nested:icon`,
                label: 'Icon',
                kind: 'block' as const,
                icon: 'image' as SidebarIcon,
                fields: [iconField],
              },
            ]
          : []),
        {
          id: textGroupId,
          label: 'Group',
          kind: 'block' as const,
          icon: 'group' as SidebarIcon,
          children: textGroupChildren,
          childrenListKey: listKeyBlockChildren(textGroupId),
        },
      ],
      listKeyBlockChildren(blockPrefix),
      itemOrder
    );

    return {
      id: blockPrefix,
      label: 'Group',
      kind: 'block' as const,
      icon: 'group' as SidebarIcon,
      children: groupChildren,
      childrenListKey: listKeyBlockChildren(blockPrefix),
      showVisibilityToggle: true,
      showDeleteButton: true,
    };
  });

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], sectionChildrenListKey, itemOrder);
}

export function iconsWithTextStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): Record<string, string[]> {
  const blockOrder = readTemplateBlockOrder(config, tplId, secId);
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...blockOrder.map((id) => `${prefix}:block:${id}`),
    ],
  };
}

export function iconsWithTextLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  secId: string
): Record<string, string[]> {
  const blockOrder = readLayoutBlockOrder(config, secId);
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...blockOrder.map((id) => `${prefix}:block:${id}`),
    ],
  };
}

const ICONS_WITH_TEXT_FIELD_TO_NESTED_SUFFIX: Record<string, string> = {
  icon: 'nested:icon',
  heading: 'nested:group:nested:heading',
  text: 'nested:group:nested:text',
};

export function isIconsWithTextContentFieldPath(path: string): boolean {
  if (!/icons_with_text/.test(path)) return false;
  const key = path.split('.').pop() ?? '';
  return key in ICONS_WITH_TEXT_FIELD_TO_NESTED_SUFFIX;
}

export function iconsWithTextFieldSidebarNodeId(settingsFieldPath: string): string | null {
  const key = settingsFieldPath.split('.').pop() ?? '';
  const suffix = ICONS_WITH_TEXT_FIELD_TO_NESTED_SUFFIX[key];
  if (!suffix) return null;

  const tpl = settingsFieldPath.match(/templates\.([^.]+)\.sections\.([^.]+)\.blocks\.(icon_\d+)/);
  if (tpl) {
    return `template:${tpl[1]}:${tpl[2]}:block:${tpl[3]}:${suffix}`;
  }
  const layout = settingsFieldPath.match(/sections\.([^.]+)\.blocks\.(icon_\d+)/);
  if (layout) {
    return `layout:${layout[1]}:block:${layout[2]}:${suffix}`;
  }
  return null;
}

export function iconsWithTextSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isIconsWithTextContentFieldPath(path)) return nodeId;
  return iconsWithTextFieldSidebarNodeId(path) ?? nodeId;
}

export function syntheticIconsWithTextSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isIconsWithTextNestedIconNodeId(nodeId)) {
    return prepareIconsWithTextNestedIconSettingsNode({
      id: nodeId,
      label: 'Icon',
      kind: 'block',
      icon: 'image' as SidebarIcon,
    });
  }
  if (isIconsWithTextNestedHeadingNodeId(nodeId)) {
    return prepareIconsWithTextNestedHeadingSettingsNode({
      id: nodeId,
      label: 'Text',
      kind: 'block',
      icon: 'text' as SidebarIcon,
    });
  }
  if (isIconsWithTextNestedTextNodeId(nodeId)) {
    return prepareIconsWithTextNestedTextSettingsNode({
      id: nodeId,
      label: 'Text',
      kind: 'block',
      icon: 'text' as SidebarIcon,
    });
  }
  if (isIconsWithTextNestedTextGroupNodeId(nodeId)) {
    return prepareIconsWithTextNestedTextGroupSettingsNode({
      id: nodeId,
      label: 'Group',
      kind: 'block',
      icon: 'group' as SidebarIcon,
    });
  }
  if (isIconsWithTextGroupNodeId(nodeId)) {
    return prepareIconsWithTextGroupSettingsNode({
      id: nodeId,
      label: 'Group',
      kind: 'block',
      icon: 'group' as SidebarIcon,
    });
  }
  if (nodeId.startsWith('field:') && isIconsWithTextContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = iconsWithTextSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticIconsWithTextSidebarNode(mapped, _editorSchema);
  }
  return null;
}
