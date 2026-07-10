import { useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAmountOffProductsDiscount, CreateDiscountRequest } from "../../contexts/amount-off-products-discount.context";
import { useProducts } from "../../contexts/product.context";
import { useCollections } from "../../contexts/collection.context";
import { useCustomerSegments } from "../../contexts/customer-segment.context";
import { useCustomers } from "../../contexts/customer.context";
import { useStore } from "../../contexts/store.context";
import MultiSelect from "../../components/MultiSelect";
import Select from "../../components/Select";

const AmountOffProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') || null;
  const { createDiscount, updateDiscount, fetchDiscountById, loading, error, clearError } = useAmountOffProductsDiscount();
  const { products, fetchProductsByStoreId, searchBasic, loading: productsLoading } = useProducts();
  const { collections, fetchCollectionsByStoreId, searchCollections, loading: collectionsLoading } = useCollections();
  const { segments, fetchSegmentsByStoreId, searchCustomerSegments, loading: segmentsLoading } = useCustomerSegments();
  const { customers, fetchCustomersByStoreId, searchCustomers, loading: customersLoading } = useCustomers();
  const { activeStoreId } = useStore();
  
  // State for selected items
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  // State for search
  const [collectionSearchQuery, setCollectionSearchQuery] = useState<string>('');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [segmentSearchQuery, setSegmentSearchQuery] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  // State for search results
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Debounced search functions
  const debouncedSearchCollections = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          if (query.trim() && activeStoreId) {
            try {
              await searchCollections(activeStoreId, query);
            } catch (error) {
              console.error('Error searching collections:', error);
            }
          } else if (activeStoreId) {
            await fetchCollectionsByStoreId(activeStoreId);
          }
        }, 300);
      };
    })(),
    [activeStoreId, searchCollections, fetchCollectionsByStoreId]
  );

  const debouncedSearchProducts = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          if (query.trim() && activeStoreId) {
            try {
              const searchResults = await searchBasic({ q: query, storeId: activeStoreId });
              const fullProducts = searchResults.map(result => ({
                _id: result._id,
                title: result.title,
                price: 0,
                description: '',
                imageUrl: result.imageUrl
              }));
              setSearchResults(fullProducts);
            } catch (error) {
              console.error('Error searching products:', error);
            }
          } else if (activeStoreId) {
            await fetchProductsByStoreId(activeStoreId);
            setSearchResults([]);
          }
        }, 300);
      };
    })(),
    [activeStoreId, fetchProductsByStoreId, searchBasic]
  );

  const debouncedSearchSegments = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          if (query.trim() && activeStoreId) {
            try {
              await searchCustomerSegments(activeStoreId, query);
            } catch (error) {
              console.error('Error searching customer segments:', error);
            }
          } else if (activeStoreId) {
            await fetchSegmentsByStoreId(activeStoreId);
          }
        }, 300);
      };
    })(),
    [activeStoreId, searchCustomerSegments, fetchSegmentsByStoreId]
  );

  const debouncedSearchCustomers = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          if (query.trim() && activeStoreId) {
            try {
              await searchCustomers(activeStoreId, query);
            } catch (error) {
              console.error('Error searching customers:', error);
            }
          } else if (activeStoreId) {
            await fetchCustomersByStoreId(activeStoreId);
          }
        }, 300);
      };
    })(),
    [activeStoreId, searchCustomers, fetchCustomersByStoreId]
  );

  const [formData, setFormData] = useState({
    method: 'discount-code' as 'discount-code' | 'automatic',
    discountCode: '',
    title: '',
    valueType: 'percentage' as 'percentage' | 'fixed-amount',
    percentage: '',
    fixedAmount: '',
    takeAmountOffEachItem: false,
    appliesTo: 'specific-collections' as 'specific-collections' | 'specific-products',
    searchQuery: '',
    oncePerOrder: false,
    eligibility: 'all-customers' as 'all-customers' | 'specific-customer-segments' | 'specific-customers',
    applyOnPOSPro: false,
    eligibilitySearchQuery: '',
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

  useEffect(() => {
    const fetchData = async () => {
      if (activeStoreId) {
        try {
          await Promise.all([
            fetchProductsByStoreId(activeStoreId),
            fetchCollectionsByStoreId(activeStoreId),
            fetchSegmentsByStoreId(activeStoreId),
            fetchCustomersByStoreId(activeStoreId)
          ]);
        } catch (error) {
          console.error('Failed to fetch products, collections, segments, and customers:', error);
        }
      }
    };
    
    fetchData();
  }, [activeStoreId, fetchProductsByStoreId, fetchCollectionsByStoreId, fetchSegmentsByStoreId, fetchCustomersByStoreId]);

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
          valueType: d.valueType,
          percentage: d.percentage != null ? String(d.percentage) : '',
          fixedAmount: d.fixedAmount != null ? String(d.fixedAmount) : '',
          takeAmountOffEachItem: !!d.oncePerOrder,
          appliesTo: d.appliesTo,
          oncePerOrder: !!d.oncePerOrder,
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
        setSelectedProducts(Array.isArray(d.targetProductIds) ? d.targetProductIds.map(toId).filter(Boolean) : []);
        setSelectedCollections(Array.isArray(d.targetCollectionIds) ? d.targetCollectionIds.map(toId).filter(Boolean) : []);
        setSelectedSegments(Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.map(toId).filter(Boolean) : []);
        setSelectedCustomers(Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.map(toId).filter(Boolean) : []);
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

  const handleProductSelection = useCallback((productId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  }, []);

  const handleCollectionSelection = useCallback((collectionId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCollections(prev => [...prev, collectionId]);
    } else {
      setSelectedCollections(prev => prev.filter(id => id !== collectionId));
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (editId) {
      navigate(`/discounts/amount-off-products/${editId}`);
    } else {
      navigate('/discounts?createDiscountModal=open');
    }
  }, [navigate, editId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const discountData: CreateDiscountRequest = {
      storeId: activeStoreId!,
      method: formData.method,
      ...(formData.method === 'discount-code' && { discountCode: formData.discountCode }),
      ...(formData.method === 'automatic' && { title: formData.title }),
      allowDiscountOnChannels: formData.allowDiscountOnChannels,
      limitTotalUses: formData.limitTotalUses,
      totalUsesLimit: formData.totalUsesLimit ? Number(formData.totalUsesLimit) : undefined,
      limitOneUsePerCustomer: formData.limitOneUsePerCustomer,
      valueType: formData.valueType,
      ...(formData.valueType === 'percentage' && { percentage: Number(formData.percentage) }),
      ...(formData.valueType === 'fixed-amount' && { fixedAmount: Number(formData.fixedAmount) }),
      appliesTo: formData.appliesTo,
      oncePerOrder: formData.takeAmountOffEachItem,
      eligibility: formData.eligibility,
      applyOnPOSPro: formData.applyOnPOSPro,
      minimumPurchase: formData.minimumPurchase,
      minimumAmount: formData.minimumAmount ? Number(formData.minimumAmount) : undefined,
      minimumQuantity: formData.minimumQuantity ? Number(formData.minimumQuantity) : undefined,
      productDiscounts: formData.productDiscounts,
      orderDiscounts: formData.orderDiscounts,
      shippingDiscounts: formData.shippingDiscounts,
      startDate: formData.startDate,
      startTime: formData.startTime,
      setEndDate: formData.setEndDate,
      endDate: formData.endDate,
      endTime: formData.endTime,
      status: 'active',
      targetProductIds: selectedProducts,
      targetCollectionIds: selectedCollections,
      targetCustomerSegmentIds: selectedSegments,
      targetCustomerIds: selectedCustomers,
    };

    try {
      if (editId) {
        const result = await updateDiscount(editId, discountData);
        if (result.success) {
          navigate(`/discounts/amount-off-products/${editId}`);
        }
      } else {
        const result = await createDiscount(discountData);
        if (result.success) {
          navigate('/discounts?createDiscountModal=open');
        }
      }
    } catch (error) {
      console.error(editId ? 'Failed to update discount:' : 'Failed to create discount:', error);
    }
  }, [formData, selectedProducts, selectedCollections, selectedSegments, selectedCustomers, activeStoreId, createDiscount, updateDiscount, editId, navigate, clearError]);

  // Prepare options for selects
  const appliesToOptions = [
    { value: 'specific-collections', label: 'Specific collections' },
    { value: 'specific-products', label: 'Specific products' },
  ];

  const allProducts = searchResults.length > 0 ? searchResults : products;
  const productOptions = allProducts.map(p => ({
    value: p._id,
    label: p.title,
    secondaryText: p.price > 0 ? `(₹${p.price})` : undefined,
  }));

  const collectionOptions = collections.map(c => ({
    value: c._id,
    label: c.title,
    secondaryText: c.description,
  }));

  const segmentOptions = segments.map(s => ({
    value: s._id,
    label: s.name,
  }));

  const customerOptions = customers.map(c => ({
    value: c._id,
    label: `${c.firstName} ${c.lastName}`,
    secondaryText: c.email,
  }));

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm";

  return (
    <div className="min-h-screen bg-gray-50/50">
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
                {editId ? "Edit amount off products" : "Amount off products"}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-red-800">{error}</p>
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
                    placeholder="e.g. SAVE10"
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
                    placeholder="e.g. Summer sale"
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
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Percentage</label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      value={formData.percentage}
                      onChange={(e) => handleInputChange('percentage', e.target.value)}
                      placeholder="10"
                      className={`${inputClass} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">e.g. 10 for 10% off</p>
                </div>
              )}

              {formData.valueType === 'fixed-amount' && (
                <>
                  <div className="max-w-xs">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.fixedAmount}
                      onChange={(e) => handleInputChange('fixedAmount', e.target.value)}
                      placeholder="0"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Fixed amount in rupees</p>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.takeAmountOffEachItem}
                        onChange={(e) => handleInputChange('takeAmountOffEachItem', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Once per order</span>
                    </label>
                    <p className="mt-1 ml-7 text-xs text-gray-500">Otherwise applied to each eligible item</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Applies to */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Applies to</h2>
              
              <div className="mb-3">
                <Select
                  label="Applies to"
                  value={formData.appliesTo}
                  options={appliesToOptions}
                  onChange={(value) => handleInputChange('appliesTo', value)}
                />
              </div>

              {formData.appliesTo === 'specific-products' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Search products</label>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => {
                        const query = e.target.value;
                        setProductSearchQuery(query);
                        debouncedSearchProducts(query);
                      }}
                      placeholder="Type to search products..."
                      className={inputClass}
                    />
                    {productsLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <MultiSelect
                    label="Choose Products"
                    value={selectedProducts}
                    options={productOptions}
                    onChange={setSelectedProducts}
                    renderValue={(selected) => {
                      const selectedProducts = allProducts.filter(p => selected.includes(p._id));
                      return selectedProducts.map(p => p.title).join(', ');
                    }}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">{selectedProducts.length} product(s) selected</p>
                </div>
              )}

              {formData.appliesTo === 'specific-collections' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Search collections</label>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={collectionSearchQuery}
                      onChange={(e) => {
                        const query = e.target.value;
                        setCollectionSearchQuery(query);
                        debouncedSearchCollections(query);
                      }}
                      placeholder="Type to search collections..."
                      className={inputClass}
                    />
                    {collectionsLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <MultiSelect
                    label="Choose Collections"
                    value={selectedCollections}
                    options={collectionOptions}
                    onChange={setSelectedCollections}
                    renderValue={(selected) => {
                      const selectedCollections = collections.filter(c => selected.includes(c._id));
                      return selectedCollections.map(c => c.title).join(', ');
                    }}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">{selectedCollections.length} collection(s) selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Eligibility</h2>
              <p className="text-xs text-gray-500 mb-4">Available on all sales channels</p>
              
              <fieldset className="mb-3">
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

              {formData.eligibility === 'all-customers' && formData.method === 'automatic' && (
                <div className="mt-3">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.applyOnPOSPro}
                      onChange={(e) => handleInputChange('applyOnPOSPro', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Apply on POS Pro locations</span>
                  </label>
                </div>
              )}

              {(formData.eligibility === 'specific-customer-segments' || formData.eligibility === 'specific-customers') && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    {formData.eligibility === 'specific-customer-segments' ? 'Search customer segments' : 'Search customers'}
                  </label>
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={formData.eligibility === 'specific-customer-segments' ? segmentSearchQuery : customerSearchQuery}
                      onChange={(e) => {
                        if (formData.eligibility === 'specific-customer-segments') {
                          setSegmentSearchQuery(e.target.value);
                          debouncedSearchSegments(e.target.value);
                        } else {
                          setCustomerSearchQuery(e.target.value);
                          debouncedSearchCustomers(e.target.value);
                        }
                      }}
                      placeholder={formData.eligibility === 'specific-customer-segments' ? 'Search segments...' : 'Search customers...'}
                      className={inputClass}
                    />
                    {((formData.eligibility === 'specific-customer-segments' && segmentsLoading) || (formData.eligibility === 'specific-customers' && customersLoading)) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    )}
                  </div>
                  
                  {formData.eligibility === 'specific-customer-segments' && segments.length > 0 && (
                    <div className="mt-3">
                      <MultiSelect
                        label="Choose Customer Segments"
                        value={selectedSegments}
                        options={segmentOptions}
                        onChange={setSelectedSegments}
                        renderValue={(selected) => {
                          const selectedSegments = segments.filter(s => selected.includes(s._id));
                          return selectedSegments.map(s => s.name).join(', ');
                        }}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{selectedSegments.length} segment(s) selected</p>
                    </div>
                  )}

                  {formData.eligibility === 'specific-customers' && customers.length > 0 && (
                    <div className="mt-3">
                      <MultiSelect
                        label="Choose Customers"
                        value={selectedCustomers}
                        options={customerOptions}
                        onChange={setSelectedCustomers}
                        renderValue={(selected) => {
                          const selectedCustomers = customers.filter(c => selected.includes(c._id));
                          return selectedCustomers.map(c => `${c.firstName} ${c.lastName}`).join(', ');
                        }}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{selectedCustomers.length} customer(s) selected</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Minimum purchase */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Minimum purchase requirements</h2>
              
              <fieldset className="mb-4">
                <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Requirement</legend>
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
                    <span className="text-sm text-gray-700">No minimum</span>
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
                <div className="max-w-xs">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Minimum amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minimumAmount}
                    onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Applies to selected products only</p>
                </div>
              )}

              {formData.minimumPurchase === 'minimum-quantity' && (
                <div className="max-w-xs">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Minimum quantity</label>
                  <input
                    type="number"
                    value={formData.minimumQuantity}
                    onChange={(e) => handleInputChange('minimumQuantity', e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Applies to selected products only</p>
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
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Product discounts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.orderDiscounts}
                    onChange={(e) => handleInputChange('orderDiscounts', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Order discounts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.shippingDiscounts}
                    onChange={(e) => handleInputChange('shippingDiscounts', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Shipping discounts</span>
                </label>
              </div>
              {(formData.productDiscounts || formData.orderDiscounts || formData.shippingDiscounts) && (
                <p className="mt-3 text-xs text-gray-500 rounded-lg bg-gray-50 px-3 py-2">
                  This discount can combine with the selected discount types at checkout.
                </p>
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
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.setEndDate}
                      onChange={(e) => handleInputChange('setEndDate', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Set end date</span>
                  </label>
                </div>
                {formData.setEndDate && (
                  <>
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
                    </div>
                  </>
                )}
              </div>
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
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow discount on selected channels</span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Maximum discount uses</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.limitTotalUses}
                        onChange={(e) => handleInputChange('limitTotalUses', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Limit total uses</span>
                    </label>
                    {formData.limitTotalUses && (
                      <div className="ml-7 max-w-xs">
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
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.limitOneUsePerCustomer}
                        onChange={(e) => handleInputChange('limitOneUsePerCustomer', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Limit to one use per customer</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? (editId ? "Saving…" : "Creating…") : (editId ? "Save changes" : "Create discount")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmountOffProductsPage;
