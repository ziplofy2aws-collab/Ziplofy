import React, { useMemo } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';
import { ThemeEditorLinkField } from '../../components/theme-editor/ThemeEditorLinkField';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import {
  groupHeroButtonPanelFields,
  HERO_BUTTON_PANEL_GROUP_ORDER,
  heroButtonWidthModeField,
  pickHeroButtonPanelField,
  prepareHeroButtonSettingsNode,
  resolveHeroButtonCustomWidthField,
} from './theme-editor-hero-button-panel.utils';

function HeroButtonLabelFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-gray-800">
          {field.label}
        </label>
        <button
          type="button"
          title="Connect dynamic source"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      <input
        id={id}
        type="text"
        value={fieldValueAsString(values, field)}
        onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
        className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      />
    </div>
  );
}

function HeroButtonLinkFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <ThemeEditorLinkField
      id={fieldInputId(field.path)}
      label={field.label}
      value={fieldValueAsString(values, field)}
      placeholder={field.placeholder ?? 'Paste a link or search'}
      onChange={(next) => onFieldChange(field.path, 'text', next)}
      showOpenLink
      showDynamicSource
    />
  );
}

function HeroButtonToggleFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const checked = Boolean(values[field.path]);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onFieldChange(field.path, 'boolean', !checked)}
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#303030]' : 'bg-[#c9cccf]'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function HeroButtonStyleFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || '';

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <select
        value={current}
        onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
        className="min-w-[140px] appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      >
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function HeroButtonWidthModeFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || 'fit';
  const changeType = fieldTypeFromSchema(field.type);

  const handleChange = (value: string) => {
    onFieldChange(field.path, changeType, value);
    if (value === 'custom') {
      const customKey =
        field.path.endsWith('desktopWidth') ? 'desktopCustomWidth' : 'mobileCustomWidth';
      const customPath = field.path.replace(/\.(?:desktop|mobile)Width$/, `.${customKey}`);
      const cur = values[customPath];
      if (cur === undefined || cur === '' || cur === null) {
        onFieldChange(customPath, 'number', '100');
      }
    }
  };

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="inline-flex rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleChange(opt.value)}
            className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
              current === opt.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function buttonPercentValue(
  values: Record<string, string | boolean>,
  field: EditorFieldDef
): number {
  const min = field.min ?? 1;
  const max = field.max ?? 100;
  const raw = values[field.path];
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 100;
  return Math.min(max, Math.max(min, n));
}

function HeroButtonCustomWidthFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const min = field.min ?? 1;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const current = buttonPercentValue(values, field);
  const id = fieldInputId(field.path);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
          className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
        />
        <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
            aria-label={field.label}
          />
          <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
}

function HeroButtonSizeSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const desktopWidthRaw = pickHeroButtonPanelField(fields, 'desktopWidth');
  const mobileWidthRaw = pickHeroButtonPanelField(fields, 'mobileWidth');
  const desktopWidth = heroButtonWidthModeField(desktopWidthRaw);
  const mobileWidth = heroButtonWidthModeField(mobileWidthRaw);
  const desktopCustom = resolveHeroButtonCustomWidthField(fields, desktopWidthRaw, 'desktopCustomWidth');
  const mobileCustom = resolveHeroButtonCustomWidthField(fields, mobileWidthRaw, 'mobileCustomWidth');

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
              field={desktopWidth}
              values={values}
              onFieldChange={onFieldChange}
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
              field={mobileWidth}
              values={values}
              onFieldChange={onFieldChange}
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

/** Shopify-order hero button panel: Label → Link → New tab → Style → Size. */
export function HeroButtonSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = useMemo(
    () => prepareHeroButtonSettingsNode({ id: '', label: 'Button', kind: 'block', fields }),
    [fields]
  );
  const grouped = useMemo(() => groupHeroButtonPanelFields(prepared.fields ?? []), [prepared.fields]);

  const labelField = pickHeroButtonPanelField(prepared.fields ?? [], 'label');
  const hrefField = pickHeroButtonPanelField(prepared.fields ?? [], 'href');
  const openTabField = pickHeroButtonPanelField(prepared.fields ?? [], 'openInNewTab');
  const styleField = pickHeroButtonPanelField(prepared.fields ?? [], 'buttonStyle');
  const hasSizeFields = (grouped.get('Size') ?? []).some((f) => {
    const key = f.path.split('.').pop() ?? '';
    return key === 'desktopWidth' || key === 'mobileWidth';
  });

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-0.5 px-1 py-3">
        {labelField ? (
          <HeroButtonLabelFieldRow field={labelField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {hrefField ? (
          <HeroButtonLinkFieldRow field={hrefField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {openTabField ? (
          <HeroButtonToggleFieldRow field={openTabField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
      {styleField ? (
        <div className="px-1 py-3">
          <HeroButtonStyleFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : (
        HERO_BUTTON_PANEL_GROUP_ORDER.map((group) => {
          if (group !== 'Appearance') return null;
          const appearanceFields = grouped.get(group);
          return appearanceFields?.length ? (
            <div key={group} className="px-1 py-3 space-y-1">
              {appearanceFields.map((field) => (
                <HeroButtonStyleFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          ) : null;
        })
      )}
      {hasSizeFields ? (
        <HeroButtonSizeSettingsGroup
          fields={prepared.fields ?? []}
          values={values}
          onFieldChange={onFieldChange}
        />
      ) : null}
    </div>
  );
}
