import React from 'react';

interface ReturnsOrdersCardProps {
  returnsOrders?: number;
  percentageChange?: number;
  minWidth?: number;
}

const ReturnsOrdersCard: React.FC<ReturnsOrdersCardProps> = ({
  returnsOrders = 0,
  percentageChange = -1.2,
  minWidth,
}) => {
  return (
    <div 
      className="bg-white rounded-lg p-4 border border-gray-200 flex-1 min-w-64"
      style={minWidth ? { minWidth } : {}}
    >
      <div className="flex flex-col">
        {/* Label */}
        <h3 className="text-xs text-gray-600 font-normal mb-2">Returns Orders</h3>
        
        {/* Large Number */}
        <div className="mb-3">
          <span className="text-2xl font-semibold text-gray-900">{returnsOrders}</span>
        </div>
        
        {/* Percentage Change */}
        <div className="flex items-center gap-1.5">
          {percentageChange >= 0 ? (
            <svg
              className="w-3 h-3 text-gray-600"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M6 0L10.392 8H1.608L6 0Z" />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-gray-600"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M6 12L1.608 4H10.392L6 12Z" />
            </svg>
          )}
          <span className="text-xs text-gray-600">{percentageChange > 0 ? '+' : ''}{percentageChange}% last week</span>
        </div>
      </div>
    </div>
  );
};

export default ReturnsOrdersCard;

