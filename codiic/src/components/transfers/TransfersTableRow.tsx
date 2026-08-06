import React from 'react';
import TransferStatusBadge from './TransferStatusBadge';
import {
  formatTransferLabel,
  transferTableCellClass,
  transferTableCellRightClass,
} from './transfer-ui.util';

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

interface TransfersTableRowProps {
  transfer: TransferRow;
  isSelected: boolean;
  onSelect: (transferId: string, checked: boolean) => void;
  onRowClick: (transferId: string) => void;
}

const TransfersTableRow: React.FC<TransfersTableRowProps> = ({
  transfer,
  isSelected,
  onSelect,
  onRowClick,
}) => {
  return (
    <tr
      className={`group cursor-pointer border-b border-admin-divider transition-colors last:border-b-0 ${
        isSelected ? 'bg-admin-row-hover' : 'bg-admin-surface hover:bg-admin-row-hover'
      }`}
      onClick={() => onRowClick(transfer._id)}
    >
      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(transfer._id, e.target.checked)}
          aria-label={`Select transfer ${formatTransferLabel(transfer._id)}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
        />
      </td>
      <td className={`${transferTableCellClass} font-medium text-admin-text`}>
        {formatTransferLabel(transfer._id)}
      </td>
      <td className={transferTableCellClass}>{transfer.referenceName || '—'}</td>
      <td className={transferTableCellClass}>{transfer.originLocationId?.name || '—'}</td>
      <td className={transferTableCellClass}>{transfer.destinationLocationId?.name || '—'}</td>
      <td className={transferTableCellRightClass}>
        {transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : '—'}
      </td>
      <td className={transferTableCellClass}>
        {transfer.tags && transfer.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {transfer.tags.slice(0, 2).map((tag) => (
              <span
                key={tag._id}
                className="inline-flex items-center rounded-md bg-admin-secondary px-1.5 py-0.5 text-[11px] text-admin-text-secondary"
              >
                {tag.name}
              </span>
            ))}
            {transfer.tags.length > 2 ? (
              <span className="inline-flex items-center rounded-md bg-admin-secondary px-1.5 py-0.5 text-[11px] text-admin-text-subdued">
                +{transfer.tags.length - 2}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-[12px] text-admin-text-subdued">—</span>
        )}
      </td>
      <td className={transferTableCellClass}>
        <TransferStatusBadge status={transfer.status} />
      </td>
    </tr>
  );
};

export default TransfersTableRow;
