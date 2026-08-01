import React, { useEffect, useRef, useState } from 'react';
import { PencilSquareIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import {
  fieldInputId,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './theme-editor-field.utils';
import { pickHeaderLogoBlockField } from './theme-editor-header-logo-block-panel.utils';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { ThemeEditorImagePickerModal } from './ThemeEditorImagePickerModal';
import { ThemeEditorImageEditorSheet } from './ThemeEditorImageEditorSheet';

const LOGO_TEXT_DEBOUNCE_MS = 300;

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
    </div>
  );
}

function LogoImageFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const url = fieldValueAsString(values, field);
  const hasImage = Boolean(url.trim());

  return (
    <>
      <div className="space-y-2 py-1">
        <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
        <div className="rounded-lg border border-dashed border-[#c9cccf] bg-[#fafbfb] p-3">
          {hasImage ? (
            <div className="relative mb-2 overflow-hidden rounded-md border border-[#e1e1e1] bg-white">
              <img src={url} alt="" className="max-h-28 w-full object-contain" />
              <button
                type="button"
                title="Edit image"
                onClick={() => setEditorOpen(true)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#c9cccf] bg-white/95 text-gray-700 shadow-sm hover:bg-white"
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mb-2 flex h-20 items-center justify-center rounded-md border border-[#e1e1e1] bg-white text-gray-400">
              <PhotoIcon className="h-8 w-8" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {hasImage ? 'Change' : 'Select'}
            </button>
            {hasImage ? (
              <>
                <button
                  type="button"
                  title="Edit image"
                  onClick={() => setEditorOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onFieldChange(field.path, 'text', '')}
                  className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100"
                >
                  Remove
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <ThemeEditorImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialUrl={url}
        onSelect={(nextUrl) => onFieldChange(field.path, 'text', nextUrl)}
      />
      <ThemeEditorImageEditorSheet
        open={editorOpen}
        imageUrl={url}
        onClose={() => setEditorOpen(false)}
        onSaved={(nextUrl) => onFieldChange(field.path, 'text', nextUrl)}
      />
    </>
  );
}

/** Catalog header logo: image + store name only. */
export function HeaderLogoBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const imageField = pickHeaderLogoBlockField(fields, 'imageUrl');
  const textField = pickHeaderLogoBlockField(fields, 'text');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {imageField ? (
        <div className="px-1 py-3">
          <LogoImageFieldRow field={imageField} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}
      {textField ? (
        <div className="px-1 py-3">
          <LogoTextFieldRow field={textField} values={values} onFieldChange={onFieldChange} />
          <p className="pt-1 text-[12px] text-gray-500">Shown when no logo image is set.</p>
        </div>
      ) : null}
    </div>
  );
}
