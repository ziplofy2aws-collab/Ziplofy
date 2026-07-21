import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarketsNewForm from '../../components/MarketsNewForm';

const MarketsNewPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/markets');
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Market</h1>
          <p className="mt-1 text-sm text-gray-600">Add a new market to your store</p>
        </div>
        <MarketsNewForm onCreated={() => navigate('/markets')} />
      </div>
    </div>
  );
};

export default MarketsNewPage;

