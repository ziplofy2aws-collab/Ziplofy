import React from 'react';
import type { Vendor } from '../../contexts/vendor.context';
import { adminListTableCellClass, adminListTableCellRightClass } from '../admin-list-ui';
import { getVendorInitials } from './vendor-ui.util';

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
    <tr className="group border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover">
      <td className={`${adminListTableCellClass} font-medium text-admin-text`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-admin-secondary text-[11px] font-semibold text-admin-text-secondary">
            {getVendorInitials(vendor.name)}
          </div>
          <span className="truncate">{vendor.name}</span>
        </div>
      </td>
      <td className={adminListTableCellRightClass}>{updated}</td>
    </tr>
  );
};

export default VendorsTableItem;
