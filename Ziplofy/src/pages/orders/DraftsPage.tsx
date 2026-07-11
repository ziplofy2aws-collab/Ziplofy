import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DraftsEmptyState from '../../components/orders/DraftsEmptyState';
import DraftsPageHeader from '../../components/orders/DraftsPageHeader';

const DraftsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateDraftOrder = useCallback(() => {
    navigate('/orders/drafts/new');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <DraftsPageHeader />

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <DraftsEmptyState onCreateDraftOrder={handleCreateDraftOrder} />
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Learn more about creating draft orders
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;
