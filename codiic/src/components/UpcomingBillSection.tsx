import React, { useCallback } from 'react';

interface UpcomingBillSectionProps {
  onViewBill: () => void;
  onAddPayment: () => void;
  handleVisitPlanSettings: () => void
}

const UpcomingBillSection: React.FC<UpcomingBillSectionProps> = ({
  onViewBill,
  onAddPayment,
  handleVisitPlanSettings,
}) => {
  const handleViewBill = useCallback(() => {
    onViewBill();
  }, [onViewBill]);

  const handleAddPayment = useCallback(() => {
    onAddPayment();
  }, [onAddPayment]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Upcoming bill</h2>
            <p className="mt-1 text-sm text-gray-500">Your next invoice and payment due date.</p>
            <div className="mt-3 text-2xl font-bold text-gray-900">
              ₹0.00 <span className="text-base font-normal text-gray-500">INR</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Next bill will be charged today</p>
          </div>
          <button
            type="button"
            onClick={handleViewBill}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0"
          >
            View bill
          </button>
        </div>
      </div>
      <div className="p-5 border-b border-gray-100">
        <button
          type="button"
          className="w-full rounded-lg px-4 py-3 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors text-left flex items-center gap-2"
          onClick={handleAddPayment}
        >
          <span className="text-lg leading-none">+</span> Add payment method
        </button>
      </div>
      <div className="p-5">
        <p className="text-sm text-gray-500">
          To make changes to your plan,{' '}
          <button
            type="button"
            onClick={handleVisitPlanSettings}
            className="text-gray-700 font-medium hover:underline"
          >
            visit plan settings
          </button>
        </p>
      </div>
    </div>
  );
};

export default UpcomingBillSection;

