import React, { useEffect, useRef, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { MANUAL_PAYMENT_OPTIONS } from '../../constants/manual-payment-providers';
import type { ManualPaymentProviderKey } from '../../constants/manual-payment-providers';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50';

interface ManualPaymentMethodMenuProps {
  connectedKeys?: string[];
  onSelect: (key: ManualPaymentProviderKey) => void;
}

const ManualPaymentMethodMenu: React.FC<ManualPaymentMethodMenuProps> = ({
  connectedKeys = [],
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableOptions = MANUAL_PAYMENT_OPTIONS.filter(
    (option) => !connectedKeys.includes(option.key)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        className={btnGhost}
        onClick={() => setOpen((prev) => !prev)}
        disabled={availableOptions.length === 0}
      >
        <PlusIcon className="h-4 w-4" />
        Manual payment method
      </button>

      {open && availableOptions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[16rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {availableOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className="flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onSelect(option.key);
              }}
            >
              <span className="text-sm font-medium text-gray-900">{option.label}</span>
              <span className="mt-0.5 text-xs text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManualPaymentMethodMenu;
