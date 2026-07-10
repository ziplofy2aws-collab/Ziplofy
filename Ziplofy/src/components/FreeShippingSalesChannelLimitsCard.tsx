import React from "react";

interface FreeShippingSalesChannelLimitsCardProps {
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number | string;
  limitOneUsePerCustomer?: boolean;
}

const FreeShippingSalesChannelLimitsCard: React.FC<FreeShippingSalesChannelLimitsCardProps> = ({
  allowDiscountOnChannels,
  limitTotalUses,
  totalUsesLimit,
  limitOneUsePerCustomer,
}) => {
  const renderBoolean = (v?: boolean) => (v ? 'Yes' : 'No');

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Sales channel & limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Allow on channels</p>
            <p className="text-sm text-gray-900">{renderBoolean(allowDiscountOnChannels)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Limit total uses</p>
            <p className="text-sm text-gray-900">{renderBoolean(limitTotalUses)}</p>
          </div>
          {limitTotalUses && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total uses limit</p>
              <p className="text-sm text-gray-900">{totalUsesLimit}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">One use per customer</p>
            <p className="text-sm text-gray-900">{renderBoolean(limitOneUsePerCustomer)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeShippingSalesChannelLimitsCard;

