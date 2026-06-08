import React from 'react';
import type { TextStyleSettings } from './create-theme-style.utils';

export type StyleFieldDef = {
  key: keyof TextStyleSettings | 'backgroundColor';
  type: 'color' | 'number' | 'boolean' | 'select';
  label: string;
  options?: { value: string; label: string }[];
};

export const TEXT_STYLE_FIELDS: StyleFieldDef[] = [
  { key: 'color', type: 'color', label: 'Text color' },
  { key: 'fontSize', type: 'number', label: 'Font size (px)' },
  { key: 'fontWeight', type: 'select', label: 'Bold', options: [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
  ]},
  { key: 'fontStyle', type: 'select', label: 'Italic', options: [
    { value: 'normal', label: 'Normal' },
    { value: 'italic', label: 'Italic' },
  ]},
  { key: 'textDecoration', type: 'select', label: 'Underline', options: [
    { value: 'none', label: 'None' },
    { value: 'underline', label: 'Underline' },
  ]},
  { key: 'textTransform', type: 'select', label: 'Letter case', options: [
    { value: 'none', label: 'Normal' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
  ]},
];

type TextStyleEditorProps = {
  title: string;
  value: TextStyleSettings;
  onChange: (next: TextStyleSettings) => void;
  showBackground?: boolean;
  backgroundColor?: string;
  onBackgroundChange?: (color: string) => void;
};

export function TextStyleEditor({ title, value, onChange, showBackground, backgroundColor, onBackgroundChange }: TextStyleEditorProps) {
  const patch = (key: keyof TextStyleSettings | 'backgroundColor', v: string | number | boolean) => {
    if (key === 'backgroundColor' && onBackgroundChange) {
      onBackgroundChange(String(v));
      return;
    }
    onChange({ ...value, [key]: v } as TextStyleSettings);
  };

  return (
    <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {showBackground && onBackgroundChange ? (
        <ColorField label="Background color" value={backgroundColor ?? '#ffffff'} onChange={(c) => patch('backgroundColor', c)} />
      ) : null}
      {TEXT_STYLE_FIELDS.map((field) => (
        <StyleFieldRow key={`${title}-${field.key}`} field={field} value={value} onPatch={patch} />
      ))}
    </div>
  );
}

function StyleFieldRow({
  field,
  value,
  onPatch,
}: {
  field: StyleFieldDef;
  value: TextStyleSettings;
  onPatch: (key: keyof TextStyleSettings, v: string | number | boolean) => void;
}) {
  const id = `style-${field.key}-${field.label.replace(/\s/g, '-')}`;
  const raw = field.key === 'backgroundColor' ? '' : value[field.key as keyof TextStyleSettings];

  if (field.type === 'boolean') {
    return (
      <label htmlFor={id} className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-gray-700">{field.label}</span>
        <input
          id={id}
          type="checkbox"
          checked={raw === 'bold' || raw === true}
          onChange={(e) => onPatch(field.key as keyof TextStyleSettings, e.target.checked ? 'bold' : 'normal')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
      </label>
    );
  }

  if (field.type === 'color') {
    return <ColorField label={field.label} value={String(raw || '#111827')} onChange={(c) => onPatch(field.key as keyof TextStyleSettings, c)} />;
  }

  if (field.type === 'select' && field.options) {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="block text-[12px] font-medium text-gray-700">{field.label}</label>
        <select
          id={id}
          value={String(raw)}
          onChange={(e) => onPatch(field.key as keyof TextStyleSettings, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[12px] font-medium text-gray-700">{field.label}</label>
      <input
        id={id}
        type="number"
        min={8}
        max={96}
        value={Number(raw) || 16}
        onChange={(e) => onPatch(field.key as keyof TextStyleSettings, Number(e.target.value) || 16)}
        className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
      />
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = `color-${label.replace(/\s/g, '-')}`;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[12px] font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#111827'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
          aria-label={label}
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs outline-none focus:border-blue-400"
        />
      </div>
    </div>
  );
}
