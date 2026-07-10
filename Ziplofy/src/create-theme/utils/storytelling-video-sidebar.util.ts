import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  isStorytellingVideoCaptionButtonBlockNodeId,
  isStorytellingVideoCaptionGroupNodeId,
  isStorytellingVideoCaptionTextBlockNodeId,
  isStorytellingVideoMediaBlockNodeId,
  isStorytellingVideoSectionInstanceId,
  storytellingVideoBlockFieldDefs,
  storytellingVideoBlockFieldDefsFromNodeId,
} from '../sidebar/theme-editor-storytelling-video-block-panel.utils';
import { prepareStorytellingVideoCaptionGroupSettingsNode } from '../sidebar/theme-editor-storytelling-video-caption-panel.utils';

export const STORYTELLING_VIDEO_SECTION_BLOCK_ORDER = ['video', 'caption'] as const;
export const STORYTELLING_VIDEO_CAPTION_CHILD_ORDER = ['caption_text', 'caption_button'] as const;

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

export type StorytellingVideoSidebarPaths = {
  prefix: string;
  settingsBase: string;
};

export function storytellingVideoSidebarPathsFromNodeId(
  nodeId: string
): StorytellingVideoSidebarPaths | null {
  const layout = nodeId.match(/^layout:([^:]+)/);
  if (layout) {
    const instanceId = layout[1]!;
    if (!isStorytellingVideoSectionInstanceId(instanceId)) return null;
    return {
      prefix: `layout:${instanceId}`,
      settingsBase: `sections.${instanceId}.settings`,
    };
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)/);
  if (tpl) {
    const [, templateId, sectionId] = tpl;
    if (!isStorytellingVideoSectionInstanceId(sectionId)) return null;
    return {
      prefix: `template:${templateId}:${sectionId}`,
      settingsBase: `templates.${templateId}.sections.${sectionId}.settings`,
    };
  }
  return null;
}

function storytellingVideoSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Video — Add block → Video; Caption → Add block → Text → Button. */
export function mapStorytellingVideoBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = storytellingVideoSectionBase(prefix);
  const sectionAddBlockId = `${prefix}:add-block`;
  const videoPrefix = `${prefix}:block:video`;
  const captionPrefix = `${prefix}:block:caption`;

  const captionTextFields = storytellingVideoBlockFieldDefs(sectionBase, 'caption_text');
  const captionPreviewField = captionTextFields.find((f) => f.path.endsWith('.caption'));
  const captionButtonFields = storytellingVideoBlockFieldDefs(sectionBase, 'caption_button');
  const buttonPreviewField = captionButtonFields.find((f) => f.path.endsWith('.linkLabel'));

  const captionChildren = reorderSidebarChildren(
    [
      { id: `${captionPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${captionPrefix}:nested:caption_text`,
        label: 'Text',
        kind: 'block',
        icon: 'text',
        preview: captionPreviewField ? fieldPreview(captionPreviewField, values) : undefined,
        fields: captionTextFields,
      },
      {
        id: `${captionPrefix}:nested:caption_button`,
        label: 'Button',
        kind: 'block',
        icon: 'button',
        preview: buttonPreviewField ? fieldPreview(buttonPreviewField, values) : undefined,
        fields: captionButtonFields,
      },
    ],
    listKeyBlockChildren(captionPrefix),
    itemOrder
  );

  const captionNode: SidebarNode = {
    id: captionPrefix,
    label: 'Caption',
    kind: 'block',
    icon: 'group',
    children: captionChildren,
    childrenListKey: listKeyBlockChildren(captionPrefix),
  };

  const videoNode: SidebarNode = {
    id: videoPrefix,
    label: 'Video',
    kind: 'block',
    icon: 'image',
    fields: storytellingVideoBlockFieldDefs(sectionBase, 'video'),
  };

  return reorderSidebarChildren(
    [
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
      videoNode,
      captionNode,
    ],
    sectionChildrenListKey,
    itemOrder
  );
}

export function storytellingVideoStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const captionPrefix = `${prefix}:block:caption`;
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      `${prefix}:block:video`,
      `${prefix}:block:caption`,
    ],
    [listKeyBlockChildren(captionPrefix)]: [
      `${captionPrefix}:inner-add-block`,
      `${captionPrefix}:nested:caption_text`,
      `${captionPrefix}:nested:caption_button`,
    ],
  };
}

