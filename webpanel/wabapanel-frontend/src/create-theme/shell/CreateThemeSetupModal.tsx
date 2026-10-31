import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  saving?: boolean;
  /** Theme pack must be ready before create is allowed. */
  canCreate?: boolean;
  onCreate: (payload: { themeName: string; themeDesc?: string }) => void;
};

/**
 * Blocking first-visit gate for /themes/create (no ?id).
 * Cannot be dismissed — only closes after a successful create in the parent.
 */
export function CreateThemeSetupModal({
  open,
  saving = false,
  canCreate = true,
  onCreate,
}: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setDesc('');
    setNameError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const trimmedName = name.trim();
  const createLabel = useMemo(() => {
    if (!trimmedName) return 'Create theme';
    return `Create “${trimmedName}”`;
  }, [trimmedName]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedName) {
      setNameError('Theme name is required');
      return;
    }
    if (!canCreate || saving) return;
    setNameError(null);
    const trimmedDesc = desc.trim();
    onCreate({
      themeName: trimmedName,
      ...(trimmedDesc ? { themeDesc: trimmedDesc } : {}),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[6200] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-theme-setup-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 id="create-theme-setup-title" className="text-base font-semibold text-gray-900">
            Name your theme
          </h2>
          <p className="mt-1 text-[13px] text-gray-500">
            Give your theme a name to get started. You can change this later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="create-theme-setup-name"
                className="mb-1.5 block text-sm font-medium text-gray-800"
              >
                Theme name <span className="text-red-600">*</span>
              </label>
              <input
                id="create-theme-setup-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                maxLength={120}
                autoFocus
                disabled={saving}
                placeholder="e.g. Summer launch"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] disabled:bg-gray-50"
              />
              {nameError ? <p className="mt-1 text-xs text-red-600">{nameError}</p> : null}
            </div>

            <div>
              <label
                htmlFor="create-theme-setup-desc"
                className="mb-1.5 block text-sm font-medium text-gray-800"
              >
                Description <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                id="create-theme-setup-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={saving}
                placeholder="Short note about this theme"
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={saving || !canCreate || !trimmedName}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Creating…' : !canCreate ? 'Loading theme…' : createLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
