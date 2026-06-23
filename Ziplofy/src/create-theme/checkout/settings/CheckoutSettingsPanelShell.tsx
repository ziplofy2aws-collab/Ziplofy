import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function CheckoutSettingsPanelShell({ title, onClose, children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-[#e1e1e1] px-4 py-3">
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-[#ededed]"
          title="Close settings"
          aria-label="Close settings"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}
