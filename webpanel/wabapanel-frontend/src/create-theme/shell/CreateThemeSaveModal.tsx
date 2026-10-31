import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

type Props = {
  open: boolean;
  saving?: boolean;
  initialName?: string;
  initialDesc?: string;
  onClose: () => void;
  onSave: (payload: { themeName: string; themeDesc?: string }) => void;
};

export function CreateThemeSaveModal({
  open,
  saving = false,
  initialName = '',
  initialDesc = '',
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDesc(initialDesc);
    setNameError(null);
  }, [open, initialName, initialDesc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Theme name is required');
      return;
    }
    setNameError(null);
    const trimmedDesc = desc.trim();
    onSave({
      themeName: trimmed,
      ...(trimmedDesc ? { themeDesc: trimmedDesc } : {}),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[6100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-theme-modal-title"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="save-theme-modal-title" className="text-base font-semibold text-gray-900">
            Save theme
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="save-theme-name" className="mb-1.5 block text-sm font-medium text-gray-800">
                Theme name <span className="text-red-600">*</span>
              </label>
              <input
                id="save-theme-name"
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
              <label htmlFor="save-theme-desc" className="mb-1.5 block text-sm font-medium text-gray-800">
                Theme description <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                id="save-theme-desc"
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

          <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save theme'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
