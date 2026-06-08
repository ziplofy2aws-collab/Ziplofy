import React from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';

interface AdjustmentRow {
  type: string;
  amount: number;
}

interface CostSummarySectionProps {
  itemsCount: number;
  subtotal: number;
  taxAmount: number;
  adjustmentsTotal: number;
  adjustmentsRows: AdjustmentRow[];
  shippingCost: number;
  total: number;
  onManageClick: () => void;
  onCancel: () => void;
  onCreatePurchaseOrder: () => void;
  creatingPO: boolean;
  canCreate: boolean;
}

const CostSummarySection: React.FC<CostSummarySectionProps> = ({
  itemsCount,
  subtotal,
  taxAmount,
  adjustmentsTotal,
  adjustmentsRows,
  shippingCost,
  total,
  onManageClick,
  onCancel,
  onCreatePurchaseOrder,
  creatingPO,
  canCreate,
}) => {
  return (
    <div className="border border-gray-200 p-4 mb-24 bg-white/95">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-gray-900">Cost summary</h2>
        <button
          onClick={onManageClick}
          className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Manage
        </button>
      </div>
      <div className="space-y-1 text-sm">
        <div className="text-sm text-gray-900">Items: <span className="font-medium">{itemsCount}</span></div>
        <div className="text-sm text-gray-900">Subtotal: <span className="font-medium">{subtotal.toFixed(2)}</span></div>
        <div className="text-sm text-gray-900">Tax: <span className="font-medium">{taxAmount.toFixed(2)}</span></div>
        <div className="text-sm text-gray-900">Cost adjustments: <span className="font-medium">{adjustmentsTotal.toFixed(2)}</span></div>
        {adjustmentsRows.length > 0 && (
          <div className="pl-3 space-y-0.5">
            {adjustmentsRows.map((a, idx) => {
              const label = a.type ? a.type.replace(/_/g, ' ') : 'adjustment';
              const signed = a.type?.toLowerCase() === 'discount' ? -Math.abs(a.amount || 0) : (a.amount || 0);
              return (
                <div key={idx} className="text-xs text-gray-600">
                  {label}: {signed.toFixed(2)}
                </div>
              );
            })}
          </div>
        )}
        <div className="text-sm text-gray-900">Shipping: <span className="font-medium">{shippingCost.toFixed(2)}</span></div>
        <div className="border-t border-gray-200 my-2" />
        <div className="text-sm text-gray-900">Total: <span className="font-medium">{total.toFixed(2)}</span></div>
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onCreatePurchaseOrder}
          disabled={!canCreate}
          className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {creatingPO ? 'Creating…' : 'Create purchase order'}
        </button>
      </div>
    </div>
  );
};

export default CostSummarySection;

