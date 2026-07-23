import React, { useCallback } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormInputClass,
  productFormSectionTitleClass,
} from "./product-form-appearance";

interface ProductStatusSectionProps {
  status: "draft" | "active";
  onChange: (status: "draft" | "active") => void;
  appearance?: ProductFormAppearance;
}

const ProductStatusSection: React.FC<ProductStatusSectionProps> = ({
  status,
  onChange,
  appearance = 'default',
}) => {
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as "draft" | "active");
  }, [onChange]);

  const selectClass =
    appearance === 'minimal'
      ? 'w-full appearance-none rounded-md border border-gray-200/70 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200'
      : 'w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400';

  return (
    <div className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>
        {appearance === 'minimal' ? 'Publishing' : 'Status'}
      </h2>
      {appearance === 'minimal' ? (
        <p className="-mt-1 mb-3 text-[12px] leading-snug text-gray-400">
          Choose whether shoppers can buy this now
        </p>
      ) : null}
      <div className="relative">
        <select
          value={status}
          onChange={handleStatusChange}
          className={selectClass}
        >
          <option value="active">
            {appearance === 'minimal' ? 'Active — live on store' : 'Active'}
          </option>
          <option value="draft">
            {appearance === 'minimal' ? 'Draft — hidden for now' : 'Draft'}
          </option>
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {appearance === 'minimal' ? (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-1.5 text-[12px] text-gray-400">Sales channels</p>
          <span className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-0.5 text-xs font-normal text-gray-600">
            Online Store
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default ProductStatusSection;
