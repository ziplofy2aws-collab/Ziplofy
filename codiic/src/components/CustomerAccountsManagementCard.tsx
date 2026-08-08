import { ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';
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
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[13px] font-semibold text-admin-text">Customer accounts management</h2>
        <div className="group relative">
          <InformationCircleIcon className="h-4 w-4 cursor-help text-admin-text-subdued" />
          <div className="absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-lg bg-admin-text p-2 text-[12px] text-white shadow-lg group-hover:block">
            Manage sign-in methods and account access
          </div>
        </div>
      </div>

      <div className="space-y-0 divide-y divide-admin-divider">
        <div className="flex flex-col justify-between gap-4 py-4 first:pt-0 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[13px] font-medium text-admin-text">Authentication</h3>
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">
              Manage sign-in methods and account access
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToAuthentication}
            className={`${adminListSecondaryButtonClass} gap-2 self-start sm:self-center`}
          >
            Manage
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[13px] font-medium text-admin-text">Self-serve returns</h3>
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">
              Allow customers to request and manage returns. Customize with{' '}
              <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
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

        <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[13px] font-medium text-admin-text">Store credit</h3>
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">
              Allow customers to see and spend store credit
            </p>
          </div>
          <ToggleSwitch
            checked={storeCredit}
            onChange={onStoreCreditChange}
            disabled={isControlsDisabled}
          />
        </div>

        <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-medium text-admin-text">URL</h3>
            <p className="mb-2 mt-0.5 text-[13px] text-admin-text-secondary">
              Use this URL anywhere you&apos;d like customers to access customer accounts
            </p>
            <input
              type="text"
              value={accountUrl || ''}
              readOnly
              className="w-full rounded-lg border border-admin-border bg-admin-secondary px-3 py-2 text-[13px] text-admin-text outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]/30"
            />
          </div>
          <button
            type="button"
            onClick={onNavigateToDomains}
            className={`${adminListSecondaryButtonClass} gap-2 shrink-0 self-start sm:self-center`}
          >
            Manage
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountsManagementCard;
