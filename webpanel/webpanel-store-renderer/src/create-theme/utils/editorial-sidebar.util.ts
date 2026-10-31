import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  editorialBlockFieldDefs,
  editorialBlockFieldDefsFromNodeId,
  EDITORIAL_BUTTON_FIELD_KEYS,
  EDITORIAL_CAPTION_FIELD_KEYS,
  EDITORIAL_HEADING_FIELD_KEYS,
  EDITORIAL_MEDIA_FIELD_KEYS,
  EDITORIAL_TEXT_FIELD_KEYS,
  isEditorialButtonBlockNodeId,
  isEditorialCaptionBlockNodeId,
  isEditorialContentGroupNodeId,
  isEditorialHeadingBlockNodeId,
  isEditorialMediaBlockNodeId,
  isEditorialNestedGroupNodeId,
  isEditorialSectionInstanceId,
  isEditorialTextBlockNodeId,
} from '../sidebar/theme-editor-editorial-block-panel.utils';
import {
  editorialContentGroupFieldDefs,
  prepareEditorialContentGroupSettingsNode,
} from '../sidebar/theme-editor-editorial-content-group-panel.utils';
import {
  editorialTextGroupFieldDefs,
  editorialTextGroupCustomSizeFieldDefs,
  prepareEditorialTextGroupSettingsNode,
  TEXT_GROUP_KEYS,
} from '../sidebar/theme-editor-editorial-group-panel.utils';

export const EDITORIAL_SECTION_BLOCK_ORDER = ['media', 'content', 'button'] as const;
export const EDITORIAL_CONTENT_CHILD_ORDER = ['caption', 'group'] as const;
export const EDITORIAL_GROUP_CHILD_ORDER = ['heading', 'text'] as const;

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

function editorialSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Editorial — Media; Content → Caption + Group → Heading + Text; Button. */
export function mapEditorialBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = editorialSectionBase(prefix);
  const mediaPrefix = `${prefix}:block:media`;
  const contentPrefix = `${prefix}:block:content`;
  const groupPrefix = `${contentPrefix}:nested:group`;
  const captionPrefix = `${contentPrefix}:nested:caption`;
  const headingPrefix = `${groupPrefix}:nested:heading`;
  const textPrefix = `${groupPrefix}:nested:text`;
  const buttonPrefix = `${prefix}:block:button`;

  const captionFields = editorialBlockFieldDefs(sectionBase, 'caption');
  const captionPreviewField = captionFields.find((f) => f.path.endsWith('.subheading'));
  const headingFields = editorialBlockFieldDefs(sectionBase, 'heading');
  const headingPreviewField = headingFields.find((f) => f.path.endsWith('.heading'));
  const textFields = editorialBlockFieldDefs(sectionBase, 'text');
  const textPreviewField = textFields.find((f) => f.path.endsWith('.description'));
  const buttonFields = editorialBlockFieldDefs(sectionBase, 'button');
  const buttonPreviewField = buttonFields.find((f) => f.path.endsWith('.linkLabel'));

  const groupChildren = reorderSidebarChildren(
    [
      { id: `${groupPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: headingPrefix,
        label: 'Heading',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headingFields,
      },
      {
        id: textPrefix,
        label: 'Text',
        kind: 'block',
        icon: 'text',
        preview: textPreviewField ? fieldPreview(textPreviewField, values) : undefined,
        fields: textFields,
      },
    ],
    listKeyBlockChildren(groupPrefix),
    itemOrder
  );

  const groupNode: SidebarNode = {
    id: groupPrefix,
    label: 'Group',
    kind: 'block',
    icon: 'group',
    fields: [
      ...editorialTextGroupFieldDefs(`${sectionBase}.settings`),
      ...editorialTextGroupCustomSizeFieldDefs(`${sectionBase}.settings`),
    ],
    children: groupChildren,
    childrenListKey: listKeyBlockChildren(groupPrefix),
  };

  const contentChildren = reorderSidebarChildren(
    [
      { id: `${contentPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: captionPrefix,
        label: 'Caption',
        kind: 'block',
        icon: 'text',
        preview: captionPreviewField ? fieldPreview(captionPreviewField, values) : undefined,
        fields: captionFields,
      },
      groupNode,
    ],
    listKeyBlockChildren(contentPrefix),
    itemOrder
  );

  const contentNode: SidebarNode = {
    id: contentPrefix,
    label: 'Content',
    kind: 'block',
    icon: 'group',
    fields: editorialContentGroupFieldDefs(`${sectionBase}.settings`),
    children: contentChildren,
    childrenListKey: listKeyBlockChildren(contentPrefix),
  };

  const mediaNode: SidebarNode = {
    id: mediaPrefix,
    label: 'Media',
    kind: 'block',
    icon: 'image',
    fields: editorialBlockFieldDefs(sectionBase, 'media'),
  };

  const buttonNode: SidebarNode = {
    id: buttonPrefix,
    label: 'Button',
    kind: 'block',
    icon: 'button',
    preview: buttonPreviewField ? fieldPreview(buttonPreviewField, values) : undefined,
    fields: buttonFields,
  };

  return reorderSidebarChildren(
    [mediaNode, contentNode, buttonNode],
    sectionChildrenListKey,
    itemOrder
  );
}

