import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface DeliveryCustomizationsCardProps {
  onAddClick?: () => void;
}

const DeliveryCustomizationsCard: React.FC<DeliveryCustomizationsCardProps> = ({
  onAddClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Delivery customizations</h2>
        <p className="text-sm text-gray-500">
          Customizations control how delivery options appear to buyers at checkout. You can hide, reorder, and rename delivery options.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add delivery customization
      </button>
    </div>
  );
};

export default DeliveryCustomizationsCard;

