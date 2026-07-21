import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTypesSection from '../../components/tags/ProductTypesSection';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const ProductTypesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/tag-management');
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <SettingsHero
          title="Product types"
          description="Define type labels for your catalog so products stay organized for reporting and internal workflows."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50/90"
              aria-label="Back to tag management"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />
        <ProductTypesSection />
      </div>
    </div>
  );
};

export default ProductTypesPage;
