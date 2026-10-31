'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Product } from '../../contexts/product.context';

export type ThemeEditorCreateProductSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (product: Product) => void;
};

/** Webpanel stores have no product catalog — show a notice instead of the codiic product form. */
export function ThemeEditorCreateProductSheet({
  open,
  onClose,
}: ThemeEditorCreateProductSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40">
      <div className="w-[400px] rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-gray-900">Create product</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-gray-600">
          Product creation isn't available for this store yet. Product-driven
          sections can still be added and will show their layout in the preview.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-md bg-black px-4 py-2 text-[13px] font-medium text-white"
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
}
