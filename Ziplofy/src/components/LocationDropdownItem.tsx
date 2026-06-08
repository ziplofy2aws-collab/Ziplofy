import React, { useCallback } from 'react';
import DropdownMenuItem from './DropdownMenuItem';

interface LocationDropdownItemProps {
  location: {
    _id: string;
    name: string;
    address?: string;
    apartment?: string;
    city?: string;
  };
  onSelect: (locationId: string) => void;
}

const LocationDropdownItem: React.FC<LocationDropdownItemProps> = ({ location, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(location._id);
  }, [location._id, onSelect]);

  const addressLine = [location.address, location.apartment, location.city]
    .filter(Boolean)
    .join(', ');

  return (
    <DropdownMenuItem onClick={handleClick}>
      <div>
        <p className="text-sm font-semibold text-gray-900">{location.name}</p>
        <p className="text-xs text-gray-500">{addressLine}</p>
      </div>
    </DropdownMenuItem>
  );
};

export default LocationDropdownItem;

