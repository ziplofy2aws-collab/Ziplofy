import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import ManualPaymentSetupPanel from '../../components/payments/ManualPaymentSetupPanel';
import PaymentMethodBadges from '../../components/payments/PaymentMethodBadges';
import {
  MANUAL_PAYMENT_OPTIONS,
  type ManualPaymentProviderKey,
} from '../../constants/manual-payment-providers';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { usePaymentProviders } from '../../hooks/usePaymentProviders';
import { useStore } from '../../contexts/store.context';

const ManualPaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { storeProviders, loading, fetchStoreProviders } = usePaymentProviders();
  const [activeManualKey, setActiveManualKey] = useState<ManualPaymentProviderKey | null>(null);

  const manualConnections = useMemo(
    () =>
      storeProviders.filter(
        (item) =>
          item.status === 'active' &&
          MANUAL_PAYMENT_OPTIONS.some((option) => option.key === item.providerKey)
      ),
    [storeProviders]
  );

  const connectionByKey = useMemo(
    () => new Map(manualConnections.map((item) => [item.providerKey, item])),
    [manualConnections]
  );

  const activeConnection = activeManualKey ? connectionByKey.get(activeManualKey) : undefined;

  useEffect(() => {
    if (activeStoreId) {
      fetchStoreProviders(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchStoreProviders]);

  const refresh = () => {
    if (activeStoreId) {
      fetchStoreProviders(activeStoreId).catch(() => {});
    }
  };

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Manual payment methods"
          description="Payments taken outside your online store. Orders must be approved before fulfillment."
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

        <SettingsPanel className="overflow-hidden p-0 ring-1 ring-slate-200/60">
          {loading && (
            <div className="px-4 py-12 text-center text-sm text-gray-500">
              Loading manual payment methods...
            </div>
          )}

          {!loading && (
            <ul className="divide-y divide-slate-200">
              {MANUAL_PAYMENT_OPTIONS.map((option) => {
                const connection = connectionByKey.get(option.key);
                const isConnected = Boolean(connection);

                return (
                  <li key={option.key}>
                    <button
                      type="button"
                      onClick={() => setActiveManualKey(option.key)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                          {isConnected ? (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                              Not set up
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{option.description}</p>
                        <div className="mt-2">
                          <PaymentMethodBadges methods={option.paymentMethods} />
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-gray-400" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SettingsPanel>
      </div>

      {activeManualKey && (
        <ManualPaymentSetupPanel
          providerKey={activeManualKey}
          connection={activeConnection}
          onClose={() => setActiveManualKey(null)}
          onUpdated={refresh}
        />
      )}
    </div>
  );
};

export default ManualPaymentMethodsPage;
