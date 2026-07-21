import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';
import { configLocalStorageKeyForPack } from '../../config/theme-editor-static.config';

export type ThemeEditorJsonViewTab = 'merged' | 'values' | 'base';

type ThemeEditorLiveConfigModalProps = {
  open: boolean;
  onClose: () => void;
  staticDevMode: boolean;
  packId?: string;
  mergedConfig: Record<string, unknown>;
  formValues: Record<string, string | boolean>;
  baseConfig: Record<string, unknown> | null;
  /** Override modal title (e.g. Theme Creator “View theme”). */
  title?: string;
  /** Override intro copy; when set, static-dev localStorage hint is omitted. */
  description?: React.ReactNode;
  initialTab?: ThemeEditorJsonViewTab;
};

function formatJson(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

const TAB_LABELS: Record<ThemeEditorJsonViewTab, string> = {
  merged: 'Merged config',
  values: 'Form values',
  base: 'Base structure',
};

const TAB_HINTS: Record<ThemeEditorJsonViewTab, string> = {
  merged:
    'Full theme config after your edits — preview, Save, and production API all use this shape (sections, layout_order, templates, settings).',
  values:
    'Flat map from the sidebar (dot paths → strings/booleans). Merged into the config above on every change.',
  base:
    'Structure in memory (sections added/removed/reordered). Combined with form values to produce merged config.',
};

export const ThemeEditorLiveConfigModal: React.FC<ThemeEditorLiveConfigModalProps> = ({
  open,
  onClose,
  staticDevMode,
  packId,
  mergedConfig,
  formValues,
  baseConfig,
  title = 'Theme edit JSON',
  description,
  initialTab = 'merged',
}) => {
  const [tab, setTab] = useState<ThemeEditorJsonViewTab>(initialTab);
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    if (tab === 'values') return formValues;
    if (tab === 'base') return baseConfig ?? {};
    return mergedConfig;
  }, [tab, mergedConfig, formValues, baseConfig]);

  const jsonText = useMemo(() => formatJson(payload), [payload]);

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [jsonText]);

  const storageKey =
    staticDevMode && packId ? configLocalStorageKeyForPack(packId) : null;

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="lg" title={title}>
      <div className="flex max-h-[min(78vh,720px)] flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-gray-600">
          {description != null ? (
            description
          ) : staticDevMode ? (
            <>
              This is the live config built in editor state. It updates as you edit fields, add
              sections, and reorder the sidebar. <strong>Save</strong> writes the merged config to{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-[12px]">
                localStorage
              </code>{' '}
              (not the database).
              {storageKey ? (
                <>
                  {' '}
                  Key: <code className="rounded bg-gray-100 px-1 py-0.5 text-[12px]">{storageKey}</code>
                </>
              ) : null}
            </>
          ) : (
            <>
              Live merged config from the editor. <strong>Save</strong> persists store overrides to
              the database via the theme config API (same JSON shape).
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
          {(Object.keys(TAB_LABELS) as ThemeEditorJsonViewTab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                tab === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void copyJson()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="text-[12px] text-gray-500">{TAB_HINTS[tab]}</p>

        <pre className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200 bg-[#0f172a] p-4 text-[12px] leading-relaxed text-emerald-100/95">
          <code>{jsonText}</code>
        </pre>
      </div>
    </Modal>
  );
};

export default ThemeEditorLiveConfigModal;
