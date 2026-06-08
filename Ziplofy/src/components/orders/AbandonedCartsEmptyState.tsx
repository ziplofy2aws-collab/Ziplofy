import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import React from 'react';

const AbandonedCartsEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-xl" aria-hidden />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50 shadow-sm">
          <ShoppingCartIcon className="h-10 w-10 text-gray-400" aria-hidden />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No abandoned carts</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        When customers add products but don&apos;t complete checkout, their carts will show up here so you can
        follow up and recover sales.
      </p>
    </div>
  );
};

export default AbandonedCartsEmptyState;
