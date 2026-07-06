import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export type ContactFormBlockKind = 'heading_text' | 'submit_button';

export function isContactFormSectionInstanceId(secId: string): boolean {
  return secId.includes('contact_form');
}

export function contactFormSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:heading|form)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isContactFormSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:heading|form)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isContactFormSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function contactFormBlockKindFromNodeId(nodeId: string): ContactFormBlockKind | null {
  if (/:block:heading$/.test(nodeId)) return 'heading_text';
  if (/:block:form:nested:submit_button$/.test(nodeId)) return 'submit_button';
  return null;
}

export function isContactFormBlockNodeId(nodeId: string): boolean {
  return contactFormBlockKindFromNodeId(nodeId) !== null;
}

export function isContactFormFormGroupNodeId(nodeId: string): boolean {
  return /:block:form$/.test(nodeId) && contactFormSectionBaseFromNodeId(nodeId) !== null;
}

const CONTACT_FORM_TEXT_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

const CONTACT_FORM_TEXT_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

const CONTACT_FORM_TEXT_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'body', label: 'Body' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'custom', label: 'Custom' },
] as const;

const CONTACT_FORM_TEXT_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

export const CONTACT_FORM_TEXT_CUSTOM_TYPOGRAPHY_KEYS = [
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
] as const;

const CONTACT_FORM_TEXT_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(
  CONTACT_FORM_TEXT_CUSTOM_TYPOGRAPHY_KEYS
);

export const CONTACT_FORM_TEXT_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const CONTACT_FORM_TEXT_PANEL_GROUPS = new Set<string>(CONTACT_FORM_TEXT_PANEL_GROUP_ORDER);

const CONTACT_FORM_TEXT_FIELD_SORT: Record<string, number> = {
  title: 0,
  headingWidth: 1,
  headingMaxWidth: 2,
  headingAlignment: 3,
  headingTypographyPreset: 10,
  headingFont: 11,
  headingFontSize: 12,
  headingLineHeight: 13,
  headingLetterSpacing: 14,
  headingTextCase: 15,
  headingWrap: 16,
  headingColor: 19,
  headingBackgroundEnabled: 20,
  headingBackgroundColor: 21,
  headingCornerRadius: 22,
  headingPaddingTop: 30,
  headingPaddingBottom: 31,
  headingPaddingLeft: 32,
  headingPaddingRight: 33,
};

function contactFormTextBlockFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    {
      path: s('title'),
      type: 'textarea',
      label: 'Text',
      group: 'Text',
      widget: 'richtext',
      sidebar: true,
    },
    {
      path: s('headingWidth'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    },
    {
      path: s('headingMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...CONTACT_FORM_TEXT_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('headingAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...CONTACT_FORM_TEXT_ALIGNMENT_OPTIONS],
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...CONTACT_FORM_TEXT_PRESET_OPTIONS],
    },
    {
      path: s('headingFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('headingFontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...CONTACT_FORM_TEXT_FONT_SIZE_OPTIONS],
    },
    {
      path: s('headingLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('headingLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('headingTextCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('headingWrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_WRAP_OPTIONS],
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
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('headingBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('headingCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 50,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('headingPaddingTop'),
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
      path: s('headingPaddingBottom'),
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
      path: s('headingPaddingLeft'),
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
      path: s('headingPaddingRight'),
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

export function contactFormBlockFieldDefs(
  sectionBase: string,
  blockKind: ContactFormBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'heading_text') {
    return contactFormTextBlockFieldDefs(sectionBase);
  }
  const fitCustom = [
    { value: 'fit', label: 'Fit' },
    { value: 'custom', label: 'Custom' },
  ];
  return [
    {
      path: s('submitLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('submitStyle'),
      type: 'select',
      label: 'Style',
      group: 'Content',
      widget: 'select',
      description: 'Edit primary and secondary button styles in theme settings',
      sidebar: true,
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
      ],
    },
    {
      path: s('submitDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: fitCustom,
    },
    {
      path: s('submitDesktopCustomWidth'),
      type: 'number',
      label: 'Width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('submitMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: fitCustom,
    },
    {
      path: s('submitMobileCustomWidth'),
      type: 'number',
      label: 'Width',
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

export function isContactFormSubmitButtonNodeId(nodeId: string): boolean {
  return (
    /:block:form:nested:submit_button$/.test(nodeId) &&
    contactFormSectionBaseFromNodeId(nodeId) !== null
  );
}

const CONTACT_FORM_SUBMIT_PANEL_GROUP_ORDER = ['Content', 'Size'] as const;
const CONTACT_FORM_SUBMIT_PANEL_GROUPS = new Set<string>(CONTACT_FORM_SUBMIT_PANEL_GROUP_ORDER);

const CONTACT_FORM_SUBMIT_FIELD_SORT: Record<string, number> = {
  submitLabel: 0,
  submitStyle: 1,
  submitDesktopWidth: 10,
  submitDesktopCustomWidth: 11,
  submitMobileWidth: 12,
  submitMobileCustomWidth: 13,
};

export function groupContactFormSubmitPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (CONTACT_FORM_SUBMIT_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (CONTACT_FORM_SUBMIT_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group =
      field.group && CONTACT_FORM_SUBMIT_PANEL_GROUPS.has(field.group) ? field.group : 'Content';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export { CONTACT_FORM_SUBMIT_PANEL_GROUP_ORDER };

export function isContactFormTextBlockNodeId(nodeId: string): boolean {
  return /:block:heading$/.test(nodeId) && contactFormSectionBaseFromNodeId(nodeId) !== null;
}

export function isContactFormTextTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterContactFormTextFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('headingTypographyPreset'));
  if (!presetField || isContactFormTextTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !CONTACT_FORM_TEXT_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function groupContactFormTextPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (CONTACT_FORM_TEXT_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (CONTACT_FORM_TEXT_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group =
      field.group && CONTACT_FORM_TEXT_PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function contactFormBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = contactFormSectionBaseFromNodeId(nodeId);
  const blockKind = contactFormBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return contactFormBlockFieldDefs(sectionBase, blockKind);
}

// ---------------------------------------------------------------------------
// Nested "Contact form" group block — Size / Appearance / Input / Padding
// ---------------------------------------------------------------------------

export const CONTACT_FORM_FORM_GROUP_PANEL_GROUP_ORDER = [
  'Size',
  'Appearance',
  'Input',
  'Padding',
] as const;

const CONTACT_FORM_FORM_GROUP_PANEL_GROUPS = new Set<string>(
  CONTACT_FORM_FORM_GROUP_PANEL_GROUP_ORDER
);

const CONTACT_FORM_FORM_GROUP_FIELD_SORT: Record<string, number> = {
  formDesktopWidth: 0,
  formDesktopCustomWidth: 1,
  formMobileWidth: 2,
  formMobileCustomWidth: 3,
  formBackgroundColor: 10,
  formInputStyle: 20,
  formPaddingTop: 30,
  formPaddingBottom: 31,
  formPaddingLeft: 32,
  formPaddingRight: 33,
};

export function contactFormFormGroupFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    {
      path: s('formDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('formDesktopCustomWidth'),
      type: 'number',
      label: 'Width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('formMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('formMobileCustomWidth'),
      type: 'number',
      label: 'Width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('formBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('formInputStyle'),
      type: 'select',
      label: 'Style',
      group: 'Input',
      widget: 'segmented',
      description: 'Edit input field in theme settings',
      sidebar: true,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('formPaddingTop'),
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
      path: s('formPaddingBottom'),
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
      path: s('formPaddingLeft'),
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
      path: s('formPaddingRight'),
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

export function contactFormFormGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  if (!isContactFormFormGroupNodeId(nodeId)) return [];
  const sectionBase = contactFormSectionBaseFromNodeId(nodeId);
  if (!sectionBase) return [];
  return contactFormFormGroupFieldDefs(sectionBase);
}

function isContactFormFormGroupBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/contact_form/.test(field.path) || field.path.includes('.blocks.')) return false;
  return key.startsWith('form') && key !== 'formPrefix';
}

export function isContactFormFormGroupFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return (
    fields.some((f) => (f.path.split('.').pop() ?? '').startsWith('formDesktopWidth')) &&
    fields.every(isContactFormFormGroupBlockField)
  );
}

export function groupContactFormFormGroupPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (CONTACT_FORM_FORM_GROUP_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (CONTACT_FORM_FORM_GROUP_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group =
      field.group && CONTACT_FORM_FORM_GROUP_PANEL_GROUPS.has(field.group) ? field.group : 'Size';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function prepareContactFormFormGroupSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = contactFormFormGroupFieldDefsFromNodeId(node.id);
  const fields =
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isContactFormFormGroupBlockField);
  return { ...node, label: 'Contact form', kind: 'block', fields };
}

export function isContactFormBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/contact_form/.test(field.path) || field.path.includes('.blocks.')) return false;
  return key === 'title' || key.startsWith('submit') || key.startsWith('heading');
}

export function isContactFormTextBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const hasTitle = fields.some((f) => f.path.endsWith('.title'));
  const hasHeadingStyle = fields.some((f) => (f.path.split('.').pop() ?? '').startsWith('heading'));
  return hasTitle && hasHeadingStyle && fields.every(isContactFormBlockField);
}

export function isContactFormBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isContactFormBlockField);
}

export function prepareContactFormBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = contactFormBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'heading_text' ? 'Text' : blockKind === 'submit_button' ? 'Submit button' : node.label;
  const fromNode = contactFormBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isContactFormBlockField);
  return { ...node, label, kind: 'block', fields };
}
