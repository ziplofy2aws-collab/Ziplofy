import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import BankTransferSetup from './BankTransferSetup';
import CodToggle from './CodToggle';
import UpiIdSetup from './UpiIdSetup';
import {
  MANUAL_PAYMENT_OPTIONS,
  type ManualPaymentProviderKey,
} from '../../constants/manual-payment-providers';
import { usePaymentProviders } from '../../hooks/usePaymentProviders';
import { useStore } from '../../contexts/store.context';
import type {
  BankTransferDetails,
  ConnectProviderPayload,
  StorePaymentProvider,
  UpiDetails,
} from '../../types/payment-provider';

const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';

interface ManualPaymentSetupPanelProps {
  providerKey: ManualPaymentProviderKey;
  connection?: StorePaymentProvider | null;
  onClose: () => void;
  onUpdated: () => void;
}

function hasBankDetails(connection?: StorePaymentProvider | null) {
  return Boolean(
    connection?.bankDetails?.bankName &&
      connection?.bankDetails?.accountNumber &&
      connection?.bankDetails?.ifscCode
  );
}

function hasUpiDetails(connection?: StorePaymentProvider | null) {
  return Boolean(connection?.upiDetails?.upiId);
}

const ManualPaymentSetupPanel: React.FC<ManualPaymentSetupPanelProps> = ({
  providerKey,
  connection,
  onClose,
  onUpdated,
}) => {
  const { activeStoreId } = useStore();
  const { connectProvider, disconnectProvider } = usePaymentProviders();
  const [submitting, setSubmitting] = useState(false);

  const option = MANUAL_PAYMENT_OPTIONS.find((item) => item.key === providerKey);
  const isConnected = Boolean(connection);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleConnect = async (payload?: ConnectProviderPayload) => {
    if (!activeStoreId) return;
    try {
      setSubmitting(true);
      await connectProvider(activeStoreId, providerKey, payload);
      onUpdated();
      toast.success('Manual payment method saved');
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save manual payment method';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    try {
      setSubmitting(true);
      await disconnectProvider(connection._id);
      onUpdated();
      toast.success('Manual payment method removed');
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to remove manual payment method';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodToggle = async (enabled: boolean) => {
    if (!activeStoreId) return;
    try {
      setSubmitting(true);
      if (enabled) {
        await connectProvider(activeStoreId, 'cod');
        onUpdated();
        toast.success('Cash on delivery activated');
      } else if (connection) {
        await disconnectProvider(connection._id);
        onUpdated();
        toast.success('Cash on delivery deactivated');
        onClose();
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-payment-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h3 id="manual-payment-title" className="text-base font-semibold text-gray-900">
              {option?.label}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{option?.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {providerKey === 'bank_transfer' && !hasBankDetails(connection) && (
            <BankTransferSetup
              initialValues={connection?.bankDetails ?? undefined}
              submitting={submitting}
              onActivate={(details: BankTransferDetails) => handleConnect({ bankDetails: details })}
            />
          )}

          {providerKey === 'upi_id' && !hasUpiDetails(connection) && (
            <UpiIdSetup
              initialValue={connection?.upiDetails?.upiId ?? ''}
              submitting={submitting}
              onActivate={(details: UpiDetails) => handleConnect({ upiDetails: details })}
            />
          )}

          {providerKey === 'cod' && (
            <CodToggle
              enabled={isConnected}
              submitting={submitting}
              onToggle={handleCodToggle}
            />
          )}

          {providerKey === 'bank_transfer' && hasBankDetails(connection) && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <dl className="grid gap-3 sm:grid-cols-1">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Bank</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {connection?.bankDetails?.bankName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Account number
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    ••••{connection?.bankDetails?.accountNumber?.slice(-4)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    IFSC code
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {connection?.bankDetails?.ifscCode}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                className={btnDanger}
                onClick={handleDisconnect}
                disabled={submitting}
              >
                Remove bank transfer
              </button>
            </div>
          )}

          {providerKey === 'upi_id' && hasUpiDetails(connection) && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <dl>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">UPI ID</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {connection?.upiDetails?.upiId}
                </dd>
              </dl>
              <button
                type="button"
                className={btnDanger}
                onClick={handleDisconnect}
                disabled={submitting}
              >
                Remove UPI ID
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ManualPaymentSetupPanel;
