import React, { useMemo } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { ThemePaletteColorField } from '../settings/ThemePaletteColorField';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import {
  HeroButtonCustomWidthFieldRow,
  HeroButtonLabelFieldRow,
  HeroButtonToggleFieldRow,
  HeroButtonWidthModeFieldRow,
} from './theme-editor-hero-button-settings-panel';
import {
  filterViewAllButtonPanelFieldsForStyle,
  pickViewAllButtonPanelField,
  prepareViewAllButtonSettingsNode,
  resolveViewAllButtonColorField,
  resolveViewAllButtonCustomWidthField,
  VIEW_ALL_STYLE_OPTIONS,
  viewAllButtonWidthModeField,
} from './theme-editor-fc-view-all-button-panel.utils';

function ViewAllButtonVisibilityNote() {
  return (
    <div className="flex items-center gap-2 border-b border-[#e1e1e1] px-1 py-3 text-[13px] text-gray-600">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-gray-400">
        <EyeIcon className="h-3.5 w-3.5 text-gray-500" />
      </span>
      Visible if collection has more products than shown
    </div>
  );
}

function ViewAllButtonStyleFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || 'link';

  return (
    <div className="py-1">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="min-w-[140px] appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {(field.options ?? VIEW_ALL_STYLE_OPTIONS).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[12px] text-gray-500">
        Edit primary and secondary button styles in{' '}
        <a href="/settings/theme" className="text-[#005bd3] hover:underline">
          theme settings
        </a>
      </p>
    </div>
  );
}

function viewAllLinkColorEditorValue(raw: string): string {
  if (raw === 'default' || !raw.trim()) return 'palette';
  if (raw === 'palette' || /^palette:\d+$/.test(raw) || raw.startsWith('#')) return raw;
  return 'palette';
}

