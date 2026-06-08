import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DiscountNotFound from '../../components/DiscountNotFound';
import DiscountDetailsHeader from '../../components/DiscountDetailsHeader';
import FreeShippingGeneralInfoCard from '../../components/FreeShippingGeneralInfoCard';
import FreeShippingCountryRatesCard from '../../components/FreeShippingCountryRatesCard';
import FreeShippingMinimumPurchaseCard from '../../components/FreeShippingMinimumPurchaseCard';
import FreeShippingSalesChannelLimitsCard from '../../components/FreeShippingSalesChannelLimitsCard';
import FreeShippingCombinationsCard from '../../components/FreeShippingCombinationsCard';
import FreeShippingActiveDatesCard from '../../components/FreeShippingActiveDatesCard';
import FreeShippingTargetSegmentsCard from '../../components/FreeShippingTargetSegmentsCard';
import FreeShippingTargetCustomersCard from '../../components/FreeShippingTargetCustomersCard';
import { useFreeShippingDiscount } from '../../contexts/free-shipping-discount.context';
import { useStore } from '../../contexts/store.context';
import type { FreeShippingDiscountUsageOrder, GetOrdersByDiscountResponse } from '../../contexts/free-shipping-discount.context';

const formatINR = (amountInPaisa: number) => `₹${(amountInPaisa / 100).toFixed(2)}`;

const FreeShippingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { discounts, fetchDiscountsByStoreId, fetchOrdersByDiscountId, deleteDiscount, loading, error } = useFreeShippingDiscount();
  const [ordersData, setOrdersData] = useState<GetOrdersByDiscountResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const discount = discounts.find(d => d._id === id);

  useEffect(() => {
    if (activeStoreId && !discounts.length) {
      fetchDiscountsByStoreId(activeStoreId);
    }
  }, [activeStoreId, discounts.length, fetchDiscountsByStoreId]);

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
    return () => { cancelled = true; };
  }, [id, fetchOrdersByDiscountId]);

  const handleBack = useCallback(() => {
    navigate('/discounts');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    if (id) navigate(`/discounts/new/free-shipping?edit=${id}`);
  }, [navigate, id]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this discount? This action cannot be undone.');
    if (!confirmed) return;
    try {
      const result = await deleteDiscount(id);
      if (result?.success) navigate('/discounts');
    } catch (err) {
      console.error('Failed to delete discount:', err);
    }
  }, [id, deleteDiscount, navigate]);

  const renderBoolean = useCallback((v?: boolean) => (v ? 'Yes' : 'No'), []);
  const segmentLabel = useCallback((s: any) => s?.name || s?._id, []);
  const customerLabel = useCallback((c: any) => {
    const fullName = `${c?.firstName || ''} ${c?.lastName || ''}`.trim();
    return fullName || c?.email || c?._id;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!discount) {
    return <DiscountNotFound />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <DiscountDetailsHeader
              method={discount.method}
              discountCode={discount.discountCode}
              title={discount.title}
              value="Free Shipping"
              status={discount.status}
              onBack={handleBack}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* General Information */}
            <FreeShippingGeneralInfoCard
              method={discount.method}
              discountCode={discount.discountCode}
              title={discount.title}
              eligibility={discount.eligibility}
              applyOnPOSPro={discount.applyOnPOSPro}
              status={discount.status}
              createdAt={discount.createdAt}
              updatedAt={discount.updatedAt}
            />

            {/* Country & Rates */}
            <FreeShippingCountryRatesCard
              countrySelection={discount.countrySelection}
              selectedCountryIds={discount.selectedCountryIds}
              selectedCountries={discount.selectedCountries}
              excludeShippingRates={discount.excludeShippingRates}
              shippingRateLimit={discount.shippingRateLimit}
            />

            {/* Minimum Purchase */}
            <FreeShippingMinimumPurchaseCard
              minimumPurchase={discount.minimumPurchase}
              minimumAmount={discount.minimumAmount}
              minimumQuantity={discount.minimumQuantity}
            />

            {/* Sales Channel & Limits */}
            <FreeShippingSalesChannelLimitsCard
              allowDiscountOnChannels={discount.allowDiscountOnChannels}
              limitTotalUses={discount.limitTotalUses}
              totalUsesLimit={discount.totalUsesLimit}
              limitOneUsePerCustomer={discount.limitOneUsePerCustomer}
            />

            {/* Combinations */}
            <FreeShippingCombinationsCard
              productDiscounts={discount.productDiscounts}
              orderDiscounts={discount.orderDiscounts}
            />

            {/* Active Dates */}
            <FreeShippingActiveDatesCard
              startDate={discount.startDate}
              startTime={discount.startTime}
              setEndDate={discount.setEndDate}
              endDate={discount.endDate}
              endTime={discount.endTime}
            />

            {/* Target Customer Segments */}
            {discount.targetCustomerSegmentIds && discount.targetCustomerSegmentIds.length > 0 && (
              <FreeShippingTargetSegmentsCard
                targetCustomerSegmentIds={discount.targetCustomerSegmentIds}
                segmentLabel={segmentLabel}
              />
            )}

            {/* Target Customers */}
            {discount.targetCustomerIds && discount.targetCustomerIds.length > 0 && (
              <FreeShippingTargetCustomersCard
                targetCustomerIds={discount.targetCustomerIds}
                customerLabel={customerLabel}
              />
            )}

            {/* Orders where this discount was used */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Orders using this discount</h3>
                <p className="text-sm text-gray-500 mt-0.5">Orders where customers applied this free shipping discount</p>
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
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Used at</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ordersData.data.map((row: FreeShippingDiscountUsageOrder, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {row.customer ? (
                                  <span>
                                    {[row.customer.firstName, row.customer.lastName].filter(Boolean).join(' ').trim() || '—'}
                                    {row.customer.email && (
                                      <span className="block text-gray-500 text-xs">{row.customer.email}</span>
                                    )}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {row.order ? (
                                  <span className="font-mono text-xs">#{String(row.order._id).slice(-8)}</span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {row.order ? formatINR(row.order.total) : '—'}
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
                    {ordersData.pagination && ordersData.pagination.totalItems > ordersData.pagination.itemsPerPage && (
                      <p className="text-sm text-gray-500">
                        Showing {ordersData.data.length} of {ordersData.pagination.totalItems} orders
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No orders have used this discount yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default FreeShippingDetailsPage;
