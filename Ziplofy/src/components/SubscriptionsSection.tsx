import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface SubscriptionsSectionProps {
  onViewAllSubscriptions: () => void;
}

const SubscriptionsSection: React.FC<SubscriptionsSectionProps> = ({
  onViewAllSubscriptions,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Subscriptions</h2>
        <p className="mt-1 text-sm text-gray-500">Additional items you’re billed for on a recurring basis.</p>
      </div>

      <button
        type="button"
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        onClick={onViewAllSubscriptions}
      >
        <span className="text-sm font-medium text-gray-900">View all subscriptions</span>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
};

export default SubscriptionsSection;