function ViewAllLinkTextColorFieldRow({
  field,
  values,
  colorPalette,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const raw = fieldValueAsString(values, field) || 'default';
  const isDefault = raw === 'default' || !raw.trim();
  const id = fieldInputId(field.path);

  if (isDefault) {
    return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
        <span className="text-[13px] text-gray-800">Link text color</span>
        <button
          id={id}
          type="button"
          onClick={() => onFieldChange(field.path, 'text', 'palette:2')}
          className="flex min-w-[148px] max-w-[180px] items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-2.5 py-2 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9]"
        >
          <span
            className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md border border-[#e1e3e5] bg-white"
            aria-hidden
          >
            <span className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_46%,#e11d48_46%,#e11d48_54%,transparent_54%)]" />
          </span>
          <span className="truncate">Default</span>
        </button>
      </div>
    );
  }

  return (
    <ThemePaletteColorField
      label="Link text color"
      path={field.path}
      values={{ ...values, [field.path]: viewAllLinkColorEditorValue(raw) }}
      colorPalette={colorPalette}
      defaultPaletteIndex={2}
      fallbackColor="#2563eb"
      onFieldChange={(path, type, value) => {
        onFieldChange(path, type, value);
      }}
    />
  );
}

function viewAllPaletteColorValue(raw: string, defaultIndex: number): string {
  if (raw === 'palette' || /^palette:\d+$/.test(raw) || raw.startsWith('#')) return raw;
  return `palette:${defaultIndex}`;
}

function ViewAllButtonCustomColorsSettingsGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const styleField = pickViewAllButtonPanelField(fields, 'viewAllStyle');
  const settingsBase =
    styleField?.path.replace(/\.viewAllStyle$/, '') ?? '';

  const backgroundField = resolveViewAllButtonColorField(
    'viewAllCustomBackgroundColor',
    settingsBase,
    fields,
    'Background'
  );
  const textField = resolveViewAllButtonColorField(
    'viewAllCustomTextColor',
    settingsBase,
    fields,
    'Text'
  );
  const borderField = resolveViewAllButtonColorField(
    'viewAllCustomBorderColor',
    settingsBase,
    fields,
    'Borders'
  );

  const colorFields = [
    { field: backgroundField, paletteIndex: 0, fallback: '#111827' },
    { field: textField, paletteIndex: 1, fallback: '#ffffff' },
    { field: borderField, paletteIndex: 1, fallback: '#ffffff' },
  ] as const;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Button colors</h3>
      <div className="space-y-1">
        {colorFields.map(({ field, paletteIndex, fallback }) => {
          const raw = fieldValueAsString(values, field) || `palette:${paletteIndex}`;
          return (
            <ThemePaletteColorField
              key={field.path}
              label={field.label ?? 'Color'}
              path={field.path}
              values={{
                ...values,
                [field.path]: viewAllPaletteColorValue(raw, paletteIndex),
              }}
              colorPalette={colorPalette}
              defaultPaletteIndex={paletteIndex}
              fallbackColor={fallback}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function ViewAllButtonSizeSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const desktopWidthRaw = pickViewAllButtonPanelField(fields, 'viewAllDesktopWidth');
  const mobileWidthRaw = pickViewAllButtonPanelField(fields, 'viewAllMobileWidth');
  const desktopWidth = viewAllButtonWidthModeField(desktopWidthRaw);
  const mobileWidth = viewAllButtonWidthModeField(mobileWidthRaw);
  const desktopCustom = resolveViewAllButtonCustomWidthField(
    fields,
    desktopWidthRaw,
    'viewAllDesktopCustomWidth'
  );
  const mobileCustom = resolveViewAllButtonCustomWidthField(
    fields,
    mobileWidthRaw,
    'viewAllMobileCustomWidth'
  );

  const desktopMode = desktopWidth ? fieldValueAsString(values, desktopWidth) || 'fit' : 'fit';
  const mobileMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';

  if (!desktopWidth && !mobileWidth) return null;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
      <div className="space-y-1">
        {desktopWidth ? (
          <>
            <HeroButtonWidthModeFieldRow
              field={{
                ...desktopWidth,
                label: 'Desktop width',
                path: desktopWidth.path,
              }}
              values={values}
              onFieldChange={(path, type, value) => {
                onFieldChange(path, type, value);
                if (value === 'custom') {
                  const customPath = path.replace(/\.viewAllDesktopWidth$/, '.viewAllDesktopCustomWidth');
                  const cur = values[customPath];
                  if (cur === undefined || cur === '' || cur === null) {
                    onFieldChange(customPath, 'number', '100');
                  }
                }
              }}
            />
            {desktopMode === 'custom' && desktopCustom ? (
              <HeroButtonCustomWidthFieldRow
                field={desktopCustom}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </>
        ) : null}
        {mobileWidth ? (
          <>
            <HeroButtonWidthModeFieldRow
              field={{
                ...mobileWidth,
                label: 'Mobile width',
                path: mobileWidth.path,
              }}
              values={values}
              onFieldChange={(path, type, value) => {
                onFieldChange(path, type, value);
                if (value === 'custom') {
                  const customPath = path.replace(/\.viewAllMobileWidth$/, '.viewAllMobileCustomWidth');
                  const cur = values[customPath];
                  if (cur === undefined || cur === '' || cur === null) {
                    onFieldChange(customPath, 'number', '100');
                  }
                }
              }}
            />
            {mobileMode === 'custom' && mobileCustom ? (
              <HeroButtonCustomWidthFieldRow
                field={mobileCustom}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

/** Featured collection — Header → View all button (Shopify order). */
export function ViewAllButtonSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const prepared = useMemo(() => {
    const filtered = filterViewAllButtonPanelFieldsForStyle(fields, values);
    return prepareViewAllButtonSettingsNode({
      id: '',
      label: 'View all button',
      kind: 'block',
      fields: filtered,
    });
  }, [fields, values]);
  const panelFields = prepared.fields ?? [];

  const labelField = pickViewAllButtonPanelField(panelFields, 'viewAllLabel');
  const openTabField = pickViewAllButtonPanelField(panelFields, 'viewAllOpenInNewTab');
  const styleFieldRaw = pickViewAllButtonPanelField(fields, 'viewAllStyle');
  const settingsBase = styleFieldRaw?.path.replace(/\.viewAllStyle$/, '') ?? '';
  const styleField = styleFieldRaw
    ? {
        ...styleFieldRaw,
        options: [...VIEW_ALL_STYLE_OPTIONS],
        description: 'Edit primary and secondary button styles in theme settings',
      }
    : null;
  const linkColorField =
    pickViewAllButtonPanelField(fields, 'viewAllLinkTextColor') ??
    (settingsBase
      ? resolveViewAllButtonColorField(
          'viewAllLinkTextColor',
          settingsBase,
          fields,
          'Link text color'
        )
      : undefined);
  const styleMode = styleField ? fieldValueAsString(values, styleField) || 'link' : 'link';
  const showLinkColor = styleMode === 'link';
  const showCustomColors = styleMode === 'custom';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <ViewAllButtonVisibilityNote />
      <div className="space-y-0.5 px-1 py-3">
        {labelField ? (
          <HeroButtonLabelFieldRow field={labelField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {openTabField ? (
          <HeroButtonToggleFieldRow field={openTabField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
      {styleField ? (
        <div className="px-1 py-3">
          <ViewAllButtonStyleFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
          {showLinkColor && linkColorField ? (
            <ViewAllLinkTextColorFieldRow
              field={linkColorField}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          ) : null}
        </div>
      ) : null}
      {showCustomColors ? (
        <ViewAllButtonCustomColorsSettingsGroup
          fields={fields}
          values={values}
          colorPalette={colorPalette}
          onFieldChange={onFieldChange}
        />
      ) : null}
      <ViewAllButtonSizeSettingsGroup
        fields={panelFields}
        values={values}
        onFieldChange={onFieldChange}
      />
    </div>
  );
}
