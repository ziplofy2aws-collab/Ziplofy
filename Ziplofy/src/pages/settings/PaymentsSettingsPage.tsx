import React, { useEffect } from 'react';
import {
  CreditCardIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import PaymentMethodBadges from '../../components/payments/PaymentMethodBadges';
import {
  isManualPaymentProvider,
} from '../../constants/manual-payment-providers';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { usePaymentProviders } from '../../hooks/usePaymentProviders';
import { useStore } from '../../contexts/store.context';

const btnPrimary =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50';

const radioStart =
  'mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const radioInline =
  'h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const PaymentsSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { storeProviders, loading, fetchStoreProviders } = usePaymentProviders();
  const [captureMethod, setCaptureMethod] = React.useState('auto_checkout');
  const [giftCardExpiration, setGiftCardExpiration] = React.useState<'never' | 'expires'>('never');

  const activeProviders = storeProviders.filter((item) => item.status === 'active' && item.provider);
  const manualProviders = activeProviders.filter((item) =>
    isManualPaymentProvider(item.providerKey)
  );

  useEffect(() => {
    if (activeStoreId) {
      fetchStoreProviders(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchStoreProviders]);

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Payments"
          description="Configure payment providers, capture rules, and payment methods at checkout."
          tip="Connect a provider to accept cards and wallets; capture settings control when funds settle."
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Transactions</h2>
              <p className="mt-1 text-sm text-gray-500">
                View manual payment confirmations (UPI, reference IDs) submitted for your store from checkout.
              </p>
            </div>
          </div>
          <div className="flex justify-end p-5 sm:p-6">
            <button
              type="button"
              onClick={() => navigate('/settings/payments/transactions')}
              className={btnPrimary}
            >
              View transactions
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Payment providers</h2>
              <p className="mt-1 text-sm text-gray-500">
                Third-party providers set processing rates. Additional platform fees may apply once you{' '}
                <button
                  type="button"
                  onClick={() => navigate('/settings/subscribe/select-plan')}
                  className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700"
                >
                  select a plan
                </button>
                .
              </p>
            </div>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-900">Coming soon</p>
              <p className="mt-1 text-sm text-gray-500">
                Third-party payment providers will be available here soon.
              </p>
            </div>

            <button
              type="button"
              className={btnGhost}
              onClick={() => navigate('/settings/payments/providers')}
            >
              Choose a provider
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Supported payment methods</h2>
              <p className="mt-1 text-sm text-gray-500">
                Methods available through codiic-approved payment providers.
              </p>
            </div>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <p className="text-sm text-gray-500">
              Third-party payment methods are coming soon. Use manual payment methods for now.
            </p>

            {manualProviders.map((connection) => (
              <div
                key={`method-${connection._id}`}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                    <CreditCardIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{connection.provider?.name}</p>
                    <p className="text-sm text-gray-500">Manual payment method</p>
                    <div className="mt-2">
                      <PaymentMethodBadges methods={connection.provider?.paymentMethods ?? []} />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${btnGhost} shrink-0`}
                  onClick={() => navigate('/settings/payments/manual')}
                >
                  Manage
                </button>
              </div>
            ))}

            <button
              type="button"
              className={btnGhost}
              onClick={() => navigate('/settings/payments/manual')}
            >
              <PlusIcon className="h-4 w-4" />
              Add payment method
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Payment capture method</h2>
              <p className="mt-1 text-sm text-gray-500">
                Orders are authorized at checkout. Choose when to{' '}
                <a href="#" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
                  capture payments
                </a>
                .
              </p>
            </div>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="captureMethod"
                value="auto_checkout"
                checked={captureMethod === 'auto_checkout'}
                onChange={(e) => setCaptureMethod(e.target.value)}
                className={radioStart}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">Automatically at checkout</p>
                <p className="text-sm text-gray-500">Capture payment when an order is placed</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="captureMethod"
                value="auto_fulfilled"
                checked={captureMethod === 'auto_fulfilled'}
                onChange={(e) => setCaptureMethod(e.target.value)}
                className={radioStart}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Automatically when the entire order is fulfilled
                </p>
                <p className="text-sm text-gray-500">
                  Authorize payment at checkout and capture once the entire order is fulfilled
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="captureMethod"
                value="manual"
                checked={captureMethod === 'manual'}
                onChange={(e) => setCaptureMethod(e.target.value)}
                className={radioStart}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">Manually</p>
                <p className="text-sm text-gray-500">
                  Authorize payment at checkout and capture manually
                </p>
              </div>
            </label>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Manual payment methods</h2>
              <p className="mt-1 text-sm text-gray-500">
                Payments taken outside your online store. Orders must be approved before fulfillment.
              </p>
            </div>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            {loading && <p className="text-sm text-gray-500">Loading manual payment methods...</p>}

            {!loading && manualProviders.length > 0 && (
              <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                {manualProviders.map((connection) => (
                  <li key={connection._id}>
                    <div className="flex w-full items-center gap-4 px-4 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {connection.provider?.name}
                        </p>
                        <div className="mt-2">
                          <PaymentMethodBadges methods={connection.provider?.paymentMethods ?? []} />
                        </div>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800">
                        Active
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loading && manualProviders.length === 0 && (
              <p className="text-sm text-gray-500">
                Set up bank transfer, UPI ID, or cash on delivery for your store.
              </p>
            )}

            <button
              type="button"
              className={btnGhost}
              onClick={() => navigate('/settings/payments/manual')}
            >
              <PlusIcon className="h-4 w-4" />
              Manual payment method
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Payment method customizations</h2>
              <p className="mt-1 text-sm text-gray-500">Control how methods appear to customers at checkout.</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <button type="button" className={btnGhost}>
              View payment method customization apps
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Gift card expiration</h2>
              <p className="mt-1 text-sm text-gray-500">Default behavior for gift card balance validity.</p>
            </div>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="giftCardExpiration"
                value="never"
                checked={giftCardExpiration === 'never'}
                onChange={(e) => setGiftCardExpiration(e.target.value as 'never' | 'expires')}
                className={radioInline}
              />
              <span className="text-sm text-gray-900">Gift cards never expire</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="giftCardExpiration"
                value="expires"
                checked={giftCardExpiration === 'expires'}
                onChange={(e) => setGiftCardExpiration(e.target.value as 'never' | 'expires')}
                className={radioInline}
              />
              <span className="text-sm text-gray-900">Gift cards expire</span>
            </label>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Apple Wallet passes</h2>
              <p className="mt-1 text-sm text-gray-500">
                Give customers a digital Apple Wallet pass to use online or in your retail stores.
              </p>
            </div>
          </div>
          <div className="flex justify-end p-5 sm:p-6">
            <button type="button" className={btnGhost}>
              Customize
            </button>
          </div>
        </SettingsPanel>

        <p className="text-center text-sm text-gray-500">
          <button type="button" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
            Learn more about payments
          </button>
        </p>
      </div>
    </div>
  );
};

export default PaymentsSettingsPage;
