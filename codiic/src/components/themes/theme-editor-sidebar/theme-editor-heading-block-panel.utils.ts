import {
  layoutBlueprintKey,
  remapTemplateHeroSchemaPath,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from '../../../utils/theme-editor-insert-section';
import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';

export const HEADING_PANEL_GROUPS = new Set(['Text', 'Layout', 'Typography', 'Appearance', 'Padding']);

/** Setting keys shown in the Shopify-style heading block panel (section- or block-scoped). */
export const HEADING_PANEL_SETTING_KEYS = new Set([
  'title',
  'heading',
  'text',
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

const CANON_HEADING_TEMPLATE_ID = 'index';
const CANON_HEADING_SECTION_ID = 'hero_main';
const CANON_HEADING_BLOCK_ID = 'heading';

export type ParsedHeadingBlockNode = {
  placement: 'layout' | 'template';
  templateId: string | null;
  sectionInstanceId: string;
  blockInstanceId: string;
};

export function parseHeadingBlockNodeId(nodeId: string): ParsedHeadingBlockNode | null {
  const layout = nodeId.match(/^layout:(.+):block:(heading(?:_\d+)?)$/);
  if (layout) {
    return {
      placement: 'layout',
      templateId: null,
      sectionInstanceId: layout[1]!,
      blockInstanceId: layout[2]!,
    };
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(heading(?:_\d+)?)$/);
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

export function isHeadingBlockNodeId(nodeId: string): boolean {
  return parseHeadingBlockNodeId(nodeId) !== null;
}

/** @deprecated Use {@link isHeadingBlockNodeId} */
export function isHeroHeadingBlockNodeId(nodeId: string): boolean {
  return isHeadingBlockNodeId(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    title: 0,
    heading: 0,
    text: 0,
    headingWidth: 1,
    headingMaxWidth: 2,
    headingTypographyPreset: 10,
    headingColor: 11,
    headingBackgroundEnabled: 20,
    headingPaddingTop: 30,
    headingPaddingBottom: 31,
    headingPaddingLeft: 32,
    headingPaddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isHeadingPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!HEADING_PANEL_SETTING_KEYS.has(key)) return false;
  if (!field.group || !HEADING_PANEL_GROUPS.has(field.group)) return false;
  return /\.settings\./.test(field.path);
}

/** @deprecated Use {@link isHeadingPanelField} */
export function isHeroHeadingPanelField(field: EditorFieldDef): boolean {
  return isHeadingPanelField(field);
}

export function sortHeadingPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Text: 0,
    Layout: 1,
    Typography: 2,
    Appearance: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

/** @deprecated Use {@link sortHeadingPanelFields} */
export function sortHeroHeadingPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return sortHeadingPanelFields(fields);
}

export function prepareHeadingBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortHeadingPanelFields((node.fields ?? []).filter(isHeadingPanelField));
  return { ...node, label: 'Heading', kind: 'block', fields };
}

/** @deprecated Use {@link prepareHeadingBlockSettingsNode} */
export function prepareHeroHeadingSettingsNode(node: SidebarNode): SidebarNode {
  return prepareHeadingBlockSettingsNode(node);
}

export function isHeadingBlockPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    (keys.has('title') || keys.has('heading') || keys.has('text')) &&
    (keys.has('headingWidth') || keys.has('headingMaxWidth') || keys.has('headingTypographyPreset'))
  );
}

export const HEADING_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

export function groupHeadingPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isHeadingPanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortHeadingPanelFields(list));
  }
  return map;
}

function canonicalHeadingFieldsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === CANON_HEADING_TEMPLATE_ID);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === CANON_HEADING_SECTION_ID);
  const heading = sec?.blocks?.find((b) => (b.id ?? '') === CANON_HEADING_BLOCK_ID);
  return heading?.settingsFields ?? [];
}

