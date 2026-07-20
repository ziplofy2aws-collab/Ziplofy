import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import PackageList from './PackageList';
import { Packaging } from '../contexts/packaging.context';

interface PackagesSectionProps {
  packages: Packaging[];
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, packageId: string) => void;
  onAddPackage: () => void;
}

const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onMenuOpen,
  onAddPackage,
}) => {
  if (packages.length === 0) {
    return null;
  }

  return (
    <div>
      <PackageList packages={packages} onMenuOpen={onMenuOpen} />
      <div className="border-t border-gray-200 my-2" />
      <button
        onClick={onAddPackage}
        className="flex items-center gap-2 py-3 text-blue-600 hover:bg-gray-50 rounded transition-colors w-full"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="text-base font-normal">Add package</span>
      </button>
    </div>
  );
};

export default PackagesSection;

