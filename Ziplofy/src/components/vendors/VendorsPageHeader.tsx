import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import React from 'react';
import { vendorPrimaryButtonClass } from './vendor-ui.util';

interface VendorsPageHeaderProps {
  onAddVendor: () => void;
}

const VendorsPageHeader: React.FC<VendorsPageHeaderProps> = ({ onAddVendor }) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <BuildingOffice2Icon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Vendors</h1>
      </div>

      <button type="button" onClick={onAddVendor} className={vendorPrimaryButtonClass}>
        Add vendor
      </button>
    </div>
  );
};

export default VendorsPageHeader;
