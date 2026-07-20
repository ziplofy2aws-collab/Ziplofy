import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PastBillsSection from '../../components/PastBillsSection';
import UpcomingBillSection from '../../components/UpcomingBillSection';
import { SettingsHero, SettingsCallout } from '../../components/settings/SettingsPageScaffold';

const BillingSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToProfile = useCallback(() => {
    navigate('/settings/billing/profile');
  }, [navigate]);

  const handleNavigateToUpcoming = useCallback(() => {
    navigate('/settings/billing/upcoming');
  }, [navigate]);

  const handleNavigateToAddPayment = useCallback(() => {
    navigate('/settings/billing/profile?showAddPaymentModal=true');
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
          title="Billing"
          description="Manage payment methods, upcoming charges, and past bills."
          actions={
            <button
              type="button"
              onClick={handleNavigateToProfile}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200/90 hover:bg-gray-50/90 transition-colors shrink-0 shadow-sm"
            >
              Billing profile
            </button>
          }
        />

        <SettingsCallout
          variant="info"
          icon={<InformationCircleIcon className="h-5 w-5 text-blue-600" />}
          title="Ensure your billing address meets India payment requirements"
        >
          <p>
            Indian payment regulations require specific address formatting.{' '}
            <button type="button" className="font-medium text-blue-700 hover:underline">
              View address guidelines
            </button>{' '}
            to see the requirements, or{' '}
            <button type="button" className="font-medium text-blue-700 hover:underline">
              update your address now
            </button>
            .
          </p>
        </SettingsCallout>

        <UpcomingBillSection
          onViewBill={handleNavigateToUpcoming}
          onAddPayment={handleNavigateToAddPayment}
          handleVisitPlanSettings={handleVisitPlanSettings}
        />

        <PastBillsSection onViewCharges={handleViewCharges} />
      </div>
    </div>
  );
};

export default BillingSettingsPage;

