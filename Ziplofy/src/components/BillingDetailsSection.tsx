import React, { useCallback } from 'react';

interface BillingDetailsSectionProps {
  onViewCharges: () => void;
}

const BillingDetailsSection: React.FC<BillingDetailsSectionProps> = ({ onViewCharges }) => {
  const handleViewCharges = useCallback(() => {
    onViewCharges();
  }, [onViewCharges]);

  const details = [
    { label: 'Subtotal', value: '₹0.00' },
    { label: 'Running total', value: '₹0.00' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Details</h2>
        <button
          type="button"
          className="rounded-lg px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          onClick={handleViewCharges}
        >
          View in charge table
        </button>
      </div>
      {details.map((row) => (
        <div
          key={row.label}
          className="flex justify-between px-5 py-3 border-t border-gray-200"
        >
          <p className="text-sm font-medium text-gray-900">{row.label}</p>
          <p className="text-sm font-medium text-gray-900">{row.value}</p>
        </div>
      ))}
    </div>
  );
};

export default BillingDetailsSection;

