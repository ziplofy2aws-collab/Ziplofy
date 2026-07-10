import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  BanknotesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderTable from '../components/OrderTable';
import { useAdminOrders } from '../contexts/admin-order.context';
import { useStore } from '../contexts/store.context';
import type { OrderItemData } from '../components/OrderItem';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { orders, loading, error, getOrdersByStoreId } = useAdminOrders();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      getOrdersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, getOrdersByStoreId]);

  const tableOrders: OrderItemData[] = useMemo(() => {
    return orders.map((o) => {
      const customer = o.customerId
        ? [o.customerId.firstName, o.customerId.lastName].filter(Boolean).join(' ').trim() || o.customerId.email || '—'
        : '—';
      return {
        orderId: o._id,
        date: o.orderDate || o.createdAt || '',
        customer,
        customerId: o.customerId?._id,
        paymentStatus: o.paymentStatus === 'unpaid' ? 'pending' : 'success',
        total: o.total ?? 0,
        delivery: '—',
        items: o.items?.length ?? 0,
        fulfillmentStatus: (o.status === 'shipped' || o.status === 'delivered') ? 'fulfilled' : 'unfulfilled',
      };
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return tableOrders;
    const q = search.toLowerCase();
    return tableOrders.filter(
      (o) =>
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.toLowerCase().includes(q) ||
        o.total.toString().includes(q)
    );
  }, [tableOrders, search]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total ?? 0), 0), [orders]);
  const fulfilledCount = useMemo(
    () => orders.filter((o) => o.status === 'shipped' || o.status === 'delivered').length,
    [orders]
  );
  const unpaidCount = useMemo(() => orders.filter((o) => o.paymentStatus === 'unpaid').length, [orders]);

  const handleExport = useCallback(() => {
    console.log('Export clicked');
  }, []);

  const handleCreateOrder = useCallback(() => {
    navigate('/orders/create');
  }, [navigate]);

  const handleOrderView = useCallback(
    (orderId: string) => {
      navigate(`/orders/${orderId}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your store orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create order
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total orders</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Fulfilled</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{fulfilledCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unpaid</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{unpaidCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          {/* Search and Filters Bar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, or amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              All time
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <p className="text-sm text-red-600">{error}</p>
              {activeStoreId && (
                <button
                  type="button"
                  onClick={() => getOrdersByStoreId(activeStoreId)}
                  className="mt-4 text-sm font-medium text-gray-900 hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">No orders yet</p>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'No orders match your search.' : 'Orders from your store will appear here.'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create order
                </button>
              )}
            </div>
          ) : (
            <OrderTable
              orders={filteredOrders}
              onOrderView={handleOrderView}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
