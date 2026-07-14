import React, { useEffect, useRef, useState } from 'react';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import { pickHeaderLogoBlockField } from './theme-editor-header-logo-block-panel.utils';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const LOGO_TEXT_DEBOUNCE_MS = 300;

function numValue(values: Record<string, string | boolean>, field: EditorFieldDef, fallback: number): number {
  const raw = values[field.path];
  if (typeof raw === 'number') return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function LogoTextFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const external = fieldValueAsString(values, field);
  const [draft, setDraft] = useState(external);
  const debouncedDraft = useDebouncedValue(draft, LOGO_TEXT_DEBOUNCE_MS);
  const focusedRef = useRef(false);

  useEffect(() => {
    setDraft(external);
    focusedRef.current = false;
  }, [field.path]);

  useEffect(() => {
    if (!focusedRef.current) setDraft(external);
  }, [external]);

  useEffect(() => {
    if (debouncedDraft === external) return;
    onFieldChange(field.path, 'text', debouncedDraft);
  }, [debouncedDraft, external, field.path, onFieldChange]);

  const flushDraft = () => {
    if (draft !== external) onFieldChange(field.path, 'text', draft);
  };

  return (
    <div className="space-y-1.5 py-1">
      <label htmlFor={id} className="text-[13px] font-medium text-gray-800">
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={field.placeholder ?? 'My Store'}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          flushDraft();
        }}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      />
      {field.description ? (
        <p className="text-[12px] leading-snug text-gray-500">{field.description}</p>
      ) : null}
    </div>
  );
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

/** Header logo block: Store name → theme logo note → Visibility → Desktop padding. */
export function HeaderLogoBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const textField = pickHeaderLogoBlockField(fields, 'text');
  const taglineField = pickHeaderLogoBlockField(fields, 'tagline');
  const hideField = pickHeaderLogoBlockField(fields, 'hideLogoOnHomePage');
  const paddingTop = pickHeaderLogoBlockField(fields, 'paddingTop');
  const paddingBottom = pickHeaderLogoBlockField(fields, 'paddingBottom');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {textField || taglineField ? (
        <div className="space-y-1 px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Store name</h3>
          {textField ? (
            <LogoTextFieldRow field={textField} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {taglineField ? (
            <LogoTextFieldRow field={taglineField} values={values} onFieldChange={onFieldChange} />
          ) : null}
          <p className="pt-1 text-[12px] text-gray-500">
            Shown when no logo image is set in Theme settings.
          </p>
        </div>
      ) : null}

      <div className="px-1 py-3">
        <p className="text-[12px] text-gray-500">
          Edit logo image in{' '}
          <span className="font-medium text-gray-700">Theme settings → Logo and favicon</span>
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
