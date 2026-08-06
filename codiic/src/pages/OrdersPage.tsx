import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportOrdersModal from '../components/orders/ExportOrdersModal';
import OrdersAnalyticsBar from '../components/orders/OrdersAnalyticsBar';
import { formatCustomerLocation } from '../components/orders/format-customer-location';
import { mapAdminOrderLineItems } from '../components/orders/map-order-line-items';
import { filterOrdersByTab } from '../components/orders/orders-filter.util';
import OrdersPageFilters, { type OrdersFilterTab } from '../components/orders/OrdersPageFilters';
import OrdersPageHeader from '../components/orders/OrdersPageHeader';
import OrdersTable from '../components/orders/OrdersTable';
import type { OrderTableRowData } from '../components/orders/orders-table.types';
import { useAdminOrders } from '../contexts/admin-order.context';
import { useStore } from '../contexts/store.context';
import { formatPaymentMethodLabel } from '../utils/order-details.util';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { orders, loading, error, getOrdersByStoreId } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrdersFilterTab>('All');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showAnalyticsBar, setShowAnalyticsBar] = useState(false);

  useEffect(() => {
    if (activeStoreId) {
      getOrdersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, getOrdersByStoreId]);

  const tableOrders: OrderTableRowData[] = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const aTime = new Date(a.orderDate || a.createdAt || '').getTime();
      const bTime = new Date(b.orderDate || b.createdAt || '').getTime();
      return bTime - aTime;
    });

    const customerOrderCounts = new Map<string, number>();
    for (const o of sorted) {
      const id = o.customerId?._id;
      if (!id) continue;
      customerOrderCounts.set(id, (customerOrderCounts.get(id) ?? 0) + 1);
    }

    return sorted.map((o, index) => {
      const customerName = o.customerId
        ? [o.customerId.firstName, o.customerId.lastName].filter(Boolean).join(' ').trim() ||
          o.customerId.email ||
          '—'
        : '—';

      const customerId = o.customerId?._id;
      const customer = {
        customerId,
        name: customerName,
        email: o.customerId?.email,
        location: formatCustomerLocation(o.shippingAddressId),
        orderCount: customerId ? (customerOrderCounts.get(customerId) ?? 1) : 0,
      };

      const paymentStatus: OrderTableRowData['paymentStatus'] =
        o.paymentStatus === 'unpaid'
          ? 'pending'
          : o.paymentStatus === 'refunded'
            ? 'refunded'
            : 'paid';

      const fulfillmentStatus: OrderTableRowData['fulfillmentStatus'] =
        o.status === 'shipped' || o.status === 'delivered' ? 'fulfilled' : 'unfulfilled';

      return {
        orderId: o._id,
        displayNumber:
          o.displayOrderId?.trim() ||
          `#${1001 + (sorted.length - 1 - index)}`,
        date: o.orderDate || o.createdAt || '',
        customer,
        fulfillBy: '—',
        channel: 'Online Store',
        total: o.total ?? 0,
        paymentStatus,
        paymentMethod: formatPaymentMethodLabel(o.paymentMethod),
        fulfillmentStatus,
        items: o.items?.length ?? 0,
        lineItems: mapAdminOrderLineItems(o.items),
        deliveryStatus: '—',
        deliveryMethod: 'Standard',
        tags: '—',
      };
    });
  }, [orders]);

  const searchMatchingOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return tableOrders.filter(
      (o) =>
        o.displayNumber.toLowerCase().includes(q) ||
        o.orderId.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.total.toString().includes(q) ||
        o.channel.toLowerCase().includes(q)
    );
  }, [tableOrders, search]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tableOrders;
    return searchMatchingOrders;
  }, [tableOrders, search, searchMatchingOrders]);

  const visibleOrders = useMemo(
    () => filterOrdersByTab(filteredOrders, activeTab),
    [filteredOrders, activeTab]
  );

  const handleExport = useCallback(() => {
    setExportModalOpen(true);
  }, []);

  const handleToggleAnalyticsBar = useCallback(() => {
    setShowAnalyticsBar((prev) => !prev);
  }, []);

  const handleOrderView = useCallback(
    (orderId: string) => {
      navigate(`/orders/${orderId}`);
    },
    [navigate]
  );

  const handleCreateOrder = useCallback(() => {
    navigate('/orders/drafts/new');
  }, [navigate]);

  const hasOrders = orders.length > 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <OrdersPageHeader
          onExport={handleExport}
          showAnalyticsBar={showAnalyticsBar}
          onToggleAnalyticsBar={handleToggleAnalyticsBar}
        />

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          {showAnalyticsBar ? <OrdersAnalyticsBar /> : null}
          <OrdersPageFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
          />

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
              <p className="mt-4 text-[13px] text-gray-500">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[13px] text-red-600">{error}</p>
              {activeStoreId ? (
                <button
                  type="button"
                  onClick={() => getOrdersByStoreId(activeStoreId)}
                  className="mt-4 text-[13px] font-medium text-gray-900 hover:underline"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : !hasOrders ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <ShoppingBagIcon className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-[15px] font-semibold text-gray-900">No orders yet</p>
              <p className="mt-1.5 text-[13px] text-gray-500">
                Orders from your store will appear here.
              </p>
              <button
                type="button"
                onClick={handleCreateOrder}
                className="mt-6 inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                Create order
              </button>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-[13px] text-gray-500">No orders match your search or filter.</p>
            </div>
          ) : (
            <OrdersTable
              orders={visibleOrders}
              selectedOrderIds={selectedOrderIds}
              onSelectionChange={setSelectedOrderIds}
              onOrderView={handleOrderView}
            />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Learn more about orders
            </a>
          </p>
        </div>
      </div>

      <ExportOrdersModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        allOrders={tableOrders}
        currentPageOrders={visibleOrders}
        searchMatchingOrders={searchMatchingOrders}
        selectedOrderIds={selectedOrderIds}
        searchQuery={search}
      />
    </div>
  );
};

export default OrdersPage;
