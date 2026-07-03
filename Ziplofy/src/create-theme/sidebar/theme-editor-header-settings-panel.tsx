import React, { useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import {
  HEADER_ELEMENT_GROUP_ORDER,
  groupHeaderPanelFields,
} from './theme-editor-header-panel.utils';
import { ThemePaletteColorField } from '../settings/ThemePaletteColorField';
import { ThemeDefaultColorField } from '../settings/ThemeDefaultColorField';
import { ThemeHexColorField } from '../settings/ThemeHexColorField';

type PanelProps = {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function SegmentedRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: PanelProps['onFieldChange'];
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

function ToggleRow({
  field,
  values,
  onFieldChange,
  labelOverride,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: PanelProps['onFieldChange'];
  labelOverride?: string;
}) {
  const id = fieldInputId(field.path);
  const checked = Boolean(values[field.path]);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {labelOverride ?? field.label}
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

function SelectDropdownRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: PanelProps['onFieldChange'];
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || '';

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="relative min-w-[140px]">
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, fieldTypeFromSchema(field.type), e.target.value)}
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

function SliderRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: PanelProps['onFieldChange'];
}) {
  const min = field.min ?? 0;
  const max = field.max ?? 12;
  const step = field.step ?? 1;
  const raw = fieldValueAsString(values, field);
  const num = Number(raw);
  const value = Number.isFinite(num) ? Math.min(max, Math.max(min, num)) : min;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="flex min-w-[180px] items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
          className="h-1.5 flex-1 cursor-pointer accent-[#303030]"
        />
        <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="w-10 border-0 bg-transparent py-1.5 pl-2 pr-0 text-center text-[13px] text-gray-900 focus:outline-none"
          />
          {field.unit ? (
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">{field.unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ManageLink({ label, href }: { label: string; href: string }) {
  return (
    <button
      type="button"
      className="text-[12px] text-gray-600 underline decoration-gray-400 underline-offset-2 hover:text-gray-900"
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
    >
      {label}
    </button>
  );
}

function CustomerAccountSection({
  fields,
  values,
  onFieldChange,
}: PanelProps & { fields: EditorFieldDef[] }) {
  const menu = fields[0];
  if (!menu) return null;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Customer account</h3>
      <p className="mb-2 text-[12px] leading-snug text-gray-500">
        <ManageLink label="Manage visibility" href="/settings/customer_accounts" /> in customer
        account settings. Legacy accounts not supported.
      </p>
      <SelectDropdownRow field={menu} values={values} onFieldChange={onFieldChange} />
    </div>
  );
}

function PageBackgroundSection({
  title,
  field,
  values,
  onFieldChange,
}: {
  title: string;
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: PanelProps['onFieldChange'];
}) {
  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{title}</h3>
      <ToggleRow
        field={field}
        values={values}
        onFieldChange={onFieldChange}
        labelOverride={field.description ?? 'Transparent background'}
      />
    </div>
  );
}

