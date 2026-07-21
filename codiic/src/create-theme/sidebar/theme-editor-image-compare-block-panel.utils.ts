import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  comparisonSliderBlockFieldDefs,
  isImageCompareSliderBlockField,
  prepareComparisonSliderBlockSettingsNode,
} from './theme-editor-image-compare-slider-block-panel.utils';

export type ImageCompareBlockKind =
  | 'heading'
  | 'subheading'
  | 'button_1'
  | 'button_2'
  | 'comparison_slider';

export function isImageCompareSectionInstanceId(secId: string): boolean {
  return secId.includes('image_compare');
}

export function imageCompareSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:([^:]+):block:/);
  if (layout) {
    const secId = layout[1]!;
    if (!isImageCompareSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isImageCompareSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function imageCompareBlockKindFromNodeId(nodeId: string): ImageCompareBlockKind | null {
  if (/:block:content:nested:text:nested:heading$/.test(nodeId)) return 'heading';
  if (/:block:content:nested:text:nested:subheading$/.test(nodeId)) return 'subheading';
  if (/:block:content:nested:buttons:nested:button_1$/.test(nodeId)) return 'button_1';
  if (/:block:content:nested:buttons:nested:button_2$/.test(nodeId)) return 'button_2';
  if (/:block:comparison_slider$/.test(nodeId)) return 'comparison_slider';
  return null;
}

export function isImageCompareSectionBlockNodeId(nodeId: string): boolean {
  return imageCompareBlockKindFromNodeId(nodeId) !== null;
}

export function isImageCompareContentGroupNodeId(nodeId: string): boolean {
  return /:block:content$/.test(nodeId) && imageCompareSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageCompareTextGroupNodeId(nodeId: string): boolean {
  return /:block:content:nested:text$/.test(nodeId) && imageCompareSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageCompareButtonsGroupNodeId(nodeId: string): boolean {
  return /:block:content:nested:buttons$/.test(nodeId) && imageCompareSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageCompareButtonBlockNodeId(nodeId: string): boolean {
  const kind = imageCompareBlockKindFromNodeId(nodeId);
  return kind === 'button_1' || kind === 'button_2';
}

export function isImageCompareHeadingBlockNodeId(nodeId: string): boolean {
  return (
    /:block:content:nested:text:nested:heading$/.test(nodeId) &&
    imageCompareSectionBaseFromNodeId(nodeId) !== null
  );
}

export function isImageCompareSubheadingBlockNodeId(nodeId: string): boolean {
  return (
    /:block:content:nested:text:nested:subheading$/.test(nodeId) &&
    imageCompareSectionBaseFromNodeId(nodeId) !== null
  );
}

const HEADING_TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
] as const;

const SUBHEADING_TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'body', label: 'Body' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
] as const;

function imageCompareTypographyFieldDefs(
  sectionBase: string,
  contentKey: 'heading' | 'subheading'
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  const presetOptions =
    contentKey === 'heading'
      ? [...HEADING_TYPOGRAPHY_PRESET_OPTIONS]
      : [...SUBHEADING_TYPOGRAPHY_PRESET_OPTIONS];
  return [
    {
      path: s(contentKey),
      type: 'textarea',
      label: 'Text',
      group: 'Content',
      widget: 'richtext',
      sidebar: false,
    },
    {
      path: s(`${contentKey}Width`),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
      sidebar: false,
    },
    {
      path: s(`${contentKey}MaxWidth`),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select-inline',
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
      ],
      sidebar: false,
    },
    {
      path: s(`${contentKey}TypographyPreset`),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select-inline',
      description: 'Edit presets in theme settings',
      options: presetOptions,
      sidebar: false,
    },
    {
      path: s(`${contentKey}Color`),
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s(`${contentKey}BackgroundEnabled`),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      sidebar: false,
    },
    {
      path: s(`${contentKey}PaddingTop`),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s(`${contentKey}PaddingBottom`),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s(`${contentKey}PaddingLeft`),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s(`${contentKey}PaddingRight`),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
  ];
}

export const IMAGE_COMPARE_HEADING_FIELD_KEYS = new Set([
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

export const IMAGE_COMPARE_SUBHEADING_FIELD_KEYS = new Set([
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

export const IMAGE_COMPARE_HEADING_DEFAULTS: Record<string, string | boolean | number> = {
  heading: 'Find your perfect fit',
  headingWidth: 'fit',
  headingMaxWidth: 'normal',
  headingTypographyPreset: 'default',
  headingColor: '',
  headingBackgroundEnabled: false,
  headingPaddingTop: 0,
  headingPaddingBottom: 0,
  headingPaddingLeft: 0,
  headingPaddingRight: 0,
};

export const IMAGE_COMPARE_SUBHEADING_DEFAULTS: Record<string, string | boolean | number> = {
  subheading: 'Discover the best of both worlds',
  subheadingWidth: 'fit',
  subheadingMaxWidth: 'normal',
  subheadingTypographyPreset: 'default',
  subheadingColor: '',
  subheadingBackgroundEnabled: false,
  subheadingPaddingTop: 0,
  subheadingPaddingBottom: 0,
  subheadingPaddingLeft: 0,
  subheadingPaddingRight: 0,
};

export function isImageCompareHeadingBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return (
    IMAGE_COMPARE_HEADING_FIELD_KEYS.has(key) &&
    /image_compare/.test(field.path) &&
    !field.path.includes('.blocks.')
  );
}

export function isImageCompareSubheadingBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return (
    IMAGE_COMPARE_SUBHEADING_FIELD_KEYS.has(key) &&
    /image_compare/.test(field.path) &&
    !field.path.includes('.blocks.')
  );
}

export function isImageCompareHeadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('heading') && keys.has('headingWidth') && path.includes('image_compare');
}

export function isImageCompareSubheadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('subheading') && keys.has('subheadingWidth') && path.includes('image_compare');
}

const BUTTON_STYLE_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'link', label: 'Link' },
  { value: 'custom', label: 'Custom' },
] as const;

const BUTTON_WIDTH_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'custom', label: 'Custom' },
] as const;

