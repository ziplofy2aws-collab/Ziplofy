import React from 'react';
import type { Vendor } from '../../contexts/vendor.context';
import {
  getVendorInitials,
  vendorTableCellClass,
  vendorTableCellRightClass,
} from './vendor-ui.util';

interface VendorsTableItemProps {
  vendor: Vendor;
}

const VendorsTableItem: React.FC<VendorsTableItemProps> = ({ vendor }) => {
  const updated = new Date(vendor.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
      <td className={`${vendorTableCellClass} font-medium text-gray-900`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
            {getVendorInitials(vendor.name)}
          </div>
          <span className="truncate">{vendor.name}</span>
        </div>
      </td>
      <td className={`${vendorTableCellRightClass} text-gray-500`}>{updated}</td>
    </tr>
  );
};

export default VendorsTableItem;
