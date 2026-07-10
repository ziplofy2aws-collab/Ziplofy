import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseOrdersTable from '../components/purchase-orders/PurchaseOrdersTable';
import { usePurchaseOrders } from '../contexts/purchase-order.context';
import { useStore } from '../contexts/store.context';

export default function PurchaseOrdersListPage() {
  const { activeStoreId } = useStore();
  const { purchaseOrders, fetchPurchaseOrdersByStore, loading, error } = usePurchaseOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeStoreId) {
      fetchPurchaseOrdersByStore(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchPurchaseOrdersByStore]);

  const handleCreatePurchaseOrder = useCallback(() => {
    navigate('/products/purchase-orders/new');
  }, [navigate]);

  const handleRowClick = useCallback((purchaseOrderId: string) => {
    navigate(`/products/purchase-orders/${purchaseOrderId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="pl-3 border-l-4 border-blue-500/60">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage purchase orders from suppliers</p>
          </div>
          <button
            onClick={handleCreatePurchaseOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Create purchase order
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600"></div>
          </div>
        )}

        {!loading && purchaseOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[320px] flex justify-center items-center p-12">
            <div className="flex flex-col justify-center items-center text-center gap-4 max-w-md">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <DocumentTextIcon className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">No purchase orders yet</p>
              <button
                onClick={handleCreatePurchaseOrder}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Create purchase order
              </button>
            </div>
          </div>
        )}

        {!loading && purchaseOrders.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <PurchaseOrdersTable purchaseOrders={purchaseOrders} onRowClick={handleRowClick} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


