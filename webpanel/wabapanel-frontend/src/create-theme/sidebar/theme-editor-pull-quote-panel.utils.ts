import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { layoutBlueprintKey, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const PULL_QUOTE_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(PULL_QUOTE_PANEL_GROUP_ORDER);

const HEIGHT_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const;

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  layoutAlignment: 1,
  position: 2,
  layoutGap: 3,
  sectionWidth: 10,
  height: 11,
  backgroundMedia: 20,
  backgroundImageUrl: 21,
  backgroundColor: 22,
  backgroundOverlay: 23,
  borderStyle: 26,
  borderThickness: 27,
  borderOpacity: 28,
  borderColor: 29,
  cornerRadius: 30,
  paddingTop: 31,
  paddingBottom: 32,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function s(settingsBase: string, key: string): string {
  return `${settingsBase}.${key}`;
}

export function pullQuoteSettingsBaseFromNodeId(nodeId: string): string | null {
  // Section nodes only — ignore Text/Button block ids (`…:block:text|button`).
  const templateMatch = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (templateMatch) {
    const secId = templateMatch[2]!;
    if (!secId.includes('pull_quote')) return null;
    return `templates.${templateMatch[1]}.sections.${secId}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+)$/);
  if (layoutMatch) {
    const secId = layoutMatch[1]!;
    if (!secId.includes('pull_quote')) return null;
    return `sections.${secId}.settings`;
  }
  return null;
}

export function isPullQuoteSectionNodeId(nodeId: string): boolean {
  const templateMatch = nodeId.match(/^template:[^:]+:([^:]+)$/);
  if (templateMatch) {
    return templateBlueprintKey(templateMatch[1]!) === 'pull_quote_section';
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+)$/);
  if (layoutMatch) {
    return layoutBlueprintKey(layoutMatch[1]!) === 'pull_quote_section';
  }
  return false;
}

export function isPullQuoteSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'pull-quote' || catalogVariant === 'pull-quote';
}

/** Canonical section settings (Shopify order) so Height / Borders stay correct even if schema drifts. */
export function pullQuoteFieldDefs(settingsBase: string): EditorFieldDef[] {
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
      options: [...HEIGHT_OPTIONS],
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
      label: 'Background image',
      group: 'Appearance',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
    },
    {
      path: s(settingsBase, 'backgroundColor'),
      type: 'color',
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
  ];
}

function normalizePullQuotePanelField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'height') {
    return {
      ...field,
      label: 'Height',
      group: 'Size',
      widget: 'select-inline',
      options: [...HEIGHT_OPTIONS],
    };
  }
  if (key === 'borderStyle') {
    return {
      ...field,
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    };
  }
  if (key === 'borderThickness') {
    return {
      ...field,
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: field.min ?? 0,
      max: field.max ?? 10,
      step: field.step ?? 1,
      unit: field.unit ?? 'px',
    };
  }
  if (key === 'borderOpacity') {
    return {
      ...field,
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: field.min ?? 0,
      max: field.max ?? 100,
      step: field.step ?? 1,
      unit: field.unit ?? '%',
    };
  }
  if (key === 'borderColor') {
    return {
      ...field,
      label: 'Color',
      group: 'Borders',
      widget: 'color',
    };
  }
  if (key === 'cornerRadius') {
    return {
      ...field,
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: field.min ?? 0,
      max: field.max ?? 40,
      step: field.step ?? 1,
      unit: field.unit ?? 'px',
    };
  }
  return field;
}

export function isPullQuotePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'colorScheme' || key === 'customCss') return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  // Template schema may put these under Appearance; still include them for Borders.
  if (
    key === 'borderStyle' ||
    key === 'borderThickness' ||
    key === 'borderOpacity' ||
    key === 'borderColor' ||
    key === 'cornerRadius'
  ) {
    return true;
  }
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortPullQuotePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
  };
  const effectiveGroup = (field: EditorFieldDef) => {
    const key = field.path.split('.').pop() ?? '';
    if (
      key === 'borderStyle' ||
      key === 'borderThickness' ||
      key === 'borderOpacity' ||
      key === 'borderColor' ||
      key === 'cornerRadius'
    ) {
      return 'Borders';
    }
    return field.group ?? '';
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[effectiveGroup(a)] ?? 9;
    const gb = groupRank[effectiveGroup(b)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupPullQuotePanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    let group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    let panelField = field;
    if (key === 'borderStyle') {
      group = 'Borders';
      panelField = { ...field, label: 'Style', group: 'Borders' };
    } else if (
      key === 'borderThickness' ||
      key === 'borderOpacity' ||
      key === 'borderColor' ||
      key === 'cornerRadius'
    ) {
      group = 'Borders';
      panelField = { ...field, group: 'Borders' };
    }
    const list = map.get(group) ?? [];
    list.push(panelField);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortPullQuotePanelFields(list));
  }
  return map;
}

export function isPullQuoteSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const path = fields[0]?.path ?? '';
  if (!path.includes('pull_quote')) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  // Section settings panel (after prepare) or raw schema with content keys.
  if (keys.has('verticalOnMobile') || keys.has('columns') || keys.has('customHeight')) return false;
  if (keys.has('quote') && keys.has('linkLabel')) return true;
  return keys.has('direction') && keys.has('layoutGap') && keys.has('sectionWidth');
}

export function preparePullQuoteSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase = pullQuoteSettingsBaseFromNodeId(node.id);
  const canonical = settingsBase ? pullQuoteFieldDefs(settingsBase) : [];
  if (canonical.length) {
    return {
      ...node,
      label: 'Pull quote',
      kind: 'section',
      fields: sortPullQuotePanelFields(canonical),
    };
  }
  const fields = sortPullQuotePanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isPullQuotePanelField).map(
      normalizePullQuotePanelField
    )
  );
  return { ...node, label: 'Pull quote', kind: 'section', fields };
}
