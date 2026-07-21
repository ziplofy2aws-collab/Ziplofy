import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CancelTrialModal from '../../components/CancelTrialModal';
import PlanDetailsSection from '../../components/PlanDetailsSection';
import SubscriptionsSection from '../../components/SubscriptionsSection';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const PlanSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleOpenCancelDialog = useCallback(() => {
    setCancelDialogOpen(true);
    setAcknowledged(false);
  }, []);

  const handleCloseCancelDialog = useCallback(() => {
    setCancelDialogOpen(false);
  }, []);

  const handleAcknowledgedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAcknowledged(event.target.checked);
  }, []);

  const handleNavigateToSelectPlan = useCallback(() => {
    navigate('/settings/subscribe/select-plan');
  }, [navigate]);

  const handleNavigateToSubscriptions = useCallback(() => {
    navigate('/settings/plan/subscriptions');
  }, [navigate]);


  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Plan"
          description="Manage your plan, trial, and subscriptions."
        />

        <PlanDetailsSection
          onCancelTrial={handleOpenCancelDialog}
          onChoosePlan={handleNavigateToSelectPlan}
        />

        <SubscriptionsSection onViewAllSubscriptions={handleNavigateToSubscriptions} />

        <CancelTrialModal
          open={cancelDialogOpen}
          onClose={handleCloseCancelDialog}
          acknowledged={acknowledged}
          onAcknowledgedChange={handleAcknowledgedChange}
        />
      </div>
    </div>
  );
};

export default PlanSettingsPage;

