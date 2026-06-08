import type { SidebarNode } from './create-theme-sidebar.types';

export function isFeaturedProductQuantityNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:buy_buttons:nested:quantity$/.test(nodeId);
}

export function prepareFeaturedProductQuantitySettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Quantity', kind: 'block', fields: [] };
}
