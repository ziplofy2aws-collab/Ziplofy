import React from 'react';

interface SplitShippingSectionProps {
  splitShipping: boolean;
  onToggle: () => void;
  onManage: () => void;
}

const SplitShippingSection: React.FC<SplitShippingSectionProps> = ({
  splitShipping,
  onToggle,
  onManage,
}) => {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Split shipping</h3>
          <p className="text-sm text-gray-500 mt-1">
            Show products from different profiles or locations as separate shipments in checkout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
              splitShipping
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {splitShipping ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onManage();
            }}
            className="text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitShippingSection;

