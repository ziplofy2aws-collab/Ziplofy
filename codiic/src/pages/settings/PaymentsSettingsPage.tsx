import React, { useEffect } from 'react';
import {
  ArrowRightIcon,
  CreditCardIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../../components/admin-list-ui';
import PaymentMethodBadges from '../../components/payments/PaymentMethodBadges';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { isManualPaymentProvider } from '../../constants/manual-payment-providers';
import { useStore } from '../../contexts/store.context';
import { usePaymentProviders } from '../../hooks/usePaymentProviders';

const radioClass =
  'h-4 w-4 shrink-0 border-admin-border text-admin-text focus:ring-2 focus:ring-[#005bd3]/30 focus:ring-offset-0';

const sectionHeaderClass = 'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

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

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Transactions</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              View manual payment confirmations (UPI, reference IDs) submitted for your store from
              checkout.
            </p>
          </div>
          <div className="flex justify-end p-5 sm:p-6">
            <button
              type="button"
              onClick={() => navigate('/settings/payments/transactions')}
              className={adminListPrimaryButtonClass}
            >
              View transactions
              <ArrowRightIcon className="ml-1.5 h-4 w-4" />
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Payment providers</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Third-party providers set processing rates. Additional platform fees may apply once you{' '}
              <button
                type="button"
                onClick={() => navigate('/settings/subscribe/select-plan')}
                className={`${adminListFooterLinkClass} font-medium`}
              >
                select a plan
              </button>
              .
            </p>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <div className="rounded-xl border border-dashed border-admin-border bg-admin-secondary px-4 py-6 text-center">
              <p className="text-[13px] font-medium text-admin-text">Coming soon</p>
              <p className="mt-1 text-[13px] text-admin-text-secondary">
                Third-party payment providers will be available here soon.
              </p>
            </div>

            <button
              type="button"
              className={adminListSecondaryButtonClass}
              onClick={() => navigate('/settings/payments/providers')}
            >
              Choose a provider
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Supported payment methods</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Methods available through codiic-approved payment providers.
            </p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <p className="text-[13px] text-admin-text-secondary">
              Third-party payment methods are coming soon. Use manual payment methods for now.
            </p>

            {manualProviders.map((connection) => (
              <div
                key={`method-${connection._id}`}
                className="flex flex-col gap-4 rounded-xl border border-admin-border bg-admin-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-surface">
                    <CreditCardIcon className="h-5 w-5 text-admin-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-admin-text">
                      {connection.provider?.name}
                    </p>
                    <p className="text-[13px] text-admin-text-secondary">Manual payment method</p>
                    <div className="mt-2">
                      <PaymentMethodBadges methods={connection.provider?.paymentMethods ?? []} />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${adminListSecondaryButtonClass} shrink-0`}
                  onClick={() => navigate('/settings/payments/manual')}
                >
                  Manage
                </button>
              </div>
            ))}

            <button
              type="button"
              className={adminListSecondaryButtonClass}
              onClick={() => navigate('/settings/payments/manual')}
            >
              <PlusIcon className="h-4 w-4" />
              Add payment method
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Payment capture method</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Orders are authorized at checkout. Choose when to{' '}
              <a href="#" className={`${adminListFooterLinkClass} font-medium`}>
                capture payments
              </a>
              .
            </p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="captureMethod"
                value="auto_checkout"
                checked={captureMethod === 'auto_checkout'}
                onChange={(e) => setCaptureMethod(e.target.value)}
                className={`${radioClass} mt-0.5`}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-admin-text">Automatically at checkout</p>
                <p className="text-[13px] text-admin-text-secondary">
                  Capture payment when an order is placed
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="captureMethod"
                value="auto_fulfilled"
                checked={captureMethod === 'auto_fulfilled'}
                onChange={(e) => setCaptureMethod(e.target.value)}
                className={`${radioClass} mt-0.5`}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-admin-text">
                  Automatically when the entire order is fulfilled
                </p>
                <p className="text-[13px] text-admin-text-secondary">
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
                className={`${radioClass} mt-0.5`}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-admin-text">Manually</p>
                <p className="text-[13px] text-admin-text-secondary">
                  Authorize payment at checkout and capture manually
                </p>
              </div>
            </label>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Manual payment methods</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Payments taken outside your online store. Orders must be approved before fulfillment.
            </p>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            {loading && (
              <p className="text-[13px] text-admin-text-secondary">
                Loading manual payment methods...
              </p>
            )}

            {!loading && manualProviders.length > 0 && (
              <ul className="divide-y divide-admin-divider overflow-hidden rounded-xl border border-admin-border">
                {manualProviders.map((connection) => (
                  <li key={connection._id}>
                    <div className="flex w-full items-center gap-4 bg-admin-surface px-4 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-admin-text">
                          {connection.provider?.name}
                        </p>
                        <div className="mt-2">
                          <PaymentMethodBadges methods={connection.provider?.paymentMethods ?? []} />
                        </div>
                      </div>
                      <span className="rounded-md bg-admin-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-text">
                        Active
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loading && manualProviders.length === 0 && (
              <p className="text-[13px] text-admin-text-secondary">
                Set up bank transfer, UPI ID, or cash on delivery for your store.
              </p>
            )}

            <button
              type="button"
              className={adminListSecondaryButtonClass}
              onClick={() => navigate('/settings/payments/manual')}
            >
              <PlusIcon className="h-4 w-4" />
              Manual payment method
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">
              Payment method customizations
            </h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Control how methods appear to customers at checkout.
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <button type="button" className={adminListSecondaryButtonClass}>
              View payment method customization apps
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Gift card expiration</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Default behavior for gift card balance validity.
            </p>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="giftCardExpiration"
                value="never"
                checked={giftCardExpiration === 'never'}
                onChange={(e) => setGiftCardExpiration(e.target.value as 'never' | 'expires')}
                className={radioClass}
              />
              <span className="text-[13px] text-admin-text">Gift cards never expire</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="giftCardExpiration"
                value="expires"
                checked={giftCardExpiration === 'expires'}
                onChange={(e) => setGiftCardExpiration(e.target.value as 'never' | 'expires')}
                className={radioClass}
              />
              <span className="text-[13px] text-admin-text">Gift cards expire</span>
            </label>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Apple Wallet passes</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Give customers a digital Apple Wallet pass to use online or in your retail stores.
            </p>
          </div>
          <div className="flex justify-end p-5 sm:p-6">
            <button type="button" className={adminListSecondaryButtonClass}>
              Customize
            </button>
          </div>
        </SettingsPanel>

        <p className="text-center text-[13px] text-admin-text-secondary">
          <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
            Learn more about payments
          </button>
        </p>
      </div>
    </div>
  );
};

export default PaymentsSettingsPage;
