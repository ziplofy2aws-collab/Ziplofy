import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { layoutBlueprintKey, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

/** Shopify Horizon FAQ section settings order (matches theme editor screenshots). */
export const FAQ_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Custom CSS',
] as const;

export const FAQ_LAYOUT_FIELD_ORDER = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

export const FAQ_SIZE_FIELD_ORDER = ['sectionWidth', 'height', 'customHeight'] as const;

export const FAQ_APPEARANCE_FIELD_ORDER = [
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'colorScheme',
  'backgroundOverlay',
  'overlayColor',
  'overlayStyle',
  'overlayGradientDirection',
] as const;

export const FAQ_BORDERS_FIELD_ORDER = [
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
] as const;

export const FAQ_PADDING_FIELD_ORDER = ['paddingTop', 'paddingBottom'] as const;

const PANEL_GROUPS = new Set<string>(FAQ_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
  sectionWidth: 10,
  height: 11,
  customHeight: 12,
  backgroundMedia: 20,
  backgroundImageUrl: 21,
  backgroundImagePosition: 22,
  backgroundOverlay: 24,
  overlayColor: 25,
  overlayStyle: 26,
  overlayGradientDirection: 27,
  colorScheme: 28,
  borderStyle: 30,
  borderThickness: 31,
  borderOpacity: 32,
  borderColor: 33,
  cornerRadius: 34,
  paddingTop: 40,
  paddingBottom: 41,
  customCss: 50,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function s(settingsBase: string, key: string): string {
  return `${settingsBase}.${key}`;
}

export function faqSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):(.+)$/);
  if (templateMatch) {
    return `templates.${templateMatch[1]}.sections.${templateMatch[2]}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:(.+)$/);
  if (layoutMatch) {
    return `sections.${layoutMatch[1]}.settings`;
  }
  return null;
}

function faqSettingsBaseFromFields(fields: EditorFieldDef[]): string | null {
  for (const field of fields) {
    const marker = '.settings.';
    const idx = field.path.indexOf(marker);
    if (idx > -1) return field.path.slice(0, idx + '.settings'.length);
  }
  return null;
}

const FAQ_SCHEME_BACKGROUNDS: Record<string, string> = {
  'scheme-1': '#ffffff',
  'scheme-2': '#f6f6f7',
  'scheme-3': '#eef6fb',
  'scheme-4': '#f5f3ff',
};

/** Maps stored value (legacy scheme key or hex) to a hex string for the color picker. */
export function faqBackgroundColorForPicker(raw: string): string {
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return raw;
  return FAQ_SCHEME_BACKGROUNDS[raw] ?? '#ffffff';
}

/** Canonical Shopify-order field defs for FAQ section settings. */
export function faqFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: s(settingsBase, 'direction'),
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: s(settingsBase, 'verticalOnMobile'),
      type: 'boolean',
      label: 'Vertical on mobile',
      group: 'Layout',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s(settingsBase, 'position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s(settingsBase, 'layoutGap'),
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'sectionWidth'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s(settingsBase, 'height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'full-screen', label: 'Full screen' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s(settingsBase, 'customHeight'),
      type: 'number',
      label: 'Custom height',
      group: 'Size',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'backgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: s(settingsBase, 'backgroundImageUrl'),
      type: 'text',
      label: 'Image',
      group: 'Appearance',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
    },
    {
      path: s(settingsBase, 'backgroundImagePosition'),
      type: 'select',
      label: 'Image position',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'fit', label: 'Fit' },
      ],
    },
    {
      path: s(settingsBase, 'colorScheme'),
      type: 'text',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'overlayColor'),
      type: 'text',
      label: 'Overlay color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'overlayStyle'),
      type: 'select',
      label: 'Overlay style',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'solid', label: 'Solid' },
        { value: 'gradient', label: 'Gradient' },
      ],
    },
    {
      path: s(settingsBase, 'overlayGradientDirection'),
      type: 'select',
      label: 'Gradient direction',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'up', label: 'Up' },
        { value: 'down', label: 'Down' },
      ],
    },
    {
      path: s(settingsBase, 'borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s(settingsBase, 'borderThickness'),
      type: 'number',
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'borderOpacity'),
      type: 'number',
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'borderColor'),
      type: 'text',
      label: 'Color',
      group: 'Borders',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'cornerRadius'),
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
      path: s(settingsBase, 'paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'customCss'),
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
}

export function faqFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = faqSettingsBaseFromNodeId(nodeId);
  return base ? faqFieldDefs(base) : [];
}

export function isFaqSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'faq' || secType === 'faq_section' || catalogVariant === 'faq';
}

export function isFaqSectionNodeId(nodeId: string): boolean {
  // Only match actual FAQ section nodes. `faqSettingsBaseFromNodeId` resolves a
  // settings base for ANY layout/template section, so it must not be used for
  // FAQ detection — that would misroute other sections (announcement bar,
  // footer, etc.) into the FAQ settings panel.
  const templateMatch = nodeId.match(/^template:[^:]+:([^:]+)$/);
  if (templateMatch) {
    return templateBlueprintKey(templateMatch[1]!) === 'faq_section';
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+)$/);
  if (layoutMatch) {
    return layoutBlueprintKey(layoutMatch[1]!) === 'faq_section';
  }
  return false;
}

export function isFaqPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path) || /^sections\.[^.]+\.settings\./.test(field.path);
}

/** Layout fields unique to the FAQ section panel (not hero media layout). */
export function isFaqLayoutPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const path = fields[0]?.path ?? '';
  if (path.includes('pull_quote') || path.includes('rich_text')) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('direction') &&
    keys.has('layoutGap') &&
    keys.has('verticalOnMobile') &&
    !keys.has('media1Type')
  );
}

export function isFaqBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'question' || key === 'answer';
}

export function sortFaqPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function sortFaqGroupFields(
  fields: EditorFieldDef[],
  order: readonly string[]
): EditorFieldDef[] {
  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = order.indexOf(key);
    return idx >= 0 ? idx : 99;
  };
  return [...fields].sort((a, b) => rank(a.path) - rank(b.path));
}

export function groupFaqPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFaqPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    if (group === 'Layout') map.set(group, sortFaqGroupFields(list, FAQ_LAYOUT_FIELD_ORDER));
    else if (group === 'Size') map.set(group, sortFaqGroupFields(list, FAQ_SIZE_FIELD_ORDER));
    else if (group === 'Appearance') {
      map.set(group, sortFaqGroupFields(list, FAQ_APPEARANCE_FIELD_ORDER));
    } else if (group === 'Borders') {
      map.set(group, sortFaqGroupFields(list, FAQ_BORDERS_FIELD_ORDER));
    } else if (group === 'Padding') {
      map.set(group, sortFaqGroupFields(list, FAQ_PADDING_FIELD_ORDER));
    }
  }
  return map;
}

export function isFaqSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const path = fields[0]?.path ?? '';
  // These sections share Layout–Size keys with FAQ; never treat them as FAQ.
  if (
    path.includes('contact_form') ||
    path.includes('email_signup') ||
    path.includes('pull_quote') ||
    path.includes('rich_text') ||
    path.includes('multicolumn') ||
    path.includes('icons_with_text') ||
    path.includes('image_with_text') ||
    path.includes('image_compare') ||
    path.includes('custom_section') ||
    path.includes('not_found')
  ) {
    return false;
  }
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (
    keys.has('caption') ||
    keys.has('videoUrl') ||
    keys.has('logoText') ||
    keys.has('imageBeforeUrl') ||
    keys.has('imageUrl') ||
    keys.has('jumboText') ||
    keys.has('quote') ||
    keys.has('linkLabel') ||
    keys.has('columns')
  ) {
    return false;
  }
  // Require FAQ-specific layout toggle so Pull quote / Rich text section settings
  // (direction + gap + width only) are not mislabeled as FAQ.
  return (
    keys.has('direction') &&
    keys.has('layoutGap') &&
    keys.has('layoutAlignment') &&
    keys.has('sectionWidth') &&
    keys.has('verticalOnMobile')
  );
}

export function prepareFaqSettingsNode(node: SidebarNode): SidebarNode {
  const fromNodeId = faqFieldDefsFromNodeId(node.id);
  const settingsBase =
    faqSettingsBaseFromNodeId(node.id) ?? faqSettingsBaseFromFields(node.fields ?? []);
  const canonical = fromNodeId.length ? fromNodeId : settingsBase ? faqFieldDefs(settingsBase) : [];
  const source = canonical.length ? canonical : (node.fields ?? []);
  const fields = sortFaqPanelFields(
    filterSidebarSectionPanelFields(source, isFaqPanelField)
  );
  return { ...node, label: 'FAQ', kind: 'section', fields };
}

export function prepareFaqBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter(isFaqBlockField);
  return { ...node, label: node.label || 'Question', kind: 'block', fields };
}
