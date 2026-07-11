import React from 'react';
import TransfersTableRow from './TransfersTableRow';

interface TransferRow {
  _id: string;
  referenceName?: string;
  originLocationId?: { name?: string };
  destinationLocationId?: { name?: string };
  transferDate?: string;
  tags?: Array<{ _id: string; name: string }>;
  status: string;
  createdAt: string;
}

interface TransfersTableBodyProps {
  transfers: TransferRow[];
  selectedIds: Set<string>;
  onSelectRow: (transferId: string, checked: boolean) => void;
  onRowClick: (transferId: string) => void;
}

const TransfersTableBody: React.FC<TransfersTableBodyProps> = ({
  transfers,
  selectedIds,
  onSelectRow,
  onRowClick,
}) => {
  return (
    <tbody className="bg-white">
      {transfers.length === 0 ? (
        <tr>
          <td colSpan={8} className="px-3 py-16 text-center">
            <p className="text-[15px] font-semibold text-gray-900">No transfers found</p>
            <p className="mt-1.5 text-[13px] font-normal text-gray-500">
              Try changing the filters or search term
            </p>
          </td>
        </tr>
      ) : (
        transfers.map((transfer) => (
          <TransfersTableRow
            key={transfer._id}
            transfer={transfer}
            isSelected={selectedIds.has(transfer._id)}
            onSelect={onSelectRow}
            onRowClick={onRowClick}
          />
        ))
      )}
    </tbody>
  );
};

export default TransfersTableBody;
