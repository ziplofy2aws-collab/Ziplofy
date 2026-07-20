import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OrderItemData } from './OrderItem';
import OrderItemList from './OrderItemList';

type FilterTab = 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'closed';

interface OrderTableProps {
  orders: OrderItemData[];
  onOrderView?: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onOrderView }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const filteredOrders = orders.filter((order) => {
    switch (activeTab) {
      case 'unfulfilled':
        return order.fulfillmentStatus === 'unfulfilled';
      case 'unpaid':
        return order.paymentStatus === 'pending';
      case 'open':
        return order.fulfillmentStatus === 'unfulfilled' || order.paymentStatus === 'pending';
      case 'closed':
        return order.fulfillmentStatus === 'fulfilled' && order.paymentStatus === 'success';
      default:
        return true;
    }
  });

  const visibleOrderIds = useMemo(
    () => filteredOrders.map((order) => order.orderId),
    [filteredOrders]
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
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleOrderIds.forEach((id) => next.add(id));
      } else {
        visibleOrderIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unfulfilled', label: 'Unfulfilled' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'open', label: 'Open' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <div>
      {/* Filter Tabs */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`${
              activeTab === tab.key ? '' : 'hover:bg-gray-100 hover:text-gray-900'
            } relative rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 outline-sky-400 transition focus-visible:outline-2`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {activeTab === tab.key && (
              <motion.span
                layoutId="order-tabs-bubble"
                className="absolute inset-0 z-10 bg-blue-600"
                style={{ borderRadius: 6 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ${activeTab === tab.key ? 'text-white' : ''}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-12 px-3 py-3 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => handleSelectAllVisible(e.target.checked)}
                  aria-label="Select all visible orders"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/40"
                />
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fulfillment
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <OrderItemList
            orders={filteredOrders}
            selectedOrderIds={selectedOrderIds}
            onOrderSelect={handleSelectOrder}
            onOrderView={onOrderView ?? (() => {})}
          />
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