export function storytellingVideoLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return storytellingVideoStructureOrder(prefix, sectionChildrenListKey);
}

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  videoSource: 'video',
  uploadedVideoUrl: 'video',
  videoUrl: 'video',
  coverImageUrl: 'video',
  videoAutoplay: 'video',
  videoLoop: 'video',
  videoWidth: 'video',
  videoMobileWidth: 'video',
  videoBorderStyle: 'video',
  videoCornerRadius: 'video',
  videoPaddingTop: 'video',
  videoPaddingBottom: 'video',
  videoPaddingLeft: 'video',
  videoPaddingRight: 'video',
  caption: 'caption_text',
  captionWidth: 'caption_text',
  captionMaxWidth: 'caption_text',
  captionTypographyPreset: 'caption_text',
  captionColor: 'caption_text',
  captionBackgroundEnabled: 'caption_text',
  captionPaddingTop: 'caption_text',
  captionPaddingBottom: 'caption_text',
  captionPaddingLeft: 'caption_text',
  captionPaddingRight: 'caption_text',
  linkLabel: 'caption_button',
  linkUrl: 'caption_button',
  linkOpenInNewTab: 'caption_button',
  buttonStyle: 'caption_button',
  buttonLinkTextColor: 'caption_button',
  buttonCustomBackground: 'caption_button',
  buttonCustomText: 'caption_button',
  buttonDesktopWidth: 'caption_button',
  buttonDesktopCustomWidth: 'caption_button',
  buttonMobileWidth: 'caption_button',
  buttonMobileCustomWidth: 'caption_button',
};

function storytellingVideoCaptionGroupSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}:block:caption`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}:block:caption`;
  return null;
}

function storytellingVideoFieldSidebarNodeId(settingsBase: string, fieldKey: string): string | null {
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return null;
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) {
    const prefix = `template:${tpl[1]}:${tpl[2]}`;
    return blockSuffix === 'video'
      ? `${prefix}:block:video`
      : `${prefix}:block:caption:nested:${blockSuffix}`;
  }
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) {
    const prefix = `layout:${layout[1]}`;
    return blockSuffix === 'video'
      ? `${prefix}:block:video`
      : `${prefix}:block:caption:nested:${blockSuffix}`;
  }
  return null;
}

export function isStorytellingVideoContentFieldPath(path: string): boolean {
  if (/\.settings\.captionGroup\./.test(path) && /storytelling_video/.test(path)) return true;
  const key = path.split('.').pop() ?? '';
  return key in CONTENT_FIELD_TO_BLOCK && /storytelling_video/.test(path);
}

export function storytellingVideoSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (/\.settings\.captionGroup\./.test(path) && /storytelling_video/.test(path)) {
    const settingsBase = path.replace(/\.captionGroup\.[^.]+$/, '');
    const mapped = storytellingVideoCaptionGroupSidebarNodeId(settingsBase);
    if (mapped) return mapped;
  }
  if (!isStorytellingVideoContentFieldPath(path)) return nodeId;
  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  const mapped = storytellingVideoFieldSidebarNodeId(settingsBase, fieldKey);
  return mapped ?? nodeId;
}

export function storytellingVideoCaptionTextSidebarNode(nodeId: string): SidebarNode | null {
  if (!isStorytellingVideoCaptionTextBlockNodeId(nodeId)) return null;
  const fields = storytellingVideoBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Text', kind: 'block', icon: 'text', fields };
}

export function storytellingVideoCaptionButtonSidebarNode(nodeId: string): SidebarNode | null {
  if (!isStorytellingVideoCaptionButtonBlockNodeId(nodeId)) return null;
  const fields = storytellingVideoBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Button', kind: 'block', icon: 'button', fields };
}

export function storytellingVideoMediaSidebarNode(nodeId: string): SidebarNode | null {
  if (!isStorytellingVideoMediaBlockNodeId(nodeId)) return null;
  const fields = storytellingVideoBlockFieldDefsFromNodeId(nodeId);
  return { id: nodeId, label: 'Video', kind: 'block', icon: 'image', fields };
}

export function storytellingVideoCaptionGroupSidebarNode(nodeId: string): SidebarNode | null {
  if (!isStorytellingVideoCaptionGroupNodeId(nodeId)) return null;
  return prepareStorytellingVideoCaptionGroupSettingsNode({
    id: nodeId,
    label: 'Caption',
    kind: 'block',
    icon: 'group',
  });
}

export function syntheticStorytellingVideoSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  const media = storytellingVideoMediaSidebarNode(nodeId);
  if (media) return media;
  const captionText = storytellingVideoCaptionTextSidebarNode(nodeId);
  if (captionText) return captionText;
  const captionButton = storytellingVideoCaptionButtonSidebarNode(nodeId);
  if (captionButton) return captionButton;
  const captionGroup = storytellingVideoCaptionGroupSidebarNode(nodeId);
  if (captionGroup) return captionGroup;
  if (nodeId.startsWith('field:') && isStorytellingVideoContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = storytellingVideoSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticStorytellingVideoSidebarNode(mapped, _editorSchema);
  }
  return null;
}
