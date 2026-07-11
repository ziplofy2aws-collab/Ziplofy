import React, { useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import { ThemeEditorLinkField } from '../../components/theme-editor/ThemeEditorLinkField';
import { pickAnnouncementBlockField } from './theme-editor-announcement-block-panel.utils';
import { CheckoutColorPickerPopover } from '../checkout/settings/CheckoutColorPickerPopover';
import {
  getThemePaletteColor,
  parseThemePaletteColorSetting,
  themePaletteColorValue,
} from '../settings/theme-color-palette.settings';

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

  // Plain textarea — TipTap in the shared rich-text field has blanked this panel after
  // TipTap v3 upgrades; announcement text is short and does not need the full toolbar.
  return (
    <div className="space-y-1.5 py-1">
      <label htmlFor={id} className="text-[13px] font-medium text-gray-800">
        {field.label}
      </label>
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onFieldChange(field.path, 'textarea', e.target.value)}
        placeholder="Announcement text"
        className="w-full resize-y rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] leading-relaxed text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      />
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

function AnnouncementTextColorFieldRow({
  field,
  values,
  colorPalette,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const raw = typeof values[field.path] === 'string' ? String(values[field.path]).trim() : '';
  const isDefault = raw === '';
  const parsed = parseThemePaletteColorSetting(raw, 1);
  const isPaletteLinked = !isDefault && parsed.kind === 'palette';
  const displayColor = isDefault
    ? '#ffffff'
    : parsed.kind === 'palette'
      ? getThemePaletteColor(colorPalette, parsed.index, '#111827')
      : parsed.hex;
  const activePaletteIndex = isPaletteLinked ? parsed.index : null;
  const labelText = isDefault ? 'Default' : isPaletteLinked ? 'Palette color' : displayColor.toUpperCase();

  const openPicker = () => {
    const el = buttonRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
    setOpen(true);
  };
  const closePicker = () => {
    setOpen(false);
    setAnchorRect(null);
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <div className="min-w-[148px] max-w-[180px]">
          <button
            ref={buttonRef}
            type="button"
            onClick={openPicker}
            className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-2.5 py-2 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9]"
          >
            <span
              className="h-5 w-5 shrink-0 rounded-md border border-[#e1e3e5]"
              style={
                isDefault
                  ? {
                      backgroundColor: '#ffffff',
                      backgroundImage:
                        'linear-gradient(45deg, transparent 44%, #d1d5db 44%, #d1d5db 56%, transparent 56%)',
                    }
                  : { background: displayColor }
              }
              aria-hidden
            />
            <span className="truncate">{labelText}</span>
          </button>
        </div>
      </div>
      <CheckoutColorPickerPopover
        open={open}
        color={isDefault ? getThemePaletteColor(colorPalette, 1, '#111827') : displayColor}
        anchorRect={anchorRect}
        paletteColors={colorPalette}
        activePaletteIndex={activePaletteIndex}
        onPaletteSelect={(index) => onFieldChange(field.path, 'text', themePaletteColorValue(index))}
        onChange={(hex) => onFieldChange(field.path, 'text', hex)}
        onDelete={() => {
          onFieldChange(field.path, 'text', '');
          closePicker();
        }}
        onClose={closePicker}
      />
    </>
  );
}

/** Shopify announcement block: Text → Link → Typography → Appearance. */
export function AnnouncementBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const textField = pickAnnouncementBlockField(fields, 'text');
  const linkField = pickAnnouncementBlockField(fields, 'link');
  const textColorField = pickAnnouncementBlockField(fields, 'textColor');
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
      {textColorField ? (
        <div className="border-t border-[#e1e1e1] px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
          <div className="space-y-0.5">
            <AnnouncementTextColorFieldRow
              field={textColorField}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
