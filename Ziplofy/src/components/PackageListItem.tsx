import React from 'react';
import { EllipsisVerticalIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Packaging } from '../contexts/packaging.context';

interface PackageListItemProps {
  package: Packaging;
  index: number;
  totalPackages: number;
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, packageId: string) => void;
}

const PackageListItem: React.FC<PackageListItemProps> = ({
  package: pkg,
  index,
  totalPackages,
  onMenuOpen,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4 flex-1">
          <TruckIcon className="w-6 h-6 text-gray-500" />
          <div>
            <p className="text-base font-medium text-gray-900 mb-1">{pkg.packageName}</p>
            <p className="text-sm text-gray-600">
              {pkg.length} × {pkg.width} × {pkg.height} {pkg.dimensionsUnit}, {pkg.weight} {pkg.weightUnit}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pkg.isDefault && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-normal rounded">
              Store default
            </span>
          )}
          <button
            onClick={(e) => onMenuOpen(e, pkg._id)}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {index < totalPackages - 1 && <div className="border-t border-gray-200" />}
    </div>
  );
};

export default PackageListItem;

