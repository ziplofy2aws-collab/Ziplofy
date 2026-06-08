import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const ShopMetafieldsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/settings/general');
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Shop metafields"
          description="Custom fields for store-wide data such as global settings or configurations."
          actions={
            <>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View definitions
              </button>
            </>
          }
        />

        <SettingsPanel className="p-6 text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Add a custom field to your shop
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
            Create custom fields for information that applies to your entire store,
            such as global settings or configurations.
          </p>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Add definition
          </button>
        </SettingsPanel>

        <div className="text-center">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Learn more about metafields</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopMetafieldsPage;

