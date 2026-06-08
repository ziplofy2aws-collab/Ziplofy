import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLocations } from '../contexts/location.context';
import { useStore } from '../contexts/store.context';
import { useTransfers } from '../contexts/transfer.context';
import { useNavigate } from 'react-router-dom';
import { useTransferTags } from '../contexts/transfer-tags.context';
import { useProducts } from '../contexts/product.context';
import Select from '../components/Select';
import MultiSelect from '../components/MultiSelect';

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
  const tagOptions = useMemo(() => transferTags.map(t => ({ value: t.name, label: t.name })), [transferTags]);
  const [showReview, setShowReview] = useState(false);
  const [reviewLines, setReviewLines] = useState<Array<{
    variantId: string;
    productTitle: string;
    productSku: string;
    productImage?: string;
    variantLabel: string;
    sku: string;
    originAvailable: number;
  }>>([]);
  const [qtyByVariant, setQtyByVariant] = useState<Record<string, number>>({});

  const handleRemoveReviewedVariant = (variantId: string) => {
    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      next.delete(variantId);
      return next;
    });
    setReviewLines(prev => prev.filter(l => l.variantId !== variantId));
    setQtyByVariant(prev => {
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

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 450);
    return () => clearTimeout(t);
  }, [query]);

  // Trigger search on debounced input, only when origin & destination selected
  useEffect(() => {
    const canSearch = !!activeStoreId && !!origin && !!destination && debounced.length > 0;
    if (!canSearch) return;
    (async () => {
      try {
        await searchProductForTransfer({
          storeId: String(activeStoreId),
          q: debounced,
          originLocationId: origin,
          destinationLocationId: destination,
          page: 1,
          limit: 20,
        });
      } catch {
        // error handled in context
      }
    })();
  }, [debounced, origin, destination, activeStoreId, searchProductForTransfer]);

  const canType = useMemo(() => Boolean(origin && destination), [origin, destination]);
  const selectedCount = selectedVariantIds.size;
  const toggleVariant = (variantId: string) => {
    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId); else next.add(variantId);
      return next;
    });
  };

  const originOptions = useMemo(() => 
    locations.map(loc => ({ value: loc._id, label: loc.name })), 
    [locations]
  );
  const destinationOptions = useMemo(() => 
    locations.map(loc => ({ value: loc._id, label: loc.name })), 
    [locations]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/products/transfers')}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-medium text-gray-900">Create Transfer</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Origin and Destination Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Origin and Destination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Origin Location"
                value={origin}
                options={originOptions}
                onChange={(value) => {
                  if (value === destination) return;
                  setOrigin(value);
                }}
                placeholder="Select origin location"
              />
              <Select
                label="Destination Location"
                value={destination}
                options={destinationOptions}
                onChange={(value) => {
                  if (value === origin) return;
                  setDestination(value);
                }}
                placeholder="Select destination location"
              />
            </div>
          </div>

          {/* Add Products Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Add Products</h2>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder={canType ? 'Search products by title or SKU…' : 'Select origin and destination to start searching'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!canType}
                className="w-full px-3 py-1.5 pl-10 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Results */}
            {canType && (
              <div className="space-y-3 mt-3">
                {transferProductSearchResult.map((row) => {
                  const firstImage = row.product.imageUrls?.[0];
                  return (
                    <div key={row.product._id} className="border border-gray-200 p-3">
                      {/* Product header */}
                      <div className="flex items-center gap-2 mb-3">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={row.product.title}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{row.product.title}</p>
                          <p className="text-xs text-gray-600 font-mono">SKU: {row.product.sku}</p>
                        </div>
                      </div>

                      {/* Per-product variants table */}
                      <div className="border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-3 py-2 w-12"></th>
                              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900">Variant</th>
                              <th className="px-3 py-2 text-right text-sm font-medium text-gray-900">Available at Origin</th>
                              <th className="px-3 py-2 text-right text-sm font-medium text-gray-900">Available at Destination</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {row.variants.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-600">
                                  No variants available
                                </td>
                              </tr>
                            )}
                            {row.variants.map((v) => {
                              const variantLabel = Object.entries(v.optionValues || {})
                                .map(([_, val]) => String(val))
                                .join(' / ');
                              return (
                                <tr key={v._id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedVariantIds.has(v._id)}
                                      onChange={() => toggleVariant(v._id)}
                                      className="w-4 h-4 text-gray-900 border-gray-200 focus:ring-gray-400"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <p className="text-sm text-gray-900">{variantLabel || 'Default'}</p>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <p className={`text-sm font-medium ${(v.availability?.origin ?? 0) > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                                      {v.availability?.origin ?? 0}
                                    </p>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <p className={`text-sm font-medium ${(v.availability?.destination ?? 0) > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                                      {v.availability?.destination ?? 0}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full w-4 h-4 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
                  </div>
                )}
                {!loading && canType && debounced && transferProductSearchResult.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No products found matching your search.</p>
                  </div>
                )}

                {/* Footer actions */}
                {transferProductSearchResult.length > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200">
                    <p className="text-sm text-gray-600">
                      {selectedCount} variant{selectedCount === 1 ? '' : 's'} selected
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedVariantIds(new Set())}
                        className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Clear Selection
                      </button>
                      <button
                        disabled={selectedCount === 0}
                        onClick={() => {
                          const lines: Array<{ variantId: string; productTitle: string; productSku: string; productImage?: string; variantLabel: string; sku: string; originAvailable: number; }> = [];
                          transferProductSearchResult.forEach(row => {
                            const productImage = row.product.imageUrls?.[0];
                            row.variants.forEach(v => {
                              if (!selectedVariantIds.has(v._id)) return;
                              const label = Object.entries(v.optionValues || {})
                                .map(([_, val]) => String(val))
                                .join(' / ');
                              lines.push({
                                variantId: v._id,
                                productTitle: row.product.title,
                                productSku: row.product.sku,
                                productImage,
                                variantLabel: label || 'Default',
                                sku: v.sku,
                                originAvailable: v.availability?.origin ?? 0,
                              });
                            });
                          });
                          setReviewLines(lines);
                          const initQty: Record<string, number> = {};
                          lines.forEach(l => { initQty[l.variantId] = initQty[l.variantId] ?? 0; });
                          setQtyByVariant(initQty);
                          setShowReview(true);
                        }}
                        className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Add {selectedCount || 0} Variant{selectedCount === 1 ? '' : 's'} to Transfer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review Selected Variants */}
          {showReview && (
            <div className="border border-gray-200 p-4 bg-white/95">
              <h2 className="text-base font-medium text-gray-900 mb-3">Selected Variants</h2>
              <div className="border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">SKU</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Available at Origin</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Transfer Quantity</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviewLines.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-600">
                          No variants selected.
                        </td>
                      </tr>
                    )}
                    {reviewLines.map(line => (
                      <tr key={line.variantId} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {line.productImage ? (
                              <img
                                src={line.productImage}
                                alt={line.productTitle}
                                className="w-10 h-10 object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{line.productTitle}</p>
                              <p className="text-xs text-gray-600">{line.variantLabel}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <p className="text-sm text-gray-900 font-mono">{line.sku}</p>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <p className={`text-sm font-medium ${line.originAvailable > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                            {line.originAvailable}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            max={line.originAvailable}
                            value={qtyByVariant[line.variantId] ?? 0}
                            onChange={(e) => {
                              const n = Math.max(0, Math.min(Number(e.target.value || 0), line.originAvailable));
                              setQtyByVariant(prev => ({ ...prev, [line.variantId]: n }));
                            }}
                            className="w-24 px-2 py-1 text-sm border border-gray-200 text-right focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleRemoveReviewedVariant(line.variantId)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Notes</h2>
            <textarea
              rows={4}
              placeholder="Add any notes for this transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-y"
            />
          </div>

          {/* Transfer Details Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Transfer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Transfer Date</label>
                <input
                  type="date"
                  value={dateCreated}
                  onChange={(e) => setDateCreated(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Reference Name</label>
                <input
                  type="text"
                  placeholder="Optional reference name"
                  value={referenceName}
                  onChange={(e) => setReferenceName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Tags</h2>
            <MultiSelect
              label="Select Tags"
              value={selectedTags}
              options={tagOptions}
              onChange={setSelectedTags}
              placeholder="No tags"
            />
          </div>

          {/* Create Transfer Action */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              disabled={!origin || !destination || Object.values(qtyByVariant).every(q => (q || 0) <= 0) || creatingTransfer}
              onClick={async () => {
                const entries = Object.entries(qtyByVariant)
                  .filter(([, qty]) => (qty || 0) > 0)
                  .map(([variantId, quantity]) => ({ variantId, quantity }));
                if (!activeStoreId || !origin || !destination || entries.length === 0) return;
                // map selected tag names to ids
                const tagIds = selectedTags.map(name => transferTags.find(t => t.name === name)?._id).filter(Boolean) as string[];
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
                } catch {}
              }}
              className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {creatingTransfer ? 'Creating Transfer…' : 'Create Transfer'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default NewTransferPage;
