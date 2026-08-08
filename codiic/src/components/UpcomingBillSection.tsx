import React, { useCallback } from 'react';
import { adminListCardClass, adminListFooterLinkClass } from './admin-list-ui';

interface UpcomingBillSectionProps {
  onViewBill: () => void;
  onAddPayment: () => void;
  handleVisitPlanSettings: () => void;
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
    <div className={adminListCardClass}>
      <div className="border-b border-admin-divider p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-admin-text">Upcoming bill</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Your next invoice and payment due date.
            </p>
            <div className="mt-3 text-2xl font-bold text-admin-text">
              ₹0.00 <span className="text-base font-normal text-admin-text-secondary">INR</span>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Next bill will be charged today
            </p>
          </div>
          <button
            type="button"
            onClick={handleViewBill}
            className="inline-flex shrink-0 items-center justify-center rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#005bd3] transition-colors hover:bg-admin-row-hover"
          >
            View bill
          </button>
        </div>
      </div>
      <div className="border-b border-admin-divider p-5">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-admin-border bg-admin-surface px-4 py-3 text-left text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover"
          onClick={handleAddPayment}
        >
          <span className="text-lg leading-none">+</span> Add payment method
        </button>
      </div>
      <div className="p-5">
        <p className="text-[13px] text-admin-text-secondary">
          To make changes to your plan,{' '}
          <button
            type="button"
            onClick={handleVisitPlanSettings}
            className={`${adminListFooterLinkClass} font-medium`}
          >
            visit plan settings
          </button>
        </p>
      </div>
    </div>
  );
};

export default UpcomingBillSection;
