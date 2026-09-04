'use client';

import { useMemo, useState } from 'react';
import type { EditorFieldDef } from '@/lib/informatic-theme/load-static-pack';
import { getConfigPath } from '@/lib/informatic-theme/load-static-pack';
import { InformaticImageField } from '@/components/store-media/InformaticImageField';
import { InformaticImageStylePanel } from './InformaticImageStylePanel';
import { isInformaticImageStyleCompanionPath } from '@/lib/informatic-theme/informatic-image-style.utils';
import { isStoreMenuFieldPath } from '@/lib/informatic-theme/store-menu-header.util';
import { isLeadFormFieldPath } from '@/lib/informatic-theme/informatic-lead-form.util';
import { StoreMenuSelectFieldRow } from './StoreMenuSelectFieldRow';
import { FormSelectFieldRow } from './FormSelectFieldRow';

const TEXT_STYLE_SUFFIXES = [
  { key: 'FontSize', label: 'Size', placeholder: '16' },
  { key: 'FontFamily', label: 'Font', placeholder: 'Theme default' },
  { key: 'FontWeight', label: 'Weight', placeholder: 'default' },
  { key: 'TextColor', label: 'Color', placeholder: '#0f172a' },
  { key: 'BackgroundColor', label: 'Background', placeholder: '' },
  { key: 'LetterSpacing', label: 'Letter spacing', placeholder: '0' },
  { key: 'TextCase', label: 'Casing', placeholder: 'default' },
] as const;

const BUTTON_STYLE_SUFFIXES = [
  { key: 'Background', label: 'Background' },
  { key: 'Text', label: 'Text' },
  { key: 'Border', label: 'Borders' },
  { key: 'BorderThickness', label: 'Border thickness' },
  { key: 'CornerRadius', label: 'Corner radius' },
  { key: 'Font', label: 'Font' },
  { key: 'TextCase', label: 'Text case' },
] as const;

type Props = {
  field: EditorFieldDef;
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  storeId?: string | null;
  onStoreMenuSelect?: (
    menuFieldPath: string,
    menu: import('@/lib/store-menu').StoreMenu,
    items: import('@/lib/store-menu').StoreMenuItem[]
  ) => void;
  onLeadFormSelect?: (formFieldPath: string, form: { _id: string; name: string }) => void;
  onLeadFormClear?: (formFieldPath: string) => void;
};

function companionPath(path: string, suffix: string): string {
  return `${path}${suffix}`;
}

