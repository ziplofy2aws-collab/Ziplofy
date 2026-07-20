import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseOrdersPageFilters, {
  type PurchaseOrderFilterTab,
} from '../components/purchase-orders/PurchaseOrdersPageFilters';
import PurchaseOrdersPageHeader from '../components/purchase-orders/PurchaseOrdersPageHeader';
import PurchaseOrdersTable from '../components/purchase-orders/PurchaseOrdersTable';
import { poPrimaryButtonClass } from '../components/purchase-orders/purchase-order-ui.util';
import { usePurchaseOrders } from '../contexts/purchase-order.context';
import { useStore } from '../contexts/store.context';

export default function PurchaseOrdersListPage() {
  const { activeStoreId } = useStore();
  const { purchaseOrders, fetchPurchaseOrdersByStore, loading, error } = usePurchaseOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PurchaseOrderFilterTab>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      fetchPurchaseOrdersByStore(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchPurchaseOrdersByStore]);

  const handleCreatePurchaseOrder = useCallback(() => {
    navigate('/products/purchase-orders/new');
  }, [navigate]);

  const handleRowClick = useCallback(
    (purchaseOrderId: string) => {
      navigate(`/products/purchase-orders/${purchaseOrderId}`);
    },
    [navigate]
  );

  const filteredPurchaseOrders = useMemo(() => {
    const list = purchaseOrders || [];
    const byTab = list.filter((po) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Draft') return po.status === 'draft';
      if (activeTab === 'Ordered') {
        return po.status === 'ordered' || po.status === 'in_transit' || po.status === 'partially_received';
      }
      return po.status === 'received';
    });

    const query = search.trim().toLowerCase();
    if (!query) return byTab;

    return byTab.filter((po) => {
      const supplierName =
        typeof po.supplierId === 'string' ? po.supplierId : po.supplierId?.name || '';
      const destinationName =
        typeof po.destinationLocationId === 'string'
          ? po.destinationLocationId
          : po.destinationLocationId?.name || '';
      return (
        po._id.toLowerCase().includes(query) ||
        supplierName.toLowerCase().includes(query) ||
        destinationName.toLowerCase().includes(query) ||
        po.status.toLowerCase().includes(query)
      );
    });
  }, [purchaseOrders, activeTab, search]);

  const hasPurchaseOrders = (purchaseOrders || []).length > 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <PurchaseOrdersPageHeader />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <PurchaseOrdersPageFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
          />

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
            </div>
          ) : !hasPurchaseOrders ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-gray-900">Create your first purchase order</p>
              <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                Order inventory from your suppliers and track incoming stock
              </p>
              <button type="button" onClick={handleCreatePurchaseOrder} className={`mt-4 ${poPrimaryButtonClass}`}>
                Create purchase order
              </button>
            </div>
          ) : (
            <PurchaseOrdersTable purchaseOrders={filteredPurchaseOrders} onRowClick={handleRowClick} />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Learn more about purchase orders
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
