import React, { useEffect, useRef, useState } from 'react';
import type { StoreMenu, StoreMenuItem } from '../../../contexts/store-menu.context';
import { StoreMenuSelectFieldRow } from '../../../create-theme/sidebar/StoreMenuSelectFieldRow';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import {
  fieldInputId,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './theme-editor-field.utils';

const TEXT_DEBOUNCE_MS = 280;

function TextFieldRow({
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
  const debouncedDraft = useDebouncedValue(draft, TEXT_DEBOUNCE_MS);
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

  return (
    <div className="space-y-1 py-2">
      <label htmlFor={id} className="block text-[13px] font-medium text-gray-800">
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={field.placeholder}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          if (draft !== external) onFieldChange(field.path, 'text', draft);
        }}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
      />
    </div>
  );
}

function isMenuField(field: EditorFieldDef): boolean {
  return field.widget === 'menu' || field.path.endsWith('.menu');
}

/** Catalog footer: brand/contact text, social URLs, and store menu pickers. */
export function WatchFooterSimpleSettingsPanel({
  fields,
  values,
  onFieldChange,
  onStoreMenuSelect,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onStoreMenuSelect?: (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => void;
}) {
  const visible = fields.filter((f) => f.sidebar !== false);
  if (!visible.length) {
    return <p className="py-2 text-[13px] text-gray-500">Nothing to edit here.</p>;
  }

  const socialKeys = new Set(['facebookUrl', 'instagramUrl', 'xUrl', 'youtubeUrl']);
  const isSocialField = (field: EditorFieldDef) => {
    const key = field.path.split('.').pop() ?? '';
    return field.group === 'Social links' || socialKeys.has(key);
  };

  const contactFields = visible.filter((f) => !isMenuField(f) && !isSocialField(f));
  const socialFields = visible.filter((f) => isSocialField(f));
  const menuFields = visible.filter((f) => isMenuField(f));

  return (
    <div className="px-1 py-1">
      {contactFields.map((field) => (
        <TextFieldRow
          key={field.path}
          field={field}
          values={values}
          onFieldChange={onFieldChange}
        />
      ))}
      {socialFields.length ? (
        <div className="border-t border-[#e1e1e1] pt-2 mt-1">
          <h3 className="mb-1 text-[13px] font-semibold text-gray-900">Social links</h3>
          <p className="mb-1 text-[12px] text-gray-500">
            Paste profile URLs. Leave blank to hide that icon.
          </p>
          {socialFields.map((field) => (
            <TextFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      ) : null}
      {menuFields.map((field) => (
        <div key={field.path} className="py-2">
          <StoreMenuSelectFieldRow
            field={field}
            values={values}
            onFieldChange={onFieldChange}
            onStoreMenuSelect={onStoreMenuSelect}
          />
        </div>
      ))}
    </div>
  );
}
