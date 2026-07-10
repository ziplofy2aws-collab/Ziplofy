import React from "react";

interface FreeShippingMinimumPurchaseCardProps {
  minimumPurchase?: string;
  minimumAmount?: number | string;
  minimumQuantity?: number | string;
}

const FreeShippingMinimumPurchaseCard: React.FC<FreeShippingMinimumPurchaseCardProps> = ({
  minimumPurchase,
  minimumAmount,
  minimumQuantity,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Minimum purchase</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Requirement</p>
            <p className="text-sm text-gray-900">{minimumPurchase}</p>
          </div>
          {minimumPurchase === 'minimum-amount' && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
              <p className="text-sm text-gray-900">₹{minimumAmount}</p>
            </div>
          )}
          {minimumPurchase === 'minimum-quantity' && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Quantity</p>
              <p className="text-sm text-gray-900">{minimumQuantity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeShippingMinimumPurchaseCard;

