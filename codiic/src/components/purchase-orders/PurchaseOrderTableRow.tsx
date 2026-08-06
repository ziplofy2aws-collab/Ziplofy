import React from 'react';
import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';
import {
  formatPurchaseOrderLabel,
  poTableCellClass,
  poTableCellRightClass,
} from './purchase-order-ui.util';

interface PurchaseOrderTableRowProps {
  purchaseOrder: {
    _id: string;
    supplierId: string | { name?: string; _id?: string };
    destinationLocationId: string | { name?: string; _id?: string };
    status: string;
    totalCost?: number;
    expectedArrivalDate?: string | Date;
  };
  isSelected: boolean;
  onSelect: (purchaseOrderId: string, checked: boolean) => void;
  onRowClick: (purchaseOrderId: string) => void;
}

const PurchaseOrderTableRow: React.FC<PurchaseOrderTableRowProps> = ({
  purchaseOrder,
  isSelected,
  onSelect,
  onRowClick,
}) => {
  const supplierName =
    typeof purchaseOrder.supplierId === 'string'
      ? purchaseOrder.supplierId
      : purchaseOrder.supplierId?.name || '—';
  const destinationName =
    typeof purchaseOrder.destinationLocationId === 'string'
      ? purchaseOrder.destinationLocationId
      : purchaseOrder.destinationLocationId?.name || '—';

  return (
    <tr
      className={`group cursor-pointer border-b border-admin-divider transition-colors last:border-b-0 ${
        isSelected ? 'bg-admin-row-hover' : 'bg-admin-surface hover:bg-admin-row-hover'
      }`}
      onClick={() => onRowClick(purchaseOrder._id)}
    >
      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(purchaseOrder._id, e.target.checked)}
          aria-label={`Select purchase order ${formatPurchaseOrderLabel(purchaseOrder._id)}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
        />
      </td>
      <td className={`${poTableCellClass} font-medium text-admin-text`}>
        {formatPurchaseOrderLabel(purchaseOrder._id)}
      </td>
      <td className={poTableCellClass}>{supplierName}</td>
      <td className={poTableCellClass}>{destinationName}</td>
      <td className={poTableCellClass}>
        <PurchaseOrderStatusBadge status={purchaseOrder.status} />
      </td>
      <td className={poTableCellRightClass}>
        {purchaseOrder.totalCost != null ? purchaseOrder.totalCost.toFixed(2) : '—'}
      </td>
      <td className={poTableCellRightClass}>
        {purchaseOrder.expectedArrivalDate
          ? new Date(purchaseOrder.expectedArrivalDate).toLocaleDateString()
          : '—'}
      </td>
    </tr>
  );
};

export default PurchaseOrderTableRow;
