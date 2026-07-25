import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  imageWithTextBlockFieldDefs,
  imageWithTextBlockFieldDefsFromNodeId,
  isImageWithTextButtonBlockNodeId,
  isImageWithTextGroupNodeId,
  isImageWithTextHeadingBlockNodeId,
  isImageWithTextImageBlockNodeId,
  isImageWithTextSectionInstanceId,
  isImageWithTextTextBlockNodeId,
  prepareImageWithTextGroupSettingsNode,
} from '../sidebar/theme-editor-image-with-text-block-panel.utils';

export const IMAGE_WITH_TEXT_SECTION_BLOCK_ORDER = ['image', 'group'] as const;
export const IMAGE_WITH_TEXT_GROUP_CHILD_ORDER = ['heading', 'text', 'button'] as const;

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

export type ImageWithTextSidebarPaths = {
  prefix: string;
  settingsBase: string;
};

export function imageWithTextSidebarPathsFromNodeId(
  nodeId: string
): ImageWithTextSidebarPaths | null {
  const layout = nodeId.match(/^layout:([^:]+)/);
  if (layout) {
    const instanceId = layout[1]!;
    if (!isImageWithTextSectionInstanceId(instanceId)) return null;
    return {
      prefix: `layout:${instanceId}`,
      settingsBase: `sections.${instanceId}.settings`,
    };
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)/);
  if (tpl) {
    const [, templateId, sectionId] = tpl;
    if (!isImageWithTextSectionInstanceId(sectionId)) return null;
    return {
      prefix: `template:${templateId}:${sectionId}`,
      settingsBase: `templates.${templateId}.sections.${sectionId}.settings`,
    };
  }
  return null;
}

function imageWithTextSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Image with text — Add block → Image; Group → Add block → Heading → Text → Button. */
export function mapImageWithTextBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = imageWithTextSectionBase(prefix);
  const sectionAddBlockId = `${prefix}:add-block`;
  const imagePrefix = `${prefix}:block:image`;
  const groupPrefix = `${prefix}:block:group`;

  const headingFields = imageWithTextBlockFieldDefs(sectionBase, 'heading');
  const headingPreviewField = headingFields.find((f) => f.path.endsWith('.heading'));
  const textFields = imageWithTextBlockFieldDefs(sectionBase, 'text');
  const textPreviewField = textFields.find((f) => f.path.endsWith('.description'));
  const buttonFields = imageWithTextBlockFieldDefs(sectionBase, 'button');
  const buttonPreviewField = buttonFields.find((f) => f.path.endsWith('.buttonLabel'));

  const groupChildren = reorderSidebarChildren(
    [
      { id: `${groupPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${groupPrefix}:nested:heading`,
        label: 'Heading',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headingFields,
      },
      {
        id: `${groupPrefix}:nested:text`,
        label: 'Text',
        kind: 'block',
        icon: 'text',
        preview: textPreviewField ? fieldPreview(textPreviewField, values) : undefined,
        fields: textFields,
      },
      {
        id: `${groupPrefix}:nested:button`,
        label: 'Button',
        kind: 'block',
        icon: 'button',
        preview: buttonPreviewField ? fieldPreview(buttonPreviewField, values) : undefined,
        fields: buttonFields,
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
    children: groupChildren,
    childrenListKey: listKeyBlockChildren(groupPrefix),
  };

  const imageNode: SidebarNode = {
    id: imagePrefix,
    label: 'Image',
    kind: 'block',
    icon: 'image',
    fields: imageWithTextBlockFieldDefs(sectionBase, 'image'),
  };

  return reorderSidebarChildren(
    [
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
      imageNode,
      groupNode,
    ],
    sectionChildrenListKey,
    itemOrder
  );
}

export function imageWithTextStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const groupPrefix = `${prefix}:block:group`;
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      `${prefix}:block:image`,
      `${prefix}:block:group`,
    ],
    [listKeyBlockChildren(groupPrefix)]: [
      `${groupPrefix}:inner-add-block`,
      `${groupPrefix}:nested:heading`,
      `${groupPrefix}:nested:text`,
      `${groupPrefix}:nested:button`,
    ],
  };
}

