import React, { useCallback } from 'react';

export interface PaymentSummary {
  subtotal: number;
  itemCount: number;
  discount?: {
    amount: number;
    description: string;
  };
  shipping?: {
    cost: number;
    description: string;
  };
  total: number;
  paidByCustomer: number;
  paymentDueDescription?: string;
}

interface OrderPaymentSectionProps {
  paymentSummary?: PaymentSummary;
  onEditPaymentDue?: () => void;
}

const OrderPaymentSection: React.FC<OrderPaymentSectionProps> = ({
  paymentSummary = {
    subtotal: 1500.0,
    itemCount: 1,
    discount: {
      amount: 1.0,
      description: 'New customer',
    },
    shipping: {
      cost: 0.0,
      description: 'Free shipping (0.0 lb)',
    },
    total: 1499.0,
    paidByCustomer: 0.0,
    paymentDueDescription: 'Payment due when invoice is sent',
  },
  onEditPaymentDue,
}) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleEditPaymentDue = useCallback(() => {
    if (onEditPaymentDue) {
      onEditPaymentDue();
    } else {
      console.log('Edit payment due clicked');
    }
  }, [onEditPaymentDue]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200/80">
        <div className="pl-3 border-l-4 border-blue-600">
          <h3 className="text-base font-semibold text-gray-900">Payment</h3>
          <p className="text-xs text-gray-500 mt-0.5">Review the order summary and payment details</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="px-5 py-4">
        <div className="space-y-4">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-900">Subtotal</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {paymentSummary.itemCount} {paymentSummary.itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-sm font-medium text-gray-900 w-24 text-right">
                {formatCurrency(paymentSummary.subtotal)}
              </span>
            </div>
          </div>

          {/* Discount */}
          {paymentSummary.discount && (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-900">Discount</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{paymentSummary.discount.description}</span>
                <span className="text-sm font-medium text-red-600 w-24 text-right">
                  -{formatCurrency(paymentSummary.discount.amount)}
                </span>
              </div>
            </div>
          )}

          {/* Shipping */}
          {paymentSummary.shipping !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-900">Shipping</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{paymentSummary.shipping.description}</span>
                <span className="text-sm font-medium text-gray-900 w-24 text-right">
                  {formatCurrency(paymentSummary.shipping.cost)}
                </span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Total</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-[100px]"></span>
              <span className="text-sm font-bold text-gray-900 w-24 text-right">
                {formatCurrency(paymentSummary.total)}
              </span>
            </div>
          </div>

          {/* Paid by customer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              <p className="text-sm text-gray-900">Paid by customer</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-[100px]"></span>
              <span className="text-sm font-medium text-gray-900 w-24 text-right">
                {formatCurrency(paymentSummary.paidByCustomer)}
              </span>
            </div>
          </div>

          {/* Payment due */}
          {paymentSummary.paymentDueDescription && (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-900">{paymentSummary.paymentDueDescription}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-[100px]"></span>
                <button
                  onClick={handleEditPaymentDue}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium w-24 text-right transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentSection;

