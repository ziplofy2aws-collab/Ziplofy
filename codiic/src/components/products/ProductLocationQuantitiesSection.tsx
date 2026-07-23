import { PencilSquareIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect } from 'react';
import type { Location } from '../../contexts/location.context';
import { useLocations } from '../../contexts/location.context';
import {
  type ProductFormAppearance,
  productFormCardClass,
} from './product-form-appearance';

type ProductLocationQuantitiesSectionProps = {
  activeStoreId: string | null;
  quantities: Record<string, string>;
  onChange: (locationId: string, quantity: string) => void;
  appearance?: ProductFormAppearance;
};

const ProductLocationQuantitiesSection: React.FC<
  ProductLocationQuantitiesSectionProps
> = ({
  activeStoreId,
  quantities,
  onChange,
  appearance = 'minimal',
}) => {
  const { locations, fetchLocationsByStoreId, loading } = useLocations();

  useEffect(() => {
    if (activeStoreId) {
      void fetchLocationsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchLocationsByStoreId]);

  // Ensure every loaded location has a quantity entry in form state (defaults to 0)
  useEffect(() => {
    if (locations.length === 0) return;
    for (const location of locations) {
      if (quantities[location._id] === undefined) {
        onChange(location._id, '0');
      }
    }
    // Only seed when the location list changes; avoid re-running on each keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, onChange]);

  const handleQuantityChange = useCallback(
    (locationId: string, value: string) => {
      // Allow empty while typing; keep digits only
      if (value === '' || /^\d+$/.test(value)) {
        onChange(locationId, value);
      }
    },
    [onChange]
  );

  const sortedLocations: Location[] = [...locations].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={productFormCardClass(appearance)}>
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold text-gray-800">Quantity</p>
          <PencilSquareIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        </div>
        <p className="text-[12px] font-medium text-gray-500">Quantity</p>
      </div>

      {!activeStoreId ? (
        <p className="py-6 text-center text-[13px] text-gray-400">
          Select a store to set starting inventory.
        </p>
      ) : loading && sortedLocations.length === 0 ? (
        <div className="space-y-0 divide-y divide-gray-100 py-1">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-center justify-between gap-3 py-3">
              <span className="h-3.5 w-32 rounded bg-gray-200" />
              <span className="h-9 w-20 rounded-md bg-gray-100" />
            </div>
          ))}
        </div>
      ) : sortedLocations.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-gray-400">
          No locations yet. Add a location in settings to track inventory.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedLocations.map((location) => (
            <div
              key={location._id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-gray-800">
                  {location.name}
                </p>
                {location.isDefault ? (
                  <p className="text-[11px] text-gray-400">Default location</p>
                ) : null}
              </div>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={quantities[location._id] ?? '0'}
                onChange={(e) => handleQuantityChange(location._id, e.target.value)}
                className="w-20 shrink-0 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-right text-[13px] text-gray-800 tabular-nums transition-colors focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                aria-label={`Quantity at ${location.name}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductLocationQuantitiesSection;
