import type { EditorFieldDef, EditorSchemaDoc } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { fieldTypeFromSchema } from '../components/themes/theme-editor-sidebar/theme-editor-field.utils';
import {
  layoutBlueprintKey,
  remapLayoutSchemaPath,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from './theme-editor-insert-section';

export type SchemaFieldPath = { path: string; type: string; label: string };

type BlockLike = {
  id?: string;
  type?: string;
  settingsFields?: EditorFieldDef[];
  blocks?: BlockLike[];
};

function pushBlockFields(blocks: BlockLike[] | undefined, out: SchemaFieldPath[], seen: Set<string>): void {
  for (const block of blocks ?? []) {
    for (const field of block.settingsFields ?? []) {
      if (!field.path || seen.has(field.path)) continue;
      seen.add(field.path);
      out.push({ path: field.path, type: field.type, label: field.label || field.path });
    }
    pushBlockFields(block.blocks, out, seen);
  }
}

/** Every editable path declared in theme.schema.json (including nested blocks). */
export function flattenSchemaFieldPaths(schema: EditorSchemaDoc): SchemaFieldPath[] {
  const out: SchemaFieldPath[] = [];
  const seen = new Set<string>();

  for (const group of schema.globalSettings?.groups ?? []) {
    for (const field of group.fields ?? []) {
      if (!field.path || seen.has(field.path)) continue;
      seen.add(field.path);
      out.push({ path: field.path, type: field.type, label: field.label || field.path });
    }
  }

  for (const layout of Object.values(schema.layout ?? {})) {
    for (const field of layout.settingsFields ?? []) {
      if (!field.path || seen.has(field.path)) continue;
      seen.add(field.path);
      out.push({ path: field.path, type: field.type, label: field.label || field.path });
    }
    pushBlockFields(layout.blocks, out, seen);
  }

  for (const tpl of schema.templates ?? []) {
    for (const sec of tpl.sections ?? []) {
      for (const field of sec.settingsFields ?? []) {
        if (!field.path || seen.has(field.path)) continue;
        seen.add(field.path);
        out.push({ path: field.path, type: field.type, label: field.label || field.path });
      }
      pushBlockFields(sec.blocks, out, seen);
    }
  }

  return out;
}

function pushRemappedFields(
  fields: EditorFieldDef[] | undefined,
  instanceId: string,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  for (const field of fields ?? []) {
    if (!field.path) continue;
    const path = remapLayoutSchemaPath(field.path, instanceId);
    if (seen.has(path)) continue;
    seen.add(path);
    out.push({ path, type: field.type, label: field.label || path });
  }
}

function pushRemappedBlockFields(
  blocks: BlockLike[] | undefined,
  instanceId: string,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  for (const block of blocks ?? []) {
    pushRemappedFields(block.settingsFields, instanceId, out, seen);
    pushRemappedBlockFields(block.blocks, instanceId, out, seen);
  }
}

function pushRemappedTemplateFields(
  fields: EditorFieldDef[] | undefined,
  tplId: string,
  instanceId: string,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  for (const field of fields ?? []) {
    if (!field.path) continue;
    const path = remapTemplateSchemaPath(field.path, tplId, instanceId);
    if (seen.has(path)) continue;
    seen.add(path);
    out.push({ path, type: field.type, label: field.label || path });
  }
}

function pushRemappedTemplateBlockFields(
  blocks: BlockLike[] | undefined,
  tplId: string,
  instanceId: string,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  for (const block of blocks ?? []) {
    pushRemappedTemplateFields(block.settingsFields, tplId, instanceId, out, seen);
    pushRemappedTemplateBlockFields(block.blocks, tplId, instanceId, out, seen);
  }
}

function settingKeyFromBlueprintFieldPath(path: string): string | null {
  const m = path.match(/\.settings\.([^.]+)$/);
  return m ? m[1] : null;
}

function schemaBlockForConfigBlock(
  schemaBlocks: BlockLike[] | undefined,
  blockInstanceId: string,
  configBlock: { type?: unknown }
): BlockLike | undefined {
  if (!schemaBlocks?.length) return undefined;
  const byId = schemaBlocks.find((b) => (b.id ?? '') === blockInstanceId);
  if (byId) return byId;
  const blockType = String(configBlock.type ?? '').trim();
  if (!blockType) return undefined;
  return schemaBlocks.find((b) => b.type === blockType || (b.id ?? '') === blockType);
}

function pushLayoutBlockInstanceFields(
  instanceId: string,
  sectionData: Record<string, unknown>,
  schemaLayout: BlockLike,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  const blocks = sectionData.blocks as Record<string, { type?: string }> | undefined;
  if (!blocks || !schemaLayout.blocks?.length) return;
  for (const [blockInstanceId, blockData] of Object.entries(blocks)) {
    const schemaBlock = schemaBlockForConfigBlock(schemaLayout.blocks, blockInstanceId, blockData);
    if (!schemaBlock?.settingsFields?.length) continue;
    for (const field of schemaBlock.settingsFields) {
      const key = settingKeyFromBlueprintFieldPath(field.path);
      if (!key) continue;
      const path = `sections.${instanceId}.blocks.${blockInstanceId}.settings.${key}`;
      if (seen.has(path)) continue;
      seen.add(path);
      out.push({ path, type: field.type, label: field.label || path });
    }
  }
}

function pushTemplateBlockInstanceFields(
  tplId: string,
  instanceId: string,
  sectionData: Record<string, unknown>,
  schemaSection: BlockLike,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  const blocks = sectionData.blocks as Record<string, { type?: string }> | undefined;
  if (!blocks || !schemaSection.blocks?.length) return;
  for (const [blockInstanceId, blockData] of Object.entries(blocks)) {
    const schemaBlock = schemaBlockForConfigBlock(schemaSection.blocks, blockInstanceId, blockData);
    if (!schemaBlock?.settingsFields?.length) continue;
    for (const field of schemaBlock.settingsFields) {
      const key = settingKeyFromBlueprintFieldPath(field.path);
      if (!key) continue;
      const path = `templates.${tplId}.sections.${instanceId}.blocks.${blockInstanceId}.settings.${key}`;
      if (seen.has(path)) continue;
      seen.add(path);
      out.push({ path, type: field.type, label: field.label || path });
    }
  }
}

function resolveBlockInstanceFieldType(
  path: string,
  typeByPath: Map<string, string>
): string | undefined {
  const layoutBlock = path.match(/^sections\.([^.]+)\.blocks\.[^.]+\.settings\.([^.]+)$/);
  if (layoutBlock) {
    const [, sectionId, key] = layoutBlock;
    const blueprint = layoutBlueprintKey(sectionId);
    const prefix = `sections.${blueprint}.blocks.`;
    for (const [p, type] of typeByPath) {
      if (p.startsWith(prefix) && p.endsWith(`.settings.${key}`)) return type;
    }
  }

  const tplBlock = path.match(
    /^templates\.([^.]+)\.sections\.([^.]+)\.blocks\.[^.]+\.settings\.([^.]+)$/
  );
  if (tplBlock) {
    const [, tplId, sectionId, key] = tplBlock;
    const blueprint = templateBlueprintKey(sectionId);
    const prefix = `templates.${tplId}.sections.${blueprint}.blocks.`;
    for (const [p, type] of typeByPath) {
      if (p.startsWith(prefix) && p.endsWith(`.settings.${key}`)) return type;
    }
  }

  return undefined;
}

/**
 * Schema blueprint paths plus remapped paths for extra layout instances
 * (e.g. sections.announcement_bar_2.* added via "Add section").
 */
export function collectEditableFieldPaths(
  schema: EditorSchemaDoc,
  config: Record<string, unknown>
): SchemaFieldPath[] {
  const out = flattenSchemaFieldPaths(schema);
  const seen = new Set(out.map((f) => f.path));
  const sections = (config.sections ?? {}) as Record<string, unknown>;

  for (const instanceId of Object.keys(sections)) {
    const blueprint = layoutBlueprintKey(instanceId);
    if (blueprint === instanceId) continue;
    const layout = schema.layout?.[blueprint];
    if (!layout) continue;
    pushRemappedFields(layout.settingsFields, instanceId, out, seen);
    pushRemappedBlockFields(layout.blocks, instanceId, out, seen);
  }

  const templates = config.templates as
    | Record<string, { sections?: Record<string, unknown> }>
    | undefined;
  for (const [tplId, tpl] of Object.entries(templates ?? {})) {
    const template = schema.templates?.find((t) => t.id === tplId);
    if (!template?.sections?.length) continue;
    for (const instanceId of Object.keys(tpl.sections ?? {})) {
      const blueprint = templateBlueprintKey(instanceId);
      if (blueprint === instanceId) continue;
      const sec = template.sections.find((s) => (s.id ?? '') === blueprint);
      if (!sec) continue;
      pushRemappedTemplateFields(sec.settingsFields, tplId, instanceId, out, seen);
      pushRemappedTemplateBlockFields(sec.blocks, tplId, instanceId, out, seen);
    }
  }

  for (const [instanceId, sectionData] of Object.entries(sections)) {
    const blueprint = layoutBlueprintKey(instanceId);
    const layout = schema.layout?.[blueprint];
    if (!layout || !sectionData || typeof sectionData !== 'object') continue;
    pushLayoutBlockInstanceFields(instanceId, sectionData as Record<string, unknown>, layout, out, seen);
  }

  for (const [tplId, tpl] of Object.entries(templates ?? {})) {
    const template = schema.templates?.find((t) => t.id === tplId);
    if (!template?.sections?.length) continue;
    for (const [instanceId, sectionData] of Object.entries(tpl.sections ?? {})) {
      const blueprint = templateBlueprintKey(instanceId);
      const sec = template.sections.find((s) => (s.id ?? '') === blueprint);
      if (!sec || !sectionData || typeof sectionData !== 'object') continue;
      pushTemplateBlockInstanceFields(
        tplId,
        instanceId,
        sectionData as Record<string, unknown>,
        sec,
        out,
        seen
      );
    }
  }

  pushSharedHeadingBlockEditablePaths(schema, config, out, seen);
  pushFaqAccordionRowInstancePaths(schema, config, out, seen);

  return out;
}

const FAQ_ACCORDION_ROW_SETTING_TYPES: Record<string, string> = {
  heading: 'text',
  openByDefault: 'boolean',
  rowIcon: 'select',
  rowImageIconUrl: 'text',
  rowIconWidth: 'number',
};

function faqAccordionRowSchemaFieldKeys(schema: EditorSchemaDoc): { key: string; type: string; label: string }[] {
  const fromLayout = schema.layout?.faq_section?.blocks
    ?.find((b) => (b.id ?? '') === 'accordion')
    ?.blocks?.find((b) => (b.id ?? '') === 'accordion_row')
    ?.settingsFields;
  if (fromLayout?.length) {
    return fromLayout
      .map((field) => {
        const key = settingKeyFromBlueprintFieldPath(field.path ?? '');
        if (!key) return null;
        return { key, type: field.type, label: field.label || key };
      })
      .filter((x): x is { key: string; type: string; label: string } => Boolean(x));
  }
  return Object.entries(FAQ_ACCORDION_ROW_SETTING_TYPES).map(([key, type]) => ({
    key,
    type,
    label: key,
  }));
}

/** FAQ accordion rows use instance ids (`row_1`) while schema declares `accordion_row`. */
function pushFaqAccordionRowInstancePaths(
  schema: EditorSchemaDoc,
  config: Record<string, unknown>,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  const rowFields = faqAccordionRowSchemaFieldKeys(schema);
  if (!rowFields.length) return;

  const pushSectionRows = (sectionPrefix: string, sectionData: Record<string, unknown>) => {
    const accordion = (sectionData.blocks as Record<string, { type?: string; blocks?: Record<string, unknown> }> | undefined)
      ?.accordion;
    const rows = accordion?.blocks;
    if (!rows || typeof rows !== 'object') return;
    for (const [rowId, row] of Object.entries(rows)) {
      if (!row || typeof row !== 'object') continue;
      const rowType = String((row as { type?: string }).type ?? '');
      if (rowType && rowType !== 'accordion-row') continue;
      for (const field of rowFields) {
        const path = `${sectionPrefix}.blocks.accordion.blocks.${rowId}.settings.${field.key}`;
        if (seen.has(path)) continue;
        seen.add(path);
        out.push({ path, type: field.type, label: field.label });
      }
    }
  };

  const templates = config.templates as
    | Record<string, { sections?: Record<string, Record<string, unknown>> }>
    | undefined;
  for (const [tplId, tpl] of Object.entries(templates ?? {})) {
    for (const [instanceId, sectionData] of Object.entries(tpl.sections ?? {})) {
      if (templateBlueprintKey(instanceId) !== 'faq_section') continue;
      pushSectionRows(`templates.${tplId}.sections.${instanceId}`, sectionData);
    }
  }

  const sections = config.sections as Record<string, Record<string, unknown>> | undefined;
  for (const [instanceId, sectionData] of Object.entries(sections ?? {})) {
    if (layoutBlueprintKey(instanceId) !== 'faq_section') continue;
    pushSectionRows(`sections.${instanceId}`, sectionData);
  }
}

const HERO_TEXT_BLOCK_SETTING_TYPES: Record<string, string> = {
  text: 'textarea',
  width: 'select',
  maxWidth: 'select',
  alignment: 'select',
  typographyPreset: 'select',
  backgroundEnabled: 'boolean',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

function resolveHeroTextBlockFieldType(path: string): string | undefined {
  const tpl = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.text(?:_\d+)?\.settings\.([^.]+)$/
  );
  if (tpl) {
    return HERO_TEXT_BLOCK_SETTING_TYPES[tpl[1]!];
  }
  const layout = path.match(/^sections\.[^.]+\.blocks\.text(?:_\d+)?\.settings\.([^.]+)$/);
  if (layout) {
    return HERO_TEXT_BLOCK_SETTING_TYPES[layout[1]!];
  }
  return undefined;
}

const HERO_LOGO_BLOCK_SETTING_TYPES: Record<string, string> = {
  text: 'text',
  imageUrl: 'text',
  logoFont: 'select',
  sizeUnit: 'select',
  pixelHeight: 'number',
  percentWidth: 'number',
  customMobileSize: 'boolean',
  mobileSizeUnit: 'select',
  mobilePixelHeight: 'number',
  mobilePercentWidth: 'number',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

function resolveHeroLogoBlockFieldType(path: string): string | undefined {
  const tpl = path.match(/^templates\.[^.]+\.sections\.[^.]+\.blocks\.logo\.settings\.([^.]+)$/);
  if (tpl) {
    return HERO_LOGO_BLOCK_SETTING_TYPES[tpl[1]!];
  }
  const layout = path.match(/^sections\.[^.]+\.blocks\.logo\.settings\.([^.]+)$/);
  if (layout) {
    return HERO_LOGO_BLOCK_SETTING_TYPES[layout[1]!];
  }
  return undefined;
}

function resolveFaqAccordionRowFieldType(
  path: string,
  typeByPath: Map<string, string>
): string | undefined {
  const tpl = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.accordion\.blocks\.[^.]+\.settings\.([^.]+)$/
  );
  if (tpl) {
    const key = tpl[1]!;
    return (
      typeByPath.get(
        `templates.index.sections.faq_section.blocks.accordion.blocks.accordion_row.settings.${key}`
      ) ??
      typeByPath.get(
        `sections.faq_section.blocks.accordion.blocks.accordion_row.settings.${key}`
      ) ??
      FAQ_ACCORDION_ROW_SETTING_TYPES[key]
    );
  }
  const layout = path.match(
    /^sections\.[^.]+\.blocks\.accordion\.blocks\.[^.]+\.settings\.([^.]+)$/
  );
  if (layout) {
    const key = layout[1]!;
    return (
      typeByPath.get(
        `sections.faq_section.blocks.accordion.blocks.accordion_row.settings.${key}`
      ) ??
      typeByPath.get(
        `templates.index.sections.faq_section.blocks.accordion.blocks.accordion_row.settings.${key}`
      ) ??
      FAQ_ACCORDION_ROW_SETTING_TYPES[key]
    );
  }
  return undefined;
}

function sectionSchemaHasHeadingBlock(blocks: BlockLike[] | undefined): boolean {
  return (blocks ?? []).some((b) => {
    const id = b.id ?? '';
    return id === 'heading' || id.startsWith('heading_');
  });
}

function canonicalHeroHeadingSchemaFields(schema: EditorSchemaDoc): SchemaFieldPath[] {
  const tpl = schema.templates?.find((t) => t.id === 'index');
  const hero = tpl?.sections?.find((s) => (s.id ?? '') === 'hero_main');
  const heading = hero?.blocks?.find((b) => (b.id ?? '') === 'heading');
  const fields: SchemaFieldPath[] = [];
  for (const field of heading?.settingsFields ?? []) {
    if (!field.path) continue;
    fields.push({
      path: field.path,
      type: field.type,
      label: field.label || field.path,
    });
  }
  return fields;
}

/** FAQ and other sections reuse hero heading panel fields that are missing from schema. */
function pushSharedHeadingBlockEditablePaths(
  schema: EditorSchemaDoc,
  config: Record<string, unknown>,
  out: SchemaFieldPath[],
  seen: Set<string>
): void {
  const canon = canonicalHeroHeadingSchemaFields(schema);
  if (!canon.length) return;

  const pushSectionHeadingPaths = (
    settingsPrefix: string,
    blocksPrefix: string,
    field: SchemaFieldPath
  ) => {
    const key = field.path.split('.').pop() ?? '';
    if (!key || !HEADING_SECTION_SETTING_TYPES[key]) return;
    const path = `${settingsPrefix}.${key}`;
    if (seen.has(path)) return;
    seen.add(path);
    out.push({ path, type: field.type, label: field.label });
  };

  const pushBlockHeadingPath = (blocksPrefix: string) => {
    const path = `${blocksPrefix}.heading.settings.heading`;
    if (seen.has(path)) return;
    seen.add(path);
    out.push({ path, type: 'textarea', label: 'Heading' });
  };

  for (const tpl of schema.templates ?? []) {
    for (const sec of tpl.sections ?? []) {
      if (!sectionSchemaHasHeadingBlock(sec.blocks)) continue;
      const blueprint = sec.id ?? 'section';
      const settingsPrefix = `templates.${tpl.id}.sections.${blueprint}.settings`;
      const blocksPrefix = `templates.${tpl.id}.sections.${blueprint}.blocks`;
      for (const field of canon) pushSectionHeadingPaths(settingsPrefix, blocksPrefix, field);
      pushBlockHeadingPath(blocksPrefix);
    }
  }

  for (const [blueprint, layout] of Object.entries(schema.layout ?? {})) {
    if (!sectionSchemaHasHeadingBlock(layout.blocks)) continue;
    const settingsPrefix = `sections.${blueprint}.settings`;
    const blocksPrefix = `sections.${blueprint}.blocks`;
    for (const field of canon) pushSectionHeadingPaths(settingsPrefix, blocksPrefix, field);
    pushBlockHeadingPath(blocksPrefix);
  }

  const templates = config.templates as
    | Record<string, { sections?: Record<string, unknown> }>
    | undefined;
  for (const [tplId, tpl] of Object.entries(templates ?? {})) {
    const template = schema.templates?.find((t) => t.id === tplId);
    for (const instanceId of Object.keys(tpl.sections ?? {})) {
      const blueprint = templateBlueprintKey(instanceId);
      if (blueprint === instanceId) continue;
      const sec = template?.sections?.find((s) => (s.id ?? '') === blueprint);
      if (!sec || !sectionSchemaHasHeadingBlock(sec.blocks)) continue;
      const settingsPrefix = `templates.${tplId}.sections.${instanceId}.settings`;
      const blocksPrefix = `templates.${tplId}.sections.${instanceId}.blocks`;
      for (const field of canon) pushSectionHeadingPaths(settingsPrefix, blocksPrefix, field);
      pushBlockHeadingPath(blocksPrefix);
    }
  }

  const layoutSections = config.sections as Record<string, unknown> | undefined;
  for (const instanceId of Object.keys(layoutSections ?? {})) {
    const blueprint = layoutBlueprintKey(instanceId);
    if (blueprint === instanceId) continue;
    const layout = schema.layout?.[blueprint];
    if (!layout || !sectionSchemaHasHeadingBlock(layout.blocks)) continue;
    const settingsPrefix = `sections.${instanceId}.settings`;
    const blocksPrefix = `sections.${instanceId}.blocks`;
    for (const field of canon) pushSectionHeadingPaths(settingsPrefix, blocksPrefix, field);
    pushBlockHeadingPath(blocksPrefix);
  }
}

const HEADING_SECTION_SETTING_TYPES: Record<string, string> = {
  title: 'textarea',
  headingWidth: 'select',
  headingMaxWidth: 'select',
  headingAlignment: 'select',
  headingTypographyPreset: 'select',
  headingFont: 'select',
  headingFontSize: 'select',
  headingLineHeight: 'select',
  headingLetterSpacing: 'select',
  headingTextCase: 'select',
  headingWrap: 'select',
  headingColor: 'select',
  headingBackgroundEnabled: 'boolean',
  headingBackgroundColor: 'text',
  headingCornerRadius: 'number',
  headingPaddingTop: 'number',
  headingPaddingBottom: 'number',
  headingPaddingLeft: 'number',
  headingPaddingRight: 'number',
};

function resolveSharedHeadingSectionSettingType(
  path: string,
  typeByPath: Map<string, string>
): string | undefined {
  const tpl = path.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings\.([^.]+)$/);
  if (tpl) {
    const key = tpl[3]!;
    if (!HEADING_SECTION_SETTING_TYPES[key]) return undefined;
    return (
      typeByPath.get(`templates.index.sections.hero_main.settings.${key}`) ??
      HEADING_SECTION_SETTING_TYPES[key]
    );
  }
  const layout = path.match(/^sections\.([^.]+)\.settings\.([^.]+)$/);
  if (layout) {
    const key = layout[2]!;
    if (!HEADING_SECTION_SETTING_TYPES[key]) return undefined;
    return (
      typeByPath.get(`templates.index.sections.hero_main.settings.${key}`) ??
      typeByPath.get(`sections.${layoutBlueprintKey(layout[1]!)}.settings.${key}`) ??
      HEADING_SECTION_SETTING_TYPES[key]
    );
  }
  return undefined;
}

