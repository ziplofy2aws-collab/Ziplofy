import {
  layoutBlueprintKey,
  remapTemplateHeroSchemaPath,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from '../../../utils/theme-editor-insert-section';
import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';

export const HERO_BUTTON_PANEL_GROUPS = new Set(['Content', 'Appearance', 'Size']);

export const HERO_BUTTON_PANEL_GROUP_ORDER = ['Content', 'Appearance', 'Size'] as const;

const BUTTON_PANEL_KEYS = new Set([
  'label',
  'href',
  'openInNewTab',
  'buttonStyle',
  'desktopWidth',
  'mobileWidth',
]);

const CANON_BUTTON_TEMPLATE_ID = 'index';
const CANON_BUTTON_SECTION_ID = 'hero_main';
const CANON_BUTTON_BLOCK_ID = 'primary_button';

const HERO_BUTTON_BLOCK_ID_RE = /^(?:primary_button|secondary_button|button_\d+)$/;

export type ParsedHeroButtonBlockNode = {
  placement: 'layout' | 'template';
  templateId: string | null;
  sectionInstanceId: string;
  blockInstanceId: string;
};

export function parseHeroButtonBlockNodeId(nodeId: string): ParsedHeroButtonBlockNode | null {
  const layout = nodeId.match(/^layout:(.+):block:(primary_button|secondary_button|button_\d+)$/);
  if (layout) {
    return {
      placement: 'layout',
      templateId: null,
      sectionInstanceId: layout[1]!,
      blockInstanceId: layout[2]!,
    };
  }
  const tpl = nodeId.match(
    /^template:([^:]+):([^:]+):block:(primary_button|secondary_button|button_\d+)$/
  );
  if (tpl) {
    return {
      placement: 'template',
      templateId: tpl[1]!,
      sectionInstanceId: tpl[2]!,
      blockInstanceId: tpl[3]!,
    };
  }
  return null;
}

export function isHeroButtonBlockNodeId(nodeId: string): boolean {
  return parseHeroButtonBlockNodeId(nodeId) !== null;
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    label: 0,
    href: 1,
    openInNewTab: 2,
    buttonStyle: 10,
    desktopWidth: 11,
    mobileWidth: 12,
  };
  return rank[key] ?? 50;
}

export function isHeroButtonPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!BUTTON_PANEL_KEYS.has(key)) return false;
  if (!field.group || !HERO_BUTTON_PANEL_GROUPS.has(field.group)) return false;
  if (!/\.blocks\.(?:primary_button|secondary_button|button_\d+)\.settings\./.test(field.path)) {
    return false;
  }
  return /\.sections\.[^.]+\./.test(field.path);
}

export function sortHeroButtonPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { Content: 0, Appearance: 1, Size: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareHeroButtonSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortHeroButtonPanelFields((node.fields ?? []).filter(isHeroButtonPanelField));
  return { ...node, label: 'Button', kind: 'block', fields };
}

export function isHeroButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('label') && keys.has('href') && (keys.has('buttonStyle') || keys.has('desktopWidth'));
}

export function groupHeroButtonPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isHeroButtonPanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortHeroButtonPanelFields(list));
  }
  return map;
}

export function pickHeroButtonPanelField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function canonicalButtonFieldsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === CANON_BUTTON_TEMPLATE_ID);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === CANON_BUTTON_SECTION_ID);
  const block =
    sec?.blocks?.find((b) => (b.id ?? '') === CANON_BUTTON_BLOCK_ID) ??
    sec?.blocks?.find((b) => HERO_BUTTON_BLOCK_ID_RE.test(b.id ?? ''));
  return block?.settingsFields ?? [];
}

function buttonBlockFromSectionSchema(
  editorSchema: EditorSchemaDoc,
  parsed: ParsedHeroButtonBlockNode
): EditorFieldDef[] {
  if (parsed.placement === 'layout') {
    const blueprint = layoutBlueprintKey(parsed.sectionInstanceId);
    const sec = editorSchema.layout?.[blueprint];
    const block =
      sec?.blocks?.find((b) => (b.id ?? '') === parsed.blockInstanceId) ??
      sec?.blocks?.find((b) => HERO_BUTTON_BLOCK_ID_RE.test(b.id ?? ''));
    return block?.settingsFields ?? [];
  }
  const blueprint = templateBlueprintKey(parsed.sectionInstanceId);
  const tpl = editorSchema.templates?.find((t) => t.id === parsed.templateId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const block =
    sec?.blocks?.find((b) => (b.id ?? '') === parsed.blockInstanceId) ??
    sec?.blocks?.find((b) => (b.id ?? '') === 'primary_button') ??
    sec?.blocks?.find((b) => HERO_BUTTON_BLOCK_ID_RE.test(b.id ?? ''));
  return block?.settingsFields ?? [];
}

function remapFieldsForNode(
  fields: EditorFieldDef[],
  parsed: ParsedHeroButtonBlockNode
): EditorFieldDef[] {
  const blockId = parsed.blockInstanceId;
  let remapped = fields.map((field) => {
    let path = field.path;
    const sourceBlockMatch = path.match(/\.blocks\.([^.]+)\./);
    const sourceBlockId = sourceBlockMatch?.[1];
    if (sourceBlockId && sourceBlockId !== blockId) {
      path = path.replace(`.blocks.${sourceBlockId}.`, `.blocks.${blockId}.`);
    }
    return { ...field, path };
  });

  if (parsed.placement === 'layout') {
    const layoutInstanceId = parsed.sectionInstanceId;
    if (layoutInstanceId.startsWith('hero_main')) {
      remapped = remapped.map((f) => ({
        ...f,
        path: remapTemplateHeroSchemaPath(f.path, layoutInstanceId),
      }));
    } else {
      remapped = remapped.map((f) => ({
        ...f,
        path: f.path.replace(/\.sections\.[^.]+\./, `.sections.${layoutInstanceId}.`),
      }));
    }
    return remapped;
  }

  const tplId = parsed.templateId ?? 'index';
  const secBlueprint = templateBlueprintKey(parsed.sectionInstanceId);
  if (secBlueprint !== parsed.sectionInstanceId) {
    remapped = remapped.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, parsed.sectionInstanceId),
    }));
  }
  return remapped;
}

export function heroButtonFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const parsed = parseHeroButtonBlockNodeId(nodeId);
  if (!parsed) return [];

  const fromSection = buttonBlockFromSectionSchema(editorSchema, parsed);
  if (fromSection.length) {
    return remapFieldsForNode(fromSection, parsed);
  }

  const canon = canonicalButtonFieldsFromSchema(editorSchema);
  if (!canon.length) return [];

  return remapFieldsForNode(canon, parsed);
}
