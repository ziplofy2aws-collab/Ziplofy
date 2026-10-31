import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

export type ParsedProductHotspotsHotspotBlock = {
  sectionBase: string;
  blockId: string;
  blockSettingsBase: string;
};

export function parseProductHotspotsHotspotBlockNodeId(
  nodeId: string
): ParsedProductHotspotsHotspotBlock | null {
  const template = nodeId.match(/^template:([^:]+):([^:]+):block:(.+)$/);
  if (template) {
    const [, tplId, secId, blockId] = template;
    const sectionBase = `templates.${tplId}.sections.${secId}`;
    return {
      sectionBase,
      blockId: blockId!,
      blockSettingsBase: `${sectionBase}.blocks.${blockId}.settings`,
    };
  }

  const layout = nodeId.match(/^layout:([^:]+):block:(.+)$/);
  if (layout) {
    const [, secId, blockId] = layout;
    const sectionBase = `sections.${secId}`;
    return {
      sectionBase,
      blockId: blockId!,
      blockSettingsBase: `${sectionBase}.blocks.${blockId}.settings`,
    };
  }

  return null;
}

function isProductHotspotsSectionInstanceId(sectionInstanceId: string): boolean {
  return /product_hotspots/i.test(sectionInstanceId);
}

export function isProductHotspotsHotspotBlockNodeId(nodeId: string): boolean {
  const parsed = parseProductHotspotsHotspotBlockNodeId(nodeId);
  if (!parsed) return false;
  const secId = parsed.sectionBase.split('.').pop() ?? '';
  return isProductHotspotsSectionInstanceId(secId);
}

export function productHotspotsHotspotDefaultSettings(): Record<string, string | number> {
  return {
    productId: '',
    productImageUrl: '',
    positionX: 50,
    positionY: 50,
    productTitle: 'Product title',
    price: 'Rs. 19.99',
  };
}

export function productHotspotsHotspotFieldDefs(blockSettingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blockSettingsBase}.${key}`;
  return [
    {
      path: s('productId'),
      type: 'text',
      label: 'Product',
      group: 'Product',
      widget: 'product',
      sidebar: true,
    },
    {
      path: s('positionX'),
      type: 'number',
      label: 'Horizontal position',
      group: 'Position',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 0.1,
      sidebar: true,
    },
    {
      path: s('positionY'),
      type: 'number',
      label: 'Vertical position',
      group: 'Position',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 0.1,
      sidebar: true,
    },
  ];
}

export function productHotspotsHotspotFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const parsed = parseProductHotspotsHotspotBlockNodeId(nodeId);
  if (!parsed) return [];
  return productHotspotsHotspotFieldDefs(parsed.blockSettingsBase);
}

export function isProductHotspotsHotspotBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'productId' || key === 'positionX' || key === 'positionY';
}

export function isProductHotspotsHotspotBlockFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('positionX') && keys.has('positionY');
}

export function prepareProductHotspotsHotspotSettingsNode(node: SidebarNode): SidebarNode {
  const fields = productHotspotsHotspotFieldDefsFromNodeId(node.id);
  return { ...node, label: 'Hotspot', kind: 'block', fields };
}

export function mergeProductHotspotsHotspotSettings(
  settings: Record<string, unknown>
): boolean {
  const defaults = productHotspotsHotspotDefaultSettings();
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    if (settings[key] === undefined) {
      settings[key] = value;
      changed = true;
    }
  }
  return changed;
}
