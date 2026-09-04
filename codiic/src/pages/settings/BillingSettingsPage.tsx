import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PastBillsSection from '../../components/PastBillsSection';
import UpcomingBillSection from '../../components/UpcomingBillSection';
import { adminListSecondaryButtonClass } from '../../components/admin-list-ui';
import { SettingsCallout, SettingsHero } from '../../components/settings/SettingsPageScaffold';

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
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <SettingsHero
          title="Billing"
          description="Manage payment methods, upcoming charges, and past bills."
          actions={
            <button
              type="button"
              onClick={handleNavigateToProfile}
              className={`${adminListSecondaryButtonClass} shrink-0`}
            >
              Billing profile
            </button>
          }
        />

        <SettingsCallout
          variant="info"
          icon={<InformationCircleIcon className="h-5 w-5 text-admin-text-secondary" />}
          title="Ensure your billing address meets India payment requirements"
        >
          <p>
            Indian payment regulations require specific address formatting.{' '}
            <button type="button" className="font-medium text-[#005bd3] hover:underline">
              View address guidelines
            </button>{' '}
            to see the requirements, or{' '}
            <button type="button" className="font-medium text-[#005bd3] hover:underline">
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
