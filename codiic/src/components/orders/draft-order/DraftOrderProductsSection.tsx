import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';
import DraftOrderCard from './DraftOrderCard';

type DraftOrderProductsSectionProps = {
  onAddProduct?: () => void;
  onAddCustomItem?: () => void;
};

const DraftOrderProductsSection: React.FC<DraftOrderProductsSectionProps> = ({
  onAddProduct,
  onAddCustomItem,
}) => {
  return (
    <DraftOrderCard
      title="Products"
      headerAction={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden />
            Add product
          </button>
          <button
            type="button"
            onClick={onAddCustomItem}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden />
            Add custom item
          </button>
        </div>
      }
      bodyClassName="min-h-[88px] px-4 py-4"
    >
      <p className="text-[13px] text-gray-400">&nbsp;</p>
    </DraftOrderCard>
  );
};

export default DraftOrderProductsSection;
