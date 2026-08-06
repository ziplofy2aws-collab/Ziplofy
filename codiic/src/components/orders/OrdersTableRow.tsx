import React from 'react';
import { adminListRowClass, adminListTableCellClass } from '../admin-list-ui';
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
      className={`${adminListRowClass} ${isSelected ? 'bg-admin-row-hover' : ''}`}
      onClick={() => onView?.(order.orderId)}
    >
      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelect?.(order.orderId, e.target.checked)}
          aria-label={`Select order ${order.displayNumber}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
        />
      </td>
      <td className={`${adminListTableCellClass} font-medium text-admin-text`}>
        {order.displayNumber}
      </td>
      <td className={adminListTableCellClass}>{formatDate(order.date)}</td>
      <td className={adminListTableCellClass}>
        <OrderCustomerCell
          orderId={order.orderId}
          customer={order.customer}
          isOpen={customerPopoverOpen}
          onToggle={onToggleCustomerPopover ?? (() => {})}
        />
      </td>
      <td className={`${adminListTableCellClass} text-admin-text-subdued`}>
        {order.fulfillBy || '—'}
      </td>
      <td className={adminListTableCellClass}>{order.channel}</td>
      <td className={`${adminListTableCellClass} text-admin-text`}>
        {formatCurrency(order.total)}
      </td>
      <td className={adminListTableCellClass}>
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td className={adminListTableCellClass}>{order.paymentMethod}</td>
      <td className={adminListTableCellClass}>
        <FulfillmentStatusBadge status={order.fulfillmentStatus} />
      </td>
      <td className={adminListTableCellClass}>
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
      <td className={`${adminListTableCellClass} text-admin-text-subdued`}>
        {order.deliveryStatus || '—'}
      </td>
      <td className={adminListTableCellClass}>{order.deliveryMethod}</td>
      <td className={`${adminListTableCellClass} text-admin-text-subdued`}>
        {order.tags || '—'}
      </td>
    </tr>
  );
};

export default OrdersTableRow;
