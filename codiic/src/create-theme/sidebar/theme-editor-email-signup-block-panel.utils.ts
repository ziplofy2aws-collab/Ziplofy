import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export type EmailSignupBlockKind = 'heading' | 'text' | 'signup';

export function isEmailSignupSectionInstanceId(secId: string): boolean {
  return secId.includes('email_signup');
}

export function emailSignupSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:heading|text|signup)(?::|$)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isEmailSignupSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:heading|text|signup)(?::|$)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isEmailSignupSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function emailSignupBlockKindFromNodeId(nodeId: string): EmailSignupBlockKind | null {
  if (/:block:heading$/.test(nodeId)) return 'heading';
  if (/:block:text$/.test(nodeId)) return 'text';
  if (/:block:signup$/.test(nodeId)) return 'signup';
  return null;
}

export function isEmailSignupSectionBlockNodeId(nodeId: string): boolean {
  return emailSignupBlockKindFromNodeId(nodeId) !== null;
}

const EMAIL_SIGNUP_HEADING_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

const EMAIL_SIGNUP_HEADING_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

const EMAIL_SIGNUP_HEADING_PRESET_OPTIONS = [
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

const EMAIL_SIGNUP_HEADING_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

const EMAIL_SIGNUP_HEADING_CUSTOM_TYPOGRAPHY_KEYS = [
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
] as const;

const EMAIL_SIGNUP_HEADING_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(
  EMAIL_SIGNUP_HEADING_CUSTOM_TYPOGRAPHY_KEYS
);

export const EMAIL_SIGNUP_HEADING_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const EMAIL_SIGNUP_HEADING_PANEL_GROUPS = new Set<string>(EMAIL_SIGNUP_HEADING_PANEL_GROUP_ORDER);

const EMAIL_SIGNUP_HEADING_FIELD_SORT: Record<string, number> = {
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

function emailSignupHeadingBlockFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    { path: s('title'), type: 'textarea', label: 'Text', group: 'Text', widget: 'richtext', sidebar: true },
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
      options: [...EMAIL_SIGNUP_HEADING_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('headingAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...EMAIL_SIGNUP_HEADING_ALIGNMENT_OPTIONS],
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...EMAIL_SIGNUP_HEADING_PRESET_OPTIONS],
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
      options: [...EMAIL_SIGNUP_HEADING_FONT_SIZE_OPTIONS],
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
    { path: s('headingColor'), type: 'color', label: 'Text color', group: 'Appearance', widget: 'color', sidebar: true },
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
    { path: s('headingPaddingTop'), type: 'number', label: 'Top', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('headingPaddingBottom'), type: 'number', label: 'Bottom', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('headingPaddingLeft'), type: 'number', label: 'Left', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('headingPaddingRight'), type: 'number', label: 'Right', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
  ];
}

const EMAIL_SIGNUP_TEXT_CUSTOM_TYPOGRAPHY_KEYS = [
  'textFont',
  'textFontSize',
  'textLineHeight',
  'textLetterSpacing',
  'textTextCase',
  'textWrap',
] as const;

const EMAIL_SIGNUP_TEXT_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(
  EMAIL_SIGNUP_TEXT_CUSTOM_TYPOGRAPHY_KEYS
);

export const EMAIL_SIGNUP_TEXT_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const EMAIL_SIGNUP_TEXT_PANEL_GROUPS = new Set<string>(EMAIL_SIGNUP_TEXT_PANEL_GROUP_ORDER);

const EMAIL_SIGNUP_TEXT_FIELD_SORT: Record<string, number> = {
  subtitle: 0,
  textWidth: 1,
  textMaxWidth: 2,
  textAlignment: 3,
  textTypographyPreset: 10,
  textFont: 11,
  textFontSize: 12,
  textLineHeight: 13,
  textLetterSpacing: 14,
  textTextCase: 15,
  textWrap: 16,
  textColor: 19,
  textBackgroundEnabled: 20,
  textBackgroundColor: 21,
  textCornerRadius: 22,
  textPaddingTop: 30,
  textPaddingBottom: 31,
  textPaddingLeft: 32,
  textPaddingRight: 33,
};

function emailSignupTextBlockFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    { path: s('subtitle'), type: 'textarea', label: 'Text', group: 'Text', widget: 'richtext', sidebar: true },
    {
      path: s('textWidth'),
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
      path: s('textMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...EMAIL_SIGNUP_HEADING_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('textAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...EMAIL_SIGNUP_HEADING_ALIGNMENT_OPTIONS],
    },
    {
      path: s('textTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...EMAIL_SIGNUP_HEADING_PRESET_OPTIONS],
    },
    {
      path: s('textFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('textFontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...EMAIL_SIGNUP_HEADING_FONT_SIZE_OPTIONS],
    },
    {
      path: s('textLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('textLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('textTextCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('textWrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_WRAP_OPTIONS],
    },
    { path: s('textColor'), type: 'color', label: 'Text color', group: 'Appearance', widget: 'color', sidebar: true },
    {
      path: s('textBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('textBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('textCornerRadius'),
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
    { path: s('textPaddingTop'), type: 'number', label: 'Top', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('textPaddingBottom'), type: 'number', label: 'Bottom', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('textPaddingLeft'), type: 'number', label: 'Left', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('textPaddingRight'), type: 'number', label: 'Right', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
  ];
}

export const EMAIL_SIGNUP_FORM_PANEL_GROUP_ORDER = [
  'Width',
  'Heading',
  'Input',
  'Submit button',
  'Padding',
] as const;

const EMAIL_SIGNUP_FORM_PANEL_GROUPS = new Set<string>(EMAIL_SIGNUP_FORM_PANEL_GROUP_ORDER);

const EMAIL_SIGNUP_FORM_FIELD_SORT: Record<string, number> = {
  signupWidth: 0,
  signupCustomWidth: 1,
  signupHeadingText: 10,
  signupHeadingColor: 11,
  signupHeadingPreset: 12,
  signupInputBorder: 20,
  signupInputStyle: 21,
  signupSubmitStyle: 30,
  signupSubmitLinkColor: 31,
  signupSubmitDisplay: 32,
  signupIntegratedButton: 33,
  signupPaddingTop: 40,
  signupPaddingBottom: 41,
  signupPaddingLeft: 42,
  signupPaddingRight: 43,
};

function emailSignupFormBlockFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    // Kept for runtime input placeholder; not shown in the panel.
    { path: s('placeholder'), type: 'text', label: 'Email placeholder', group: 'Content', sidebar: true },
    {
      path: s('signupWidth'),
      type: 'select',
      label: 'Width',
      group: 'Width',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fill', label: 'Fill' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('signupCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Width',
      widget: 'slider',
      min: 10,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    { path: s('signupHeadingText'), type: 'textarea', label: 'Text', group: 'Heading', widget: 'richtext', sidebar: true },
    { path: s('signupHeadingColor'), type: 'color', label: 'Color', group: 'Heading', widget: 'color', sidebar: true },
    {
      path: s('signupHeadingPreset'),
      type: 'select',
      label: 'Text preset',
      group: 'Heading',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'paragraph', label: 'Paragraph' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-6', label: 'Heading 6' },
      ],
    },
    {
      path: s('signupInputBorder'),
      type: 'select',
      label: 'Border',
      group: 'Input',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'all', label: 'All' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('signupInputStyle'),
      type: 'select',
      label: 'Style',
      group: 'Input',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('signupSubmitStyle'),
      type: 'select',
      label: 'Style',
      group: 'Submit button',
      widget: 'select',
      description: 'Edit primary and secondary button styles in theme settings',
      sidebar: true,
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'link', label: 'Link' },
      ],
    },
    { path: s('signupSubmitLinkColor'), type: 'color', label: 'Link text color', group: 'Submit button', widget: 'color', sidebar: true },
    {
      path: s('signupSubmitDisplay'),
      type: 'select',
      label: 'Display',
      group: 'Submit button',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'text', label: 'Text' },
        { value: 'arrow', label: 'Arrow' },
      ],
    },
    {
      path: s('signupIntegratedButton'),
      type: 'boolean',
      label: 'Integrated button',
      group: 'Submit button',
      widget: 'toggle',
      sidebar: true,
    },
    { path: s('signupPaddingTop'), type: 'number', label: 'Top', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('signupPaddingBottom'), type: 'number', label: 'Bottom', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('signupPaddingLeft'), type: 'number', label: 'Left', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
    { path: s('signupPaddingRight'), type: 'number', label: 'Right', group: 'Padding', widget: 'slider', min: 0, max: 80, step: 1, unit: 'px', sidebar: true },
  ];
}

