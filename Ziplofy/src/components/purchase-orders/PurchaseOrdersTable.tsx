import React from 'react';
import PurchaseOrdersTableBody from './PurchaseOrdersTableBody';

interface PurchaseOrder {
  _id: string;
  supplierId: string | { name?: string; _id?: string };
  destinationLocationId: string | { name?: string; _id?: string };
  status: string;
  totalCost?: number;
  expectedArrivalDate?: string | Date;
}

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  onRowClick: (purchaseOrderId: string) => void;
}

const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  purchaseOrders,
  onRowClick,
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-gray-50/80">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            PO ID
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Supplier
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Destination
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Status
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
            Total
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Expected Arrival
          </th>
        </tr>
      </thead>
      <PurchaseOrdersTableBody purchaseOrders={purchaseOrders} onRowClick={onRowClick} />
    </table>
  );
};

export default PurchaseOrdersTable;

