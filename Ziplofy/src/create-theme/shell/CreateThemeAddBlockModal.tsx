import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CREATE_THEME_BLOCK_LIST } from '../blocks/registry';
import type { CreateThemeBlock } from '../blocks/types';

const SHOPIFY_BLUE = '#005bd3';

const CATEGORIES = [
  { id: 'basic', label: 'Basic' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'layout', label: 'Layout' },
  { id: 'collection', label: 'Collection' },
  { id: 'footer', label: 'Footer' },
  { id: 'forms', label: 'Forms' },
  { id: 'links', label: 'Links' },
  { id: 'product', label: 'Product' },
] as const;

type Props = {
  open: boolean;
  sectionLabel?: string;
  onClose: () => void;
  onSelect: (block: CreateThemeBlock) => void;
};

export function CreateThemeAddBlockModal({ open, sectionLabel, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CREATE_THEME_BLOCK_LIST.filter((b) => {
      if (!q) return true;
      const hay = [b.label, b.category, ...b.keywords].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Add block{sectionLabel ? ` to ${sectionLabel}` : ''}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-gray-100 px-5 py-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blocks"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {CATEGORIES.map((cat) => {
            const items = filtered.filter((b) => b.category === cat.id);
            if (!items.length) return null;
            return (
              <div key={cat.id} className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {cat.label}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((block) => (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => onSelect(block)}
                      className="rounded-xl border border-gray-200 p-3 text-left hover:border-[#005bd3] hover:shadow-md"
                    >
                      <block.Preview />
                      <p className="mt-2 text-sm font-semibold text-gray-900">{block.label}</p>
                      <span className="text-xs font-medium" style={{ color: SHOPIFY_BLUE }}>
                        Add block
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
