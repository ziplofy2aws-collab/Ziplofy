import React, { useCallback } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useStore } from '../contexts/store.context';
import DefaultLocationChangeButton from './DefaultLocationChangeButton';

interface DefaultLocationRowProps {
  name: string;
  addressLine: string;
  locations: any[];
  currentStoreId: string;
  defaultLocationId: string;
}

const DefaultLocationRow: React.FC<DefaultLocationRowProps> = ({
  name,
  addressLine,
  locations,
  currentStoreId,
  defaultLocationId,
}) => {
  const { updateStore } = useStore();

  const handleSelect = useCallback(
    async (locId: string) => {
      if (locId === defaultLocationId) return;
      try {
        await updateStore(currentStoreId, { defaultLocation: locId });
      } catch (error) {
        console.error('Failed to update default location:', error);
      }
    },
    [defaultLocationId, currentStoreId, updateStore]
  );

  const otherLocations = locations.filter((l) => l._id !== defaultLocationId);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-secondary text-admin-text">
          <MapPinIcon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-admin-text">{name}</p>
          {addressLine ? (
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">{addressLine}</p>
          ) : (
            <p className="mt-0.5 text-[13px] italic text-admin-text-subdued">
              No address saved for this location
            </p>
          )}
        </div>
      </div>
      <DefaultLocationChangeButton otherLocations={otherLocations} onSelect={handleSelect} />
    </div>
  );
};

export default DefaultLocationRow;
