import React from 'react';

interface OrderIdSectionProps {
  orderIdPrefix: string;
  orderIdSuffix: string;
  onPrefixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuffixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function OrderIdSection({
  orderIdPrefix,
  orderIdSuffix,
  onPrefixChange,
  onSuffixChange,
}: OrderIdSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-900">Order ID</h2>
      <p className="mt-1 text-sm text-gray-500 mb-4">
        Shown on the order page, customer pages, and customer order notifications to identify order
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="flex-1">
          <label htmlFor="order-id-prefix" className="block text-xs font-medium text-gray-600 mb-1">
            Prefix
          </label>
          <input
            id="order-id-prefix"
            type="text"
            value={orderIdPrefix}
            onChange={onPrefixChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="order-id-suffix" className="block text-xs font-medium text-gray-600 mb-1">
            Suffix
          </label>
          <input
            id="order-id-suffix"
            type="text"
            value={orderIdSuffix}
            onChange={onSuffixChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Your order ID will appear as {orderIdPrefix}1001{orderIdSuffix}, {orderIdPrefix}1002{orderIdSuffix}, {orderIdPrefix}1003{orderIdSuffix} ...
      </p>
    </div>
  );
}

