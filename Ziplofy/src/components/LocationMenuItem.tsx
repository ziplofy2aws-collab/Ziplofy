import React from 'react';
import DropdownMenuItem from './DropdownMenuItem';

interface LocationMenuItemProps {
  location: {
    _id: string;
    name: string;
    address?: string;
    apartment?: string;
    city?: string;
  };
  onSelect: (locationId: string) => void;
}

const LocationMenuItem: React.FC<LocationMenuItemProps> = ({ location, onSelect }) => {
  const addressLine = [location.address, location.apartment, location.city]
    .filter(Boolean)
    .join(', ');

  return (
    <DropdownMenuItem onClick={() => onSelect(location._id)}>
      <div>
        <p className="text-sm font-semibold text-gray-900">{location.name}</p>
        <p className="text-xs text-gray-500">{addressLine}</p>
      </div>
    </DropdownMenuItem>
  );
};

export default LocationMenuItem;

