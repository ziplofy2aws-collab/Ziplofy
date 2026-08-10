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
    <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-admin-text mb-4">Summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-[13px] text-admin-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default DiscountSummaryCard;

