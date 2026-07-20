import { PuzzlePieceIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface MarketingAppsSectionProps {
  onBrowseApps?: () => void;
}

const MarketingAppsSection: React.FC<MarketingAppsSectionProps> = ({ onBrowseApps }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <PuzzlePieceIcon className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Generate traffic with marketing apps
          </h2>
          <p className="text-sm text-gray-500">Integrations and extensions</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Grow your audience on social platforms, capture new leads with newsletters, signups,
        increase conversion with chat and more.
      </p>
      <button
        type="button"
        onClick={onBrowseApps}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Browse marketing apps
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MarketingAppsSection;
