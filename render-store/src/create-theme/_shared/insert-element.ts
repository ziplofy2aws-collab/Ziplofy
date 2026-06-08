import { templateIdForPage } from '../../utils/theme-editor-insert-section';
import type { ThemePreviewPage } from '../chrome/CreateThemeLivePreview';
import { getCreateThemeElement } from '../registry';
import type { CreateThemeElement, CreateThemeInsertContext, CreateThemeInsertResult } from '../types';
import { appendToLayoutOrder, layoutListKey } from './layout-order';

function newInstanceId(config: Record<string, unknown>, blueprintId: string): string {
  const sections = (config.sections ?? {}) as Record<string, unknown>;
  if (!sections[blueprintId]) return blueprintId;
  let n = 2;
  while (sections[`${blueprintId}_${n}`]) n += 1;
  return `${blueprintId}_${n}`;
}

function newTemplateInstanceId(tplSections: Record<string, unknown>, blueprintId: string): string {
  if (!tplSections[blueprintId]) return blueprintId;
  let n = 2;
  while (tplSections[`${blueprintId}_${n}`]) n += 1;
  return `${blueprintId}_${n}`;
}

function cloneLayoutFromPack(
  packDefault: Record<string, unknown>,
  blueprintId: string,
  instanceId: string,
  sectionType: string
): Record<string, unknown> {
  const defSections = (packDefault.sections ?? {}) as Record<string, Record<string, unknown>>;
  const def = defSections[blueprintId];
  if (def && typeof def === 'object') {
    const clone = JSON.parse(JSON.stringify(def)) as Record<string, unknown>;
    clone.id = instanceId;
    clone.type = sectionType;
    clone.enabled = clone.enabled !== false;
    return clone;
  }
  return {
    id: instanceId,
    type: sectionType,
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
}

function cloneTemplateFromPack(
  packDefault: Record<string, unknown>,
  templateId: string,
  blueprintId: string,
  instanceId: string,
  sectionType: string
): Record<string, unknown> {
  const defTpl = (
    packDefault.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }> | undefined
  )?.[templateId]?.sections?.[blueprintId];
  if (defTpl && typeof defTpl === 'object') {
    const clone = JSON.parse(JSON.stringify(defTpl)) as Record<string, unknown>;
    clone.id = instanceId;
    clone.type = sectionType;
    clone.enabled = clone.enabled !== false;
    return clone;
  }
  return {
    id: instanceId,
    type: sectionType,
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
}

function ensureTemplateInConfig(
  config: Record<string, unknown>,
  templateId: string,
  packDefault: Record<string, unknown>
): Record<string, unknown> {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[templateId]) {
    const defTpl = (
      packDefault.templates as Record<string, Record<string, unknown>> | undefined
    )?.[templateId];
    templates[templateId] = defTpl
      ? (JSON.parse(JSON.stringify(defTpl)) as Record<string, unknown>)
      : { sections: {}, section_order: [] };
  }
  const tpl = templates[templateId];
  if (!tpl.sections || typeof tpl.sections !== 'object') tpl.sections = {};
  if (!Array.isArray(tpl.section_order)) tpl.section_order = [];
  return tpl;
}

function insertIntoTemplateOrder(order: string[], instanceId: string, ctx: CreateThemeInsertContext): string[] {
  const next = [...order];
  const anchorBefore = ctx.beforeNodeId?.match(/^template:[^:]+:(.+)$/)?.[1];
  const anchorAfter = ctx.afterNodeId?.match(/^template:[^:]+:(.+)$/)?.[1];
  if (anchorBefore) {
    const idx = next.indexOf(anchorBefore);
    if (idx >= 0) {
      next.splice(idx, 0, instanceId);
      return next;
    }
  }
  if (anchorAfter) {
    const idx = next.indexOf(anchorAfter);
    if (idx >= 0) {
      next.splice(idx + 1, 0, instanceId);
      return next;
    }
  }
  next.push(instanceId);
  return next;
}

export function insertCreateThemeLayoutSection(
  config: Record<string, unknown>,
  element: CreateThemeElement,
  ctx: CreateThemeInsertContext,
  packDefault: Record<string, unknown>
): CreateThemeInsertResult | null {
  const insert = element.insert;
  if (insert.placement !== 'layout') return null;

  const layoutGroup: 'header' | 'footer' =
    ctx.groupId === 'header' || ctx.groupId === 'footer' ? ctx.groupId : insert.group;

  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const instanceId = newInstanceId(next, insert.blueprintId);
  const section = cloneLayoutFromPack(packDefault, insert.blueprintId, instanceId, insert.sectionType);
  element.applyPreset?.(section);

  const sections = { ...((next.sections ?? {}) as Record<string, unknown>) };
  sections[instanceId] = section;
  next.sections = sections;

  appendToLayoutOrder(next, layoutGroup, instanceId, ctx);

  return {
    config: next,
    instanceId,
    nodeId: `layout:${instanceId}`,
    listKey: layoutListKey(layoutGroup),
  };
}

export function insertCreateThemeTemplateSection(
  config: Record<string, unknown>,
  element: CreateThemeElement,
  ctx: CreateThemeInsertContext,
  packDefault: Record<string, unknown>,
  previewPage: ThemePreviewPage
): CreateThemeInsertResult | null {
  const insert = element.insert;
  if (insert.placement !== 'template') return null;

  const templateId = templateIdForPage(previewPage);
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const tpl = ensureTemplateInConfig(next, templateId, packDefault);
  const tplSections = tpl.sections as Record<string, Record<string, unknown>>;

  const instanceId = newTemplateInstanceId(tplSections, insert.blueprintId);
  const section = cloneTemplateFromPack(
    packDefault,
    templateId,
    insert.blueprintId,
    instanceId,
    insert.sectionType
  );
  element.applyPreset?.(section);
  tplSections[instanceId] = section;
  tpl.section_order = insertIntoTemplateOrder(
    (tpl.section_order as string[]) ?? [],
    instanceId,
    ctx
  );

  return {
    config: next,
    instanceId,
    nodeId: `template:${templateId}:${instanceId}`,
    listKey: `sections:template:${previewPage}`,
  };
}

export function insertCreateThemeElement(
  config: Record<string, unknown>,
  elementId: string,
  ctx: CreateThemeInsertContext,
  packDefault: Record<string, unknown>,
  previewPage: ThemePreviewPage = 'index'
): CreateThemeInsertResult | null {
  const element = getCreateThemeElement(elementId);
  if (!element) return null;
  if (element.insert.placement === 'layout') {
    return insertCreateThemeLayoutSection(config, element, ctx, packDefault);
  }
  if (element.insert.placement === 'template') {
    return insertCreateThemeTemplateSection(config, element, ctx, packDefault, previewPage);
  }
  return null;
}

export function removeCreateThemeLayoutSection(
  config: Record<string, unknown>,
  group: 'header' | 'footer',
  instanceId: string
): Record<string, unknown> {
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const sections = { ...((next.sections ?? {}) as Record<string, unknown>) };
  delete sections[instanceId];
  next.sections = sections;

  const order = (next.layout_order ?? {}) as { header?: string[]; footer?: string[] };
  const key = group === 'header' ? 'header' : 'footer';
  if (Array.isArray(order[key])) {
    order[key] = order[key]!.filter((id) => id !== instanceId);
  }
  next.layout_order = order;
  return next;
}
