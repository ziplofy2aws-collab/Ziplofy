import React from 'react';

interface FulfilledOrdersOverTimeCardProps {
  fulfilledOrders?: number;
  percentageChange?: number;
  minWidth?: number;
}

const FulfilledOrdersOverTimeCard: React.FC<FulfilledOrdersOverTimeCardProps> = ({
  fulfilledOrders = 12,
  percentageChange = 12.2,
  minWidth,
}) => {
  return (
    <div 
      className="bg-white rounded-lg p-4 border border-gray-200 flex-1 min-w-64"
      style={minWidth ? { minWidth } : {}}
    >
      <div className="flex flex-col">
        {/* Label */}
        <h3 className="text-xs text-gray-600 font-normal mb-2">Fulfilled orders over time</h3>
        
        {/* Large Number */}
        <div className="mb-3">
          <span className="text-2xl font-semibold text-gray-900">{fulfilledOrders}</span>
        </div>
        
        {/* Percentage Change */}
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3 h-3 text-gray-600"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M6 0L10.392 8H1.608L6 0Z" />
          </svg>
          <span className="text-xs text-gray-600">{percentageChange > 0 ? '+' : ''}{percentageChange}% last week</span>
        </div>
      </div>
    </div>
  );
};

export default FulfilledOrdersOverTimeCard;

