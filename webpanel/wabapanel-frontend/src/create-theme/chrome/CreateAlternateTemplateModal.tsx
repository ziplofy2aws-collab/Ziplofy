import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type AlternateTemplateOption = {
  id: string;
  name: string;
};

type CreateAlternateTemplateModalProps = {
  open: boolean;
  templates: AlternateTemplateOption[];
  defaultBasedOnId: string;
  error?: string;
  onClose: () => void;
  onCreate: (name: string, basedOnTemplateId: string) => void;
};

export function CreateAlternateTemplateModal({
  open,
  templates,
  defaultBasedOnId,
  error: externalError = '',
  onClose,
  onCreate,
}: CreateAlternateTemplateModalProps) {
  const [name, setName] = useState('');
  const [basedOn, setBasedOn] = useState(defaultBasedOnId);
  const [localError, setLocalError] = useState('');

  const basedOnOptions = useMemo(() => templates, [templates]);
  const displayError = localError || externalError;

  useEffect(() => {
    if (!open) return;
    setName('');
    setBasedOn(templates[0]?.id ?? defaultBasedOnId);
    setLocalError('');
  }, [defaultBasedOnId, open, templates]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError('Name is required');
      return;
    }
    if (trimmed.length > 25) {
      setLocalError('Name must be 25 characters or less');
      return;
    }
    onCreate(trimmed, basedOn);
  }, [basedOn, name, onCreate]);

  if (!open) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1500] cursor-default bg-black/20"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-[1510] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-alternate-template-title"
      >
        <div className="flex items-center justify-between border-b border-[#e3e3e3] px-4 py-3">
          <h2 id="create-alternate-template-title" className="text-[15px] font-semibold text-gray-900">
            Create a template
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <p className="text-[13px] leading-relaxed text-gray-600">
            Create a template to customize how your content is displayed. After it&apos;s published,
            assign it in the Shopify admin.
          </p>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-900">Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                maxLength={25}
                onChange={(e) => {
                  setName(e.target.value);
                  setLocalError('');
                }}
                className="w-full rounded-[10px] border border-[#c9cccf] px-3 py-2 pr-12 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none"
                autoFocus
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">
                {name.length}/25
              </span>
            </div>
            {displayError ? <p className="mt-1 text-[12px] text-red-600">{displayError}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-900">Based on</label>
            <select
              value={basedOn}
              onChange={(e) => setBasedOn(e.target.value)}
              className="w-full rounded-[10px] border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none"
            >
              {basedOnOptions.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e3e3e3] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#c9cccf] bg-white px-4 py-2 text-[13px] font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="rounded-[10px] bg-[#303030] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          >
            Create template
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/** @deprecated Use CreateAlternateTemplateModal */
export const CreateProductTemplateModal = CreateAlternateTemplateModal;