export function emailSignupBlockFieldDefs(
  sectionBase: string,
  blockKind: EmailSignupBlockKind
): EditorFieldDef[] {
  if (blockKind === 'heading') {
    return emailSignupHeadingBlockFieldDefs(sectionBase);
  }
  if (blockKind === 'text') {
    return emailSignupTextBlockFieldDefs(sectionBase);
  }
  return emailSignupFormBlockFieldDefs(sectionBase);
}

export function emailSignupBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = emailSignupSectionBaseFromNodeId(nodeId);
  const blockKind = emailSignupBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return emailSignupBlockFieldDefs(sectionBase, blockKind);
}

export function isEmailSignupSectionBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/email_signup/.test(field.path) || field.path.includes('.blocks.')) return false;
  return (
    key === 'title' ||
    key === 'subtitle' ||
    key === 'placeholder' ||
    key.startsWith('heading') ||
    key.startsWith('text') ||
    key.startsWith('signup')
  );
}

export function isEmailSignupTextBlockNodeId(nodeId: string): boolean {
  return /:block:text$/.test(nodeId) && emailSignupSectionBaseFromNodeId(nodeId) !== null;
}

export function isEmailSignupTextBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const hasSubtitle = fields.some((f) => f.path.endsWith('.subtitle'));
  const hasTextStyle = fields.some((f) => (f.path.split('.').pop() ?? '').startsWith('text'));
  return hasSubtitle && hasTextStyle && fields.every(isEmailSignupSectionBlockField);
}

