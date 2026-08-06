import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import React from 'react';

const AbandonedCartsEmptyState: React.FC = () => {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-admin-secondary">
        <ShoppingCartIcon className="h-7 w-7 text-admin-text-subdued" aria-hidden />
      </div>
      <p className="text-[15px] font-semibold text-admin-text">No abandoned carts</p>
      <p className="mt-1.5 max-w-md text-[13px] text-admin-text-secondary">
        When customers add products but don&apos;t complete checkout, their carts will show up here.
      </p>
    </div>
  );
};

export default AbandonedCartsEmptyState;
