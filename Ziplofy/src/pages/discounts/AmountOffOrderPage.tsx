import { useState, useCallback, useEffect } from "react";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../contexts/store.context";
import { useCustomerSegments } from "../../contexts/customer-segment.context";
import { useCustomers } from "../../contexts/customer.context";
import { useAmountOffOrderDiscount } from "../../contexts/amount-off-order-discount.context";
import MultiSelect from "../../components/MultiSelect";

const AmountOffOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') || null;
  const { activeStoreId } = useStore();
  const { segments, searchCustomerSegments, fetchSegmentsByStoreId, loading: segmentsLoading } = useCustomerSegments();
  const { customers, searchCustomers, fetchCustomersByStoreId, loading: customersLoading } = useCustomers();
  const { createDiscount, updateDiscount, fetchDiscountById, loading: creating, error: createError, clearError } = useAmountOffOrderDiscount();
  
  const [formData, setFormData] = useState({
    method: 'discount-code' as 'discount-code' | 'automatic',
    discountCode: '',
    title: '',
    valueType: 'percentage' as 'percentage' | 'fixed-amount',
    percentage: '',
    fixedAmount: '',
    eligibility: 'all-customers' as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
    eligibilitySearchQuery: '',
    applyOnPOSPro: false,
    minimumPurchase: 'no-requirements' as 'no-requirements' | 'minimum-amount' | 'minimum-quantity',
    minimumAmount: '',
    minimumQuantity: '',
    productDiscounts: false,
    orderDiscounts: false,
    shippingDiscounts: false,
    startDate: '',
    startTime: '',
    setEndDate: false,
    endDate: '',
    endTime: '',
    allowDiscountOnChannels: false,
    limitTotalUses: false,
    totalUsesLimit: '',
    limitOneUsePerCustomer: false,
  });

  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [segmentSearchQuery, setSegmentSearchQuery] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!editId || !activeStoreId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchDiscountById(editId);
        if (cancelled || !res.success || !res.data) return;
        const d = res.data;
        const toId = (x: any) => (typeof x === 'string' ? x : x?._id) || '';
        setFormData(prev => ({
          ...prev,
          method: d.method,
          discountCode: d.discountCode ?? '',
          title: d.title ?? '',
          valueType: d.valueType,
          percentage: d.percentage != null ? String(d.percentage) : '',
          fixedAmount: d.fixedAmount != null ? String((d.fixedAmount >= 1000 ? d.fixedAmount / 100 : d.fixedAmount)) : '',
          eligibility: d.eligibility,
          applyOnPOSPro: !!d.applyOnPOSPro,
          minimumPurchase: d.minimumPurchase ?? 'no-requirements',
          minimumAmount: d.minimumAmount != null ? String(d.minimumAmount) : '',
          minimumQuantity: d.minimumQuantity != null ? String(d.minimumQuantity) : '',
          productDiscounts: !!d.productDiscounts,
          orderDiscounts: !!d.orderDiscounts,
          shippingDiscounts: !!d.shippingDiscounts,
          startDate: d.startDate ?? '',
          startTime: d.startTime ?? '',
          setEndDate: !!d.setEndDate,
          endDate: d.endDate ?? '',
          endTime: d.endTime ?? '',
          allowDiscountOnChannels: !!d.allowDiscountOnChannels,
          limitTotalUses: !!d.limitTotalUses,
          totalUsesLimit: d.totalUsesLimit != null ? String(d.totalUsesLimit) : '',
          limitOneUsePerCustomer: !!d.limitOneUsePerCustomer,
        }));
        setSelectedSegmentIds(Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.map(toId).filter(Boolean) : []);
        setSelectedCustomerIds(Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.map(toId).filter(Boolean) : []);
      } catch (e) {
        if (!cancelled) console.error('Failed to load discount for edit:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [editId, activeStoreId, fetchDiscountById]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const debouncedSearchSegments = useCallback((() => {
    let t: number;
    return (q: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (!activeStoreId) return;
        if (q.trim()) {
          try { await searchCustomerSegments(activeStoreId, q); } catch {}
        } else {
          try { await fetchSegmentsByStoreId(activeStoreId); } catch {}
        }
      }, 300);
    };
  })(), [activeStoreId, searchCustomerSegments, fetchSegmentsByStoreId]);

  const debouncedSearchCustomers = useCallback((() => {
    let t: number;
    return (q: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (!activeStoreId) return;
        if (q.trim()) {
          try { await searchCustomers(activeStoreId, q); } catch {}
        } else {
          try { await fetchCustomersByStoreId(activeStoreId); } catch {}
        }
      }, 300);
    };
  })(), [activeStoreId, searchCustomers, fetchCustomersByStoreId]);

  const handleCancel = useCallback(() => {
    if (editId) {
      navigate(`/discounts/amount-off-order/${editId}`);
    } else {
      navigate('/discounts?createDiscountModal=open');
    }
  }, [navigate, editId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoreId) return;
    try {
      const payload = {
        storeId: activeStoreId,
        method: formData.method as 'discount-code' | 'automatic',
        ...(formData.method === 'discount-code' ? { discountCode: formData.discountCode } : {}),
        ...(formData.method === 'automatic' ? { title: formData.title } : {}),
        valueType: formData.valueType as 'percentage' | 'fixed-amount',
        ...(formData.valueType === 'percentage' ? { percentage: Number(formData.percentage) || 0 } : {}),
        ...(formData.valueType === 'fixed-amount' ? { fixedAmount: Math.round((Number(formData.fixedAmount) || 0) * 100) } : {}),
        eligibility: formData.eligibility as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
        applyOnPOSPro: formData.applyOnPOSPro,
        minimumPurchase: formData.minimumPurchase as 'no-requirements' | 'minimum-amount' | 'minimum-quantity',
        ...(formData.minimumPurchase === 'minimum-amount' ? { minimumAmount: Number(formData.minimumAmount) || 0 } : {}),
        ...(formData.minimumPurchase === 'minimum-quantity' ? { minimumQuantity: Number(formData.minimumQuantity) || 0 } : {}),
        productDiscounts: formData.productDiscounts,
        orderDiscounts: formData.orderDiscounts,
        shippingDiscounts: formData.shippingDiscounts,
        allowDiscountOnChannels: formData.allowDiscountOnChannels,
        limitTotalUses: formData.limitTotalUses,
        ...(formData.limitTotalUses ? { totalUsesLimit: Number(formData.totalUsesLimit) || 0 } : {}),
        limitOneUsePerCustomer: formData.limitOneUsePerCustomer,
        startDate: formData.startDate || undefined,
        startTime: formData.startTime || undefined,
        setEndDate: formData.setEndDate,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        status: 'active' as const,
        targetCustomerSegmentIds: selectedSegmentIds,
        targetCustomerIds: selectedCustomerIds,
      };

      if (editId) {
        const res = await updateDiscount(editId, payload);
        if (res.success) {
          navigate(`/discounts/amount-off-order/${editId}`);
        }
      } else {
        const res = await createDiscount(payload);
        if (res.success) {
          navigate('/discounts');
        }
      }
    } catch (err) {
      // handled by context error state
    }
  }, [formData, selectedSegmentIds, selectedCustomerIds, activeStoreId, createDiscount, updateDiscount, editId, navigate]);

  const segmentOptions = segments.map(s => ({
    value: s._id,
    label: s.name,
  }));

  const customerOptions = customers.map(c => ({
    value: c._id,
    label: `${c.firstName} ${c.lastName}`.trim() || c.email,
    secondaryText: c.email,
  }));

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm';

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Amount off order
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {createError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-red-800">{createError}</p>
              <button
                type="button"
                onClick={clearError}
                className="shrink-0 p-1 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Method */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Method</h2>
              <fieldset className="mb-3">
                <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Discount method</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="method"
                      value="discount-code"
                      checked={formData.method === 'discount-code'}
                      onChange={(e) => handleInputChange('method', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Discount code</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="method"
                      value="automatic"
                      checked={formData.method === 'automatic'}
                      onChange={(e) => handleInputChange('method', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Automatic discount</span>
                  </label>
                </div>
              </fieldset>
              {formData.method === 'discount-code' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Discount code</label>
                  <input
                    type="text"
                    value={formData.discountCode}
                    onChange={(e) => handleInputChange('discountCode', e.target.value)}
                    placeholder="e.g. ORDER10"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Customers enter this code at checkout</p>
                </div>
              )}
              {formData.method === 'automatic' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Order discount"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Shown to customers when the discount applies</p>
                </div>
              )}
            </div>
          </div>

          {/* Discount value */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Discount value</h2>
              <fieldset className="mb-4">
                <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Value type</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="valueType"
                      value="percentage"
                      checked={formData.valueType === 'percentage'}
                      onChange={(e) => handleInputChange('valueType', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Percentage</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="valueType"
                      value="fixed-amount"
                      checked={formData.valueType === 'fixed-amount'}
                      onChange={(e) => handleInputChange('valueType', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Fixed amount</span>
                  </label>
                </div>
              </fieldset>
              {formData.valueType === 'percentage' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.percentage}
                      onChange={(e) => handleInputChange('percentage', e.target.value)}
                      placeholder="e.g. 10"
                      className={`${inputClass} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Percentage off the order total</p>
                </div>
              )}
              {formData.valueType === 'fixed-amount' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Fixed amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={formData.fixedAmount}
                      onChange={(e) => handleInputChange('fixedAmount', e.target.value)}
                      placeholder="e.g. 100"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Fixed amount off the order total in rupees</p>
                </div>
              )}
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Eligibility</h2>
              <p className="text-xs text-gray-500 mb-4">Available on all sales channels</p>
              <fieldset className="mb-4">
                <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Customer eligibility</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="eligibility"
                      value="all-customers"
                      checked={formData.eligibility === 'all-customers'}
                      onChange={(e) => handleInputChange('eligibility', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">All customers</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="eligibility"
                      value="specific-customer-segments"
                      checked={formData.eligibility === 'specific-customer-segments'}
                      onChange={(e) => handleInputChange('eligibility', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Specific customer segments</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="eligibility"
                      value="specific-customers"
                      checked={formData.eligibility === 'specific-customers'}
                      onChange={(e) => handleInputChange('eligibility', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Specific customers</span>
                  </label>
                </div>
              </fieldset>
              {formData.method === 'automatic' && formData.eligibility === 'all-customers' && (
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.applyOnPOSPro}
                    onChange={(e) => handleInputChange('applyOnPOSPro', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Apply on POS Pro locations</span>
                </label>
              )}
              {(formData.eligibility === 'specific-customer-segments' || formData.eligibility === 'specific-customers') && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    {formData.eligibility === 'specific-customer-segments' ? 'Search customer segments' : 'Search customers'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.eligibility === 'specific-customer-segments' ? segmentSearchQuery : customerSearchQuery}
                      onChange={(e) => {
                        const q = e.target.value;
                        if (formData.eligibility === 'specific-customer-segments') {
                          setSegmentSearchQuery(q);
                          debouncedSearchSegments(q);
                        } else {
                          setCustomerSearchQuery(q);
                          debouncedSearchCustomers(q);
                        }
                      }}
                      placeholder={formData.eligibility === 'specific-customer-segments' ? 'Search segments...' : 'Search customers...'}
                      className={inputClass}
                    />
                    {((formData.eligibility === 'specific-customer-segments' && segmentsLoading) || (formData.eligibility === 'specific-customers' && customersLoading)) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {formData.eligibility === 'specific-customer-segments' && segments.length > 0 && (
                    <div className="mt-3">
                      <MultiSelect
                        label="Choose customer segments"
                        value={selectedSegmentIds}
                        options={segmentOptions}
                        onChange={setSelectedSegmentIds}
                        renderValue={(selected) => segments.filter(s => selected.includes(s._id)).map(s => s.name).join(', ')}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{selectedSegmentIds.length} segment(s) selected</p>
                    </div>
                  )}
                  {formData.eligibility === 'specific-customers' && customers.length > 0 && (
                    <div className="mt-3">
                      <MultiSelect
                        label="Choose customers"
                        value={selectedCustomerIds}
                        options={customerOptions}
                        onChange={setSelectedCustomerIds}
                        renderValue={(selected) => customers.filter(c => selected.includes(c._id)).map(c => `${c.firstName} ${c.lastName}`.trim() || c.email).join(', ')}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{selectedCustomerIds.length} customer(s) selected</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Minimum purchase requirements */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Minimum purchase requirements</h2>
              <fieldset className="mb-4">
                <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Requirements</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="minimumPurchase"
                      value="no-requirements"
                      checked={formData.minimumPurchase === 'no-requirements'}
                      onChange={(e) => handleInputChange('minimumPurchase', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">No minimum requirements</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="minimumPurchase"
                      value="minimum-amount"
                      checked={formData.minimumPurchase === 'minimum-amount'}
                      onChange={(e) => handleInputChange('minimumPurchase', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Minimum purchase amount</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="minimumPurchase"
                      value="minimum-quantity"
                      checked={formData.minimumPurchase === 'minimum-quantity'}
                      onChange={(e) => handleInputChange('minimumPurchase', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Minimum quantity of items</span>
                  </label>
                </div>
              </fieldset>
              {formData.minimumPurchase === 'minimum-amount' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Minimum amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={formData.minimumAmount}
                      onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                      placeholder="e.g. 500"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              )}
              {formData.minimumPurchase === 'minimum-quantity' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Minimum quantity</label>
                  <input
                    type="number"
                    value={formData.minimumQuantity}
                    onChange={(e) => handleInputChange('minimumQuantity', e.target.value)}
                    placeholder="e.g. 2"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Combinations */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Combinations</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.productDiscounts}
                    onChange={(e) => handleInputChange('productDiscounts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Product discounts</span>
                </label>
                {formData.productDiscounts && <p className="ml-6 text-xs text-gray-500">Eligible product discounts apply first.</p>}
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.orderDiscounts}
                    onChange={(e) => handleInputChange('orderDiscounts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Order discounts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.shippingDiscounts}
                    onChange={(e) => handleInputChange('shippingDiscounts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Shipping discounts</span>
                </label>
              </div>
              {(formData.productDiscounts || formData.orderDiscounts || formData.shippingDiscounts) && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-800">This discount won't combine with other discounts at checkout.</p>
                </div>
              )}
            </div>
          </div>

          {/* Active dates */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Active dates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Start date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Start time (IST)</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Indian Standard Time</p>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 mt-4">
                <input
                  type="checkbox"
                  checked={formData.setEndDate}
                  onChange={(e) => handleInputChange('setEndDate', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Set end date</span>
              </label>
              {formData.setEndDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">End date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">End time (IST)</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Indian Standard Time</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {formData.method === 'discount-code' && (
            <>
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Sales channel access</h2>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.allowDiscountOnChannels}
                      onChange={(e) => handleInputChange('allowDiscountOnChannels', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow discount to be featured on selected channels</span>
                  </label>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Maximum discount uses</h2>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.limitTotalUses}
                      onChange={(e) => handleInputChange('limitTotalUses', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Limit total number of uses</span>
                  </label>
                  {formData.limitTotalUses && (
                    <div className="ml-6 mt-2">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Total uses limit</label>
                      <input
                        type="number"
                        value={formData.totalUsesLimit}
                        onChange={(e) => handleInputChange('totalUsesLimit', e.target.value)}
                        placeholder="e.g. 100"
                        className={inputClass}
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 mt-3">
                    <input
                      type="checkbox"
                      checked={formData.limitOneUsePerCustomer}
                      onChange={(e) => handleInputChange('limitOneUsePerCustomer', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Limit to one use per customer</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {creating ? (editId ? 'Saving…' : 'Creating…') : (editId ? 'Save changes' : 'Create discount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmountOffOrderPage;
