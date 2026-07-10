import React from "react";

interface BuyXGetYSummaryCardProps {
  customerBuys?: string;
  quantity?: number;
  amount?: number;
  anyItemsFrom?: string;
  customerGetsQuantity?: number;
  customerGetsAnyItemsFrom?: string;
  value: string;
  eligibility?: string;
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number | string;
  limitOneUsePerCustomer?: boolean;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

function formatLabel(s?: string) {
  if (!s) return '—';
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const BuyXGetYSummaryCard: React.FC<BuyXGetYSummaryCardProps> = ({
  customerBuys,
  quantity,
  amount,
  anyItemsFrom,
  customerGetsQuantity,
  customerGetsAnyItemsFrom,
  value,
  eligibility,
  allowDiscountOnChannels,
  limitTotalUses,
  totalUsesLimit,
  limitOneUsePerCustomer,
  productDiscounts,
  orderDiscounts,
  shippingDiscounts,
  startDate,
  startTime,
  setEndDate,
  endDate,
  endTime,
  createdAt,
  updatedAt,
}) => {
  const yesNo = (v?: boolean) => (v ? 'Yes' : 'No');
  const buysDisplay =
    customerBuys === 'minimum-quantity' && quantity != null
      ? `Minimum quantity (${quantity})`
      : customerBuys === 'minimum-amount' && amount != null
        ? `Minimum amount (₹${amount})`
        : formatLabel(customerBuys);
  const startDisplay = [startDate, startTime].filter(Boolean).join(' ') || '—';
  const endDisplay = setEndDate ? [endDate, endTime].filter(Boolean).join(' ') || '—' : 'No end date';
  const formatDate = (d?: string | Date) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');

  const rows: { label: string; value: string }[] = [
    { label: 'Customer buys', value: buysDisplay },
    { label: 'Any items from', value: formatLabel(anyItemsFrom) },
    { label: 'Customer gets quantity', value: String(customerGetsQuantity ?? '—') },
    { label: 'Gets from', value: formatLabel(customerGetsAnyItemsFrom) },
    { label: 'Value', value },
    { label: 'Eligibility', value: formatLabel(eligibility) },
    { label: 'Allow on channels', value: yesNo(allowDiscountOnChannels) },
    { label: 'Limit total uses', value: limitTotalUses ? `Yes (${totalUsesLimit ?? '—'})` : 'No' },
    { label: 'Limit one per customer', value: yesNo(limitOneUsePerCustomer) },
    { label: 'Combinations', value: `Product ${yesNo(productDiscounts)} · Order ${yesNo(orderDiscounts)} · Shipping ${yesNo(shippingDiscounts)}` },
    { label: 'Active dates', value: `${startDisplay} → ${endDisplay}` },
    { label: 'Created / Updated', value: `${formatDate(createdAt)} / ${formatDate(updatedAt)}` },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map(({ label, value: v }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default BuyXGetYSummaryCard;

