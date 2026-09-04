import { setConfigPath } from '@/lib/informatic-theme/load-static-pack';

export type LeadGenFormSelection = {
  _id: string;
  name: string;
};

export function applyLeadFormSelectionToConfig(
  config: Record<string, unknown>,
  formFieldPath: string,
  form: LeadGenFormSelection
): Record<string, unknown> {
  let next = structuredClone(config) as Record<string, unknown>;
  next = setConfigPath(next, formFieldPath, String(form._id));
  next = setConfigPath(next, formFieldPath.replace(/\.formId$/, '.formName'), String(form.name ?? ''));
  return next;
}

export function clearLeadFormSelectionFromConfig(
  config: Record<string, unknown>,
  formFieldPath: string
): Record<string, unknown> {
  let next = structuredClone(config) as Record<string, unknown>;
  next = setConfigPath(next, formFieldPath, '');
  next = setConfigPath(next, formFieldPath.replace(/\.formId$/, '.formName'), '');
  return next;
}

export function leadFormLabelFromValue(
  formValue: string,
  forms: Pick<LeadGenFormSelection, '_id' | 'name'>[]
): string | undefined {
  const trimmed = formValue.trim();
  if (!trimmed) return undefined;
  const match = forms.find((f) => f._id === trimmed);
  return match?.name;
}

export function isLeadFormFieldPath(path: string): boolean {
  return /\.settings\.formId$/.test(path);
}
