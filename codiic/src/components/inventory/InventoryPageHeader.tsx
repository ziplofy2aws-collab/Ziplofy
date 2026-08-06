import { CubeIcon } from '@heroicons/react/24/outline';
import React from 'react';

const InventoryPageHeader: React.FC = () => {
  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <CubeIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Inventory</h1>
      </div>
    </div>
  );
};

export default InventoryPageHeader;
