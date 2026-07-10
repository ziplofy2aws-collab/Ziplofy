import type { EditorFieldDef } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { layoutBlueprintKey } from '../utils/theme-editor-insert-section';
import catalogJson from './section-editing-support.json';
import type {
  EditingFieldDef,
  EditingPanelRule,
  EditingSelectionContext,
  ResolvedEditingPanel,
  SectionEditingSupportCatalog,
} from './section-editing-support.types';

export const sectionEditingSupport = catalogJson as SectionEditingSupportCatalog;

export function getSectionEditingSupport(sectionType: string) {
  return sectionEditingSupport.sectionTypes[sectionType] ?? null;
}

export function listSectionTypes(): string[] {
  return Object.keys(sectionEditingSupport.sectionTypes);
}

/** Parse sidebar / preview node id into catalog lookup context. */
export function parseEditingSelectionContext(nodeId: string): EditingSelectionContext | null {
  const layoutSection = nodeId.match(
    /^layout:(announcement_bar(?:_\d+)?|header(?:_\d+)?|hero_main(?:_\d+)?|divider(?:_\d+)?|footer(?:_\d+)?|footer_utilities(?:_\d+)?)$/
  );
  if (layoutSection) {
    const instanceId = layoutSection[1];
    const blueprint = layoutBlueprintKey(instanceId);
    const sectionType = LAYOUT_BLUEPRINT_TO_TYPE[blueprint] ?? blueprint;
    return {
      sectionType,
      placement: 'layout',
      sectionInstanceId: instanceId,
      panelId: 'default',
      label: sectionEditingSupport.sectionTypes[sectionType]?.label ?? blueprint,
      kind: 'section',
    };
  }

  const layoutBlock = nodeId.match(
    /^layout:(announcement_bar(?:_\d+)?|header(?:_\d+)?|hero_main(?:_\d+)?|divider(?:_\d+)?|footer(?:_\d+)?|footer_utilities(?:_\d+)?):block:([^:]+)$/
  );
  if (layoutBlock) {
    const instanceId = layoutBlock[1];
    const blockId = layoutBlock[2];
    const blueprint = layoutBlueprintKey(instanceId);
    const sectionType = LAYOUT_BLUEPRINT_TO_TYPE[blueprint] ?? blueprint;
    const catalogBlockId =
      sectionType === 'announcement-bar' && /^announcement(_\d+)?$/.test(blockId)
        ? 'announcement'
        : blockId;
    const block = sectionEditingSupport.sectionTypes[sectionType]?.blocks?.[catalogBlockId];
    return {
      sectionType,
      placement: 'layout',
      sectionInstanceId: instanceId,
      blockId,
      panelId: 'default',
      label: block?.label ?? blockId,
      kind: 'block',
    };
  }

  const tplNested = nodeId.match(
    /^template:([^:]+):(featured_collection(?:_\d+)?|hero_main(?:_\d+)?):block:([^:]+):nested:(.+)$/
  );
  if (tplNested) {
    const [, templateId, sectionInstanceId, blockId, nestedBlockId] = tplNested;
    const sectionType = sectionInstanceId.startsWith('featured_collection')
      ? 'featured-collection'
      : 'hero';
    const nested =
      sectionEditingSupport.sectionTypes[sectionType]?.blocks?.[blockId]?.nested?.[nestedBlockId];
    return {
      sectionType,
      placement: 'template',
      templateId,
      sectionInstanceId,
      blockId,
      nestedBlockId,
      panelId: nestedBlockId in (sectionEditingSupport.sectionTypes[sectionType]?.blocks?.[blockId]?.nested ?? {})
        ? 'default'
        : 'default',
      label: nested?.label ?? nestedBlockId,
      kind: 'block',
    };
  }

  const tplBlock = nodeId.match(
    /^template:([^:]+):(featured_collection(?:_\d+)?|hero_main(?:_\d+)?):block:(.+)$/
  );
  if (tplBlock) {
    const [, templateId, sectionInstanceId, blockId] = tplBlock;
    const sectionType = sectionInstanceId.startsWith('featured_collection')
      ? 'featured-collection'
      : blockId.includes('button')
        ? 'hero'
        : 'hero';
    if (sectionInstanceId.startsWith('featured_collection')) {
      const block = sectionEditingSupport.sectionTypes['featured-collection']?.blocks?.[blockId];
      return {
        sectionType: 'featured-collection',
        placement: 'template',
        templateId,
        sectionInstanceId,
        blockId,
        panelId: 'default',
        label: block?.label ?? blockId,
        kind: 'block',
      };
    }
    const block = sectionEditingSupport.sectionTypes.hero?.blocks?.[blockId];
    return {
      sectionType: 'hero',
      placement: 'template',
      templateId,
      sectionInstanceId,
      blockId,
      panelId: 'default',
      label: block?.label ?? blockId,
      kind: 'block',
    };
  }

  const tplSection = nodeId.match(
    /^template:([^:]+):(featured_collection(?:_\d+)?|hero_main(?:_\d+)?|divider(?:_\d+)?)$/
  );
  if (tplSection) {
    const [, templateId, sectionInstanceId] = tplSection;
    const sectionType = sectionInstanceId.startsWith('featured_collection')
      ? 'featured-collection'
      : sectionInstanceId.startsWith('divider')
        ? 'divider'
        : 'hero';
    return {
      sectionType,
      placement: 'template',
      templateId,
      sectionInstanceId,
      panelId: 'default',
      label: sectionEditingSupport.sectionTypes[sectionType]?.label ?? sectionType,
      kind: 'section',
    };
  }

  const fieldLayoutBlock = nodeId.match(
    /^field:sections\.(footer(?:_\d+)?|footer_utilities(?:_\d+)?)\.blocks\.([^:]+)\./
  );
  if (fieldLayoutBlock) {
    return parseEditingSelectionContext(`layout:${fieldLayoutBlock[1]}:block:${fieldLayoutBlock[2]}`);
  }

  const fieldLayout = nodeId.match(/^field:sections\.(announcement_bar(?:_\d+)?|header(?:_\d+)?|footer(?:_\d+)?|footer_utilities(?:_\d+)?)\./);
  if (fieldLayout) {
    return parseEditingSelectionContext(`layout:${fieldLayout[1]}`);
  }

  const fieldTpl = nodeId.match(
    /^field:templates\.([^:]+)\.sections\.(featured_collection(?:_\d+)?|hero_main(?:_\d+)?|divider(?:_\d+)?)\./
  );
  if (fieldTpl) {
    return parseEditingSelectionContext(`template:${fieldTpl[1]}:${fieldTpl[2]}`);
  }

  return null;
}

