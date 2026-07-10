import { useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFreeShippingDiscount } from "../../contexts/free-shipping-discount.context";
import { useStore } from "../../contexts/store.context";
import { useCustomerSegments } from "../../contexts/customer-segment.context";
import { useCustomers } from "../../contexts/customer.context";
import { useCountries } from "../../contexts/country.context";
import { getCountryName } from "../../constants/countries";
import MultiSelect from "../../components/MultiSelect";

const FreeShippingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') || null;
  const { createDiscount, updateDiscount, fetchDiscountById, loading, error: createError, clearError } = useFreeShippingDiscount();
  const { activeStoreId } = useStore();
  const { segments, searchCustomerSegments, fetchSegmentsByStoreId, loading: segmentsLoading } = useCustomerSegments();
  const { customers, searchCustomers, fetchCustomersByStoreId, loading: customersLoading } = useCustomers();
  const { countries, getCountries, loading: countriesLoading } = useCountries();
  
  const [formData, setFormData] = useState({
    method: 'discount-code' as 'discount-code' | 'automatic',
    discountCode: '',
    title: '',
    countrySelection: 'all-countries' as 'all-countries' | 'selected-countries',
    countrySearchQuery: '',
    excludeShippingRates: false,
    shippingRateLimit: '',
    eligibility: 'all-customers' as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
    eligibilitySearchQuery: '',
    applyOnPOSPro: false,
    minimumPurchase: 'no-requirements' as 'no-requirements' | 'minimum-amount' | 'minimum-quantity',
    minimumAmount: '',
    minimumQuantity: '',
    allowDiscountOnChannels: false,
    limitTotalUses: false,
    totalUsesLimit: '',
    limitOneUsePerCustomer: false,
    productDiscounts: false,
    orderDiscounts: false,
    startDate: '',
    startTime: '',
    setEndDate: false,
    endDate: '',
    endTime: '',
  });

  const [segmentSearchQuery, setSegmentSearchQuery] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);

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
          countrySelection: d.countrySelection ?? 'all-countries',
          excludeShippingRates: !!d.excludeShippingRates,
          shippingRateLimit: d.shippingRateLimit != null ? String(d.shippingRateLimit) : '',
          eligibility: d.eligibility,
          applyOnPOSPro: !!d.applyOnPOSPro,
          minimumPurchase: d.minimumPurchase ?? 'no-requirements',
          minimumAmount: d.minimumAmount != null ? String(d.minimumAmount) : '',
          minimumQuantity: d.minimumQuantity != null ? String(d.minimumQuantity) : '',
          allowDiscountOnChannels: !!d.allowDiscountOnChannels,
          limitTotalUses: !!d.limitTotalUses,
          totalUsesLimit: d.totalUsesLimit != null ? String(d.totalUsesLimit) : '',
          limitOneUsePerCustomer: !!d.limitOneUsePerCustomer,
          productDiscounts: !!d.productDiscounts,
          orderDiscounts: !!d.orderDiscounts,
          startDate: d.startDate ?? '',
          startTime: d.startTime ?? '',
          setEndDate: !!d.setEndDate,
          endDate: d.endDate ?? '',
          endTime: d.endTime ?? '',
        }));
        setSelectedSegmentIds(Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.map(toId).filter(Boolean) : []);
        setSelectedCustomerIds(Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.map(toId).filter(Boolean) : []);
        setSelectedCountryIds(Array.isArray(d.selectedCountryIds) ? d.selectedCountryIds : []);
      } catch (e) {
        if (!cancelled) console.error('Failed to load discount for edit:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [editId, activeStoreId, fetchDiscountById]);

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

  const debouncedSearchCountries = useCallback((() => {
    let t: number;
    return (q: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        try {
          await getCountries(q.trim() ? { q: q.trim(), limit: 100 } : { limit: 500 });
        } catch (_) {}
      }, 300);
    };
  })(), [getCountries]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCountrySearch = useCallback((query: string) => {
    handleInputChange('countrySearchQuery', query);
    debouncedSearchCountries(query);
  }, [handleInputChange, debouncedSearchCountries]);

  const handleAddCountry = useCallback((countryId: string) => {
    if (!selectedCountryIds.includes(countryId)) {
      setSelectedCountryIds(prev => [...prev, countryId]);
    }
  }, []);

  const handleRemoveCountry = useCallback((countryId: string) => {
    setSelectedCountryIds(prev => prev.filter(id => id !== countryId));
  }, []);

  const handleCancel = useCallback(() => {
    if (editId) {
      navigate(`/discounts/free-shipping/${editId}`);
    } else {
      navigate('/discounts?createDiscountModal=open');
    }
  }, [navigate, editId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoreId) return;
    const payload = {
      storeId: activeStoreId,
      method: formData.method as 'discount-code' | 'automatic',
      discountCode: formData.method === 'discount-code' ? formData.discountCode || undefined : undefined,
      title: formData.method === 'automatic' ? formData.title || undefined : undefined,
      countrySelection: formData.countrySelection as 'all-countries' | 'selected-countries',
      selectedCountryIds: formData.countrySelection === 'selected-countries' ? selectedCountryIds : undefined,
      excludeShippingRates: !!formData.excludeShippingRates,
      shippingRateLimit: formData.excludeShippingRates && formData.shippingRateLimit !== '' ? Number(formData.shippingRateLimit) : undefined,
      eligibility: formData.eligibility as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
      applyOnPOSPro: !!formData.applyOnPOSPro,
      minimumPurchase: formData.minimumPurchase as 'no-requirements' | 'minimum-amount' | 'minimum-quantity',
      minimumAmount: formData.minimumPurchase === 'minimum-amount' && formData.minimumAmount !== '' ? Number(formData.minimumAmount) : undefined,
      minimumQuantity: formData.minimumPurchase === 'minimum-quantity' && formData.minimumQuantity !== '' ? Number(formData.minimumQuantity) : undefined,
      allowDiscountOnChannels: !!formData.allowDiscountOnChannels,
      limitTotalUses: !!formData.limitTotalUses,
      totalUsesLimit: formData.limitTotalUses && formData.totalUsesLimit !== '' ? Number(formData.totalUsesLimit) : undefined,
      limitOneUsePerCustomer: !!formData.limitOneUsePerCustomer,
      productDiscounts: !!formData.productDiscounts,
      orderDiscounts: !!formData.orderDiscounts,
      startDate: formData.startDate || undefined,
      startTime: formData.startTime || undefined,
      setEndDate: !!formData.setEndDate,
      endDate: formData.setEndDate ? (formData.endDate || undefined) : undefined,
      endTime: formData.setEndDate ? (formData.endTime || undefined) : undefined,
      targetCustomerSegmentIds: selectedSegmentIds.length ? selectedSegmentIds : undefined,
      targetCustomerIds: selectedCustomerIds.length ? selectedCustomerIds : undefined,
    };

    try {
      if (editId) {
        const res = await updateDiscount(editId, payload as any);
        if (res.success) {
          navigate(`/discounts/free-shipping/${editId}`);
        }
      } else {
        const res = await createDiscount(payload as any);
        if (res.success) {
          navigate('/discounts');
        }
      }
    } catch {}
  }, [formData, selectedCountryIds, selectedSegmentIds, selectedCustomerIds, activeStoreId, createDiscount, updateDiscount, editId, navigate]);

  useEffect(() => {
    setSegmentSearchQuery('');
    setCustomerSearchQuery('');
    setSelectedSegmentIds([]);
    setSelectedCustomerIds([]);
  }, [formData.eligibility]);

  useEffect(() => {
    if (formData.countrySelection === 'selected-countries') {
      getCountries({ limit: 500 });
    }
  }, [formData.countrySelection, getCountries]);

  const countryOptions = countries.map(c => ({
    value: c._id,
    label: `${c.name} (${c.iso2})`,
  }));

  const getCountryDisplayName = useCallback((id: string) => {
    const c = countries.find(x => x._id === id);
    return c ? (c.name || getCountryName(c.iso2)) : id;
  }, [countries]);

  const segmentOptions = segments.map(s => ({
    value: s._id,
    label: s.name,
  }));

  const customerOptions = customers.map(c => ({
    value: c._id,
    label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
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
                Free shipping
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
                    placeholder="e.g. FREESHIP"
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
                    placeholder="e.g. Free shipping"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Shown to customers when the discount applies</p>
                </div>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Country</h2>
              
              <fieldset className="mb-3">
                <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Country selection</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="countrySelection"
                      value="all-countries"
                      checked={formData.countrySelection === 'all-countries'}
                      onChange={(e) => handleInputChange('countrySelection', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">All countries</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="countrySelection"
                      value="selected-countries"
                      checked={formData.countrySelection === 'selected-countries'}
                      onChange={(e) => handleInputChange('countrySelection', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Selected countries</span>
                  </label>
                </div>
              </fieldset>

              {formData.countrySelection === 'selected-countries' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Search countries</label>
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      value={formData.countrySearchQuery}
                      onChange={(e) => handleCountrySearch(e.target.value)}
                      placeholder="Search for countries..."
                      className={inputClass}
                    />
                    {countriesLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {selectedCountryIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedCountryIds.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 text-xs"
                        >
                          {getCountryDisplayName(id)}
                          <button
                            type="button"
                            onClick={() => handleRemoveCountry(id)}
                            className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <MultiSelect
                      label="Select countries"
                      value={selectedCountryIds}
                      options={countryOptions}
                      onChange={setSelectedCountryIds}
                      renderValue={(selected) => {
                        if (selected.length === 0) return '';
                        if (selected.length === 1) return getCountryDisplayName(selected[0]);
                        return `${selected.length} countries selected`;
                      }}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">{selectedCountryIds.length} country(ies) selected</p>
                  </div>
                </div>
              )}

              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mt-6 mb-3">Shipping rates</h3>
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.excludeShippingRates}
                  onChange={(e) => handleInputChange('excludeShippingRates', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Exclude shipping rates over a certain amount</span>
              </label>
              {formData.excludeShippingRates && (
                <div className="ml-6 mt-3">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Shipping rate limit (₹)</label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={formData.shippingRateLimit}
                      onChange={(e) => handleInputChange('shippingRateLimit', e.target.value)}
                      placeholder="e.g. 500"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Maximum shipping rate amount in rupees</p>
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
                    {(segmentsLoading || customersLoading) && (
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
                        renderValue={(selected) => customers.filter(c => selected.includes(c._id)).map(c => (`${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email)).join(', ')}
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
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={formData.minimumAmount}
                      onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                      placeholder="e.g. 500"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Applies to the order total</p>
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
                  <p className="mt-1.5 text-xs text-gray-500">Minimum number of items in the order</p>
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
                    <div className="ml-6 mt-3">
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
              </div>
              {(formData.productDiscounts || formData.orderDiscounts) && (
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
              disabled={loading || !activeStoreId}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? (editId ? 'Saving…' : 'Creating…') : (editId ? 'Save changes' : 'Create discount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreeShippingPage;
