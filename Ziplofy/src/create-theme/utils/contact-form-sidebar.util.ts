import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  contactFormBlockFieldDefs,
  contactFormBlockFieldDefsFromNodeId,
  isContactFormFormGroupNodeId,
  isContactFormSectionInstanceId,
} from '../sidebar/theme-editor-contact-form-block-panel.utils';

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

function contactFormSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Contact form — Add block → Text → Contact form → Submit button. */
export function mapContactFormBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = contactFormSectionBase(prefix);
  const sectionAddBlockId = `${prefix}:add-block`;
  const formPrefix = `${prefix}:block:form`;

  const titleFields = contactFormBlockFieldDefs(sectionBase, 'heading_text');
  const titlePreviewField = titleFields.find((f) => f.path.endsWith('.title'));

  const formChildren = reorderSidebarChildren(
    [
      {
        id: `${formPrefix}:nested:submit_button`,
        label: 'Submit button',
        kind: 'block',
        icon: 'button',
        fields: contactFormBlockFieldDefs(sectionBase, 'submit_button'),
      },
    ],
    listKeyBlockChildren(formPrefix),
    itemOrder
  );

  const formNode: SidebarNode = {
    id: formPrefix,
    label: 'Contact form',
    kind: 'block',
    icon: 'group',
    children: formChildren,
    childrenListKey: listKeyBlockChildren(formPrefix),
  };

  const headingNode: SidebarNode = {
    id: `${prefix}:block:heading`,
    label: 'Text',
    kind: 'block',
    icon: 'text',
    preview: titlePreviewField ? fieldPreview(titlePreviewField, values) : undefined,
    fields: titleFields,
  };

  return reorderSidebarChildren(
    [
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
      headingNode,
      formNode,
    ],
    sectionChildrenListKey,
    itemOrder
  );
}

export function contactFormStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const formPrefix = `${prefix}:block:form`;
  return {
    [sectionChildrenListKey]: [`${prefix}:add-block`, `${prefix}:block:heading`, `${prefix}:block:form`],
    [listKeyBlockChildren(formPrefix)]: [`${formPrefix}:nested:submit_button`],
  };
}

export function contactFormLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return contactFormStructureOrder(prefix, sectionChildrenListKey);
}

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  title: 'heading',
  submitLabel: 'submit_button',
};

function contactFormFieldSidebarNodeId(settingsBase: string, fieldKey: string): string | null {
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return null;
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) {
    const nodePrefix = `template:${tpl[1]}:${tpl[2]}`;
    return blockSuffix === 'heading'
      ? `${nodePrefix}:block:heading`
      : `${nodePrefix}:block:form:nested:submit_button`;
  }
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) {
    const nodePrefix = `layout:${layout[1]}`;
    return blockSuffix === 'heading'
      ? `${nodePrefix}:block:heading`
      : `${nodePrefix}:block:form:nested:submit_button`;
  }
  return null;
}

export function isContactFormContentFieldPath(path: string): boolean {
  const key = path.split('.').pop() ?? '';
  return key in CONTENT_FIELD_TO_BLOCK && /contact_form/.test(path);
}

export function contactFormSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isContactFormContentFieldPath(path)) return nodeId;
  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  const mapped = contactFormFieldSidebarNodeId(settingsBase, fieldKey);
  return mapped ?? nodeId;
}

export function contactFormHeadingTextSidebarNode(nodeId: string): SidebarNode | null {
  if (!/:block:heading$/.test(nodeId)) return null;
  const fields = contactFormBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Text', kind: 'block', icon: 'text', fields };
}

export function contactFormSubmitButtonSidebarNode(nodeId: string): SidebarNode | null {
  if (!/:block:form:nested:submit_button$/.test(nodeId)) return null;
  const fields = contactFormBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Submit button', kind: 'block', icon: 'button', fields };
}

export function contactFormFormGroupSidebarNode(nodeId: string): SidebarNode | null {
  if (!isContactFormFormGroupNodeId(nodeId)) return null;
  return { id: nodeId, label: 'Contact form', kind: 'block', icon: 'group' };
}

export function syntheticContactFormSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  const heading = contactFormHeadingTextSidebarNode(nodeId);
  if (heading) return heading;
  const submit = contactFormSubmitButtonSidebarNode(nodeId);
  if (submit) return submit;
  const formGroup = contactFormFormGroupSidebarNode(nodeId);
  if (formGroup) return formGroup;
  if (nodeId.startsWith('field:') && isContactFormContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = contactFormSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticContactFormSidebarNode(mapped, _editorSchema);
  }
  return null;
}

export function isContactFormSectionNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) return isContactFormSectionInstanceId(layout[1]!);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return isContactFormSectionInstanceId(tpl[2]!);
  return false;
}
