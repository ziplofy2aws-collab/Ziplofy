import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePurchaseOrders } from '../contexts/purchase-order.context';
import { usePurchaseOrderEntries } from '../contexts/purchase-order-entry.context';

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, markAsOrdered } = usePurchaseOrders();
  const po = useMemo(() => purchaseOrders.find(p => p._id === id) || null, [purchaseOrders, id]);
  const { entries, fetchEntriesByPurchaseOrderId, loading: entriesLoading, error: entriesError, clearEntries } = usePurchaseOrderEntries();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (po?._id) {
      fetchEntriesByPurchaseOrderId(po._id).catch(() => {});
      return () => { clearEntries(); };
    }
  }, [po?._id]);

  const supplierName = useMemo(() => {
    if (!po) return '-';
    return typeof po.supplierId === 'string' ? po.supplierId : (po.supplierId?.name || po.supplierId?._id);
  }, [po]);

  const destinationName = useMemo(() => {
    if (!po) return '-';
    return typeof po.destinationLocationId === 'string' ? po.destinationLocationId : (po.destinationLocationId?.name || po.destinationLocationId?._id);
  }, [po]);

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/products/purchase-orders')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 inline mr-1" />
                Purchase Orders
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {!po && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600">Purchase order not found in current view. Go back to the list and select one.</p>
              <button
                onClick={() => navigate('/products/purchase-orders')}
                className="w-fit px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Back to Purchase Orders
              </button>
            </div>
          )}

          {po && (
            <div className="space-y-4">
              {/* Header actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-medium text-gray-900">Purchase Order Details</h1>
                  <span className={`px-2 py-0.5 text-xs font-medium ${po.status === 'ordered' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {(po.status || 'draft').replaceAll('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {po.status === 'draft' && (
                    <button
                      onClick={() => setConfirmOpen(true)}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                      Mark as ordered
                    </button>
                  )}
                  {po.status !== 'draft' && (
                    <button
                      onClick={() => navigate(`/products/purchase-orders/${po._id}/receive`)}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                      Receive Inventory
                    </button>
                  )}
                  {po.status === 'draft' && (
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        More actions
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg z-10">
                          <button
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Modal */}
              {confirmOpen && (
                <div className="border border-gray-200 p-4 bg-white/95">
                  <h2 className="text-base font-medium text-gray-900 mb-2">Mark as ordered</h2>
                  <p className="text-sm text-gray-600 mb-3">After marking as ordered, you will be able to receive incoming inventory from your supplier. The purchase order can't be turned into a draft again.</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmOpen(false)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (po) {
                          await markAsOrdered(po._id);
                          setConfirmOpen(false);
                        }
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                      Mark as ordered
                    </button>
                  </div>
                </div>
              )}

              {/* Supplier & Destination */}
              <div className="border border-gray-200 p-4 bg-white/95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Supplier</p>
                    <p className="text-sm text-gray-900">{supplierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Destination</p>
                    <p className="text-sm text-gray-900">{destinationName}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 my-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Terms</p>
                    <p className="text-sm text-gray-900">{po.paymentTerm || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Supplier Currency</p>
                    <p className="text-sm text-gray-900">{po.supplierCurrency || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="border border-gray-200 p-4 bg-white/95">
                <h2 className="text-base font-medium text-gray-900 mb-3">Shipment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Estimated Arrival</p>
                    <p className="text-sm text-gray-900">{po.expectedArrivalDate ? new Date(po.expectedArrivalDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Shipping Carrier</p>
                    <p className="text-sm text-gray-900">{po.shippingCarrier || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tracking Number</p>
                    <p className="text-sm text-gray-900">{po.trackingNumber || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Purchase Order Entries */}
              <div className="border border-gray-200 p-4 bg-white/95">
                <h2 className="text-base font-medium text-gray-900 mb-3">Products</h2>
                {entriesError && (
                  <p className="text-sm text-red-600 mb-2">{entriesError}</p>
                )}
                <div className="border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Supplier SKU</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">RSKU</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Quantity</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Cost</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Tax %</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map((e) => {
                          const v: any = e.variantId as any;
                          const productTitle = v?.productId?.title || '-';
                          const optionText = v?.optionValues ? Object.values(v.optionValues).join(' / ') : '';
                          return (
                            <tr key={e._id} className="hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-medium text-gray-900">{productTitle}</p>
                                  {optionText && <p className="text-xs text-gray-600">{optionText}</p>}
                                  <p className="text-xs text-gray-600">SKU: {v?.sku || '-'}</p>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{e.supplierSku || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{v?.sku || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">{e.quantityOrdered}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">{e.cost.toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">{(e.taxPercent ?? 0).toFixed(0)}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">{e.totalCost.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        {!entriesLoading && entries.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-600">No products</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="border border-gray-200 p-4 bg-white/95">
                <h2 className="text-base font-medium text-gray-900 mb-3">Additional Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Reference Number</p>
                    <p className="text-sm text-gray-900">{(po as any).referenceNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Note to Supplier</p>
                    <p className="text-sm text-gray-900">{(po as any).noteToSupplier || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tax</p>
                    <p className="text-sm text-gray-900">{po.totalTax?.toFixed(2) ?? '-'}</p>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="border border-gray-200 p-4 bg-white/95">
                <h2 className="text-base font-medium text-gray-900 mb-3">Cost Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">PO ID</p>
                    <p className="text-sm text-gray-900">{po._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="text-sm text-gray-900 capitalize">{po.status.replaceAll('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Expected Arrival</p>
                    <p className="text-sm text-gray-900">{po.expectedArrivalDate ? new Date(po.expectedArrivalDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 my-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                    <p className="text-sm text-gray-900">{po.subtotalCost?.toFixed(2) ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Taxes</p>
                    <p className="text-sm text-gray-900">{po.totalTax?.toFixed(2) ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-sm font-medium text-gray-900">{po.totalCost?.toFixed(2) ?? '-'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-3" />
                <p className="text-xs text-gray-600 mb-2">Cost Adjustments</p>
                <div className="space-y-1">
                  {(po.costAdjustments ?? []).length === 0 && (
                    <p className="text-sm text-gray-600">No adjustments</p>
                  )}
                  {(po.costAdjustments ?? []).map((adj, idx) => (
                    <div key={idx} className="flex justify-between">
                      <p className="text-sm text-gray-900 capitalize">{adj.name}</p>
                      <p className="text-sm text-gray-900">{adj.amount.toFixed(2)}{adj.currency ? ` ${adj.currency}` : ''}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 my-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Converted Total</p>
                    <p className="text-sm text-gray-900">{po.totalCost?.toFixed(2)} {po.supplierCurrency || ''}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="border border-gray-200 p-4 bg-white/95">
                <h2 className="text-base font-medium text-gray-900 mb-3">Timeline</h2>
                <div className="space-y-2">
                  <textarea
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-y min-h-[100px]"
                    placeholder="Leave a comment..."
                  />
                  <div className="flex justify-end">
                    <button className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