const FEATURED_PRODUCT_DETAILS_SETTING_TYPES: Record<string, string> = {
  width: 'select',
  customWidth: 'number',
  mobileWidth: 'select',
  mobileCustomWidth: 'number',
  height: 'select',
  layoutGap: 'number',
  position: 'select',
  stickyOnDesktop: 'boolean',
  inheritColorScheme: 'boolean',
  backgroundMedia: 'select',
  backgroundImageUrl: 'text',
  backgroundImagePosition: 'select',
  borderStyle: 'select',
  borderThickness: 'number',
  borderOpacity: 'number',
  cornerRadius: 'number',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const FEATURED_PRODUCT_REVIEW_STARS_SETTING_TYPES: Record<string, string> = {
  style: 'select',
  reviewCount: 'boolean',
  color: 'select',
  typographyPreset: 'select',
  width: 'select',
  alignment: 'select',
};

const FEATURED_PRODUCT_VARIANT_PICKER_SETTING_TYPES: Record<string, string> = {
  style: 'select',
  swatches: 'boolean',
  alignment: 'select',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const FEATURED_PRODUCT_ADD_TO_CART_SETTING_TYPES: Record<string, string> = {
  style: 'select',
  buttonLabel: 'text',
};

const FEATURED_PRODUCT_BUY_BUTTONS_SETTING_TYPES: Record<string, string> = {
  alwaysStackButtons: 'boolean',
  showPickupAvailability: 'boolean',
  giftCardForm: 'boolean',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const FEATURED_PRODUCT_HEADER_BLOCK_SETTING_TYPES: Record<string, string> = {
  direction: 'select',
  alignment: 'select',
  position: 'select',
  layoutGap: 'number',
  width: 'select',
  customWidth: 'number',
  mobileWidth: 'select',
  mobileCustomWidth: 'number',
  height: 'select',
  customHeight: 'number',
  inheritColorScheme: 'boolean',
  backgroundMedia: 'select',
  backgroundImageUrl: 'text',
  backgroundImagePosition: 'select',
  borderStyle: 'select',
  borderThickness: 'number',
  borderOpacity: 'number',
  cornerRadius: 'number',
  backgroundOverlay: 'boolean',
  linkUrl: 'text',
  openLinkInNewTab: 'boolean',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const FEATURED_PRODUCT_HEADER_PRICE_SETTING_TYPES: Record<string, string> = {
  showSalePriceFirst: 'boolean',
  installments: 'boolean',
  taxInformation: 'boolean',
  typographyPreset: 'select',
  width: 'select',
  alignment: 'select',
  color: 'select',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const FEATURED_PRODUCT_HEADER_TITLE_SETTING_TYPES: Record<string, string> = {
  width: 'select',
  maxWidth: 'select',
  typographyPreset: 'select',
  backgroundEnabled: 'boolean',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const FEATURED_PRODUCT_MEDIA_SETTING_TYPES: Record<string, string> = {
  aspectRatio: 'select',
  constrainToScreenHeight: 'boolean',
  mediaFit: 'select',
  cornerRadius: 'number',
  extendMediaToScreenEdge: 'boolean',
  enableZoom: 'boolean',
  videoLooping: 'boolean',
  hideUnselectedVariantMedia: 'boolean',
  carouselIcons: 'select',
  carouselPagination: 'select',
  carouselMobilePagination: 'select',
  paddingTop: 'number',
  paddingBottom: 'number',
  paddingLeft: 'number',
  paddingRight: 'number',
};

const HEADER_MENU_BLOCK_SETTING_TYPES: Record<string, string> = {
  menu: 'select',
  colorScheme: 'select',
  topLevelSize: 'select',
  submenuSize: 'select',
  font: 'select',
  textCase: 'select',
  submenuMediaType: 'select',
  submenuImageRatio: 'select',
  submenuImageCornerRadius: 'number',
  mobileNavigationBar: 'boolean',
  mobileAccordion: 'boolean',
  mobileDividers: 'boolean',
};

function resolveFieldTypeForPath(
  path: string,
  typeByPath: Map<string, string>
): string | undefined {
  const direct = typeByPath.get(path);
  if (direct) return direct;

  const sharedHeadingSection = resolveSharedHeadingSectionSettingType(path, typeByPath);
  if (sharedHeadingSection) return sharedHeadingSection;

  const menuSetting = path.match(/^sections\.[^.]+\.blocks\.menu\.settings\.([^.]+)$/);
  if (menuSetting) {
    const inferred = HEADER_MENU_BLOCK_SETTING_TYPES[menuSetting[1]];
    if (inferred) return inferred;
  }

  const productMediaSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.product_media\.settings\.([^.]+)$/
  );
  if (productMediaSetting) {
    const inferred = FEATURED_PRODUCT_MEDIA_SETTING_TYPES[productMediaSetting[1]];
    if (inferred) return inferred;
  }

  const productDetailsSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.settings\.([^.]+)$/
  );
  if (productDetailsSetting) {
    const inferred = FEATURED_PRODUCT_DETAILS_SETTING_TYPES[productDetailsSetting[1]];
    if (inferred) return inferred;
  }

  const headerTitleSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.header\.blocks\.title\.settings\.([^.]+)$/
  );
  if (headerTitleSetting) {
    const inferred = FEATURED_PRODUCT_HEADER_TITLE_SETTING_TYPES[headerTitleSetting[1]];
    if (inferred) return inferred;
  }

  const reviewStarsSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.review_stars\.settings\.([^.]+)$/
  );
  if (reviewStarsSetting) {
    const inferred = FEATURED_PRODUCT_REVIEW_STARS_SETTING_TYPES[reviewStarsSetting[1]];
    if (inferred) return inferred;
  }

  const variantPickerSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.variant_picker\.settings\.([^.]+)$/
  );
  if (variantPickerSetting) {
    const inferred = FEATURED_PRODUCT_VARIANT_PICKER_SETTING_TYPES[variantPickerSetting[1]];
    if (inferred) return inferred;
  }

  const addToCartSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.buy_buttons\.blocks\.add_to_cart\.settings\.([^.]+)$/
  );
  if (addToCartSetting) {
    const inferred = FEATURED_PRODUCT_ADD_TO_CART_SETTING_TYPES[addToCartSetting[1]];
    if (inferred) return inferred;
  }

  const buyButtonsSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.buy_buttons\.settings\.([^.]+)$/
  );
  if (buyButtonsSetting) {
    const inferred = FEATURED_PRODUCT_BUY_BUTTONS_SETTING_TYPES[buyButtonsSetting[1]];
    if (inferred) return inferred;
  }

  const headerBlockSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.header\.settings\.([^.]+)$/
  );
  if (headerBlockSetting) {
    const inferred = FEATURED_PRODUCT_HEADER_BLOCK_SETTING_TYPES[headerBlockSetting[1]];
    if (inferred) return inferred;
  }

  const headerPriceSetting = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.details\.blocks\.header\.blocks\.price\.settings\.([^.]+)$/
  );
  if (headerPriceSetting) {
    const inferred = FEATURED_PRODUCT_HEADER_PRICE_SETTING_TYPES[headerPriceSetting[1]];
    if (inferred) return inferred;
  }

  const layoutHero = path.match(/^sections\.(hero_main(?:_\d+)?)\.(.+)$/);
  if (layoutHero) {
    const fromTemplate = typeByPath.get(`templates.index.sections.hero_main.${layoutHero[2]}`);
    if (fromTemplate) return fromTemplate;
  }

  const tplHero = path.match(/^templates\.([^.]+)\.sections\.(hero_main(?:_\d+)?)\.(.+)$/);
  if (tplHero) {
    const fromBlueprint = typeByPath.get(`templates.${tplHero[1]}.sections.hero_main.${tplHero[3]}`);
    if (fromBlueprint) return fromBlueprint;
  }

  const m = path.match(/^sections\.([^.]+)\.(.+)$/);
  if (m) {
    const [, instanceId, rest] = m;
    const blueprint = layoutBlueprintKey(instanceId);
    if (blueprint !== instanceId) {
      const fromBlueprint = typeByPath.get(`sections.${blueprint}.${rest}`);
      if (fromBlueprint) return fromBlueprint;
    }
  }

  const tpl = path.match(/^templates\.([^.]+)\.sections\.([^.]+)\.(.+)$/);
  if (tpl) {
    const [, tplId, instanceId, rest] = tpl;
    const blueprint = templateBlueprintKey(instanceId);
    if (blueprint !== instanceId) {
      return typeByPath.get(`templates.${tplId}.sections.${blueprint}.${rest}`);
    }
  }

  const tplBlockHeading = path.match(
    /^templates\.([^.]+)\.sections\.([^.]+)\.blocks\.[^.]+\.settings\.heading$/
  );
  if (tplBlockHeading) {
    return (
      typeByPath.get(
        `templates.${tplBlockHeading[1]}.sections.${tplBlockHeading[2]}.settings.title`
      ) ?? 'textarea'
    );
  }

  const layoutBlockHeading = path.match(/^sections\.([^.]+)\.blocks\.[^.]+\.settings\.heading$/);
  if (layoutBlockHeading) {
    return (
      typeByPath.get(`templates.index.sections.hero_main.settings.title`) ??
      typeByPath.get(`sections.${layoutBlockHeading[1]}.settings.title`) ??
      'textarea'
    );
  }

  const fromBlockInstance = resolveBlockInstanceFieldType(path, typeByPath);
  if (fromBlockInstance) return fromBlockInstance;

  const faqAccordionRow = resolveFaqAccordionRowFieldType(path, typeByPath);
  if (faqAccordionRow) return faqAccordionRow;

  const heroTextBlock = resolveHeroTextBlockFieldType(path);
  if (heroTextBlock) return heroTextBlock;

  const heroLogoBlock = resolveHeroLogoBlockFieldType(path);
  if (heroLogoBlock) return heroLogoBlock;

  return undefined;
}

