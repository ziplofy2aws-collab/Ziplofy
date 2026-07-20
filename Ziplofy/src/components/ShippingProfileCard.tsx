import React from 'react';
import { ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';

interface ShippingProfileCardProps {
  profileId: string;
  profileName: string;
  onClick: () => void;
}

const ShippingProfileCard: React.FC<ShippingProfileCardProps> = ({
  profileId,
  profileName,
  onClick,
}) => {
  return (
    <div
      key={profileId}
      onClick={onClick}
      className="p-3 mb-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
    >
      <div className="flex items-center gap-3 flex-1">
        <TagIcon className="w-4 h-4 text-gray-500" />
        <p className="text-sm font-medium text-gray-900">{profileName}</p>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
    </div>
  );
};

export default ShippingProfileCard;

