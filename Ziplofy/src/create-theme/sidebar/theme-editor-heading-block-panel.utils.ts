import {
  layoutBlueprintKey,
  remapTemplateHeroSchemaPath,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';
import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

export const HEADING_PANEL_GROUPS = new Set(['Text', 'Layout', 'Typography', 'Appearance', 'Padding']);

/** Setting keys shown in the Shopify-style heading block panel (section- or block-scoped). */
export const HEADING_PANEL_SETTING_KEYS = new Set([
  'title',
  'heading',
  'text',
  'headingWidth',
  'headingMaxWidth',
  'headingAlignment',
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
  'headingCornerRadius',
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
    headingAlignment: 3,
    headingTypographyPreset: 10,
    headingFont: 11,
    headingFontSize: 12,
    headingLineHeight: 13,
    headingLetterSpacing: 14,
    headingTextCase: 15,
    headingWrap: 16,
    headingColor: 17,
    headingBackgroundEnabled: 20,
    headingBackgroundColor: 21,
    headingCornerRadius: 22,
    headingPaddingTop: 30,
    headingPaddingBottom: 31,
    headingPaddingLeft: 32,
    headingPaddingRight: 33,
  };
  return rank[key] ?? 50;
}

const HEADING_SECTION_STYLE_KEYS = new Set([
  'headingWidth',
  'headingMaxWidth',
  'headingAlignment',
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
  'headingCornerRadius',
  'headingPaddingTop',
  'headingPaddingBottom',
  'headingPaddingLeft',
  'headingPaddingRight',
]);

function assignHeadingPanelGroup(key: string): string | undefined {
  if (key === 'title' || key === 'heading' || key === 'text') return 'Text';
  if (key === 'headingWidth' || key === 'headingMaxWidth' || key === 'headingAlignment') {
    return 'Layout';
  }
  if (
    key === 'headingTypographyPreset' ||
    key === 'headingFont' ||
    key === 'headingFontSize' ||
    key === 'headingLineHeight' ||
    key === 'headingLetterSpacing' ||
    key === 'headingTextCase' ||
    key === 'headingWrap' ||
    key === 'headingColor'
  ) {
    return 'Typography';
  }
  if (
    key === 'headingBackgroundEnabled' ||
    key === 'headingBackgroundColor' ||
    key === 'headingCornerRadius'
  ) {
    return 'Appearance';
  }
  if (key.startsWith('headingPadding')) return 'Padding';
  return undefined;
}

export function isHeadingPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!HEADING_PANEL_SETTING_KEYS.has(key)) return false;
  if (field.group && !HEADING_PANEL_GROUPS.has(field.group)) return false;
  return /\.settings\./.test(field.path);
}

function withHeadingPanelGroup(field: EditorFieldDef): EditorFieldDef | null {
  const key = field.path.split('.').pop() ?? '';
  const group = field.group ?? assignHeadingPanelGroup(key);
  if (!group || !HEADING_PANEL_GROUPS.has(group)) return null;
  return { ...field, group };
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
  const fields = sortHeadingPanelFields(
    (node.fields ?? [])
      .filter(isHeadingPanelField)
      .map(withHeadingPanelGroup)
      .filter((f): f is EditorFieldDef => f != null)
  );
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
    const normalized = withHeadingPanelGroup(field);
    if (!normalized) continue;
    const group = normalized.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(normalized);
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
  parsed: ParsedHeadingBlockNode
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
    if (key === 'title' || key === 'heading') {
      path = `${blocksBase}.${blockId}.settings.heading`;
    }
    return { ...field, path };
  });
}

