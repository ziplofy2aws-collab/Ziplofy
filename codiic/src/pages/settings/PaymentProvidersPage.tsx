import React from 'react';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';

const PaymentProvidersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Third-party payment providers"
          description="Choose a provider to accept cards, wallets, and other payment methods at checkout."
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/payments')}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ClockIcon className="h-7 w-7 text-slate-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Coming soon</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Third-party payment providers like Razorpay, Stripe, and PayPal will be available here
              soon. For now, use manual payment methods on the Payments page.
            </p>
            <button
              type="button"
              onClick={() => navigate('/settings/payments/manual')}
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            >
              Set up manual payment methods
            </button>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default PaymentProvidersPage;
