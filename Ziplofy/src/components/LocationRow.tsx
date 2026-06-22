import React, { useCallback } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import LocationDefaultBadge from './locations/LocationDefaultBadge';
import LocationStatusBadge from './locations/LocationStatusBadge';
import {
  formatLocationAddress,
  locationTableCellClass,
  locationTableCellRightClass,
} from './locations/location-ui.util';

interface LocationRowProps {
  location: {
    _id: string;
    name: string;
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryRegion?: string;
    isActive: boolean;
  };
  isDefault: boolean;
  onLocationClick: (locationId: string) => void;
}

const LocationRow: React.FC<LocationRowProps> = ({ location, isDefault, onLocationClick }) => {
  const handleClick = useCallback(() => {
    onLocationClick(location._id);
  }, [location._id, onLocationClick]);

  const addressLine = formatLocationAddress(location);

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/60"
    >
      <td className={`${locationTableCellClass} font-medium text-gray-900`}>
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate">{location.name}</span>
              {isDefault ? <LocationDefaultBadge /> : null}
            </div>
            {addressLine ? (
              <p className="mt-0.5 truncate text-[12px] font-normal text-gray-500">{addressLine}</p>
            ) : (
              <p className="mt-0.5 text-[12px] font-normal italic text-gray-400">No address on file</p>
            )}
          </div>
        </div>
      </td>
      <td className={locationTableCellRightClass}>
        <div className="flex items-center justify-end gap-2">
          <LocationStatusBadge isActive={location.isActive} />
          <ChevronRightIcon className="h-4 w-4 text-gray-400" aria-hidden />
        </div>
      </td>
    </tr>
  );
};

export default LocationRow;
