import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface GiftCardDetailHeaderProps {
  onBack: () => void;
  onDeactivate: () => void;
  isActive: boolean;
}

const GiftCardDetailHeader: React.FC<GiftCardDetailHeaderProps> = ({
  onBack,
  onDeactivate,
  isActive
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to gift cards
      </button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gift Card Details</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and view gift card information</p>
        </div>
        <button
          onClick={onDeactivate}
          disabled={!isActive}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200"
        >
          <TrashIcon className="w-4 h-4" />
          Deactivate
        </button>
      </div>
    </div>
  );
};

export default GiftCardDetailHeader;