export function editorialStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const contentPrefix = `${prefix}:block:content`;
  const groupPrefix = `${contentPrefix}:nested:group`;
  return {
    [sectionChildrenListKey]: [`${prefix}:block:media`, contentPrefix, `${prefix}:block:button`],
    [listKeyBlockChildren(contentPrefix)]: [
      `${contentPrefix}:inner-add-block`,
      `${contentPrefix}:nested:caption`,
      groupPrefix,
    ],
    [listKeyBlockChildren(groupPrefix)]: [
      `${groupPrefix}:inner-add-block`,
      `${groupPrefix}:nested:heading`,
      `${groupPrefix}:nested:text`,
    ],
  };
}

export function editorialLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return editorialStructureOrder(prefix, sectionChildrenListKey);
}

const SECTION_LEVEL_FIELD_KEYS = new Set(['mediaPosition', 'mediaWidth', 'mediaHeight']);

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  ...Object.fromEntries([...EDITORIAL_MEDIA_FIELD_KEYS].map((key) => [key, 'media'])),
  ...Object.fromEntries([...EDITORIAL_CAPTION_FIELD_KEYS].map((key) => [key, 'content:nested:caption'])),
  ...Object.fromEntries(
    [...EDITORIAL_HEADING_FIELD_KEYS].map((key) => [key, 'content:nested:group:nested:heading'])
  ),
  ...Object.fromEntries(
    [...EDITORIAL_TEXT_FIELD_KEYS].map((key) => [key, 'content:nested:group:nested:text'])
  ),
  ...Object.fromEntries([...EDITORIAL_BUTTON_FIELD_KEYS].map((key) => [key, 'button'])),
  ...Object.fromEntries([...TEXT_GROUP_KEYS].map((key) => [key, 'content:nested:group'])),
};

function editorialFieldSidebarNodeId(settingsBase: string, blockSuffix: string): string | null {
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

function editorialSettingsBaseFromFieldPath(path: string): string | null {
  const tpl = path.match(/^(templates\.[^.]+\.sections\.[^.]+\.settings)/);
  if (tpl) return tpl[1]!;
  const layout = path.match(/^(sections\.[^.]+\.settings)/);
  if (layout) return layout[1]!;
  return null;
}

export function editorialTextGroupSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}:block:content:nested:group`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}:block:content:nested:group`;
  return null;
}

export function editorialContentGroupSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}:block:content`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}:block:content`;
  return null;
}

function editorialSectionSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}`;
  return null;
}

export function isEditorialContentFieldPath(path: string): boolean {
  if (!/editorial/.test(path) || path.includes('.blocks.')) return false;
  if (/editorial_jumbo/.test(path)) return false;
  if (/blog_posts_editorial/.test(path)) return false;
  if (/collection_list_editorial/.test(path)) return false;
  if (/\.settings\.contentGroup\./.test(path)) return true;
  if (/\.settings\.textGroup\./.test(path)) return true;
  const key = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(key)) return true;
  return key in CONTENT_FIELD_TO_BLOCK;
}

export function editorialSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isEditorialContentFieldPath(path)) return nodeId;

  if (/\.settings\.contentGroup\./.test(path)) {
    const settingsBase = editorialSettingsBaseFromFieldPath(path);
    if (settingsBase) {
      const mapped = editorialContentGroupSidebarNodeId(settingsBase);
      if (mapped) return mapped;
    }
  }

  if (/\.settings\.textGroup\./.test(path)) {
    const settingsBase = editorialSettingsBaseFromFieldPath(path);
    if (settingsBase) {
      const mapped = editorialTextGroupSidebarNodeId(settingsBase);
      if (mapped) return mapped;
    }
  }

  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(fieldKey)) {
    const sectionMapped = editorialSectionSidebarNodeId(settingsBase);
    if (sectionMapped) return sectionMapped;
  }
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return nodeId;
  const mapped = editorialFieldSidebarNodeId(settingsBase, blockSuffix);
  return mapped ?? nodeId;
}

export function syntheticEditorialSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isEditorialContentGroupNodeId(nodeId)) {
    return prepareEditorialContentGroupSettingsNode({
      id: nodeId,
      label: 'Content',
      kind: 'block',
      icon: 'group',
    });
  }

  if (isEditorialNestedGroupNodeId(nodeId)) {
    return prepareEditorialTextGroupSettingsNode({
      id: nodeId,
      label: 'Group',
      kind: 'block',
      icon: 'group',
    });
  }

  if (isEditorialMediaBlockNodeId(nodeId)) {
    const fields = editorialBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Media', kind: 'block', icon: 'image', fields };
  }

  if (isEditorialCaptionBlockNodeId(nodeId)) {
    const fields = editorialBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Caption', kind: 'block', icon: 'text', fields };
  }

  if (isEditorialHeadingBlockNodeId(nodeId)) {
    const fields = editorialBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Heading', kind: 'block', icon: 'text', fields };
  }

  if (isEditorialTextBlockNodeId(nodeId)) {
    const fields = editorialBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Text', kind: 'block', icon: 'text', fields };
  }

  if (isEditorialButtonBlockNodeId(nodeId)) {
    const fields = editorialBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Button', kind: 'block', icon: 'button', fields };
  }

  if (nodeId.startsWith('field:') && isEditorialContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = editorialSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticEditorialSidebarNode(mapped, _editorSchema);
  }
  return null;
}

export function isEditorialSectionNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) return isEditorialSectionInstanceId(layout[1]!);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return isEditorialSectionInstanceId(tpl[2]!);
  return false;
}
