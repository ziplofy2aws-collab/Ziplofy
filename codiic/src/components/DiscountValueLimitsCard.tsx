import React from "react";

interface DiscountValueLimitsCardProps {
  valueType?: string;
  value: string;
  oncePerOrder?: boolean;
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number | string;
  limitOneUsePerCustomer?: boolean;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
}

const DiscountValueLimitsCard: React.FC<DiscountValueLimitsCardProps> = ({
  valueType,
  value,
  oncePerOrder,
  allowDiscountOnChannels,
  limitTotalUses,
  totalUsesLimit,
  limitOneUsePerCustomer,
  productDiscounts,
  orderDiscounts,
  shippingDiscounts,
}) => {
  const yesNo = (v?: boolean) => (v ? 'Yes' : 'No');

  const valueRows = [
    { label: 'Value type', value: valueType ?? '—' },
    { label: 'Value', value },
    { label: 'Once per order', value: yesNo(oncePerOrder) },
    { label: 'Allow discount on channels', value: yesNo(allowDiscountOnChannels) },
  ];
  const limitRows = [
    { label: 'Limit total uses', value: limitTotalUses ? `Yes (${totalUsesLimit ?? '—'})` : 'No' },
    { label: 'Limit one use per customer', value: yesNo(limitOneUsePerCustomer) },
  ];
  const comboRows = [
    { label: 'Product discounts', value: yesNo(productDiscounts) },
    { label: 'Order discounts', value: yesNo(orderDiscounts) },
    { label: 'Shipping discounts', value: yesNo(shippingDiscounts) },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Value & limits</h2>
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Discount value</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {valueRows.map(({ label, value: v }) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-[13px] text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Usage limits</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {limitRows.map(({ label, value: v }) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-[13px] text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Can combine with</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {comboRows.map(({ label, value: v }) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-[13px] text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountValueLimitsCard;

