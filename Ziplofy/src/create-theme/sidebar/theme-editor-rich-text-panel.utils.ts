import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const RICH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(RICH_TEXT_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  layoutAlignment: 1,
  position: 2,
  layoutGap: 3,
  sectionWidth: 10,
  height: 11,
  colorScheme: 20,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  backgroundImagePosition: 23,
  backgroundColor: 24,
  textColor: 25,
  backgroundOverlay: 26,
  overlayColor: 27,
  overlayOpacity: 28,
  borderStyle: 29,
  cornerRadius: 30,
  paddingTop: 31,
  paddingBottom: 32,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isRichTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'rich-text' || catalogVariant === 'rich-text';
}

export function isRichTextPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'customCss') return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  // Template schema may put these under Appearance; still include them for Borders.
  if (key === 'borderStyle' || key === 'cornerRadius') return true;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortRichTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
  };
  const effectiveGroup = (field: EditorFieldDef) => {
    const key = field.path.split('.').pop() ?? '';
    if (key === 'borderStyle' || key === 'cornerRadius') return 'Borders';
    return field.group ?? '';
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[effectiveGroup(a)] ?? 9;
    const gb = groupRank[effectiveGroup(b)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupRichTextPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    let group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    let panelField = field;
    if (key === 'borderStyle') {
      group = 'Borders';
      panelField = { ...field, label: 'Style', group: 'Borders' };
    } else if (key === 'cornerRadius') {
      group = 'Borders';
      panelField = { ...field, group: 'Borders' };
    }
    const list = map.get(group) ?? [];
    list.push(panelField);
    map.set(group, list);
  }
  return map;
}

export function isRichTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('layoutGap') &&
    keys.has('direction') &&
    keys.has('layoutAlignment') &&
    !keys.has('quote') &&
    path.includes('rich_text')
  );
}

export type RichTextBlockKind = 'heading' | 'text' | 'button';

export function isRichTextSectionInstanceId(secId: string): boolean {
  return secId.includes('rich_text') || secId === 'rich_text_section';
}

export function richTextSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:heading|text|button)$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isRichTextSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:heading|text|button)$/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isRichTextSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function richTextBlockKindFromNodeId(nodeId: string): RichTextBlockKind | null {
  const m = nodeId.match(/:block:(heading|text|button)$/);
  return (m?.[1] as RichTextBlockKind | undefined) ?? null;
}

export function isRichTextBlockNodeId(nodeId: string): boolean {
  return richTextSectionBaseFromNodeId(nodeId) !== null;
}

export function isRichTextBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!field.path.includes('rich_text') || field.path.includes('.blocks.')) return false;
  if (key === 'heading' || key === 'text') return true;
  return (
    RICH_TEXT_BUTTON_KEYS.has(key) ||
    RICH_TEXT_TEXT_KEYS.has(key) ||
    RICH_TEXT_HEADING_KEYS.has(key)
  );
}

export function isRichTextBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isRichTextBlockField);
}

