import type { EditorFieldDef, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import { reorderSidebarChildren } from '../create-theme/sidebar/create-theme-structure-order';
import { productHotspotsHotspotFieldDefs } from '../create-theme/sidebar/theme-editor-product-hotspots-block-panel.utils';

function fieldPreview(
  field: EditorFieldDef,
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (field.type === 'boolean') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function getNested(
  obj: Record<string, unknown> | null | undefined,
  path: string[]
): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function readConfigBlockOrder(
  config: Record<string, unknown> | null,
  blockOrderPath: string[]
): string[] {
  if (!config) return [];
  const order = getNested(config, blockOrderPath);
  if (!Array.isArray(order)) return [];
  const blocksPath = [...blockOrderPath.slice(0, -1), 'blocks'];
  const blocks = getNested(config, blocksPath) as Record<string, unknown> | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

/** Shopify Product hotspots sidebar: Heading → Add block → Hotspot blocks. */
export function mapProductHotspotsBlockNodes(
  prefix: string,
  settingsBase: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  config: Record<string, unknown> | null,
  blockOrderPath: string[]
): SidebarNode[] {
  const headingField: EditorFieldDef = {
    path: `${settingsBase}.heading`,
    type: 'text',
    label: 'Heading',
  };
  const headingNode: SidebarNode = {
    id: `field:${headingField.path}`,
    label: headingField.label,
    kind: 'field',
    icon: 'text',
    fields: [headingField],
    preview: fieldPreview(headingField, values),
  };
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };

  const order = readConfigBlockOrder(config, blockOrderPath);
  const blocksRecord = (getNested(config, [...blockOrderPath.slice(0, -1), 'blocks']) ??
    {}) as Record<string, unknown>;
  const ids = order.length ? order : Object.keys(blocksRecord);

  const hotspotNodes: SidebarNode[] = ids.map((blockId) => {
    const blockSettingsBase = `${blocksBase}.${blockId}.settings`;
    const fields = productHotspotsHotspotFieldDefs(blockSettingsBase);
    return {
      id: `${prefix}:block:${blockId}`,
      label: 'Hotspot',
      kind: 'block' as const,
      icon: 'section',
      fields,
      showVisibilityToggle: true,
      showDeleteButton: true,
    };
  });

  return [headingNode, addBlock, ...hotspotNodes];
}

export function productHotspotsStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  settingsBase: string,
  config: Record<string, unknown> | null,
  blockOrderPath: string[]
): Record<string, string[]> {
  const headingNodeId = `field:${settingsBase}.heading`;
  const blockOrder = readConfigBlockOrder(config, blockOrderPath);
  const blocksRecord = (getNested(config, [...blockOrderPath.slice(0, -1), 'blocks']) ??
    {}) as Record<string, unknown>;
  const ids = blockOrder.length ? blockOrder : Object.keys(blocksRecord);

  return {
    [sectionChildrenListKey]: [
      headingNodeId,
      `${prefix}:add-block`,
      ...ids.map((id) => `${prefix}:block:${id}`),
    ],
  };
}
