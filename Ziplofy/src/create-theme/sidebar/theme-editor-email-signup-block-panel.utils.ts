import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

export type EmailSignupBlockKind = 'heading' | 'text' | 'signup';

export function isEmailSignupSectionInstanceId(secId: string): boolean {
  return secId.includes('email_signup');
}

export function emailSignupSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:heading|text|signup)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isEmailSignupSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:heading|text|signup)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isEmailSignupSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function emailSignupBlockKindFromNodeId(nodeId: string): EmailSignupBlockKind | null {
  if (/:block:heading$/.test(nodeId)) return 'heading';
  if (/:block:text$/.test(nodeId)) return 'text';
  if (/:block:signup$/.test(nodeId)) return 'signup';
  return null;
}

export function isEmailSignupSectionBlockNodeId(nodeId: string): boolean {
  return emailSignupBlockKindFromNodeId(nodeId) !== null;
}

export function emailSignupBlockFieldDefs(
  sectionBase: string,
  blockKind: EmailSignupBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'heading') {
    return [{ path: s('title'), type: 'text', label: 'Heading', group: 'Content', sidebar: true }];
  }
  if (blockKind === 'text') {
    return [{ path: s('subtitle'), type: 'text', label: 'Text', group: 'Content', sidebar: true }];
  }
  return [
    {
      path: s('placeholder'),
      type: 'text',
      label: 'Email placeholder',
      group: 'Content',
      sidebar: true,
    },
  ];
}

export function emailSignupBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = emailSignupSectionBaseFromNodeId(nodeId);
  const blockKind = emailSignupBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return emailSignupBlockFieldDefs(sectionBase, blockKind);
}

export function isEmailSignupSectionBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/email_signup/.test(field.path) || field.path.includes('.blocks.')) return false;
  return key === 'title' || key === 'subtitle' || key === 'placeholder';
}

export function isEmailSignupSectionBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isEmailSignupSectionBlockField);
}

export function prepareEmailSignupSectionBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = emailSignupBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'heading'
      ? 'Heading'
      : blockKind === 'text'
        ? 'Text'
        : blockKind === 'signup'
          ? 'Email signup'
          : node.label;
  const fromNode = emailSignupBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isEmailSignupSectionBlockField);
  return { ...node, label, kind: 'block', fields };
}
