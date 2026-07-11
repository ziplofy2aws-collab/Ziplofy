import type { EditorFieldDef } from './create-theme-sidebar.types';

export type EditorialBlockKind = 'media' | 'caption' | 'heading' | 'text' | 'button';

export const EDITORIAL_MEDIA_FIELD_KEYS = new Set([
  'mediaType',
  'imageUrl',
  'mediaLinkUrl',
  'imagePosition',
]);

export const EDITORIAL_CAPTION_FIELD_KEYS = new Set([
  'subheading',
  'subheadingWidth',
  'subheadingMaxWidth',
  'subheadingTypographyPreset',
  'subheadingColor',
  'subheadingBackgroundEnabled',
  'subheadingPaddingTop',
  'subheadingPaddingBottom',
  'subheadingPaddingLeft',
  'subheadingPaddingRight',
]);

export const EDITORIAL_HEADING_FIELD_KEYS = new Set([
  'heading',
  'headingWidth',
  'headingMaxWidth',
  'headingTypographyPreset',
  'headingColor',
  'headingBackgroundEnabled',
  'headingPaddingTop',
  'headingPaddingBottom',
  'headingPaddingLeft',
  'headingPaddingRight',
]);

export const EDITORIAL_TEXT_FIELD_KEYS = new Set([
  'description',
  'descriptionWidth',
  'descriptionMaxWidth',
  'descriptionTypographyPreset',
  'descriptionColor',
  'descriptionBackgroundEnabled',
  'descriptionPaddingTop',
  'descriptionPaddingBottom',
  'descriptionPaddingLeft',
  'descriptionPaddingRight',
]);

export const EDITORIAL_BUTTON_FIELD_KEYS = new Set([
  'linkLabel',
  'linkUrl',
  'linkOpenInNewTab',
  'linkStyle',
  'linkTextColor',
  'linkCustomBackground',
  'linkCustomText',
  'linkDesktopWidth',
  'linkDesktopCustomWidth',
  'linkMobileWidth',
  'linkMobileCustomWidth',
]);

export function editorialMediaDefaultSettings(): Record<string, string | boolean> {
  return {
    mediaType: 'image',
    imageUrl: '',
    mediaLinkUrl: '',
    imagePosition: 'cover',
  };
}

export function editorialCaptionDefaultSettings(): Record<string, string | boolean> {
  return {
    subheading: 'Bestseller',
    subheadingWidth: 'fit',
    subheadingMaxWidth: 'normal',
    subheadingTypographyPreset: 'heading-6',
    subheadingColor: 'default',
    subheadingBackgroundEnabled: false,
    subheadingPaddingTop: '0',
    subheadingPaddingBottom: '0',
    subheadingPaddingLeft: '0',
    subheadingPaddingRight: '0',
  };
}

export function editorialHeadingDefaultSettings(): Record<string, string | boolean> {
  return {
    heading: 'Our signature product',
    headingWidth: 'fit',
    headingMaxWidth: 'normal',
    headingTypographyPreset: 'heading-3',
    headingColor: 'default',
    headingBackgroundEnabled: false,
    headingPaddingTop: '0',
    headingPaddingBottom: '0',
    headingPaddingLeft: '0',
    headingPaddingRight: '0',
  };
}

export function editorialTextDefaultSettings(): Record<string, string | boolean> {
  return {
    description:
      'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.',
    descriptionWidth: 'fit',
    descriptionMaxWidth: 'narrow',
    descriptionTypographyPreset: 'default',
    descriptionColor: 'default',
    descriptionBackgroundEnabled: false,
    descriptionPaddingTop: '0',
    descriptionPaddingBottom: '0',
    descriptionPaddingLeft: '0',
    descriptionPaddingRight: '0',
  };
}

export function editorialButtonDefaultSettings(): Record<string, string | boolean> {
  return {
    linkLabel: 'Shop now',
    linkUrl: '/collections/all',
    linkOpenInNewTab: false,
    linkStyle: 'link',
    linkTextColor: 'default',
    linkCustomBackground: '',
    linkCustomText: '',
    linkDesktopWidth: 'fit',
    linkDesktopCustomWidth: '100',
    linkMobileWidth: 'fit',
    linkMobileCustomWidth: '100',
  };
}

export function isEditorialSectionInstanceId(secId: string): boolean {
  if (secId.includes('editorial_jumbo')) return false;
  if (secId.includes('blog_posts_editorial')) return false;
  if (secId.includes('blog_posts_carousel')) return false;
  if (secId.includes('collection_list_editorial')) return false;
  return secId === 'editorial' || secId.startsWith('editorial_');
}

export function editorialSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:media|content|button)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isEditorialSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:media|content|button)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isEditorialSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function editorialBlockKindFromNodeId(nodeId: string): EditorialBlockKind | null {
  if (/:block:media$/.test(nodeId)) return 'media';
  if (/:block:content:nested:caption$/.test(nodeId)) return 'caption';
  if (/:block:content:nested:group:nested:heading$/.test(nodeId)) return 'heading';
  if (/:block:content:nested:group:nested:text$/.test(nodeId)) return 'text';
  if (/:block:button$/.test(nodeId)) return 'button';
  return null;
}

