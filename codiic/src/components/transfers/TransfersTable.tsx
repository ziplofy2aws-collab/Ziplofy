import React, { useEffect, useMemo, useRef, useState } from 'react';
import TransfersTableBody from './TransfersTableBody';
import { transferTableHeadClass, transferTableHeadRightClass } from './transfer-ui.util';

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

interface TransfersTableProps {
  transfers: TransferRow[];
  onRowClick: (transferId: string) => void;
}

const TransfersTable: React.FC<TransfersTableProps> = ({ transfers, onRowClick }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const visibleIds = useMemo(() => transfers.map((transfer) => transfer._id), [transfers]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = (transferId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(transferId);
      else next.delete(transferId);
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="w-10 px-3 py-2.5 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all transfers"
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
              />
            </th>
            <th className={transferTableHeadClass}>Transfer</th>
            <th className={transferTableHeadClass}>Reference</th>
            <th className={transferTableHeadClass}>Origin</th>
            <th className={transferTableHeadClass}>Destination</th>
            <th className={transferTableHeadRightClass}>Transfer date</th>
            <th className={transferTableHeadClass}>Tags</th>
            <th className={transferTableHeadClass}>Status</th>
          </tr>
        </thead>
        <TransfersTableBody
          transfers={transfers}
          selectedIds={selectedIds}
          onSelectRow={handleSelectRow}
          onRowClick={onRowClick}
        />
      </table>
    </div>
  );
};

export default TransfersTable;
