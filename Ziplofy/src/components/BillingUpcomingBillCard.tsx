import React, { useCallback } from 'react';

interface BillingUpcomingBillCardProps {
  onVisitPlanSettings: () => void;
}

const BillingUpcomingBillCard: React.FC<BillingUpcomingBillCardProps> = ({ onVisitPlanSettings }) => {
  const handleVisitPlanSettings = useCallback(() => {
    onVisitPlanSettings();
  }, [onVisitPlanSettings]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Upcoming bill</h2>
        <p className="text-2xl font-semibold text-gray-900">
          ₹0.00 <span className="text-base font-medium text-gray-600">INR</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Next bill in 30 days or when your ~₹5,330 INR threshold is reached. You have ₹5,330
          remaining.
        </p>
      </div>
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50/80">
        <p className="text-sm text-gray-500">
          To make changes to your plan,{' '}
          <button
            type="button"
            onClick={handleVisitPlanSettings}
            className="text-gray-700 font-medium cursor-pointer hover:text-gray-900 hover:underline transition-colors"
          >
            visit plan settings
          </button>
        </p>
      </div>
    </div>
  );
};

export default BillingUpcomingBillCard;

