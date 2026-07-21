import React from 'react';

interface AbandonedCartSummaryProps {
  totalItems: number;
  uniqueProducts: number;
  totalValue: number;
  lastUpdated: string;
  formatDate: (dateString: string) => string;
}

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AbandonedCartSummary: React.FC<AbandonedCartSummaryProps> = ({
  totalItems,
  uniqueProducts,
  totalValue,
  lastUpdated,
  formatDate,
}) => {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-gray-900">Cart summary</h2>
      </div>
      <dl className="divide-y divide-gray-100 px-4 py-1">
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <dt className="text-gray-600">Items</dt>
          <dd className="font-medium text-gray-900">{totalItems}</dd>
        </div>
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <dt className="text-gray-600">Products</dt>
          <dd className="font-medium text-gray-900">{uniqueProducts}</dd>
        </div>
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <dt className="text-gray-600">Estimated value</dt>
          <dd className="font-medium text-gray-900">{formatInr(totalValue)}</dd>
        </div>
        <div className="py-2.5 text-[13px]">
          <dt className="text-gray-600">Last updated</dt>
          <dd className="mt-0.5 font-medium text-gray-900">{formatDate(lastUpdated)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default AbandonedCartSummary;
