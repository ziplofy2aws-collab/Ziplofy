import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export type EditorialJumboBlockKind = 'media' | 'jumbo_text';

export const EDITORIAL_JUMBO_MEDIA_FIELD_KEYS = new Set([
  'mediaType',
  'imageUrl',
  'mediaLinkUrl',
  'imagePosition',
]);

export const EDITORIAL_JUMBO_JUMBO_TEXT_FIELD_KEYS = new Set([
  'headline',
  'headlineFont',
  'headlineAlignment',
  'headlineLineHeight',
  'headlineLetterSpacing',
  'headlineCase',
  'headlineAnimation',
  'headlineColor',
]);

export const EDITORIAL_JUMBO_ANIMATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade-in', label: 'Fade in' },
  { value: 'slide-up', label: 'Slide up' },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

export function editorialJumboMediaDefaultSettings(): Record<string, string> {
  return {
    mediaType: 'image',
    imageUrl: '',
    mediaLinkUrl: '',
    imagePosition: 'cover',
  };
}

export function editorialJumboJumboTextDefaultSettings(): Record<string, string> {
  return {
    headline: 'UP THE ANTE',
    headlineFont: 'heading',
    headlineAlignment: 'right',
    headlineLineHeight: 'tight',
    headlineLetterSpacing: 'tight',
    headlineCase: 'uppercase',
    headlineAnimation: 'none',
    headlineColor: 'default',
  };
}

export function isEditorialJumboSectionInstanceId(secId: string): boolean {
  return secId.includes('editorial_jumbo');
}

export function editorialJumboSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:media|content)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isEditorialJumboSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:media|content)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isEditorialJumboSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function editorialJumboBlockKindFromNodeId(nodeId: string): EditorialJumboBlockKind | null {
  if (/:block:media$/.test(nodeId)) return 'media';
  if (/:block:content:nested:jumbo_text$/.test(nodeId)) return 'jumbo_text';
  return null;
}

export function isEditorialJumboMediaBlockNodeId(nodeId: string): boolean {
  return /:block:media$/.test(nodeId) && editorialJumboSectionBaseFromNodeId(nodeId) !== null;
}

export function isEditorialJumboJumboTextBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:jumbo_text$/.test(nodeId);
}

export function isEditorialJumboContentGroupNodeId(nodeId: string): boolean {
  return /:block:content$/.test(nodeId) && editorialJumboSectionBaseFromNodeId(nodeId) !== null;
}

export function editorialJumboBlockFieldDefs(
  sectionBase: string,
  blockKind: EditorialJumboBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'media') {
    return [
      {
        path: s('mediaType'),
        type: 'select',
        label: 'Type',
        group: 'Media',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
        ],
      },
      {
        path: s('imageUrl'),
        type: 'text',
        label: 'Image',
        group: 'Media',
        widget: 'image',
        sidebar: true,
      },
      {
        path: s('mediaLinkUrl'),
        type: 'text',
        label: 'Link',
        group: 'Media',
        widget: 'link',
        sidebar: true,
        placeholder: 'Paste a link or search',
      },
      {
        path: s('imagePosition'),
        type: 'select',
        label: 'Image position',
        group: 'Media',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
        ],
      },
    ];
  }
  return [
    {
      path: s('headline'),
      type: 'textarea',
      label: 'Text',
      group: 'Content',
      widget: 'richtext',
      sidebar: true,
    },
    {
      path: s('headlineFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select-inline',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('headlineAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...ALIGNMENT_OPTIONS],
    },
    {
      path: s('headlineLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'select-inline',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('headlineLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'select-inline',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('headlineCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('headlineAnimation'),
      type: 'select',
      label: 'Animation',
      group: 'Typography',
      widget: 'select-inline',
      sidebar: true,
      options: [...EDITORIAL_JUMBO_ANIMATION_OPTIONS],
    },
    {
      path: s('headlineColor'),
      type: 'text',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
  ];
}

export function editorialJumboBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = editorialJumboSectionBaseFromNodeId(nodeId);
  const kind = editorialJumboBlockKindFromNodeId(nodeId);
  if (!sectionBase || !kind) return [];
  return editorialJumboBlockFieldDefs(sectionBase, kind);
}

export function isEditorialJumboMediaPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every((f) => {
    const key = f.path.split('.').pop() ?? '';
    return EDITORIAL_JUMBO_MEDIA_FIELD_KEYS.has(key);
  });
}

export function isEditorialJumboJumboTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('headline') && keys.has('headlineFont');
}

export function pickEditorialJumboBlockField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendEditorialJumboBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null,
  blockKind: EditorialJumboBlockKind
): Record<string, string | boolean> {
  const defaults =
    blockKind === 'media'
      ? editorialJumboMediaDefaultSettings()
      : editorialJumboJumboTextDefaultSettings();
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = defaults[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
