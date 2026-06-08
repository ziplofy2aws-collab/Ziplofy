import React from 'react';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../contexts/collection.context';
import { useStore } from '../../contexts/store.context';
import { useProducts, ProductSearchWithVariantsItem } from '../../contexts/product.context';
import { useReturnRules } from '../../contexts/return-rules.context';
import { useFinalSaleItems } from '../../contexts/final-sale-item.context';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600';

const fieldInput =
  'w-full max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const radioClass =
  'h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const checkboxClass =
  'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const ManageReturnRules: React.FC = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = React.useState(false);

  const [windowType, setWindowType] = React.useState<'14' | '30' | '90' | 'unlimited' | 'custom'>('30');
  const [customDays, setCustomDays] = React.useState<string>('');

  const [shippingCost, setShippingCost] = React.useState<'customer' | 'free' | 'flat'>('free');
  const [flatRate, setFlatRate] = React.useState<string>('');

  const [chargeRestock, setChargeRestock] = React.useState<boolean>(false);
  const [restockFee, setRestockFee] = React.useState<string>('');

  const [useFinalCollections, setUseFinalCollections] = React.useState<boolean>(true);
  const [useFinalProducts, setUseFinalProducts] = React.useState<boolean>(false);
  const [collectionQuery, setCollectionQuery] = React.useState<string>('');
  const [collectionError, setCollectionError] = React.useState<string>('');
  const [productQuery, setProductQuery] = React.useState<string>('');
  const [finalCollections, setFinalCollections] = React.useState<{ id: string; title: string }[]>([]);
  const [selectedVariants, setSelectedVariants] = React.useState<Record<string, { id: string; productTitle: string; optionSummary: string; imageUrl: string | null }>>({});

  const { searchCollections } = useCollections();
  const { activeStoreId } = useStore();
  const [collectionSearchResults, setCollectionSearchResults] = React.useState<{ id: string; title: string }[]>([]);
  const [showCollectionResults, setShowCollectionResults] = React.useState<boolean>(false);

  const { searchProductsWithVariants } = useProducts();
  const [productSearchResults, setProductSearchResults] = React.useState<ProductSearchWithVariantsItem[]>([]);
  const [showProductResults, setShowProductResults] = React.useState<boolean>(false);

  const { rules, getByStoreId, updateRules, loading } = useReturnRules();
  const { items, getByReturnRulesId, createItem } = useFinalSaleItems();

  // Derive dirty state comparing UI to context rules
  const currentNormalized = React.useMemo(() => {
    const mappedWindow = windowType === 'custom' ? (customDays || '') : windowType;
    const mappedShipping =
      shippingCost === 'customer'
        ? 'customer provides return shipping'
        : shippingCost === 'flat'
          ? 'flat rate return shipping'
          : 'free return shipping';
    return {
      enabled,
      returnWindow: mappedWindow,
      returnShippingCost: mappedShipping,
      flatRate: shippingCost === 'flat' ? (flatRate ? Number(flatRate) : 0) : undefined,
      chargeRestockingFree: chargeRestock,
      restockingFee: chargeRestock ? (restockFee ? Number(restockFee) : 0) : undefined,
      finalSaleSelection: useFinalCollections ? 'collections' : useFinalProducts ? 'products' : 'collections',
    };
  }, [enabled, windowType, customDays, shippingCost, flatRate, chargeRestock, restockFee, useFinalCollections, useFinalProducts]);

  const initialNormalized = React.useMemo(() => {
    if (!rules) return null;
    return {
      enabled: !!rules.enabled,
      returnWindow: String(rules.returnWindow || ''),
      returnShippingCost: rules.returnShippingCost,
      flatRate: rules.flatRate != null ? Number(rules.flatRate) : undefined,
      chargeRestockingFree: !!rules.chargeRestockingFree,
      restockingFee: rules.restockingFee != null ? Number(rules.restockingFee) : undefined,
      finalSaleSelection: rules.finalSaleSelection || 'collections',
    };
  }, [rules]);

  const isDirty = React.useMemo(() => {
    if (!initialNormalized) return false;
    const a = currentNormalized;
    const b = initialNormalized;
    return (
      a.enabled !== b.enabled ||
      a.returnWindow !== b.returnWindow ||
      a.returnShippingCost !== b.returnShippingCost ||
      (a.flatRate ?? undefined) !== (b.flatRate ?? undefined) ||
      a.chargeRestockingFree !== b.chargeRestockingFree ||
      (a.restockingFee ?? undefined) !== (b.restockingFee ?? undefined) ||
      a.finalSaleSelection !== b.finalSaleSelection
    );
  }, [currentNormalized, initialNormalized]);

  // Fetch rules if not present
  React.useEffect(() => {
    if (activeStoreId) getByStoreId(activeStoreId).catch(() => {});
  }, [activeStoreId, getByStoreId]);

  // Sync UI with rules state
  React.useEffect(() => {
    if (!rules) return;
    // Fetch final sale items for these rules
    getByReturnRulesId(rules._id).catch(() => {});
    setEnabled(!!rules.enabled);
    // window
    const win = String(rules.returnWindow || '').trim();
    const fixed = ['14', '30', '90', 'unlimited'];
    if (fixed.includes(win)) {
      setWindowType(win as any);
      setCustomDays('');
    } else if (win) {
      setWindowType('custom');
      setCustomDays(win);
    }
    // shipping
    if (rules.returnShippingCost === 'customer provides return shipping') setShippingCost('customer');
    else if (rules.returnShippingCost === 'flat rate return shipping') setShippingCost('flat');
    else setShippingCost('free');
    setFlatRate(rules.flatRate != null ? String(rules.flatRate) : '');
    // restocking
    setChargeRestock(!!rules.chargeRestockingFree);
    setRestockFee(rules.restockingFee != null ? String(rules.restockingFee) : '');
    // final sale selection preference
    if (rules.finalSaleSelection === 'collections') {
      setUseFinalCollections(true);
      setUseFinalProducts(false);
      setSelectedVariants({});
    } else if (rules.finalSaleSelection === 'products') {
      setUseFinalCollections(false);
      setUseFinalProducts(true);
      setFinalCollections([]);
    } else {
      // default fallback to collections
      setUseFinalCollections(true);
      setUseFinalProducts(false);
      setSelectedVariants({});
    }
  }, [rules, getByReturnRulesId]);

  // Debounced collection search
  React.useEffect(() => {
    if (!useFinalCollections) return;
    const q = collectionQuery.trim();
    if (!q || q.length < 2 || !activeStoreId) {
      setCollectionSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await searchCollections(activeStoreId, q, 1, 10);
        setCollectionSearchResults(
          res.data.map((c) => ({ id: c._id, title: c.title }))
        );
        setShowCollectionResults(true);
      } catch {
        setCollectionSearchResults([]);
        setShowCollectionResults(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [collectionQuery, activeStoreId, searchCollections, useFinalCollections]);

  // Debounced product search (with variants)
  React.useEffect(() => {
    if (!useFinalProducts || !activeStoreId) return;
    const q = productQuery.trim();
    if (!q || q.length < 2) {
      setProductSearchResults([]);
      setShowProductResults(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await searchProductsWithVariants({ storeId: activeStoreId, q, limit: 5 });
        setProductSearchResults(res.data || []);
        setShowProductResults(true);
      } catch {
        setProductSearchResults([]);
        setShowProductResults(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [productQuery, activeStoreId, searchProductsWithVariants, useFinalProducts]);

  const activeFinalSaleSelection = React.useMemo<'collections' | 'products'>(() => {
    if (useFinalCollections && !useFinalProducts) return 'collections';
    if (useFinalProducts && !useFinalCollections) return 'products';
    return rules?.finalSaleSelection || 'collections';
  }, [useFinalCollections, useFinalProducts, rules?.finalSaleSelection]);

  const collectionItems = React.useMemo(
    () => items.filter((it) => typeof it.collectionId === 'object' && it.collectionId !== null),
    [items]
  );
  const variantItems = React.useMemo(
    () => items.filter((it) => typeof it.productVariantId === 'object' && it.productVariantId !== null),
    [items]
  );

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Manage return rules"
          description="Edit return windows, shipping costs, restocking fees, and which products are final sale."
          tip="Saved changes apply to purchases made after you update these rules."
          leading={
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              {isDirty && rules ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    await updateRules(rules._id, {
                      enabled: currentNormalized.enabled,
                      returnWindow: currentNormalized.returnWindow,
                      returnShippingCost: currentNormalized.returnShippingCost as any,
                      flatRate: currentNormalized.flatRate,
                      chargeRestockingFree: currentNormalized.chargeRestockingFree,
                      restockingFee: currentNormalized.restockingFee,
                    });
                    navigate('/settings/policies');
                  }}
                  className={btnPrimary}
                >
                  Save
                </button>
              ) : null}
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <span className="text-center text-sm font-medium text-slate-700 sm:text-left">
                  {enabled ? 'Return rules on' : 'Return rules off'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => setEnabled((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    enabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          }
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Returns &amp; shipping</h2>
              <p className="mt-1 text-sm text-gray-500">
                Return window, who pays for return shipping, and optional restocking fees.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <h3 className="text-base font-semibold text-gray-900">Return window</h3>
          <div className="mt-3 space-y-2.5">
            {(['14', '30', '90', 'unlimited', 'custom'] as const).map((value) => (
              <label key={value} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="windowType"
                  value={value}
                  checked={windowType === value}
                  onChange={(e) => setWindowType(e.target.value as any)}
                  className={radioClass}
                />
                <span className="text-sm text-gray-900">
                  {value === 'custom' ? 'Custom days' : value === 'unlimited' ? 'Unlimited' : `${value} days`}
                </span>
              </label>
            ))}
          </div>
          {windowType === 'custom' && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Number of days</label>
              <input
                type="text"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className={fieldInput}
                placeholder="Number of days"
              />
            </div>
          )}

          <hr className="my-8 border-gray-200/90" />

          <h3 className="text-base font-semibold text-gray-900">Return shipping cost</h3>
          <p className="mt-1 text-sm text-gray-500">
            Does not apply to returns using Point of Sale.
          </p>
          <div className="mt-4 space-y-2.5">
            {(['customer', 'free', 'flat'] as const).map((value) => (
              <label key={value} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="shippingCost"
                  value={value}
                  checked={shippingCost === value}
                  onChange={(e) => setShippingCost(e.target.value as any)}
                  className={radioClass}
                />
                <span className="text-sm text-gray-900">
                  {value === 'customer' ? 'Customer provides return shipping' : value === 'free' ? 'Free return shipping' : 'Flat rate return shipping'}
                </span>
              </label>
            ))}
          </div>
          {shippingCost === 'flat' && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Flat rate</label>
              <div className="flex max-w-[220px] items-center gap-2">
                <span className="text-sm text-slate-600">₹</span>
                <input
                  type="number"
                  value={flatRate}
                  onChange={(e) => setFlatRate(e.target.value)}
                  placeholder="0.00"
                  className={`${fieldInput} max-w-none flex-1`}
                />
              </div>
            </div>
          )}

          <hr className="my-8 border-gray-200/90" />

          <h3 className="text-base font-semibold text-gray-900">Restocking fee</h3>
          <p className="mt-1 text-sm text-gray-500">Optional percentage deducted from the refund when you restock.</p>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={chargeRestock}
              onChange={(e) => setChargeRestock(e.target.checked)}
              className={checkboxClass}
            />
            <span className="text-sm text-gray-900">Charge restocking fee</span>
          </label>
          {chargeRestock && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Restocking fee (%)</label>
              <input
                type="number"
                value={restockFee}
                onChange={(e) => setRestockFee(e.target.value)}
                placeholder="0"
                className={fieldInput}
              />
            </div>
          )}

          <div className="mt-8 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3">
            <p className="text-xs leading-relaxed text-slate-600">
              Return rules only apply to items purchased after return rules are turned on or updated.
            </p>
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Final sale items</h2>
              <p className="mt-1 text-sm text-gray-500">
                Customers can&apos;t request returns for products set as final sale.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useFinalCollections}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseFinalCollections(checked);
                  if (checked) {
                    setUseFinalProducts(false);
                    setSelectedVariants({});
                  } else {
                    setFinalCollections([]);
                  }
                }}
                className={checkboxClass}
              />
              <span className="text-sm text-gray-900">Specific collections</span>
            </label>
            {useFinalCollections && (
              <div className="flex gap-2 items-start flex-wrap relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search collections"
                    value={collectionQuery}
                    onChange={(e) => {
                      setCollectionQuery(e.target.value);
                      if (collectionError) setCollectionError('');
                    }}
                    onFocus={() => collectionSearchResults.length && setShowCollectionResults(true)}
                    className="min-w-[280px] border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                  {showCollectionResults && collectionSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 z-10 min-w-[280px] max-h-60 overflow-y-auto border border-gray-200 bg-white">
                      {collectionSearchResults.map((c) => (
                        <div
                          key={c.id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                          onMouseDown={() => {
                            const alreadyLocal = finalCollections.some((fc) => fc.id === c.id);
                            const alreadyPersisted = collectionItems.some((item) => {
                              const col: any = item.collectionId;
                              const colId = typeof col === 'object' ? col?._id : col;
                              return colId && colId.toString() === c.id;
                            });
                            if (alreadyLocal || alreadyPersisted) {
                              setCollectionError('This collection is already added to final sale.');
                            } else {
                              setFinalCollections((p) => [...p, c]);
                              setCollectionError('');
                            }
                            setCollectionQuery('');
                            setShowCollectionResults(false);
                          }}
                        >
                          <p className="text-sm text-gray-900">{c.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {finalCollections.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {c.title}
                      <button
                        onClick={() => setFinalCollections((p) => p.filter((x) => x.id !== c.id))}
                        className="hover:text-gray-900"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {collectionError && (
                  <p className="text-xs text-red-600">
                    {collectionError}
                  </p>
                )}
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useFinalProducts}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseFinalProducts(checked);
                  if (checked) {
                    setUseFinalCollections(false);
                    setFinalCollections([]);
                  } else {
                    setSelectedVariants({});
                  }
                }}
                className={checkboxClass}
              />
              <span className="text-sm text-gray-900">Specific products</span>
            </label>
            {useFinalProducts && (
              <div className="flex flex-col gap-2 relative">
                <input
                  type="text"
                  placeholder="Search products"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onFocus={() => productSearchResults.length && setShowProductResults(true)}
                  className="min-w-[280px] border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
                {showProductResults && productSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 z-10 min-w-[360px] max-h-[360px] overflow-y-auto border border-gray-200 bg-white p-2">
                    {productSearchResults.map((p) => (
                      <div key={p.product._id} className="mb-2 border border-gray-200 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                          <div className="w-8 h-8 border border-gray-200 overflow-hidden bg-white">
                            {p.product.imageUrl ? (
                              <img src={p.product.imageUrl} alt={p.product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.product.title}
                          </p>
                        </div>
                        <div>
                          {p.variants.map((variant) => {
                            const optionSummary = Object.values(variant.optionValues || {}).join(' / ') || variant.sku || 'Variant';
                            const checked = !!selectedVariants[variant._id];
                            return (
                              <div
                                key={variant._id}
                                className={`flex items-center justify-between px-3 py-2 border-t border-gray-100 cursor-pointer transition-colors ${
                                  checked ? 'bg-gray-50' : 'bg-white'
                                }`}
                                onMouseDown={() => {
                                  setSelectedVariants((prev) => {
                                    const next = { ...prev };
                                    if (next[variant._id]) {
                                      delete next[variant._id];
                                    } else {
                                      next[variant._id] = {
                                        id: variant._id,
                                        productTitle: p.product.title,
                                        optionSummary,
                                        imageUrl: variant.images && variant.images.length > 0 ? variant.images[0] : p.product.imageUrl || null,
                                      };
                                    }
                                    return next;
                                  });
                                }}
                              >
                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {}}
                                    className={checkboxClass}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {optionSummary}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {variant.sku || 'SKU N/A'}
                                    </p>
                                  </div>
                                </label>
                                <p className="text-sm text-gray-600">
                                  ₹{variant.price?.toFixed(2) ?? '0.00'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap mt-2">
                  {Object.values(selectedVariants).map((variant) => (
                    <span
                      key={variant.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {variant.productTitle} • {variant.optionSummary}
                      <button
                        onClick={() =>
                          setSelectedVariants((prev) => {
                            const next = { ...prev };
                            delete next[variant.id];
                            return next;
                          })
                        }
                        className="hover:text-gray-900"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            {(() => {
              const hasCollections = useFinalCollections && finalCollections.length > 0;
              const hasProducts = useFinalProducts && Object.keys(selectedVariants).length > 0;
              const selection =
                useFinalCollections && !useFinalProducts
                  ? 'collections'
                  : useFinalProducts && !useFinalCollections
                    ? 'products'
                    : currentNormalized.finalSaleSelection;
              const selectionChanged =
                initialNormalized && selection !== initialNormalized.finalSaleSelection;
              const disabled = !rules || !activeStoreId || (!hasCollections && !hasProducts && !selectionChanged);

              return (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={async () => {
                    if (!rules || !activeStoreId) return;
                    const creates: Promise<any>[] = [];
                    if (hasCollections) {
                      for (const c of finalCollections) {
                        creates.push(createItem({ returnRulesId: rules._id, storeId: activeStoreId, collectionId: c.id }));
                      }
                    }
                    if (hasProducts) {
                      Object.values(selectedVariants).forEach((variant) => {
                        creates.push(createItem({ returnRulesId: rules._id, storeId: activeStoreId, productVariantId: variant.id }));
                      });
                    }
                    if (creates.length > 0) {
                      await Promise.all(creates);
                    }
                    if (selectionChanged) {
                      await updateRules(rules._id, { finalSaleSelection: selection as 'collections' | 'products' });
                    }
                    navigate('/settings/policies');
                  }}
                  className={btnPrimary}
                >
                  Save
                </button>
              );
            })()}
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">
                Current {activeFinalSaleSelection === 'collections' ? 'final sale collections' : 'final sale products'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Collections and variants already saved as final sale.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          {activeFinalSaleSelection === 'collections' ? (
            collectionItems.length > 0 ? (
              <div className="flex flex-col gap-2">
                {collectionItems.map((item) => {
                  const collection: any = item.collectionId;
                  return (
                    <div
                      key={item._id}
                      className="border border-gray-200 p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {collection?.title || 'Collection'}
                        </p>
                        <p className="text-xs text-gray-600">
                          ID: {collection?._id || item.collectionId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No collections added to final sale yet.
              </p>
            )
          ) : variantItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              {variantItems.map((item) => {
                const variant: any = item.productVariantId;
                const optionSummary = Object.values(variant?.optionValues || {}).join(' / ') || variant?.sku || 'Variant';
                const imageSrc =
                  (variant?.images && variant.images.length > 0 && variant.images[0]) ||
                  (variant?.productId?.imageUrls && variant.productId.imageUrls.length > 0 && variant.productId.imageUrls[0]) ||
                  null;
                return (
                  <div
                    key={item._id}
                    className="border border-gray-200 p-3 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 border border-gray-200 bg-gray-50 overflow-hidden">
                      {imageSrc ? (
                        <img src={imageSrc} alt={variant?.sku || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {variant?.productId?.title || 'Product'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {optionSummary}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {variant?.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No products added to final sale yet.
            </p>
          )}
          </div>
        </SettingsPanel>

        <p className="text-xs text-gray-600">
          Learn more about <a href="#" className="text-blue-600 hover:underline">return rules</a>
        </p>
      </div>
    </div>
  );
};

export default ManageReturnRules;
