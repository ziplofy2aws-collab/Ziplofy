import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BillingDetailsSection from '../../components/BillingDetailsSection';
import BillingUpcomingBillCard from '../../components/BillingUpcomingBillCard';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const BillingUpcomingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/settings/billing');
  }, [navigate]);

  const handleViewCharges = useCallback(() => {
    navigate('/settings/billing/charges');
  }, [navigate]);

  const handleVisitPlanSettings = useCallback(() => {
    navigate('/settings/plan');
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Upcoming bill"
          description="View charges on your next bill and manage your plan."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to billing"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <BillingUpcomingBillCard onVisitPlanSettings={handleVisitPlanSettings} />
        <BillingDetailsSection onViewCharges={handleViewCharges} />
      </div>
    </div>
  );
};

export default BillingUpcomingPage;

