import React from 'react';
import { ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface DeliveryExpectationsCardProps {
  estimatedDeliveryMode: 'off' | 'manual';
  onEstimatedDeliveryClick: () => void;
  onShopPromiseClick?: () => void;
}

const DeliveryExpectationsCard: React.FC<DeliveryExpectationsCardProps> = ({
  estimatedDeliveryMode,
  onEstimatedDeliveryClick,
  onShopPromiseClick,
}) => {
  const getEstimatedDeliveryLabel = () => {
    return estimatedDeliveryMode === 'manual' ? 'Manual' : 'Off';
  };

  const getEstimatedDeliveryLabelClass = () => {
    return estimatedDeliveryMode === 'manual'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-gray-900">Delivery expectations</h2>
        <InformationCircleIcon className="w-4 h-4 text-gray-500" />
      </div>

      {/* Estimated delivery dates section */}
      <div
        onClick={onEstimatedDeliveryClick}
        className="flex justify-between items-center pb-4 cursor-pointer hover:bg-gray-50 transition-colors -mx-4 px-4"
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">Estimated delivery dates</p>
          <p className="text-sm text-gray-500">
            Increase conversion and build trust with delivery dates on your store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-medium border border-gray-200 ${
            estimatedDeliveryMode === 'manual' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600'
          }`}>
            {getEstimatedDeliveryLabel()}
          </span>
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Shop Promise section */}
      <div
        onClick={onShopPromiseClick}
        className="flex justify-between items-center pt-4 cursor-pointer hover:bg-gray-50 transition-colors -mx-4 px-4"
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">Shop Promise</p>
          <p className="text-sm text-gray-500">
            Highlight that you're an exceptional shipper with dates backed by a badge and guarantee.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
            Off
          </span>
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default DeliveryExpectationsCard;

