import React from 'react';
import type { Vendor } from '../../contexts/vendor.context';
import VendorListItem from './VendorListItem';

interface VendorListProps {
  vendors: Vendor[];
}

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  return (
    <ul className="divide-y divide-gray-100 px-3 py-3 sm:px-4 sm:py-4" aria-label="Vendors">
      {vendors.map((v) => (
        <li key={v._id}>
          <VendorListItem vendor={v} />
        </li>
      ))}
    </ul>
  );
};

export default VendorList;
