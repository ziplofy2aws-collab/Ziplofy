import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import BillingChargesTable from '../../components/BillingChargesTable';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const BillingChargesPage: React.FC = () => {
  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Charges"
          description="View and export your billing charges by date, bill number, or type."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <SettingsPanel className="overflow-hidden p-0">
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200">
              <div className="flex flex-row gap-2 flex-wrap">
                {['Date', 'Bill number', 'Charge type'].map((filter) => (
                  <span
                    key={filter}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50/80"
                  >
                    {filter}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="rounded-lg px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Export
              </button>
            </div>

            <BillingChargesTable />

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Showing 1 result</p>
              <div className="flex flex-row gap-1">
                <button
                  type="button"
                  className="min-w-[32px] h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed bg-gray-50"
                  disabled
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="min-w-[32px] h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed bg-gray-50"
                  disabled
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default BillingChargesPage;

