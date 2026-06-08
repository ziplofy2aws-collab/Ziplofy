import React from 'react';

interface CampaignTrackingCardProps {
  onCreateCampaign?: () => void;
  onLearnMore?: () => void;
}

const CampaignTrackingCard: React.FC<CampaignTrackingCardProps> = ({
  onCreateCampaign,
  onLearnMore,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-8">
        <div className="max-w-[760px]">
          <h2 className="text-base font-semibold mb-2 text-gray-900">Centralize your campaign tracking</h2>
          <p className="text-sm text-gray-600 mb-4">
            Create campaigns to evaluate how marketing initiatives drive business goals. Capture online and offline touchpoints, add campaign activities from multiple marketing channels, and monitor results.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCreateCampaign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create campaign
            </button>
            <button
              onClick={onLearnMore}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Learn more
            </button>
          </div>
        </div>
        {/* Right illustration placeholder */}
        <div className="w-[220px] h-[140px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 opacity-30" />
          <div className="absolute right-0 bottom-1.5 w-[180px] h-[110px] bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default CampaignTrackingCard;

