import { MagnifyingGlassIcon, RectangleStackIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiSelect from '../components/MultiSelect';
import Select from '../components/Select';
import TransferFormHeader from '../components/transfers/TransferFormHeader';
import {
  TRANSFER_FORM_APPEARANCE,
  transferInputClass,
  transferPrimaryButtonClass,
  transferSecondaryButtonClass,
  transferTableCellClass,
  transferTableCellRightClass,
  transferTableHeadClass,
  transferTableHeadRightClass,
} from '../components/transfers/transfer-ui.util';
import {
  productFormAsideStackClass,
  productFormCardClass,
  productFormGridClass,
  productFormInputClass,
  productFormLabelClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
import { useLocations } from '../contexts/location.context';
import { useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { useTransferTags } from '../contexts/transfer-tags.context';
import { useTransfers } from '../contexts/transfer.context';

const NewTransferPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const { locations, fetchLocationsByStoreId } = useLocations();
  const { searchProductForTransfer, transferProductSearchResult, loading } = useProducts();
  const { tags: transferTags, fetchByStore: fetchTransferTags } = useTransferTags();
  const { createTransfer, loading: creatingTransfer } = useTransfers();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [dateCreated, setDateCreated] = useState('');
  const [referenceName, setReferenceName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewLines, setReviewLines] = useState<
    Array<{
      variantId: string;
      productTitle: string;
      productSku: string;
      productImage?: string;
      variantLabel: string;
      sku: string;
      originAvailable: number;
    }>
  >([]);
  const [qtyByVariant, setQtyByVariant] = useState<Record<string, number>>({});

  const tagOptions = useMemo(
    () => transferTags.map((tag) => ({ value: tag.name, label: tag.name })),
    [transferTags]
  );
  const originOptions = useMemo(
    () => locations.map((loc) => ({ value: loc._id, label: loc.name })),
    [locations]
  );
  const destinationOptions = useMemo(
    () => locations.map((loc) => ({ value: loc._id, label: loc.name })),
    [locations]
  );
  const canType = useMemo(() => Boolean(origin && destination), [origin, destination]);
  const selectedCount = selectedVariantIds.size;
  const totalUnits = useMemo(
    () => Object.values(qtyByVariant).reduce((sum, qty) => sum + (qty || 0), 0),
    [qtyByVariant]
  );
  const canCreate =
    Boolean(origin && destination) &&
    Object.values(qtyByVariant).some((qty) => (qty || 0) > 0) &&
    !creatingTransfer;

  const originName = locations.find((loc) => loc._id === origin)?.name;
  const destinationName = locations.find((loc) => loc._id === destination)?.name;

  const handleRemoveReviewedVariant = (variantId: string) => {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      next.delete(variantId);
      return next;
    });
    setReviewLines((prev) => prev.filter((line) => line.variantId !== variantId));
    setQtyByVariant((prev) => {
      const { [variantId]: _, ...rest } = prev;
      return rest;
    });
  };

  useEffect(() => {
    if (activeStoreId) fetchLocationsByStoreId(activeStoreId);
  }, [activeStoreId, fetchLocationsByStoreId]);

  useEffect(() => {
    if (activeStoreId) fetchTransferTags(activeStoreId);
  }, [activeStoreId, fetchTransferTags]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 450);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const canSearch = !!activeStoreId && !!origin && !!destination && debounced.length > 0;
    if (!canSearch) return;
    void searchProductForTransfer({
      storeId: String(activeStoreId),
      q: debounced,
      originLocationId: origin,
      destinationLocationId: destination,
      page: 1,
      limit: 20,
    }).catch(() => {});
  }, [debounced, origin, destination, activeStoreId, searchProductForTransfer]);

  const toggleVariant = (variantId: string) => {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  const handleAddSelectedToReview = () => {
    const lines: typeof reviewLines = [];
    transferProductSearchResult.forEach((row) => {
      const productImage = row.product.imageUrls?.[0];
      row.variants.forEach((variant) => {
        if (!selectedVariantIds.has(variant._id)) return;
        const label = Object.values(variant.optionValues || {})
          .map((value) => String(value))
          .join(' / ');
        lines.push({
          variantId: variant._id,
          productTitle: row.product.title,
          productSku: row.product.sku,
          productImage,
          variantLabel: label || 'Default',
          sku: variant.sku,
          originAvailable: variant.availability?.origin ?? 0,
        });
      });
    });
    setReviewLines(lines);
    const initQty: Record<string, number> = {};
    lines.forEach((line) => {
      initQty[line.variantId] = initQty[line.variantId] ?? 0;
    });
    setQtyByVariant(initQty);
    setShowReview(true);
  };

  const handleCreateTransfer = async () => {
    const entries = Object.entries(qtyByVariant)
      .filter(([, qty]) => (qty || 0) > 0)
      .map(([variantId, quantity]) => ({ variantId, quantity }));
    if (!activeStoreId || !origin || !destination || entries.length === 0) return;

    const tagIds = selectedTags
      .map((name) => transferTags.find((tag) => tag.name === name)?._id)
      .filter(Boolean) as string[];

    try {
      await createTransfer({
        storeId: String(activeStoreId),
        originLocationId: origin,
        destinationLocationId: destination,
        referenceName,
        note: notes,
        tags: tagIds,
        transferDate: dateCreated || undefined,
        entries,
      });
      navigate('/products/transfers');
    } catch {
      // handled in context
    }
  };

  return (
    <div className={productFormPageClass(TRANSFER_FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1000px] py-4">
        <TransferFormHeader
          title="Create transfer"
          backLabel="Back to transfers"
          onBack={() => navigate('/products/transfers')}
          onCancel={() => navigate('/products/transfers')}
          onSubmit={() => void handleCreateTransfer()}
          submitLabel={creatingTransfer ? 'Creating…' : 'Create transfer'}
          submitDisabled={!canCreate}
        />

        <div className={productFormGridClass(TRANSFER_FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(TRANSFER_FORM_APPEARANCE)}>
            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>
                Origin and destination
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select
                  label="Origin location"
                  value={origin}
                  options={originOptions}
                  onChange={(value) => {
                    if (value !== destination) setOrigin(value);
                  }}
                  placeholder="Select origin location"
                />
                <Select
                  label="Destination location"
                  value={destination}
                  options={destinationOptions}
                  onChange={(value) => {
                    if (value !== origin) setDestination(value);
                  }}
                  placeholder="Select destination location"
                />
              </div>
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Products</h2>
              <div className="relative mt-3">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder={
                    canType
                      ? 'Search products by title or SKU'
                      : 'Select origin and destination to start searching'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!canType}
                  className={`${productFormInputClass(TRANSFER_FORM_APPEARANCE)} pl-9 disabled:cursor-not-allowed disabled:bg-gray-50`}
                />
              </div>

              {canType ? (
                <div className="mt-4 space-y-4">
                  {transferProductSearchResult.map((row) => {
                    const firstImage = row.product.imageUrls?.[0];
                    return (
                      <div key={row.product._id} className="overflow-hidden rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/40 px-3 py-2.5">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            {firstImage ? (
                              <img src={firstImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-gray-900">{row.product.title}</p>
                            <p className="text-[12px] text-gray-500">SKU: {row.product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[520px] text-left">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="w-10 px-3 py-2" />
                                <th className={transferTableHeadClass}>Variant</th>
                                <th className={transferTableHeadRightClass}>At origin</th>
                                <th className={transferTableHeadRightClass}>At destination</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.variants.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className={`${transferTableCellClass} py-6 text-center text-gray-500`}>
                                    No variants available
                                  </td>
                                </tr>
                              ) : (
                                row.variants.map((variant) => {
                                  const variantLabel = Object.values(variant.optionValues || {})
                                    .map((value) => String(value))
                                    .join(' / ');
                                  return (
                                    <tr key={variant._id} className="border-b border-gray-100 hover:bg-gray-50/60">
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedVariantIds.has(variant._id)}
                                          onChange={() => toggleVariant(variant._id)}
                                          className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
                                        />
                                      </td>
                                      <td className={transferTableCellClass}>{variantLabel || 'Default'}</td>
                                      <td className={transferTableCellRightClass}>
                                        {variant.availability?.origin ?? 0}
                                      </td>
                                      <td className={transferTableCellRightClass}>
                                        {variant.availability?.destination ?? 0}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {loading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
                    </div>
                  ) : null}

                  {!loading && debounced && transferProductSearchResult.length === 0 ? (
                    <p className="py-4 text-center text-[13px] text-gray-500">No products found</p>
                  ) : null}

                  {transferProductSearchResult.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2.5">
                      <p className="text-[13px] text-gray-500">
                        {selectedCount} variant{selectedCount === 1 ? '' : 's'} selected
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedVariantIds(new Set())}
                          className={transferSecondaryButtonClass}
                        >
                          Clear selection
                        </button>
                        <button
                          type="button"
                          disabled={selectedCount === 0}
                          onClick={handleAddSelectedToReview}
                          className={transferPrimaryButtonClass}
                        >
                          Add to transfer
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            {showReview ? (
              <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
                <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Selected variants</h2>
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className={transferTableHeadClass}>Product</th>
                          <th className={transferTableHeadClass}>SKU</th>
                          <th className={transferTableHeadRightClass}>At origin</th>
                          <th className={transferTableHeadRightClass}>Transfer qty</th>
                          <th className="w-10 px-3 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {reviewLines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className={`${transferTableCellClass} py-8 text-center text-gray-500`}>
                              No variants selected
                            </td>
                          </tr>
                        ) : (
                          reviewLines.map((line) => (
                            <tr key={line.variantId} className="border-b border-gray-100">
                              <td className={transferTableCellClass}>
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                    {line.productImage ? (
                                      <img src={line.productImage} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                        <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-[13px] font-medium text-gray-900">{line.productTitle}</p>
                                    <p className="truncate text-[12px] text-gray-500">{line.variantLabel}</p>
                                  </div>
                                </div>
                              </td>
                              <td className={transferTableCellClass}>{line.sku || 'No SKU'}</td>
                              <td className={transferTableCellRightClass}>{line.originAvailable}</td>
                              <td className={transferTableCellRightClass}>
                                <input
                                  type="number"
                                  min={0}
                                  max={line.originAvailable}
                                  value={qtyByVariant[line.variantId] ?? 0}
                                  onChange={(e) => {
                                    const next = Math.max(
                                      0,
                                      Math.min(Number(e.target.value || 0), line.originAvailable)
                                    );
                                    setQtyByVariant((prev) => ({ ...prev, [line.variantId]: next }));
                                  }}
                                  className={`${transferInputClass} w-24 text-right`}
                                />
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReviewedVariant(line.variantId)}
                                  className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                  aria-label="Remove variant"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ) : null}

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Notes</h2>
              <textarea
                rows={4}
                placeholder="Add any notes for this transfer…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${productFormInputClass(TRANSFER_FORM_APPEARANCE)} mt-3 resize-y`}
              />
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Transfer details</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)} htmlFor="transfer-date">
                    Transfer date
                  </label>
                  <input
                    id="transfer-date"
                    type="date"
                    value={dateCreated}
                    onChange={(e) => setDateCreated(e.target.value)}
                    className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
                  />
                </div>
                <div>
                  <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)} htmlFor="transfer-reference">
                    Reference name
                  </label>
                  <input
                    id="transfer-reference"
                    type="text"
                    placeholder="Optional reference name"
                    value={referenceName}
                    onChange={(e) => setReferenceName(e.target.value)}
                    className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
                  />
                </div>
              </div>
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Tags</h2>
              <div className="mt-3">
                <MultiSelect
                  label="Select tags"
                  value={selectedTags}
                  options={tagOptions}
                  onChange={setSelectedTags}
                  placeholder="No tags"
                />
              </div>
            </section>
          </div>

          <aside className={productFormAsideStackClass(TRANSFER_FORM_APPEARANCE)}>
            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Summary</h2>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Origin</span>
                  <span className="font-medium text-gray-900">{originName || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Destination</span>
                  <span className="font-medium text-gray-900">{destinationName || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Variants</span>
                  <span className="font-medium text-gray-900">{reviewLines.length}</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-gray-900">Total units</span>
                    <span className="text-[15px] font-semibold text-gray-900">{totalUnits}</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewTransferPage;
