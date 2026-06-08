import type { EditorSchemaDoc } from '../../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { creatorConfigHasSections } from '../../utils/theme-editor-static-pack';
import {
  extendValuesForTemplateInstance,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';

/** Page types that get a one-time in-memory starter from the theme pack when the template bucket is empty. */
export const PACK_STARTER_TEMPLATE_IDS = new Set(['product']);

export function seedTemplateFromPackIfEmpty(
  config: Record<string, unknown>,
  templateId: string,
  packDefault: Record<string, unknown>
): boolean {
  if (!PACK_STARTER_TEMPLATE_IDS.has(templateId)) return false;
  if (creatorConfigHasSections(config, templateId)) return false;

  const packTemplates = packDefault.templates as
    | Record<string, Record<string, unknown>>
    | undefined;
  const defTpl = packTemplates?.[templateId];
  if (!defTpl || typeof defTpl !== 'object') return false;

  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  templates[templateId] = JSON.parse(JSON.stringify(defTpl)) as Record<string, unknown>;
  const tpl = templates[templateId];
  if (!tpl.sections || typeof tpl.sections !== 'object') tpl.sections = {};
  if (!Array.isArray(tpl.section_order)) tpl.section_order = [];
  return true;
}

/** After seeding, merge sidebar `values` for all sections in the template. */
export function extendValuesForSeededTemplate(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  templateId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const tpl = (
    config.templates as Record<string, { section_order?: string[] }> | undefined
  )?.[templateId];
  const order = Array.isArray(tpl?.section_order) ? tpl.section_order : [];
  let next = { ...values };
  for (const instanceId of order) {
    const blueprint = templateBlueprintKey(instanceId);
    next = extendValuesForTemplateInstance(next, schema, templateId, blueprint, instanceId, config);
  }
  return next;
}
