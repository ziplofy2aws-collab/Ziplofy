import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';

export function isFaqAccordionRowNestedNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:[^:]+:block:accordion:nested:[^:]+$/.test(nodeId) ||
    /^layout:[^:]+:block:accordion:nested:[^:]+$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(/^template:([^:]+):([^:]+):block:accordion:nested:([^:]+)$/);
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.accordion.blocks.${template[3]}`;
  }
  const layout = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+)$/);
  if (layout) return `sections.${layout[1]}.blocks.accordion.blocks.${layout[2]}`;
  return null;
}

export function faqAccordionRowFieldDefs(blocksBase: string): EditorFieldDef[] {
  return [
    {
      path: `${blocksBase}.settings.question`,
      type: 'text',
      label: 'Question',
      group: 'Content',
      sidebar: true,
    },
    {
      path: `${blocksBase}.settings.answer`,
      type: 'textarea',
      label: 'Answer',
      group: 'Content',
      sidebar: true,
    },
  ];
}

export function faqAccordionRowFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? faqAccordionRowFieldDefs(base) : [];
}

export function faqAccordionRowFieldDefsFromSchema(
  schema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  const tplMatch = nodeId.match(/^template:([^:]+):([^:]+):/);
  const defs = faqAccordionRowFieldDefs(base);
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

export function isFaqAccordionRowField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'question' || key === 'answer';
}

export function prepareFaqAccordionRowSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter(isFaqAccordionRowField);
  return { ...node, label: 'Accordion row', kind: 'block', fields };
}
