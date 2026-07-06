import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  imageWithTextImageFieldDefs,
  IMAGE_WITH_TEXT_IMAGE_FIELD_KEYS,
} from './theme-editor-image-with-text-image-panel.utils';

export type ImageWithTextBlockKind = 'image' | 'heading' | 'text' | 'button';

export function isImageWithTextSectionInstanceId(secId: string): boolean {
  return secId.includes('image_with_text');
}

export function imageWithTextSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:image|group)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isImageWithTextSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:image|group)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isImageWithTextSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function imageWithTextBlockKindFromNodeId(nodeId: string): ImageWithTextBlockKind | null {
  if (/:block:image$/.test(nodeId)) return 'image';
  if (/:block:group:nested:heading$/.test(nodeId)) return 'heading';
  if (/:block:group:nested:text$/.test(nodeId)) return 'text';
  if (/:block:group:nested:button$/.test(nodeId)) return 'button';
  return null;
}

export function isImageWithTextBlockNodeId(nodeId: string): boolean {
  return imageWithTextBlockKindFromNodeId(nodeId) !== null;
}

export function isImageWithTextImageBlockNodeId(nodeId: string): boolean {
  return /:block:image$/.test(nodeId) && imageWithTextSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageWithTextGroupNodeId(nodeId: string): boolean {
  return /:block:group$/.test(nodeId) && imageWithTextSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageWithTextHeadingBlockNodeId(nodeId: string): boolean {
  return /:block:group:nested:heading$/.test(nodeId);
}

export function isImageWithTextTextBlockNodeId(nodeId: string): boolean {
  return /:block:group:nested:text$/.test(nodeId);
}

export function isImageWithTextButtonBlockNodeId(nodeId: string): boolean {
  return /:block:group:nested:button$/.test(nodeId);
}

export function imageWithTextBlockFieldDefs(
  sectionBase: string,
  blockKind: ImageWithTextBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'image') {
    return imageWithTextImageFieldDefs(sectionBase);
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
      path: s('buttonLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('buttonUrl'),
      type: 'text',
      label: 'Link',
      group: 'Content',
      widget: 'link',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('buttonOpenInNewTab'),
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

const IMAGE_WITH_TEXT_BUTTON_FIELD_KEYS = new Set([
  'buttonLabel',
  'buttonUrl',
  'buttonOpenInNewTab',
  'buttonStyle',
  'buttonLinkTextColor',
  'buttonCustomBackground',
  'buttonCustomText',
  'buttonDesktopWidth',
  'buttonDesktopCustomWidth',
  'buttonMobileWidth',
  'buttonMobileCustomWidth',
]);

const IMAGE_WITH_TEXT_HEADING_FIELD_KEYS = new Set([
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

const IMAGE_WITH_TEXT_TEXT_FIELD_KEYS = new Set([
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

const IMAGE_WITH_TEXT_BLOCK_FIELD_KEYS = new Set([
  ...IMAGE_WITH_TEXT_IMAGE_FIELD_KEYS,
  ...IMAGE_WITH_TEXT_HEADING_FIELD_KEYS,
  ...IMAGE_WITH_TEXT_TEXT_FIELD_KEYS,
  ...IMAGE_WITH_TEXT_BUTTON_FIELD_KEYS,
]);

export function imageWithTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = imageWithTextSectionBaseFromNodeId(nodeId);
  const blockKind = imageWithTextBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return imageWithTextBlockFieldDefs(sectionBase, blockKind);
}

export function isImageWithTextBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return (
    IMAGE_WITH_TEXT_BLOCK_FIELD_KEYS.has(key) &&
    /image_with_text/.test(field.path) &&
    !field.path.includes('.blocks.')
  );
}

export function isImageWithTextImagePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('imageUrl') && keys.has('imageAspectRatio') && path.includes('image_with_text');
}

export function isImageWithTextHeadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('heading') && keys.has('headingWidth') && path.includes('image_with_text');
}

export function isImageWithTextTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('description') && keys.has('descriptionWidth') && path.includes('image_with_text');
}

export function isImageWithTextButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('buttonLabel') && keys.has('buttonStyle') && path.includes('image_with_text');
}

export function prepareImageWithTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = imageWithTextBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'image'
      ? 'Image'
      : blockKind === 'heading'
        ? 'Heading'
        : blockKind === 'text'
          ? 'Text'
          : blockKind === 'button'
            ? 'Button'
            : node.label;
  const fromNode = imageWithTextBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isImageWithTextBlockField);
  return { ...node, label, kind: 'block', fields };
}

export { prepareImageWithTextGroupSettingsNode } from './theme-editor-image-with-text-group-panel.utils';
