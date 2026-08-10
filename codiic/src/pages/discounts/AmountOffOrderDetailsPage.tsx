import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChipList from '../../components/ChipList';
import DiscountDetailsHeader from '../../components/DiscountDetailsHeader';
import DiscountDetailsSection from '../../components/discounts/DiscountDetailsSection';
import DiscountNotFound from '../../components/DiscountNotFound';
import {
  discountDetailFieldLabelClass,
  discountDetailFieldValueClass,
  discountPageContainerClass,
  discountPageShellClass,
} from '../../components/discounts/discount-ui.util';
import {
  useAmountOffOrderDiscount,
  type AmountOffOrderDiscount,
  type AmountOffOrderDiscountUsageOrder,
  type GetOrdersByAmountOffOrderDiscountResponse,
} from '../../contexts/amount-off-order-discount.context';

const AmountOffOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    discounts,
    fetchDiscountById,
    deleteDiscount,
    loading,
    error,
    fetchOrdersByDiscountId,
  } = useAmountOffOrderDiscount();

  const [fetchedDiscount, setFetchedDiscount] = useState<AmountOffOrderDiscount | null>(null);
  const [ordersData, setOrdersData] = useState<GetOrdersByAmountOffOrderDiscountResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const discountFromList = useMemo(
    () => (id ? discounts.find((d) => d._id === id) : null),
    [discounts, id]
  );
  const discount = discountFromList ?? fetchedDiscount;

  useEffect(() => {
    if (!id || discountFromList) return;
    let cancelled = false;
    fetchDiscountById(id)
      .then((res) => {
        if (!cancelled && res?.success && res.data) {
          setFetchedDiscount(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchedDiscount(null);
      });
    return () => {
      cancelled = true;
    };
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
    if (id) navigate(`/discounts/new/amount-off-order?edit=${id}`);
  }, [navigate, id]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this discount? This action cannot be undone.'
    );
    if (!confirmed) return;
    try {
      const result = await deleteDiscount(id);
      if (result?.success) navigate('/discounts');
    } catch (err) {
      console.error('Failed to delete discount:', err);
    }
  }, [id, deleteDiscount, navigate]);

  const renderBoolean = useCallback((v?: boolean) => (v ? 'Yes' : 'No'), []);
  const customerSegmentLabel = useCallback((s: { name?: string; _id?: string }) => s?.name || s?._id || '', []);
  const customerLabel = useCallback((c: { firstName?: string; lastName?: string; email?: string; _id?: string }) => {
    const fullName = `${c?.firstName || ''} ${c?.lastName || ''}`.trim();
    return fullName || c?.email || c?._id || '';
  }, []);

  if (!discount) {
    return id && loading ? (
      <div className={`${discountPageShellClass} flex min-h-[60vh] flex-col items-center justify-center gap-3`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
        <p className="text-[13px] text-admin-text-secondary">Loading discount…</p>
      </div>
    ) : (
      <DiscountNotFound />
    );
  }

  if (error) {
    return (
      <div className={discountPageContainerClass}>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const targetCustomerSegmentDetails = (discount.targetCustomerSegmentIds || []).filter(
    (item): item is { _id: string; name: string } => typeof item === 'object' && item !== null
  );
  const targetCustomerDetails = (discount.targetCustomerIds || []).filter(
    (item): item is { _id: string; firstName?: string; lastName?: string; email?: string } =>
      typeof item === 'object' && item !== null
  );

  const fixedDisplay =
    (discount.fixedAmount ?? 0) >= 1000 ? discount.fixedAmount! / 100 : discount.fixedAmount ?? 0;
  const value =
    discount.valueType === 'percentage' ? `${discount.percentage ?? 0}%` : `₹${fixedDisplay}`;

  const field = (label: string, valueText: ReactNode) => (
    <div>
      <p className={discountDetailFieldLabelClass}>{label}</p>
      <p className={discountDetailFieldValueClass}>{valueText}</p>
    </div>
  );

  return (
    <div className={discountPageShellClass}>
      <div className={discountPageContainerClass}>
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

        <div className="flex flex-col gap-4">
          <DiscountDetailsSection title="General information">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('Method', discount.method)}
              {discount.method === 'discount-code' ? field('Code', discount.discountCode) : null}
              {discount.method === 'automatic' ? field('Title', discount.title) : null}
              {field('Value type', discount.valueType)}
              {discount.valueType === 'percentage' ? field('Percentage', `${discount.percentage}%`) : null}
              {discount.valueType === 'fixed-amount' ? field('Fixed amount', `₹${fixedDisplay}`) : null}
              {field('Eligibility', discount.eligibility)}
              {field('Status', discount.status)}
              {field('Created', new Date(discount.createdAt || '').toLocaleDateString())}
              {field('Last updated', new Date(discount.updatedAt || '').toLocaleDateString())}
            </div>
          </DiscountDetailsSection>

          <DiscountDetailsSection title="Usage and channel limits">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('Allow on channels', renderBoolean(discount.allowDiscountOnChannels))}
              {field('Limit total uses', renderBoolean(discount.limitTotalUses))}
              {discount.limitTotalUses ? field('Total uses limit', discount.totalUsesLimit) : null}
              {field('One use per customer', renderBoolean(discount.limitOneUsePerCustomer))}
              {field('Apply on POS Pro', renderBoolean(discount.applyOnPOSPro))}
            </div>
          </DiscountDetailsSection>

          <DiscountDetailsSection title="Minimum purchase">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('Requirement', discount.minimumPurchase)}
              {discount.minimumPurchase === 'minimum-amount'
                ? field('Amount', `₹${discount.minimumAmount}`)
                : null}
              {discount.minimumPurchase === 'minimum-quantity'
                ? field('Quantity', discount.minimumQuantity)
                : null}
            </div>
          </DiscountDetailsSection>

          <DiscountDetailsSection title="Combinations">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('Product discounts', renderBoolean(discount.productDiscounts))}
              {field('Order discounts', renderBoolean(discount.orderDiscounts))}
              {field('Shipping discounts', renderBoolean(discount.shippingDiscounts))}
            </div>
          </DiscountDetailsSection>

          <DiscountDetailsSection title="Active dates">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field(
                'Start date',
                `${discount.startDate}${discount.startTime ? ` at ${discount.startTime}` : ''}`
              )}
              {field('Set end date', renderBoolean(discount.setEndDate))}
              {discount.setEndDate
                ? field(
                    'End date',
                    `${discount.endDate}${discount.endTime ? ` at ${discount.endTime}` : ''}`
                  )
                : null}
            </div>
          </DiscountDetailsSection>

          {targetCustomerSegmentDetails.length > 0 ? (
            <DiscountDetailsSection title="Target customer segments">
              <ChipList
                items={targetCustomerSegmentDetails.map((segment, idx) => ({
                  key: segment._id || idx.toString(),
                  label: customerSegmentLabel(segment),
                }))}
              />
            </DiscountDetailsSection>
          ) : null}

          {targetCustomerDetails.length > 0 ? (
            <DiscountDetailsSection title="Target customers">
              <ChipList
                items={targetCustomerDetails.map((customer, idx) => ({
                  key: customer._id || idx.toString(),
                  label: customerLabel(customer),
                }))}
              />
            </DiscountDetailsSection>
          ) : null}

          <DiscountDetailsSection
            title="Orders using this discount"
            description="Orders where customers applied this amount off order discount"
          >
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
              </div>
            ) : ordersData && ordersData.data.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border border-admin-border">
                  <table className="min-w-full divide-y divide-admin-divider">
                    <thead className="bg-admin-table-header">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-[12px] font-medium text-admin-text-secondary">Customer</th>
                        <th className="px-3 py-2.5 text-left text-[12px] font-medium text-admin-text-secondary">Order</th>
                        <th className="px-3 py-2.5 text-left text-[12px] font-medium text-admin-text-secondary">Total</th>
                        <th className="px-3 py-2.5 text-left text-[12px] font-medium text-admin-text-secondary">Used at</th>
                        <th className="px-3 py-2.5 text-left text-[12px] font-medium text-admin-text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-divider bg-admin-surface">
                      {ordersData.data.map((row: AmountOffOrderDiscountUsageOrder, idx: number) => (
                        <tr key={idx} className="hover:bg-admin-row-hover/50">
                          <td className="px-3 py-2.5 text-[13px] text-admin-text">
                            {row.customer ? (
                              <span>
                                {[row.customer.firstName, row.customer.lastName]
                                  .filter(Boolean)
                                  .join(' ')
                                  .trim() || '—'}
                                {row.customer.email ? (
                                  <span className="block text-[12px] text-admin-text-secondary">{row.customer.email}</span>
                                ) : null}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] text-admin-text">
                            {row.order ? (
                              <span className="font-mono text-[12px]">#{String(row.order._id).slice(-8)}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] text-admin-text">
                            {row.order ? `₹${(row.order.total / 100).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">
                            {row.usage?.usedAt ? new Date(row.usage.usedAt).toLocaleString() : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.order ? (
                              <button
                                type="button"
                                onClick={() => navigate(`/orders/${row.order!._id}`)}
                                className="text-[13px] font-medium text-admin-text hover:text-admin-text"
                              >
                                View order
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ordersData.pagination &&
                ordersData.pagination.totalItems > ordersData.pagination.itemsPerPage ? (
                  <p className="text-[12px] text-admin-text-secondary">
                    Showing {ordersData.data.length} of {ordersData.pagination.totalItems} orders
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="py-6 text-center text-[13px] text-admin-text-secondary">
                No orders have used this discount yet.
              </p>
            )}
          </DiscountDetailsSection>
        </div>
      </div>
    </div>
  );
};

export default AmountOffOrderDetailsPage;
