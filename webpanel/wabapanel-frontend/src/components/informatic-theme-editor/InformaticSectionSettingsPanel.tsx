'use client';

import { X } from 'lucide-react';
import type { EditorFieldDef } from '@/lib/informatic-theme/load-static-pack';
import { InformaticFieldsList } from './InformaticFieldRow';
import type { StoreMenu, StoreMenuItem } from '@/lib/store-menu';

function SectionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

type InformaticSectionSettingsPanelProps = {
  title: string;
  fields: EditorFieldDef[];
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  onClose: () => void;
  storeId?: string | null;
  onStoreMenuSelect?: (
    menuFieldPath: string,
    menu: StoreMenu,
    items: StoreMenuItem[]
  ) => void;
  onLeadFormSelect?: (formFieldPath: string, form: { _id: string; name: string }) => void;
  onLeadFormClear?: (formFieldPath: string) => void;
};

export function InformaticSectionSettingsPanel({
  title,
  fields,
  config,
  onChange,
  onClose,
  storeId = null,
  onStoreMenuSelect,
  onLeadFormSelect,
  onLeadFormClear,
}: InformaticSectionSettingsPanelProps) {
  const visibleFields = fields.filter((f) => f.sidebar !== false && f.path);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#e1e1e1] bg-[#f6f6f7] px-2 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#005bd3] px-2 py-1.5 text-white">
          <SectionIcon className="h-4 w-4 shrink-0 opacity-90" />
          <span className="truncate text-[13px] font-semibold">{title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-[#ededed]"
          title="Close settings"
          aria-label="Close settings"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {visibleFields.length === 0 ? (
          <p className="text-[13px] text-gray-500">No settings for this item.</p>
        ) : (
          <InformaticFieldsList
            fields={visibleFields}
            config={config}
            onChange={onChange}
            storeId={storeId}
            onStoreMenuSelect={onStoreMenuSelect}
            onLeadFormSelect={onLeadFormSelect}
            onLeadFormClear={onLeadFormClear}
          />
        )}
      </div>
    </div>
  );
}
