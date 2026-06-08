import { MegaphoneIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';

interface CampaignTrackingSectionProps {
  onCreateCampaign?: () => void;
  onLearnMore?: () => void;
}

const CampaignTrackingSection: React.FC<CampaignTrackingSectionProps> = ({
  onCreateCampaign,
  onLearnMore,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
          <MegaphoneIcon className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Centralize your campaign tracking
          </h2>
          <p className="text-sm text-gray-500">Track campaigns across channels</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Create campaigns to evaluate how marketing initiatives drive business goals, capture online
        and offline touch points, add campaign activities from multiple marketing channels, and
        monitor results.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/marketing/campaigns"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create campaign
        </Link>
        <button
          type="button"
          onClick={onLearnMore}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          Learn more
        </button>
      </div>
    </div>
  );
};

export default CampaignTrackingSection;
