import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  editorialJumboBlockFieldDefs,
  editorialJumboBlockFieldDefsFromNodeId,
  EDITORIAL_JUMBO_JUMBO_TEXT_FIELD_KEYS,
  EDITORIAL_JUMBO_MEDIA_FIELD_KEYS,
  isEditorialJumboContentGroupNodeId,
  isEditorialJumboJumboTextBlockNodeId,
  isEditorialJumboMediaBlockNodeId,
  isEditorialJumboSectionInstanceId,
} from '../sidebar/theme-editor-editorial-jumbo-block-panel.utils';
import {
  editorialJumboContentGroupFieldDefs,
  prepareEditorialJumboContentGroupSettingsNode,
} from '../sidebar/theme-editor-editorial-jumbo-content-group-panel.utils';

export const EDITORIAL_JUMBO_SECTION_BLOCK_ORDER = ['media', 'content'] as const;
export const EDITORIAL_JUMBO_CONTENT_CHILD_ORDER = ['jumbo_text'] as const;

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

function titleCasePreview(raw: string): string {
  const text = raw.trim();
  if (!text) return '';
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function editorialJumboSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Editorial: Jumbo text — Media; Content → Add block → Jumbo text. */
export function mapEditorialJumboBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = editorialJumboSectionBase(prefix);
  const mediaPrefix = `${prefix}:block:media`;
  const contentPrefix = `${prefix}:block:content`;
  const jumboTextPrefix = `${contentPrefix}:nested:jumbo_text`;

  const jumboTextFields = editorialJumboBlockFieldDefs(sectionBase, 'jumbo_text');
  const headlinePreviewField = jumboTextFields.find((f) => f.path.endsWith('.headline'));
  const headlineRaw = headlinePreviewField ? values[headlinePreviewField.path] : undefined;
  const headlinePreview =
    headlineRaw !== undefined && headlineRaw !== ''
      ? titleCasePreview(String(headlineRaw))
      : headlinePreviewField
        ? fieldPreview(headlinePreviewField, values)
        : undefined;

  const contentChildren = reorderSidebarChildren(
    [
      { id: `${contentPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: jumboTextPrefix,
        label: 'Jumbo text',
        kind: 'block',
        icon: 'text',
        preview: headlinePreview,
        fields: jumboTextFields,
      },
    ],
    listKeyBlockChildren(contentPrefix),
    itemOrder
  );

  const contentNode: SidebarNode = {
    id: contentPrefix,
    label: 'Content',
    kind: 'block',
    icon: 'group',
    fields: editorialJumboContentGroupFieldDefs(`${sectionBase}.settings`),
    children: contentChildren,
    childrenListKey: listKeyBlockChildren(contentPrefix),
  };

  const mediaNode: SidebarNode = {
    id: mediaPrefix,
    label: 'Media',
    kind: 'block',
    icon: 'image',
    fields: editorialJumboBlockFieldDefs(sectionBase, 'media'),
  };

  return reorderSidebarChildren([mediaNode, contentNode], sectionChildrenListKey, itemOrder);
}

export function editorialJumboStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const contentPrefix = `${prefix}:block:content`;
  return {
    [sectionChildrenListKey]: [`${prefix}:block:media`, contentPrefix],
    [listKeyBlockChildren(contentPrefix)]: [
      `${contentPrefix}:inner-add-block`,
      `${contentPrefix}:nested:jumbo_text`,
    ],
  };
}

export function editorialJumboLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return editorialJumboStructureOrder(prefix, sectionChildrenListKey);
}

const SECTION_LEVEL_FIELD_KEYS = new Set(['mediaPosition', 'mediaWidth', 'mediaHeight']);

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  ...Object.fromEntries([...EDITORIAL_JUMBO_MEDIA_FIELD_KEYS].map((key) => [key, 'media'])),
  ...Object.fromEntries(
    [...EDITORIAL_JUMBO_JUMBO_TEXT_FIELD_KEYS].map((key) => [key, 'content:nested:jumbo_text'])
  ),
};

function editorialJumboSectionSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}`;
  return null;
}

function editorialJumboFieldSidebarNodeId(settingsBase: string, blockSuffix: string): string | null {
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

function editorialJumboSettingsBaseFromFieldPath(path: string): string | null {
  const tpl = path.match(/^(templates\.[^.]+\.sections\.[^.]+\.settings)/);
  if (tpl) return tpl[1]!;
  const layout = path.match(/^(sections\.[^.]+\.settings)/);
  if (layout) return layout[1]!;
  return null;
}

export function editorialJumboContentGroupSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}:block:content`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}:block:content`;
  return null;
}

export function isEditorialJumboContentFieldPath(path: string): boolean {
  if (!/editorial_jumbo/.test(path) || path.includes('.blocks.')) return false;
  if (/\.settings\.contentGroup\./.test(path)) return true;
  const key = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(key)) return true;
  return key in CONTENT_FIELD_TO_BLOCK;
}

export function editorialJumboSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isEditorialJumboContentFieldPath(path)) return nodeId;

  if (/\.settings\.contentGroup\./.test(path)) {
    const settingsBase = editorialJumboSettingsBaseFromFieldPath(path);
    if (settingsBase) {
      const mapped = editorialJumboContentGroupSidebarNodeId(settingsBase);
      if (mapped) return mapped;
    }
  }

  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(fieldKey)) {
    const sectionMapped = editorialJumboSectionSidebarNodeId(settingsBase);
    if (sectionMapped) return sectionMapped;
  }
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return nodeId;
  const mapped = editorialJumboFieldSidebarNodeId(settingsBase, blockSuffix);
  return mapped ?? nodeId;
}

export function syntheticEditorialJumboSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isEditorialJumboContentGroupNodeId(nodeId)) {
    return prepareEditorialJumboContentGroupSettingsNode({
      id: nodeId,
      label: 'Content',
      kind: 'block',
      icon: 'group',
    });
  }

  if (isEditorialJumboMediaBlockNodeId(nodeId)) {
    const fields = editorialJumboBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Media', kind: 'block', icon: 'image', fields };
  }

  if (isEditorialJumboJumboTextBlockNodeId(nodeId)) {
    const fields = editorialJumboBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Jumbo text', kind: 'block', icon: 'text', fields };
  }

  if (nodeId.startsWith('field:') && isEditorialJumboContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = editorialJumboSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticEditorialJumboSidebarNode(mapped, _editorSchema);
  }
  return null;
}

export function isEditorialJumboSectionNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) return isEditorialJumboSectionInstanceId(layout[1]!);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return isEditorialJumboSectionInstanceId(tpl[2]!);
  return false;
}
