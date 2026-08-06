import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../admin-list-ui';
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
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[1320px] border-collapse text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th scope="col" className="w-10 px-3 py-2 text-center align-middle">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all orders"
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
              />
            </th>
            <th scope="col" className={adminListTableHeadClass}>Order</th>
            <th scope="col" className={adminListTableHeadClass}>
              <button
                type="button"
                onClick={toggleDateSort}
                className="inline-flex items-center gap-0.5 hover:text-admin-text"
              >
                Date
                <ChevronDownIcon
                  className={`h-3 w-3 transition-transform ${dateSort === 'asc' ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
            </th>
            <th scope="col" className={adminListTableHeadClass}>Customer</th>
            <th scope="col" className={adminListTableHeadClass}>Fulfill by</th>
            <th scope="col" className={adminListTableHeadClass}>Channel</th>
            <th scope="col" className={adminListTableHeadClass}>Total</th>
            <th scope="col" className={adminListTableHeadClass}>Payment status</th>
            <th scope="col" className={adminListTableHeadClass}>Payment method</th>
            <th scope="col" className={adminListTableHeadClass}>Fulfillment status</th>
            <th scope="col" className={adminListTableHeadClass}>Items</th>
            <th scope="col" className={adminListTableHeadClass}>Delivery status</th>
            <th scope="col" className={adminListTableHeadClass}>Delivery method</th>
            <th scope="col" className={adminListTableHeadClass}>Tags</th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
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
              <td colSpan={14} className="px-3 py-12 text-center text-[13px] text-admin-text-secondary">
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