export function isEditorialMediaBlockNodeId(nodeId: string): boolean {
  return /:block:media$/.test(nodeId) && editorialSectionBaseFromNodeId(nodeId) !== null;
}

export function isEditorialCaptionBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:caption$/.test(nodeId);
}

export function isEditorialHeadingBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:group:nested:heading$/.test(nodeId);
}

export function isEditorialTextBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:group:nested:text$/.test(nodeId);
}

export function isEditorialButtonBlockNodeId(nodeId: string): boolean {
  return /:block:button$/.test(nodeId) && editorialSectionBaseFromNodeId(nodeId) !== null;
}

export function isEditorialContentGroupNodeId(nodeId: string): boolean {
  return /:block:content$/.test(nodeId) && editorialSectionBaseFromNodeId(nodeId) !== null;
}

export function isEditorialNestedGroupNodeId(nodeId: string): boolean {
  return /:block:content:nested:group$/.test(nodeId) && editorialSectionBaseFromNodeId(nodeId) !== null;
}

export function editorialBlockFieldDefs(
  sectionBase: string,
  blockKind: EditorialBlockKind
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
  if (blockKind === 'caption') {
    return [
      {
        path: s('subheading'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: s('subheadingWidth'),
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
        path: s('subheadingMaxWidth'),
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
        path: s('subheadingTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'paragraph', label: 'Paragraph' },
          { value: 'body', label: 'Body' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
        ],
        sidebar: true,
      },
      {
        path: s('subheadingColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('subheadingBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        sidebar: true,
      },
      {
        path: s('subheadingPaddingTop'),
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
        path: s('subheadingPaddingBottom'),
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
        path: s('subheadingPaddingLeft'),
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
        path: s('subheadingPaddingRight'),
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
  if (blockKind === 'heading') {
    return [
      {
        path: s('heading'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: s('headingWidth'),
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
        path: s('headingMaxWidth'),
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
        path: s('headingTypographyPreset'),
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
        path: s('headingColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('headingBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        sidebar: true,
      },
      {
        path: s('headingPaddingTop'),
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
        path: s('headingPaddingBottom'),
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
        path: s('headingPaddingLeft'),
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
        path: s('headingPaddingRight'),
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
  if (blockKind === 'text') {
    return [
      {
        path: s('description'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: s('descriptionWidth'),
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
        path: s('descriptionMaxWidth'),
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
        path: s('descriptionTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'paragraph', label: 'Paragraph' },
          { value: 'body', label: 'Body' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
        ],
        sidebar: true,
      },
      {
        path: s('descriptionColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('descriptionBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        sidebar: true,
      },
      {
        path: s('descriptionPaddingTop'),
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
        path: s('descriptionPaddingBottom'),
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
        path: s('descriptionPaddingLeft'),
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
        path: s('descriptionPaddingRight'),
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
      group: 'Content',
      widget: 'link',
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
      path: s('linkStyle'),
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
      path: s('linkTextColor'),
      type: 'color',
      label: 'Link text color',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('linkCustomBackground'),
      type: 'color',
      label: 'Background',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('linkCustomText'),
      type: 'color',
      label: 'Text color',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('linkDesktopWidth'),
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
      path: s('linkDesktopCustomWidth'),
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
      path: s('linkMobileWidth'),
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
      path: s('linkMobileCustomWidth'),
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

export function editorialBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = editorialSectionBaseFromNodeId(nodeId);
  const kind = editorialBlockKindFromNodeId(nodeId);
  if (!sectionBase || !kind) return [];
  return editorialBlockFieldDefs(sectionBase, kind);
}

export function isEditorialMediaPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every((f) => EDITORIAL_MEDIA_FIELD_KEYS.has(f.path.split('.').pop() ?? ''));
}

export function isEditorialCaptionPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('subheading') &&
    keys.has('subheadingWidth') &&
    /editorial/.test(path) &&
    !/editorial_jumbo/.test(path)
  );
}

export function isEditorialHeadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('heading') &&
    keys.has('headingWidth') &&
    /editorial/.test(path) &&
    !/editorial_jumbo/.test(path)
  );
}

export function isEditorialTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('description') &&
    keys.has('descriptionWidth') &&
    /editorial/.test(path) &&
    !/editorial_jumbo/.test(path)
  );
}

export function isEditorialButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('linkLabel') && keys.has('linkStyle') && /editorial/.test(path) && !/editorial_jumbo/.test(path);
}

export function pickEditorialBlockField(
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

export function extendEditorialBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null,
  blockKind: EditorialBlockKind
): Record<string, string | boolean> {
  const defaultsByKind: Record<EditorialBlockKind, Record<string, string | boolean>> = {
    media: editorialMediaDefaultSettings(),
    caption: editorialCaptionDefaultSettings(),
    heading: editorialHeadingDefaultSettings(),
    text: editorialTextDefaultSettings(),
    button: editorialButtonDefaultSettings(),
  };
  const defaults = defaultsByKind[blockKind];
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
