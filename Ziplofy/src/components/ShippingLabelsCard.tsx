import React from 'react';
import { CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ShippingLabelsCardProps {
  onCalculateRatesClick: () => void;
}

const ShippingLabelsCard: React.FC<ShippingLabelsCardProps> = ({
  onCalculateRatesClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900">Shipping labels</h2>
            <InformationCircleIcon className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">
            Buy labels with the lowest rates. Manage your carriers to fulfill orders faster.
          </p>
        </div>
        <button
          type="button"
          onClick={onCalculateRatesClick}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <CalculatorIcon className="w-4 h-4" />
          Calculate rates
        </button>
      </div>
    </div>
  );
};

export default ShippingLabelsCard;

