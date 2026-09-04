'use client';

import { Plus } from 'lucide-react';
import type { SectionCatalogEntry } from '@/lib/informatic-theme/informatic-section-catalog.util';

type Props = {
  catalog: SectionCatalogEntry[];
  onInsert: (catalogType: string) => void;
  disabled?: boolean;
};

export function InformaticAddSectionButton({ catalog, onInsert, disabled = false }: Props) {
  if (catalog.length === 0) return null;

  return (
    <div className="border-t border-[#e1e1e1] px-3 py-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Add section</p>
      <div className="flex flex-col gap-1.5">
        {catalog.map((entry) => (
          <button
            key={entry.type}
            type="button"
            disabled={disabled}
            onClick={() => onInsert(entry.type)}
            className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-3 py-2.5 text-left text-[13px] font-medium text-gray-900 shadow-sm transition-colors hover:border-[#005bd3] hover:bg-blue-50 disabled:opacity-60"
          >
            <Plus className="h-4 w-4 shrink-0 text-[#005bd3]" aria-hidden />
            {entry.label || entry.type}
          </button>
        ))}
      </div>
    </div>
  );
}
