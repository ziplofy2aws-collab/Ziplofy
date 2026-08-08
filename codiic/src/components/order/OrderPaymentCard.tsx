import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { adminListPrimaryButtonClass } from '../admin-list-ui';
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
      <div
        className={`flex w-full items-center gap-2 border-b border-admin-divider px-4 py-3 text-left ${
          isPaid ? 'bg-[#cdfee1]/35' : 'bg-[#fef3d0]/50'
        }`}
      >
        <CheckCircleIcon
          className={`h-4 w-4 ${isPaid ? 'text-[#0c5132]' : 'text-[#c9a227]'}`}
        />
        <span className="text-[13px] font-semibold text-admin-text">
          {getPaymentStatusLabel(order.paymentStatus)}
        </span>
      </div>

      {showUtrSection ? (
        <div className="border-b border-admin-divider bg-[#fef3d0]/40 px-4 py-4">
          {order.paymentConfirmation ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[12px] text-admin-text-secondary">UTR number submitted by customer</p>
                <p className="mt-1 font-mono text-[13px] font-semibold tracking-wide text-admin-text">
                  {order.paymentConfirmation.utr}
                </p>
              </div>
              <button
                type="button"
                disabled={verifying}
                onClick={() => void handleVerify()}
                className={adminListPrimaryButtonClass}
              >
                {verifying ? 'Verifying…' : 'Verify UTR'}
              </button>
            </div>
          ) : (
            <p className="text-[13px] text-admin-text-secondary">
              UTR has not been submitted by the customer yet.
            </p>
          )}
          {verificationError ? (
            <p className="mt-2 text-[12px] text-red-600">{verificationError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 px-4 py-4 text-[13px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-admin-text">Subtotal</p>
            <p className="text-[12px] text-admin-text-subdued">{itemLabel}</p>
          </div>
          <p className="font-medium text-admin-text">{formatOrderCurrency(order.subtotal)}</p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-admin-text">Shipping</p>
            <p className="text-[12px] text-admin-text-subdued">Standard</p>
          </div>
          <p className="font-medium text-admin-text">{formatOrderCurrency(order.shippingCost)}</p>
        </div>

        {order.tax > 0 ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-admin-text">Tax</p>
            <p className="font-medium text-admin-text">{formatOrderCurrency(order.tax)}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t border-admin-divider pt-3">
          <p className="font-semibold text-admin-text">Total</p>
          <p className="font-semibold text-admin-text">{formatOrderCurrency(order.total)}</p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-admin-divider pt-3">
          <div>
            <p className="font-medium text-admin-text">{getPaymentStatusLabel(order.paymentStatus)}</p>
            <p className="text-[12px] text-admin-text-subdued">
              {formatPaymentMethodLabel(order.paymentMethod)}
            </p>
          </div>
          <p className="font-semibold text-admin-text">{formatOrderCurrency(order.total)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentCard;
