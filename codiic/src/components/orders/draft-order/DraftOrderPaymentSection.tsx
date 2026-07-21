import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import DraftOrderCard from './DraftOrderCard';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type DraftOrderPaymentSectionProps = {
  hasProducts: boolean;
  subtotal?: number;
  total?: number;
};

const DraftOrderPaymentSection: React.FC<DraftOrderPaymentSectionProps> = ({
  hasProducts,
  subtotal = 0,
  total = 0,
}) => {
  return (
    <DraftOrderCard title="Payment" bodyClassName="px-4 py-4">
      <div className="rounded-lg border border-gray-200 px-4 py-3">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[13px]">
            <button type="button" className="text-gray-700 hover:text-gray-900">
              Add discount
            </button>
            <div className="flex items-center gap-6 text-gray-500">
              <span>—</span>
              <span className="w-16 text-right font-medium text-gray-900">{formatCurrency(0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-[13px]">
            <button type="button" className="text-gray-700 hover:text-gray-900">
              Add shipping or delivery
            </button>
            <div className="flex items-center gap-6 text-gray-500">
              <span>—</span>
              <span className="w-16 text-right font-medium text-gray-900">{formatCurrency(0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="inline-flex items-center gap-1 text-gray-700">
              Estimated tax
              <InformationCircleIcon className="h-4 w-4 text-gray-400" aria-hidden />
            </span>
            <span className="text-gray-500">Not calculated</span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-2.5 text-[13px]">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {!hasProducts ? (
        <p className="mt-3 text-[13px] text-gray-500">
          Add a product to calculate total and view payment options
        </p>
      ) : null}
    </DraftOrderCard>
  );
};

export default DraftOrderPaymentSection;