function ThemeSettingsAccordion({
  fields,
  values,
  onFieldChange,
}: PanelProps & { fields: EditorFieldDef[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-t border-[#e1e1e1] px-1 py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-left text-[13px] font-medium text-gray-800"
      >
        Theme Settings
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="space-y-1 pb-2">
          {fields.map((field) => {
            if (field.widget === 'segmented') {
              return (
                <SegmentedRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
              );
            }
            if (field.widget === 'link') {
              return (
                <div key={field.path} className="py-1">
                  <span className="mb-1 block text-[13px] text-gray-800">{field.label}</span>
                  <input
                    type="text"
                    value={fieldValueAsString(values, field)}
                    onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
                  />
                </div>
              );
            }
            if (field.type === 'boolean') {
              return (
                <ToggleRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
              );
            }
            return (
              <div key={field.path} className="py-1">
                <span className="mb-1 block text-[13px] text-gray-800">{field.label}</span>
                <input
                  type="text"
                  value={fieldValueAsString(values, field)}
                  onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CustomCssAccordion({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: PanelProps['onFieldChange'];
}) {
  const [open, setOpen] = React.useState(false);
  const id = fieldInputId(field.path);

  return (
    <div className="border-t border-[#e1e1e1] px-1 py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-left text-[13px] font-medium text-gray-800"
      >
        Custom CSS
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="pb-2">
          <textarea
            id={id}
            rows={6}
            value={fieldValueAsString(values, field)}
            onChange={(e) => onFieldChange(field.path, 'textarea', e.target.value)}
            className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 font-mono text-[12px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            placeholder="Add custom CSS for this section"
          />
        </div>
      ) : null}
    </div>
  );
}

function DefaultSection({
  title,
  fields,
  values,
  onFieldChange,
}: PanelProps & { title: string; fields: EditorFieldDef[] }) {
  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{title}</h3>
      <div className="space-y-0.5">
        {fields.map((field) => {
          if (field.widget === 'segmented') {
            return (
              <SegmentedRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          if (field.widget === 'slider') {
            return <SliderRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />;
          }
          if (field.type === 'boolean' || field.widget === 'toggle') {
            return <ToggleRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />;
          }
          if (field.widget === 'select' || (field.type === 'select' && field.options?.length)) {
            return (
              <SelectDropdownRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <SelectDropdownRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
      </div>
    </div>
  );
}

/** Shopify Header element settings — fixed section order and controls. */
export function HeaderSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: PanelProps & { colorPalette: string[] }) {
  const grouped = useMemo(() => groupHeaderPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {HEADER_ELEMENT_GROUP_ORDER.map((key) => {
        const groupFields = grouped.get(key);
        if (!groupFields?.length) return null;

        if (key === 'Customer account') {
          return (
            <CustomerAccountSection
              key={key}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (key === '__appearance__') {
          return (
            <div key={key} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
              <div className="space-y-0.5">
                {groupFields.map((field) => {
                  if (field.widget === 'color' || field.type === 'color') {
                    return (
                      <ThemeDefaultColorField
                        key={field.path}
                        label={field.label}
                        path={field.path}
                        values={values}
                        colorPalette={colorPalette}
                        defaultPaletteIndex={1}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
                    );
                  }
                  if (field.widget === 'select' || field.options?.length) {
                    return (
                      <SelectDropdownRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        }
        if (key === 'Utilities') {
          const menuStyle = groupFields.find((f) => f.path.endsWith('menuStyle'));
          if (!menuStyle) return null;
          const sizeField = groupFields.find((f) => f.path.endsWith('utilityTextSize'));
          const fontField = groupFields.find((f) => f.path.endsWith('utilityTextFont'));
          const caseField = groupFields.find((f) => f.path.endsWith('utilityTextCase'));
          const isText = fieldValueAsString(values, menuStyle) === 'text';
          return (
            <div key={key} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Utilities</h3>
              <SegmentedRow field={menuStyle} values={values} onFieldChange={onFieldChange} />
              {menuStyle.description ? (
                <p className="mb-1 mt-1 text-[12px] text-gray-500">{menuStyle.description}</p>
              ) : null}
              {isText ? (
                <div className="mt-2 space-y-0.5">
                  {sizeField ? (
                    <SelectDropdownRow field={sizeField} values={values} onFieldChange={onFieldChange} />
                  ) : null}
                  {fontField ? (
                    <SelectDropdownRow field={fontField} values={values} onFieldChange={onFieldChange} />
                  ) : null}
                  {caseField ? (
                    <SegmentedRow field={caseField} values={values} onFieldChange={onFieldChange} />
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        }
        if (key === 'Colors') {
          const background = groupFields.find((f) => f.path.endsWith('topRowBackground'));
          const text = groupFields.find((f) => f.path.endsWith('topRowText'));
          const bottomBackground = groupFields.find((f) => f.path.endsWith('bottomRowBackground'));
          const bottomText = groupFields.find((f) => f.path.endsWith('bottomRowText'));
          if (!background && !text && !bottomBackground && !bottomText) return null;
          return (
            <div key={key} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Colors</h3>
              <div className="space-y-0.5">
                {background ? (
                  <ThemePaletteColorField
                    label={background.label}
                    path={background.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {text ? (
                  <ThemeDefaultColorField
                    label={text.label}
                    path={text.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={1}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bottomBackground ? (
                  <ThemeDefaultColorField
                    label={bottomBackground.label}
                    path={bottomBackground.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bottomText ? (
                  <ThemeDefaultColorField
                    label={bottomText.label}
                    path={bottomText.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={1}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }
        if (key === 'Cart bubble') {
          const bubble = groupFields.find((f) => f.path.endsWith('cartBubbleStyle'));
          if (!bubble) return null;
          const bubbleBackground = groupFields.find((f) => f.path.endsWith('cartBubbleBackground'));
          const bubbleText = groupFields.find((f) => f.path.endsWith('cartBubbleText'));
          const isCustom = fieldValueAsString(values, bubble) === 'custom';
          return (
            <div key={key} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Cart bubble</h3>
              <SegmentedRow field={bubble} values={values} onFieldChange={onFieldChange} />
              {isCustom ? (
                <div className="mt-2 space-y-0.5">
                  {bubbleBackground ? (
                    <ThemeHexColorField
                      label={bubbleBackground.label}
                      path={bubbleBackground.path}
                      values={values}
                      defaultColor="#000000"
                      onFieldChange={onFieldChange}
                    />
                  ) : null}
                  {bubbleText ? (
                    <ThemeHexColorField
                      label={bubbleText.label}
                      path={bubbleText.path}
                      values={values}
                      defaultColor="#ffffff"
                      onFieldChange={onFieldChange}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        }
        if (key === '__page_home__' || key === '__page_product__' || key === '__page_collection__') {
          const field = groupFields[0];
          const titles: Record<string, string> = {
            __page_home__: 'Home page',
            __page_product__: 'Product page',
            __page_collection__: 'Collection page',
          };
          return (
            <PageBackgroundSection
              key={key}
              title={titles[key] ?? field.label}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (key === 'Theme settings') {
          return (
            <ThemeSettingsAccordion
              key={key}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (key === 'Custom CSS') {
          const css = groupFields[0];
          return css ? (
            <CustomCssAccordion key={key} field={css} values={values} onFieldChange={onFieldChange} />
          ) : null;
        }

        return (
          <DefaultSection
            key={key}
            title={key}
            fields={groupFields}
            values={values}
            onFieldChange={onFieldChange}
          />
        );
      })}
    </div>
  );
}
