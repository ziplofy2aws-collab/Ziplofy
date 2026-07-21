import React from 'react';

interface PaidAppSubscriptionsSectionProps {
  installedCount?: number;
  onBrowseApps?: () => void;
}

const PaidAppSubscriptionsSection: React.FC<PaidAppSubscriptionsSectionProps> = ({
  installedCount = 0,
  onBrowseApps,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-900">
        Paid app subscriptions <span className="text-sm font-medium text-gray-500">({installedCount} installed)</span>
      </h2>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/80 p-5 text-center">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          You don't have any paid app subscriptions
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          After you install an app that has recurring and/or usage charges, it will be shown here.
        </p>
        <button
          type="button"
          onClick={onBrowseApps}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Browse apps
        </button>
      </div>
    </div>
  );
};

export default PaidAppSubscriptionsSection;

