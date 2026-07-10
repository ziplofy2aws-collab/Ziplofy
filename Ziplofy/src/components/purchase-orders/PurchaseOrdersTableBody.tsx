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
  onRowClick: (purchaseOrderId: string) => void;
}

const PurchaseOrdersTableBody: React.FC<PurchaseOrdersTableBodyProps> = ({
  purchaseOrders,
  onRowClick,
}) => {
  return (
    <tbody className="bg-white divide-y divide-gray-100">
      {purchaseOrders.map((po) => (
        <PurchaseOrderTableRow
          key={po._id}
          purchaseOrder={po}
          onRowClick={onRowClick}
        />
      ))}
      {purchaseOrders.length === 0 && (
        <tr>
          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
            No purchase orders
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default PurchaseOrdersTableBody;

