import React from 'react';
import type { Vendor } from '../../contexts/vendor.context';
import { vendorTableHeadClass, vendorTableHeadRightClass } from './vendor-ui.util';
import VendorsTableItem from './VendorsTableItem';

interface VendorsTableProps {
  vendors: Vendor[];
}

const VendorsTable: React.FC<VendorsTableProps> = ({ vendors }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className={vendorTableHeadClass}>Name</th>
            <th className={vendorTableHeadRightClass}>Updated</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No vendors found</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
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