function getConfigAtPath(config: Record<string, unknown>, dotPath: string): unknown {
  let cur: unknown = config;
  for (const part of dotPath.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function syncHeroHeadingTextPathsForSection(
  config: Record<string, unknown>,
  sectionPrefix: string,
  value: string | boolean | number
): void {
  setConfigAtPath(config, `${sectionPrefix}.settings.title`, value);
  setConfigAtPath(config, `${sectionPrefix}.blocks.heading.settings.heading`, value);

  const blocks = getConfigAtPath(config, `${sectionPrefix}.blocks`);
  if (blocks && typeof blocks === 'object' && !Array.isArray(blocks)) {
    for (const blockId of Object.keys(blocks as Record<string, unknown>)) {
      if (!/^heading(?:_\d+)?$/.test(blockId)) continue;
      setConfigAtPath(config, `${sectionPrefix}.blocks.${blockId}.settings.heading`, value);
    }
  }
}

/** Keep hero heading copy in sync between section `title` and block `heading` settings. */
function syncHeroHeadingTextPaths(
  config: Record<string, unknown>,
  path: string,
  value: string | boolean | number
): void {
  const block = path.match(/^(.+)\.blocks\.([^.]+)\.settings\.heading$/);
  if (block) {
    syncHeroHeadingTextPathsForSection(config, block[1]!, value);
    return;
  }
  const title = path.match(/^(.+)\.settings\.title$/);
  if (title) {
    syncHeroHeadingTextPathsForSection(config, title[1]!, value);
  }
}

/** Write a value at a dot path; numeric segments use real arrays when the parent is a list. */
export function setConfigAtPath(
  obj: Record<string, unknown>,
  dotPath: string,
  value: unknown
): void {
  const parts = dotPath.split('.');
  let cur: Record<string, unknown> | unknown[] = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = parts[i + 1];
    const nextIsIndex = /^\d+$/.test(next);

    if (Array.isArray(cur)) {
      const idx = Number(p);
      if (cur[idx] == null || typeof cur[idx] !== 'object') {
        cur[idx] = nextIsIndex ? [] : {};
      }
      cur = cur[idx] as Record<string, unknown>;
      continue;
    }

    const record = cur as Record<string, unknown>;
    if (record[p] == null || typeof record[p] !== 'object') {
      record[p] = nextIsIndex ? [] : {};
    }
    cur = record[p] as Record<string, unknown>;
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    cur[Number(last)] = value;
  } else {
    (cur as Record<string, unknown>)[last] = value;
  }
}

function coerceFieldValue(
  raw: string | boolean | undefined,
  type: string
): string | boolean | number | undefined {
  if (raw === undefined) return undefined;
  const normalized = fieldTypeFromSchema(type);
  if (normalized === 'boolean') {
    if (typeof raw === 'boolean') return raw;
    if (raw === 'false' || raw === '0' || raw === '') return false;
    return raw === 'true' || raw === '1';
  }
  if (normalized === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  return String(raw);
}

/** Merge sidebar `values` into a full theme config (used for preview + save). */
export function applyValuesToThemeConfig(
  baseConfig: Record<string, unknown>,
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc
): Record<string, unknown> {
  const config = JSON.parse(JSON.stringify(baseConfig)) as Record<string, unknown>;
  const typeByPath = new Map(
    collectEditableFieldPaths(schema, baseConfig).map((f) => [f.path, f.type])
  );

  for (const [path, raw] of Object.entries(values)) {
    const type = resolveFieldTypeForPath(path, typeByPath);
    if (!type) {
      if (path.endsWith('.enabled')) {
        const coerced = coerceFieldValue(raw, 'boolean');
        if (coerced !== undefined) setConfigAtPath(config, path, coerced);
      }
      continue;
    }
    const coerced = coerceFieldValue(raw, type);
    if (coerced === undefined) continue;
    setConfigAtPath(config, path, coerced);
    if (typeof coerced === 'string') {
      syncHeroHeadingTextPaths(config, path, coerced);
    }
  }

  return config;
}
