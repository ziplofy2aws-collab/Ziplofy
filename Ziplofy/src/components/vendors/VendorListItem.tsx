import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';
import type { Vendor } from '../../contexts/vendor.context';

interface VendorListItemProps {
  vendor: Vendor;
}

const VendorListItem: React.FC<VendorListItemProps> = ({ vendor }) => {
  const initials = useMemo(() => {
    const parts = vendor.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [vendor.name]);

  const updated = new Date(vendor.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-xl px-3 py-3 transition-colors hover:bg-blue-50/40 sm:px-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm ring-2 ring-blue-100">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{vendor.name}</p>
            <p className="mt-0.5 font-mono text-[11px] text-gray-400">ID · {vendor._id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
          <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
          <span className="hidden sm:inline">Updated </span>
          <span className="font-medium text-gray-600">{updated}</span>
        </div>
      </div>
    </div>
  );
};

export default VendorListItem;
