import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface PickupInStoreCardProps {
  onSetUpClick?: () => void;
}

const PickupInStoreCard: React.FC<PickupInStoreCardProps> = ({
  onSetUpClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900">Pickup in store</h2>
            <InformationCircleIcon className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">
            Let customers pick up their orders at your locations
          </p>
        </div>
        <button
          type="button"
          onClick={onSetUpClick}
          className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Set up
        </button>
      </div>
    </div>
  );
};

export default PickupInStoreCard;

