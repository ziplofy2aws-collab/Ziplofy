import React, { useCallback } from 'react';

interface BillingPaymentMethodsSectionProps {
  onAddPayment: () => void;
}

const BillingPaymentMethodsSection: React.FC<BillingPaymentMethodsSectionProps> = ({ onAddPayment }) => {
  const handleAddPayment = useCallback(() => {
    onAddPayment();
  }, [onAddPayment]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Payment methods</h2>
      <p className="text-sm text-gray-500 mb-4">For purchases and bills in Ziplofy</p>
      <button
        type="button"
        onClick={handleAddPayment}
        className="w-full rounded-lg px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-start"
      >
        + Add payment method
      </button>
    </div>
  );
};

export default BillingPaymentMethodsSection;

