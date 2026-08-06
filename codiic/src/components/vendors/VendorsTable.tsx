import React from 'react';
import type { Vendor } from '../../contexts/vendor.context';
import {
  adminListTableHeadClass,
  adminListTableHeadRightClass,
  adminListTableHeadRowClass,
} from '../admin-list-ui';
import VendorsTableItem from './VendorsTableItem';

interface VendorsTableProps {
  vendors: Vendor[];
}

const VendorsTable: React.FC<VendorsTableProps> = ({ vendors }) => {
  return (
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className={adminListTableHeadClass}>Name</th>
            <th className={adminListTableHeadRightClass}>Updated</th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-admin-text">No vendors found</p>
                <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
                  Try changing the search term
                </p>
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => <VendorsTableItem key={vendor._id} vendor={vendor} />)
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VendorsTable;
