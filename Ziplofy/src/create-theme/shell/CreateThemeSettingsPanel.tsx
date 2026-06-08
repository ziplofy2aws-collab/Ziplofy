import React, { useMemo } from 'react';
import { resolveCreateThemeSettingsFields } from '../_shared/resolve-settings-fields';

type Props = {
  config: Record<string, unknown>;
  selectedNodeId: string;
  values: Record<string, string | boolean>;
  onChange: (path: string, type: string, value: string | boolean) => void;
};

export function CreateThemeSettingsPanel({ config, selectedNodeId, values, onChange }: Props) {
  const fields = useMemo(
    () => resolveCreateThemeSettingsFields(config, selectedNodeId),
    [config, selectedNodeId]
  );

  if (!selectedNodeId) {
    return (
      <p className="px-4 py-6 text-sm text-gray-500">
        Select a section or block to edit. Field order comes from that element&apos;s{' '}
        <code className="text-xs">editing.ts</code> file.
      </p>
    );
  }

  if (!fields.length) {
    return (
      <p className="px-4 py-6 text-sm text-gray-500">
        No editing sequence for this selection. Add or update{' '}
        <code className="text-xs">create-theme/…/editing.ts</code>.
      </p>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4">
      {fields.map((field) => {
        const val = values[field.path];
        if (field.type === 'boolean') {
          return (
            <label key={field.path} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={val === true || val === 'true'}
                onChange={(e) => onChange(field.path, 'boolean', e.target.checked)}
              />
              {field.label}
            </label>
          );
        }
        if (field.type === 'textarea') {
          return (
            <label key={field.path} className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">{field.label}</span>
              <textarea
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                rows={3}
                value={val == null ? '' : String(val)}
                onChange={(e) => onChange(field.path, 'text', e.target.value)}
              />
            </label>
          );
        }
        return (
          <label key={field.path} className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{field.label}</span>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              value={val == null ? '' : String(val)}
              onChange={(e) => onChange(field.path, field.type ?? 'text', e.target.value)}
            />
          </label>
        );
      })}
    </div>
  );
}
