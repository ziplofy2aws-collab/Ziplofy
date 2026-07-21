import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import type { AdminOrder } from '../../contexts/admin-order.context';
import {
  formatOrderCurrency,
  formatPaymentMethodLabel,
  getPaymentStatusLabel,
  orderCardClass,
} from '../../utils/order-details.util';

interface OrderPaymentCardProps {
  order: AdminOrder;
  onVerifyPayment?: () => Promise<void>;
}

const OrderPaymentCard: React.FC<OrderPaymentCardProps> = ({ order, onVerifyPayment }) => {
  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const itemLabel = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  const isPaid = order.paymentStatus === 'paid';
  const isManualPayment = order.paymentMethod === 'bank_transfer' || order.paymentMethod === 'upi_id';
  const showUtrSection = isManualPayment && !isPaid;
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!onVerifyPayment || verifying) return;
    try {
      setVerifying(true);
      setVerificationError(null);
      await onVerifyPayment();
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Could not verify payment');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={orderCardClass}>
      <div className="flex w-full items-center gap-2 border-b border-gray-100 bg-[#E3E3E3]/50 px-4 py-3 text-left">
        <CheckCircleIcon className={`h-4 w-4 ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`} />
        <span className="text-sm font-semibold text-gray-900">{getPaymentStatusLabel(order.paymentStatus)}</span>
      </div>

      {showUtrSection ? (
        <div className="border-b border-gray-100 bg-amber-50/60 px-4 py-4">
          {order.paymentConfirmation ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600">UTR number submitted by customer</p>
                <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-gray-900">
                  {order.paymentConfirmation.utr}
                </p>
              </div>
              <button
                type="button"
                disabled={verifying}
                onClick={() => void handleVerify()}
                className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying ? 'Verifying…' : 'Verify UTR'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">UTR has not been submitted by the customer yet.</p>
          )}
          {verificationError ? (
            <p className="mt-2 text-xs text-red-600">{verificationError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 px-4 py-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-gray-900">Subtotal</p>
            <p className="text-xs text-gray-500">{itemLabel}</p>
          </div>
          <p className="font-medium text-gray-900">{formatOrderCurrency(order.subtotal)}</p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-gray-900">Shipping</p>
            <p className="text-xs text-gray-500">Standard</p>
          </div>
          <p className="font-medium text-gray-900">{formatOrderCurrency(order.shippingCost)}</p>
        </div>

        {order.tax > 0 ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-gray-900">Tax</p>
            <p className="font-medium text-gray-900">{formatOrderCurrency(order.tax)}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
          <p className="font-semibold text-gray-900">Total</p>
          <p className="font-semibold text-gray-900">{formatOrderCurrency(order.total)}</p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
          <div>
            <p className="font-medium text-gray-900">{getPaymentStatusLabel(order.paymentStatus)}</p>
            <p className="text-xs text-gray-500">{formatPaymentMethodLabel(order.paymentMethod)}</p>
          </div>
          <p className="font-semibold text-gray-900">{formatOrderCurrency(order.total)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentCard;
