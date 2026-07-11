import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { isSectionSettingsFieldPath } from './create-theme-field.utils';
import { resolveEditingPanelForNode } from '../../theme-editor/section-editing-support.util';
import { layoutBlueprintKey } from '../../utils/theme-editor-insert-section';

export const DIVIDER_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(DIVIDER_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  backgroundColor: 0,
  color: 1,
  sectionWidth: 2,
  thickness: 3,
  length: 4,
  paddingTop: 10,
  paddingBottom: 11,
  customCss: 20,
};

/** Hardcoded defaults so the panel never depends on catalog/schema alone. */
export const DIVIDER_DEFAULT_SETTINGS_FIELDS: EditorFieldDef[] = [
  {
    path: 'sections.divider.settings.backgroundColor',
    type: 'color',
    label: 'Background color',
    group: 'General',
    widget: 'color',
  },
  {
    path: 'sections.divider.settings.color',
    type: 'color',
    label: 'Color',
    group: 'General',
    widget: 'color',
  },
  {
    path: 'sections.divider.settings.sectionWidth',
    type: 'select',
    label: 'Width',
    group: 'General',
    widget: 'segmented',
    options: [
      { value: 'page', label: 'Page' },
      { value: 'full', label: 'Full' },
    ],
  },
  {
    path: 'sections.divider.settings.thickness',
    type: 'number',
    label: 'Thickness',
    group: 'General',
    widget: 'slider',
    min: 0,
    max: 20,
    step: 1,
    unit: 'px',
  },
  {
    path: 'sections.divider.settings.length',
    type: 'number',
    label: 'Length',
    group: 'General',
    widget: 'slider',
    min: 10,
    max: 100,
    step: 1,
    unit: '%',
  },
  {
    path: 'sections.divider.settings.paddingTop',
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
  },
  {
    path: 'sections.divider.settings.paddingBottom',
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
  },
  {
    path: 'sections.divider.settings.customCss',
    type: 'textarea',
    label: 'Custom CSS',
    group: 'Custom CSS',
    widget: 'accordion',
  },
];

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function isColorSchemeField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'colorScheme' || field.widget === 'color-scheme';
}

function inferredDividerGroup(field: EditorFieldDef): string | undefined {
  if (field.group && PANEL_GROUPS.has(field.group)) return field.group;
  const key = field.path.split('.').pop() ?? '';
  if (
    key === 'backgroundColor' ||
    key === 'color' ||
    key === 'sectionWidth' ||
    key === 'thickness' ||
    key === 'length'
  ) {
    return 'General';
  }
  if (key === 'paddingTop' || key === 'paddingBottom') return 'Padding';
  if (key === 'customCss') return 'Custom CSS';
  return undefined;
}

function withInferredGroups(fields: EditorFieldDef[]): EditorFieldDef[] {
  return fields.map((f) => {
    const group = inferredDividerGroup(f);
    return group && group !== f.group ? { ...f, group } : f;
  });
}

export function isDividerSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'divider' || catalogVariant === 'divider';
}

export function isDividerLayoutNodeId(nodeId: string): boolean {
  const m = nodeId.match(/^layout:(divider(?:_\d+)?)$/);
  return Boolean(m && layoutBlueprintKey(m[1]) === 'divider');
}

export function isDividerSectionNodeId(nodeId: string): boolean {
  if (isDividerLayoutNodeId(nodeId)) return true;
  return /^template:[^:]+:divider(?:_\d+)?$/.test(nodeId);
}

export function dividerInstanceIdFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(divider(?:_\d+)?)$/);
  if (layout) return layout[1];
  const tpl = nodeId.match(/^template:[^:]+:(divider(?:_\d+)?)$/);
  if (tpl) return tpl[1];
  return null;
}

function remapDividerDefaultFields(instanceId: string, templateId?: string): EditorFieldDef[] {
  const from = 'sections.divider.settings';
  const to = templateId
    ? `templates.${templateId}.sections.${instanceId}.settings`
    : `sections.${instanceId}.settings`;
  return DIVIDER_DEFAULT_SETTINGS_FIELDS.map((field) => ({
    ...field,
    path: field.path.startsWith(from) ? `${to}${field.path.slice(from.length)}` : field.path,
  }));
}

