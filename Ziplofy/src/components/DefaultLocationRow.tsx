import React, { useCallback } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useStore } from '../contexts/store.context';
import LocationDefaultBadge from './locations/LocationDefaultBadge';
import DefaultLocationChangeButton from './DefaultLocationChangeButton';

interface DefaultLocationRowProps {
  name: string;
  addressLine: string;
  locations: Array<{
    _id: string;
    name: string;
    address?: string;
    apartment?: string;
    city?: string;
  }>;
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
          <MapPinIcon className="h-4 w-4 text-gray-500" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-medium text-gray-900">{name}</p>
            <LocationDefaultBadge />
          </div>
          {addressLine ? (
            <p className="mt-0.5 text-[13px] font-normal text-gray-500">{addressLine}</p>
          ) : (
            <p className="mt-0.5 text-[13px] font-normal italic text-gray-400">No address saved</p>
          )}
        </div>
      </div>
      <DefaultLocationChangeButton otherLocations={otherLocations} onSelect={handleSelect} />
    </div>
  );
};

export default DefaultLocationRow;
