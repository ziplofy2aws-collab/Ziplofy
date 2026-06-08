import React from 'react';
import { ColorField } from './create-theme-style-fields';
import type { ThemeGlobalSettings } from './create-theme-builder';

type Props = {
  settings: ThemeGlobalSettings;
  onChange: (next: ThemeGlobalSettings) => void;
};

const CreateThemeGlobalSettingsEditor: React.FC<Props> = ({ settings, onChange }) => {
  const setColors = (patch: Partial<ThemeGlobalSettings['colors']>) =>
    onChange({ ...settings, colors: { ...settings.colors, ...patch } });

  const setTypography = (patch: Partial<ThemeGlobalSettings['typography']>) =>
    onChange({ ...settings, typography: { ...settings.typography, ...patch } });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Theme colors</p>
        <ColorField label="Primary" value={settings.colors.primary} onChange={(v) => setColors({ primary: v })} />
        <ColorField label="Page background" value={settings.colors.background} onChange={(v) => setColors({ background: v })} />
        <ColorField label="Default text" value={settings.colors.text} onChange={(v) => setColors({ text: v })} />
      </div>
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Typography</p>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Heading font</label>
          <input
            type="text"
            value={settings.typography.fontFamily}
            onChange={(e) => setTypography({ fontFamily: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Body font</label>
          <input
            type="text"
            value={settings.typography.fontFamilyBody}
            onChange={(e) => setTypography({ fontFamilyBody: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Base font size (px)</label>
          <input
            type="number"
            min={10}
            max={24}
            value={settings.typography.baseFontSize}
            onChange={(e) => setTypography({ baseFontSize: Number(e.target.value) || 16 })}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Heading weight</label>
          <select
            value={settings.typography.headingFontWeight}
            onChange={(e) => setTypography({ headingFontWeight: e.target.value as 'normal' | 'bold' })}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Body style</label>
          <select
            value={settings.typography.bodyFontStyle}
            onChange={(e) => setTypography({ bodyFontStyle: e.target.value as 'normal' | 'italic' })}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Body underline</label>
          <select
            value={settings.typography.bodyTextDecoration}
            onChange={(e) => setTypography({ bodyTextDecoration: e.target.value as 'none' | 'underline' })}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          >
            <option value="none">None</option>
            <option value="underline">Underline</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[12px] font-medium text-gray-700">Body letter case</label>
          <select
            value={settings.typography.bodyTextTransform}
            onChange={(e) =>
              setTypography({
                bodyTextTransform: e.target.value as ThemeGlobalSettings['typography']['bodyTextTransform'],
              })
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-blue-400"
          >
            <option value="none">Normal</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CreateThemeGlobalSettingsEditor;
