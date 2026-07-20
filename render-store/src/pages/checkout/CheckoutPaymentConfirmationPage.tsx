import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '@codiic/create-theme/checkout/checkout-storefront.constants';
import { useCheckoutPageAppearance } from '@/hooks/useCheckoutPageAppearance';
import { usePayment } from '@/contexts/payment.context';
import {
  clearPendingCheckoutPayment,
  loadPendingCheckoutPayment,
} from '@/utils/pendingCheckoutPayment';
import {
  saveCompletedCheckoutOrder,
} from '@/utils/completedCheckoutOrder';

function formatInr(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function CheckoutPaymentConfirmationPage() {
  const navigate = useNavigate();
  const pending = useMemo(() => loadPendingCheckoutPayment(), []);
  const { theme, storeName: liveStoreName } = useCheckoutPageAppearance();
  const { confirmPayment, loading } = usePayment();
  const [utr, setUtr] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);

  if (!pending) {
    return <Navigate to="/checkout" replace />;
  }

  const accentColor = theme?.accentColor ?? '#1773b0';
  const buttonColor = theme?.buttonColor ?? accentColor;
  const { completedOrder, paymentMethod, paymentInstructions, paymentMethodLabel } = pending;
  const displayStoreName = pending.storeName || liveStoreName || 'Store';

  const validateUtr = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!/^\d{10,18}$/.test(digits)) {
      return 'UTR must be 10–18 digits';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const error = validateUtr(utr);
    if (error) {
      setUtrError(error);
      return;
    }

    setUtrError(null);
    const utrDigits = utr.replace(/\D/g, '');

    try {
      await confirmPayment({
        storeId: pending.storeId,
        customerId: pending.customerId,
        name: pending.customerName,
        email: pending.email,
        utr: utrDigits,
        referenceId: completedOrder.confirmationLabel,
        amountPaise: Math.round(completedOrder.total * 100),
        merchantName: displayStoreName,
        orderId: completedOrder.orderId,
      });

      saveCompletedCheckoutOrder(completedOrder);
      clearPendingCheckoutPayment();
      toast.success('Payment reference submitted');
      navigate('/checkout/thank-you', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit UTR';
      toast.error(message);
    }
  };

  return (
    <div className={`${CHECKOUT_STOREFRONT_ROOT_CLASS} min-h-screen bg-white`}>
      <div className="mx-auto w-full max-w-[580px] px-6 py-8 sm:px-8">
        <div className="mb-6">
          <p className="text-[13px] font-medium uppercase tracking-wide text-[#707070]">Order placed</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[#121212]">Submit payment reference</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#707070]">
            Your order {completedOrder.confirmationLabel} was created. Complete your{' '}
            {paymentMethodLabel} payment, then enter the UTR / transaction reference below.
          </p>
        </div>

        <div className="mb-6 rounded-[5px] border border-[#dedede] bg-[#fafafa] px-4 py-3.5 text-[14px] text-[#121212]">
          <p className="font-medium">Amount to pay: {formatInr(completedOrder.total)}</p>
          {paymentMethod === 'bank_transfer' && paymentInstructions ? (
            <div className="mt-3 space-y-1 text-[13px] text-[#444]">
              <p className="font-medium text-[#121212]">Transfer payment to:</p>
              {paymentInstructions.bankName ? <p>Bank: {paymentInstructions.bankName}</p> : null}
              {paymentInstructions.accountNumber ? (
                <p>Account: {paymentInstructions.accountNumber}</p>
              ) : null}
              {paymentInstructions.ifscCode ? <p>IFSC: {paymentInstructions.ifscCode}</p> : null}
            </div>
          ) : null}
          {paymentMethod === 'upi_id' && paymentInstructions?.upiId ? (
            <div className="mt-3 text-[13px] text-[#444]">
              <p className="font-medium text-[#121212]">Pay to UPI ID:</p>
              <p>{paymentInstructions.upiId}</p>
            </div>
          ) : null}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label htmlFor="checkout-utr" className="mb-1.5 block text-[12px] text-[#707070]">
              UTR / transaction reference
            </label>
            <input
              id="checkout-utr"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={utr}
              onChange={(event) => {
                setUtr(event.target.value);
                if (utrError) setUtrError(null);
              }}
              placeholder="Enter 10–18 digit UTR"
              className="w-full rounded-[5px] border border-[#dedede] px-3 py-3 text-[14px] text-[#121212] outline-none focus:border-[#121212]"
            />
            {utrError ? <p className="mt-1 text-[12px] text-[#d72c0d]">{utrError}</p> : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[5px] px-4 py-4 text-center text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: buttonColor }}
          >
            {loading ? 'Submitting…' : 'Submit UTR and complete order'}
          </button>
        </form>
      </div>
    </div>
  );
}
