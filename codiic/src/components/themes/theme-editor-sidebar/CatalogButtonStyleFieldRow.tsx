import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import { type ThemeEditorFieldType } from './theme-editor-field.utils';
import { catalogButtonStyleCompanionPaths } from './catalog-button-style.utils';

type Props = {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

const FONT_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'accent', label: 'Accent' },
] as const;

const CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'Uppercase' },
] as const;

function hexOrFallback(raw: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

/**
 * Catalog remote-theme Button control (Editable elements.md):
 * Background, Text, Borders, Border thickness, Corner radius, Font, Text case.
 */
export function CatalogButtonStyleFieldRow({ field, values, onFieldChange }: Props) {
  const [open, setOpen] = useState(true);
  const companions = catalogButtonStyleCompanionPaths(field.path);

  const background = String(values[companions.Background] ?? '');
  const text = String(values[companions.Text] ?? '');
  const border = String(values[companions.Border] ?? '');
  const borderThickness = String(values[companions.BorderThickness] ?? '');
  const cornerRadius = String(values[companions.CornerRadius] ?? '');
  const font = String(values[companions.Font] ?? '');
  const textCase = String(values[companions.TextCase] ?? '');

  const thicknessNum = borderThickness === '' ? 0 : Number(borderThickness) || 0;
  const radiusNum = cornerRadius === '' ? 0 : Number(cornerRadius) || 0;
  const fontActive = font === 'accent' ? 'accent' : font === 'body' ? 'body' : '';
  const caseActive =
    textCase === 'uppercase' ? 'uppercase' : textCase === 'default' ? 'default' : '';

  return (
    <div className="space-y-2 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-[#f3f3f3]"
        aria-expanded={open}
      >
        <span>{field.label || 'Button style'}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="space-y-3 rounded-lg border border-[#e8e8e8] bg-white p-3">
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hexOrFallback(background === 'transparent' ? '' : background, '#c5a059')}
                onChange={(e) => onFieldChange(companions.Background, 'color', e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
              />
              <input
                type="text"
                value={background}
                placeholder="Theme default"
                onChange={(e) => onFieldChange(companions.Background, 'color', e.target.value)}
                className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              {background ? (
                <button
                  type="button"
                  className="text-[11px] text-[#005bd3] hover:underline"
                  onClick={() => onFieldChange(companions.Background, 'color', '')}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Text</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hexOrFallback(text, '#ffffff')}
                onChange={(e) => onFieldChange(companions.Text, 'color', e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
              />
              <input
                type="text"
                value={text}
                placeholder="Theme default"
                onChange={(e) => onFieldChange(companions.Text, 'color', e.target.value)}
                className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              {text ? (
                <button
                  type="button"
                  className="text-[11px] text-[#005bd3] hover:underline"
                  onClick={() => onFieldChange(companions.Text, 'color', '')}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Borders</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hexOrFallback(border, '#c5a059')}
                onChange={(e) => onFieldChange(companions.Border, 'color', e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
              />
              <input
                type="text"
                value={border}
                placeholder="Theme default"
                onChange={(e) => onFieldChange(companions.Border, 'color', e.target.value)}
                className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              {border ? (
                <button
                  type="button"
                  className="text-[11px] text-[#005bd3] hover:underline"
                  onClick={() => onFieldChange(companions.Border, 'color', '')}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Border thickness</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={thicknessNum}
                onChange={(e) => onFieldChange(companions.BorderThickness, 'number', e.target.value)}
                className="min-w-0 flex-1"
              />
              <input
                type="number"
                min={0}
                max={20}
                value={borderThickness}
                placeholder="0"
                onChange={(e) => onFieldChange(companions.BorderThickness, 'number', e.target.value)}
                className="h-8 w-16 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              <span className="text-[11px] text-gray-500">px</span>
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Corner radius</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={radiusNum}
                onChange={(e) => onFieldChange(companions.CornerRadius, 'number', e.target.value)}
                className="min-w-0 flex-1"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={cornerRadius}
                placeholder="0"
                onChange={(e) => onFieldChange(companions.CornerRadius, 'number', e.target.value)}
                className="h-8 w-16 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
              <span className="text-[11px] text-gray-500">px</span>
            </div>
          </label>

          <div className="space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Font</span>
            <div className="inline-flex w-full rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFieldChange(companions.Font, 'text', opt.value)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    fontActive === opt.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {fontActive ? (
              <button
                type="button"
                className="text-[11px] text-[#005bd3] hover:underline"
                onClick={() => onFieldChange(companions.Font, 'text', '')}
              >
                Use theme default
              </button>
            ) : (
              <p className="text-[11px] text-gray-500">Theme default</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Text case</span>
            <div className="inline-flex w-full rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
              {CASE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFieldChange(companions.TextCase, 'text', opt.value)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    caseActive === opt.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {caseActive ? (
              <button
                type="button"
                className="text-[11px] text-[#005bd3] hover:underline"
                onClick={() => onFieldChange(companions.TextCase, 'text', '')}
              >
                Use theme default
              </button>
            ) : (
              <p className="text-[11px] text-gray-500">Theme default</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
