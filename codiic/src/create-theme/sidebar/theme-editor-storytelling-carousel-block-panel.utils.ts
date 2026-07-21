import type { EditorFieldDef } from './create-theme-sidebar.types';

export type StorytellingCarouselBlockKind = 'header' | 'image' | 'heading' | 'text';

export const STORYTELLING_CAROUSEL_HEADER_FIELD_KEYS = new Set([
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

export const STORYTELLING_CAROUSEL_CARD_IMAGE_FIELD_KEYS = new Set([
  'imageUrl',
  'imageLinkUrl',
  'imageAspectRatio',
  'imageDesktopWidth',
  'imageDesktopCustomWidth',
  'imageMobileWidth',
  'imageMobileCustomWidth',
  'imageHeight',
  'imageBorderStyle',
  'imageCornerRadius',
  'imagePaddingTop',
  'imagePaddingBottom',
  'imagePaddingLeft',
  'imagePaddingRight',
]);

export const STORYTELLING_CAROUSEL_CARD_HEADING_FIELD_KEYS = new Set([
  'title',
  'titleWidth',
  'titleMaxWidth',
  'titleTypographyPreset',
  'titleColor',
  'titleBackgroundEnabled',
  'titlePaddingTop',
  'titlePaddingBottom',
  'titlePaddingLeft',
  'titlePaddingRight',
]);

export const STORYTELLING_CAROUSEL_CARD_TEXT_FIELD_KEYS = new Set([
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

export function storytellingCarouselHeaderDefaultSettings(): Record<string, string | boolean> {
  return {
    heading: 'Discover elevated design',
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

export function storytellingCarouselCardImageDefaultSettings(): Record<string, string | boolean> {
  return {
    imageUrl: '',
    imageLinkUrl: '',
    imageAspectRatio: 'auto',
    imageDesktopWidth: 'fill',
    imageDesktopCustomWidth: '100',
    imageMobileWidth: 'fill',
    imageMobileCustomWidth: '100',
    imageHeight: 'fit',
    imageBorderStyle: 'none',
    imageCornerRadius: '0',
    imagePaddingTop: '0',
    imagePaddingBottom: '0',
    imagePaddingLeft: '0',
    imagePaddingRight: '0',
  };
}

export function storytellingCarouselCardHeadingDefaultSettings(): Record<string, string | boolean> {
  return {
    title: 'Artistry in action',
    titleWidth: 'fit',
    titleMaxWidth: 'normal',
    titleTypographyPreset: 'heading-5',
    titleColor: 'default',
    titleBackgroundEnabled: false,
    titlePaddingTop: '0',
    titlePaddingBottom: '0',
    titlePaddingLeft: '0',
    titlePaddingRight: '0',
  };
}

export function storytellingCarouselCardTextDefaultSettings(): Record<string, string | boolean> {
  return {
    description: 'Made with care and unconditionally loved by our customers.',
    descriptionWidth: 'fit',
    descriptionMaxWidth: 'normal',
    descriptionTypographyPreset: 'default',
    descriptionColor: 'default',
    descriptionBackgroundEnabled: false,
    descriptionPaddingTop: '0',
    descriptionPaddingBottom: '0',
    descriptionPaddingLeft: '0',
    descriptionPaddingRight: '0',
  };
}

export function isStorytellingCarouselSectionInstanceId(secId: string): boolean {
  return secId === 'storytelling_carousel' || secId.startsWith('storytelling_carousel_');
}

export function storytellingCarouselSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:header|content)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isStorytellingCarouselSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:header|content)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isStorytellingCarouselSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${tpl[2]}`;
  }
  return null;
}

export function storytellingCarouselSlideIdFromNodeId(nodeId: string): string | null {
  const nested = nodeId.match(/:block:content:nested:([^:]+)(?::|$)/);
  return nested?.[1] ?? null;
}

export function storytellingCarouselBlockKindFromNodeId(nodeId: string): StorytellingCarouselBlockKind | null {
  if (/:block:header:nested:heading$/.test(nodeId)) return 'header';
  if (/:block:content:nested:[^:]+:nested:image$/.test(nodeId)) return 'image';
  if (/:block:content:nested:[^:]+:nested:heading$/.test(nodeId)) return 'heading';
  if (/:block:content:nested:[^:]+:nested:text$/.test(nodeId)) return 'text';
  return null;
}

export function isStorytellingCarouselHeaderGroupNodeId(nodeId: string): boolean {
  return /:block:header$/.test(nodeId) && storytellingCarouselSectionBaseFromNodeId(nodeId) !== null;
}

export function isStorytellingCarouselContentGroupNodeId(nodeId: string): boolean {
  return /:block:content$/.test(nodeId) && storytellingCarouselSectionBaseFromNodeId(nodeId) !== null;
}

export function isStorytellingCarouselCardBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:[^:]+$/.test(nodeId) && !/:nested:(image|heading|text)$/.test(nodeId);
}

export function isStorytellingCarouselHeaderBlockNodeId(nodeId: string): boolean {
  return /:block:header:nested:heading$/.test(nodeId);
}

export function isStorytellingCarouselCardImageBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:[^:]+:nested:image$/.test(nodeId);
}

export function isStorytellingCarouselCardHeadingBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:[^:]+:nested:heading$/.test(nodeId);
}

export function isStorytellingCarouselCardTextBlockNodeId(nodeId: string): boolean {
  return /:block:content:nested:[^:]+:nested:text$/.test(nodeId);
}

export function storytellingCarouselBlockFieldDefs(
  settingsBase: string,
  blockKind: StorytellingCarouselBlockKind
): EditorFieldDef[] {
  if (blockKind === 'header') {
    const s = (key: string) => `${settingsBase}.${key}`;
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
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
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
  if (blockKind === 'image') {
    const s = (key: string) => `${settingsBase}.${key}`;
    return [
      {
        path: s('imageUrl'),
        type: 'text',
        label: 'Image',
        group: 'General',
        widget: 'image',
        sidebar: true,
      },
      {
        path: s('imageLinkUrl'),
        type: 'text',
        label: 'Link',
        group: 'General',
        widget: 'link',
        sidebar: true,
        placeholder: 'Paste a link or search',
      },
      {
        path: s('imageAspectRatio'),
        type: 'select',
        label: 'Aspect ratio',
        group: 'Size',
        widget: 'select-inline',
        options: [{ value: 'auto', label: 'Auto' }],
        sidebar: true,
      },
      {
        path: s('imageDesktopWidth'),
        type: 'select',
        label: 'Desktop width',
        group: 'Size',
        widget: 'segmented',
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
          { value: 'custom', label: 'Custom' },
        ],
        sidebar: true,
      },
      {
        path: s('imageDesktopCustomWidth'),
        type: 'number',
        label: 'Custom width',
        group: 'Size',
        widget: 'slider',
        min: 20,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
      {
        path: s('imageMobileWidth'),
        type: 'select',
        label: 'Mobile width',
        group: 'Size',
        widget: 'segmented',
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
          { value: 'custom', label: 'Custom' },
        ],
        sidebar: true,
      },
      {
        path: s('imageMobileCustomWidth'),
        type: 'number',
        label: 'Custom width',
        group: 'Size',
        widget: 'slider',
        min: 20,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
      {
        path: s('imageHeight'),
        type: 'select',
        label: 'Height',
        group: 'Size',
        widget: 'segmented',
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
        ],
        sidebar: true,
      },
      {
        path: s('imageBorderStyle'),
        type: 'select',
        label: 'Style',
        group: 'Borders',
        widget: 'segmented',
        options: [
          { value: 'none', label: 'None' },
          { value: 'solid', label: 'Solid' },
        ],
        sidebar: true,
      },
      {
        path: s('imageCornerRadius'),
        type: 'number',
        label: 'Corner radius',
        group: 'Borders',
        widget: 'slider',
        min: 0,
        max: 40,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('imagePaddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('imagePaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('imagePaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('imagePaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
  }
  if (blockKind === 'heading') {
    const s = (key: string) => `${settingsBase}.${key}`;
    return [
      {
        path: s('title'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: s('titleWidth'),
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
        path: s('titleMaxWidth'),
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
        path: s('titleTypographyPreset'),
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
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
        ],
        sidebar: true,
      },
      {
        path: s('titleColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('titleBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        sidebar: true,
      },
      {
        path: s('titlePaddingTop'),
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
        path: s('titlePaddingBottom'),
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
        path: s('titlePaddingLeft'),
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
        path: s('titlePaddingRight'),
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
  const s = (key: string) => `${settingsBase}.${key}`;
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

export function storytellingCarouselBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = storytellingCarouselSectionBaseFromNodeId(nodeId);
  const kind = storytellingCarouselBlockKindFromNodeId(nodeId);
  if (!sectionBase || !kind) return [];

  if (kind === 'header') {
    return storytellingCarouselBlockFieldDefs(`${sectionBase}.settings`, kind);
  }

  const slideId = storytellingCarouselSlideIdFromNodeId(nodeId);
  if (!slideId) return [];
  return storytellingCarouselBlockFieldDefs(`${sectionBase}.blocks.${slideId}.settings`, kind);
}

export function pickStorytellingCarouselBlockField(
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

export function extendStorytellingCarouselBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null,
  blockKind: StorytellingCarouselBlockKind
): Record<string, string | boolean> {
  const defaultsByKind: Record<StorytellingCarouselBlockKind, Record<string, string | boolean>> = {
    header: storytellingCarouselHeaderDefaultSettings(),
    image: storytellingCarouselCardImageDefaultSettings(),
    heading: storytellingCarouselCardHeadingDefaultSettings(),
    text: storytellingCarouselCardTextDefaultSettings(),
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

export function isStorytellingCarouselHeaderPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('heading') &&
    keys.has('headingWidth') &&
    /\.settings\./.test(path) &&
    !/\.blocks\./.test(path) &&
    !/\.contentGroup\./.test(path) &&
    /storytelling_carousel/.test(path)
  );
}

export function isStorytellingCarouselCardImagePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('imageUrl') &&
    keys.has('imageAspectRatio') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /storytelling_carousel/.test(path)
  );
}

export function isStorytellingCarouselCardHeadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('title') &&
    keys.has('titleWidth') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /storytelling_carousel/.test(path)
  );
}

export function isStorytellingCarouselCardTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('description') &&
    keys.has('descriptionWidth') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /storytelling_carousel/.test(path)
  );
}