const LAYOUT_BLUEPRINT_TO_TYPE: Record<string, string> = {
  announcement_bar: 'announcement-bar',
  header: 'header',
  hero_main: 'hero',
  divider: 'divider',
  footer: 'footer',
  footer_utilities: 'footer-utilities',
};

function isHeroHeadingBlockId(blockId: string | undefined): boolean {
  return blockId === 'heading' || Boolean(blockId?.startsWith('heading_'));
}

function settingsPathPrefix(ctx: EditingSelectionContext): string {
  if (ctx.placement === 'layout') {
    if (ctx.nestedBlockId && ctx.blockId) {
      return `sections.${ctx.sectionInstanceId}.blocks.${ctx.blockId}.settings`;
    }
    if (ctx.blockId) {
      if (ctx.sectionType === 'hero' && isHeroHeadingBlockId(ctx.blockId)) {
        return `sections.${ctx.sectionInstanceId}.settings`;
      }
      return `sections.${ctx.sectionInstanceId}.blocks.${ctx.blockId}.settings`;
    }
    return `sections.${ctx.sectionInstanceId}.settings`;
  }
  const tpl = ctx.templateId ?? 'index';
  const sec = ctx.sectionInstanceId;
  if (ctx.blockId) {
    if (ctx.sectionType === 'hero' && isHeroHeadingBlockId(ctx.blockId)) {
      return `templates.${tpl}.sections.${sec}.settings`;
    }
    return `templates.${tpl}.sections.${sec}.blocks.${ctx.blockId}.settings`;
  }
  return `templates.${tpl}.sections.${sec}.settings`;
}

function materializeField(def: EditingFieldDef, ctx: EditingSelectionContext): EditorFieldDef {
  const { key, ...rest } = def;
  return {
    ...rest,
    path: `${settingsPathPrefix(ctx)}.${key}`,
  };
}

function normalizePanelRule(rule: EditingPanelRule | { default?: EditingPanelRule }): EditingPanelRule {
  const r = rule as EditingPanelRule & { default?: EditingPanelRule };
  if (
    r?.default &&
    !r.includeKeys &&
    !r.includeGroups &&
    !r.excludeKeys &&
    !r.excludeGroups &&
    !r.fieldOrder
  ) {
    return r.default;
  }
  return r;
}

function applyPanelRule(fields: EditingFieldDef[], rule: EditingPanelRule): EditingFieldDef[] {
  let out = fields;
  if (rule.includeKeys?.length) {
    const set = new Set(rule.includeKeys);
    out = out.filter((f) => set.has(f.key));
  }
  if (rule.excludeKeys?.length) {
    const set = new Set(rule.excludeKeys);
    out = out.filter((f) => !set.has(f.key));
  }
  if (rule.includeGroups?.length) {
    const set = new Set(rule.includeGroups);
    out = out.filter((f) => f.group && set.has(f.group));
  }
  if (rule.excludeGroups?.length) {
    const set = new Set(rule.excludeGroups);
    out = out.filter((f) => !f.group || !set.has(f.group));
  }
  if (rule.fieldOrder?.length) {
    const rank = new Map(rule.fieldOrder.map((k, i) => [k, i]));
    out = [...out].sort((a, b) => (rank.get(a.key) ?? 99) - (rank.get(b.key) ?? 99));
  }
  return out;
}

