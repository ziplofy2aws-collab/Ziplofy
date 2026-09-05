import { getConfigPath, setConfigPath } from '@/lib/informatic-theme/load-static-pack';
import type { EditorFieldDef, InformaticThemeSchema } from '@/lib/informatic-theme/load-static-pack';

export const LEAD_GEN_FORM_SECTION_TYPE = 'lead-gen-form';

export type SectionCatalogEntry = {
  type: string;
  label?: string;
  insertable?: boolean;
  settingsFields?: Array<
    EditorFieldDef & {
      pathSuffix?: string;
    }
  >;
};

export const DEFAULT_LEAD_GEN_FORM_SETTINGS = {
  formId: '',
  formName: '',
  heading: 'Get in touch',
  subheading: 'Fill out the form below — we usually reply within one business day.',
  primaryLabel: 'Submit',
  backgroundColor: '',
  textColor: '',
  primaryCtaBackground: '#2563eb',
  primaryCtaText: '#ffffff',
  primaryCtaBorder: '#2563eb',
  primaryCtaBorderThickness: 0,
  primaryCtaCornerRadius: 10,
  primaryCtaFont: 'body',
  primaryCtaTextCase: 'default',
} as const;

export function sectionConfigPrefix(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

export function getTemplateSectionOrder(
  config: Record<string, unknown>,
  templateId: string
): string[] {
  const order = getConfigPath(config, `templates.${templateId}.section_order`);
  return Array.isArray(order) ? order.filter((id) => typeof id === 'string' && id.trim()) : [];
}

export function getTemplateSectionType(
  config: Record<string, unknown>,
  templateId: string,
  sectionId: string
): string {
  const section = getConfigPath(config, `${sectionConfigPrefix(templateId, sectionId)}`) as
    | { type?: string; enabled?: boolean }
    | undefined;
  return String(section?.type ?? '').trim();
}

export function isTemplateSectionEnabled(
  config: Record<string, unknown>,
  templateId: string,
  sectionId: string
): boolean {
  const section = getConfigPath(config, `${sectionConfigPrefix(templateId, sectionId)}`) as
    | { enabled?: boolean }
    | undefined;
  return section?.enabled !== false;
}

function catalogForType(schema: InformaticThemeSchema | null | undefined, type: string) {
  const catalog = (schema?.sectionCatalog || []) as SectionCatalogEntry[];
  return catalog.find((entry) => entry.type === type);
}

export function remapCatalogSettingsFields(
  fields: SectionCatalogEntry['settingsFields'],
  templateId: string,
  sectionId: string
): EditorFieldDef[] {
  const prefix = sectionConfigPrefix(templateId, sectionId);
  return (fields || [])
    .filter((field) => field.path || field.pathSuffix)
    .map((field) => {
      const path = field.path || `${prefix}.${field.pathSuffix}`;
      const { pathSuffix, ...rest } = field;
      void pathSuffix;
      return { ...rest, path } as EditorFieldDef;
    });
}

export type TemplateSectionEditorMeta = {
  id: string;
  type: string;
  label: string;
  settingsFields: EditorFieldDef[];
  blocks: Array<{ id: string; label?: string; settingsFields?: EditorFieldDef[] }>;
  insertable: boolean;
  enabled: boolean;
};

export function listTemplateSectionsForEditor(
  config: Record<string, unknown>,
  schema: InformaticThemeSchema | null | undefined,
  templateId: string
): TemplateSectionEditorMeta[] {
  const order = getTemplateSectionOrder(config, templateId);
  const schemaTemplate = schema?.templates?.find((t) => t.id === templateId);

  return order.map((sectionId) => {
    const type = getTemplateSectionType(config, templateId, sectionId);
    const schemaSection = schemaTemplate?.sections?.find((s) => s.id === sectionId);
    const catalogEntry = catalogForType(schema, type);

    const settingsFields =
      schemaSection?.settingsFields?.length
        ? schemaSection.settingsFields
        : remapCatalogSettingsFields(catalogEntry?.settingsFields, templateId, sectionId);

    return {
      id: sectionId,
      type,
      label: schemaSection?.label || catalogEntry?.label || sectionId,
      settingsFields,
      blocks: schemaSection?.blocks || [],
      insertable: Boolean(catalogEntry?.insertable),
      enabled: isTemplateSectionEnabled(config, templateId, sectionId),
    };
  });
}

export function resolveSectionSettingsFields(
  config: Record<string, unknown>,
  schema: InformaticThemeSchema | null | undefined,
  templateId: string,
  sectionId: string
): EditorFieldDef[] {
  const sections = listTemplateSectionsForEditor(config, schema, templateId);
  return sections.find((s) => s.id === sectionId)?.settingsFields || [];
}

export function listInsertableSectionCatalog(
  schema: InformaticThemeSchema | null | undefined
): SectionCatalogEntry[] {
  return ((schema?.sectionCatalog || []) as SectionCatalogEntry[]).filter((entry) => entry.insertable);
}

export function insertLeadGenFormSection(
  config: Record<string, unknown>,
  templateId: string,
  options?: { afterSectionId?: string | null }
): { config: Record<string, unknown>; sectionId: string } {
  let next = structuredClone(config) as Record<string, unknown>;
  const instanceId = `lead_gen_form_${Date.now().toString(36)}`;
  const sectionsPath = `templates.${templateId}.sections`;
  const orderPath = `templates.${templateId}.section_order`;

  const sections =
    (getConfigPath(next, sectionsPath) as Record<string, unknown> | undefined) || {};
  sections[instanceId] = {
    type: LEAD_GEN_FORM_SECTION_TYPE,
    enabled: true,
    settings: { ...DEFAULT_LEAD_GEN_FORM_SETTINGS },
  };
  next = setConfigPath(next, sectionsPath, sections);

  const order = [...getTemplateSectionOrder(next, templateId)];
  const after = options?.afterSectionId?.trim();
  if (after && order.includes(after)) {
    order.splice(order.indexOf(after) + 1, 0, instanceId);
  } else {
    order.push(instanceId);
  }
  next = setConfigPath(next, orderPath, order);

  return { config: next, sectionId: instanceId };
}

export function insertCatalogSection(
  config: Record<string, unknown>,
  schema: InformaticThemeSchema | null | undefined,
  templateId: string,
  catalogType: string,
  options?: { afterSectionId?: string | null }
): { config: Record<string, unknown>; sectionId: string } | null {
  if (catalogType === LEAD_GEN_FORM_SECTION_TYPE) {
    return insertLeadGenFormSection(config, templateId, options);
  }
  const entry = catalogForType(schema, catalogType);
  if (!entry?.insertable) return null;
  return insertLeadGenFormSection(config, templateId, options);
}

export function removeTemplateSection(
  config: Record<string, unknown>,
  schema: InformaticThemeSchema | null | undefined,
  templateId: string,
  sectionId: string
): Record<string, unknown> | null {
  const type = getTemplateSectionType(config, templateId, sectionId);
  const catalogEntry = catalogForType(schema, type);
  if (!catalogEntry?.insertable) return null;

  let next = structuredClone(config) as Record<string, unknown>;
  const sectionsPath = `templates.${templateId}.sections`;
  const orderPath = `templates.${templateId}.section_order`;

  const sections =
    (getConfigPath(next, sectionsPath) as Record<string, unknown> | undefined) || {};
  delete sections[sectionId];
  next = setConfigPath(next, sectionsPath, sections);

  const order = getTemplateSectionOrder(next, templateId).filter((id) => id !== sectionId);
  next = setConfigPath(next, orderPath, order);

  return next;
}

export function isLeadGenFormSectionType(type: string): boolean {
  return type === LEAD_GEN_FORM_SECTION_TYPE;
}
