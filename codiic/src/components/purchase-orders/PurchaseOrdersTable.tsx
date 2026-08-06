import React, { useEffect, useMemo, useRef, useState } from 'react';
import PurchaseOrdersTableBody from './PurchaseOrdersTableBody';
import { poTableHeadClass, poTableHeadRightClass } from './purchase-order-ui.util';

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const visibleIds = useMemo(() => purchaseOrders.map((po) => po._id), [purchaseOrders]);
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

  const handleSelectRow = (purchaseOrderId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(purchaseOrderId);
      else next.delete(purchaseOrderId);
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
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-admin-border bg-admin-table-header">
            <th className="w-10 px-3 py-2 text-center align-middle">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all purchase orders"
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
              />
            </th>
            <th className={poTableHeadClass}>Purchase order</th>
            <th className={poTableHeadClass}>Supplier</th>
            <th className={poTableHeadClass}>Destination</th>
            <th className={poTableHeadClass}>Status</th>
            <th className={poTableHeadRightClass}>Total</th>
            <th className={poTableHeadRightClass}>Expected arrival</th>
          </tr>
        </thead>
        <PurchaseOrdersTableBody
          purchaseOrders={purchaseOrders}
          selectedIds={selectedIds}
          onSelectRow={handleSelectRow}
          onRowClick={onRowClick}
        />
      </table>
    </div>
  );
};

export default PurchaseOrdersTable;