export function isEmailSignupTextTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'paragraph' : String(raw);
  return preset === 'custom';
}

export function filterEmailSignupTextFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('textTypographyPreset'));
  if (!presetField || isEmailSignupTextTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !EMAIL_SIGNUP_TEXT_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function groupEmailSignupTextPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (EMAIL_SIGNUP_TEXT_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (EMAIL_SIGNUP_TEXT_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group =
      field.group && EMAIL_SIGNUP_TEXT_PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isEmailSignupFormBlockNodeId(nodeId: string): boolean {
  return /:block:signup$/.test(nodeId) && emailSignupSectionBaseFromNodeId(nodeId) !== null;
}

export function isEmailSignupFormBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const hasSignupStyle = fields.some((f) => (f.path.split('.').pop() ?? '').startsWith('signup'));
  return hasSignupStyle && fields.every(isEmailSignupSectionBlockField);
}

export function groupEmailSignupFormPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (EMAIL_SIGNUP_FORM_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 90) -
      (EMAIL_SIGNUP_FORM_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 90)
  );
  for (const field of sorted) {
    if (!field.group || !EMAIL_SIGNUP_FORM_PANEL_GROUPS.has(field.group)) continue;
    const list = map.get(field.group) ?? [];
    list.push(field);
    map.set(field.group, list);
  }
  return map;
}

export function isEmailSignupHeadingBlockNodeId(nodeId: string): boolean {
  return /:block:heading$/.test(nodeId) && emailSignupSectionBaseFromNodeId(nodeId) !== null;
}

export function isEmailSignupHeadingBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const hasTitle = fields.some((f) => f.path.endsWith('.title'));
  const hasHeadingStyle = fields.some((f) => (f.path.split('.').pop() ?? '').startsWith('heading'));
  return hasTitle && hasHeadingStyle && fields.every(isEmailSignupSectionBlockField);
}

export function isEmailSignupHeadingTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterEmailSignupHeadingFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('headingTypographyPreset'));
  if (!presetField || isEmailSignupHeadingTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !EMAIL_SIGNUP_HEADING_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function groupEmailSignupHeadingPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (EMAIL_SIGNUP_HEADING_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (EMAIL_SIGNUP_HEADING_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group =
      field.group && EMAIL_SIGNUP_HEADING_PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isEmailSignupSectionBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isEmailSignupSectionBlockField);
}

export function prepareEmailSignupSectionBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = emailSignupBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'heading'
      ? 'Heading'
      : blockKind === 'text'
        ? 'Text'
        : blockKind === 'signup'
          ? 'Email signup'
          : node.label;
  const fromNode = emailSignupBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isEmailSignupSectionBlockField);
  return { ...node, label, kind: 'block', fields };
}
