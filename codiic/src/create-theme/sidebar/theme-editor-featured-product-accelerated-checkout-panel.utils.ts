import type { SidebarNode } from './create-theme-sidebar.types';

export function isFeaturedProductAcceleratedCheckoutNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:buy_buttons:nested:accelerated_checkout$/.test(
    nodeId
  );
}

export function prepareFeaturedProductAcceleratedCheckoutSettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Accelerated checkout', kind: 'block', fields: [] };
}
