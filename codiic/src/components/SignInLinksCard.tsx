import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminListCardClass, adminListFooterLinkClass } from './admin-list-ui';
import ToggleSwitch from './ToggleSwitch';

interface SignInLinksCardProps {
  showSignInLinks: boolean;
  onShowSignInLinksChange: (checked: boolean) => void;
  accountVersion: 'recommended' | 'legacy';
  onAccountVersionChange: (value: 'recommended' | 'legacy') => void;
  isControlsDisabled: boolean;
}

const radioClass =
  'h-4 w-4 border-admin-border text-admin-text focus:ring-2 focus:ring-[#005bd3]/30 focus:ring-offset-0';

const SignInLinksCard: React.FC<SignInLinksCardProps> = ({
  showSignInLinks,
  onShowSignInLinksChange,
  accountVersion,
  onAccountVersionChange,
  isControlsDisabled,
}) => {
  const optionCardClass = (selected: boolean) =>
    `flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
      selected
        ? 'border-admin-text bg-admin-secondary ring-1 ring-admin-text/15'
        : 'border-admin-border hover:border-admin-fill hover:bg-admin-row-hover'
    } ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : ''}`;

  return (
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-admin-text">Sign-in links</h2>
            <div className="group relative">
              <InformationCircleIcon className="h-4 w-4 cursor-help text-admin-text-subdued" />
              <div className="absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-lg bg-admin-text p-2 text-[12px] text-white shadow-lg group-hover:block">
                Show sign-in links in the header of online store and at checkout
              </div>
            </div>
          </div>
          <p className="text-[13px] text-admin-text-secondary">
            Show sign-in links in the header of online store and at checkout
          </p>
        </div>
        <ToggleSwitch
          checked={showSignInLinks}
          onChange={onShowSignInLinksChange}
          disabled={isControlsDisabled}
        />
      </div>

      {showSignInLinks ? (
        <>
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-admin-border bg-admin-secondary p-4">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-admin-text-subdued" />
            <p className="text-[13px] text-admin-text-secondary">
              Customers are required to sign in before checking out. To change this, go to{' '}
              <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
                checkout settings
              </button>
              .
            </p>
          </div>

          <h3 className="mb-3 text-[13px] font-medium text-admin-text">
            Choose which version of customer accounts to link to
          </h3>

          <div className="flex flex-col gap-3 md:flex-row">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isControlsDisabled && onAccountVersionChange('recommended')}
              onKeyDown={(e) =>
                e.key === 'Enter' && !isControlsDisabled && onAccountVersionChange('recommended')
              }
              className={optionCardClass(accountVersion === 'recommended')}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  value="recommended"
                  checked={accountVersion === 'recommended'}
                  onChange={() => onAccountVersionChange('recommended')}
                  disabled={isControlsDisabled}
                  className={radioClass}
                />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="text-[13px] font-medium text-admin-text">Customer accounts</h4>
                  <span className="rounded-md bg-admin-fill px-2 py-0.5 text-[12px] font-medium text-admin-text">
                    Recommended
                  </span>
                </div>
                <p className="text-[13px] text-admin-text-secondary">
                  Customers sign in with a one-time code sent to their email (no passwords)
                </p>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => !isControlsDisabled && onAccountVersionChange('legacy')}
              onKeyDown={(e) =>
                e.key === 'Enter' && !isControlsDisabled && onAccountVersionChange('legacy')
              }
              className={optionCardClass(accountVersion === 'legacy')}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  value="legacy"
                  checked={accountVersion === 'legacy'}
                  onChange={() => onAccountVersionChange('legacy')}
                  disabled={isControlsDisabled}
                  className={radioClass}
                />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-[13px] font-medium text-admin-text">Legacy</h4>
                <p className="text-[13px] text-admin-text-secondary">
                  Customers create an account and sign in with email and password
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-admin-text-subdued">
          Both versions are still accessible by URL
        </p>
      )}
    </div>
  );
};

export default SignInLinksCard;
