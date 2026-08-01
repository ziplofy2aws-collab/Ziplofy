import type { ReactNode } from 'react';
import { ThemeFontPickerField } from '../../../create-theme/settings/ThemeFontPickerField';
import type { ThemeEditorFieldType } from './theme-editor-field.utils';

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_minmax(0,1.2fr)] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Catalog typography: font roles only (body / subheading / heading / accent). */
export function CatalogTypographySettingsPanel({
  values,
  onFieldChange,
}: {
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Fonts</h3>
      <SettingRow label="Body">
        <ThemeFontPickerField role="body" values={values} onFieldChange={onFieldChange} />
      </SettingRow>
      <SettingRow label="Subheading">
        <ThemeFontPickerField role="subheading" values={values} onFieldChange={onFieldChange} />
      </SettingRow>
      <SettingRow label="Heading">
        <ThemeFontPickerField role="heading" values={values} onFieldChange={onFieldChange} />
      </SettingRow>
      <SettingRow label="Accent">
        <ThemeFontPickerField role="accent" values={values} onFieldChange={onFieldChange} />
      </SettingRow>
    </div>
  );
}
