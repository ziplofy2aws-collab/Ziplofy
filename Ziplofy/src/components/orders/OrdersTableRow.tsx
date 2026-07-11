import React from 'react';
import OrderCustomerCell from './OrderCustomerCell';
import OrderItemsCell from './OrderItemsCell';
import { FulfillmentStatusBadge, PaymentStatusBadge } from './order-status-badges';
import type { OrderTableRowData } from './orders-table.types';

type OrdersTableRowProps = {
  order: OrderTableRowData;
  isSelected?: boolean;
  itemsPopoverOpen?: boolean;
  onToggleItemsPopover?: (orderId: string) => void;
  customerPopoverOpen?: boolean;
  onToggleCustomerPopover?: (orderId: string) => void;
  onSelect?: (orderId: string, checked: boolean) => void;
  onView?: (orderId: string) => void;
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  isSelected,
  itemsPopoverOpen = false,
  onToggleItemsPopover,
  customerPopoverOpen = false,
  onToggleCustomerPopover,
  onSelect,
  onView,
}) => {
  return (
    <tr
      className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/80 ${
        isSelected ? 'bg-blue-50/40' : ''
      }`}
      onClick={() => onView?.(order.orderId)}
    >
      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelect?.(order.orderId, e.target.checked)}
          aria-label={`Select order ${order.displayNumber}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
        />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-medium text-gray-900">
        {order.displayNumber}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-700">
        {formatDate(order.date)}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-700">
        <OrderCustomerCell
          orderId={order.orderId}
          customer={order.customer}
          isOpen={customerPopoverOpen}
          onToggle={onToggleCustomerPopover ?? (() => {})}
        />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-500">
        {order.fulfillBy || '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-700">
        {order.channel}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-900">
        {formatCurrency(order.total)}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <FulfillmentStatusBadge status={order.fulfillmentStatus} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-700">
        <OrderItemsCell
          orderId={order.orderId}
          itemCount={order.items}
          fulfillmentStatus={order.fulfillmentStatus}
          deliveryMethod={order.deliveryMethod}
          lineItems={order.lineItems}
          isOpen={itemsPopoverOpen}
          onToggle={onToggleItemsPopover ?? (() => {})}
        />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-500">
        {order.deliveryStatus || '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-700">
        {order.deliveryMethod}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-500">
        {order.tags || '—'}
      </td>
    </tr>
  );
};

export default OrdersTableRow;
