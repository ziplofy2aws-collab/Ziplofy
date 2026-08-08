import React from 'react';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';

interface PlanDetailsSectionProps {
  onCancelTrial: () => void;
  onChoosePlan: () => void;
}

const PlanDetailsSection: React.FC<PlanDetailsSectionProps> = ({
  onCancelTrial,
  onChoosePlan,
}) => {
  return (
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-admin-text">Plan details</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Review your current plan and manage trial actions.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-admin-border bg-admin-surface px-4 py-4">
        <div>
          <p className="text-[13px] font-medium text-admin-text">Trial</p>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Choose a plan anytime. You can cancel your trial if needed.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onCancelTrial} className={adminListSecondaryButtonClass}>
            Cancel trial
          </button>
          <button type="button" onClick={onChoosePlan} className={adminListPrimaryButtonClass}>
            Choose plan
          </button>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-admin-text-subdued">
        View the{' '}
        <a href="#" className={adminListFooterLinkClass}>
          terms of service
        </a>{' '}
        and{' '}
        <a href="#" className={adminListFooterLinkClass}>
          privacy policy
        </a>
      </p>
    </div>
  );
};

export default PlanDetailsSection;
