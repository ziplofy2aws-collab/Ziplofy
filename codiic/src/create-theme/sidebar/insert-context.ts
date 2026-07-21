/** Insert targets for create-theme (independent of dev add-section catalog). */

export type SectionCatalogGroup = 'header' | 'template' | 'footer';

export type SectionInsertContext = {
  groupId: SectionCatalogGroup;
  groupLabel: string;
  afterNodeId?: string;
  beforeNodeId?: string;
};

export function resolveSectionCatalogGroupFromNodeId(nodeId: string): {
  groupId: SectionCatalogGroup;
  groupLabel: string;
} {
  if (nodeId.startsWith('layout:footer') || nodeId === 'layout:footer_utilities') {
    return { groupId: 'footer', groupLabel: 'Footer' };
  }
  if (nodeId.startsWith('layout:')) {
    return { groupId: 'header', groupLabel: 'Header' };
  }
  if (nodeId.startsWith('template:')) {
    return { groupId: 'template', groupLabel: 'Template' };
  }
  return { groupId: 'template', groupLabel: 'Template' };
}

export function resolveAddSectionGroup(nodeId: string): {
  groupId: SectionCatalogGroup;
  groupLabel: string;
} {
  if (nodeId === 'layout:add-section') {
    return { groupId: 'header', groupLabel: 'Header' };
  }
  if (nodeId === 'layout:footer-group:add-section') {
    return { groupId: 'footer', groupLabel: 'Footer' };
  }
  if (nodeId.includes(':add-section')) {
    return { groupId: 'template', groupLabel: 'Template' };
  }
  return { groupId: 'template', groupLabel: 'Template' };
}
