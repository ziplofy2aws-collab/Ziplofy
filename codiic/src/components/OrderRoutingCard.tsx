import React from 'react';
import { ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface OrderRoutingCardProps {
  activeRulesCount?: number;
  onRoutingRulesClick?: () => void;
}

const OrderRoutingCard: React.FC<OrderRoutingCardProps> = ({
  activeRulesCount = 3,
  onRoutingRulesClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-base font-semibold text-gray-900">Order routing</h2>
        <InformationCircleIcon className="w-4 h-4 text-gray-500" />
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Manage how locations are assigned to new orders
      </p>

      {/* Routing rules card */}
      <div
        role="button"
        tabIndex={0}
        onClick={onRoutingRulesClick}
        onKeyDown={(e) => e.key === 'Enter' && onRoutingRulesClick?.()}
        className="p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
      >
        <p className="text-sm text-gray-900 font-medium">
          {activeRulesCount} routing rules active
        </p>
        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
};

export default OrderRoutingCard;

