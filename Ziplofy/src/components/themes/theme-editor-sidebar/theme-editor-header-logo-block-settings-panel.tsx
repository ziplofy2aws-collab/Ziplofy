import React from 'react';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import { fieldInputId, type ThemeEditorFieldType } from './theme-editor-field.utils';
import { pickHeaderLogoBlockField } from './theme-editor-header-logo-block-panel.utils';

function numValue(values: Record<string, string | boolean>, field: EditorFieldDef, fallback: number): number {
  const raw = values[field.path];
  if (typeof raw === 'number') return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function LogoSliderFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const current = numValue(values, field, min);
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
          {field.unit ? (
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">{field.unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LogoToggleFieldRow({
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
    <div className="py-1">
      <div className="flex items-center justify-between gap-3">
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
      {field.description ? (
        <p className="mt-1.5 text-[12px] leading-snug text-gray-500">{field.description}</p>
      ) : null}
    </div>
  );
}

/** Shopify header logo block: theme settings link → Visibility → Desktop padding. */
export function HeaderLogoBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const hideField = pickHeaderLogoBlockField(fields, 'hideLogoOnHomePage');
  const paddingTop = pickHeaderLogoBlockField(fields, 'paddingTop');
  const paddingBottom = pickHeaderLogoBlockField(fields, 'paddingBottom');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="px-1 py-3">
        <p className="text-[12px] text-gray-500">
          Edit logo in{' '}
          <button
            type="button"
            className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
            onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
          >
            theme settings
          </button>
        </p>
      </div>

      {hideField ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Visibility</h3>
          <LogoToggleFieldRow field={hideField} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}

      {paddingTop || paddingBottom ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Desktop padding</h3>
          <div className="space-y-1">
            {paddingTop ? (
              <LogoSliderFieldRow field={paddingTop} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {paddingBottom ? (
              <LogoSliderFieldRow field={paddingBottom} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
