import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import PurchaseOrderEntriesTable from '../components/purchase-orders/PurchaseOrderEntriesTable';
import PurchaseOrderFormHeader from '../components/purchase-orders/PurchaseOrderFormHeader';
import {
  formatPurchaseOrderLabel,
  PO_FORM_APPEARANCE,
  poPrimaryButtonClass,
  poSecondaryButtonClass,
} from '../components/purchase-orders/purchase-order-ui.util';
import {
  productFormAsideStackClass,
  productFormCardClass,
  productFormGridClass,
  productFormLabelClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
import ProductFormPageSkeleton from '../components/products/ProductFormPageSkeleton';
import { usePurchaseOrderEntries } from '../contexts/purchase-order-entry.context';
import { usePurchaseOrders } from '../contexts/purchase-order.context';
import { useStore } from '../contexts/store.context';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={productFormLabelClass(PO_FORM_APPEARANCE)}>{label}</p>
      <p className="text-[13px] text-gray-900">{value}</p>
    </div>
  );
}

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { purchaseOrders, fetchPurchaseOrdersByStore, markAsOrdered, loading } = usePurchaseOrders();
  const po = useMemo(() => purchaseOrders.find((item) => item._id === id) || null, [purchaseOrders, id]);
  const {
    entries,
    fetchEntriesByPurchaseOrderId,
    loading: entriesLoading,
    error: entriesError,
    clearEntries,
  } = usePurchaseOrderEntries();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStoreId && id && !po) {
      fetchPurchaseOrdersByStore(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, id, po, fetchPurchaseOrdersByStore]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (po?._id) {
      fetchEntriesByPurchaseOrderId(po._id).catch(() => {});
      return () => {
        clearEntries();
      };
    }
  }, [po?._id, fetchEntriesByPurchaseOrderId, clearEntries]);

  const supplierName = useMemo(() => {
    if (!po) return '—';
    return typeof po.supplierId === 'string' ? po.supplierId : po.supplierId?.name || '—';
  }, [po]);

  const destinationName = useMemo(() => {
    if (!po) return '—';
    return typeof po.destinationLocationId === 'string'
      ? po.destinationLocationId
      : po.destinationLocationId?.name || '—';
  }, [po]);

  const handleBack = useCallback(() => {
    navigate('/products/purchase-orders');
  }, [navigate]);

  const handleReceive = useCallback(() => {
    if (po?._id) navigate(`/products/purchase-orders/${po._id}/receive`);
  }, [navigate, po?._id]);

  if (loading && !po) {
    return <ProductFormPageSkeleton />;
  }

  if (!po) {
    return (
      <div className={productFormPageClass(PO_FORM_APPEARANCE)}>
        <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
          <PurchaseOrderFormHeader title="Purchase order not found" onBack={handleBack} />
          <div className="rounded-lg border border-gray-200/50 bg-white px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-gray-900">Purchase order not found</p>
            <p className="mt-1.5 text-[13px] text-gray-500">
              This purchase order isn&apos;t loaded yet or doesn&apos;t exist.
            </p>
            <button type="button" onClick={handleBack} className={`mt-6 ${poPrimaryButtonClass}`}>
              Back to purchase orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const referenceNumber = (po as { referenceNumber?: string }).referenceNumber || '—';
  const noteToSupplier = (po as { noteToSupplier?: string }).noteToSupplier || '—';

  return (
    <div className={productFormPageClass(PO_FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        <PurchaseOrderFormHeader
          title={formatPurchaseOrderLabel(po._id)}
          status={po.status}
          onBack={handleBack}
          actions={
            <>
              {po.status === 'draft' ? (
                <button type="button" onClick={() => setConfirmOpen(true)} className={poPrimaryButtonClass}>
                  Mark as ordered
                </button>
              ) : null}
              {po.status !== 'draft' && po.status !== 'received' ? (
                <button type="button" onClick={handleReceive} className={poPrimaryButtonClass}>
                  Receive inventory
                </button>
              ) : null}
              {po.status === 'draft' ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className={`${poSecondaryButtonClass} gap-1`}
                  >
                    More actions
                    <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                  {isMenuOpen ? (
                    <div className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-md">
                      <button
                        type="button"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full px-3 py-1.5 text-left text-[13px] text-red-600 transition-colors hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          }
        />

        <div className={productFormGridClass(PO_FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(PO_FORM_APPEARANCE)}>
            <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Supplier & destination</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadOnlyField label="Supplier" value={supplierName} />
                <ReadOnlyField label="Destination" value={destinationName} />
                <ReadOnlyField label="Payment terms" value={po.paymentTerm || '—'} />
                <ReadOnlyField label="Supplier currency" value={po.supplierCurrency || '—'} />
              </div>
            </section>

            <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Shipment details</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                <ReadOnlyField
                  label="Estimated arrival"
                  value={
                    po.expectedArrivalDate
                      ? new Date(po.expectedArrivalDate).toLocaleDateString()
                      : '—'
                  }
                />
                <ReadOnlyField label="Shipping carrier" value={po.shippingCarrier || '—'} />
                <ReadOnlyField label="Tracking number" value={po.trackingNumber || '—'} />
              </div>
            </section>

            <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Products</h2>
              {entriesError ? <p className="mt-2 text-[13px] text-red-600">{entriesError}</p> : null}
              <div className="mt-3">
                <PurchaseOrderEntriesTable entries={entries} loading={entriesLoading} />
              </div>
            </section>

            <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Additional details</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadOnlyField label="Reference number" value={referenceNumber} />
                <ReadOnlyField label="Note to supplier" value={noteToSupplier} />
              </div>
            </section>
          </div>

          <aside className={productFormAsideStackClass(PO_FORM_APPEARANCE)}>
            <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Cost summary</h2>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{po.subtotalCost?.toFixed(2) ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Taxes</span>
                  <span className="font-medium text-gray-900">{po.totalTax?.toFixed(2) ?? '—'}</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-[15px] font-semibold text-gray-900">
                      {po.totalCost?.toFixed(2) ?? '—'} {po.supplierCurrency || ''}
                    </span>
                  </div>
                </div>
              </div>

              {(po.costAdjustments ?? []).length > 0 ? (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-[12px] font-medium text-gray-500">Cost adjustments</p>
                  <div className="space-y-1">
                    {(po.costAdjustments ?? []).map((adjustment, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 text-[13px]">
                        <span className="capitalize text-gray-700">{adjustment.name}</span>
                        <span className="text-gray-900">
                          {adjustment.amount.toFixed(2)}
                          {adjustment.currency ? ` ${adjustment.currency}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        title="Mark as ordered"
        actions={
          <>
            <button type="button" onClick={() => setConfirmOpen(false)} className={poSecondaryButtonClass}>
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                await markAsOrdered(po._id);
                setConfirmOpen(false);
              }}
              className={poPrimaryButtonClass}
            >
              Mark as ordered
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-gray-600">
          After marking as ordered, you will be able to receive incoming inventory from your supplier.
          The purchase order can&apos;t be turned into a draft again.
        </p>
      </Modal>
    </div>
  );
}
