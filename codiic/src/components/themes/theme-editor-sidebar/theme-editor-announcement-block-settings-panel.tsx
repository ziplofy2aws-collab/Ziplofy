import React from 'react';
import {
  CircleStackIcon,
  LinkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import {
  fieldInputId,
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
          <button type="button" className="rounded p-1 text-violet-600 hover:bg-[#ededed]" title="Generate" aria-label="Generate">
            <SparklesIcon className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rounded px-2 py-0.5 text-[12px] font-bold text-gray-700 hover:bg-[#ededed]" title="Bold">
            B
          </button>
          <button type="button" className="rounded px-2 py-0.5 text-[12px] italic text-gray-700 hover:bg-[#ededed]" title="Italic">
            I
          </button>
          <button type="button" className="rounded p-1 text-gray-600 hover:bg-[#ededed]" title="Link">
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

/** Catalog announcement block: Text → Link → Link label. */
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
  const linkLabelField = pickAnnouncementBlockField(fields, 'linkLabel');

  return (
    <div className="space-y-0.5 px-1 py-2">
      {textField ? (
        <AnnouncementRichTextFieldRow field={textField} values={values} onFieldChange={onFieldChange} />
      ) : null}
      {linkField ? (
        <AnnouncementLinkFieldRow field={linkField} values={values} onFieldChange={onFieldChange} />
      ) : null}
      {linkLabelField ? (
        <div className="space-y-1.5 py-1">
          <label htmlFor={fieldInputId(linkLabelField.path)} className="text-[13px] font-medium text-gray-800">
            {linkLabelField.label}
          </label>
          <input
            id={fieldInputId(linkLabelField.path)}
            type="text"
            value={fieldValueAsString(values, linkLabelField)}
            onChange={(e) => onFieldChange(linkLabelField.path, 'text', e.target.value)}
            className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          />
        </div>
      ) : null}
    </div>
  );
}
