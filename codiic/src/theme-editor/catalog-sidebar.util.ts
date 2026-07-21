import type { EditorFieldDef } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import {
  getSectionEditingSupport,
  parseEditingSelectionContext,
  resolveEditingPanelForNode,
} from './section-editing-support.util';
import type { EditingBlockSupport, EditingNestedSupport } from './section-editing-support.types';
import type { SidebarNode } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';

/** Block shape used by theme-editor sidebar tree (subset of schema BlockDef). */
export type CatalogSidebarBlockDef = {
  id: string;
  label: string;
  settingsFields?: EditorFieldDef[];
  blocks?: CatalogSidebarBlockDef[];
};

function nestedToBlockDefs(
  nested: Record<string, EditingNestedSupport> | undefined
): CatalogSidebarBlockDef[] | undefined {
  if (!nested) return undefined;
  return Object.entries(nested).map(([id, def]) => ({
    id,
    label: def.label,
  }));
}

function blockToSidebarDef(blockId: string, block: EditingBlockSupport): CatalogSidebarBlockDef {
  return {
    id: blockId,
    label: block.label,
    blocks: nestedToBlockDefs(block.nested),
  };
}

/** Sidebar block tree from global section-editing-support (not theme.schema.json). */
export function catalogSidebarBlocksForSectionType(sectionType: string): CatalogSidebarBlockDef[] {
  const support = getSectionEditingSupport(sectionType);
  if (!support?.blocks) return [];
  return Object.entries(support.blocks).map(([id, block]) => blockToSidebarDef(id, block));
}

export function sectionTypeUsesCatalogSidebar(sectionType: string | undefined): boolean {
  if (!sectionType) return false;
  const support = getSectionEditingSupport(sectionType);
  return Boolean(support && (support.blocks || support.fields.length > 0));
}

/** Settings panel node from catalog when available (catalog-first editing flow). */
export function settingsNodeFromCatalog(node: SidebarNode): SidebarNode | null {
  // Hero heading block uses schema-backed section settings (see prepareHeadingBlockSettingsNode).
  if (
    /^template:[^:]+:[^:]+:block:(heading(?:_\d+)?)$/.test(node.id) ||
    /^layout:[^:]+:block:(heading(?:_\d+)?)$/.test(node.id) ||
    /^template:[^:]+:[^:]+:block:(?:primary_button|secondary_button|button_\d+)$/.test(node.id) ||
    /^layout:[^:]+:block:(?:primary_button|secondary_button|button_\d+)$/.test(node.id) ||
    /^template:[^:]+:hero_main(?:_\d+)?$/.test(node.id) ||
    /^layout:hero_main(?:_\d+)?$/.test(node.id)
  ) {
    return null;
  }
  const catalog = resolveEditingPanelForNode(node.id);
  if (!catalog?.fields.length) return null;

  const ctx = parseEditingSelectionContext(node.id);
  if (!ctx) return null;
  // Layout header uses schema-merged tree fields + HeaderSettingsPanel (Shopify order).
  if (ctx.placement === 'layout' && ctx.sectionType === 'header') return null;
  if (!sectionTypeUsesCatalogSidebar(ctx.sectionType)) return null;

  return {
    ...node,
    label: catalog.label,
    kind: catalog.kind,
    fields: catalog.fields,
  };
}
