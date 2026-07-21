import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

const PRODUCT_NESTED_BLOCK_ID = '(title|price|image|swatches)';

export function isProductHighlightProductNestedNodeId(nodeId: string): boolean {
  return new RegExp(`^template:[^:]+:[^:]+:block:product:nested:${PRODUCT_NESTED_BLOCK_ID}$`).test(
    nodeId
  );
}

export function isProductHighlightProductTitleNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product:nested:title$/.test(nodeId);
}

export function isProductHighlightProductPriceNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product:nested:price$/.test(nodeId);
}

export function isProductHighlightProductImageNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product:nested:image$/.test(nodeId);
}

export function isProductHighlightProductSwatchesNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:product:nested:swatches$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(
    new RegExp(`^template:([^:]+):([^:]+):block:product:nested:${PRODUCT_NESTED_BLOCK_ID}$`)
  );
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.product.blocks.${m[3]}`;
}

const FIT_FILL = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

const MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

const TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'body', label: 'Body' },
] as const;

const ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '1/1', label: 'Square (1:1)' },
  { value: '4/5', label: 'Portrait (4:5)' },
  { value: '3/4', label: 'Portrait (3:4)' },
  { value: '16/9', label: 'Landscape (16:9)' },
  { value: '2/3', label: 'Portrait (2:3)' },
] as const;

const CONSTRAIN_HEIGHT_OPTIONS = [
  { value: 'maintain-aspect-ratio', label: 'Maintain aspect ratio' },
  { value: 'cover', label: 'Cover screen height' },
] as const;

export const PRODUCT_HIGHLIGHT_TITLE_PANEL_GROUP_ORDER = [
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

export const PRODUCT_HIGHLIGHT_PRICE_PANEL_GROUP_ORDER = ['General', 'Typography'] as const;

export const PRODUCT_HIGHLIGHT_IMAGE_PANEL_GROUP_ORDER = ['General'] as const;

export const PRODUCT_HIGHLIGHT_SWATCHES_PANEL_GROUP_ORDER = ['Layout'] as const;

export function productHighlightProductTitleDefaultSettings(): Record<string, string | number | boolean> {
  return {
    width: 'fit',
    maxWidth: 'normal',
    alignment: 'left',
    typographyPreset: 'heading-5',
    textColor: 'default',
    backgroundEnabled: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function productHighlightProductPriceDefaultSettings(): Record<string, string | number | boolean> {
  return {
    showSalePriceFirst: false,
    typographyPreset: 'default',
  };
}

export function productHighlightProductImageDefaultSettings(): Record<string, string | number | boolean> {
  return {
    aspectRatio: 'auto',
    constrainToScreenHeight: 'maintain-aspect-ratio',
  };
}

export function productHighlightProductSwatchesDefaultSettings(): Record<string, string | number | boolean> {
  return {
    enabled: true,
    alignment: 'left',
    mobileAlignment: 'left',
  };
}

export function productHighlightProductTitleFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL],
    },
    {
      path: s('maxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [...MAX_WIDTH_OPTIONS],
    },
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [...ALIGNMENT_OPTIONS],
    },
    {
      path: s('typographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [...TYPOGRAPHY_PRESET_OPTIONS],
    },
    {
      path: s('textColor'),
      type: 'text',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('backgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      sidebar: false,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
  ];
}

export function productHighlightProductPriceFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('showSalePriceFirst'),
      type: 'boolean',
      label: 'Show sale price first',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('typographyPreset'),
      type: 'select',
      label: 'Text preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [...TYPOGRAPHY_PRESET_OPTIONS],
    },
  ];
}

export function productHighlightProductImageFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('aspectRatio'),
      type: 'select',
      label: 'Aspect ratio',
      group: 'General',
      widget: 'select',
      sidebar: false,
      options: [...ASPECT_RATIO_OPTIONS],
    },
    {
      path: s('constrainToScreenHeight'),
      type: 'select',
      label: 'Constrain to screen height',
      group: 'General',
      widget: 'select',
      sidebar: false,
      options: [...CONSTRAIN_HEIGHT_OPTIONS],
    },
  ];
}

export function productHighlightProductSwatchesFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [...ALIGNMENT_OPTIONS],
    },
    {
      path: s('mobileAlignment'),
      type: 'select',
      label: 'Mobile alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [...ALIGNMENT_OPTIONS],
    },
  ];
}

export function productHighlightProductBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  if (isProductHighlightProductTitleNestedNodeId(nodeId)) {
    return productHighlightProductTitleFieldDefs(base);
  }
  if (isProductHighlightProductPriceNestedNodeId(nodeId)) {
    return productHighlightProductPriceFieldDefs(base);
  }
  if (isProductHighlightProductImageNestedNodeId(nodeId)) {
    return productHighlightProductImageFieldDefs(base);
  }
  if (isProductHighlightProductSwatchesNestedNodeId(nodeId)) {
    return productHighlightProductSwatchesFieldDefs(base);
  }
  return [];
}

export function productHighlightProductBlockFieldDefsFromSchema(
  _editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  // Always use Product highlight nested field defs. Shared schema still carries
  // Featured product media keys on product_media, not Product → Image.
  return productHighlightProductBlockFieldDefsFromNodeId(nodeId);
}

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function defaultsForBlock(blockId: string): Record<string, string | number | boolean> {
  switch (blockId) {
    case 'title':
      return productHighlightProductTitleDefaultSettings();
    case 'price':
      return productHighlightProductPriceDefaultSettings();
    case 'image':
      return productHighlightProductImageDefaultSettings();
    case 'swatches':
      return productHighlightProductSwatchesDefaultSettings();
    default:
      return {};
  }
}

export function extendProductHighlightProductBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] =
        field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const blockId = field.path.match(/\.blocks\.product\.blocks\.([^.]+)\./)?.[1] ?? '';
    const fallback = defaultsForBlock(blockId)[field.path.split('.').pop() ?? ''];
    if (fallback === undefined) continue;
    next[field.path] = typeof fallback === 'boolean' ? fallback : String(fallback);
  }
  return next;
}

function filterTitleFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const keys = new Set(['width', 'maxWidth', 'alignment', 'typographyPreset', 'textColor', 'backgroundEnabled', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']);
  return fields.filter((f) => keys.has(f.path.split('.').pop() ?? '') && /\.blocks\.product\.blocks\.title\.settings\./.test(f.path));
}

function filterPriceFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const keys = new Set(['showSalePriceFirst', 'typographyPreset']);
  return fields.filter((f) => keys.has(f.path.split('.').pop() ?? '') && /\.blocks\.product\.blocks\.price\.settings\./.test(f.path));
}

function filterImageFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const keys = new Set(['aspectRatio', 'constrainToScreenHeight']);
  return fields.filter((f) => keys.has(f.path.split('.').pop() ?? '') && /\.blocks\.product\.blocks\.image\.settings\./.test(f.path));
}

function filterSwatchesFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const keys = new Set(['alignment', 'mobileAlignment']);
  return fields.filter((f) => keys.has(f.path.split('.').pop() ?? '') && /\.blocks\.product\.blocks\.swatches\.settings\./.test(f.path));
}

function groupFields(fields: EditorFieldDef[], order: readonly string[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group ?? order[0];
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function groupProductHighlightProductTitlePanelFields(fields: EditorFieldDef[]) {
  return groupFields(filterTitleFields(fields), PRODUCT_HIGHLIGHT_TITLE_PANEL_GROUP_ORDER);
}

export function groupProductHighlightProductPricePanelFields(fields: EditorFieldDef[]) {
  return groupFields(filterPriceFields(fields), PRODUCT_HIGHLIGHT_PRICE_PANEL_GROUP_ORDER);
}

export function groupProductHighlightProductImagePanelFields(fields: EditorFieldDef[]) {
  return groupFields(filterImageFields(fields), PRODUCT_HIGHLIGHT_IMAGE_PANEL_GROUP_ORDER);
}

export function groupProductHighlightProductSwatchesPanelFields(fields: EditorFieldDef[]) {
  return groupFields(filterSwatchesFields(fields), PRODUCT_HIGHLIGHT_SWATCHES_PANEL_GROUP_ORDER);
}

export function isProductHighlightProductTitlePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => /\.blocks\.product\.blocks\.title\.settings\./.test(f.path));
}

export function isProductHighlightProductPricePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => /\.blocks\.product\.blocks\.price\.settings\./.test(f.path));
}

export function isProductHighlightProductImagePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => /\.blocks\.product\.blocks\.image\.settings\./.test(f.path));
}

export function isProductHighlightProductSwatchesPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => /\.blocks\.product\.blocks\.swatches\.settings\./.test(f.path));
}

export function prepareProductHighlightProductTitleSettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Title', kind: 'block', fields: filterTitleFields(node.fields ?? []) };
}

export function prepareProductHighlightProductPriceSettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Price', kind: 'block', fields: filterPriceFields(node.fields ?? []) };
}

export function prepareProductHighlightProductImageSettingsNode(node: SidebarNode): SidebarNode {
  const fromDefs = productHighlightProductImageFieldDefs(
    blocksBaseFromNodeId(node.id) ?? ''
  );
  const fields = fromDefs.length ? fromDefs : filterImageFields(node.fields ?? []);
  return { ...node, label: 'Image', kind: 'block', fields };
}

export function prepareProductHighlightProductSwatchesSettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Swatches', kind: 'block', fields: filterSwatchesFields(node.fields ?? []) };
}
