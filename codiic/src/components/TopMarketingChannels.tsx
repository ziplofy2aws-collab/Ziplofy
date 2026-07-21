import { ChartBarIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface TopMarketingChannelsProps {
  message?: string;
}

const TopMarketingChannels: React.FC<TopMarketingChannelsProps> = ({
  message = 'No data found for the date range selected. Please select a different period.',
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <ChartBarIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Top marketing channels</h2>
          <p className="text-sm text-gray-500">Performance by traffic source</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default TopMarketingChannels;