export function imageWithTextLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return imageWithTextStructureOrder(prefix, sectionChildrenListKey);
}

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  imageUrl: 'image',
  imageLinkUrl: 'image',
  imageAspectRatio: 'image',
  imageDesktopWidth: 'image',
  imageDesktopCustomWidth: 'image',
  imageMobileWidth: 'image',
  imageMobileCustomWidth: 'image',
  imageBorderStyle: 'image',
  imageBorderThickness: 'image',
  imageBorderOpacity: 'image',
  imageBorderColor: 'image',
  imageCornerRadius: 'image',
  imagePaddingTop: 'image',
  imagePaddingBottom: 'image',
  imagePaddingLeft: 'image',
  imagePaddingRight: 'image',
  heading: 'heading',
  headingWidth: 'heading',
  headingMaxWidth: 'heading',
  headingTypographyPreset: 'heading',
  headingColor: 'heading',
  headingBackgroundEnabled: 'heading',
  headingPaddingTop: 'heading',
  headingPaddingBottom: 'heading',
  headingPaddingLeft: 'heading',
  headingPaddingRight: 'heading',
  description: 'text',
  descriptionWidth: 'text',
  descriptionMaxWidth: 'text',
  descriptionTypographyPreset: 'text',
  descriptionColor: 'text',
  descriptionBackgroundEnabled: 'text',
  descriptionPaddingTop: 'text',
  descriptionPaddingBottom: 'text',
  descriptionPaddingLeft: 'text',
  descriptionPaddingRight: 'text',
  buttonLabel: 'button',
  buttonUrl: 'button',
  buttonOpenInNewTab: 'button',
  buttonStyle: 'button',
  buttonLinkTextColor: 'button',
  buttonCustomBackground: 'button',
  buttonCustomText: 'button',
  buttonDesktopWidth: 'button',
  buttonDesktopCustomWidth: 'button',
  buttonMobileWidth: 'button',
  buttonMobileCustomWidth: 'button',
};

function imageWithTextFieldSidebarNodeId(settingsBase: string, fieldKey: string): string | null {
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return null;
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) {
    const nodePrefix = `template:${tpl[1]}:${tpl[2]}`;
    return blockSuffix === 'image'
      ? `${nodePrefix}:block:image`
      : `${nodePrefix}:block:group:nested:${blockSuffix}`;
  }
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) {
    const nodePrefix = `layout:${layout[1]}`;
    return blockSuffix === 'image'
      ? `${nodePrefix}:block:image`
      : `${nodePrefix}:block:group:nested:${blockSuffix}`;
  }
  return null;
}

export function imageWithTextContentGroupSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}:block:group`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}:block:group`;
  return null;
}

export function isImageWithTextContentFieldPath(path: string): boolean {
  if (/\.settings\.contentGroup\./.test(path) && /image_with_text/.test(path)) return true;
  const key = path.split('.').pop() ?? '';
  return key in CONTENT_FIELD_TO_BLOCK && /image_with_text/.test(path);
}

export function imageWithTextSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (/\.settings\.contentGroup\./.test(path) && /image_with_text/.test(path)) {
    const settingsBase = path.replace(/\.contentGroup\.[^.]+$/, '');
    const mapped = imageWithTextContentGroupSidebarNodeId(settingsBase);
    if (mapped) return mapped;
  }
  if (!isImageWithTextContentFieldPath(path)) return nodeId;
  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  const mapped = imageWithTextFieldSidebarNodeId(settingsBase, fieldKey);
  return mapped ?? nodeId;
}

export function syntheticImageWithTextSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isImageWithTextImageBlockNodeId(nodeId)) {
    const fields = imageWithTextBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Image', kind: 'block', icon: 'image', fields };
  }
  if (isImageWithTextHeadingBlockNodeId(nodeId)) {
    const fields = imageWithTextBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Heading', kind: 'block', icon: 'text', fields };
  }
  if (isImageWithTextTextBlockNodeId(nodeId)) {
    const fields = imageWithTextBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Text', kind: 'block', icon: 'text', fields };
  }
  if (isImageWithTextButtonBlockNodeId(nodeId)) {
    const fields = imageWithTextBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Button', kind: 'block', icon: 'button', fields };
  }
  if (isImageWithTextGroupNodeId(nodeId)) {
    return prepareImageWithTextGroupSettingsNode({
      id: nodeId,
      label: 'Group',
      kind: 'block',
      icon: 'group',
    });
  }
  if (nodeId.startsWith('field:') && isImageWithTextContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = imageWithTextSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticImageWithTextSidebarNode(mapped, _editorSchema);
  }
  return null;
}
