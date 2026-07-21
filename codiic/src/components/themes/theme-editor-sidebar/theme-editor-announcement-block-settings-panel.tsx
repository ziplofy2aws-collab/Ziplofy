import React from 'react';
import {
  ChevronDownIcon,
  CircleStackIcon,
  LinkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './theme-editor-field.utils';
import { ThemeEditorLinkField } from '../../theme-editor/ThemeEditorLinkField';
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
      <div className="overflow-hidden rounded-lg border border-[#c9cccf] bg-white shadow-sm focus-within:border-[#005bd3] focus-within:ring-1 focus-within:ring-[#005bd3]">
        <div className="flex items-center gap-0.5 border-b border-[#e1e1e1] bg-[#f6f6f7] px-2 py-1">
          <button
            type="button"
            className="rounded p-1 text-violet-600 hover:bg-[#ededed]"
            title="Generate"
            aria-label="Generate"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded px-2 py-0.5 text-[12px] font-bold text-gray-700 hover:bg-[#ededed]"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            className="rounded px-2 py-0.5 text-[12px] italic text-gray-700 hover:bg-[#ededed]"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            className="rounded p-1 text-gray-600 hover:bg-[#ededed]"
            title="Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onFieldChange(field.path, 'textarea', e.target.value)}
          className="w-full resize-y border-0 px-3 py-2 text-[13px] text-gray-900 focus:outline-none"
        />
      </div>
    </div>
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
