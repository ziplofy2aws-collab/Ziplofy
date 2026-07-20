import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef } from 'react';
import OrdersTableRow from './OrdersTableRow';
import type { OrderTableRowData } from './orders-table.types';

type SortDirection = 'desc' | 'asc';

interface OrdersTableProps {
  orders: OrderTableRowData[];
  selectedOrderIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  onOrderView?: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  selectedOrderIds,
  onSelectionChange,
  onOrderView,
}) => {
  const [dateSort, setDateSort] = React.useState<SortDirection>('desc');
  const [openItemsOrderId, setOpenItemsOrderId] = React.useState<string | null>(null);
  const [openCustomerOrderId, setOpenCustomerOrderId] = React.useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const handleToggleItemsPopover = React.useCallback((orderId: string) => {
    setOpenItemsOrderId((prev) => (prev === orderId ? null : orderId));
    setOpenCustomerOrderId(null);
  }, []);

  const handleToggleCustomerPopover = React.useCallback((orderId: string) => {
    setOpenCustomerOrderId((prev) => (prev === orderId ? null : orderId));
    setOpenItemsOrderId(null);
  }, []);

  const sortedOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return dateSort === 'desc' ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [orders, dateSort]);

  const visibleOrderIds = useMemo(
    () => sortedOrders.map((order) => order.orderId),
    [sortedOrders]
  );
  const selectedVisibleCount = useMemo(
    () => visibleOrderIds.filter((id) => selectedOrderIds.has(id)).length,
    [visibleOrderIds, selectedOrderIds]
  );
  const allVisibleSelected = visibleOrderIds.length > 0 && selectedVisibleCount === visibleOrderIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const next = new Set(selectedOrderIds);
    if (checked) next.add(orderId);
    else next.delete(orderId);
    onSelectionChange(next);
  };

  const handleSelectAllVisible = (checked: boolean) => {
    const next = new Set(selectedOrderIds);
    if (checked) visibleOrderIds.forEach((id) => next.add(id));
    else visibleOrderIds.forEach((id) => next.delete(id));
    onSelectionChange(next);
  };

  const toggleDateSort = () => {
    setDateSort((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1320px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="w-10 px-3 py-2.5 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all orders"
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
              />
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Order</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">
              <button
                type="button"
                onClick={toggleDateSort}
                className="inline-flex items-center gap-0.5 hover:text-gray-700"
              >
                Date
                <ChevronDownIcon
                  className={`h-3 w-3 transition-transform ${dateSort === 'asc' ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Fulfill by</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Channel</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Total</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Payment status</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Payment method</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Fulfillment status</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Items</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Delivery status</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Delivery method</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Tags</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {sortedOrders.length > 0 ? (
            sortedOrders.map((order) => (
              <OrdersTableRow
                key={order.orderId}
                order={order}
                isSelected={selectedOrderIds.has(order.orderId)}
                itemsPopoverOpen={openItemsOrderId === order.orderId}
                onToggleItemsPopover={handleToggleItemsPopover}
                customerPopoverOpen={openCustomerOrderId === order.orderId}
                onToggleCustomerPopover={handleToggleCustomerPopover}
                onSelect={handleSelectOrder}
                onView={onOrderView}
              />
            ))
          ) : (
            <tr>
              <td colSpan={14} className="px-3 py-12 text-center text-[13px] text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
