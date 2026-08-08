import React from 'react';
import { adminListCardClass } from './admin-list-ui';

interface OrderIdSectionProps {
  orderIdPrefix: string;
  orderIdSuffix: string;
  onPrefixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuffixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const inputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-normal text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export default function OrderIdSection({
  orderIdPrefix,
  orderIdSuffix,
  onPrefixChange,
  onSuffixChange,
}: OrderIdSectionProps) {
  return (
    <div className={`${adminListCardClass} p-5`}>
      <h2 className="text-[13px] font-semibold text-admin-text">Order ID</h2>
      <p className="mb-4 mt-1 text-[13px] text-admin-text-secondary">
        Shown on the order page, customer pages, and customer order notifications to identify order
      </p>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor="order-id-prefix"
            className="mb-1 block text-[12px] font-medium text-admin-text-secondary"
          >
            Prefix
          </label>
          <input
            id="order-id-prefix"
            type="text"
            value={orderIdPrefix}
            onChange={onPrefixChange}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="order-id-suffix"
            className="mb-1 block text-[12px] font-medium text-admin-text-secondary"
          >
            Suffix
          </label>
          <input
            id="order-id-suffix"
            type="text"
            value={orderIdSuffix}
            onChange={onSuffixChange}
            className={inputClass}
          />
        </div>
      </div>

      <p className="text-[12px] text-admin-text-subdued">
        Your order ID will appear as {orderIdPrefix}1001{orderIdSuffix}, {orderIdPrefix}1002
        {orderIdSuffix}, {orderIdPrefix}1003{orderIdSuffix} ...
      </p>
    </div>
  );
}
