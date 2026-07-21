import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PurchaseOrderFormHeader from '../components/purchase-orders/PurchaseOrderFormHeader';
import {
  formatPurchaseOrderLabel,
  PO_FORM_APPEARANCE,
  poInputClass,
  poTableCellClass,
  poTableCellRightClass,
  poTableHeadClass,
  poTableHeadRightClass,
} from '../components/purchase-orders/purchase-order-ui.util';
import {
  productFormCardClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
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
  }, [id, fetchEntriesByPurchaseOrderId, clearEntries]);

  const rows = useMemo(
    () =>
      entries.map((entry) => {
        const variant = entry.variantId as any;
        const productTitle = variant?.productId?.title || '—';
        const optionText = variant?.optionValues ? Object.values(variant.optionValues).join(' / ') : '';
        const sku = variant?.sku || 'No SKU';
        const imageUrl = variant?.images?.[0] || variant?.productId?.imageUrls?.[0];
        return { entry, productTitle, optionText, sku, imageUrl };
      }),
    [entries]
  );

  const handleAcceptChange =
    (entryId: string, remaining: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value || 0);
      const clampedAccept = Math.max(0, Math.min(raw, remaining));
      const currentReject = rejectById[entryId] ?? 0;
      const maxReject = Math.max(0, remaining - clampedAccept);
      const nextReject = Math.min(currentReject, maxReject);
      setAcceptById((prev) => ({ ...prev, [entryId]: clampedAccept }));
      if (nextReject !== currentReject) {
        setRejectById((prev) => ({ ...prev, [entryId]: nextReject }));
      }
    };

  const handleRejectChange =
    (entryId: string, remaining: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value || 0);
      const currentAccept = acceptById[entryId] ?? 0;
      const maxReject = Math.max(0, remaining - currentAccept);
      const clampedReject = Math.max(0, Math.min(raw, maxReject));
      setRejectById((prev) => ({ ...prev, [entryId]: clampedReject }));
    };

  const handleSave = async () => {
    if (!id) return;
    const payload = entries.map((entry) => ({
      entryId: entry._id,
      accept: Number(acceptById[entry._id] ?? 0) || 0,
      reject: Number(rejectById[entry._id] ?? 0) || 0,
    }));
    try {
      await receiveInventory(id, payload);
      navigate(`/products/purchase-orders/${id}`);
    } catch {
      // errors handled in context
    }
  };

  return (
    <div className={productFormPageClass(PO_FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        <PurchaseOrderFormHeader
          title={`Receive ${id ? formatPurchaseOrderLabel(id) : 'inventory'}`}
          backLabel="Back to purchase order"
          onBack={() => navigate(`/products/purchase-orders/${id}`)}
          onSubmit={() => void handleSave()}
          submitLabel="Save"
        />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
          <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Incoming inventory</h2>

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className={poTableHeadClass}>Product</th>
                      <th className={poTableHeadClass}>Supplier SKU</th>
                      <th className={poTableHeadClass}>SKU</th>
                      <th className={poTableHeadRightClass}>Ordered</th>
                      <th className={poTableHeadRightClass}>Received</th>
                      <th className={poTableHeadRightClass}>Accept</th>
                      <th className={poTableHeadRightClass}>Reject</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`${poTableCellClass} py-12 text-center text-gray-500`}>
                          No entries
                        </td>
                      </tr>
                    ) : (
                      rows.map(({ entry, productTitle, optionText, sku, imageUrl }) => {
                        const remaining = Math.max(
                          0,
                          (entry.quantityOrdered || 0) - (entry.quantityReceived || 0)
                        );
                        const currentAccept = acceptById[entry._id] ?? 0;
                        const currentReject = rejectById[entry._id] ?? 0;
                        const acceptMax = Math.max(0, remaining - currentReject);
                        const rejectMax = Math.max(0, remaining - currentAccept);

                        return (
                          <tr key={entry._id} className="border-b border-gray-100">
                            <td className={poTableCellClass}>
                              <div className="flex min-w-[200px] items-center gap-3">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                  {imageUrl ? (
                                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                      <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-[13px] font-medium text-gray-900">{productTitle}</p>
                                  {optionText ? (
                                    <p className="truncate text-[12px] text-gray-500">{optionText}</p>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className={poTableCellClass}>{entry.supplierSku || '—'}</td>
                            <td className={poTableCellClass}>{sku}</td>
                            <td className={poTableCellRightClass}>{entry.quantityOrdered}</td>
                            <td className={poTableCellRightClass}>{entry.quantityReceived}</td>
                            <td className={poTableCellRightClass}>
                              <input
                                type="number"
                                min={0}
                                max={acceptMax}
                                value={currentAccept}
                                onChange={handleAcceptChange(entry._id, remaining)}
                                className={`${poInputClass} w-24 text-right`}
                              />
                            </td>
                            <td className={poTableCellRightClass}>
                              <input
                                type="number"
                                min={0}
                                max={rejectMax}
                                value={currentReject}
                                onChange={handleRejectChange(entry._id, remaining)}
                                className={`${poInputClass} w-24 text-right`}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
