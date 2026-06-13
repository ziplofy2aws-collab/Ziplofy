import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

export type StorytellingVideoBlockKind = 'video' | 'caption_text' | 'caption_button';

export function isStorytellingVideoSectionInstanceId(secId: string): boolean {
  return secId.includes('storytelling_video');
}

export function storytellingVideoSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:video|caption)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isStorytellingVideoSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:video|caption)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isStorytellingVideoSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function storytellingVideoBlockKindFromNodeId(
  nodeId: string
): StorytellingVideoBlockKind | null {
  if (/:block:video$/.test(nodeId)) return 'video';
  if (/:block:caption:nested:caption_text$/.test(nodeId)) return 'caption_text';
  if (/:block:caption:nested:caption_button$/.test(nodeId)) return 'caption_button';
  return null;
}

export function isStorytellingVideoBlockNodeId(nodeId: string): boolean {
  return storytellingVideoBlockKindFromNodeId(nodeId) !== null;
}

export function isStorytellingVideoMediaBlockNodeId(nodeId: string): boolean {
  return /:block:video$/.test(nodeId) && storytellingVideoSectionBaseFromNodeId(nodeId) !== null;
}

export function isStorytellingVideoCaptionTextBlockNodeId(nodeId: string): boolean {
  return /:block:caption:nested:caption_text$/.test(nodeId);
}

export function isStorytellingVideoCaptionButtonBlockNodeId(nodeId: string): boolean {
  return /:block:caption:nested:caption_button$/.test(nodeId);
}

export function isStorytellingVideoCaptionGroupNodeId(nodeId: string): boolean {
  return /:block:caption$/.test(nodeId) && storytellingVideoSectionBaseFromNodeId(nodeId) !== null;
}

export function storytellingVideoBlockFieldDefs(
  sectionBase: string,
  blockKind: StorytellingVideoBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'video') {
    return [
      {
        path: s('videoSource'),
        type: 'select',
        label: 'Source',
        widget: 'segmented',
        group: 'Media',
        sidebar: true,
        options: [
          { value: 'uploaded', label: 'Uploaded' },
          { value: 'url', label: 'URL' },
        ],
      },
      {
        path: s('videoUrl'),
        type: 'text',
        label: 'Video URL',
        widget: 'link',
        group: 'Media',
        sidebar: true,
        placeholder: 'YouTube or Vimeo URL',
      },
      {
        path: s('coverImageUrl'),
        type: 'text',
        label: 'Cover image',
        widget: 'image',
        group: 'Media',
        sidebar: true,
      },
    ];
  }
  if (blockKind === 'caption_text') {
    return [
      {
        path: s('caption'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        sidebar: true,
      },
    ];
  }
  return [
    {
      path: s('linkLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('linkUrl'),
      type: 'text',
      label: 'Link',
      widget: 'link',
      group: 'Content',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
  ];
}

export function storytellingVideoBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = storytellingVideoSectionBaseFromNodeId(nodeId);
  const blockKind = storytellingVideoBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return storytellingVideoBlockFieldDefs(sectionBase, blockKind);
}

export function isStorytellingVideoBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/storytelling_video/.test(field.path) || field.path.includes('.blocks.')) return false;
  if (key === 'videoSource' || key === 'videoUrl' || key === 'coverImageUrl') return true;
  if (key === 'caption') return true;
  return key === 'linkLabel' || key === 'linkUrl';
}

export function isStorytellingVideoBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isStorytellingVideoBlockField);
}

export function prepareStorytellingVideoBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = storytellingVideoBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'video'
      ? 'Video'
      : blockKind === 'caption_text'
        ? 'Text'
        : blockKind === 'caption_button'
          ? 'Button'
          : node.label;
  const fromNode = storytellingVideoBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isStorytellingVideoBlockField);
  return { ...node, label, kind: 'block', fields };
}
