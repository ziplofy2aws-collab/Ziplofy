import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ShippingDocumentsCardProps {
  onCustomizeStoreNameClick?: () => void;
  onPackingSlipTemplateClick?: () => void;
}

const ShippingDocumentsCard: React.FC<ShippingDocumentsCardProps> = ({
  onCustomizeStoreNameClick,
  onPackingSlipTemplateClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-900 mb-3">Shipping documents</h2>
      <div>
        <div
          onClick={onCustomizeStoreNameClick}
          className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <p className="text-sm font-medium text-gray-900">Customize store name on shipping labels</p>
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
        </div>
        <div className="border-t border-gray-200" />
        <div
          onClick={onPackingSlipTemplateClick}
          className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <p className="text-sm font-medium text-gray-900">Packing slip template</p>
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default ShippingDocumentsCard;