function imageCompareButtonFieldDefs(sectionBase: string, prefix: 'button1' | 'button2'): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    { path: s(`${prefix}Label`), type: 'text', label: 'Label', group: 'Content', sidebar: false },
    {
      path: s(`${prefix}Url`),
      type: 'text',
      label: 'Link',
      widget: 'link',
      group: 'Content',
      sidebar: false,
      placeholder: 'Paste a link or search',
    },
    {
      path: s(`${prefix}OpenInNewTab`),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Content',
      sidebar: false,
    },
    {
      path: s(`${prefix}Style`),
      type: 'select',
      label: 'Style',
      group: 'Appearance',
      sidebar: false,
      options: [...BUTTON_STYLE_OPTIONS],
    },
    {
      path: s(`${prefix}DesktopWidth`),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...BUTTON_WIDTH_OPTIONS],
    },
    {
      path: s(`${prefix}DesktopCustomWidth`),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 20,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    },
    {
      path: s(`${prefix}MobileWidth`),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...BUTTON_WIDTH_OPTIONS],
    },
    {
      path: s(`${prefix}MobileCustomWidth`),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 20,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    },
  ];
}

export const IMAGE_COMPARE_BUTTON_1_FIELD_KEYS = new Set([
  'button1Label',
  'button1Url',
  'button1OpenInNewTab',
  'button1Style',
  'button1DesktopWidth',
  'button1DesktopCustomWidth',
  'button1MobileWidth',
  'button1MobileCustomWidth',
]);

export const IMAGE_COMPARE_BUTTON_2_FIELD_KEYS = new Set([
  'button2Label',
  'button2Url',
  'button2OpenInNewTab',
  'button2Style',
  'button2DesktopWidth',
  'button2DesktopCustomWidth',
  'button2MobileWidth',
  'button2MobileCustomWidth',
]);

export function imageCompareButtonFieldKeysForNodeId(nodeId: string): Set<string> | null {
  const kind = imageCompareBlockKindFromNodeId(nodeId);
  if (kind === 'button_1') return IMAGE_COMPARE_BUTTON_1_FIELD_KEYS;
  if (kind === 'button_2') return IMAGE_COMPARE_BUTTON_2_FIELD_KEYS;
  return null;
}

export const IMAGE_COMPARE_BUTTON_DEFAULTS: Record<string, string | boolean> = {
  button1Label: 'View all',
  button1Url: '/collections',
  button1OpenInNewTab: false,
  button1Style: 'secondary',
  button1DesktopWidth: 'fit',
  button1DesktopCustomWidth: 100,
  button1MobileWidth: 'fit',
  button1MobileCustomWidth: 100,
  button2Label: 'Shop now',
  button2Url: '/collections/all',
  button2OpenInNewTab: false,
  button2Style: 'secondary',
  button2DesktopWidth: 'fit',
  button2DesktopCustomWidth: 100,
  button2MobileWidth: 'fit',
  button2MobileCustomWidth: 100,
};

