import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

export type ContactFormBlockKind = 'heading_text' | 'submit_button';

export function isContactFormSectionInstanceId(secId: string): boolean {
  return secId.includes('contact_form');
}

export function contactFormSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:heading|form)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isContactFormSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:heading|form)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isContactFormSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function contactFormBlockKindFromNodeId(nodeId: string): ContactFormBlockKind | null {
  if (/:block:heading$/.test(nodeId)) return 'heading_text';
  if (/:block:form:nested:submit_button$/.test(nodeId)) return 'submit_button';
  return null;
}

export function isContactFormBlockNodeId(nodeId: string): boolean {
  return contactFormBlockKindFromNodeId(nodeId) !== null;
}

export function isContactFormFormGroupNodeId(nodeId: string): boolean {
  return /:block:form$/.test(nodeId) && contactFormSectionBaseFromNodeId(nodeId) !== null;
}

export function contactFormBlockFieldDefs(
  sectionBase: string,
  blockKind: ContactFormBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'heading_text') {
    return [
      {
        path: s('title'),
        type: 'text',
        label: 'Text',
        group: 'Content',
        sidebar: true,
      },
    ];
  }
  return [
    {
      path: s('submitLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
  ];
}

export function contactFormBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = contactFormSectionBaseFromNodeId(nodeId);
  const blockKind = contactFormBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return contactFormBlockFieldDefs(sectionBase, blockKind);
}

export function isContactFormBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/contact_form/.test(field.path) || field.path.includes('.blocks.')) return false;
  return key === 'title' || key === 'submitLabel';
}

export function isContactFormBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isContactFormBlockField);
}

export function prepareContactFormBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = contactFormBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'heading_text' ? 'Text' : blockKind === 'submit_button' ? 'Submit button' : node.label;
  const fromNode = contactFormBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isContactFormBlockField);
  return { ...node, label, kind: 'block', fields };
}
