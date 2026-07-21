import React from 'react';

interface CatalogPricingSectionProps {
  currencies: { _id: string; code: string; symbol?: string; name: string }[];
  currencyId: string;
  loading?: boolean;
  onCurrencyChange: (value: string) => void;
  priceAdjustment: number;
  onPriceAdjustmentChange: (value: number) => void;
  adjustDirection: 'decrease' | 'increase';
  onAdjustDirectionChange: (value: 'decrease' | 'increase') => void;
  includeCompareAt: boolean;
  onIncludeCompareAtChange: (value: boolean) => void;
}

export default function CatalogPricingSection({
  currencies,
  currencyId,
  loading = false,
  onCurrencyChange,
  priceAdjustment,
  onPriceAdjustmentChange,
  adjustDirection,
  onAdjustDirectionChange,
  includeCompareAt,
  onIncludeCompareAtChange,
}: CatalogPricingSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Pricing</h2>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <span className="text-sm text-gray-600">Set prices in</span>
        <select
          value={currencyId}
          onChange={(e) => onCurrencyChange(e.target.value)}
          disabled={loading}
          className="w-full sm:w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        >
          {currencies.map((c) => (
            <option key={c._id} value={c._id}>
              {`${c.code}${c.symbol ? ` (${c.symbol})` : ''} — ${c.name}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <span className="text-sm font-medium text-gray-700 md:w-36">Price adjustment</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceAdjustment}
            onChange={(e) => onPriceAdjustmentChange(Number(e.target.value))}
            className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
          />
          <span className="text-sm text-gray-700">%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjustDirectionChange('decrease')}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              adjustDirection === 'decrease'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Decrease
          </button>
          <button
            type="button"
            onClick={() => onAdjustDirectionChange('increase')}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              adjustDirection === 'increase'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Increase
          </button>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={includeCompareAt}
            onChange={(e) => onIncludeCompareAtChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
          />
          Include compare-at price
        </label>
      </div>
    </div>
  );
}

