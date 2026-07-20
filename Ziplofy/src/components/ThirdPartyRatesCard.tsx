import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';

interface ThirdPartyRatesCardProps {
  onUpgradeClick?: () => void;
  onLearnMoreClick?: () => void;
}

const ThirdPartyRatesCard: React.FC<ThirdPartyRatesCardProps> = ({
  onUpgradeClick,
  onLearnMoreClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Enable third-party calculated rates at checkout
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Connect your existing shipping carrier account to use your own rates
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onUpgradeClick}
              className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Upgrade your plan
            </button>
            <a
              href="#"
              onClick={(e) => {
                if (onLearnMoreClick) {
                  e.preventDefault();
                  onLearnMoreClick();
                }
              }}
              className="text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
        <div className="ml-4 w-16 h-16 flex items-center justify-center shrink-0">
          <TruckIcon className="w-12 h-12 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyRatesCard;

