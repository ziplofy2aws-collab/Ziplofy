import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PaymentMethodBadges from '../../components/payments/PaymentMethodBadges';
import BankTransferSetup from '../../components/payments/BankTransferSetup';
import UpiIdSetup from '../../components/payments/UpiIdSetup';
import CodToggle from '../../components/payments/CodToggle';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { usePaymentProviders } from '../../hooks/usePaymentProviders';
import { useStore } from '../../contexts/store.context';
import { axiosi } from '../../config/axios.config';
import type {
  BankTransferDetails,
  ConnectProviderPayload,
  PaymentProvider,
  UpiDetails,
} from '../../types/payment-provider';
import { isManualPaymentProvider } from '../../constants/manual-payment-providers';

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300';

const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';

const PaymentProviderDetailsPage: React.FC = () => {
  const { providerKey } = useParams<{ providerKey: string }>();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { storeProviders, fetchStoreProviders, connectProvider, disconnectProvider } =
    usePaymentProviders();

  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const connection = useMemo(
    () => storeProviders.find((item) => item.providerKey === providerKey && item.status === 'active'),
    [providerKey, storeProviders]
  );

  const isBankTransfer = providerKey === 'bank_transfer';
  const isUpiId = providerKey === 'upi_id';
  const isCod = providerKey === 'cod';
  const needsSetupForm = isBankTransfer || isUpiId || isCod;

  const loadProvider = useCallback(async () => {
    if (!providerKey) return;
    try {
      setLoading(true);
      const res = await axiosi.get(`/payment-providers/${providerKey}`);
      setProvider(res.data?.data ?? null);
    } catch {
      setProvider(null);
      toast.error('Payment provider not found');
    } finally {
      setLoading(false);
    }
  }, [providerKey]);

  useEffect(() => {
    loadProvider().catch(() => {});
    if (activeStoreId) {
      fetchStoreProviders(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchStoreProviders, loadProvider]);

  const handleConnect = async (payload?: ConnectProviderPayload) => {
    if (!activeStoreId || !providerKey) return;
    try {
      setSubmitting(true);
      await connectProvider(activeStoreId, providerKey, payload);
      await fetchStoreProviders(activeStoreId);
      toast.success('Payment provider connected');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to connect provider';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankTransferActivate = async (bankDetails: BankTransferDetails) => {
    await handleConnect({ bankDetails });
  };

  const handleUpiActivate = async (upiDetails: UpiDetails) => {
    await handleConnect({ upiDetails });
  };

  const handleCodToggle = async (enabled: boolean) => {
    if (!activeStoreId) return;
    try {
      setSubmitting(true);
      if (enabled) {
        await connectProvider(activeStoreId, 'cod');
        await fetchStoreProviders(activeStoreId);
        toast.success('Cash on delivery activated');
      } else if (connection) {
        await disconnectProvider(connection._id);
        await fetchStoreProviders(activeStoreId);
        toast.success('Cash on delivery deactivated');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update COD setting';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection || !activeStoreId) return;
    try {
      setSubmitting(true);
      await disconnectProvider(connection._id);
      await fetchStoreProviders(activeStoreId);
      toast.success('Payment provider disconnected');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to disconnect provider';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title={provider?.name || 'Payment provider'}
          description={provider?.description || 'Configure this payment provider for your store.'}
          leading={
            <button
              type="button"
              onClick={() =>
                navigate(
                  isManualPaymentProvider(providerKey ?? '')
                    ? '/settings/payments'
                    : '/settings/payments/providers'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            isCod ? null : connection ? (
              <button
                type="button"
                className={btnDanger}
                onClick={handleDisconnect}
                disabled={submitting}
              >
                Disconnect
              </button>
            ) : needsSetupForm ? null : (
              <button
                type="button"
                className={btnPrimary}
                onClick={() => handleConnect()}
                disabled={submitting || !activeStoreId || loading}
              >
                {submitting ? 'Connecting...' : 'Activate'}
              </button>
            )
          }
        />

        {loading ? (
          <SettingsPanel className="p-8 text-center text-sm text-gray-500">
            Loading provider...
          </SettingsPanel>
        ) : provider ? (
          <SettingsPanel className="ring-1 ring-slate-200/60">
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Provider details</h2>
                <p className="mt-2 text-sm text-gray-600">{provider.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize text-gray-900">
                    {provider.category}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    3D Secure
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {provider.supports3ds ? 'Supported' : 'Not supported'}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-900">Supported payment methods</p>
                <PaymentMethodBadges methods={provider.paymentMethods} max={20} />
              </div>

              {provider.isTest && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This is a test gateway. Use it only for development and testing — no real money is
                  processed.
                </div>
              )}

              {connection && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                  This provider is active on your store.
                </div>
              )}

              {isBankTransfer && !connection && (
                <BankTransferSetup submitting={submitting} onActivate={handleBankTransferActivate} />
              )}

              {isUpiId && !connection && (
                <UpiIdSetup submitting={submitting} onActivate={handleUpiActivate} />
              )}

              {isCod && (
                <CodToggle
                  enabled={Boolean(connection)}
                  submitting={submitting}
                  onToggle={handleCodToggle}
                />
              )}

              {isBankTransfer && connection?.bankDetails && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Payout bank details</p>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Bank</dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">
                        {connection.bankDetails.bankName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Account number
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">
                        ••••{connection.bankDetails.accountNumber.slice(-4)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        IFSC code
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">
                        {connection.bankDetails.ifscCode}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {isUpiId && connection?.upiDetails && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-sm font-semibold text-gray-900">UPI payment details</p>
                  <dl className="mt-3">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        UPI ID
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">
                        {connection.upiDetails.upiId}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </SettingsPanel>
        ) : (
          <SettingsPanel className="p-8 text-center text-sm text-gray-500">
            Provider not found.
          </SettingsPanel>
        )}
      </div>
    </div>
  );
};

export default PaymentProviderDetailsPage;
