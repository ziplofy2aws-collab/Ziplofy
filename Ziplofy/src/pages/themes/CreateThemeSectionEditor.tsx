import React from 'react';
import { TextStyleEditor } from './create-theme-style-fields';
import {
  editorFieldsForSection,
  patchSectionConfig,
  type EditorFieldDef,
  type SectionConfig,
} from './create-theme-builder';
import type { SectionAppearance, TextStyleSettings } from './create-theme-style.utils';

type Props = {
  config: SectionConfig;
  sectionLabel: string;
  instanceId: string;
  onChange: (next: SectionConfig) => void;
};

function fieldValue(config: SectionConfig, key: string): string | boolean | number {
  const v = (config as Record<string, unknown>)[key];
  if (v === undefined || v === null) return '';
  return v as string | boolean | number;
}

function FieldRow({
  field,
  config,
  onChange,
}: {
  field: EditorFieldDef;
  config: SectionConfig;
  onChange: (next: SectionConfig) => void;
}) {
  const val = fieldValue(config, field.key);
  const id = `creator-field-${field.key}`;

  if (field.type === 'boolean') {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg py-1">
        <span className="text-[13px] font-medium text-gray-800">{field.label}</span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(val)}
          onChange={(e) => onChange(patchSectionConfig(config, field.key, e.target.checked))}
          className="h-[18px] w-[18px] shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </label>
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-gray-800">
        {field.label}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          value={String(val)}
          onChange={(e) => onChange(patchSectionConfig(config, field.key, e.target.value))}
          className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      ) : field.type === 'number' ? (
        <input
          id={id}
          type="number"
          min={1}
          max={24}
          value={String(val)}
          onChange={(e) => onChange(patchSectionConfig(config, field.key, Number(e.target.value) || 1))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={String(val)}
          onChange={(e) => onChange(patchSectionConfig(config, field.key, e.target.value))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      )}
    </div>
  );
}

function SectionStyleEditors({ config, onChange }: { config: SectionConfig; onChange: (next: SectionConfig) => void }) {
  const setAppearance = (appearance: SectionAppearance) => {
    onChange({ ...config, appearance } as SectionConfig);
  };

  const setTextStyle = (
    key: 'eyebrowStyle' | 'titleStyle' | 'subtitleStyle' | 'headerStyle' | 'viewAllStyle',
    style: TextStyleSettings
  ) => {
    onChange({ ...config, [key]: style } as SectionConfig);
  };

  const patchAppearanceText = (text: TextStyleSettings) =>
    setAppearance({ ...config.appearance, text });

  return (
    <div className="space-y-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Colors & typography</p>
      <TextStyleEditor
        title="Section"
        value={config.appearance.text}
        backgroundColor={config.appearance.backgroundColor}
        showBackground
        onBackgroundChange={(backgroundColor) => setAppearance({ ...config.appearance, backgroundColor })}
        onChange={patchAppearanceText}
      />
      {config.kind === 'hero_main' ? (
        <>
          <TextStyleEditor title="Eyebrow" value={config.eyebrowStyle} onChange={(s) => setTextStyle('eyebrowStyle', s)} />
          <TextStyleEditor title="Heading" value={config.titleStyle} onChange={(s) => setTextStyle('titleStyle', s)} />
          <TextStyleEditor title="Body text" value={config.subtitleStyle} onChange={(s) => setTextStyle('subtitleStyle', s)} />
        </>
      ) : null}
      {config.kind === 'product_cards' ? (
        <>
          <TextStyleEditor title="Section title" value={config.headerStyle} onChange={(s) => setTextStyle('headerStyle', s)} />
          <TextStyleEditor title="View all link" value={config.viewAllStyle} onChange={(s) => setTextStyle('viewAllStyle', s)} />
        </>
      ) : null}
      {config.kind === 'footer' ? (
        <>
          <TextStyleEditor title="Heading" value={config.titleStyle} onChange={(s) => onChange({ ...config, titleStyle: s })} />
          <TextStyleEditor title="Subtext" value={config.subtitleStyle} onChange={(s) => onChange({ ...config, subtitleStyle: s })} />
        </>
      ) : null}
    </div>
  );
}

const CreateThemeSectionEditor: React.FC<Props> = ({ config, sectionLabel, instanceId, onChange }) => {
  const fields = editorFieldsForSection(config);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{sectionLabel}</p>
        <p className="mt-0.5 font-mono text-[11px] text-gray-500">{instanceId}</p>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Content</p>
        {fields.map((field) => (
          <FieldRow key={field.key} field={field} config={config} onChange={onChange} />
        ))}
      </div>
      <SectionStyleEditors config={config} onChange={onChange} />
    </div>
  );
};

export default CreateThemeSectionEditor;
