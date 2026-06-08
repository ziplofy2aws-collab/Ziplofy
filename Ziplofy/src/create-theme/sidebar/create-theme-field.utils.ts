import type { EditorFieldDef } from './create-theme-sidebar.types';

export type ThemeEditorFieldType = 'text' | 'textarea' | 'color' | 'boolean' | 'number';

export function fieldTypeFromSchema(type: string): ThemeEditorFieldType {
  if (type === 'textarea') return 'textarea';
  if (type === 'boolean') return 'boolean';
  if (type === 'color') return 'color';
  if (type === 'number') return 'number';
  return 'text';
}

export function fieldInputId(path: string): string {
  return `theme-field-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function fieldValueAsString(
  values: Record<string, string | boolean>,
  field: EditorFieldDef
): string {
  const raw = values[field.path];
  if (raw === undefined || raw === null) return '';
  return String(raw);
}

/** Matches layout + template section setting paths (`sections.{id}.settings.*`). */
export function isSectionSettingsFieldPath(path: string): boolean {
  return /\.sections\.[^.]+\.settings\./.test(path);
}

/** Prefer typed panel fields; fall back to any sidebar-visible section settings field. */
export function filterSidebarSectionPanelFields(
  fields: EditorFieldDef[],
  isPanelField: (field: EditorFieldDef) => boolean
): EditorFieldDef[] {
  const panelFields = fields.filter(isPanelField);
  if (panelFields.length) return panelFields;
  return fields.filter(
    (field) => field.sidebar !== false && isSectionSettingsFieldPath(field.path ?? '')
  );
}
