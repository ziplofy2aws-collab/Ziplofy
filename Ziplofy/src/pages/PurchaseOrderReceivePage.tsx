import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { usePurchaseOrderEntries } from '../contexts/purchase-order-entry.context';
import { usePurchaseOrders } from '../contexts/purchase-order.context';

export default function PurchaseOrderReceivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries, fetchEntriesByPurchaseOrderId, loading, error, clearEntries } = usePurchaseOrderEntries();
  const { receiveInventory } = usePurchaseOrders();

  const [acceptById, setAcceptById] = useState<Record<string, number>>({});
  const [rejectById, setRejectById] = useState<Record<string, number>>({});

  useEffect(() => {
    if (id) {
      fetchEntriesByPurchaseOrderId(id).catch(() => {});
      return () => clearEntries();
    }
  }, [id]);

  const rows = useMemo(() => entries.map(e => {
    const v: any = e.variantId as any;
    const productTitle = v?.productId?.title || '-';
    const optionText = v?.optionValues ? Object.values(v.optionValues).join(' / ') : '';
    const rsku = v?.sku || '-';
    return { e, productTitle, optionText, rsku };
  }), [entries]);

  const handleAcceptChange = (entryId: string, remaining: number) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(ev.target.value || 0);
    const clampedAccept = Math.max(0, Math.min(raw, remaining));
    const currentReject = rejectById[entryId] ?? 0;
    const maxReject = Math.max(0, remaining - clampedAccept);
    const nextReject = Math.min(currentReject, maxReject);
    setAcceptById(prev => ({ ...prev, [entryId]: clampedAccept }));
    if (nextReject !== currentReject) setRejectById(prev => ({ ...prev, [entryId]: nextReject }));
  };
  const handleRejectChange = (entryId: string, remaining: number) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(ev.target.value || 0);
    const currentAccept = acceptById[entryId] ?? 0;
    const maxReject = Math.max(0, remaining - currentAccept);
    const clampedReject = Math.max(0, Math.min(raw, maxReject));
    setRejectById(prev => ({ ...prev, [entryId]: clampedReject }));
  };

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/products/purchase-orders/${id}`)}
                className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-medium text-gray-900">Receive Inventory</h1>
            </div>
            <button
              onClick={async () => {
                if (!id) return;
                const payload = entries.map(e => ({
                  entryId: e._id,
                  accept: Number(acceptById[e._id] ?? 0) || 0,
                  reject: Number(rejectById[e._id] ?? 0) || 0,
                }));
                try {
                  await receiveInventory(id, payload);
                  navigate(`/products/purchase-orders/${id}`);
                } catch {
                  // errors are handled in context; stay on page
                }
              }}
              className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 px-3 py-2 border border-red-200 bg-red-50">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full w-4 h-4 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
            </div>
          )}

          {!loading && (
            <div className="border border-gray-200 p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Supplier SKU</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">RSKU</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Ordered</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Received</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Accept</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Reject</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map(({ e, productTitle, optionText, rsku }) => {
                    const remaining = Math.max(0, (e.quantityOrdered || 0) - (e.quantityReceived || 0));
                    const currentAccept = acceptById[e._id] ?? 0;
                    const currentReject = rejectById[e._id] ?? 0;
                    const acceptMax = Math.max(0, remaining - currentReject);
                    const rejectMax = Math.max(0, remaining - currentAccept);
                    return (
                      <tr key={e._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900">{productTitle}</p>
                            {optionText && <p className="text-xs text-gray-600">{optionText}</p>}
                            <p className="text-xs text-gray-600">SKU: {rsku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{e.supplierSku || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{rsku}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{e.quantityOrdered}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{e.quantityReceived}</td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            max={acceptMax}
                            value={currentAccept}
                            onChange={handleAcceptChange(e._id, remaining)}
                            className="w-[140px] px-2 py-1 text-sm border border-gray-200 text-right focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            max={rejectMax}
                            value={currentReject}
                            onChange={handleRejectChange(e._id, remaining)}
                            className="w-[140px] px-2 py-1 text-sm border border-gray-200 text-right focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-600">No entries</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
    </div>
  );
}
