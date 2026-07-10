import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DiscountDetailsHeader from '../../components/DiscountDetailsHeader';
import DiscountNotFound from '../../components/DiscountNotFound';
import BuyXGetYSummaryCard from '../../components/BuyXGetYSummaryCard';
import BuyXGetYTargetsCard from '../../components/BuyXGetYTargetsCard';
import {
  useBuyXGetYDiscount,
  type BuyXGetYDiscount,
  type BuyXGetYDiscountUsageOrder,
  type GetOrdersByBuyXGetYDiscountResponse,
} from '../../contexts/buy-x-get-y-discount.context';

const BuyXGetYDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    discounts,
    fetchDiscountById,
    deleteDiscount,
    loading,
    fetchOrdersByDiscountId,
  } = useBuyXGetYDiscount();
  const [fetchedDiscount, setFetchedDiscount] = useState<BuyXGetYDiscount | null>(null);
  const [ordersData, setOrdersData] = useState<GetOrdersByBuyXGetYDiscountResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const discountFromList = useMemo(() => (id ? discounts.find(d => d._id === id) : null), [discounts, id]);
  const discount = discountFromList ?? fetchedDiscount;

  useEffect(() => {
    if (!id) return;
    if (discountFromList) return;
    let cancelled = false;
    fetchDiscountById(id)
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        setFetchedDiscount(res.data);
      })
      .catch(() => {
        if (!cancelled) setFetchedDiscount(null);
      });
    return () => { cancelled = true; };
  }, [id, discountFromList, fetchDiscountById]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setOrdersLoading(true);
    fetchOrdersByDiscountId(id, { page: 1, limit: 20 })
      .then((res) => {
        if (!cancelled && res?.success) setOrdersData(res);
      })
      .catch(() => {
        if (!cancelled) setOrdersData(null);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, fetchOrdersByDiscountId]);

  const handleBack = useCallback(() => {
    navigate('/discounts');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    if (id) navigate(`/discounts/new/buy-x-get-y?edit=${id}`);
  }, [navigate, id]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this discount? This action cannot be undone.');
    if (!confirmed) return;
    try {
      const result = await deleteDiscount(id);
      if (result.success) navigate('/discounts');
    } catch (err) {
      console.error('Failed to delete discount:', err);
    }
  }, [id, deleteDiscount, navigate]);

  if (!discount) {
    return (
      <>
        {id && loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading discount…</p>
          </div>
        ) : (
          <DiscountNotFound />
        )}
      </>
    );
  }

  const value = discount.discountedValue === 'percentage'
    ? `${discount.discountedPercentage ?? 0}%`
    : discount.discountedValue === 'amount'
      ? `₹${discount.discountedAmount ?? 0}`
      : 'Free';

  // Normalize targets for display
  const buysProducts = (discount.buysProductIds || []).map((p: any) => typeof p === 'string' ? { _id: p, title: p } : { _id: p._id, title: p.title || p._id });
  const buysCollections = (discount.buysCollectionIds || []).map((c: any) => typeof c === 'string' ? { _id: c, title: c } : { _id: c._id, title: c.title || c._id });
  const getsProducts = (discount.getsProductIds || []).map((p: any) => typeof p === 'string' ? { _id: p, title: p } : { _id: p._id, title: p.title || p._id });
  const getsCollections = (discount.getsCollectionIds || []).map((c: any) => typeof c === 'string' ? { _id: c, title: c } : { _id: c._id, title: c.title || c._id });
  const segments = (discount.targetCustomerSegmentIds || []).map((s: any) => typeof s === 'string' ? { _id: s, name: s } : { _id: s._id, name: s.name || s._id });
  const customers = (discount.targetCustomerIds || []).map((c: any) => typeof c === 'string' ? { _id: c, name: c } : { _id: c._id, name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || c._id });

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <DiscountDetailsHeader
            method={discount.method}
            discountCode={discount.discountCode}
            title={discount.title}
            value={value}
            status={discount.status}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <BuyXGetYSummaryCard
              customerBuys={discount.customerBuys}
              quantity={discount.quantity}
              amount={discount.amount}
              anyItemsFrom={discount.anyItemsFrom}
              customerGetsQuantity={discount.customerGetsQuantity}
              customerGetsAnyItemsFrom={discount.customerGetsAnyItemsFrom}
              value={value}
              eligibility={discount.eligibility}
              allowDiscountOnChannels={discount.allowDiscountOnChannels}
              limitTotalUses={discount.limitTotalUses}
              totalUsesLimit={discount.totalUsesLimit}
              limitOneUsePerCustomer={discount.limitOneUsePerCustomer}
              productDiscounts={discount.productDiscounts}
              orderDiscounts={discount.orderDiscounts}
              shippingDiscounts={discount.shippingDiscounts}
              startDate={discount.startDate}
              startTime={discount.startTime}
              setEndDate={discount.setEndDate}
              endDate={discount.endDate}
              endTime={discount.endTime}
              createdAt={discount.createdAt}
              updatedAt={discount.updatedAt}
          />

          <BuyXGetYTargetsCard
            buysProducts={buysProducts}
            buysCollections={buysCollections}
            getsProducts={getsProducts}
            getsCollections={getsCollections}
            segments={segments}
            customers={customers}
          />

          {/* Orders where this discount was used */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Orders using this discount</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Orders where customers applied this Buy X Get Y discount
              </p>
            </div>
            <div className="p-5">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : ordersData && ordersData.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Order
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Used at
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ordersData.data.map((row: BuyXGetYDiscountUsageOrder, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.customer ? (
                                <span>
                                  {[row.customer.firstName, row.customer.lastName]
                                    .filter(Boolean)
                                    .join(' ')
                                    .trim() || '—'}
                                  {row.customer.email && (
                                    <span className="block text-gray-500 text-xs">
                                      {row.customer.email}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.order ? (
                                <span className="font-mono text-xs">
                                  #{String(row.order._id).slice(-8)}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.order ? `₹${(row.order.total / 100).toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {row.usage?.usedAt
                                ? new Date(row.usage.usedAt).toLocaleString()
                                : '—'}
                            </td>
                            <td className="px-4 py-3">
                              {row.order && (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/orders/${row.order!._id}`)}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                  View order
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {ordersData.pagination &&
                    ordersData.pagination.totalItems > ordersData.pagination.itemsPerPage && (
                      <p className="text-sm text-gray-500">
                        Showing {ordersData.data.length} of {ordersData.pagination.totalItems} orders
                      </p>
                    )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No orders have used this discount yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyXGetYDetailsPage;
