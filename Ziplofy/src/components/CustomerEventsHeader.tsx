import React from 'react';

interface CustomerEventsHeaderProps {
  onOpenModal: () => void;
}

const CustomerEventsHeader: React.FC<CustomerEventsHeaderProps> = ({
  onOpenModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Pixels
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Enable third-party services to securely collect and use customer event data from your store
        </p>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Explore pixel apps
        </button>
        <button
          onClick={onOpenModal}
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Add custom pixel
        </button>
      </div>
    </div>
  );
};

export default CustomerEventsHeader;

