import React from 'react';
import { InformationCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CustomOrderFulfillmentCardProps {
  onAddClick?: () => void;
}

const CustomOrderFulfillmentCard: React.FC<CustomOrderFulfillmentCardProps> = ({
  onAddClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-base font-semibold text-gray-900">Custom order fulfillment</h2>
        <InformationCircleIcon className="w-4 h-4 text-gray-500" />
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Add an email for a custom fulfillment service that fulfills orders for you
      </p>
      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add fulfillment service
      </button>
    </div>
  );
};

export default CustomOrderFulfillmentCard;

