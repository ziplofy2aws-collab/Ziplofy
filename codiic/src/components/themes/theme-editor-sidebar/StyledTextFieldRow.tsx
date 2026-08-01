import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import {
  fieldInputId,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './theme-editor-field.utils';
import { catalogTextStyleCompanionPaths } from './catalog-text-style.utils';

type Props = {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

const CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'UPPER' },
  { value: 'lowercase', label: 'lower' },
  { value: 'capitalize', label: 'Title' },
] as const;

/**
 * Catalog remote-theme text control: content + size / colors / case / letter-spacing.
 * Companion style paths are derived from the text field path (not shown as separate groups).
 */
export function StyledTextFieldRow({ field, values, onFieldChange }: Props) {
  const [open, setOpen] = useState(false);
  const text = fieldValueAsString(values, field);
  const companions = catalogTextStyleCompanionPaths(field.path);
  const isArea = field.type === 'textarea' || field.widget === 'richtext';

  const fontSize = String(values[companions.FontSize] ?? '');
  const textColor = String(values[companions.TextColor] ?? '');
  const backgroundColor = String(values[companions.BackgroundColor] ?? '');
  const textCase = String(values[companions.TextCase] ?? 'default') || 'default';
  const letterSpacing = String(values[companions.LetterSpacing] ?? '');

  return (
    <div className="space-y-2 py-2">
      <label htmlFor={fieldInputId(field.path)} className="block text-[13px] font-medium text-gray-800">
        {field.label}
      </label>
      {isArea ? (
        <textarea
          id={fieldInputId(field.path)}
          value={text}
          rows={3}
          placeholder={field.placeholder}
          onChange={(e) => onFieldChange(field.path, 'textarea', e.target.value)}
          className="min-h-[72px] w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none focus:border-[#2c6ecb]"
        />
      ) : (
        <input
          id={fieldInputId(field.path)}
          type="text"
          value={text}
          placeholder={field.placeholder}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="min-h-9 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none focus:border-[#2c6ecb]"
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-[#f3f3f3]"
        aria-expanded={open}
      >
        <span>Text style</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="space-y-3 rounded-lg border border-[#e8e8e8] bg-white p-3">
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Size (px)</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={10}
                max={72}
                step={1}
                value={fontSize ? Number(fontSize) || 16 : 16}
                onChange={(e) => onFieldChange(companions.FontSize, 'number', e.target.value)}
                className="min-w-0 flex-1"
              />
              <input
                type="number"
                min={10}
                max={72}
                value={fontSize}
                placeholder="Auto"
                onChange={(e) => onFieldChange(companions.FontSize, 'number', e.target.value)}
                className="h-8 w-16 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(textColor) ? textColor : '#111111'}
                onChange={(e) => onFieldChange(companions.TextColor, 'color', e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
              />
              <input
                type="text"
                value={textColor}
                placeholder="#111111"
                onChange={(e) => onFieldChange(companions.TextColor, 'color', e.target.value)}
                className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              {textColor ? (
                <button
                  type="button"
                  className="text-[11px] text-[#005bd3] hover:underline"
                  onClick={() => onFieldChange(companions.TextColor, 'color', '')}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(backgroundColor) ? backgroundColor : '#ffffff'}
                onChange={(e) => onFieldChange(companions.BackgroundColor, 'color', e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
              />
              <input
                type="text"
                value={backgroundColor}
                placeholder="None"
                onChange={(e) => onFieldChange(companions.BackgroundColor, 'color', e.target.value)}
                className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              {backgroundColor ? (
                <button
                  type="button"
                  className="text-[11px] text-[#005bd3] hover:underline"
                  onClick={() => onFieldChange(companions.BackgroundColor, 'color', '')}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </label>

          <div className="space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Case</span>
            <div className="inline-flex w-full rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
              {CASE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFieldChange(companions.TextCase, 'text', opt.value)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    textCase === opt.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Letter spacing</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={letterSpacing ? Number(letterSpacing) || 0 : 0}
                onChange={(e) => onFieldChange(companions.LetterSpacing, 'number', e.target.value)}
                className="min-w-0 flex-1"
              />
              <span className="w-14 text-right text-[11px] text-gray-500">
                {letterSpacing ? `${(Number(letterSpacing) / 100).toFixed(2)}em` : 'Auto'}
              </span>
            </div>
            {letterSpacing ? (
              <button
                type="button"
                className="text-[11px] text-[#005bd3] hover:underline"
                onClick={() => onFieldChange(companions.LetterSpacing, 'number', '')}
              >
                Reset spacing
              </button>
            ) : null}
          </label>
        </div>
      ) : null}
    </div>
  );
}
