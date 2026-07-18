import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  STORYTELLING_VIDEO_MEDIA_FIELD_KEYS,
  isStorytellingVideoMediaPanelFields,
  storytellingVideoMediaFieldDefs,
} from './theme-editor-storytelling-video-media-panel.utils';

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
    return storytellingVideoMediaFieldDefs(sectionBase);
  }
  if (blockKind === 'caption_text') {
    return [
      {
        path: s('caption'),
        type: 'textarea',
        label: 'Text',
        widget: 'richtext',
        group: 'Content',
        sidebar: true,
      },
      {
        path: s('captionWidth'),
        type: 'select',
        label: 'Width',
        group: 'Layout',
        widget: 'segmented',
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
        ],
        sidebar: true,
      },
      {
        path: s('captionMaxWidth'),
        type: 'select',
        label: 'Max width',
        group: 'Layout',
        widget: 'select-inline',
        options: [
          { value: 'narrow', label: 'Narrow' },
          { value: 'normal', label: 'Normal' },
          { value: 'wide', label: 'Wide' },
        ],
        sidebar: true,
      },
      {
        path: s('captionTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
        ],
        sidebar: true,
      },
      {
        path: s('captionColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
    {
      path: s('captionBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('captionBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('captionPaddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
      {
        path: s('captionPaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('captionPaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('captionPaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
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
    {
      path: s('linkOpenInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('buttonStyle'),
      type: 'select',
      label: 'Style',
      group: 'Content',
      widget: 'select',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'link', label: 'Link' },
        { value: 'custom', label: 'Custom' },
      ],
      sidebar: true,
    },
    {
      path: s('buttonLinkTextColor'),
      type: 'color',
      label: 'Link text color',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('buttonCustomBackground'),
      type: 'color',
      label: 'Background',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('buttonCustomText'),
      type: 'color',
      label: 'Text color',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('buttonDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
      sidebar: true,
    },
    {
      path: s('buttonDesktopCustomWidth'),
      type: 'number',
      label: 'Desktop custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('buttonMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
      sidebar: true,
    },
    {
      path: s('buttonMobileCustomWidth'),
      type: 'number',
      label: 'Mobile custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
  ];
}

const STORYTELLING_VIDEO_TEXT_FIELD_KEYS = new Set([
  'caption',
  'captionWidth',
  'captionMaxWidth',
  'captionTypographyPreset',
  'captionColor',
  'captionBackgroundEnabled',
  'captionBackgroundColor',
  'captionPaddingTop',
  'captionPaddingBottom',
  'captionPaddingLeft',
  'captionPaddingRight',
]);

const STORYTELLING_VIDEO_BUTTON_FIELD_KEYS = new Set([
  'linkLabel',
  'linkUrl',
  'linkOpenInNewTab',
  'buttonStyle',
  'buttonLinkTextColor',
  'buttonCustomBackground',
  'buttonCustomText',
  'buttonDesktopWidth',
  'buttonDesktopCustomWidth',
  'buttonMobileWidth',
  'buttonMobileCustomWidth',
]);

export function storytellingVideoBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = storytellingVideoSectionBaseFromNodeId(nodeId);
  const blockKind = storytellingVideoBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return storytellingVideoBlockFieldDefs(sectionBase, blockKind);
}

export function isStorytellingVideoBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/storytelling_video/.test(field.path) || field.path.includes('.blocks.')) return false;
  if (STORYTELLING_VIDEO_MEDIA_FIELD_KEYS.has(key)) return true;
  if (STORYTELLING_VIDEO_TEXT_FIELD_KEYS.has(key)) return true;
  return STORYTELLING_VIDEO_BUTTON_FIELD_KEYS.has(key);
}

export function isStorytellingVideoCaptionTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('caption') && keys.has('captionWidth') && path.includes('storytelling_video');
}

export function isStorytellingVideoCaptionButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('linkLabel') && keys.has('buttonStyle') && path.includes('storytelling_video');
}

export function isStorytellingVideoBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  if (isStorytellingVideoMediaPanelFields(fields)) return false;
  if (isStorytellingVideoCaptionTextPanelFields(fields)) return false;
  if (isStorytellingVideoCaptionButtonPanelFields(fields)) return false;
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

const STORYTELLING_VIDEO_CONTENT_DEFAULTS: Record<string, string | boolean> = {
  caption: 'Take a look behind the scenes of our latest product launch.',
  captionWidth: 'fit',
  captionMaxWidth: 'normal',
  captionTypographyPreset: 'default',
  captionColor: '',
  captionBackgroundEnabled: false,
  captionBackgroundColor: '',
  captionPaddingTop: '0',
  captionPaddingBottom: '0',
  captionPaddingLeft: '0',
  captionPaddingRight: '0',
  linkLabel: 'Discover the collection',
  linkUrl: '/collections',
  linkOpenInNewTab: false,
  buttonStyle: 'link',
  buttonLinkTextColor: '',
  buttonCustomBackground: '#111827',
  buttonCustomText: '#ffffff',
  buttonDesktopWidth: 'fit',
  buttonDesktopCustomWidth: '100',
  buttonMobileWidth: 'fit',
  buttonMobileCustomWidth: '100',
};

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed Text / Button field values from config (or defaults). */
export function extendStorytellingVideoContentBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = STORYTELLING_VIDEO_CONTENT_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
