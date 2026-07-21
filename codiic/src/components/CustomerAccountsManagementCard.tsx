import React from 'react';
import { ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import ToggleSwitch from './ToggleSwitch';

interface CustomerAccountsManagementCardProps {
  accountUrl: string;
  onNavigateToAuthentication: () => void;
  onNavigateToDomains: () => void;
  selfServeReturns: boolean;
  onSelfServeReturnsChange: (checked: boolean) => void;
  storeCredit: boolean;
  onStoreCreditChange: (checked: boolean) => void;
  isControlsDisabled: boolean;
}

const CustomerAccountsManagementCard: React.FC<CustomerAccountsManagementCardProps> = ({
  accountUrl,
  onNavigateToAuthentication,
  onNavigateToDomains,
  selfServeReturns,
  onSelfServeReturnsChange,
  storeCredit,
  onStoreCreditChange,
  isControlsDisabled,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-gray-900">Customer accounts management</h2>
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
            Manage sign-in methods and account access
          </div>
        </div>
      </div>

      <div className="space-y-0 divide-y divide-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Authentication</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage sign-in methods and account access
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToAuthentication}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors self-start sm:self-center"
          >
            Manage
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Self-serve returns</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Allow customers to request and manage returns. Customize with{' '}
              <button type="button" className="text-gray-700 font-medium hover:underline">
                return rules
              </button>
            </p>
          </div>
          <ToggleSwitch
            checked={selfServeReturns}
            onChange={onSelfServeReturnsChange}
            disabled={isControlsDisabled}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Store credit</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Allow customers to see and spend store credit
            </p>
          </div>
          <ToggleSwitch
            checked={storeCredit}
            onChange={onStoreCreditChange}
            disabled={isControlsDisabled}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">URL</h3>
            <p className="text-sm text-gray-500 mt-0.5 mb-2">
              Use this URL anywhere you&apos;d like customers to access customer accounts
            </p>
            <input
              type="text"
              value={accountUrl || ''}
              readOnly
              className="w-full rounded-lg px-3 py-2 border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <button
            type="button"
            onClick={onNavigateToDomains}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors self-start sm:self-center shrink-0"
          >
            Manage
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountsManagementCard;