/** Text lives on the block; layout/typography/padding live on the parent section settings. */
function normalizeHeadingBlockFieldPaths(
  fields: EditorFieldDef[],
  parsed: ParsedHeadingBlockNode
): EditorFieldDef[] {
  const settingsBase = settingsBaseForParsed(parsed);
  const blocksBase = blocksBaseForParsed(parsed);
  const blockId = parsed.blockInstanceId;

  return fields.map((field) => {
    const key = field.path.split('.').pop() ?? '';
    let path = field.path;

    if (key === 'title' || key === 'heading') {
      // Schema + applyValues use section `title`; runtime also reads `blocks.*.settings.heading`.
      path =
        blockId === 'heading'
          ? `${settingsBase}.title`
          : `${blocksBase}.${blockId}.settings.heading`;
    } else if (HEADING_SECTION_STYLE_KEYS.has(key)) {
      path = `${settingsBase}.${key}`;
    }

    const group = field.group ?? assignHeadingPanelGroup(key);
    const label =
      key === 'title' && field.label === 'Title' ? 'Text' : field.label;
    return { ...field, path, group, label };
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

function syncHeadingTextPathsInValues(
  next: Record<string, string | boolean>,
  sectionPrefix: string,
  raw: string | boolean
): void {
  next[`${sectionPrefix}.settings.title`] = raw;
  for (const key of Object.keys(next)) {
    if (key.startsWith(`${sectionPrefix}.blocks.`) && key.endsWith('.settings.heading')) {
      next[key] = raw;
    }
  }
  const canonical = `${sectionPrefix}.blocks.heading.settings.heading`;
  if (next[canonical] === undefined) {
    next[canonical] = raw;
  }
}

/** Mirror hero heading copy between section `title` and block `settings.heading` in sidebar values. */
export function mirrorHeadingTextInValues(
  values: Record<string, string | boolean>,
  path: string,
  raw: string | boolean
): Record<string, string | boolean> {
  const next = { ...values, [path]: raw };
  const block = path.match(/^(.+)\.blocks\.([^.]+)\.settings\.heading$/);
  if (block) {
    syncHeadingTextPathsInValues(next, block[1]!, raw);
    return next;
  }
  const title = path.match(/^(.+)\.settings\.title$/);
  if (title) {
    syncHeadingTextPathsInValues(next, title[1]!, raw);
  }
  return next;
}

export function headingBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const parsed = parseHeadingBlockNodeId(nodeId);
  if (!parsed) return [];

  const fromSection = headingBlockFromSectionSchema(editorSchema, parsed);
  if (fromSection.length) {
    return normalizeHeadingBlockFieldPaths(remapFieldsForNode(fromSection, parsed), parsed);
  }

  const canon = canonicalHeadingFieldsFromSchema(editorSchema);
  if (!canon.length) return [];

  const remapped = remapCanonicalHeadingFields(canon, parsed);
  return normalizeHeadingBlockFieldPaths(remapFieldsForNode(remapped, parsed), parsed);
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

export const HEADING_CUSTOM_TYPOGRAPHY_KEYS = [
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
] as const;

export const HEADING_FONT_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
] as const;

export const HEADING_FONT_SIZE_OPTIONS = [
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
].map((value) => ({ value, label: value }));

const TIGHT_NORMAL_LOOSE = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'loose', label: 'Loose' },
] as const;

export const HEADING_LINE_HEIGHT_OPTIONS = [...TIGHT_NORMAL_LOOSE];
export const HEADING_LETTER_SPACING_OPTIONS = [...TIGHT_NORMAL_LOOSE];

export const HEADING_TEXT_CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'Uppercase' },
] as const;

export const HEADING_WRAP_OPTIONS = [
  { value: 'pretty', label: 'Pretty' },
  { value: 'balance', label: 'Balance' },
  { value: 'nowrap', label: 'No wrap' },
] as const;

type HeadingTypographyFieldKey =
  | (typeof HEADING_CUSTOM_TYPOGRAPHY_KEYS)[number]
  | 'headingColor';

const HEADING_TYPO_FIELD_FALLBACKS: Record<
  HeadingTypographyFieldKey,
  Omit<EditorFieldDef, 'path'>
> = {
  headingFont: {
    type: 'select',
    label: 'Font',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_FONT_OPTIONS],
  },
  headingFontSize: {
    type: 'select',
    label: 'Size',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_FONT_SIZE_OPTIONS],
  },
  headingLineHeight: {
    type: 'select',
    label: 'Line height',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_LINE_HEIGHT_OPTIONS],
  },
  headingLetterSpacing: {
    type: 'select',
    label: 'Letter spacing',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_LETTER_SPACING_OPTIONS],
  },
  headingTextCase: {
    type: 'select',
    label: 'Case',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_TEXT_CASE_OPTIONS],
  },
  headingWrap: {
    type: 'select',
    label: 'Wrap',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_WRAP_OPTIONS],
  },
  headingColor: {
    type: 'select',
    label: 'Color',
    group: 'Typography',
    widget: 'select',
    options: [
      { value: 'text', label: 'Text' },
      { value: 'heading', label: 'Heading' },
      { value: 'link', label: 'Link' },
    ],
  },
};

/** Resolve a typography field from schema defs or build a fallback for the section settings base path. */
export function resolveHeadingTypographyField(
  key: HeadingTypographyFieldKey,
  settingsBase: string,
  fields: EditorFieldDef[]
): EditorFieldDef {
  const fromSchema = fields.find((f) => f.path.endsWith(key));
  if (fromSchema) return fromSchema;
  const fallback = HEADING_TYPO_FIELD_FALLBACKS[key];
  return { ...fallback, path: `${settingsBase}.${key}` };
}
