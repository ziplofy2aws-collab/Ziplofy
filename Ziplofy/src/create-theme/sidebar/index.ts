export { default as CreateThemeEditorSidebar } from './CreateThemeEditorSidebar';
export type { CreateThemeEditorSidebarProps } from './CreateThemeEditorSidebar';
export type {
  EditorSchemaDoc,
  SidebarNode,
  ThemeEditorSidebarTab,
} from './create-theme-sidebar.types';
export {
  buildEmptyShopifySidebarTree,
  buildShopifySidebarTree,
  withCreatorSidebarDeleteFlags,
  buildThemeSettingsSidebarTree,
  defaultExpandedSidebar,
  findSidebarNode,
  resolveAddBlockSectionLabel,
  settingsNodeForSelection,
} from './create-theme-sidebar.tree';
export {
  applyStructureOrderToConfig,
  mergeItemOrder,
  readStructureOrderFromConfig,
} from './create-theme-structure-order';
export type { SectionInsertContext, SectionCatalogGroup } from './insert-context';
export {
  resolveAddSectionGroup,
  resolveSectionCatalogGroupFromNodeId,
} from './insert-context';