export function InformaticFieldRow({ field, config, onChange, storeId = null, onStoreMenuSelect, onLeadFormSelect, onLeadFormClear }: Props) {
  const [styleOpen, setStyleOpen] = useState(false);
  const widget = field.widget || field.type || 'text';
  const value = getConfigPath(config, field.path);

  if (field.sidebar === false) return null;

  if (isInformaticImageStyleCompanionPath(field.path)) return null;

  if (widget === 'boolean' || field.type === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
        <span className="font-medium text-gray-800">{field.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.path, e.target.checked)}
          className="h-4 w-4 rounded border-[#c9cccf]"
        />
      </label>
    );
  }

  if (widget === 'color' || field.type === 'color') {
    const str = String(value ?? '');
    return (
      <label className="block space-y-1.5 py-2.5 text-[13px]">
        <span className="font-medium text-gray-800">{field.label}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={str && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str) ? str : '#ffffff'}
            onChange={(e) => onChange(field.path, e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-[#c9cccf]"
          />
          <input
            type="text"
            value={str}
            onChange={(e) => onChange(field.path, e.target.value)}
            className="min-h-9 min-w-0 flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none focus:border-[#2c6ecb]"
            placeholder="#000000"
          />
        </div>
      </label>
    );
  }

  if (widget === 'form' && isLeadFormFieldPath(field.path) && onLeadFormSelect && onLeadFormClear) {
    return (
      <FormSelectFieldRow
        field={field}
        config={config}
        onLeadFormSelect={onLeadFormSelect}
        onLeadFormClear={onLeadFormClear}
      />
    );
  }

  if (widget === 'menu' && isStoreMenuFieldPath(field.path) && onStoreMenuSelect) {
    return (
      <StoreMenuSelectFieldRow
        field={field}
        config={config}
        storeId={storeId}
        onStoreMenuSelect={onStoreMenuSelect}
      />
    );
  }

  if (widget === 'menu') {
    const items = Array.isArray(value) ? (value as Array<{ label?: string; href?: string }>) : [];
    return (
      <div className="space-y-2 py-2 text-[13px]">
        <div className="font-medium text-admin-text">{field.label}</div>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-2">
            <input
              value={item.label || ''}
              placeholder="Label"
              onChange={(e) => {
                const next = items.map((it, i) => (i === idx ? { ...it, label: e.target.value } : it));
                onChange(field.path, next);
              }}
              className="rounded-md border border-admin-border px-2 py-1.5"
            />
            <input
              value={item.href || ''}
              placeholder="/path"
              onChange={(e) => {
                const next = items.map((it, i) => (i === idx ? { ...it, href: e.target.value } : it));
                onChange(field.path, next);
              }}
              className="rounded-md border border-admin-border px-2 py-1.5"
            />
          </div>
        ))}
        <button
          type="button"
          className="text-[12px] font-medium text-admin-text underline"
          onClick={() => onChange(field.path, [...items, { label: 'New link', href: '/' }])}
        >
          Add item
        </button>
      </div>
    );
  }

  const isText = widget === 'styled-text' || widget === 'textarea' || field.type === 'textarea';
  const isButton = widget === 'button';
  const isImage = widget === 'image';

  if (isImage) {
    return (
      <div className="space-y-2 py-2.5">
        <InformaticImageField
          label={field.label || 'Image'}
          value={String(value ?? '')}
          onChange={(url) => onChange(field.path, url)}
          storeId={storeId}
        />
        <InformaticImageStylePanel
          imageFieldPath={field.path}
          config={config}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2.5">
      <label className="block space-y-1.5 text-[13px]">
        <span className="font-medium text-gray-800">{field.label}</span>
        {field.type === 'textarea' || widget === 'textarea' ? (
          <textarea
            rows={3}
            value={String(value ?? '')}
            onChange={(e) => onChange(field.path, e.target.value)}
            className="min-h-[72px] w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none focus:border-[#2c6ecb]"
          />
        ) : isButton ? (
          <p className="text-[12px] text-gray-500">Button surface styles (label is a separate text field).</p>
        ) : (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(field.path, e.target.value)}
            className="min-h-9 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none focus:border-[#2c6ecb]"
            placeholder={widget === 'url' ? '/path or https://…' : undefined}
          />
        )}
      </label>

      {(isText || isButton) && (
        <div>
          <button
            type="button"
            onClick={() => setStyleOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-[#f3f3f3]"
          >
            {isButton ? 'Button style' : 'Text style'}
            <span className="text-gray-500">{styleOpen ? '▾' : '▸'}</span>
          </button>
          {styleOpen ? (
            <div className="mt-2 space-y-3 rounded-lg border border-[#e8e8e8] bg-white p-3">
              {(isText ? TEXT_STYLE_SUFFIXES : BUTTON_STYLE_SUFFIXES).map((s) => {
                const path = companionPath(field.path, s.key);
                const companion = getConfigPath(config, path);
                return (
                  <label key={s.key} className="block space-y-1 text-[12px]">
                    <span className="font-medium text-gray-700">{s.label}</span>
                    <input
                      type="text"
                      value={String(companion ?? '')}
                      onChange={(e) => onChange(path, e.target.value)}
                      className="min-h-9 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] shadow-sm outline-none focus:border-[#2c6ecb]"
                      placeholder={'placeholder' in s ? s.placeholder : undefined}
                    />
                  </label>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function InformaticFieldsList({
  fields,
  config,
  onChange,
  storeId = null,
  onStoreMenuSelect,
  onLeadFormSelect,
  onLeadFormClear,
}: {
  fields: EditorFieldDef[];
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  storeId?: string | null;
  onStoreMenuSelect?: Props['onStoreMenuSelect'];
  onLeadFormSelect?: Props['onLeadFormSelect'];
  onLeadFormClear?: Props['onLeadFormClear'];
}) {
  const visible = useMemo(
    () => (fields || []).filter((f) => f.sidebar !== false && f.path),
    [fields]
  );
  return (
    <div className="divide-y divide-[#e1e1e1]">
      {visible.map((field) => (
        <InformaticFieldRow
          key={field.path}
          field={field}
          config={config}
          onChange={onChange}
          storeId={storeId}
          onStoreMenuSelect={onStoreMenuSelect}
          onLeadFormSelect={onLeadFormSelect}
          onLeadFormClear={onLeadFormClear}
        />
      ))}
    </div>
  );
}
