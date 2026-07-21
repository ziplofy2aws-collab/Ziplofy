import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Collection } from '../../contexts/collection.context';
import { CollectionCreateForm } from '../../pages/ProductCollectionCreatePage';

export type ThemeEditorCreateCollectionSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (collection: Collection) => void;
};

export function ThemeEditorCreateCollectionSheet({
  open,
  onClose,
  onCreated,
}: ThemeEditorCreateCollectionSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[15000] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close create collection"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-editor-create-collection-title"
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-center border-b border-[#e1e1e1] py-2">
          <span className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div id="theme-editor-create-collection-title" className="sr-only">
          Create collection
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <CollectionCreateForm
            variant="sheet"
            onCancel={onClose}
            onSuccess={(collection) => {
              onCreated?.(collection);
              onClose();
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
