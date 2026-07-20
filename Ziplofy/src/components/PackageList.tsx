import React from 'react';
import PackageListItem from './PackageListItem';
import { Packaging } from '../contexts/packaging.context';

interface PackageListProps {
  packages: Packaging[];
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, packageId: string) => void;
}

const PackageList: React.FC<PackageListProps> = ({ packages, onMenuOpen }) => {
  if (packages.length === 0) {
    return null;
  }

  return (
    <div>
      {packages.map((pkg, index) => (
        <PackageListItem
          key={pkg._id}
          package={pkg}
          index={index}
          totalPackages={packages.length}
          onMenuOpen={onMenuOpen}
        />
      ))}
    </div>
  );
};

export default PackageList;

