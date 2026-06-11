import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { collectionListSidebarPathsFromNodeId } from '../utils/collection-list-sidebar.util';
import {
  isTextBlockPanelField,
  sortTextBlockPanelFields,
  textBlockDefaultSettings,
  textBlockFieldDefs,
} from './theme-editor-text-block-panel.utils';

export {
  groupTextBlockPanelFields,
  isTextBlockPanelFields,
  TEXT_BLOCK_PANEL_GROUP_ORDER,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
} from './theme-editor-text-block-panel.utils';

export function isCollectionListHeaderTextNestedNodeId(nodeId: string): boolean {
  return /:block:section_header:nested:heading_text$/.test(nodeId);
}

export function collectionListHeaderTextBlocksBase(settingsBase: string): string {
  return `${settingsBase}.headingText`;
}

export function collectionListHeaderTextFieldDefs(settingsBase: string): EditorFieldDef[] {
  return textBlockFieldDefs(collectionListHeaderTextBlocksBase(settingsBase));
}

export function collectionListHeaderTextFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  return paths ? collectionListHeaderTextFieldDefs(paths.settingsBase) : [];
}

export function collectionListHeaderTextDefaultSettings(
  text = 'Shop by collection'
): Record<string, string | number | boolean> {
  return {
    ...textBlockDefaultSettings(text),
    width: 'fit',
    maxWidth: 'normal',
    paddingBottom: 16,
  };
}

export const COLLECTION_LIST_HEADER_TEXT_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(collectionListHeaderTextDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function isCollectionListHeaderTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every((f) => /\.settings\.headingText\.settings\./.test(f.path));
}

export function prepareCollectionListHeaderTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortTextBlockPanelFields((node.fields ?? []).filter(isTextBlockPanelField));
  return { ...node, label: 'Text', kind: 'block', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendCollectionListHeaderTextBlockValues(
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
    const fallback = COLLECTION_LIST_HEADER_TEXT_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }

  const settingsBase = fields[0]?.path.match(/^(.+)\.headingText\.settings\./)?.[1];
  if (settingsBase) {
    const headingPath = `${settingsBase}.heading`;
    const textPath = `${settingsBase}.headingText.settings.text`;
    if (next[textPath] === undefined && next[headingPath] !== undefined) {
      next[textPath] = String(next[headingPath]);
    }
    if (next[headingPath] === undefined && next[textPath] !== undefined) {
      next[headingPath] = String(next[textPath]);
    }
  }

  return next;
}

/** Keep section `heading` and nested `headingText.settings.text` in sync. */
export function mirrorCollectionListHeadingTextInValues(
  values: Record<string, string | boolean>,
  path: string,
  raw: string | boolean
): Record<string, string | boolean> {
  const next = { ...values, [path]: raw };
  const heading = path.match(/^(.+)\.settings\.heading$/);
  if (heading) {
    next[`${heading[1]}.headingText.settings.text`] = String(raw);
    return next;
  }
  const text = path.match(/^(.+)\.settings\.headingText\.settings\.text$/);
  if (text) {
    next[`${text[1]}.settings.heading`] = String(raw);
  }
  return next;
}
