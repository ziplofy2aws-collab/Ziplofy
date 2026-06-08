import React from 'react';

interface MarketingAppsCardProps {
  onBrowseApps?: () => void;
}

const MarketingAppsCard: React.FC<MarketingAppsCardProps> = ({
  onBrowseApps,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-gray-900">Generate traffic with marketing apps</h2>
        <p className="text-sm text-gray-600">
          Grow your audience on social platforms, capture new leads with newsletter sign-ups, increase conversion with chat, and more.
        </p>
        <div className="mt-4">
          <button
            onClick={onBrowseApps}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Browse marketing apps
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketingAppsCard;

