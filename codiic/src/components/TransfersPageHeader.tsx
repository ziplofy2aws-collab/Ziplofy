import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface TransfersPageHeaderProps {
  onCreateTransfer: () => void;
}

const TransfersPageHeader: React.FC<TransfersPageHeaderProps> = ({ onCreateTransfer }) => {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div className="pl-3 border-l-4 border-blue-500/60">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transfers</h1>
        <p className="text-sm text-gray-500 mt-0.5">Move products between locations and keep inventory organized</p>
      </div>
      <button
        onClick={onCreateTransfer}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
      >
        <PlusIcon className="w-4 h-4" />
        Create Transfer
      </button>
    </div>
  );
};

export default TransfersPageHeader;

