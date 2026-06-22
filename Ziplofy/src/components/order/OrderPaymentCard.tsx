import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { AdminOrder } from '../../contexts/admin-order.context';
import {
  formatOrderCurrency,
  formatPaymentMethodLabel,
  getPaymentStatusLabel,
  orderCardClass,
} from '../../utils/order-details.util';

interface OrderPaymentCardProps {
  order: AdminOrder;
}

const OrderPaymentCard: React.FC<OrderPaymentCardProps> = ({ order }) => {
  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const itemLabel = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className={orderCardClass}>
      <div className="flex items-center gap-2 border-b border-gray-100 bg-[#E3E3E3]/50 px-4 py-3">
        <CheckCircleIcon className={`h-4 w-4 ${isPaid ? 'text-gray-700' : 'text-amber-600'}`} />
        <span className="text-sm font-semibold text-gray-900">{getPaymentStatusLabel(order.paymentStatus)}</span>
      </div>

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
