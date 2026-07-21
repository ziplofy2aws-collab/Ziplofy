import React, { useCallback } from 'react';
import ImprovementItemComponent from './ImprovementItem';

interface ImproveYourStoreCardProps {
  onItemClick?: (itemId: string) => void;
}

const ImproveYourStoreCard: React.FC<ImproveYourStoreCardProps> = ({
  onItemClick,
}) => {
  const handleItemClick = useCallback(
    (itemId: string) => {
      if (onItemClick) {
        onItemClick(itemId);
      } else {
        console.log('Improvement item clicked:', itemId);
      }
    },
    [onItemClick]
  );

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
      {/* Header */}
      <div className="mb-4 pl-3 border-l-4 border-blue-600">
        <h3 className="text-base font-semibold text-gray-900">Here are some ways to improve your store</h3>
      </div>

      {/* Two Column Grid */}
      <div className="flex gap-3">
        {/* Left Column */}
        <div className="flex-1 flex gap-2 flex-col">
          {/* Set Up taxes */}
          <ImprovementItemComponent
            item={{
              id: 'taxes',
              title: 'Set Up taxes',
              description: 'Configure Tax Rates & Rules to boost Sales',
              icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Coins with percentage sign */}
                  <circle cx="7" cy="11" r="2.5" strokeWidth={1.5} />
                  <circle cx="15" cy="13" r="2.5" strokeWidth={1.5} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l8 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v3m0 10v3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 6l-3 3M5 16l3-3" />
                </svg>
              ),
            }}
            onClick={handleItemClick}
          />

          {/* Manage Collections */}
          <ImprovementItemComponent
            item={{
              id: 'collections',
              title: 'Manage Collections',
              description: 'Combine different items to show under a common filter',
              icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Stacked boxes */}
                  <rect x="6" y="4" width="12" height="4" rx="1" strokeWidth={1.5} />
                  <rect x="6" y="10" width="12" height="4" rx="1" strokeWidth={1.5} />
                  <rect x="6" y="16" width="12" height="4" rx="1" strokeWidth={1.5} />
                </svg>
              ),
            }}
            onClick={handleItemClick}
          />
        </div>

        {/* Right Column */}
        <div className="flex-1 flex gap-2 flex-col">
          {/* Create Coupons */}
          <ImprovementItemComponent
            item={{
              id: 'coupons',
              title: 'Create Coupons',
              description: 'Add and manage discounts for orders',
              icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              ),
            }}
            onClick={handleItemClick}
          />

          {/* Shipping Integration */}
          <ImprovementItemComponent
            item={{
              id: 'shipping',
              title: 'Shipping Integration',
              description: 'Integrate with shipping carriers for real-time tracking and shipping',
              icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Delivery Truck */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              ),
            }}
            onClick={handleItemClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ImproveYourStoreCard;

