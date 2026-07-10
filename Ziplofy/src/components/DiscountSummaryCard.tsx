import React from "react";

interface DiscountSummaryCardProps {
  appliesTo?: string;
  eligibility?: string;
  minimumPurchase?: string;
  minimumQuantity?: number | string;
}

function formatLabel(value?: string) {
  if (!value) return '—';
  return value
    .split(/[- ]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const DiscountSummaryCard: React.FC<DiscountSummaryCardProps> = ({
  appliesTo,
  eligibility,
  minimumPurchase,
  minimumQuantity,
}) => {
  const rows = [
    { label: 'Applies to', value: formatLabel(appliesTo) },
    { label: 'Eligibility', value: formatLabel(eligibility) },
    { label: 'Minimum purchase', value: minimumPurchase ? formatLabel(minimumPurchase) : '—' },
    { label: 'Minimum quantity', value: minimumQuantity != null && minimumQuantity !== '' ? String(minimumQuantity) : '—' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default DiscountSummaryCard;

