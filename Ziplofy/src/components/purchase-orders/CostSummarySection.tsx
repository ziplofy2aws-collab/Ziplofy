import React from 'react';
import {
  productFormCardClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { PO_FORM_APPEARANCE, poSecondaryButtonClass } from './purchase-order-ui.util';

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
  onCancel?: () => void;
  onCreatePurchaseOrder?: () => void;
  creatingPO?: boolean;
  canCreate?: boolean;
  showActions?: boolean;
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
  creatingPO = false,
  canCreate = false,
  showActions = true,
}) => {
  return (
    <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Cost summary</h2>
        <button type="button" onClick={onManageClick} className={poSecondaryButtonClass}>
          Manage
        </button>
      </div>

      <div className="space-y-2 text-[13px] text-gray-700">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Items</span>
          <span className="font-medium text-gray-900">{itemsCount}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Tax</span>
          <span className="font-medium text-gray-900">{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Cost adjustments</span>
          <span className="font-medium text-gray-900">{adjustmentsTotal.toFixed(2)}</span>
        </div>
        {adjustmentsRows.length > 0 ? (
          <div className="space-y-1 border-l border-gray-100 pl-3">
            {adjustmentsRows.map((row, idx) => {
              const label = row.type ? row.type.replace(/_/g, ' ') : 'adjustment';
              const signed =
                row.type?.toLowerCase() === 'discount' ? -Math.abs(row.amount || 0) : row.amount || 0;
              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-[12px] text-gray-500">
                  <span className="capitalize">{label}</span>
                  <span>{signed.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Shipping</span>
          <span className="font-medium text-gray-900">{shippingCost.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-gray-900">Total</span>
            <span className="text-[15px] font-semibold text-gray-900">{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showActions && onCancel && onCreatePurchaseOrder ? (
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={poSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreatePurchaseOrder}
            disabled={!canCreate}
            className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingPO ? 'Creating…' : 'Create purchase order'}
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default CostSummarySection;
