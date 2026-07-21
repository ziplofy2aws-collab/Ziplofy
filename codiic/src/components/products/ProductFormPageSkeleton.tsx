import React from 'react';
import { productFormPageClass } from './product-form-appearance';

const ProductFormPageSkeleton: React.FC = () => {
  return (
    <div className={productFormPageClass('minimal')} aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1500px] animate-pulse px-3 py-4 sm:px-4">
        <div className="mb-4 h-4 w-28 rounded bg-gray-200" />
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-100" />
          </div>
          <div className="h-9 w-16 rounded-md bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200/60 bg-white p-5">
                <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
                <div className="space-y-3">
                  <div className="h-10 rounded-md bg-gray-100" />
                  <div className="h-10 rounded-md bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200/60 bg-white p-5">
              <div className="mb-3 h-4 w-20 rounded bg-gray-200" />
              <div className="h-16 rounded-md bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPageSkeleton;