export function imageCompareBlockFieldDefs(
  sectionBase: string,
  blockKind: ImageCompareBlockKind
): EditorFieldDef[] {
  if (blockKind === 'heading') {
    return imageCompareTypographyFieldDefs(sectionBase, 'heading');
  }
  if (blockKind === 'subheading') {
    return imageCompareTypographyFieldDefs(sectionBase, 'subheading');
  }
  if (blockKind === 'button_1') {
    return imageCompareButtonFieldDefs(sectionBase, 'button1');
  }
  if (blockKind === 'button_2') {
    return imageCompareButtonFieldDefs(sectionBase, 'button2');
  }
  return comparisonSliderBlockFieldDefs(sectionBase);
}

export function imageCompareBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = imageCompareSectionBaseFromNodeId(nodeId);
  const blockKind = imageCompareBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return imageCompareBlockFieldDefs(sectionBase, blockKind);
}

export function isImageCompareSectionBlockField(field: EditorFieldDef): boolean {
  return (
    isImageCompareHeadingBlockField(field) ||
    isImageCompareSubheadingBlockField(field) ||
    isImageCompareSliderBlockField(field) ||
    isImageCompareButtonBlockField(field)
  );
}

export function isImageCompareButtonBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/image_compare/.test(field.path) || field.path.includes('.blocks.')) return false;
  return IMAGE_COMPARE_BUTTON_1_FIELD_KEYS.has(key) || IMAGE_COMPARE_BUTTON_2_FIELD_KEYS.has(key);
}

export function isImageCompareButtonBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  if (!path.includes('image_compare')) return false;
  const hasButton1 = keys.has('button1Label') && keys.has('button1Style');
  const hasButton2 = keys.has('button2Label') && keys.has('button2Style');
  return hasButton1 || hasButton2;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function imageCompareButtonPanelKeysForNodeId(nodeId: string): {
  labelKey: string;
  linkKey: string;
  openTabKey: string;
  styleKey: string;
  desktopWidthKey: string;
  desktopCustomWidthKey: string;
  mobileWidthKey: string;
  mobileCustomWidthKey: string;
} | null {
  const kind = imageCompareBlockKindFromNodeId(nodeId);
  if (kind === 'button_1') {
    return {
      labelKey: 'button1Label',
      linkKey: 'button1Url',
      openTabKey: 'button1OpenInNewTab',
      styleKey: 'button1Style',
      desktopWidthKey: 'button1DesktopWidth',
      desktopCustomWidthKey: 'button1DesktopCustomWidth',
      mobileWidthKey: 'button1MobileWidth',
      mobileCustomWidthKey: 'button1MobileCustomWidth',
    };
  }
  if (kind === 'button_2') {
    return {
      labelKey: 'button2Label',
      linkKey: 'button2Url',
      openTabKey: 'button2OpenInNewTab',
      styleKey: 'button2Style',
      desktopWidthKey: 'button2DesktopWidth',
      desktopCustomWidthKey: 'button2DesktopCustomWidth',
      mobileWidthKey: 'button2MobileWidth',
      mobileCustomWidthKey: 'button2MobileCustomWidth',
    };
  }
  return null;
}

export function extendImageCompareButtonBlockValues(
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
    const fallback = IMAGE_COMPARE_BUTTON_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function extendImageCompareTypographyBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      if (field.type === 'boolean') {
        next[field.path] = Boolean(raw);
      } else if (field.type === 'number') {
        next[field.path] = String(raw);
      } else {
        next[field.path] = String(raw);
      }
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback =
      IMAGE_COMPARE_HEADING_DEFAULTS[key] ?? IMAGE_COMPARE_SUBHEADING_DEFAULTS[key];
    if (fallback !== undefined) {
      next[field.path] =
        field.type === 'boolean' ? Boolean(fallback) : String(fallback);
    }
  }
  return next;
}

export function isImageCompareSectionBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isImageCompareSectionBlockField);
}

export function prepareImageCompareSectionBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = imageCompareBlockKindFromNodeId(node.id);
  if (blockKind === 'comparison_slider') {
    return prepareComparisonSliderBlockSettingsNode(node);
  }
  const label =
    blockKind === 'heading'
      ? 'Heading'
      : blockKind === 'subheading'
        ? 'Subheading'
        : blockKind === 'button_1' || blockKind === 'button_2'
          ? 'Button'
          : node.label;
  const fromNode = imageCompareBlockFieldDefsFromNodeId(node.id);
  const fields =
    fromNode.length > 0
      ? fromNode
      : (node.fields ?? []).filter(
          (f) =>
            isImageCompareHeadingBlockField(f) ||
            isImageCompareSubheadingBlockField(f) ||
            isImageCompareButtonBlockField(f)
        );
  return { ...node, label, kind: 'block', fields };
}
