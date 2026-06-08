import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { axiosi } from '../../config/axios.config';
import { useStore } from '../../contexts/store.context';

type FieldType = 'text' | 'textarea' | 'color' | 'boolean';

type FieldSchema = {
  key: string;
  label: string;
  type: FieldType;
  default: string | boolean;
};

type StoreConfigApiResponse = {
  success: boolean;
  data?: {
    storeId: string;
    themeId: string;
    themeName: string;
    schema: FieldSchema[];
    config: Record<string, unknown>;
    values: Record<string, string | boolean>;
  };
  message?: string;
};

function setNested(obj: Record<string, unknown>, dotKey: string, value: unknown): void {
  const parts = dotKey.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function buildConfigFromValues(
  schema: FieldSchema[],
  values: Record<string, string | boolean>
): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  for (const field of schema) {
    const raw = values[field.key];
    if (raw === undefined) continue;
    setNested(config, field.key, field.type === 'boolean' ? Boolean(raw) : String(raw));
  }
  return config;
}

type FlatThemeConfigEditorProps = { themeId: string };

const FlatThemeConfigEditor: React.FC<FlatThemeConfigEditorProps> = ({ themeId }) => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [schema, setSchema] = useState<FieldSchema[]>([]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  const load = useCallback(async () => {
    if (!themeId || !activeStoreId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: body } = await axiosi.get<StoreConfigApiResponse>(
        `/themes/${themeId}/store-config`,
        { params: { storeId: activeStoreId } }
      );
      if (!body?.success || !body.data) {
        throw new Error(body?.message || 'Failed to load theme settings');
      }
      setThemeName(body.data.themeName);
      setSchema(body.data.schema);
      setValues(body.data.values);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      setError(data?.message || data?.error || (err as Error)?.message || 'Failed to load theme settings');
    } finally {
      setLoading(false);
    }
  }, [themeId, activeStoreId]);

  useEffect(() => {
    load();
  }, [load]);

  const previewStyle = useMemo(() => {
    const primary = String(values['colors.primary'] ?? '#2563eb');
    const accent = String(values['colors.accent'] ?? '#7c3aed');
    const bg = String(values['colors.background'] ?? '#ffffff');
    const font = String(values['typography.fontFamily'] ?? 'system-ui, sans-serif');
    return { primary, accent, bg, font };
  }, [values]);

  const handleChange = (key: string, type: FieldType, raw: string | boolean) => {
    setValues((prev) => ({
      ...prev,
      [key]: type === 'boolean' ? Boolean(raw) : String(raw),
    }));
  };

  const handleSave = async () => {
    if (!activeStoreId || !themeId) return;
    setSaving(true);
    const toastId = toast.loading('Saving theme settings…');
    try {
      const config = buildConfigFromValues(schema, values);
      const { data: body } = await axiosi.put<StoreConfigApiResponse>(
        `/themes/${themeId}/store-config`,
        { storeId: activeStoreId, config }
      );
      if (!body?.success) throw new Error(body?.message || 'Save failed');
      if (body.data?.values) setValues(body.data.values);
      toast.success('Theme settings saved', { id: toastId });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      toast.error(data?.message || data?.error || (err as Error)?.message || 'Failed to save', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/themes/all-themes')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
          <h1 className="text-base font-semibold text-gray-900 sm:text-lg">
            {themeName ? `Customize: ${themeName}` : 'Theme customization'}
          </h1>
          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="ml-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <section className="w-full shrink-0 space-y-4 lg:max-w-md">
          {loading && <p className="text-sm text-gray-500">Loading settings…</p>}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {!loading && !error && schema.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(v) => handleChange(field.key, field.type, v)}
            />
          ))}
        </section>

        <section className="min-h-[320px] flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</h3>
          <div
            className="overflow-hidden rounded-xl border border-gray-100"
            style={{ backgroundColor: previewStyle.bg, fontFamily: previewStyle.font }}
          >
            {values['header.announcement'] ? (
              <div
                className="px-4 py-2 text-center text-xs font-medium text-white"
                style={{ backgroundColor: previewStyle.primary }}
              >
                {String(values['header.announcement'])}
              </div>
            ) : null}
            <div className="px-6 py-10">
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: previewStyle.primary }}>
                {String(values['hero.title'] ?? '')}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-gray-600">{String(values['hero.subtitle'] ?? '')}</p>
              {values['hero.showCta'] !== false && (
                <button
                  type="button"
                  className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: previewStyle.accent }}
                >
                  {String(values['hero.ctaLabel'] ?? 'Shop now')}
                </button>
              )}
            </div>
            <footer className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-500">
              {String(values['footer.copyright'] ?? '© Your store')}
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
};

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  const id = `field-${field.key.replace(/\./g, '-')}`;
  return (
    <label htmlFor={id} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <span className="mb-2 block text-sm font-medium text-gray-900">{field.label}</span>
      {field.type === 'boolean' ? (
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
      ) : field.type === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      ) : field.type === 'color' ? (
        <div className="flex items-center gap-3">
          <input
            id={id}
            type="color"
            value={String(value ?? field.default)}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-gray-200"
          />
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
          />
        </div>
      ) : (
        <input
          id={id}
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}

export default FlatThemeConfigEditor;
