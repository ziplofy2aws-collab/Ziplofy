import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  featuredProductHeaderCustomSizeFieldDefs,
  featuredProductHeaderDefaultSettings,
  featuredProductHeaderFieldDefs,
} from './theme-editor-featured-product-header-block-panel.utils';
import { collectionListSidebarPathsFromNodeId } from '../utils/collection-list-sidebar.util';

const HEADER_GROUP_KEYS = new Set([
  'direction',
  'alignment',
  'position',
  'layoutGap',
  'width',
  'customWidth',
  'mobileWidth',
  'mobileCustomWidth',
  'height',
  'customHeight',
  'inheritColorScheme',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'cornerRadius',
  'backgroundOverlay',
  'linkUrl',
  'openLinkInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

export function isCollectionListSectionHeaderBlockNodeId(nodeId: string): boolean {
  return /:block:section_header$/.test(nodeId);
}

function remapHeaderFieldPaths(fields: EditorFieldDef[], settingsBase: string): EditorFieldDef[] {
  const groupBase = `${settingsBase}.headerGroup`;
  return fields.map((field) => {
    const key = field.path.split('.').pop() ?? '';
    return { ...field, path: `${groupBase}.${key}` };
  });
}

export function collectionListHeaderFieldDefs(settingsBase: string): EditorFieldDef[] {
  const templateDefs = featuredProductHeaderFieldDefs('templates.index.sections.placeholder.blocks.details.blocks.header');
  return remapHeaderFieldPaths(templateDefs, settingsBase);
}

export function collectionListHeaderCustomSizeFieldDefs(settingsBase: string): EditorFieldDef[] {
  const templateDefs = featuredProductHeaderCustomSizeFieldDefs(
    'templates.index.sections.placeholder.blocks.details.blocks.header'
  );
  return remapHeaderFieldPaths(templateDefs, settingsBase);
}

export function isCollectionListSectionHeaderPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every((f) => {
    const key = f.path.split('.').pop() ?? '';
    return HEADER_GROUP_KEYS.has(key) && /\.settings\.headerGroup\./.test(f.path);
  });
}

export function prepareCollectionListSectionHeaderSettingsNode(node: SidebarNode): SidebarNode {
  const paths = collectionListSidebarPathsFromNodeId(node.id);
  const settingsBase = paths?.settingsBase;
  const built = settingsBase
    ? [
        ...collectionListHeaderFieldDefs(settingsBase),
        ...collectionListHeaderCustomSizeFieldDefs(settingsBase),
      ]
    : [];
  const fromNode = (node.fields ?? []).filter((f) => /\.settings\.headerGroup\./.test(f.path));
  const byKey = new Map<string, EditorFieldDef>();
  for (const field of [...fromNode, ...built]) {
    byKey.set(field.path.split('.').pop() ?? field.path, field);
  }
  const fields = built.length ? built : [...byKey.values()];
  return { ...node, label: 'Header', kind: 'block', fields };
}

export const COLLECTION_LIST_HEADER_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(featuredProductHeaderDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function extendCollectionListHeaderBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    let cur: unknown = config;
    for (const seg of field.path.split('.')) {
      if (cur == null || typeof cur !== 'object') {
        cur = undefined;
        break;
      }
      cur = (cur as Record<string, unknown>)[seg];
    }
    if (cur !== undefined && cur !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(cur) : String(cur);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = COLLECTION_LIST_HEADER_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
