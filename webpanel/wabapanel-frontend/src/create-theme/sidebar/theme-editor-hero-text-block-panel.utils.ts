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

/** Full Shopify-style Group panel fields (Layout → Size → Appearance → Borders → Block link → Padding). */
export function heroBottomGroupPanelFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  const fitFillCustom = [
    { value: 'fit', label: 'Fit' },
    { value: 'fill', label: 'Fill' },
    { value: 'custom', label: 'Custom' },
  ];
  const pctSlider = (key: string, label: string): EditorFieldDef => ({
    path: s(key),
    type: 'number',
    label,
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: true,
  });
  const padSlider = (key: string, label: string): EditorFieldDef => ({
    path: s(key),
    type: 'number',
    label,
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
    sidebar: true,
  });
  return [
    {
      path: s('direction'),
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
      path: s('verticalOnMobile'),
      type: 'boolean',
      label: 'Vertical on mobile',
      group: 'Layout',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('layoutAlignment'),
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
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'space-between', label: 'Space between' },
        { value: 'space-around', label: 'Space around' },
      ],
    },
    {
      path: s('alignTextBaseline'),
      type: 'boolean',
      label: 'Align text baseline',
      group: 'Layout',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('layoutGap'),
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
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: fitFillCustom,
    },
    pctSlider('customWidth', 'Custom width'),
    {
      path: s('mobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: fitFillCustom,
    },
    pctSlider('mobileCustomWidth', 'Custom width'),
    {
      path: s('height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: fitFillCustom,
    },
    pctSlider('customHeight', 'Custom height'),
    {
      path: s('backgroundMedia'),
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
      path: s('backgroundImageUrl'),
      type: 'text',
      label: 'Background image',
      group: 'Appearance',
      widget: 'image',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
    },
    {
      path: s('backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
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
      path: s('cornerRadius'),
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
      path: s('link'),
      type: 'text',
      label: 'Link',
      group: 'Block link',
      widget: 'link',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('linkOpenInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Block link',
      widget: 'toggle',
      sidebar: true,
    },
    padSlider('paddingTop', 'Top'),
    padSlider('paddingBottom', 'Bottom'),
    padSlider('paddingLeft', 'Left'),
    padSlider('paddingRight', 'Right'),
  ];
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

/** Regenerate Group panel fields from a bottom-aligned group node id. */
export function heroBottomGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const settingsBase = heroBottomGroupSettingsBaseFromNodeId(nodeId);
  if (!settingsBase) return [];
  return heroBottomGroupPanelFieldDefs(settingsBase);
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
