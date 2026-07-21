import { CheckIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Product } from '../contexts/product.context';

interface ProductPricingProps {
  product: Product;
  onSave: (payload: {
    price: number;
    compareAtPrice?: number;
    cost: number;
    profit: number;
    marginPercent: number;
    unitPriceTotalAmount?: number;
    unitPriceTotalAmountMetric?: string;
    unitPriceBaseMeasure?: number;
    unitPriceBaseMeasureMetric?: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const unitCategories = {
  weight: ['milligram', 'gram', 'kilogram'],
  volume: ['milliliter', 'centiliter', 'liter', 'cubic_meter'],
  size: ['centimeter', 'meter'],
  area: ['square_meter'],
  'per item': ['item'],
};

const formatInr = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductPricing: React.FC<ProductPricingProps> = ({ product, onSave, isSaving }) => {
  const price = product.price != null ? Number(product.price) : 0;
  const cost = product.cost != null ? Number(product.cost) : 0;
  const profit = product.profit != null ? Number(product.profit) : 0;
  const margin = product.marginPercent != null ? Number(product.marginPercent) : 0;
  const [isEditing, setIsEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(String(price));
  const [draftCompareAtPrice, setDraftCompareAtPrice] = useState(
    typeof product.compareAtPrice === 'number' ? String(product.compareAtPrice) : ''
  );
  const [draftCost, setDraftCost] = useState(String(cost));
  const [draftUnitPriceTotalAmount, setDraftUnitPriceTotalAmount] = useState(
    product.unitPriceTotalAmount != null ? String(product.unitPriceTotalAmount) : ''
  );
  const [draftUnitPriceTotalAmountMetric, setDraftUnitPriceTotalAmountMetric] = useState(
    product.unitPriceTotalAmountMetric || ''
  );
  const [draftUnitPriceBaseMeasure, setDraftUnitPriceBaseMeasure] = useState(
    product.unitPriceBaseMeasure != null ? String(product.unitPriceBaseMeasure) : ''
  );
  const [draftUnitPriceBaseMeasureMetric, setDraftUnitPriceBaseMeasureMetric] = useState(
    product.unitPriceBaseMeasureMetric || ''
  );
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setDraftPrice(String(price));
      setDraftCompareAtPrice(typeof product.compareAtPrice === 'number' ? String(product.compareAtPrice) : '');
      setDraftCost(String(cost));
      setDraftUnitPriceTotalAmount(product.unitPriceTotalAmount != null ? String(product.unitPriceTotalAmount) : '');
      setDraftUnitPriceTotalAmountMetric(product.unitPriceTotalAmountMetric || '');
      setDraftUnitPriceBaseMeasure(product.unitPriceBaseMeasure != null ? String(product.unitPriceBaseMeasure) : '');
      setDraftUnitPriceBaseMeasureMetric(product.unitPriceBaseMeasureMetric || '');
    }
  }, [
    isEditing,
    price,
    cost,
    product.compareAtPrice,
    product.unitPriceTotalAmount,
    product.unitPriceTotalAmountMetric,
    product.unitPriceBaseMeasure,
    product.unitPriceBaseMeasureMetric,
  ]);

  const parsedPrice = Number(draftPrice || 0);
  const parsedCost = Number(draftCost || 0);
  const parsedCompareAtPrice = draftCompareAtPrice.trim() === '' ? undefined : Number(draftCompareAtPrice);
  const parsedUnitPriceTotalAmount =
    draftUnitPriceTotalAmount.trim() === '' ? undefined : Number(draftUnitPriceTotalAmount);
  const parsedUnitPriceBaseMeasure =
    draftUnitPriceBaseMeasure.trim() === '' ? undefined : Number(draftUnitPriceBaseMeasure);
  const computedProfit = parsedPrice - parsedCost;
  const computedMarginPercent = parsedPrice > 0 ? (computedProfit / parsedPrice) * 100 : 0;

  const startEditing = () => {
    setEditError('');
    setDraftPrice(String(price));
    setDraftCompareAtPrice(typeof product.compareAtPrice === 'number' ? String(product.compareAtPrice) : '');
    setDraftCost(String(cost));
    setDraftUnitPriceTotalAmount(product.unitPriceTotalAmount != null ? String(product.unitPriceTotalAmount) : '');
    setDraftUnitPriceTotalAmountMetric(product.unitPriceTotalAmountMetric || '');
    setDraftUnitPriceBaseMeasure(product.unitPriceBaseMeasure != null ? String(product.unitPriceBaseMeasure) : '');
    setDraftUnitPriceBaseMeasureMetric(product.unitPriceBaseMeasureMetric || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setEditError('Price must be a valid non-negative number');
      return;
    }
    if (Number.isNaN(parsedCost) || parsedCost < 0) {
      setEditError('Cost must be a valid non-negative number');
      return;
    }
    if (parsedCompareAtPrice !== undefined && (Number.isNaN(parsedCompareAtPrice) || parsedCompareAtPrice < 0)) {
      setEditError('Compare at must be a valid non-negative number');
      return;
    }
    if (parsedUnitPriceTotalAmount !== undefined && (Number.isNaN(parsedUnitPriceTotalAmount) || parsedUnitPriceTotalAmount < 0)) {
      setEditError('Unit total amount must be a valid non-negative number');
      return;
    }
    if (parsedUnitPriceBaseMeasure !== undefined && (Number.isNaN(parsedUnitPriceBaseMeasure) || parsedUnitPriceBaseMeasure < 0)) {
      setEditError('Unit base measure must be a valid non-negative number');
      return;
    }
    if (parsedUnitPriceTotalAmount !== undefined && !draftUnitPriceTotalAmountMetric) {
      setEditError('Please select total unit for unit price');
      return;
    }
    if (parsedUnitPriceBaseMeasure !== undefined && !draftUnitPriceBaseMeasureMetric) {
      setEditError('Please select base unit for unit price');
      return;
    }

    await onSave({
      price: parsedPrice,
      compareAtPrice: parsedCompareAtPrice,
      cost: parsedCost,
      profit: computedProfit,
      marginPercent: Number.isFinite(computedMarginPercent) ? computedMarginPercent : 0,
      unitPriceTotalAmount: parsedUnitPriceTotalAmount,
      unitPriceTotalAmountMetric: draftUnitPriceTotalAmountMetric || undefined,
      unitPriceBaseMeasure: parsedUnitPriceBaseMeasure,
      unitPriceBaseMeasureMetric: draftUnitPriceBaseMeasureMetric || undefined,
    });

    setEditError('');
    setIsEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Pricing</h2>
            <p className="mt-0.5 text-xs text-gray-500">Price, cost, and margin</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" aria-hidden />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Price</p>
          {isEditing ? (
            <input
              type="number"
              min="0"
              step="0.01"
              value={draftPrice}
              onChange={(e) => setDraftPrice(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm font-semibold text-blue-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          ) : (
            <p className="mt-1 text-lg font-bold tabular-nums text-blue-800">{formatInr(price)}</p>
          )}
        </div>
        {isEditing || typeof product.compareAtPrice === 'number' ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Compare at</p>
            {isEditing ? (
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftCompareAtPrice}
                onChange={(e) => setDraftCompareAtPrice(e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm font-semibold text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="Optional"
              />
            ) : (
              <p className="mt-1 text-sm font-semibold tabular-nums text-gray-900">
                {formatInr(product.compareAtPrice || 0)}
              </p>
            )}
          </div>
        ) : null}
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Cost</p>
          {isEditing ? (
            <input
              type="number"
              min="0"
              step="0.01"
              value={draftCost}
              onChange={(e) => setDraftCost(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm font-semibold text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          ) : (
            <p className="mt-1 text-sm font-semibold tabular-nums text-gray-900">{formatInr(cost)}</p>
          )}
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Profit</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-900">
            {formatInr(isEditing ? computedProfit : profit)}{' '}
            <span className="text-xs font-normal text-gray-600">
              ({(isEditing ? computedMarginPercent : margin).toFixed(1)}% margin)
            </span>
          </p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Unit price</p>
          {isEditing ? (
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftUnitPriceTotalAmount}
                  onChange={(e) => setDraftUnitPriceTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <select
                  value={draftUnitPriceTotalAmountMetric}
                  onChange={(e) => {
                    setDraftUnitPriceTotalAmountMetric(e.target.value);
                    setDraftUnitPriceBaseMeasureMetric('');
                  }}
                  className="min-w-[150px] rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  <option value="">Select unit</option>
                  {Object.entries(unitCategories).map(([category, units]) => (
                    <optgroup key={category} label={category}>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftUnitPriceBaseMeasure}
                  onChange={(e) => setDraftUnitPriceBaseMeasure(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <select
                  value={draftUnitPriceBaseMeasureMetric}
                  onChange={(e) => setDraftUnitPriceBaseMeasureMetric(e.target.value)}
                  disabled={!draftUnitPriceTotalAmountMetric}
                  className="min-w-[180px] rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {!draftUnitPriceTotalAmountMetric ? 'Select total unit first' : 'Select base unit'}
                  </option>
                  {(Object.values(unitCategories).find((units) =>
                    units.includes(draftUnitPriceTotalAmountMetric)
                  ) || []).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {product.unitPriceTotalAmount && product.unitPriceTotalAmountMetric
                ? `₹${product.unitPriceTotalAmount.toFixed(2)} / ${product.unitPriceTotalAmountMetric}`
                : '—'}
              {product.unitPriceBaseMeasure && product.unitPriceBaseMeasureMetric
                ? `   |   ₹${product.unitPriceBaseMeasure.toFixed(2)} / ${product.unitPriceBaseMeasureMetric}`
                : ''}
            </p>
          )}
        </div>
      </div>
      {isEditing && editError ? (
        <p className="px-5 pb-4 text-xs font-medium text-red-600">{editError}</p>
      ) : null}
    </div>
  );
};

export default ProductPricing;
