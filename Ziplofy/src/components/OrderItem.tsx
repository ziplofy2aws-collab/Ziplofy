import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';

export interface OrderItemData {
  orderId: string;
  date: string;
  customer: string;
  /** When set, customer name links to admin customer details */
  customerId?: string;
  paymentStatus: 'pending' | 'success';
  total: number;
  delivery: string;
  items: number;
  fulfillmentStatus: 'unfulfilled' | 'fulfilled';
}

interface OrderItemProps {
  order: OrderItemData;
  isSelected?: boolean;
  onSelect?: (orderId: string, checked: boolean) => void;
  onView?: (orderId: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, isSelected, onSelect, onView }) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const shortOrderId = order.orderId?.length === 24
    ? `#${order.orderId.slice(-6).toUpperCase()}`
    : order.orderId ?? '—';

  return (
    <tr
      className={`border-b border-gray-50 transition-colors group cursor-pointer ${
        isSelected ? 'bg-blue-50/60' : 'hover:bg-blue-50/50'
      }`}
      onClick={() => onView?.(order.orderId)}
    >
      <td
        className="w-12 px-3 py-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelect?.(order.orderId, e.target.checked)}
          aria-label={`Select order ${shortOrderId}`}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/40"
        />
      </td>
      <td className="px-5 py-4">
        <span className="text-sm font-medium text-gray-900">{shortOrderId}</span>
        <p className="text-xs text-gray-500 mt-0.5">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
      </td>
      <td className="px-5 py-4">
        <span className="text-sm text-gray-600">{formatDate(order.date)}</span>
      </td>
      <td className="px-5 py-4">
        {order.customerId ? (
          <Link
            to={`/customers/${order.customerId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {order.customer}
          </Link>
        ) : (
          <span className="text-sm text-gray-900">{order.customer}</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
            order.paymentStatus === 'pending'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              order.paymentStatus === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          {order.paymentStatus === 'pending' ? 'Pending' : 'Paid'}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
            order.fulfillmentStatus === 'unfulfilled'
              ? 'bg-red-50 text-red-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              order.fulfillmentStatus === 'unfulfilled' ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />
          {order.fulfillmentStatus === 'unfulfilled' ? 'Unfulfilled' : 'Fulfilled'}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</span>
      </td>
      <td className="px-5 py-4 w-12">
        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </td>
    </tr>
  );
};

export default OrderItem;