function headingBlockFromSectionSchema(
  editorSchema: EditorSchemaDoc,
  parsed: ParsedHeadingBlockNode
): EditorFieldDef[] {
  if (parsed.placement === 'layout') {
    const blueprint = layoutBlueprintKey(parsed.sectionInstanceId);
    const sec = editorSchema.layout?.[blueprint];
    const heading = sec?.blocks?.find((b) => (b.id ?? '') === 'heading');
    return heading?.settingsFields ?? [];
  }
  const blueprint = templateBlueprintKey(parsed.sectionInstanceId);
  const tpl = editorSchema.templates?.find((t) => t.id === parsed.templateId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const heading =
    sec?.blocks?.find((b) => (b.id ?? '') === 'heading') ??
    sec?.blocks?.find((b) => (b.id ?? '').startsWith('heading'));
  return heading?.settingsFields ?? [];
}

function settingsBaseForParsed(parsed: ParsedHeadingBlockNode): string {
  if (parsed.placement === 'layout') {
    return `sections.${parsed.sectionInstanceId}.settings`;
  }
  return `templates.${parsed.templateId}.sections.${parsed.sectionInstanceId}.settings`;
}

function blocksBaseForParsed(parsed: ParsedHeadingBlockNode): string {
  if (parsed.placement === 'layout') {
    return `sections.${parsed.sectionInstanceId}.blocks`;
  }
  return `templates.${parsed.templateId}.sections.${parsed.sectionInstanceId}.blocks`;
}

/** Remap canonical hero heading panel fields onto the selected heading block's section/block paths. */
function remapCanonicalHeadingFields(
  canonFields: EditorFieldDef[],
  parsed: ParsedHeadingBlockNode,
  preferBlockText: boolean
): EditorFieldDef[] {
  const canonPrefix = `templates.${CANON_HEADING_TEMPLATE_ID}.sections.${CANON_HEADING_SECTION_ID}`;
  const settingsBase = settingsBaseForParsed(parsed);
  const blocksBase = blocksBaseForParsed(parsed);
  const blockId = parsed.blockInstanceId;

  return canonFields.map((field) => {
    let path = field.path;
    if (path.startsWith(canonPrefix)) {
      path = `${settingsBase}${path.slice(canonPrefix.length)}`;
    }
    const key = path.split('.').pop() ?? '';
    if (preferBlockText && (key === 'title' || key === 'heading')) {
      path = `${blocksBase}.${blockId}.settings.heading`;
    }
    return { ...field, path };
  });
}

function remapFieldsForNode(
  fields: EditorFieldDef[],
  parsed: ParsedHeadingBlockNode
): EditorFieldDef[] {
  const blockId = parsed.blockInstanceId;
  let remapped = fields.map((field) => {
    let path = field.path;
    if (parsed.blockInstanceId !== 'heading' && path.includes('.blocks.heading.')) {
      path = path.replace(/\.blocks\.heading\./, `.blocks.${blockId}.`);
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

export function headingBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const parsed = parseHeadingBlockNodeId(nodeId);
  if (!parsed) return [];

  const fromSection = headingBlockFromSectionSchema(editorSchema, parsed);
  if (fromSection.length) {
    const hasSectionTitle = fromSection.some((f) => f.path.endsWith('.settings.title'));
    return remapFieldsForNode(fromSection, parsed);
  }

  const canon = canonicalHeadingFieldsFromSchema(editorSchema);
  if (!canon.length) return [];

  const remapped = remapCanonicalHeadingFields(canon, parsed, false);
  return remapFieldsForNode(remapped, parsed);
}

/** @deprecated Use {@link headingBlockFieldDefsFromSchema} */
export function heroHeadingFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  layoutInstanceId?: string | null
): EditorFieldDef[] {
  if (layoutInstanceId) {
    return headingBlockFieldDefsFromSchema(
      editorSchema,
      `layout:${layoutInstanceId}:block:heading`
    );
  }
  return headingBlockFieldDefsFromSchema(editorSchema, `template:index:hero_main:block:heading`);
}
