import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import { ThemeEditorLinkField } from '../../components/theme-editor/ThemeEditorLinkField';
import { ThemeEditorRichTextField } from '../../components/theme-editor/ThemeEditorRichTextField';
import { pickAnnouncementBlockField } from './theme-editor-announcement-block-panel.utils';

function AnnouncementRichTextFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const value = fieldValueAsString(values, field);

  return (
    <ThemeEditorRichTextField
      id={id}
      label={field.label}
      value={value}
      onChange={(html) => onFieldChange(field.path, 'textarea', html)}
    />
  );
}

function AnnouncementLinkFieldRow({
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
      showDynamicSource
    />
  );
}

function AnnouncementInlineSelectFieldRow({
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
      <div className="relative min-w-[140px]">
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

function AnnouncementSegmentedFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || '';
  const changeType = fieldTypeFromSchema(field.type);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="inline-flex rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFieldChange(field.path, changeType, opt.value)}
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

/** Shopify announcement block: Text → Link → Typography. */
export function AnnouncementBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const textField = pickAnnouncementBlockField(fields, 'text');
  const linkField = pickAnnouncementBlockField(fields, 'link');
  const typographyFields = (
    ['font', 'fontSize', 'fontWeight', 'letterSpacing', 'textCase'] as const
  )
    .map((key) => pickAnnouncementBlockField(fields, key))
    .filter((f): f is EditorFieldDef => Boolean(f));

  return (
    <div className="space-y-0.5">
      {textField ? (
        <AnnouncementRichTextFieldRow field={textField} values={values} onFieldChange={onFieldChange} />
      ) : null}
      {linkField ? (
        <AnnouncementLinkFieldRow field={linkField} values={values} onFieldChange={onFieldChange} />
      ) : null}
      {typographyFields.length ? (
        <div className="border-t border-[#e1e1e1] px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
          <div className="space-y-0.5">
            {typographyFields.map((field) =>
              field.widget === 'segmented' || field.path.endsWith('.textCase') ? (
                <AnnouncementSegmentedFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : (
                <AnnouncementInlineSelectFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
