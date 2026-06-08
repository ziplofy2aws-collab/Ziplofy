import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';
import {
  groupTextBlockPanelFields,
  isTextBlockPanelField,
  isTextBlockPanelFields,
  sortTextBlockPanelFields,
  textBlockDefaultSettings,
  textBlockFieldDefs,
} from './theme-editor-text-block-panel.utils';

export {
  groupTextBlockPanelFields,
  isTextBlockPanelFields,
  TEXT_BLOCK_PANEL_GROUP_ORDER,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
} from './theme-editor-text-block-panel.utils';

export function isFaqAccordionRowTextNestedNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:[^:]+:block:accordion:nested:[^:]+:nested:[^:]+$/.test(nodeId) ||
    /^layout:[^:]+:block:accordion:nested:[^:]+:nested:[^:]+$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(
    /^template:([^:]+):([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/
  );
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.accordion.blocks.${template[3]}.blocks.${template[4]}`;
  }
  const layout = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/);
  if (layout) {
    return `sections.${layout[1]}.blocks.accordion.blocks.${layout[2]}.blocks.${layout[3]}`;
  }
  return null;
}

export function faqAccordionRowTextDefaultSettings(text = ''): Record<string, string | number | boolean> {
  return textBlockDefaultSettings(text);
}

export function faqAccordionRowTextFieldDefs(blocksBase: string): EditorFieldDef[] {
  return textBlockFieldDefs(blocksBase);
}

export function faqAccordionRowTextFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? faqAccordionRowTextFieldDefs(base) : [];
}

export function faqAccordionRowTextFieldDefsFromSchema(
  schema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  const tplMatch = nodeId.match(/^template:([^:]+):([^:]+):/);
  const defs = faqAccordionRowTextFieldDefs(base);
  if (tplMatch) {
    return defs.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplMatch[1], tplMatch[2]),
    }));
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+):/);
  if (layoutMatch) {
    return defs.map((f) => ({
      ...f,
      path: f.path.replace('sections.faq_section', `sections.${layoutMatch[1]}`),
    }));
  }
  return defs;
}

export function isFaqAccordionRowTextField(field: EditorFieldDef): boolean {
  return isTextBlockPanelField(field);
}

export function prepareFaqAccordionRowTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortTextBlockPanelFields((node.fields ?? []).filter(isTextBlockPanelField));
  return { ...node, label: 'Text', kind: 'block', fields };
}
