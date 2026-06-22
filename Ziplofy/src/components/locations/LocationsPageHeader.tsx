import { MapPinIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { locationPrimaryButtonClass } from './location-ui.util';

interface LocationsPageHeaderProps {
  onAddLocation: () => void;
}

const LocationsPageHeader: React.FC<LocationsPageHeaderProps> = ({ onAddLocation }) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
          <h1 className="text-lg font-semibold text-gray-900">Locations</h1>
        </div>
        <p className="mt-1 pl-7 text-[13px] font-normal text-gray-500">
          Manage where you stock inventory, fulfill orders, and offer pickup or local delivery.
        </p>
      </div>

      <button type="button" onClick={onAddLocation} className={locationPrimaryButtonClass}>
        Add location
      </button>
    </div>
  );
};

export default LocationsPageHeader;
