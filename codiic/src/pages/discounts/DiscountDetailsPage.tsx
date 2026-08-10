import { useMemo, useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAmountOffProductsDiscount,
  type AmountOffProductsDiscount,
  type AmountOffProductsDiscountUsageOrder,
  type GetOrdersByAmountOffProductsDiscountResponse,
} from "../../contexts/amount-off-products-discount.context";
import DiscountNotFound from "../../components/DiscountNotFound";
import DiscountDetailsHeader from "../../components/DiscountDetailsHeader";
import { discountPageContainerClass, discountPageShellClass } from "../../components/discounts/discount-ui.util";
import DiscountSummaryCard from "../../components/DiscountSummaryCard";
import DiscountValueLimitsCard from "../../components/DiscountValueLimitsCard";
import DiscountActiveDatesCard from "../../components/DiscountActiveDatesCard";
import DiscountTargetsCard from "../../components/DiscountTargetsCard";

function normalizeFetchedDiscount(d: {
  _id: string;
  storeId: string;
  method: string;
  discountCode?: string;
  title?: string;
  valueType: string;
  percentage?: number;
  fixedAmount?: number;
  appliesTo?: string;
  oncePerOrder?: boolean;
  eligibility?: string;
  applyOnPOSPro?: boolean;
  minimumPurchase?: string;
  minimumAmount?: number;
  minimumQuantity?: number;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;
  targetProductIds?: (string | { _id: string; title?: string; price?: number; imageUrl?: string })[];
  targetCollectionIds?: (string | { _id: string; title?: string; description?: string })[];
  targetCustomerSegmentIds?: (string | { _id: string; name: string })[];
  targetCustomerIds?: (string | { _id: string; firstName?: string; lastName?: string; email?: string })[];
}): AmountOffProductsDiscount {
  const toId = (x: string | { _id: string }) => (typeof x === 'string' ? x : x?._id) ?? '';
  return {
    _id: d._id,
    storeId: d.storeId,
    method: d.method as 'discount-code' | 'automatic',
    discountCode: d.discountCode,
    title: d.title,
    allowDiscountOnChannels: d.allowDiscountOnChannels,
    limitTotalUses: d.limitTotalUses,
    totalUsesLimit: d.totalUsesLimit,
    limitOneUsePerCustomer: d.limitOneUsePerCustomer,
    valueType: d.valueType as 'percentage' | 'fixed-amount',
    percentage: d.percentage,
    fixedAmount: d.fixedAmount,
    appliesTo: (d.appliesTo as AmountOffProductsDiscount['appliesTo']) ?? 'specific-products',
    oncePerOrder: d.oncePerOrder,
    eligibility: (d.eligibility as AmountOffProductsDiscount['eligibility']) ?? 'all-customers',
    applyOnPOSPro: d.applyOnPOSPro,
    minimumPurchase: (d.minimumPurchase as AmountOffProductsDiscount['minimumPurchase']) ?? 'no-requirements',
    minimumAmount: d.minimumAmount,
    minimumQuantity: d.minimumQuantity,
    productDiscounts: d.productDiscounts,
    orderDiscounts: d.orderDiscounts,
    shippingDiscounts: d.shippingDiscounts,
    startDate: d.startDate,
    startTime: d.startTime,
    setEndDate: d.setEndDate,
    endDate: d.endDate,
    endTime: d.endTime,
    status: (d.status as AmountOffProductsDiscount['status']) ?? 'active',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    targetProductIds: Array.isArray(d.targetProductIds) ? d.targetProductIds.map(toId).filter(Boolean) as string[] : [],
    targetCollectionIds: Array.isArray(d.targetCollectionIds) ? d.targetCollectionIds.map(toId).filter(Boolean) as string[] : [],
    targetCustomerSegmentIds: Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.map(toId).filter(Boolean) as string[] : [],
    targetCustomerIds: Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.map(toId).filter(Boolean) as string[] : [],
    targetProductDetails: Array.isArray(d.targetProductIds) ? d.targetProductIds.filter((p): p is { _id: string; title?: string; price?: number; imageUrl?: string } => typeof p !== 'string') : [],
    targetCollectionDetails: Array.isArray(d.targetCollectionIds) ? d.targetCollectionIds.filter((c): c is { _id: string; title?: string; description?: string } => typeof c !== 'string') : [],
    targetCustomerSegmentDetails: Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.filter((s): s is { _id: string; name: string } => typeof s !== 'string') : [],
    targetCustomerDetails: Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.filter((c): c is { _id: string; firstName?: string; lastName?: string; email?: string } => typeof c !== 'string') : [],
  };
}

const DiscountDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    discounts,
    fetchDiscountById,
    deleteDiscount,
    loading,
    fetchOrdersByDiscountId,
  } = useAmountOffProductsDiscount();
  const [fetchedDiscount, setFetchedDiscount] = useState<AmountOffProductsDiscount | null>(null);
  const [ordersData, setOrdersData] = useState<GetOrdersByAmountOffProductsDiscountResponse | null>(null);
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
        setFetchedDiscount(normalizeFetchedDiscount(res.data));
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
    if (id) navigate(`/discounts/new/amount-off-products?edit=${id}`);
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
          <div className={`${discountPageShellClass} flex min-h-[60vh] flex-col items-center justify-center gap-3`}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
            <p className="text-[13px] text-admin-text-secondary">Loading discount…</p>
          </div>
        ) : (
          <DiscountNotFound />
        )}
      </>
    );
  }

  const value = discount.valueType === 'percentage' ? `${discount.percentage ?? 0}%` : `₹${discount.fixedAmount ?? 0}`;

  return (
    <div className={discountPageShellClass}>
      <div className={discountPageContainerClass}>
          <div className="flex flex-col gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DiscountSummaryCard
                appliesTo={discount.appliesTo}
                eligibility={discount.eligibility}
                minimumPurchase={discount.minimumPurchase}
                minimumQuantity={discount.minimumQuantity}
              />

              <DiscountValueLimitsCard
                valueType={discount.valueType}
                value={value}
                oncePerOrder={discount.oncePerOrder}
                allowDiscountOnChannels={discount.allowDiscountOnChannels}
                limitTotalUses={discount.limitTotalUses}
                totalUsesLimit={discount.totalUsesLimit}
                limitOneUsePerCustomer={discount.limitOneUsePerCustomer}
                productDiscounts={discount.productDiscounts}
                orderDiscounts={discount.orderDiscounts}
                shippingDiscounts={discount.shippingDiscounts}
              />
            </div>

            <DiscountActiveDatesCard
              startDate={discount.startDate}
              startTime={discount.startTime}
              setEndDate={discount.setEndDate}
              endDate={discount.endDate}
              endTime={discount.endTime}
              createdAt={discount.createdAt}
              updatedAt={discount.updatedAt}
            />

            <DiscountTargetsCard
              targetProductDetails={discount.targetProductDetails}
              targetProductIds={discount.targetProductIds}
              targetCollectionDetails={discount.targetCollectionDetails}
              targetCollectionIds={discount.targetCollectionIds}
              targetCustomerSegmentDetails={discount.targetCustomerSegmentDetails}
              targetCustomerSegmentIds={discount.targetCustomerSegmentIds}
              targetCustomerDetails={discount.targetCustomerDetails}
              targetCustomerIds={discount.targetCustomerIds}
            />

            {/* Orders where this discount was used */}
            <div className="rounded-xl border border-admin-border bg-admin-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-admin-border">
                <h3 className="text-base font-semibold text-admin-text">Orders using this discount</h3>
                <p className="text-sm text-admin-text-secondary mt-0.5">
                  Orders where customers applied this amount off products discount
                </p>
              </div>
              <div className="p-5">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-admin-text-subdued border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : ordersData && ordersData.data.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-admin-divider">
                        <thead>
                          <tr className="bg-admin-table-header">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase">
                              Order
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase">
                              Total
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase">
                              Used at
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-divider">
                          {ordersData.data.map((row: AmountOffProductsDiscountUsageOrder, idx: number) => (
                            <tr key={idx} className="hover:bg-admin-row-hover/50">
                              <td className="px-4 py-3 text-sm text-admin-text">
                                {row.customer ? (
                                  <span>
                                    {[row.customer.firstName, row.customer.lastName]
                                      .filter(Boolean)
                                      .join(" ")
                                      .trim() || "—"}
                                    {row.customer.email && (
                                      <span className="block text-admin-text-secondary text-xs">
                                        {row.customer.email}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-admin-text">
                                {row.order ? (
                                  <span className="font-mono text-xs">
                                    #{String(row.order._id).slice(-8)}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-admin-text">
                                {row.order ? `₹${(row.order.total / 100).toFixed(2)}` : "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-admin-text-secondary">
                                {row.usage?.usedAt
                                  ? new Date(row.usage.usedAt).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="px-4 py-3">
                                {row.order && (
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/orders/${row.order!._id}`)}
                                    className="text-[13px] font-medium text-admin-text hover:text-admin-text"
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
                      ordersData.pagination.totalItems >
                        ordersData.pagination.itemsPerPage && (
                        <p className="text-sm text-admin-text-secondary">
                          Showing {ordersData.data.length} of{" "}
                          {ordersData.pagination.totalItems} orders
                        </p>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-admin-text-secondary py-6 text-center">
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

export default DiscountDetailsPage;
