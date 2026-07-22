import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateHeroSchemaPath } from '../../utils/theme-editor-insert-section';
import {
  isTextBlockPanelField,
  sortTextBlockPanelFields,
  textBlockDefaultSettings,
  textBlockFieldDefs,
} from './theme-editor-text-block-panel.utils';

export function isHeroTextBlockNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:hero_main(?:_\d+)?:block:text(?:_\d+)?$/.test(nodeId) ||
    /^layout:hero_main(?:_\d+)?:block:text(?:_\d+)?$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(/^template:([^:]+):(hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/);
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.${template[3]}`;
  }
  const layout = nodeId.match(/^layout:(hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/);
  if (layout) {
    return `sections.${layout[1]}.blocks.${layout[2]}`;
  }
  return null;
}

export function heroLargeLogoTextDefaultSettings(text: string): Record<string, string | number | boolean> {
  return {
    ...textBlockDefaultSettings(text),
    width: 'fit',
    maxWidth: 'narrow',
    alignment: 'left',
  };
}

export function heroTextBlockFieldDefs(blocksBase: string): EditorFieldDef[] {
  // Large logo's Text block exposes only Width + Max width in Layout (no Alignment).
  return textBlockFieldDefs(blocksBase).filter((f) => !f.path.endsWith('.alignment'));
}

export function heroTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  let fields = heroTextBlockFieldDefs(base);
  const layout = nodeId.match(/^layout:(hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/);
  if (layout) {
    fields = fields.map((f) => ({
      ...f,
      path: remapTemplateHeroSchemaPath(f.path, layout[1]!),
    }));
  }
  return fields;
}

export function heroTextBlockFieldDefsFromNode(
  nodeId: string,
  sectionPrefix: string,
  blockId: string
): EditorFieldDef[] {
  const layoutMatch = sectionPrefix.match(/^layout:(hero_main(?:_\d+)?)$/);
  const templateMatch = sectionPrefix.match(/^template:([^:]+):(hero_main(?:_\d+)?)$/);
  const blocksBase = layoutMatch
    ? `sections.${layoutMatch[1]}.blocks.${blockId}`
    : templateMatch
      ? `templates.${templateMatch[1]}.sections.${templateMatch[2]}.blocks.${blockId}`
      : blocksBaseFromNodeId(nodeId);
  if (!blocksBase) return [];
  let fields = heroTextBlockFieldDefs(blocksBase);
  if (layoutMatch) {
    fields = fields.map((f) => ({
      ...f,
      path: remapTemplateHeroSchemaPath(f.path, layoutMatch[1]!),
    }));
  }
  return fields;
}

export function prepareHeroTextBlockSettingsNode(node: SidebarNode): SidebarNode {
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

/** Seed sidebar `values` for hero text block panel fields from merged config. */
export function extendValuesForHeroTextBlock(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = heroTextBlockFieldDefsFromNodeId(nodeId);
  if (!defs.length) {
    const match = nodeId.match(
      /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/
    );
    if (!match) return values;
    const fields = heroTextBlockFieldDefsFromNode(nodeId, match[1]!, match[2]!);
    return seedTextBlockValues(values, fields, config);
  }
  return seedTextBlockValues(values, defs, config);
}

function heroMarqueeSettingsBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(
    /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):(?:group:(?:marquee:text|spacer:spacer)|marquee(?::.*)?)$/
  );
  if (!m) return null;
  const prefix = m[1]!;
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}.settings`;
  const tpl = prefix.match(/^template:([^:]+):(.+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}.settings`;
  return `${prefix}.settings`;
}

/** Seed sidebar `values` for Hero: Marquee Spacer/Text virtual block fields from config. */
export function extendValuesForHeroMarquee(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const settingsBase = heroMarqueeSettingsBaseFromNodeId(nodeId);
  if (!settingsBase) return values;
  const defs: EditorFieldDef[] = [
    ...textBlockFieldDefs(`${settingsBase}.marqueeTextBlock`).filter(
      (f) => !f.path.endsWith('.alignment')
    ),
    { path: `${settingsBase}.marqueeSpacerUnit`, type: 'select', label: 'Unit' },
    { path: `${settingsBase}.marqueeSpacerHeight`, type: 'number', label: 'Size' },
    { path: `${settingsBase}.marqueeSpacerCustomMobile`, type: 'boolean', label: 'Custom mobile size' },
    { path: `${settingsBase}.marqueeSpacerMobileHeight`, type: 'number', label: 'Mobile size' },
    { path: `${settingsBase}.marqueeMotionDirection`, type: 'select', label: 'Motion direction' },
    { path: `${settingsBase}.marqueeBackgroundColor`, type: 'color', label: 'Background color' },
    { path: `${settingsBase}.marqueeTransparentBg`, type: 'boolean', label: 'Transparent background' },
    { path: `${settingsBase}.marqueePaddingTop`, type: 'number', label: 'Top' },
    { path: `${settingsBase}.marqueePaddingBottom`, type: 'number', label: 'Bottom' },
    { path: `${settingsBase}.marqueeGap`, type: 'number', label: 'Gap' },
  ];
  return seedTextBlockValues(values, defs, config);
}

/** Settings base for a Hero: Bottom aligned "Group" block node (content_group / heading_group). */
function heroBottomGroupSettingsBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(
    /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:content_group(:nested:heading_group)?$/
  );
  if (!m) return null;
  const prefix = m[1]!;
  const nested = Boolean(m[2]);
  const layout = prefix.match(/^layout:(.+)$/);
  const blocksBase = layout
    ? `sections.${layout[1]}.blocks`
    : (() => {
        const tpl = prefix.match(/^template:([^:]+):(.+)$/);
        return tpl ? `templates.${tpl[1]}.sections.${tpl[2]}.blocks` : null;
      })();
  if (!blocksBase) return null;
  return nested
    ? `${blocksBase}.content_group.blocks.heading_group.settings`
    : `${blocksBase}.content_group.settings`;
}

export function isHeroBottomGroupNodeId(nodeId: string): boolean {
  return heroBottomGroupSettingsBaseFromNodeId(nodeId) != null;
}

const HERO_GROUP_BLOCK_BOOLEAN_KEYS = new Set([
  'verticalOnMobile',
  'alignTextBaseline',
  'backgroundOverlay',
  'linkOpenInNewTab',
]);

const HERO_GROUP_BLOCK_NUMBER_KEYS = new Set([
  'layoutGap',
  'customWidth',
  'mobileCustomWidth',
  'customHeight',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const HERO_GROUP_BLOCK_KEYS = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'alignTextBaseline',
  'layoutGap',
  'width',
  'customWidth',
  'mobileWidth',
  'mobileCustomWidth',
  'height',
  'customHeight',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundColor',
  'backgroundOverlay',
  'borderStyle',
  'cornerRadius',
  'link',
  'linkOpenInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
];

function heroBottomGroupSeedFieldType(key: string): EditorFieldDef['type'] {
  if (HERO_GROUP_BLOCK_BOOLEAN_KEYS.has(key)) return 'boolean';
  if (HERO_GROUP_BLOCK_NUMBER_KEYS.has(key)) return 'number';
  return 'text';
}

/** Settings base for a Hero: Bottom aligned nested Text/Heading block node. */
function heroBottomTextBlockBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(
    /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:content_group(:nested:heading_group)?:nested:(text_intro|heading_main|text_body)$/
  );
  if (!m) return null;
  const prefix = m[1]!;
  const nested = Boolean(m[2]);
  const blockId = m[3]!;
  const layout = prefix.match(/^layout:(.+)$/);
  const blocksBase = layout
    ? `sections.${layout[1]}.blocks`
    : (() => {
        const tpl = prefix.match(/^template:([^:]+):(.+)$/);
        return tpl ? `templates.${tpl[1]}.sections.${tpl[2]}.blocks` : null;
      })();
  if (!blocksBase) return null;
  return nested
    ? `${blocksBase}.content_group.blocks.heading_group.blocks.${blockId}`
    : `${blocksBase}.content_group.blocks.${blockId}`;
}

export function isHeroBottomTextBlockNodeId(nodeId: string): boolean {
  return heroBottomTextBlockBaseFromNodeId(nodeId) != null;
}

/** Regenerate Text/Heading panel fields from a bottom-aligned nested node id. */
export function heroBottomTextFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = heroBottomTextBlockBaseFromNodeId(nodeId);
  return base ? textBlockFieldDefs(base) : [];
}

/** Regenerate Group panel seed fields from a bottom-aligned group node id. */
export function heroBottomGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const settingsBase = heroBottomGroupSettingsBaseFromNodeId(nodeId);
  if (!settingsBase) return [];
  return HERO_GROUP_BLOCK_KEYS.map((key) => ({
    path: `${settingsBase}.${key}`,
    type: heroBottomGroupSeedFieldType(key),
    label: key,
  }));
}

/** Seed sidebar `values` for a Hero: Bottom aligned nested Text/Heading block panel from config. */
export function extendValuesForHeroBottomText(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = heroBottomTextFieldDefsFromNodeId(nodeId);
  if (!defs.length) return values;
  return seedTextBlockValues(values, defs, config);
}

/** Seed sidebar `values` for a Hero: Bottom aligned "Group" block panel from merged config. */
export function extendValuesForHeroBottomGroup(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = heroBottomGroupFieldDefsFromNodeId(nodeId);
  if (!defs.length) return values;
  return seedTextBlockValues(values, defs, config);
}

function seedTextBlockValues(
  values: Record<string, string | boolean>,
  defs: EditorFieldDef[],
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const next = { ...values };
  let changed = false;
  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw === undefined) continue;
    if (field.type === 'boolean') {
      next[field.path] = Boolean(raw);
    } else {
      next[field.path] = raw == null ? '' : String(raw);
    }
    changed = true;
  }
  return changed ? next : values;
}
