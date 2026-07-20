import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import { reorderSidebarChildren } from '../sidebar/create-theme-structure-order';
import {
  emailSignupBlockFieldDefs,
  emailSignupBlockFieldDefsFromNodeId,
  isEmailSignupSectionInstanceId,
} from '../sidebar/theme-editor-email-signup-block-panel.utils';

function fieldPreview(
  field: EditorFieldDef,
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (field.type === 'boolean') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function emailSignupSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Email signup — Add block → Heading → Text → Email signup. */
export function mapEmailSignupBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = emailSignupSectionBase(prefix);
  const sectionAddBlockId = `${prefix}:add-block`;

  const headingFields = emailSignupBlockFieldDefs(sectionBase, 'heading');
  const textFields = emailSignupBlockFieldDefs(sectionBase, 'text');
  const headingPreviewField = headingFields.find((f) => f.path.endsWith('.title'));
  const textPreviewField = textFields.find((f) => f.path.endsWith('.subtitle'));

  return reorderSidebarChildren(
    [
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
      {
        id: `${prefix}:block:heading`,
        label: 'Heading',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headingFields,
      },
      {
        id: `${prefix}:block:text`,
        label: 'Text',
        kind: 'block',
        icon: 'text',
        preview: textPreviewField ? fieldPreview(textPreviewField, values) : undefined,
        fields: textFields,
      },
      {
        id: `${prefix}:block:signup`,
        label: 'Email signup',
        kind: 'block',
        icon: 'section',
        fields: emailSignupBlockFieldDefs(sectionBase, 'signup'),
      },
    ],
    sectionChildrenListKey,
    itemOrder
  );
}

export function emailSignupStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      `${prefix}:block:heading`,
      `${prefix}:block:text`,
      `${prefix}:block:signup`,
    ],
  };
}

export function emailSignupLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return emailSignupStructureOrder(prefix, sectionChildrenListKey);
}

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  title: 'heading',
  subtitle: 'text',
  placeholder: 'signup',
};

function emailSignupFieldSidebarNodeId(settingsBase: string, fieldKey: string): string | null {
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return null;
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) {
    return `template:${tpl[1]}:${tpl[2]}:block:${blockSuffix}`;
  }
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) {
    return `layout:${layout[1]}:block:${blockSuffix}`;
  }
  return null;
}

export function isEmailSignupContentFieldPath(path: string): boolean {
  const key = path.split('.').pop() ?? '';
  return key in CONTENT_FIELD_TO_BLOCK && /email_signup/.test(path) && !path.includes('.blocks.');
}

export function emailSignupSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isEmailSignupContentFieldPath(path)) return nodeId;
  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  const mapped = emailSignupFieldSidebarNodeId(settingsBase, fieldKey);
  return mapped ?? nodeId;
}

export function emailSignupHeadingSidebarNode(nodeId: string): SidebarNode | null {
  if (!/:block:heading$/.test(nodeId)) return null;
  const fields = emailSignupBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Heading', kind: 'block', icon: 'text', fields };
}

export function emailSignupTextSidebarNode(nodeId: string): SidebarNode | null {
  if (!/:block:text$/.test(nodeId)) return null;
  const fields = emailSignupBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Text', kind: 'block', icon: 'text', fields };
}

export function emailSignupFormSidebarNode(nodeId: string): SidebarNode | null {
  if (!/:block:signup$/.test(nodeId)) return null;
  const fields = emailSignupBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Email signup', kind: 'block', icon: 'section', fields };
}

export function syntheticEmailSignupSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  const heading = emailSignupHeadingSidebarNode(nodeId);
  if (heading) return heading;
  const text = emailSignupTextSidebarNode(nodeId);
  if (text) return text;
  const signup = emailSignupFormSidebarNode(nodeId);
  if (signup) return signup;
  if (nodeId.startsWith('field:') && isEmailSignupContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = emailSignupSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticEmailSignupSidebarNode(mapped, _editorSchema);
  }
  return null;
}

export function isEmailSignupSectionNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) return isEmailSignupSectionInstanceId(layout[1]!);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return isEmailSignupSectionInstanceId(tpl[2]!);
  return false;
}
