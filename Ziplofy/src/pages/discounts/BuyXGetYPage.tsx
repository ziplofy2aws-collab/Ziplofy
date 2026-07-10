import { useState, useCallback, useEffect } from "react";
import { ArrowLeftIcon, ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProducts } from "../../contexts/product.context";
import { useCollections } from "../../contexts/collection.context";
import { useStore } from "../../contexts/store.context";
import { useCustomerSegments } from "../../contexts/customer-segment.context";
import { useCustomers } from "../../contexts/customer.context";
import { useBuyXGetYDiscount } from "../../contexts/buy-x-get-y-discount.context";
import MultiSelect from "../../components/MultiSelect";
import Select from "../../components/Select";

const BuyXGetYPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') || null;
  const { activeStoreId } = useStore();
  const { searchBasic, loading: productsLoading } = useProducts();
  const { searchCollections, loading: collectionsLoading, collections } = useCollections();
  const { segments, searchCustomerSegments, fetchSegmentsByStoreId, loading: segmentsLoading } = useCustomerSegments();
  const { customers, searchCustomers, fetchCustomersByStoreId, loading: customersLoading } = useCustomers();
  const { createDiscount, updateDiscount, fetchDiscountById, loading: creating, error: createError, clearError } = useBuyXGetYDiscount();
  
  const [formData, setFormData] = useState({
    method: 'discount-code' as 'discount-code' | 'automatic',
    discountCode: '',
    title: '',
    allowDiscountOnChannels: false,
    customerBuys: 'minimum-quantity' as 'minimum-quantity' | 'minimum-amount',
    quantity: '',
    amount: '',
    anyItemsFrom: 'specific-products' as 'specific-products' | 'specific-collections',
    searchQuery: '',
    customerGetsQuantity: '',
    customerGetsAnyItemsFrom: 'specific-products' as 'specific-products' | 'specific-collections',
    customerGetsSearchQuery: '',
    discountedValue: 'free' as 'free' | 'amount' | 'percentage',
    discountedAmount: '',
    discountedPercentage: '',
    setMaxUsersPerOrder: false,
    maxUsersPerOrder: '',
    eligibility: 'all-customers' as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
    eligibilitySearchQuery: '',
    applyOnPOSPro: false,
    limitTotalUses: false,
    totalUsesLimit: '',
    limitOneUsePerCustomer: false,
    productDiscounts: false,
    orderDiscounts: false,
    shippingDiscounts: false,
    startDate: '',
    startTime: '',
    setEndDate: false,
    endDate: '',
    endTime: '',
  });

  const [buyProductResults, setBuyProductResults] = useState<any[]>([]);
  const [selectedBuyProductIds, setSelectedBuyProductIds] = useState<string[]>([]);
  const [selectedBuyCollectionIds, setSelectedBuyCollectionIds] = useState<string[]>([]);
  const [getProductResults, setGetProductResults] = useState<any[]>([]);
  const [selectedGetProductIds, setSelectedGetProductIds] = useState<string[]>([]);
  const [selectedGetCollectionIds, setSelectedGetCollectionIds] = useState<string[]>([]);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [segmentSearchQuery, setSegmentSearchQuery] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const debouncedSearchProducts = useCallback((() => {
    let t: number;
    return async (query: string, target: 'buy' | 'get') => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (!activeStoreId) return;
        if (!query.trim()) {
          if (target === 'buy') setBuyProductResults([]);
          else setGetProductResults([]);
          return;
        }
        try {
          const res = await searchBasic({ q: query, storeId: activeStoreId });
          const mapped = res.map((p: any) => ({ _id: p._id, title: p.title, sku: p.sku, imageUrl: p.imageUrl }));
          if (target === 'buy') setBuyProductResults(mapped);
          else setGetProductResults(mapped);
        } catch (e) {}
      }, 300);
    };
  })(), [activeStoreId, searchBasic]);

  const debouncedSearchCollections = useCallback((() => {
    let t: number;
    return async (query: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (!activeStoreId) return;
        try {
          await searchCollections(activeStoreId, query || '', 1, 10);
        } catch (e) {}
      }, 300);
    };
  })(), [activeStoreId, searchCollections]);

  const debouncedSearchSegments = useCallback((() => {
    let t: number;
    return async (query: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (!activeStoreId) return;
        if (query.trim()) {
          try { await searchCustomerSegments(activeStoreId, query); } catch (e) {}
        } else {
          try { await fetchSegmentsByStoreId(activeStoreId); } catch (e) {}
        }
      }, 300);
    };
  })(), [activeStoreId, searchCustomerSegments, fetchSegmentsByStoreId]);

  const debouncedSearchCustomers = useCallback((() => {
    let t: number;
    return async (query: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (!activeStoreId) return;
        if (query.trim()) {
          try { await searchCustomers(activeStoreId, query); } catch (e) {}
        } else {
          try { await fetchCustomersByStoreId(activeStoreId); } catch (e) {}
        }
      }, 300);
    };
  })(), [activeStoreId, searchCustomers, fetchCustomersByStoreId]);

  // Edit mode: load discount by id and prefill form
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
          allowDiscountOnChannels: !!d.allowDiscountOnChannels,
          customerBuys: d.customerBuys,
          quantity: d.quantity != null ? String(d.quantity) : '',
          amount: d.amount != null ? String(d.amount) : '',
          anyItemsFrom: d.anyItemsFrom,
          customerGetsQuantity: d.customerGetsQuantity != null ? String(d.customerGetsQuantity) : '',
          customerGetsAnyItemsFrom: d.customerGetsAnyItemsFrom,
          discountedValue: d.discountedValue,
          discountedAmount: d.discountedAmount != null ? String(d.discountedAmount) : '',
          discountedPercentage: d.discountedPercentage != null ? String(d.discountedPercentage) : '',
          setMaxUsersPerOrder: !!d.setMaxUsersPerOrder,
          maxUsersPerOrder: d.maxUsersPerOrder != null ? String(d.maxUsersPerOrder) : '',
          eligibility: d.eligibility,
          applyOnPOSPro: !!d.applyOnPOSPro,
          limitTotalUses: !!d.limitTotalUses,
          totalUsesLimit: d.totalUsesLimit != null ? String(d.totalUsesLimit) : '',
          limitOneUsePerCustomer: !!d.limitOneUsePerCustomer,
          productDiscounts: !!d.productDiscounts,
          orderDiscounts: !!d.orderDiscounts,
          shippingDiscounts: !!d.shippingDiscounts,
          startDate: d.startDate ?? '',
          startTime: d.startTime ?? '',
          setEndDate: !!d.setEndDate,
          endDate: d.endDate ?? '',
          endTime: d.endTime ?? '',
        }));
        setSelectedBuyProductIds(Array.isArray(d.buysProductIds) ? d.buysProductIds.map(toId).filter(Boolean) : []);
        setSelectedBuyCollectionIds(Array.isArray(d.buysCollectionIds) ? d.buysCollectionIds.map(toId).filter(Boolean) : []);
        setSelectedGetProductIds(Array.isArray(d.getsProductIds) ? d.getsProductIds.map(toId).filter(Boolean) : []);
        setSelectedGetCollectionIds(Array.isArray(d.getsCollectionIds) ? d.getsCollectionIds.map(toId).filter(Boolean) : []);
        setSelectedSegmentIds(Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.map(toId).filter(Boolean) : []);
        setSelectedCustomerIds(Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.map(toId).filter(Boolean) : []);
      } catch (e) {
        if (!cancelled) console.error('Failed to load discount for edit:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [editId, activeStoreId, fetchDiscountById]);

  const handleCancel = useCallback(() => {
    if (editId) {
      navigate(`/discounts/pyxgety/${editId}`);
    } else {
      navigate('/discounts?createDiscountModal=open');
    }
  }, [navigate, editId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        storeId: activeStoreId as string,
        method: formData.method as 'discount-code' | 'automatic',
        ...(formData.method === 'discount-code' ? { discountCode: formData.discountCode } : {}),
        ...(formData.method === 'automatic' ? { title: formData.title } : {}),
        allowDiscountOnChannels: formData.allowDiscountOnChannels,
        customerBuys: formData.customerBuys as 'minimum-quantity' | 'minimum-amount',
        ...(formData.customerBuys === 'minimum-quantity' ? { quantity: Number(formData.quantity) || 0 } : {}),
        ...(formData.customerBuys === 'minimum-amount' ? { amount: Number(formData.amount) || 0 } : {}),
        anyItemsFrom: formData.anyItemsFrom as 'specific-products' | 'specific-collections',
        customerGetsQuantity: Number(formData.customerGetsQuantity) || 1,
        customerGetsAnyItemsFrom: formData.customerGetsAnyItemsFrom as 'specific-products' | 'specific-collections',
        discountedValue: formData.discountedValue as 'free' | 'amount' | 'percentage',
        ...(formData.discountedValue === 'amount' ? { discountedAmount: Number(formData.discountedAmount) || 0 } : {}),
        ...(formData.discountedValue === 'percentage' ? { discountedPercentage: Number(formData.discountedPercentage) || 0 } : {}),
        setMaxUsersPerOrder: formData.setMaxUsersPerOrder,
        ...(formData.setMaxUsersPerOrder ? { maxUsersPerOrder: Number(formData.maxUsersPerOrder) || 0 } : {}),
        eligibility: formData.eligibility as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
        applyOnPOSPro: formData.applyOnPOSPro,
        limitTotalUses: formData.limitTotalUses,
        ...(formData.limitTotalUses ? { totalUsesLimit: Number(formData.totalUsesLimit) || 0 } : {}),
        limitOneUsePerCustomer: formData.limitOneUsePerCustomer,
        productDiscounts: formData.productDiscounts,
        orderDiscounts: formData.orderDiscounts,
        shippingDiscounts: formData.shippingDiscounts,
        startDate: formData.startDate || undefined,
        startTime: formData.startTime || undefined,
        setEndDate: formData.setEndDate,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        status: 'active' as const,
        buysProductIds: selectedBuyProductIds,
        buysCollectionIds: selectedBuyCollectionIds,
        getsProductIds: selectedGetProductIds,
        getsCollectionIds: selectedGetCollectionIds,
        targetCustomerSegmentIds: selectedSegmentIds,
        targetCustomerIds: selectedCustomerIds,
      };

      if (editId) {
        const res = await updateDiscount(editId, payload);
        if (res.success) {
          navigate(`/discounts/pyxgety/${editId}`);
        }
      } else {
        const res = await createDiscount(payload);
        if (res.success) {
          navigate('/discounts');
        }
      }
    } catch (err) {
      // error handled by context
    }
  }, [formData, selectedBuyProductIds, selectedBuyCollectionIds, selectedGetProductIds, selectedGetCollectionIds, selectedSegmentIds, selectedCustomerIds, activeStoreId, createDiscount, updateDiscount, editId, navigate]);

  // Prepare options for selects
  const anyItemsFromOptions = [
    { value: 'specific-products', label: 'Specific products' },
    { value: 'specific-collections', label: 'Specific collections' },
  ];

  const buyProductOptions = buyProductResults.map(p => ({
    value: p._id,
    label: p.title,
  }));

  const buyCollectionOptions = collections.map(c => ({
    value: c._id,
    label: c.title,
  }));

  const getProductOptions = getProductResults.map(p => ({
    value: p._id,
    label: p.title,
  }));

  const getCollectionOptions = collections.map(c => ({
    value: c._id,
    label: c.title,
  }));

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
                  {editId ? 'Edit Buy X get Y' : 'Buy X get Y'}
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
                      placeholder="e.g. BUY2GET1"
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
                      placeholder="e.g. Buy 2 get 1 free"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Shown to customers when the discount applies</p>
                  </div>
                )}
              </div>
            </div>

            {formData.method === 'discount-code' && (
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
            )}

            {/* Customer buys / spends */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  {formData.customerBuys === 'minimum-amount' ? 'Customer spends' : 'Customer buys'}
                </h2>
                <fieldset className="mb-4">
                  <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {formData.customerBuys === 'minimum-amount' ? 'Customer spends' : 'Customer buys'}
                  </legend>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="customerBuys"
                        value="minimum-quantity"
                        checked={formData.customerBuys === 'minimum-quantity'}
                        onChange={(e) => handleInputChange('customerBuys', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Minimum quantity of items</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="customerBuys"
                        value="minimum-amount"
                        checked={formData.customerBuys === 'minimum-amount'}
                        onChange={(e) => handleInputChange('customerBuys', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Minimum purchase amount</span>
                    </label>
                  </div>
                </fieldset>
                {(formData.customerBuys === 'minimum-quantity' || formData.customerBuys === 'minimum-amount') && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                          {formData.customerBuys === 'minimum-quantity' ? 'Quantity' : 'Amount'}
                        </label>
                        {formData.customerBuys === 'minimum-amount' ? (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => handleInputChange('amount', e.target.value)}
                              placeholder="e.g. 500"
                              className={`${inputClass} pl-8`}
                            />
                          </div>
                        ) : (
                          <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            placeholder="e.g. 2"
                            className={inputClass}
                          />
                        )}
                        <p className="mt-1.5 text-xs text-gray-500">
                          {formData.customerBuys === 'minimum-quantity' ? 'Minimum quantity required' : 'Minimum amount in rupees'}
                        </p>
                      </div>
                      <div>
                        <Select
                          label="Any items from"
                          value={formData.anyItemsFrom}
                          options={anyItemsFromOptions}
                          onChange={(value) => handleInputChange('anyItemsFrom', value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                          {formData.anyItemsFrom === 'specific-products' ? 'Search products' : 'Search collections'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.searchQuery}
                            onChange={(e) => {
                              const q = e.target.value;
                              handleInputChange('searchQuery', q);
                              if (formData.anyItemsFrom === 'specific-products') {
                                debouncedSearchProducts(q, 'buy');
                              } else {
                                debouncedSearchCollections(q);
                              }
                            }}
                            placeholder={formData.anyItemsFrom === 'specific-products' ? 'Search for products...' : 'Search for collections...'}
                            className={inputClass}
                          />
                        {((formData.anyItemsFrom === 'specific-products' && productsLoading) || (formData.anyItemsFrom === 'specific-collections' && collectionsLoading)) && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        </div>
                      <p className="mt-1.5 text-xs text-gray-500">
                        {formData.anyItemsFrom === 'specific-products' ? 'Search and select products to apply the discount to' : 'Search and select collections to apply the discount to'}
                      </p>
                      </div>
                    </div>

                    {formData.anyItemsFrom === 'specific-products' && (
                      <div className="col-span-full">
                        <MultiSelect
                          label="Choose Products"
                          value={selectedBuyProductIds}
                          options={buyProductOptions}
                          onChange={setSelectedBuyProductIds}
                          renderValue={(selected) => {
                            const names = buyProductResults.filter(p => selected.includes(p._id)).map(p => p.title);
                            return names.join(', ');
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-600">
                          {selectedBuyProductIds.length} product(s) selected
                        </p>
                      </div>
                    )}

                    {formData.anyItemsFrom === 'specific-collections' && (
                      <div className="col-span-full">
                        <MultiSelect
                          label="Choose Collections"
                          value={selectedBuyCollectionIds}
                          options={buyCollectionOptions}
                          onChange={setSelectedBuyCollectionIds}
                          renderValue={(selected) => {
                            const names = collections.filter(c => selected.includes(c._id)).map(c => c.title);
                            return names.join(', ');
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-600">
                          {selectedBuyCollectionIds.length} collection(s) selected
                        </p>
                      </div>
                    )}
                  </div>
              )}
              </div>
            </div>

            {/* Customer gets */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Customer gets</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Quantity</label>
                    <input
                      type="number"
                      value={formData.customerGetsQuantity}
                      onChange={(e) => handleInputChange('customerGetsQuantity', e.target.value)}
                      placeholder="e.g. 1"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Quantity of items customers will get</p>
                  </div>
                  <div>
                    <Select
                      label="Any items from"
                      value={formData.customerGetsAnyItemsFrom}
                      options={anyItemsFromOptions}
                      onChange={(value) => handleInputChange('customerGetsAnyItemsFrom', value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      {formData.customerGetsAnyItemsFrom === 'specific-products' ? 'Search products' : 'Search collections'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.customerGetsSearchQuery}
                        onChange={(e) => {
                          const q = e.target.value;
                          handleInputChange('customerGetsSearchQuery', q);
                          if (formData.customerGetsAnyItemsFrom === 'specific-products') {
                            debouncedSearchProducts(q, 'get');
                          } else {
                            debouncedSearchCollections(q);
                          }
                        }}
                        placeholder={formData.customerGetsAnyItemsFrom === 'specific-products' ? 'Search for products...' : 'Search for collections...'}
                        className={inputClass}
                      />
                    {((formData.customerGetsAnyItemsFrom === 'specific-products' && productsLoading) || (formData.customerGetsAnyItemsFrom === 'specific-collections' && collectionsLoading)) && (
                      <div className="absolute right-3 top-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    {formData.customerGetsAnyItemsFrom === 'specific-products' ? 'Search and select products to apply the discount to' : 'Search and select collections to apply the discount to'}
                  </p>
                </div>

                {formData.customerGetsAnyItemsFrom === 'specific-products' && (
                  <div className="col-span-full">
                    <MultiSelect
                      label="Choose Products"
                      value={selectedGetProductIds}
                      options={getProductOptions}
                      onChange={setSelectedGetProductIds}
                      renderValue={(selected) => {
                        const names = getProductResults.filter(p => selected.includes(p._id)).map(p => p.title);
                        return names.join(', ');
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-600">
                      {selectedGetProductIds.length} product(s) selected
                    </p>
                  </div>
                )}

                {formData.customerGetsAnyItemsFrom === 'specific-collections' && (
                  <div className="col-span-full">
                    <MultiSelect
                      label="Choose Collections"
                      value={selectedGetCollectionIds}
                      options={getCollectionOptions}
                      onChange={setSelectedGetCollectionIds}
                      renderValue={(selected) => {
                        const names = collections.filter(c => selected.includes(c._id)).map(c => c.title);
                        return names.join(', ');
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-600">
                      {selectedGetCollectionIds.length} collection(s) selected
                    </p>
                  </div>
                )}
              </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">At a discounted value</h3>
                  <fieldset className="mb-4">
                    <legend className="sr-only">Discounted value</legend>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="discountedValue"
                          value="free"
                          checked={formData.discountedValue === 'free'}
                          onChange={(e) => handleInputChange('discountedValue', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Free</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="discountedValue"
                          value="amount"
                          checked={formData.discountedValue === 'amount'}
                          onChange={(e) => handleInputChange('discountedValue', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Amount off each</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="discountedValue"
                          value="percentage"
                          checked={formData.discountedValue === 'percentage'}
                          onChange={(e) => handleInputChange('discountedValue', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Percentage off</span>
                      </label>
                    </div>
                  </fieldset>
                  {formData.discountedValue === 'amount' && (
                    <>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            value={formData.discountedAmount}
                            onChange={(e) => handleInputChange('discountedAmount', e.target.value)}
                            placeholder="e.g. 100"
                            className={`${inputClass} pl-8`}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">Amount off each eligible item</p>
                      </div>
                    </>
                  )}
                  {formData.discountedValue === 'percentage' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Percentage</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.discountedPercentage}
                          onChange={(e) => handleInputChange('discountedPercentage', e.target.value)}
                          placeholder="e.g. 50"
                          className={`${inputClass} pr-8`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">Percentage off each eligible item</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.setMaxUsersPerOrder}
                        onChange={(e) => handleInputChange('setMaxUsersPerOrder', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Set a maximum number of uses per order</span>
                    </label>
                    {formData.setMaxUsersPerOrder && (
                      <div className="ml-6 mt-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Maximum uses per order</label>
                        <input
                          type="number"
                          value={formData.maxUsersPerOrder}
                          onChange={(e) => handleInputChange('maxUsersPerOrder', e.target.value)}
                          placeholder="e.g. 1"
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                </div>
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
                    <p className="mt-1.5 text-xs text-gray-500">
                      {formData.eligibility === 'specific-customer-segments' ? 'Search and select segments' : 'Search and select customers'}
                    </p>
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

            {formData.method === 'discount-code' && (
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
                  {formData.productDiscounts && (
                    <p className="ml-6 text-xs text-gray-500">Each eligible item may receive one product discount.</p>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.orderDiscounts}
                      onChange={(e) => handleInputChange('orderDiscounts', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Order discounts</span>
                  </label>
                  {formData.orderDiscounts && (
                    <p className="ml-6 text-xs text-gray-500">Order discounts apply in addition to product discounts.</p>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.shippingDiscounts}
                      onChange={(e) => handleInputChange('shippingDiscounts', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Shipping discounts</span>
                  </label>
                  {formData.shippingDiscounts && (
                    <p className="ml-6 text-xs text-gray-500">Largest eligible shipping discount applies.</p>
                  )}
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

export default BuyXGetYPage;
