import React from "react";

interface FreeShippingCombinationsCardProps {
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
}

const FreeShippingCombinationsCard: React.FC<FreeShippingCombinationsCardProps> = ({
  productDiscounts,
  orderDiscounts,
}) => {
  const renderBoolean = (v?: boolean) => (v ? 'Yes' : 'No');

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Combinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Product discounts</p>
            <p className="text-[13px] text-gray-900">{renderBoolean(productDiscounts)}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Order discounts</p>
            <p className="text-[13px] text-gray-900">{renderBoolean(orderDiscounts)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeShippingCombinationsCard;

