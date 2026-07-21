import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface BillingAddressCurrencySectionProps {
  onManage: (managePath?: string) => void;
}

const BillingAddressCurrencySection: React.FC<BillingAddressCurrencySectionProps> = ({ onManage }) => {
  const handleManageClick = useCallback(
    (managePath?: string) => {
      onManage(managePath);
    },
    [onManage]
  );

  const items = [
    { label: 'Store address', value: 'India', managePath: '/settings/general' },
    { label: 'Currency', value: 'INR (Indian Rupee)', managePath: undefined },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-base font-semibold text-gray-900">Address and currency</h2>
        <InformationCircleIcon className="w-4 h-4 text-gray-500" />
      </div>
      <p className="text-sm text-gray-500 mb-4">
        The options for your billing currency are determined by your billing address.
      </p>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 mb-3 flex justify-between items-center last:mb-0"
        >
          <div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-sm font-medium text-gray-900">{item.value}</p>
          </div>
          <button
            type="button"
            onClick={() => handleManageClick(item.managePath)}
            className="rounded-lg px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Manage
          </button>
        </div>
      ))}
    </div>
  );
};

export default BillingAddressCurrencySection;