export function isDividerPanelField(field: EditorFieldDef): boolean {
  if (isColorSchemeField(field)) return false;
  const grouped = inferredDividerGroup(field);
  if (!grouped) return false;
  return isSectionSettingsFieldPath(field.path);
}

export function sortDividerPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Padding: 1, 'Custom CSS': 2 };
  return [...withInferredGroups(fields)].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function filterDividerPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return sortDividerPanelFields(
    withInferredGroups(fields).filter((f) => !isColorSchemeField(f) && inferredDividerGroup(f))
  );
}

export function groupDividerPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const label of DIVIDER_PANEL_GROUP_ORDER) map.set(label, []);
  for (const field of filterDividerPanelFields(fields)) {
    const group = inferredDividerGroup(field) ?? 'General';
    map.get(group)?.push(field);
  }
  return map;
}

export function isDividerSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('thickness') &&
    keys.has('length') &&
    (keys.has('sectionWidth') ||
      keys.has('backgroundColor') ||
      keys.has('color') ||
      keys.has('colorScheme'))
  );
}

function settingsPrefixFromNodeId(nodeId: string): { instanceId: string; templateId?: string } | null {
  const layout = nodeId.match(/^layout:(divider(?:_\d+)?)$/);
  if (layout) return { instanceId: layout[1] };
  const tpl = nodeId.match(/^template:([^:]+):(divider(?:_\d+)?)$/);
  if (tpl) return { templateId: tpl[1], instanceId: tpl[2] };
  return null;
}

export function collectDividerPanelFieldDefs(instanceId: string, templateId?: string): EditorFieldDef[] {
  return filterDividerPanelFields(remapDividerDefaultFields(instanceId, templateId));
}

/** Resolve divider panel fields from tree, catalog, schema, or hardcoded defaults. */
export function resolveDividerSectionPanelFields(
  sectionNodeId: string,
  editorSchema?: EditorSchemaDoc | null,
  existingFields?: EditorFieldDef[]
): EditorFieldDef[] {
  const parsed = settingsPrefixFromNodeId(sectionNodeId);
  const instanceId = parsed?.instanceId ?? 'divider';
  const templateId = parsed?.templateId;

  let panel = filterDividerPanelFields(existingFields ?? []);
  if (panel.length) return panel;

  const catalog = resolveEditingPanelForNode(sectionNodeId);
  if (catalog?.fields.length) {
    panel = filterDividerPanelFields(catalog.fields);
    if (panel.length) return panel;
  }

  if (editorSchema) {
    const blueprint = layoutBlueprintKey(instanceId);
    if (templateId) {
      const template = editorSchema.templates?.find((t) => t.id === templateId);
      const sec = template?.sections?.find((s) => (s.id ?? '') === blueprint);
      if (sec?.settingsFields?.length) {
        panel = filterDividerPanelFields(
          sec.settingsFields.map((field) => ({
            ...field,
            path: field.path.replace(
              new RegExp(`sections\\.${blueprint}\\.settings`),
              `templates.${templateId}.sections.${instanceId}.settings`
            ),
          }))
        );
        if (panel.length) return panel;
      }
    } else {
      const sec = editorSchema.layout?.[blueprint];
      if (sec?.settingsFields?.length) {
        panel = filterDividerPanelFields(
          sec.settingsFields.map((field) => ({
            ...field,
            path: field.path.replace(
              new RegExp(`sections\\.${blueprint}\\.settings`),
              `sections.${instanceId}.settings`
            ),
          }))
        );
        if (panel.length) return panel;
      }
    }
  }

  return collectDividerPanelFieldDefs(instanceId, templateId);
}

export function prepareDividerSettingsNode(node: SidebarNode): SidebarNode {
  const fields = resolveDividerSectionPanelFields(node.id, null, node.fields);
  return { ...node, label: 'Divider', kind: 'section', fields };
}

function findSidebarNodeById(nodes: SidebarNode[], id: string): SidebarNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findSidebarNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

export function findDividerSectionInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isDividerSectionNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const layout = nodeId.match(/^layout:(divider(?:_\d+)?)/);
  if (layout) return findSidebarNodeById(tree, `layout:${layout[1]}`);
  const tpl = nodeId.match(/^template:([^:]+):(divider(?:_\d+)?)/);
  if (tpl) return findSidebarNodeById(tree, `template:${tpl[1]}:${tpl[2]}`);
  return null;
}
