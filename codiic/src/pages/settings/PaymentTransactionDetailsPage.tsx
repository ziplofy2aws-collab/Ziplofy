import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePayment } from '../../contexts/payment.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

function formatInrPaise(paise: number | null): string {
  if (paise === null || paise === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

const PaymentTransactionDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const { activeStoreId } = useStore();
  const { payments, loading, error, fetchByStoreId, clearError } = usePayment();

  const transaction = useMemo(
    () => payments.find((p) => p._id === transactionId),
    [payments, transactionId]
  );

  const load = useCallback(async () => {
    if (!activeStoreId) return;
    clearError();
    await fetchByStoreId(activeStoreId);
  }, [activeStoreId, clearError, fetchByStoreId]);

  useEffect(() => {
    if (!activeStoreId) return;
    if (!transactionId) return;
    if (!transaction) {
      load().catch(() => {});
    }
  }, [activeStoreId, transactionId, transaction, load]);

  return (
    <div className="w-full">
      <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Transaction details"
          description="Inspect all submitted details for this payment confirmation."
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/payments/transactions')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to transactions
            </button>
          }
          actions={
            <button
              type="button"
              onClick={() => load()}
              disabled={loading || !activeStoreId}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border border-gray-200/90 text-gray-700 bg-white shadow-sm hover:bg-gray-50/90 disabled:opacity-50 transition-colors shrink-0"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {!activeStoreId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            Select a store in the header to load transaction details.
          </div>
        )}

        {activeStoreId && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-6">
            {error}
          </div>
        )}

        {activeStoreId && !error && !transaction && !loading && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-8 text-center">
            <p className="text-sm font-medium text-gray-900">Transaction not found</p>
            <p className="mt-1 text-sm text-gray-500">
              It may belong to a different store, or the record was removed.
            </p>
          </div>
        )}

        {transaction && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Reference {transaction.referenceId}</h2>
              <p className="text-sm text-gray-500 mt-1">Submitted on {formatDateTime(transaction.createdAt)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Payer name</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{transaction.name}</p>
              </div>
              <div className="p-5 border-b border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-all">{transaction.email}</p>
              </div>
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">UTR</p>
                <p className="mt-1 text-sm font-mono text-gray-900">{transaction.utr}</p>
              </div>
              <div className="p-5 border-b border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Amount</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{formatInrPaise(transaction.amountPaise)}</p>
              </div>
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Order reference</p>
                <p className="mt-1 text-sm font-mono text-gray-700">{transaction.orderId || '—'}</p>
              </div>
              <div className="p-5 border-b border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Merchant name</p>
                <p className="mt-1 text-sm text-gray-900">{transaction.merchantName || '—'}</p>
              </div>
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Transaction ID</p>
                <p className="mt-1 text-sm font-mono text-gray-700 break-all">{transaction._id}</p>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-gray-500">Customer ID</p>
                <p className="mt-1 text-sm font-mono text-gray-700 break-all">{transaction.customerId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTransactionDetailsPage;

