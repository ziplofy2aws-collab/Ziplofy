import React from 'react';

interface PurchaseOrderTableRowProps {
  purchaseOrder: {
    _id: string;
    supplierId: string | { name?: string; _id?: string };
    destinationLocationId: string | { name?: string; _id?: string };
    status: string;
    totalCost?: number;
    expectedArrivalDate?: string | Date;
  };
  onRowClick: (purchaseOrderId: string) => void;
}

const PurchaseOrderTableRow: React.FC<PurchaseOrderTableRowProps> = ({
  purchaseOrder,
  onRowClick,
}) => {
  const supplierName =
    typeof purchaseOrder.supplierId === 'string'
      ? purchaseOrder.supplierId
      : purchaseOrder.supplierId?.name || purchaseOrder.supplierId?._id;
  const destinationName =
    typeof purchaseOrder.destinationLocationId === 'string'
      ? purchaseOrder.destinationLocationId
      : purchaseOrder.destinationLocationId?.name || purchaseOrder.destinationLocationId?._id;

  const status = purchaseOrder.status.replaceAll('_', ' ');
  const isOrdered = purchaseOrder.status === 'ordered';
  const isReceived = purchaseOrder.status === 'received';

  return (
    <tr
      onClick={() => onRowClick(purchaseOrder._id)}
      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{purchaseOrder._id}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{supplierName}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{destinationName}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${
          isReceived ? 'bg-green-50 text-green-700 border-green-200/80' :
          isOrdered ? 'bg-blue-50 text-blue-700 border-blue-200/80' :
          'bg-gray-100 text-gray-600 border-gray-200/80'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
        {purchaseOrder.totalCost != null ? purchaseOrder.totalCost.toFixed(2) : '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {purchaseOrder.expectedArrivalDate
          ? new Date(purchaseOrder.expectedArrivalDate).toLocaleDateString()
          : '-'}
      </td>
    </tr>
  );
};

export default PurchaseOrderTableRow;

