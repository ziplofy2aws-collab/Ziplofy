import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminListCardClass } from './admin-list-ui';

interface SubscriptionsSectionProps {
  onViewAllSubscriptions: () => void;
}

const SubscriptionsSection: React.FC<SubscriptionsSectionProps> = ({
  onViewAllSubscriptions,
}) => {
  return (
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-admin-text">Subscriptions</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Additional items you’re billed for on a recurring basis.
        </p>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-admin-border bg-admin-surface px-4 py-3 text-left transition-colors hover:bg-admin-row-hover"
        onClick={onViewAllSubscriptions}
      >
        <span className="text-[13px] font-medium text-admin-text">View all subscriptions</span>
        <ChevronRightIcon className="h-5 w-5 text-admin-text-subdued" />
      </button>
    </div>
  );
};

export default SubscriptionsSection;
