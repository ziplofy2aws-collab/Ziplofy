import { ArrowLeftIcon, ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const DraftsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleMoreActions = useCallback(() => {
    // TODO: Implement more actions dropdown
    console.log('More actions clicked');
  }, []);

  const handleCreateDraftOrder = useCallback(() => {
    // TODO: Navigate to create draft order page
    navigate('/orders/create');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Drafts</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manually create orders and invoices for customers
              </p>
            </div>
            <button
              onClick={handleMoreActions}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              More actions
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col items-center justify-center text-center min-h-[320px] px-6 py-12">
              {/* Illustration */}
              <div className="relative w-[200px] h-[150px] mb-6">
                {/* soft circular base */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[180px] h-[90px] bg-blue-50 rounded-[100px/50px]" />
                {/* stacked documents */}
                <div className="absolute top-[10px] left-1/2 transform -translate-x-1/2 -rotate-[4deg] w-[120px] h-[90px] bg-gray-50 rounded-lg" />
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[140px] h-[105px] p-2 bg-white rounded-lg border border-gray-200">
                  {/* header row */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-[18px] h-[18px] bg-green-500 rounded" />
                    <div className="flex-1 h-2 bg-slate-100 rounded" />
                  </div>
                  {/* lines */}
                  <div className="flex flex-col gap-1">
                    <div className="h-1.5 bg-blue-50 rounded" />
                    <div className="h-1.5 bg-blue-50 rounded w-[85%]" />
                    <div className="h-1.5 bg-blue-50 rounded w-[70%]" />
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-1.5">Manually create orders and invoices</h2>

              <p className="text-sm text-gray-600 max-w-[560px] mb-6">
                Use draft orders to take orders over the phone, email invoices to customers,
                and collect payments.
              </p>

              <button
                onClick={handleCreateDraftOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create draft order
              </button>
            </div>
          </div>

        {/* Learn more */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Learn more about{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              creating draft orders
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;
