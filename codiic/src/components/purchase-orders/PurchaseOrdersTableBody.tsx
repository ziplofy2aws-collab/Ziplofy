import React from 'react';
import PurchaseOrderTableRow from './PurchaseOrderTableRow';

interface PurchaseOrder {
  _id: string;
  supplierId: string | { name?: string; _id?: string };
  destinationLocationId: string | { name?: string; _id?: string };
  status: string;
  totalCost?: number;
  expectedArrivalDate?: string | Date;
}

interface PurchaseOrdersTableBodyProps {
  purchaseOrders: PurchaseOrder[];
  selectedIds: Set<string>;
  onSelectRow: (purchaseOrderId: string, checked: boolean) => void;
  onRowClick: (purchaseOrderId: string) => void;
}

const PurchaseOrdersTableBody: React.FC<PurchaseOrdersTableBodyProps> = ({
  purchaseOrders,
  selectedIds,
  onSelectRow,
  onRowClick,
}) => {
  return (
    <tbody className="bg-admin-surface">
      {purchaseOrders.length === 0 ? (
        <tr>
          <td colSpan={7} className="px-3 py-16 text-center">
            <p className="text-[15px] font-semibold text-admin-text">No purchase orders found</p>
            <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
              Try changing the filters or search term
            </p>
          </td>
        </tr>
      ) : (
        purchaseOrders.map((po) => (
          <PurchaseOrderTableRow
            key={po._id}
            purchaseOrder={po}
            isSelected={selectedIds.has(po._id)}
            onSelect={onSelectRow}
            onRowClick={onRowClick}
          />
        ))
      )}
    </tbody>
  );
};

export default PurchaseOrdersTableBody;