function resolvePanelId(ctx: EditingSelectionContext): string {
  if (ctx.nestedBlockId && ctx.blockId) {
    const nested =
      sectionEditingSupport.sectionTypes[ctx.sectionType]?.blocks?.[ctx.blockId]?.nested?.[
        ctx.nestedBlockId
      ];
    if (nested?.panels?.default) return 'default';
    if (ctx.blockId === 'product_card') {
      if (ctx.nestedBlockId === 'media') return 'default';
      if (ctx.nestedBlockId === 'product_title') return 'default';
      if (ctx.nestedBlockId === 'price') return 'default';
    }
    return 'default';
  }
  if (ctx.blockId === 'product_card' && !ctx.nestedBlockId) return 'default';
  return ctx.panelId || 'default';
}

/** Resolve editor panel fields from the global section-editing-support catalog. */
export function resolveEditingPanelFromCatalog(nodeId: string): ResolvedEditingPanel | null {
  const ctx = parseEditingSelectionContext(nodeId);
  if (!ctx) return null;

  const section = sectionEditingSupport.sectionTypes[ctx.sectionType];
  if (!section) return null;

  let sourceFields: EditingFieldDef[] = section.fields;
  let panels: Record<string, EditingPanelRule> = section.panels;
  let label = ctx.label;
  let kind = ctx.kind;

  if (ctx.blockId) {
    const catalogBlockId =
      ctx.sectionType === 'announcement-bar' && /^announcement(_\d+)?$/.test(ctx.blockId)
        ? 'announcement'
        : ctx.blockId;
    const block = section.blocks?.[catalogBlockId];
    if (!block) return null;
    label = block.label;
    kind = 'block';

    if (ctx.nestedBlockId) {
      const nested = block.nested?.[ctx.nestedBlockId];
      if (!nested) return null;
      sourceFields = nested.fields;
      panels = nested.panels;
      label = nested.label;
    } else {
      sourceFields = block.fields;
      panels = block.panels;
    }
  }

  const panelId = resolvePanelId(ctx);
  const rawRule = panels[panelId] ?? panels.default;
  if (!rawRule) return null;
  const rule = normalizePanelRule(rawRule);

  const filtered = applyPanelRule(sourceFields, rule);
  if (!filtered.length) return null;

  const fields = filtered.map((f) => materializeField(f, ctx));
  return { context: { ...ctx, panelId, label, kind }, fields, label, kind };
}

/** Map product_card nested selection to the correct nested panel (media / title / price). */
export function resolveEditingPanelForNode(nodeId: string): ResolvedEditingPanel | null {
  const nestedProduct = nodeId.match(
    /^template:[^:]+:featured_collection(?:_\d+)?:block:product_card:nested:(media|product_title|price)$/
  );
  if (nestedProduct) {
    const nestedId = nestedProduct[1];
    const ctx = parseEditingSelectionContext(nodeId);
    if (!ctx) return null;
    const section = sectionEditingSupport.sectionTypes['featured-collection'];
    const nested = section?.blocks?.product_card?.nested?.[nestedId];
    const rawRule = nested?.panels?.default;
    if (!nested || !rawRule) return null;
    const filtered = applyPanelRule(nested.fields, normalizePanelRule(rawRule));
    const fields = filtered.map((f) => materializeField(f, { ...ctx, nestedBlockId: nestedId }));
    return {
      context: { ...ctx, nestedBlockId: nestedId, label: nested.label, kind: 'block' },
      fields,
      label: nested.label,
      kind: 'block',
    };
  }

  const collectionTitle = nodeId.match(
    /^template:[^:]+:featured_collection(?:_\d+)?:block:collection_header:nested:collection_title$/
  );
  if (collectionTitle) {
    const ctx = parseEditingSelectionContext(nodeId);
    if (!ctx) return null;
    const nested = sectionEditingSupport.sectionTypes['featured-collection']?.blocks?.collection_header
      ?.nested?.collection_title;
    const rawRule = nested?.panels?.default;
    if (!nested || !rawRule) return null;
    const filtered = applyPanelRule(nested.fields, normalizePanelRule(rawRule));
    const fields = filtered.map((f) => materializeField(f, { ...ctx, nestedBlockId: 'collection_title' }));
    return { fields, label: nested.label, kind: 'block', context: ctx };
  }

  const viewAll = nodeId.match(
    /^template:[^:]+:featured_collection(?:_\d+)?:block:collection_header:nested:view_all_button$/
  );
  if (viewAll) {
    const ctx = parseEditingSelectionContext(nodeId);
    if (!ctx) return null;
    const nested = sectionEditingSupport.sectionTypes['featured-collection']?.blocks?.collection_header
      ?.nested?.view_all_button;
    const rawRule = nested?.panels?.default;
    if (!nested || !rawRule) return null;
    const filtered = applyPanelRule(nested.fields, normalizePanelRule(rawRule));
    const fields = filtered.map((f) => materializeField(f, { ...ctx, nestedBlockId: 'view_all_button' }));
    return { fields, label: nested.label, kind: 'block', context: ctx };
  }

  return resolveEditingPanelFromCatalog(nodeId);
}
