import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import { pickHeaderMenuBlockField } from './theme-editor-header-menu-block-panel.utils';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { StoreMenuSelectFieldRow } from './StoreMenuSelectFieldRow';
import { ThemePaletteColorField } from '../settings/ThemePaletteColorField';
import { ThemeDefaultColorField } from '../settings/ThemeDefaultColorField';

function numValue(values: Record<string, string | boolean>, field: EditorFieldDef, fallback: number): number {
  const raw = values[field.path];
  if (typeof raw === 'number') return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function MenuInlineSelectFieldRow({
  field,
  values,
  onFieldChange,
  leadingIcon,
  description,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  leadingIcon?: React.ReactNode;
  description?: string;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || '';

  return (
    <div className="py-1">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <div className="relative min-w-[140px]">
          {leadingIcon ? (
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
              {leadingIcon}
            </span>
          ) : null}
          <select
            value={current}
            onChange={(e) =>
              onFieldChange(field.path, fieldTypeFromSchema(field.type), e.target.value)
            }
            className={`w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3] ${
              leadingIcon ? 'pl-9' : 'pl-3'
            }`}
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
      {description ? (
        <p className="mt-1.5 text-[12px] leading-snug text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

function MenuSegmentedFieldRow({
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

function MenuSliderFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const current = numValue(values, field, min);
  const id = fieldInputId(field.path);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
          className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
        />
        <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
            aria-label={field.label}
          />
          {field.unit ? (
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">{field.unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MenuToggleFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const checked = Boolean(values[field.path]);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onFieldChange(field.path, 'boolean', !checked)}
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#303030]' : 'bg-[#c9cccf]'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

/** Shopify header menu block: Menu → Appearance → Typography → Submenu feature → Mobile layout. */
export function HeaderMenuBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
  onStoreMenuSelect,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onStoreMenuSelect?: (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => void;
}) {
  const menuField = pickHeaderMenuBlockField(fields, 'menu');
  const backgroundColorField = pickHeaderMenuBlockField(fields, 'backgroundColor');
  const textColorField = pickHeaderMenuBlockField(fields, 'textColor');
  const topLevelSize = pickHeaderMenuBlockField(fields, 'topLevelSize');
  const submenuSize = pickHeaderMenuBlockField(fields, 'submenuSize');
  const fontField = pickHeaderMenuBlockField(fields, 'font');
  const textCaseField = pickHeaderMenuBlockField(fields, 'textCase');
  const mediaTypeField = pickHeaderMenuBlockField(fields, 'submenuMediaType');
  const imageRatioField = pickHeaderMenuBlockField(fields, 'submenuImageRatio');
  const cornerRadiusField = pickHeaderMenuBlockField(fields, 'submenuImageCornerRadius');
  const mobileNavBar = pickHeaderMenuBlockField(fields, 'mobileNavigationBar');
  const mobileAccordion = pickHeaderMenuBlockField(fields, 'mobileAccordion');
  const mobileDividers = pickHeaderMenuBlockField(fields, 'mobileDividers');

  const typographyFields = [topLevelSize, submenuSize, fontField, textCaseField].filter(
    (f): f is EditorFieldDef => Boolean(f)
  );
  const submenuFields = [mediaTypeField, imageRatioField, cornerRadiusField].filter(
    (f): f is EditorFieldDef => Boolean(f)
  );
  const mobileFields = [mobileNavBar, mobileAccordion, mobileDividers].filter(
    (f): f is EditorFieldDef => Boolean(f)
  );

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {menuField ? (
        <div className="space-y-1 px-1 py-3">
          <StoreMenuSelectFieldRow
            field={menuField}
            values={values}
            onFieldChange={onFieldChange}
            onStoreMenuSelect={onStoreMenuSelect}
          />
        </div>
      ) : null}

      {backgroundColorField || textColorField ? (
        <div className="px-1 py-3">
          <h3 className="text-[13px] font-semibold text-gray-900">Appearance</h3>
          <p className="mb-2 mt-1 text-[12px] leading-snug text-gray-500">
            Affects submenus on desktop and the main menu on mobile.
          </p>
          <div className="space-y-0.5">
            {backgroundColorField ? (
              <ThemePaletteColorField
                label={backgroundColorField.label}
                path={backgroundColorField.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={0}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {textColorField ? (
              <ThemeDefaultColorField
                label={textColorField.label}
                path={textColorField.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={1}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {typographyFields.length ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
          <div className="space-y-0.5">
            {typographyFields.map((field) =>
              field.path.endsWith('.textCase') ? (
                <MenuSegmentedFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : (
                <MenuInlineSelectFieldRow
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

      {submenuFields.length ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Submenu feature</h3>
          <div className="space-y-1">
            {mediaTypeField ? (
              <MenuInlineSelectFieldRow
                field={mediaTypeField}
                values={values}
                onFieldChange={onFieldChange}
                description={
                  mediaTypeField.description ??
                  'Features are populated from your menu links'
                }
              />
            ) : null}
            {imageRatioField ? (
              <MenuInlineSelectFieldRow
                field={imageRatioField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {cornerRadiusField ? (
              <MenuSliderFieldRow
                field={cornerRadiusField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {mobileFields.length ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Mobile layout</h3>
          <div className="space-y-0.5">
            {mobileFields.map((field) => (
              <MenuToggleFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