export function richTextBlockFieldDefs(
  sectionBase: string,
  blockKind: RichTextBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'heading') {
    return [
      {
        path: s('heading'),
        type: 'textarea',
        label: 'Heading',
        widget: 'richtext',
        group: 'Content',
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
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        path: s('headingFont'),
        type: 'select',
        label: 'Font',
        group: 'Typography',
        widget: 'select',
        options: [
          { value: 'body', label: 'Body' },
          { value: 'subheading', label: 'Subheading' },
          { value: 'heading', label: 'Heading' },
          { value: 'accent', label: 'Accent' },
        ],
      },
      {
        path: s('headingFontSize'),
        type: 'select',
        label: 'Size',
        group: 'Typography',
        widget: 'select',
        options: [
          '10px',
          '12px',
          '14px',
          '16px',
          '18px',
          '20px',
          '24px',
          '28px',
          '32px',
          '36px',
          '40px',
          '48px',
          '56px',
          '64px',
          '72px',
        ].map((value) => ({ value, label: value })),
      },
      {
        path: s('headingLineHeight'),
        type: 'select',
        label: 'Line height',
        group: 'Typography',
        widget: 'segmented',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'loose', label: 'Loose' },
        ],
      },
      {
        path: s('headingLetterSpacing'),
        type: 'select',
        label: 'Letter spacing',
        group: 'Typography',
        widget: 'segmented',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'loose', label: 'Loose' },
        ],
      },
      {
        path: s('headingTextCase'),
        type: 'select',
        label: 'Case',
        group: 'Typography',
        widget: 'segmented',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'uppercase', label: 'Uppercase' },
        ],
      },
      {
        path: s('headingWrap'),
        type: 'select',
        label: 'Wrap',
        group: 'Typography',
        widget: 'select',
        options: [
          { value: 'pretty', label: 'Pretty' },
          { value: 'balance', label: 'Balance' },
          { value: 'nowrap', label: 'No wrap' },
        ],
      },
      {
        path: s('headingColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
      },
      {
        path: s('headingBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
      },
      {
        path: s('headingBackgroundColor'),
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
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
      },
    ];
  }
  if (blockKind === 'text') {
    return [
      {
        path: s('text'),
        type: 'textarea',
        label: 'Text',
        widget: 'richtext',
        group: 'Content',
        sidebar: true,
      },
      {
        path: s('textWidth'),
        type: 'select',
        label: 'Width',
        group: 'Layout',
        widget: 'segmented',
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
        widget: 'select-inline',
        options: [
          { value: 'narrow', label: 'Narrow' },
          { value: 'normal', label: 'Normal' },
          { value: 'wide', label: 'Wide' },
        ],
      },
      {
        path: s('textTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'body', label: 'Body' },
          { value: 'heading-6', label: 'Heading 6' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-4', label: 'Heading 4' },
        ],
      },
      {
        path: s('textColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
      },
      {
        path: s('textBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
      },
      {
        path: s('textBackgroundColor'),
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
      },
      {
        path: s('textPaddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
      {
        path: s('textPaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
      {
        path: s('textPaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
      {
        path: s('textPaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
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
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('buttonOpenInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Content',
    },
    {
      path: s('buttonStyle'),
      type: 'select',
      label: 'Style',
      group: 'Appearance',
      widget: 'select-inline',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'link', label: 'Link' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('buttonCustomBackground'),
      type: 'color',
      label: 'Background',
      group: 'Appearance',
      widget: 'color',
    },
    {
      path: s('buttonCustomText'),
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
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
    },
    {
      path: s('buttonDesktopCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
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
    },
    {
      path: s('buttonMobileCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
    },
  ];
}

const RICH_TEXT_BUTTON_KEYS = new Set([
  'buttonLabel',
  'buttonUrl',
  'buttonOpenInNewTab',
  'buttonStyle',
  'buttonCustomBackground',
  'buttonCustomText',
  'buttonDesktopWidth',
  'buttonDesktopCustomWidth',
  'buttonMobileWidth',
  'buttonMobileCustomWidth',
]);

export function isRichTextButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('buttonLabel') && keys.has('buttonUrl');
}

const RICH_TEXT_TEXT_KEYS = new Set([
  'textWidth',
  'textMaxWidth',
  'textTypographyPreset',
  'textColor',
  'textBackgroundEnabled',
  'textBackgroundColor',
  'textPaddingTop',
  'textPaddingBottom',
  'textPaddingLeft',
  'textPaddingRight',
]);

export function isRichTextTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('text') && keys.has('textWidth');
}

const RICH_TEXT_HEADING_KEYS = new Set([
  'headingWidth',
  'headingMaxWidth',
  'headingTypographyPreset',
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
  'headingColor',
  'headingBackgroundEnabled',
  'headingBackgroundColor',
  'headingPaddingTop',
  'headingPaddingBottom',
  'headingPaddingLeft',
  'headingPaddingRight',
]);

export function isRichTextHeadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('heading') && keys.has('headingWidth');
}

export function richTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = richTextSectionBaseFromNodeId(nodeId);
  const blockKind = richTextBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return richTextBlockFieldDefs(sectionBase, blockKind);
}

export function richTextSettingsBaseFromSectionNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:([^:]+)$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isRichTextSectionInstanceId(secId)) return null;
    return `sections.${secId}.settings`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isRichTextSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}.settings`;
  }
  return null;
}

/** Ensure Appearance fields exist even when template schema omits them. */
export function ensureRichTextAppearanceFields(
  sectionNodeId: string,
  fields: EditorFieldDef[]
): EditorFieldDef[] {
  const settingsBase = richTextSettingsBaseFromSectionNodeId(sectionNodeId);
  if (!settingsBase) return fields;
  const has = (key: string) => fields.some((f) => f.path.endsWith(`.${key}`) || f.path.endsWith(key));
  const extras: EditorFieldDef[] = [];
  if (!has('backgroundColor')) {
    extras.push({
      path: `${settingsBase}.backgroundColor`,
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!has('overlayColor')) {
    extras.push({
      path: `${settingsBase}.overlayColor`,
      type: 'text',
      label: 'Overlay color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!has('overlayOpacity')) {
    extras.push({
      path: `${settingsBase}.overlayOpacity`,
      type: 'number',
      label: 'Overlay opacity',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    });
  }
  if (!has('backgroundImagePosition')) {
    extras.push({
      path: `${settingsBase}.backgroundImagePosition`,
      type: 'select',
      label: 'Image fit',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'fit', label: 'Fit' },
        { value: 'stretch', label: 'Stretch' },
      ],
    });
  }
  if (!extras.length) return fields;
  return sortRichTextPanelFields([...fields, ...extras]);
}

export function prepareRichTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = richTextBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'heading' ? 'Heading' : blockKind === 'text' ? 'Text' : blockKind === 'button' ? 'Button' : node.label;
  const fromNode = richTextBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isRichTextBlockField);
  return { ...node, label, kind: 'block', fields };
}

export function prepareRichTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = ensureRichTextAppearanceFields(
    node.id,
    sortRichTextPanelFields(filterSidebarSectionPanelFields(node.fields ?? [], isRichTextPanelField))
  );
  return { ...node, label: 'Rich text', kind: 'section', fields };
}
