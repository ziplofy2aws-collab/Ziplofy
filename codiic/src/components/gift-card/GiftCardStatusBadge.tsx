import React from 'react';

type GiftCardStatusBadgeProps = {
  isActive: boolean;
};

const GiftCardStatusBadge: React.FC<GiftCardStatusBadgeProps> = ({ isActive }) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default GiftCardStatusBadge;
